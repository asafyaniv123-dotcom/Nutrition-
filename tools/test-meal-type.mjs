/* Which meal did this go under?
 *
 *   node tools/test-meal-type.mjs [file]
 *
 * Two questions that must not be confused, which is why they are two
 * functions. What the FOOD is can be read off the food - a coffee is a drink
 * at any hour. What MEAL it was can only be read off the clock, and nothing
 * about a plate of rice says lunch rather than dinner.
 *
 * The clock half is the one worth guarding, for a reason particular to this
 * app: appNow() is shifted back four hours because the DAY here ends at 04:00,
 * so its getHours would call half past midnight "eight in the evening". "Which
 * meal is it" is a question about the wall, not about the day, so it reads the
 * real clock - and the boundaries are asserted to the minute on both sides,
 * because an off-by-one there is invisible and files food under the wrong meal
 * for half an hour twice a day.
 */
import fs from 'fs';
import vm from 'vm';

const FILE = process.argv[2] || 'dev/index.html';
const src = fs.readFileSync(FILE, 'utf8');
const lift = (a, b) => {
  const i = src.indexOf(a), j = src.indexOf(b, i);
  if (i < 0 || j < 0) throw new Error('could not lift ' + a);
  return src.slice(i, j);
};

const ctx = vm.createContext({ console });
vm.runInContext(lift('function mealByClock(){', 'var _sayCat'), ctx);

let bad = 0;
const check = (what, ok, detail) => { if (!ok) bad++; console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + what + (detail ? '   ' + detail : '')); };

/* a fixed Date, so the answer does not depend on when the suite is run */
const at = (h, m) => {
  ctx.Date = function () { return new Date(2026, 8, 16, h, m, 0); };
  ctx.Date.now = Date.now;
  return vm.runInContext('mealByClock()', ctx);
};

console.log('\n  the bands, asserted on BOTH sides of every edge\n');
const EDGES = [
  [4, 59, 'snack'], [5, 0, 'breakfast'],
  [11, 29, 'breakfast'], [11, 30, 'lunch'],
  [15, 59, 'lunch'], [16, 0, 'snack'],
  [19, 29, 'snack'], [19, 30, 'dinner'],
  [22, 59, 'dinner'], [23, 0, 'snack'],
  [2, 0, 'snack'], [8, 15, 'breakfast'], [13, 0, 'lunch'], [21, 0, 'dinner'],
];
for (const [h, m, want] of EDGES) {
  const got = at(h, m);
  check(String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ' is ' + want.padEnd(10),
    got === want, got === want ? '' : 'got ' + got);
}

/* the content override, and the limit on it */
vm.runInContext(lift('function mealCat(fromFood){', 'var _sayCat'), ctx);
ctx.Date = function () { return new Date(2026, 8, 16, 13, 0, 0); };  // lunchtime
console.log('\n  what the food is allowed to say, at 13:00\n');
const cat = (v) => vm.runInContext('mealCat(' + JSON.stringify(v) + ')', ctx);
check('a drink is drinks whatever the hour   ', cat('drink') === 'drinks', cat('drink'));
check('a snack is a snack whatever the hour  ', cat('snack') === 'snack', cat('snack'));
check('a plate falls through to the clock    ', cat('unspecified') === 'lunch', cat('unspecified'));
check('and a smuggled "dinner" is IGNORED    ', cat('dinner') === 'lunch',
  'the model cannot see a clock; only drink and snack are its to answer');
check('so is an empty answer                 ', cat('') === 'lunch');

console.log(bad ? '\n' + bad + ' FAILED' : '\nthe food says what it is, the clock says which meal');
process.exit(bad ? 1 : 0);
