/* Does the live /route split a sentence that holds several things?
 * Today is pinned to Monday 2026-10-19. Each case lists the items it must
 * come back as, in order; a field given as an array accepts any of them.
 *
 *   node tools/test-route-multi-live.mjs
 */
const HOST = process.argv[2] || 'https://nutrition-push.nutrition-push.workers.dev';
const CTX = { today: '2026-10-19', now: '12:00', book: '', people: ['דנה', 'Yossi'] };
const CASES = [
  ['he', 'תוסיף ביום שני בשעה ארבע אחר הצהריים טיפול בראשון לציון וגם אכלתי עכשיו בננה',
    [{ intent: 'task', date: ['2026-10-19', '2026-10-26'], time: '16:00' }, { intent: 'food', text: 'בננה' }]],
  ['he', 'שתיתי שתי כוסות מים והלכתי היום 6000 צעדים', [{ intent: 'water', amount: 500 }, { intent: 'steps', amount: 6000 }]],
  ['he', 'דנה סיפרה שהיא מתחילה עבודה חדשה, ותזכיר לי לקנות לה מתנה ביום חמישי',
    [{ intent: 'person_note', person: 'דנה' }, { intent: 'task', date: '2026-10-22' }]],
  ['en', 'Had oatmeal for breakfast, and remind me to call Yossi tomorrow at 10', [{ intent: 'food' }, { intent: 'task', date: '2026-10-20', time: '10:00' }]],
  ['he', 'אכלתי בננה', [{ intent: 'food' }]],
];
let bad = 0;
for (const [lang, q, want] of CASES) {
  const t0 = Date.now();
  const r = await fetch(HOST + '/route', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ q, lang }, CTX)) });
  const j = await r.json(), got = j.routes || [];
  const miss = [];
  if (got.length !== want.length) miss.push('count ' + got.length + '/' + want.length);
  want.forEach((w, i) => {
    const g = got[i] || {};
    for (const k of Object.keys(w)) {
      const ok = k === 'text' ? String(g.text || '').includes(w.text) : Array.isArray(w[k]) ? w[k].includes(g[k]) : g[k] === w[k];
      if (!ok) miss.push(i + '.' + k);
    }
  });
  if (!j.route || j.route.intent !== (got[0] || {}).intent) miss.push('route != routes[0]');
  if (miss.length) bad++;
  console.log((miss.length ? 'FAIL ' : 'ok   ') + (Date.now() - t0 + 'ms').padStart(7) + '  ' + q);
  for (const g of got) console.log('        -> ' + g.intent + ' | ' + g.text + (g.date ? ' | ' + g.date : '') + (g.time ? ' ' + g.time : '') + (g.amount ? ' | ' + g.amount : '') + (g.person ? ' | ' + g.person : ''));
  if (miss.length) console.log('        wrong: ' + miss.join(', '));
}
console.log('\n' + (CASES.length - bad) + '/' + CASES.length + ' split right');
process.exit(bad ? 1 : 0);
