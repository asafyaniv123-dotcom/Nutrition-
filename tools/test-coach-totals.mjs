/* What one logged item comes to: the model gives one portion and a count,
 * the worker multiplies. These are the cases that decide whether her sushi
 * ("twice what's in the picture") comes out right, and whether an old-style
 * reply - totals and no portions - still means what it always meant.
 *
 *   node tools/test-coach-totals.mjs
 */
import { coachTotals } from '../push-server/src/worker.js';

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };

let r = coachTotals({ calories: 300, protein: 10, carbs: 50, fat: 6, unit_count: 7, kcal_per_unit: 50,
  protein_per_unit: 1.5, carbs_per_unit: 7, fat_per_unit: 1.8, portions: 2 });
ok(r.calories === 700 && r.protein === 21 && r.carbs === 98 && r.fat === 25.2, 'HER CASE: 7 pieces x 50 kcal, twice = 14 pieces, 700 kcal - per-piece figures win over the totals');
r = coachTotals({ calories: 170, protein: 0, carbs: 42, fat: 0, portions: 1 });
ok(r.calories === 170 && r.carbs === 42, 'the teriyaki, one dish: as given');
ok(coachTotals({ calories: 119, protein: 13.8, carbs: 4, fat: 6.3 }).calories === 119, 'no portions at all is one portion - every reply before this change still means the same');
r = coachTotals({ calories: 400, protein: 30, carbs: 20, fat: 20, portions: 0.5 });
ok(r.calories === 200 && r.protein === 15, '"only half" is half');
ok(coachTotals({ calories: 100, portions: -3 }).calories === 100 && coachTotals({ calories: 100, portions: 'x' }).calories === 100, 'a portion count that is not a positive number is one');
ok(coachTotals({ calories: 100, portions: 500 }).calories === 100, 'an absurd portion count is not believed');
ok(coachTotals({ calories: 200, protein: 10, unit_count: 6 }).calories === 200, 'a count with no per-piece figure falls back to the totals');
ok(coachTotals({ calories: 200, kcal_per_unit: 40 }).calories === 200, 'a per-piece figure with no count falls back to the totals');
ok(coachTotals({ calories: -50, protein: 'a' }).calories === 0 && coachTotals({}).protein === 0, 'nonsense is zero, not NaN');
r = coachTotals({ unit_count: 3, kcal_per_unit: 33.3, protein_per_unit: 1.11, portions: 1 });
ok(r.calories === 100 && r.protein === 3.3, 'rounded once, at the end');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('the model counts; the worker multiplies');
