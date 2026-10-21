/* An edit touches one item, and a correction is stored only in its shape.
 *
 *   node tools/test-coach-edits.mjs
 */
import { coachEditOnly, corrClean } from '../push-server/src/worker.js';

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const it = (id, name) => ({ id, name, calories: 100 });

let r = coachEditOnly('update', [it('m1', 'ביצים')], 'm1');
ok(r.action === 'update' && r.items.length === 1 && r.items[0].id === 'm1', 'an update of the edited id passes');
r = coachEditOnly('add', [it('c9', 'ביצים עם שמן')], 'm1');
ok(r.action === 'update' && r.items[0].id === 'm1', 'an ADD of one item becomes an update of the edited id - never a second copy');
r = coachEditOnly('update', [it('m1', 'ביצים'), it('m2', 'לחם')], 'm1');
ok(r.items.length === 1 && r.items[0].id === 'm1', 'other items in the reply are dropped');
r = coachEditOnly('update', [it('m2', 'לחם'), it('m3', 'גבינה')], 'm1');
ok(r.action === 'none' && !r.items.length, 'several items, none of them the edited one: nothing, not a guess');
ok(coachEditOnly('delete', [it('m1', 'x')], 'm1').action === 'none', 'an edit never deletes');
ok(coachEditOnly('none', [], 'm1').action === 'none', 'no answer is no change');
r = coachEditOnly('update', [it('m1', 'סושי'), it('m2', 'טריאקי'), it('m9', 'אחר')], ['m1', 'm2']);
ok(r.items.length === 2 && r.items.map((x) => x.id).join() === 'm1,m2', 'a message that logged two items: both are the edit, nothing else');
r = coachEditOnly('add', [it('c1', 'סושי')], ['m1', 'm2']);
ok(r.action === 'none', 'with several ids, one item under a new id is not guessed at');

const good = { type: 'swipe_edit', ts: Date.now(), before: { id: 1, name: 'ביצים', kcal: 140 }, after: { id: 1, name: 'ביצים', kcal: 260 }, kcal_diff: 120, message: '2 ביצים עם כף שמן', photo: false };
let c = corrClean(good);
ok(c && c.type === 'swipe_edit' && c.before.id === '1' && c.after.kcal === 260 && c.kcal_diff === 120, 'a real correction is kept');
ok(corrClean(Object.assign({}, good, { type: 'hack' })) === null, 'an unknown type is not stored');
c = corrClean(Object.assign({}, good, { message: 'x'.repeat(5000), before: { name: 'y'.repeat(900), kcal: 1e9 } }));
ok(c.message.length === 600 && c.before.name.length === 120 && c.before.kcal === 20000, 'everything is cut to size');
ok(corrClean(Object.assign({}, good, { after: null, type: 'delete' })).after === null, 'a delete has no after');
ok(corrClean(Object.assign({}, good, { ts: 'soon' })).ts > 1.6e12, 'a bad time is now');
ok(corrClean(Object.assign({}, good, { photo: 'yes' })).photo === false, 'photo is a real boolean or false');
ok(corrClean(null) === null, 'nothing is nothing');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('an edit is one row, and a correction is only ever its shape');
