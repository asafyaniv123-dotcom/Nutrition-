/* The activity bonus, and which reminder is due. The reminder half asserts
 * first that the evening summary reminder - the one the first user relies
 * on - behaves exactly as the loop always did.
 *
 *   node tools/test-activity.mjs
 */
import { activityBonus, actCtxClean, remindersDue } from '../push-server/src/worker.js';

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const J = (x) => JSON.stringify(x);
const A = (o) => activityBonus(Object.assign({ steps: 0, base: 8000, strength: false, cardio_min: 0 }, o));

// the bonus
ok(A({ steps: 14000 }).kcal === 240, '14,000 steps on an 8,000 baseline: +240');
ok(A({ steps: 17000 }).kcal === 360, 'updated to 17,000: +360, not 600 - the latest number, never added');
ok(A({ steps: 6000 }).kcal === 0, 'under the baseline: nothing');
ok(A({ steps: 14000, base: 10000 }).kcal === 160, 'the baseline is hers: 14,000 on 10,000 is +160');
ok(A({ strength: true }).kcal === 200, 'strength training: +200');
ok(A({ cardio_min: 60 }).kcal === 300 && A({ cardio_min: 30 }).kcal === 150, 'an hour of dance or sport: +300; half an hour +150');
ok(A({ steps: 30000, strength: true, cardio_min: 120 }).kcal === 800 && A({ steps: 30000, strength: true }).capped, 'at most 800 a day');
let b = A({ steps: 14000 });
ok(b.carbs === 42 && b.fat === 8, '+240 is about 70% carbs (42 g) and the rest fat (8 g); protein does not move');
ok(actCtxClean({ steps: 'x', base: -5 }).steps === 0 && actCtxClean({}).base === 8000 && actCtxClean(null) === null, 'nonsense is cleaned');

// the evening reminder alone - the old loop, decision by decision
const at = (hhmm, date = '2026-10-21') => ({ date, hhmm });
const ev = { time: '21:00', last: '2026-10-20' };
ok(J(remindersDue(ev, at('20:59'))) === J({ mark: null, send: false }), 'before the time: nothing, nothing written');
ok(J(remindersDue(ev, at('21:00'))) === J({ mark: { last: '2026-10-21' }, send: true }), 'at the time: a push, marked');
ok(J(remindersDue(ev, at('23:00'))) === J({ mark: { last: '2026-10-21' }, send: true }), 'two hours late: still sent');
ok(J(remindersDue(ev, at('23:01'))) === J({ mark: { last: '2026-10-21' }, send: false }), 'past the window: marked silently');
ok(J(remindersDue({ time: '21:00', last: '2026-10-21' }, at('21:30'))) === J({ mark: null, send: false }), 'already sent today: nothing');
ok(J(remindersDue({ time: 'xx' }, at('07:05'))) === J({ mark: null, send: false }), 'a broken time is skipped, not a crash for every record after it');

// the 20:00 activity reminder
const both = { time: '21:30', last: '2026-10-20', ar: true, alast: '2026-10-20' };
ok(J(remindersDue(both, at('19:59'))) === J({ mark: null, send: false }), 'before 20:00: nothing');
ok(J(remindersDue(both, at('20:00'))) === J({ mark: { alast: '2026-10-21' }, send: true }), 'at 20:00: the activity push');
ok(J(remindersDue(both, at('20:16'))) === J({ mark: { alast: '2026-10-21' }, send: false }), 'past a quarter of an hour: marked silently');
ok(J(remindersDue(Object.assign({}, both, { alast: '2026-10-21' }), at('20:05'))) === J({ mark: null, send: false }), 'the app said today is done: no push');
ok(J(remindersDue(Object.assign({}, both, { alast: '2026-10-21' }), at('21:30'))) === J({ mark: { last: '2026-10-21' }, send: true }), 'the evening summary still comes');
ok(J(remindersDue({ time: '21:00', alast: '' }, at('20:00'))) === J({ mark: null, send: false }), 'activity reminder off: nothing at 20:00');
ok(J(remindersDue({ time: '20:05', ar: true }, at('20:05'))) === J({ mark: { last: '2026-10-21', alast: '2026-10-21' }, send: true }), 'both in the same minutes: ONE push');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('the bonus is arithmetic, and the evening reminder is unchanged');
