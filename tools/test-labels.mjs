/* A nutrition label, worked out in code. The case it is named for: a bag of
 * Protein Maxx Chips, 72 g, two columns - per 100 g 449 kcal / 28 g protein,
 * per bag 323 / 20 - and "I ate half". Logged as 225 kcal (per-100 g halved)
 * with 10 g protein (per-bag halved). Right: 162 kcal, 10 g.
 *
 *   node tools/test-labels.mjs
 */
import { labelClean, labelCompute, labelItem } from '../push-server/src/worker.js';

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const CHIPS = { per_100g: { kcal: 449, protein: 28, carbs: 44, fat: 18 }, per_package: { kcal: 323, protein: 20, carbs: 32, fat: 13 }, package_weight_g: 72 };
const C = (o) => labelCompute(labelClean(Object.assign({}, CHIPS, o)));

let r = C({ portion_fraction: 0.5 });
ok(r.kcal === 162 && r.p === 10 && r.column === 'per_package' && !r.mismatch, 'HER CASE: half the bag = 162 kcal, 10 g protein, from the package column only');
r = C({ portion_fraction: 1 });
ok(r.kcal === 323 && r.p === 20, 'the whole bag: the package column as printed');
r = labelCompute(labelClean({ per_100g: CHIPS.per_100g, portion_g: 30 }));
ok(r.kcal === 135 && r.p === 8.4 && r.column === 'per_100g', 'per 100 g only, "I ate 30 grams": 135 kcal, 8.4 g protein');
r = labelCompute(labelClean({ per_100g: CHIPS.per_100g, package_weight_g: 72, portion_fraction: 0.5 }));
ok(r.kcal === 162 && r.column === 'per_100g', 'half, with only the per-100 g column and the weight: worked from the weight');
r = C({ portion_g: 36 });
ok(r.kcal === 162 && r.column === 'per_100g', 'in grams with both columns: per 100 g');
r = C({ per_package: { kcal: 449, protein: 28, carbs: 44, fat: 18 }, portion_fraction: 0.5 });
ok(r.mismatch && r.mismatch.expected === 323 && r.mismatch.printed === 449, 'columns that disagree (the per-100 g figures read as the bag) are caught');
ok(labelItem({ label: Object.assign({}, CHIPS, { per_package: { kcal: 449, protein: 28 }, portion_fraction: 0.5 }) }).label_mismatch === true, 'and such an item is not logged');
let it = labelItem({ calories: 225, protein: 10, label: Object.assign({}, CHIPS, { portion_fraction: 0.5 }) });
ok(it.calories === 162 && it.protein === 10 && it.label.per_100g.kcal === 449, 'the model\'s own 225 is replaced by the code\'s 162, and the label is kept with the item');
r = C({});
ok(r.kcal === null, 'no portion given: nothing is guessed');
ok(labelClean({ per_100g: { protein: 5 } }) === null && labelClean(null) === null, 'a label with no calories is no label');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('one column per item, and the arithmetic is the code\'s');
