/* Which reminder is due, minute by minute. The first half is the evening
 * reminder alone, and asserts the loop's old behaviour exactly - that is the
 * reminder the first user relies on, and this change must not move it. The
 * second half is the weigh-in riding the same subscription.
 *
 *   node tools/test-reminders-due.mjs
 */
import { remindersDue, weighClean } from '../push-server/src/worker.js';

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const at = (hhmm, date = '2026-10-21') => ({ date, hhmm });   // a Wednesday
const J = (x) => JSON.stringify(x);

// the evening reminder alone - the old loop, decision by decision
const ev = { time: '21:00', last: '2026-10-20' };
ok(J(remindersDue(ev, at('20:59'))) === J({ mark: null, send: false }), 'before the time: nothing, nothing written');
ok(J(remindersDue(ev, at('21:00'))) === J({ mark: { last: '2026-10-21' }, send: true }), 'at the time: a push, marked');
ok(J(remindersDue(ev, at('23:00'))) === J({ mark: { last: '2026-10-21' }, send: true }), 'two hours late: still sent');
ok(J(remindersDue(ev, at('23:01'))) === J({ mark: { last: '2026-10-21' }, send: false }), 'past the window: marked silently');
ok(J(remindersDue({ time: '21:00', last: '2026-10-21' }, at('21:30'))) === J({ mark: null, send: false }), 'already sent today: nothing');
ok(J(remindersDue({ time: '07:00' }, at('07:05'))) === J({ mark: { last: '2026-10-21' }, send: true }), 'a record that never sent: sent');
ok(J(remindersDue({ time: 'xx' }, at('07:05'))) === J({ mark: null, send: false }), 'a broken time is skipped, not a crash for every record after it');

// the weigh-in
const both = { time: '21:00', last: '2026-10-20', wt: '07:30', wd: [0, 3], wlast: '2026-10-18' };
ok(J(remindersDue(both, at('07:29'))) === J({ mark: null, send: false }), 'weigh day, before its time: nothing');
ok(J(remindersDue(both, at('07:30'))) === J({ mark: { wlast: '2026-10-21' }, send: true }), 'weigh day (Wednesday) at its time: a push');
ok(J(remindersDue(both, at('07:30', '2026-10-22'))) === J({ mark: null, send: false }), 'Thursday is not a weigh day: nothing, nothing written');
ok(J(remindersDue(Object.assign({}, both, { wlast: '2026-10-21' }), at('08:00'))) === J({ mark: null, send: false }), 'weighed-in reminder already sent today: nothing');
ok(J(remindersDue(Object.assign({}, both, { wlast: '2026-10-21' }), at('21:00'))) === J({ mark: { last: '2026-10-21' }, send: true }), 'the evening one still comes the same day');
ok(J(remindersDue({ time: '', wt: '07:30', wd: [3] }, at('07:31'))) === J({ mark: { wlast: '2026-10-21' }, send: true }), 'weigh-in only, no evening reminder');
ok(J(remindersDue({ time: '07:30', wt: '07:30', wd: [3] }, at('07:30'))) === J({ mark: { last: '2026-10-21', wlast: '2026-10-21' }, send: true }), 'both in the same minute: ONE push, both marked');
ok(J(remindersDue({ time: '', wt: '07:30', wd: [3] }, at('09:31'))) === J({ mark: { wlast: '2026-10-21' }, send: false }), 'weigh-in past its window: marked silently');
ok(J(remindersDue({ time: '', wt: '07:30' }, at('07:31'))) === J({ mark: null, send: false }), 'a weigh-in with no days is never due');

// weighClean: hidden sends no weight, whatever the phone said
const w = { mode: 'daily', hidden: true, trend_direction: 'up', change_vs_trend_kg: 0.6, today_kg: 72.4, trend_kg: 71.8,
  goal_kg: 65, recent: [{ d: '2026-10-20', kg: 71.8 }], flags: [{ day: '2026-10-20', flags: ['sodium', 'restaurant', 'hack'] }] };
let c = weighClean(w);
ok(!('today_kg' in c) && !('trend_kg' in c) && !('goal_kg' in c) && !('recent' in c) && !JSON.stringify(c).includes('72'), 'HIDDEN: not one weight survives, even if the phone sent them');
ok(c.change_vs_trend_kg === 0.6 && c.trend_direction === 'up', 'hidden still carries the direction and the difference');
ok(J(c.flags) === J([{ day: '2026-10-20', flags: ['sodium', 'restaurant'] }]), 'only known flags pass');
c = weighClean(Object.assign({}, w, { hidden: false }));
ok(c.today_kg === 72.4 && c.recent.length === 1, 'shown: the weights pass');
ok(weighClean(Object.assign({}, w, { hidden: false, today_kg: 9000 })).today_kg === null, 'an impossible weight is dropped');
ok(weighClean(null) === null && weighClean('x') === null, 'no weigh-in is null');
ok(weighClean({ mode: 'monthly' }).mode === 'daily', 'an unknown mode is daily');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('the evening reminder is unchanged, and the weigh-in rides beside it');
