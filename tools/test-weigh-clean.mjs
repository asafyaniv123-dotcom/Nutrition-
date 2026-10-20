/* What a weigh-in may tell the coach. Hidden means no weight at all reaches
 * the prompt, whatever the phone sent.
 *
 *   node tools/test-weigh-clean.mjs
 */
import { weighClean } from '../push-server/src/worker.js';

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const J = (x) => JSON.stringify(x);
const w = { mode: 'daily', hidden: true, trend_direction: 'up', change_vs_trend_kg: 0.6, today_kg: 72.4, trend_kg: 71.8,
  goal_kg: 65, recent: [{ d: '2026-10-20', kg: 71.8 }], flags: [{ day: '2026-10-20', flags: ['sodium', 'restaurant', 'hack'] }] };
let c = weighClean(w);
ok(!('today_kg' in c) && !('trend_kg' in c) && !('goal_kg' in c) && !('recent' in c) && !J(c).includes('72'), 'HIDDEN: not one weight survives, even if the phone sent them');
ok(c.change_vs_trend_kg === 0.6 && c.trend_direction === 'up', 'hidden still carries the direction and the difference');
ok(J(c.flags) === J([{ day: '2026-10-20', flags: ['sodium', 'restaurant'] }]), 'only known flags pass');
c = weighClean(Object.assign({}, w, { hidden: false }));
ok(c.today_kg === 72.4 && c.recent.length === 1, 'shown: the weights pass');
ok(weighClean(Object.assign({}, w, { hidden: false, today_kg: 9000 })).today_kg === null, 'an impossible weight is dropped');
ok(weighClean(null) === null && weighClean('x') === null, 'no weigh-in is null');
ok(weighClean({ mode: 'monthly' }).mode === 'daily', 'an unknown mode is daily');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('a hidden weight never reaches the prompt');
