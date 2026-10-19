/* What the planning line's /schedule lets through. Every case is a way the
 * model could be wrong that would put a false entry on the card.
 *
 *   node tools/test-schedule-clean.mjs
 */
import { scheduleClean, scheduleBoard } from '../push-server/src/worker.js';

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

// a repeat that ends, and a removal
r = one({ text: 'מילואים', repeat: 'daily', until: '2026-10-24' });
ok(r.until === '2026-10-24' && r.action === 'add', '"reserve duty until the 24th" keeps its last day');
ok(one({ repeat: 'none', date: '2026-10-20', until: '2026-10-24' }).until === '', 'a one-off has no last day');
ok(one({ repeat: 'daily', date: '2026-10-25', until: '2026-10-20' }).until === '', 'an add whose last day is before its first does not end');
ok(one({ repeat: 'daily', until: '2026-10-31-x' }).until === '', 'a last day that is not a date is not used');
ok(one({ action: 'delete' }).action === 'add', 'an action the app does not know is an add');
r = one({ text: 'מילואים', action: 'remove', repeat: 'daily', date: '2026-10-25', until: '2026-10-31' });
ok(r.action === 'remove' && r.date === '2026-10-25' && r.until === '2026-10-31' && r.days.length === 7, '"remove it from the 25th to the 31st" is a removal of seven days');
ok(one({ action: 'remove', repeat: 'daily', date: '2026-10-25', until: '2026-10-20' }) === undefined, 'a removal with an empty span is dropped, not widened');
ok(one({ action: 'remove', repeat: 'daily', date: '2026-10-25' }).until === '', 'a removal "from now on" stays open');

// what the phone says about its board, before it reaches a prompt
const bd = scheduleBoard({ board: [{ text: 'מילואים', from: '2026-10-19', to: '2027-04-19', n: 183 }, { text: '', from: '2026-10-19', to: '2026-10-19', n: 1 },
  { text: 'x', from: 'soon', to: '2026-10-19', n: 1 }, { text: 'y'.repeat(300), from: '2026-10-19', to: '2026-10-19', n: 1e9 }].concat(new Array(60).fill({ text: 'z', from: '2026-10-19', to: '2026-10-19', n: 1 })),
  last: ['מילואים', 7, null, '', 'a', 'b', 'c', 'd'] });
ok(bd.entries[0].text === 'מילואים' && bd.entries[0].n === 183, 'a real board entry survives');
ok(!bd.entries.some((e) => !e.text || e.from === 'soon'), 'entries with no words or no date are dropped');
ok(bd.entries.every((e) => e.text.length <= 80 && e.n <= 999), 'an entry is cut to size');
ok(bd.entries.length <= 40, 'at most forty entries');
ok(bd.last.length <= 5 && bd.last[1] === '7', 'what was added last is words, at most five');
ok(scheduleBoard(null).entries.length === 0 && scheduleBoard({ board: 'x' }).entries.length === 0, 'no board is an empty board');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('nothing the model says reaches the card unchecked');
