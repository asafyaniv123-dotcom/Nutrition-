// DOES THE MIGRATION LOSE ANYTHING?
//
// planMigrate moves every task out of the month store: dated ones into the
// week their date belongs to, undated ones into the shared pool. It runs on
// every render, so it must also be a no-op the second time - and it walks
// localStorage while writing to it, which is the shape that silently skips
// entries.
//
// So this lifts the real functions OUT OF THE SHIPPED FILE and runs them
// against a fake localStorage, the way test-background-fill.mjs lifts the
// flood fill. Rewriting the algorithm here would only test my memory of it.
//
//   node tools/test-plan-migrate.mjs [file]
//
// Exits non-zero if a task is lost, duplicated, or moved to the wrong week,
// or if a second run changes anything.
import fs from 'fs';

const FILE = process.argv[2] || 'dev/index.html';
const src = fs.readFileSync(FILE, 'utf8');

/* ── lift, by name, exactly as written ── */
function lift(name) {
  const at = src.indexOf('\nfunction ' + name + '(');
  if (at < 0) throw new Error('cannot find function ' + name + ' in ' + FILE);
  /* Walk braces from the first { after the signature. Strings AND comments
     are skipped: this file writes HTML with braces in its strings, and its
     comments are prose about CSS - one of them literally contains
     ".app{background:var(--nu-ground)}". Counting those is how two earlier
     scans in this repo reported confident nonsense. */
  let i = src.indexOf('{', at), depth = 0, q = null;
  for (; i < src.length; i++) {
    const c = src[i], p = src[i - 1], n = src[i + 1];
    if (q) { if (c === q && p !== '\\') q = null; continue; }
    if (c === '/' && n === '*') { i = src.indexOf('*/', i + 2) + 1; continue; }
    if (c === '/' && n === '/') { i = src.indexOf('\n', i); continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (!depth) return src.slice(at + 1, i + 1); }
  }
  throw new Error('unbalanced braces reading ' + name);
}

/* Everything by the same brace walk, including the one-liners. An earlier
   version read those with a regex anchored on the closing paren, which took
   dayStr's SIGNATURE and nothing else - it happens to be written over four
   lines - and produced a harness that did not parse. A shortcut for the easy
   cases is a second reader of the same file, and the second reader is the one
   that is wrong. */
const NAMES = ['planMigrate', 'loadPool', 'savePool', 'poolPut', 'loadWeek', 'saveWeek',
               'weekSunday', 'wkDateOf', 'moFirst', 'wkKey', 'wkStamp', 'dayStr'];
const lifted = NAMES.map(lift).join('\n');
/* the store's key, read from the file rather than written here twice */
const keyLine = /^var PL_POOL_KEY=.*$/m.exec(src);
if (!keyLine) throw new Error('PL_POOL_KEY is not declared in ' + FILE);
const extra = keyLine[0] + '\n';

const store = {};
const harness = `
  var localStorage = {
    _d: store,
    get length(){ return Object.keys(this._d).length; },
    key: function(i){ return Object.keys(this._d)[i]; },
    getItem: function(k){ return Object.prototype.hasOwnProperty.call(this._d,k)?this._d[k]:null; },
    setItem: function(k,v){ this._d[k]=String(v); },
    removeItem: function(k){ delete this._d[k]; }
  };
  function planPush(){}                 // undo, not under test
  function appNow(){ return NOW; }
  ${extra}
  ${lifted}
  return { planMigrate: planMigrate, loadPool: loadPool, loadWeek: loadWeek,
           weekSunday: weekSunday, wkKey: typeof wkKey==='function'?wkKey:null };
`;

const NOW = new Date('2026-09-29T12:00:00');
const api = new Function('store', 'NOW', harness)(store, NOW);

/* ── the fixture: a month exactly as saveMonth writes one ── */
const MONTH = 'mplan_2026-09';
const tasks = [
  { id: 'm1', w: 'לחדש דרכון', d: '', c: 'lav' },              /* undated  -> pool  */
  { id: 'm2', w: 'רופא שיניים', d: '2026-09-03', c: 'blu' },    /* Thursday -> wk of 30/8 */
  { id: 'm3', w: 'יום הולדת לאמא', d: '2026-09-13', c: 'grn' }, /* Sunday   -> its own week */
  { id: 'm4', w: 'להגיש דוח', d: '2026-09-30', c: 'ter' },      /* Wednesday-> wk of 27/9 */
  { id: 'm5', w: 'טיול', d: '', c: 'amb' },
];
store[MONTH] = JSON.stringify({ tasks: tasks.slice() });
/* and a week record with its own undated pool, which also has to move */
const SUN = api.weekSunday(new Date('2026-09-29T12:00:00'));
store[api.wkKey(SUN)] = JSON.stringify({ tasks: [
  { id: 'w1', w: 'ישיבת צוות', d: '2026-09-29', s: 'm', c: 'lav' },
  { id: 'w2', w: 'משהו לא משובץ', d: '', s: '', c: 'sky' },
] });

/* what must be FINDABLE afterwards is everything: five month tasks and the
   week record's two. What must be MOVED is six of them - w1 is already a
   dated week task sitting in the right record, and migrating it would mean
   the pass does not know what it is for. */
const before = tasks.length + 2;
const toMove = tasks.length + 1;
const moved = api.planMigrate();
const snapshot1 = JSON.stringify(store);
const movedAgain = api.planMigrate();
const snapshot2 = JSON.stringify(store);

/* ── what came out ── */
const pool = api.loadPool().tasks;
const everywhere = new Map();
for (const t of pool) everywhere.set(t.id, { where: 'pool', t });
for (const k of Object.keys(store)) {
  if (k.indexOf('wplan_') !== 0) continue;
  for (const t of JSON.parse(store[k]).tasks) {
    if (everywhere.has(t.id)) { everywhere.get(t.id).dup = true; continue; }
    everywhere.set(t.id, { where: k, t });
  }
}

let fail = 0;
const say = (ok, line) => { if (!ok) fail++; console.log((ok ? '  ok   ' : '  FAIL ') + line); };

console.log('planMigrate, lifted from ' + FILE + '\n');
say(moved === toMove, "moved " + moved + " of " + toMove + " that needed moving (" + before + " exist)");
say(movedAgain === 0, 'second run moved ' + movedAgain + ' (must be 0 - it runs on every render)');
say(snapshot1 === snapshot2, 'the second run changed nothing');
say(everywhere.size === before, 'every task is findable afterwards: ' + everywhere.size + ' of ' + before);
say(![...everywhere.values()].some(v => v.dup), 'no task ended up in two places');

for (const t of tasks.concat([{ id: 'w1', d: '2026-09-29' }, { id: 'w2', d: '' }])) {
  const f = everywhere.get(t.id);
  if (!f) { say(false, t.id + ' VANISHED'); continue; }
  if (!t.d) { say(f.where === 'pool', t.id + ' (no date) -> ' + f.where); continue; }
  const want = api.wkKey(api.weekSunday(new Date(t.d + 'T12:00:00')));
  say(f.where === want, t.id + ' (' + t.d + ') -> ' + f.where + (f.where === want ? '' : ', wanted ' + want));
  if (f.where === want) say(f.t.d === t.d, '   and kept its date ' + f.t.d);
}
/* the id is the contract with an hour already written on a day */
say(tasks.every(t => !everywhere.get(t.id) || everywhere.get(t.id).t.id === t.id),
    'every task kept its id, so an hour written against it still finds it');
say(JSON.parse(store[MONTH]).tasks.length === 0 && JSON.parse(store[MONTH]).mig === 1,
    'the month record is emptied and marked');

console.log('\n' + (fail ? fail + ' assertion(s) failed' : 'nothing lost, nothing duplicated, idempotent'));
process.exit(fail ? 1 : 0);
