// The streak rules Asaf set on 18.10, asserted: a day counts only for a
// finished day summary, a single miss is carried by a grace day, a second
// miss in a row resets, the grace returns after seven summaries in a row.
//
//     node tools/test-beem-streak.mjs [path/to/beem-streak.js]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const file = process.argv[2] || new URL('../dev/look/beem-streak.js', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const { streakState } = require(file);

const D = n => Array(n).fill('done'), M = 'miss';
const cases = [
  ['nothing yet',                          [],                               {count: 0, grace: 1}],
  ['five summaries',                       D(5),                             {count: 5, grace: 1}],
  ['a miss before any streak costs nothing', [M, M, ...D(2)],                {count: 2, grace: 1}],
  ['one miss is carried by the grace',     [...D(3), M, 'done'],             {count: 4, grace: 0, refillIn: 6}],
  ['the miss that just ended is graced',   [...D(3), M],                     {count: 3, grace: 0, graceYesterday: true}],
  ['two misses in a row reset',            [...D(3), M, M],                  {count: 0, grace: 1, brokeYesterday: true}],
  ['a second miss without grace resets',   [...D(3), M, ...D(2), M],         {count: 0, grace: 1}],
  ['grace returns after seven in a row',   [...D(3), M, ...D(7)],            {count: 10, grace: 1, refillIn: 0}],
  ['six is not yet seven',                 [...D(3), M, ...D(6)],            {count: 9, grace: 0, refillIn: 1}],
  ['best survives a reset',                [...D(8), M, M, ...D(2)],         {count: 2, best: 8}],
];
/* The app carries its own copy, streakOf in dev/index.html (the app may not
   load Beem's files raw - their names collide with its own). Two copies of a
   rule drift, so the same cases are run against the one the app ships,
   lifted out of the file. */
import fs from 'node:fs';
const app = fs.readFileSync(new URL('../dev/index.html', import.meta.url), 'utf8');
const from = app.indexOf('var STREAK_GRACE_REFILL='), to = app.indexOf('\nfunction sumDone(');
if (from < 0 || to < from) { console.log('FAIL streakOf not found in dev/index.html'); process.exit(1); }
const streakOf = new Function(app.slice(from, to) + '\nreturn streakOf;')();

let bad = 0;
for (const [who, fn] of [['beem', streakState], ['app ', streakOf]])
for (const [name, days, want] of cases) {
  const got = fn(days);
  const wrong = Object.keys(want).filter(k => got[k] !== want[k]);
  if (wrong.length) { bad++; console.log('FAIL', who, name, wrong.map(k => k + ' ' + got[k] + ' != ' + want[k]).join(', ')); }
  else console.log('ok  ', who, name);
}
console.log(bad ? bad + ' failed' : 'all ' + cases.length + ' pass, in both copies');
process.exit(bad ? 1 : 0);
