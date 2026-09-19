/* A remembered answer is still an answer, and it is checked like one.
 *
 *     node tools/test-cache-guards.mjs [path/to/index.html]
 *
 * "חצי סקופ אבקת חלבון (סקופ זה 25)" kept showing אבקת אפיה — 10 kcal for
 * half a scoop — on a phone, after the guard that refuses exactly that had
 * shipped and been measured correct. Every stage of the code was right:
 *
 *     /parse        -> "אבקת חלבון", 0.5 unit
 *     local scorer  -> אבקת חלבון בטעם וניל, אול אין  [388k 75.8p]
 *     אבקת אפיה     -> sayWrongKind REFUSES it, score -1
 *     /match        -> תמ"י הדסה Whey, חלבון מי גבינה, אבקה  [393k 75p]
 *
 * The cache was serving it. sayResolveAI read it and returned on its FIRST
 * line — before the scorer, before /match, before every guard — so a wrong
 * answer learned once outlived every fix made to stop it. That is the failure
 * the comment above MATCH_GEN predicted word for word.
 *
 * Finding it led to the bigger one: THE MODEL'S PICK WASN'T FULLY GUARDED
 * EITHER. That branch ran sayDerivedUnasked and the concentrate guard and
 * never sayWrongKind, so a pick of אבקת אפיה would have been taken as
 * written. It does not pick that today, which is exactly why a test is worth
 * more here than a measurement: the measurement says what the model did once.
 *
 * Three ways into a row, one of them guarded. All three now go through
 * sayGuarded, and this drives each of them:
 *
 *   A POISONED CACHE ENTRY is refused, and DROPPED so it cannot come back.
 *   A POISONED MODEL PICK is refused and reaches the estimate.
 *   A GOOD ENTRY still short-circuits, because the cache is the reason this
 *   app resolves a repeat food with no network at all.
 */
import fs from 'fs';
import vm from 'vm';

const FILE = process.argv[2] || 'dev/index.html';
const src = fs.readFileSync(FILE, 'utf8');
const lift = (a, b) => {
  const i = src.indexOf(a), j = src.indexOf(b, i);
  if (i < 0 || j < 0) throw new Error('could not lift ' + a);
  return src.slice(i, j);
};
const trimComment = (t) => t.slice(0, t.lastIndexOf('/*'));

/* Lifted, not restated — the thing under test has to be the thing that
   ships, and the guards are the point of the whole file.
   ONE contiguous range through the say block, rather than two that skip the
   middle: sayResolveAI, the cache and sayGuarded all live in the gap a split
   lift leaves out. Four harnesses in this directory were broken that exact
   way this morning, and the first draft of this one made it a fifth. */
const code =
  lift('function foodName(f){', 'function foodsLoad(then){') +
  '\n' + trimComment(lift('var FOOD_STOP=', 'SCANNING A BARCODE')) +
  '\n' + lift('function sayCandidates(q,n){', 'function sayAmount(row){');

const rows = [];
for (const f of ['data/foods.core.json', 'data/foods.json', 'data/foods.off.json']) {
  if (!fs.existsSync(f)) continue;
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const r of (Array.isArray(j) ? j : (j.foods || Object.values(j)[0]))) rows.push(r);
}

/* the stores and the network, so the real sayResolveAI can run */
let CACHE = {};
let asked = 0, sent = null;
const ctx = {
  _foods: null, console,
  langOn: (fn) => fn(), _t: (s) => s,
  foodUnitRec: () => ({ w: {} }), unitWeightFor: () => 0,
  GSRC_SAY: {}, SYNC_SERVER: 'http://x', appLang: () => 'he',
  picLabelOverlay: () => {}, saySaidFrom: () => null,
  setTimeout, clearTimeout,
  localStorage: {
    getItem: () => JSON.stringify(CACHE),
    setItem: (k, v) => { CACHE = JSON.parse(v); },
    removeItem: () => {},
  },
  fetch: (u, o) => {
    asked++;
    sent = JSON.parse(o.body);
    return Promise.resolve({ json: () => Promise.resolve(REPLY) });
  },
};
let REPLY = { ok: true, pick: -1, picks: [], sure: false };
vm.createContext(ctx);
vm.runInContext(code, ctx);
ctx._foods = rows.map((r, k) => Object.assign({}, r, { i: k }));
vm.runInContext('for(var z=0;z<_foods.length;z++){var f=_foods[z];if(f.t){f.n=foodName(f);' +
  'f.alt=foodAlt(f);if(typeof foodNames==="function")f.na=foodNames(f);}f.s=foodKey(f.n||"");}', ctx);

const fails = [];
const ok = (c, w) => { console.log((c ? '  ok   ' : '  FAIL ') + w); if (!c) fails.push(w); };
const resolve = (food, unit) => new Promise((done) => {
  ctx.__done = done;
  vm.runInContext('sayResolveAI(' + JSON.stringify({ food, amount: 0.5, unit: unit || 'unit' }) +
    ',function(r){__done(r);})', ctx);
});
const Q = 'אבקת חלבון';
const key = vm.runInContext('foodKey(' + JSON.stringify(Q) + ')', ctx);

/* The row that was actually being shown. Read out of the tables rather than
   invented, so if it ever stops being a zero-protein baking product this
   test says so instead of quietly testing nothing. */
const BAKING = ctx._foods.find((f) => f.n === 'אבקת אפיה');
console.log('the row that was being served');
ok(!!BAKING, 'אבקת אפיה is in the tables');
ok(BAKING && (+BAKING.p || 0) === 0, 'and holds no protein at all (' + (BAKING && BAKING.p) + 'p)');
ok(vm.runInContext('sayWrongKind(' + JSON.stringify(BAKING) + ',' + JSON.stringify(key) + ')', ctx) === true,
   'so sayWrongKind refuses it for this question');

console.log('');
console.log('a poisoned cache entry does not outlive the guard');
CACHE = {}; CACHE[key] = { n: 'אבקת אפיה', g: 25, s: true };
asked = 0;
let row = await resolve(Q);
ok(row.food && row.food.n !== 'אבקת אפיה',
   'the remembered answer is refused (got ' + (row.food && row.food.n) + ')');
ok(row.food && (+row.food.p || 0) >= 20,
   'and what is shown actually holds protein (' + (row.food && row.food.p) + 'p)');
/* Not merely overridden. The guard comes back with the local pick, which is
   an answer — so if the stored entry were left alone the override would run
   again on every read for ever, and אבקת אפיה would still be sitting on the
   phone for any future reader to believe. */
ok(CACHE[key] && CACHE[key].n !== 'אבקת אפיה',
   'and the cache LEARNS the correction (now ' + (CACHE[key] && CACHE[key].n) + ')');
asked = 0;
const again = await resolve(Q);
ok(asked === 0 && again.food && again.food.n === row.food.n,
   'so the next read is a clean hit needing no override at all');

console.log('');
console.log('a good entry still answers with no network at all');
CACHE = {}; CACHE[key] = { n: 'אבקת חלבון בטעם וניל, אול אין', g: 30, s: true };
asked = 0;
row = await resolve(Q);
ok(row.food && row.food.n === 'אבקת חלבון בטעם וניל, אול אין',
   'the remembered answer stands (got ' + (row.food && row.food.n) + ')');
ok(asked === 0, 'and nothing was asked over the wire (' + asked + ' calls)');
ok(row.g === 30, 'with the weight it remembered (' + row.g + ')');

console.log('');
console.log("a poisoned pick from the model is refused too");
/* The model has not returned this since the prompt was fixed. It returned
   exactly this once, which is why the guard exists and why a test is worth
   more here than another measurement. */
CACHE = {};
const cands = vm.runInContext('sayCandidates(' + JSON.stringify(Q) + ',60)', ctx);
let at = cands.findIndex((f) => f.n === 'אבקת אפיה');
if (at < 0) {
  /* not in this query's sixty, so aim the pick at the worst row that IS */
  at = cands.findIndex((f) => (+f.p || 0) < 20);
}
ok(at >= 0, 'a row the guard must refuse is in the list at ' + at + ' (' + (cands[at] && cands[at].n) + ')');
REPLY = { ok: true, pick: at, picks: [at], grams: 25, sure: true,
          est: { per100: { kcal: 380, p: 75, c: 8, f: 5 }, serving_g: 30, assumed: 'סקופ אבקת חלבון' } };
row = await resolve(Q);
ok(!row.food || row.food.n !== (cands[at] && cands[at].n),
   'the model\'s pick does not stand (got ' + (row.food && row.food.n) + ')');
ok(!(row.food && (+row.food.p || 0) < 20),
   'nothing with less than 20 g of protein is shown for a protein powder');

console.log('');
console.log('and the generation moved, which is what reaches a phone today');
ok(/var MATCH_GEN=3;/.test(src), 'MATCH_GEN is 3');
ok(/BUMP THIS whenever matching changes/.test(src), 'and the rule saying why is still written down');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('the cache answers to the guards, and so does the model');
