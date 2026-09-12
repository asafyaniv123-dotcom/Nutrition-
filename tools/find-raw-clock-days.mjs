/* Find a DAY decided from the raw clock.
 *
 * This app's day ends at 04:00, not at midnight. appNow(), todayStr(),
 * dayShift() and appDayOf() all carry that rollover; `new Date()` does not.
 * So between midnight and four every raw-clock day decision is a day ahead of
 * the day the person is actually still living in - and everything they log is
 * filed under the app's day, not the clock's.
 *
 *     node tools/find-raw-clock-days.mjs [file]
 *
 * The tell is not `new Date()` itself - the app needs the wall clock for the
 * time of day, and reads it correctly in several places. The tell is what is
 * then ASKED of it. A question about the hour is a clock question. A question
 * about which date, which weekday, which month - or a floor to midnight, or a
 * date handed to a formatter - is a DAY question, and a day question has to be
 * asked of appNow().
 *
 * That split needs no allow-list, which is the point: a list is the thing that
 * rots, and this one would have had to name every legitimate clock read in the
 * file. Instead the rule reads what the code does with the value:
 *
 *     new Date().getHours() / getMinutes() / getTime()   a clock question
 *     new Date().getDate() / getMonth() / getFullYear()  a DAY question
 *     dtStamp(new Date()), wkStamp(...), moFirst(...)    a DAY question
 *     d.setHours(0,0,0,0)                                flooring to a day
 *     dfmt(d, {weekday|day|month|year: …})                printing a day
 *
 * A variable used for BOTH - the home card reads its date for the header and
 * its minutes for the progress bar - is reported, because the day half is
 * wrong even though the clock half is right. Splitting it is the fix.
 *
 * Proved against the revision that had the bugs it was written for, the way
 * every check here has to be: 04b60dc reported 13, and the pass that followed
 * took it to 0. A detector that has never caught anything has not been tested.
 */
import fs from 'fs';

const CR = String.fromCharCode(13), LF = String.fromCharCode(10);
const FILE = process.argv[2] || 'dev/index.html';
const s = fs.readFileSync(FILE, 'utf8').split(CR + LF).join(LF);
/* The game is a standalone document with its own clock and its own rules. */
const gs = s.indexOf('id="game-src"'), ge = s.indexOf('</script>', gs);
const app = s.slice(0, gs) + ' '.repeat(ge - gs) + s.slice(ge);

/* Helpers that turn a Date into a DAY. Every one of them is this app's own. */
const DAY_FN = ['dtStamp', 'wkStamp', 'dayStr', 'moFirst', 'weekSunday', 'appDayOf', 'dayShift'];
/* What a DAY question looks like when asked of the Date directly. */
const DAY_READ = /\.(getDate|getMonth|getFullYear|getDay)\s*\(/;
const FLOOR = /\.setHours\s*\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/;
/* dfmt printing anything larger than a time. */
const DFMT_DAY = /weekday|day\s*:|month|year/;

const hits = [];

/* ── shape one: handed straight to a day helper ── */
for (const fn of DAY_FN) {
  const re = new RegExp('\\b' + fn + '\\s*\\(\\s*new Date\\(\\)\\s*\\)', 'g');
  for (const m of app.matchAll(re))
    hits.push({ line: app.slice(0, m.index).split(LF).length, why: fn + '(new Date())' });
}

/* ── shape two: kept in a variable, then asked a day question ──
   The window runs from the declaration to the next top-level function, which
   is as far as a local named `d` or `now` can be trusted to be the same one. */
/* Any binding, not only the first in its declaration. `var out={},d=new
   Date(),i;` and `var date=todayStr(),d=new Date();` are both the shape this
   is for, and anchoring on the var keyword missed every one of them - four
   real findings, including the home card that prints the wrong date under the
   word "today". */
for (const m of app.matchAll(/\b([\w$]+)\s*=\s*new Date\(\)\s*[;,]/g)) {
  const name = m[1];
  const from = m.index;
  /* A binding at column zero is a top-level GLOBAL, and a global outlives any
     window: calMonth is set here and asked its month five thousand lines
     away, so stopping at the next function found nothing. Everything indented
     is a local, where a name like `d` or `now` can only be trusted as far as
     the function that declared it. */
  const lineStart = app.lastIndexOf(LF, from) + 1;
  /* The line has to OPEN with the declaration, not merely be unindented. This
     file writes whole functions on one line - `function fmtTime(){var d=new
     Date();…}` starts at column zero too, and treating its local `d` as a
     global searched the entire file and found every other `d` in it. Both
     false positives were correct wall-clock reads. */
  const global = /^(?:var|let|const)\s/.test(app.slice(lineStart, from + 1));
  const stop = global ? -1 : app.indexOf(LF + 'function ', from);
  const win = global ? app : app.slice(from, stop < 0 ? app.length : stop);
  const uses = [];
  if (new RegExp('\\b' + name + '\\s*\\.' + DAY_READ.source.slice(2)).test(win)) uses.push('a date field');
  if (new RegExp('\\b' + name + FLOOR.source).test(win)) uses.push('floored to midnight');
  for (const fn of DAY_FN)
    if (new RegExp('\\b' + fn + '\\s*\\(\\s*' + name + '\\s*[,)]').test(win)) uses.push(fn + '()');
  for (const d of win.matchAll(new RegExp('\\bdfmt\\s*\\(\\s*' + name + '\\s*,\\s*(\\{[^}]*\\})', 'g')))
    if (DFMT_DAY.test(d[1])) uses.push('dfmt as a date');
  if (uses.length)
    hits.push({ line: app.slice(0, from).split(LF).length, why: name + ' → ' + [...new Set(uses)].join(', ') });
}

hits.sort((a, b) => a.line - b.line);
console.log('days decided from the raw clock: ' + hits.length);
if (!hits.length) {
  console.log('');
  console.log('  none — every day question is asked of appNow().');
  process.exit(0);
}
console.log('');
for (const h of hits) console.log('    line ' + String(h.line).padStart(6) + '  ' + h.why);
process.exit(1);
