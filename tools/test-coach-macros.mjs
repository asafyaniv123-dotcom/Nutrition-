/* The coach's reply is sent back once when an item's macros do not account
 * for its calories. These are the cases that decide whether that check would
 * have caught her cottage, and whether it bothers anyone it should not.
 *
 *   node tools/test-coach-macros.mjs
 */
import { coachMacrosShort } from '../push-server/src/worker.js';

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const it = (name, calories, protein, carbs, fat) => ({ name, calories, protein, carbs, fat });

ok(coachMacrosShort([it('קוטג׳ 5%', 119, 0, 0, 6.3)]).length === 1, 'HER CASE: half a tub, calories and fat, no protein - caught');
ok(coachMacrosShort([it('קוטג׳ 5%', 119, 13.8, 0, 6.3)]).length === 0, 'the same half tub with its protein passes');
ok(coachMacrosShort([it('ביצה', 180, 12.6, 1, 14), it('לחם', 160, 7, 28, 2), it('סלט', 60, 1.5, 8, 3)]).length === 0, 'an ordinary breakfast passes');
ok(coachMacrosShort([it('עוף', 250, 0, 0, 0)]).length === 1, 'calories with nothing under them - caught');
ok(coachMacrosShort([it('קפה שחור', 5, 0, 0, 0)]).length === 0, 'a black coffee is honestly almost nothing');
ok(coachMacrosShort([it('שקשוקה', 320, 18, 14, 21), it('קוטג׳', 119, 0, 0, 6.3)]).join() === 'קוטג׳', 'names only the item that fails');
ok(coachMacrosShort([it('יין אדום', 125, 0, 4, 0)]).length === 1, 'wine is flagged too - one extra call, and its answer then stands');
ok(coachMacrosShort(null).length === 0, 'no items is nothing to check');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('a reply whose numbers do not add up is sent back before it reaches her log');
