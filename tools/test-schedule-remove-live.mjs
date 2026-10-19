/* Her case, against the live /schedule: a span that ends, and removals -
 * including the exact sentence she wrote, which names nothing ("remove IT
 * from the 25th to the 31st"). Today is pinned to Monday 2026-10-19, and the
 * board is the one she had: reserve duty written every day for half a year.
 *
 *   node tools/test-schedule-remove-live.mjs
 */
const HOST = process.argv[2] || 'https://nutrition-push.nutrition-push.workers.dev';
const BOARD = [
  { text: 'מילואים', from: '2026-10-19', to: '2027-04-19', n: 183 },
  { text: 'אימון', from: '2026-10-18', to: '2026-10-20', n: 4 },
  { text: 'עין יהב', from: '2026-10-09', to: '2026-10-10', n: 2 },
  { text: 'טיסה לגרמניה', from: '2026-10-28', to: '2026-10-28', n: 1 },
];
const CTX = { today: '2026-10-19', now: '13:30', board: BOARD, last: ['מילואים'] };
const CASES = [
  ['he', 'מילואים עד ה24 לחודש', [{ action: 'add', repeat: 'daily', until: '2026-10-24' }]],
  ['he', 'חופשה מה3 עד ה8 בנובמבר', [{ action: 'add', repeat: 'daily', date: '2026-11-03', until: '2026-11-08' }]],
  ['he', 'הוספת לי עד ה31 לחודש. תוריד את זה מה25 עד ה31. לא צריך את זה',
    [{ action: 'remove', text: 'מילואים', date: '2026-10-25', until: ['2026-10-31', ''] }]],
  ['he', 'המילואים רק עד ה24, תוריד את כל השאר', [{ action: 'remove', text: 'מילואים', date: '2026-10-25', until: '' }]],
  ['he', 'תבטל את הטיסה לגרמניה', [{ action: 'remove', text: 'טיסה לגרמניה', date: '2026-10-28', repeat: 'none' }]],
  ['en', 'Remove reserve duty from the 25th onwards', [{ action: 'remove', text: 'מילואים', date: '2026-10-25', until: '' }]],
  ['he', 'כל רביעי 9-10 מדיטציה', [{ action: 'add', repeat: 'weekly', until: '' }]],
];
let bad = 0;
for (const [lang, q, want] of CASES) {
  const t0 = Date.now();
  const r = await fetch(HOST + '/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ q, lang }, CTX)) });
  const j = await r.json(), got = j.items || [];
  const miss = got.length !== want.length ? ['count ' + got.length + '/' + want.length] : [];
  want.forEach((w, i) => {
    const g = got[i] || {};
    for (const k of Object.keys(w)) if (!(Array.isArray(w[k]) ? w[k].includes(g[k]) : g[k] === w[k])) miss.push(i + '.' + k);
  });
  if (miss.length) bad++;
  console.log((miss.length ? 'FAIL ' : 'ok   ') + (Date.now() - t0 + 'ms').padStart(7) + '  ' + q);
  console.log('        -> ' + JSON.stringify(got.length ? got : j) + (miss.length ? '   wrong: ' + miss.join(', ') : ''));
}
console.log('\n' + (CASES.length - bad) + '/' + CASES.length + ' right');
process.exit(bad ? 1 : 0);
