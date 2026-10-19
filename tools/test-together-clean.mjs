/* What a phone may tell a /together room, cut to size before it is stored or
 * handed to the other phone. Every case is a way a broken or hostile phone
 * could put something on its partner's screen that should not be there.
 *
 *   node tools/test-together-clean.mjs
 */
import { tgCode, tgPlan, tgMember } from '../push-server/src/worker.js';

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };

let r = 0.123; const rnd = () => (r = (r * 9301 + 49297) % 233280 / 233280);
const codes = new Set(); for (let i = 0; i < 200; i++) codes.add(tgCode(rnd));
ok([...codes].every((c) => /^[A-HJKMNP-Z2-9]{6}$/.test(c)), 'a code is six characters with no 0/O or 1/I/L to misread');

const p = tgPlan({ name: 'רגליים', exercises: [{ name: 'סקוואט', sets: 4, reps: '8-10' }, { name: '', sets: 3 }, { name: 'x'.repeat(200), sets: 99, reps: 5 }] });
ok(p.exercises.length === 2, 'an exercise with no name is dropped');
ok(p.exercises[1].name.length === 60 && p.exercises[1].sets === 20, 'a long name is cut and sets are capped at 20');
ok(p.exercises[0].reps === '8-10', 'reps keep their range');
ok(tgPlan({ exercises: new Array(80).fill({ name: 'a', sets: 3 }) }).exercises.length === 30, 'at most thirty exercises');
ok(tgPlan(null).exercises.length === 0, 'no plan is an empty plan, not a crash');

const m = tgMember({ name: 'דנה'.repeat(20), ex: [{ n: 'סקוואט', s: [[60, 10], ['x', 8], [-5, 3], [5000, 1]] }], cur: 99, done: 'yes', token: 'secret' });
ok(m.name.length === 24, 'a name is cut to 24');
ok(JSON.stringify(m.ex[0].s) === '[[60,10],[0,8],[0,3],[0,1]]', 'a weight that is not a sane number becomes 0');
ok(m.cur === 29 && m.done === true, 'the current exercise is clamped, done is a boolean');
ok(!('token' in m), 'a member record never carries a token onward');
ok(tgMember(null).ex.length === 0, 'no record is an empty one, not a crash');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('nothing one phone sends reaches the other uncut');
