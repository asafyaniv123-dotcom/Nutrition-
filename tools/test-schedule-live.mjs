/* Does the live /schedule turn real sentences into the right entries?
 * Today is pinned to Sunday 2026-10-18, so every expected date is fixed.
 *
 *   node tools/test-schedule-live.mjs
 *   node tools/test-schedule-live.mjs https://some-other-host
 */
const HOST = process.argv[2] || 'https://nutrition-push.nutrition-push.workers.dev';
const CTX = { today: '2026-10-18', now: '12:00' };

// each expected entry: the fields that must match (days compared as a joined list)
const CASES = [
  ['he', 'בכל יום רביעי תכניס בשעה 9 עד השעה 10 זמן מדיטציה', [{ repeat: 'weekly', days: '3', start: '09:00', end: '10:00' }]],
  ['he', 'כל בוקר ב7 ריצה', [{ repeat: 'daily', start: '07:00' }]],
  ['he', 'מחר בחמש להתקשר לאמא', [{ repeat: 'none', date: '2026-10-19', start: '17:00' }]],
  ['he', 'כל ראשון ושלישי בשמונה בערב חוג יוגה עד תשע וחצי', [{ repeat: 'weekly', days: '0,2', start: '20:00', end: '21:30' }]],
  ['he', 'ביום חמישי הקרוב פגישה עם רואה החשבון ב-11, וכל שישי בצהריים ארוחה משפחתית', [
    { repeat: 'none', date: '2026-10-22', start: '11:00' }, { repeat: 'weekly', days: '5' }]],
  ['he', 'לקנות מתנה לדנה', [{ repeat: 'none', start: '' }]],
  ['he', 'מה שלומך?', []],
  ['en', 'Every Wednesday from 9 to 10, meditation', [{ repeat: 'weekly', days: '3', start: '09:00', end: '10:00' }]],
  ['en', 'Dentist next Monday at 3:30pm', [{ repeat: 'none', date: '2026-10-19', start: '15:30' }]],
  ['en', 'Gym on Mondays, Wednesdays and Fridays 6-7am', [{ repeat: 'weekly', days: '1,3,5', start: '06:00', end: '07:00' }]],
];

let bad = 0; const ms = [];
for (const [lang, q, want] of CASES) {
  const t0 = Date.now();
  let items;
  try {
    const r = await fetch(HOST + '/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ q, lang }, CTX)) });
    const j = await r.json();
    items = j.ok ? j.items : null;
    if (!items) items = [{ error: r.status + ' ' + JSON.stringify(j).slice(0, 160) }];
  } catch (e) { items = [{ error: e.message }]; }
  ms.push(Date.now() - t0);
  let miss = items.length !== want.length ? ['count ' + items.length + '/' + want.length] : [];
  want.forEach((w, i) => {
    const g = items[i] || {};
    for (const k of Object.keys(w)) {
      const gv = k === 'days' ? (g.days || []).join(',') : g[k];
      if (gv !== w[k]) miss.push(i + '.' + k);
    }
  });
  if (miss.length) bad++;
  console.log((miss.length ? 'FAIL ' : 'ok   ') + (Date.now() - t0 + 'ms').padStart(7) + '  ' + q);
  console.log('        -> ' + JSON.stringify(items) + (miss.length ? '   wrong: ' + miss.join(', ') : ''));
}
ms.sort((a, b) => a - b);
console.log('\n' + (CASES.length - bad) + '/' + CASES.length + ' right; median ' + ms[ms.length >> 1] + 'ms, slowest ' + ms[ms.length - 1] + 'ms');
process.exit(bad ? 1 : 0);
