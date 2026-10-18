/* What the planning line's /schedule lets through. Every case is a way the
 * model could be wrong that would put a false entry on the card.
 *
 *   node tools/test-schedule-clean.mjs
 */
import { scheduleClean } from '../push-server/src/worker.js';

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const T = '2026-10-18';   // a Sunday
const one = (it) => scheduleClean({ items: [Object.assign({ text: 'x', repeat: 'none', days: [], date: '', start: '', end: '' }, it)] }, T)[0];

let r = one({ text: 'מדיטציה', repeat: 'weekly', days: [3], start: '09:00', end: '10:00' });
ok(r && r.repeat === 'weekly' && r.days.join() === '3' && r.start === '09:00' && r.end === '10:00', 'every Wednesday 9-10 survives intact');
ok(one({ repeat: 'weekly', days: [], date: '2026-10-21' }).days.join() === '3', 'a weekly entry with only a date takes that date\'s weekday');
ok(one({ repeat: 'weekly', days: [] }) === undefined, 'a weekly entry with no day at all is dropped, not guessed');
ok(one({ repeat: 'weekly', days: [9, -1, 2, 2, 4.2] }).days.join() === '2,4', 'weekdays outside 0-6 are dropped, repeats folded');
ok(one({ repeat: 'daily' }).days.length === 7, 'daily is every weekday');
ok(one({ repeat: 'none' }).date === T, 'a one-off with no date is today');
ok(one({ repeat: 'none', days: [1, 2] }).days.length === 0, 'a one-off carries no weekdays');
ok(one({ repeat: 'sometimes', date: '2026-10-20' }).repeat === 'none', 'a repeat the app does not know is one time');
ok(one({ start: '9:05' }).start === '09:05', 'a time is normalised to HH:MM');
ok(one({ start: '25:00', end: '26:00' }).start === '' && one({ start: '25:00', end: '26:00' }).end === '', 'an impossible time is no time');
ok(one({ start: '10:00', end: '09:00' }).end === '', 'an end before its start is no end');
ok(one({ end: '10:00' }).end === '', 'an end with no start is dropped');
ok(one({ date: '2026-02-30' }).date === T, 'a date that does not exist is not used');
ok(one({ text: '   ' }) === undefined, 'an entry with no words is not an entry');
ok(scheduleClean({ items: new Array(30).fill({ text: 'a', repeat: 'none', days: [], date: '', start: '', end: '' }) }, T).length === 10, 'at most ten entries');
ok(scheduleClean(null, T).length === 0, 'no answer at all is no entries, not a crash');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('nothing the model says reaches the card unchecked');
