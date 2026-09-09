/* Drive the shipped food search with every core food's own name, in all
 * eleven languages, and assert the food comes back first.
 *
 * The functions are LIFTED out of dev/index.html rather than retyped, the way
 * test-background-fill.mjs lifts the flood fill, so the thing under test is
 * the thing that ships.
 *
 * Why the core's own names rather than a hand-written word list: nothing has
 * to be guessed. If the Arabic name of core:rice-white is what the file says
 * it is, then typing it must return core:rice-white, and any other answer is
 * a defect in the search rather than a difference of opinion about what the
 * word means. Three hundred foods times eleven languages is a wide enough net
 * to catch a whole class at once.
 *
 * A hand-written list of everyday words follows the generated one, because a
 * person types the ordinary word for cooked rice, not the table's full name
 * for it.
 *
 *   node tools/test-food-search.mjs                 ui language en
 *   node tools/test-food-search.mjs --ui he         ui language Hebrew
 *   node tools/test-food-search.mjs --only ja       only Japanese queries
 *   node tools/test-food-search.mjs --file <path>   another revision's app
 *
 * `--file` swaps the APP only. The food tables are always read from the
 * working tree, so a comparison against an older revision measures the search
 * code of that revision against today's data — which is what you want when
 * asking whether a ranking change helped, and is not a clean revision switch.
 * Check out the data too if you need one.
 *
 * Exits non-zero when a query misses its own food.
 */
import fs from 'fs';
import vm from 'vm';

const argv = process.argv.slice(2);
const opt = (name, dflt) => { const i = argv.indexOf('--' + name); return i < 0 ? dflt : argv[i + 1]; };
const UI = opt('ui', 'en');
const ONLY = opt('only', '');
const FILE = opt('file', 'dev/index.html');
const LANGS = ['he', 'en', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar'];

/* ── lift the search out of the shipped file ──────────────────────────── */
const src = fs.readFileSync(FILE, 'utf8');
function lift(from, to) {
  const a = src.indexOf(from), b = src.indexOf(to);
  if (a < 0 || b < 0 || b <= a) throw new Error('could not lift ' + from);
  return src.slice(a, b);
}
/* foodTokens calls foodStop, which reads FOOD_STOP two lines above it, so the
   second slice starts at the stop list rather than at foodTokens. Lifting the
   function without the table it reads is how you get a ReferenceError that
   looks like the search is broken. */
const code = (function () {
  const c = lift('function foodName(f){', 'function foodsLoad(then){') +
            lift('var FOOD_STOP=', 'SCANNING A BARCODE');
  /* the second slice stops inside a comment, so trim back to where it opens */
  return c.slice(0, c.lastIndexOf('/*'));
})();

/* ── load the tables in the order the app loads them ──────────────────── */
const FILES = ['data/foods.core.json', 'data/foods.json', 'data/foods.off.json'];
const rowsRaw = [];
for (const f of FILES) {
  if (!fs.existsSync(f)) continue;
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const r of (Array.isArray(j) ? j : (j.foods || j.rows || Object.values(j)[0])))
    rowsRaw.push(r);
}

/* One context per ui language, built on demand. The ui decides which of the
   eleven names ends up in `f.s`, and `f.s` is what half the ranking reads, so
   a probe that only bites in German has to be asked in German — asked in
   English it silently tests nothing, which is what the first version of the
   Brot guard did. */
const CTX = {};
function ctxFor(ui) {
  if (CTX[ui]) return CTX[ui];
  const ctx = { _foods: null, console };
  vm.createContext(ctx);
  vm.runInContext('function appLang(){return ' + JSON.stringify(ui) + ';}', ctx);
  vm.runInContext(code, ctx);
  /* fresh copies: f.n/f.s/f.alt/f.na are per-language */
  ctx._foods = rowsRaw.map((r, k) => Object.assign({}, r, { i: k }));
  /* the same assignments foodsLoad makes, in the same order */
  vm.runInContext('for(var z=0;z<_foods.length;z++){var f=_foods[z];' +
    'if(f.t){f.n=foodName(f);f.alt=foodAlt(f);' +
    'if(typeof foodNames==="function")f.na=foodNames(f);}' +
    'f.s=foodKey(f.n||"");}', ctx);
  CTX[ui] = ctx;
  return ctx;
}
const searchIn = (ui, q) =>
  vm.runInContext('foodSearch(' + JSON.stringify(q) + ')', ctxFor(ui));
const search = q => searchIn(UI, q);
const all = ctxFor(UI)._foods;

/* Four places where one food's name in one language IS another food's name in
   another, so no ranking can satisfy both and the sweep's own premise breaks.
   Each is listed with the collision, and each is tolerated rather than hidden:
   they are counted and printed, and a fifth appearing means something moved.

   The judgement in every case is the same — the reader is using the app in a
   language, and the word they type is far more likely to be that language's
   or English than a fourth party's. "prune" in an English app must reach the
   prunes, at 56.8 g of carbohydrate against the plum's 11.4, even though it
   is also exactly the French for plum. */
const COLLIDE = {
  'fr:Prune': 'also the English "prune(s)" — the dried fruit, 5x the carbohydrate',
  'fr:Sel': 'also the start of the English "self-raising flour"',
  'fr:Céleri': 'also the start of "celeriac", which is a different root',
  'pt:Mel': 'also the middle of the English "honeydew melon"',
};
const core = all.filter(r => String(r.id).indexOf('core:') === 0);
const by = {}; for (const l of LANGS) by[l] = { ok: 0, none: [], wrong: [], collide: [] };
for (const row of core) {
  if (!row.t) continue;
  for (const l of LANGS) {
    if (ONLY && l !== ONLY) continue;
    const q = row.t[l];
    if (!q) continue;
    const r = search(q);
    if (!r.length) by[l].none.push([q, row.id]);
    else if (r[0].id !== row.id) {
      const why = COLLIDE[l + ':' + q];
      (why ? by[l].collide : by[l].wrong).push([q, row.id, r[0].id + ' / ' + r[0].n, why]);
    } else by[l].ok++;
  }
}

/* ── and the words a person actually types ────────────────────────────── */
/* Each probe is {q, want} plus two optional fields:
     ui    the ui language it must be asked in — some only bite in one
     open  a preference nobody has settled: the answer that comes back is
           defensible and merely not the one I would pick. Printed, counted,
           and does NOT fail the run, because a test that is red for a matter
           of taste stops being read.
   `why` is a plain note on a probe that must pass; it does not exempt.

   An `open` probe that starts returning the wanted food is reported as DEAD,
   because an exemption that no longer exempts anything is how a test quietly
   stops testing — four of the first seven went stale within a day.

   Reaching NOTHING is always a failure, note or not: `open` says "this answer
   is arguable", never "finding nothing is acceptable". */
const EVERYDAY = JSON.parse(fs.readFileSync('tools/food-search-probes.json', 'utf8'));
const ev = { ok: 0, none: [], wrong: [], open: [], dead: [] };
for (const p of EVERYDAY) {
  /* A probe with no `ui` is asked in EVERY interface language, not just the
     run's. The ui decides which of the eleven names lands in `f.s`, and half
     the ranking reads `f.s`, so one language passing says nothing about the
     other ten: the `paste` guard added to protect this very code passed in
     English and returned watermelon in nine of the eleven, for two rounds,
     because it inherited the run's language. A probe that names a `ui` is
     one that only bites there. */
  let missed = 0;
  for (const ui of (p.ui ? [p.ui] : LANGS)) {
    const r = searchIn(ui, p.q);
    const tag = p.q + ' [' + ui + ']';
    if (!r.length) { ev.none.push([tag, p.want]); missed++; }
    else if (r[0].id === p.want) ev.ok++;
    else { (p.open ? ev.open : ev.wrong).push([tag, p.want, r[0].id + ' / ' + r[0].n, p.open]); missed++; }
  }
  /* DEAD only when the exemption bought nothing ANYWHERE. Judged per probe,
     not per language: بطاطس returns the wanted food in Arabic and not in the
     other ten, so its note is still doing work. */
  if (p.open && !missed) ev.dead.push([p.q, p.want]);
}

/* ── report ───────────────────────────────────────────────────────────── */
let bad = 0;
console.log('ui language: ' + UI + '   ' + core.length + ' core foods, ' + all.length + ' rows\n');
for (const l of LANGS) {
  const b = by[l];
  const n = b.ok + b.none.length + b.wrong.length + b.collide.length;
  if (!n) continue;
  bad += b.none.length + b.wrong.length;
  console.log(l.padEnd(9) + String(b.ok).padStart(4) + '/' + n +
    (b.none.length ? '   reached nothing: ' + b.none.length : '') +
    (b.wrong.length ? '   wrong food first: ' + b.wrong.length : '') +
    (b.collide.length ? '   known collisions: ' + b.collide.length : ''));
  for (const [q, id] of b.none.slice(0, 6)) console.log('    NONE  ' + q + '   want ' + id);
  for (const [q, id, got] of b.wrong.slice(0, 6)) console.log('    RANK  ' + q + '   want ' + id + '   got ' + got);
  for (const [q, , got, why] of b.collide) console.log('    coll  ' + q + '   got ' + got + '   — ' + why);
  if (b.none.length > 6 || b.wrong.length > 6) console.log('    …');
}
if (EVERYDAY.length) {
  bad += ev.none.length + ev.wrong.length;
  console.log('\neveryday  ' + ev.ok + '/' + EVERYDAY.length +
    (ev.none.length ? '   reached nothing: ' + ev.none.length : '') +
    (ev.wrong.length ? '   wrong food first: ' + ev.wrong.length : ''));
  for (const [q, id] of ev.none) console.log('    NONE  ' + q + '   want ' + id);
  for (const [q, id, got] of ev.wrong) console.log('    RANK  ' + q + '   want ' + id + '   got ' + got);
  for (const [q, , got, note] of ev.open) console.log('    open  ' + q + '   got ' + got + '   — ' + note);
  for (const [q, id] of ev.dead)
    console.log('    DEAD  ' + q + '   now returns ' + id + ' — drop its note, it exempts nothing');
}
console.log('\n' + (bad ? bad + ' queries did not find their own food' : 'every query found its own food'));
process.exit(bad ? 1 : 0);
