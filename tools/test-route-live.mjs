/* Does the live /route send real sentences where they belong?
 * Each case is a sentence a person would type into the home bar and the
 * intent it must come back as. Invented people and an invented book only;
 * nothing from anyone's data.
 *
 *   node tools/test-route-live.mjs
 *   node tools/test-route-live.mjs https://some-other-host
 */
const HOST = process.argv[2] || 'https://nutrition-push.nutrition-push.workers.dev';
const CTX = { today: '2026-10-17', now: '18:30', book: 'הנסיך הקטן', people: ['דנה', 'Yossi', 'אמא'] };

const CASES = [
  ['he', 'אכלתי עכשיו תה', { intent: 'food' }],
  ['he', 'שתיתי כוס מים', { intent: 'water', amount: 250 }],
  ['he', 'תוסיף את המשפט "רק בלב רואים היטב" לספר שאני קורא', { intent: 'quote', text: 'רק בלב רואים היטב' }],
  ['he', 'להתקשר לדנה מחר בחמש', { intent: 'task', date: '2026-10-18', time: '17:00' }],
  ['he', 'דנה סיפרה שהיא מתחילה עבודה חדשה', { intent: 'person_note', person: 'דנה' }],
  ['he', 'הבן שלי צחק היום מהחתול שנפל מהספה, אני רוצה לזכור את זה', { intent: 'moment' }],
  ['he', 'הלכתי היום 9000 צעדים', { intent: 'steps', amount: 9000 }],
  ['he', 'היעד שלי: לקרוא 20 דקות כל ערב', { intent: 'goal' }],
  ['he', 'תפתח את האנשים שלי', { intent: 'open', area: 'people' }],
  ['he', 'לקנות חלב ביום ראשון', { intent: 'task', date: '2026-10-18' }],
  ['he', 'כחול', { intent: 'unknown' }],
  ['en', 'I just had a coffee and a croissant', { intent: 'food' }],
  ['en', 'Remind me to call Yossi on Tuesday at 9am', { intent: 'task', date: '2026-10-20', time: '09:00' }],
  ['en', 'Mom said she loves the new garden', { intent: 'person_note', person: 'אמא' }],
  ['en', 'Write in my journal: today was long but good', { intent: 'journal' }],
  ['en', 'Save this line from my book: what is essential is invisible to the eye', { intent: 'quote' }],
];

let bad = 0, ms = [];
for (const [lang, q, want] of CASES) {
  const t0 = Date.now();
  let got;
  try {
    const r = await fetch(HOST + '/route', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ q, lang }, CTX)) });
    const j = await r.json();
    got = j.route || { intent: 'ERROR ' + r.status + ' ' + JSON.stringify(j).slice(0, 160) };
  } catch (e) { got = { intent: 'ERROR ' + e.message }; }
  ms.push(Date.now() - t0);
  const miss = Object.keys(want).filter(k => k === 'text' ? !String(got.text || '').includes(want.text) : got[k] !== want[k]);
  if (miss.length) bad++;
  console.log((miss.length ? 'FAIL ' : 'ok   ') + (Date.now() - t0 + 'ms').padStart(7) + '  ' + q);
  console.log('        -> ' + JSON.stringify(got) + (miss.length ? '   wrong: ' + miss.join(',') : ''));
}
ms.sort((a, b) => a - b);
console.log('\n' + (CASES.length - bad) + '/' + CASES.length + ' routed right; median ' + ms[ms.length >> 1] + 'ms, slowest ' + ms[ms.length - 1] + 'ms');
process.exit(bad ? 1 : 0);
