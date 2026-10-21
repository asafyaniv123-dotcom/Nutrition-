/* The activity bonus, worked out in code.
 *
 *   node tools/test-activity.mjs
 */
import { activityBonus, actCtxClean } from '../push-server/src/worker.js';

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const J = (x) => JSON.stringify(x);
const A = (o) => activityBonus(Object.assign({ steps: 0, base: 8000, kg: 69, strength: false, cardio_min: 0 }, o));

// the bonus
ok(A({ steps: 14000 }).kcal === 186, '14,000 steps on an 8,000 baseline at 69 kg: 6,000 x 69 x 0.00045 = +186');
ok(A({ steps: 17000 }).kcal === 279, 'updated to 17,000: +279, not 186 + 279 - the latest number, never added');
ok(A({ steps: 14000, kg: 90 }).kcal === 243, 'a heavier body spends more on the same steps: 90 kg is +243');
ok(A({ steps: 14000, kg: 0 }).kcal === 189, 'no weight known: 70 kg, +189');
ok(A({ steps: 6000 }).kcal === 0, 'under the baseline: nothing');
ok(A({ steps: 14000, base: 10000 }).kcal === 124, 'the baseline is hers: 14,000 on 10,000 is +124');
ok(A({ strength: true }).kcal === 200, 'strength training: +200');
ok(A({ cardio_min: 60 }).kcal === 300 && A({ cardio_min: 30 }).kcal === 150, 'an hour of dance or sport: +300; half an hour +150');
ok(A({ steps: 30000, strength: true, cardio_min: 120 }).kcal === 800 && A({ steps: 30000, strength: true }).capped, 'at most 800 a day');
let b = A({ steps: 14000 });
ok(b.carbs === 33 && b.fat === 6, '+186 is about 70% carbs (33 g) and the rest fat (6 g); protein does not move');
ok(actCtxClean({ steps: 'x', base: -5 }).steps === 0 && actCtxClean({}).base === 8000 && actCtxClean(null) === null, 'nonsense is cleaned');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('the bonus is arithmetic');
