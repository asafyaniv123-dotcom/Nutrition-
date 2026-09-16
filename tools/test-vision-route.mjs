/* What the app does with /vision's answer.
 *
 * The endpoint's own split is tested live by test-vision.mjs. This is the
 * other half: given that answer, does the app put the packet's numbers where
 * they belong, and does it refuse to let an estimate become a figure?
 *
 * Lifted from dev/index.html, not restated. The last time a label fix was
 * "tested", the test began downstream of the break and stayed green for a
 * week while the feature never ran once.
 */
import fs from 'fs';
import vm from 'vm';

const FILE = process.argv[2] || 'dev/index.html';
const src = fs.readFileSync(FILE, 'utf8');
const cut = (a, b) => {
  const i = src.indexOf(a), j = src.indexOf(b, i);
  if (i < 0 || j < 0) throw new Error('could not lift ' + a);
  return src.slice(i, j);
};

const ctx = vm.createContext({ console });
vm.runInContext('var _sayText="",_picNote="",_picPartial=null,SYNC_SERVER="x",appLang=function(){return "he";};function _t(s){return s;}', ctx);
vm.runInContext(cut('function picServingG(t){', '/* ── READ THE PACKET FIRST'), ctx);
vm.runInContext(cut('function picVision(dataUrl,note){', '/* The tables answer'), ctx);

let bad = 0;
const check = (what, ok, detail) => { if (!ok) bad++; console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + what + (detail ? '   ' + detail : '')); };

/* ── the serving the figures are per ── */
const g = (t) => vm.runInContext('picServingG(' + JSON.stringify(t) + ')', ctx);
console.log('\n  a reading is PER something, and that something has to be a weight\n');
check('"120g"      -> 120  ', g('120g') === 120);
check('"100 g"     -> 100  ', g('100 g') === 100);
check('"330ml"     -> 330  ', g('330ml') === 330);
check('"120 גרם"   -> 120  ', g('120 גרם') === 120);
check('"1 unit"    -> 0    ', g('1 unit') === 0, 'a count is not a weight');
check('"1 יחידה"   -> 0    ', g('1 יחידה') === 0);
check('""          -> 0    ', g('') === 0);
check('"9000g"     -> 0    ', g('9000g') === 0, 'beyond anything a person eats');

/* ── the routing ── */
let call = null;
const run = (answer) => {
  call = null;
  Object.assign(ctx, {
    fetch: () => Promise.resolve({ json: () => Promise.resolve(answer) }),
    picSee: () => { call = { to: 'picSee' }; },
    picVisionRows: (items, L) => { call = { to: 'rows', items, L }; },
  });
  vm.runInContext('picVision("data:image/jpeg;base64,AAAA","")', ctx);
  return new Promise((r) => setTimeout(() => r(call), 0));
};

console.log('\n  and what the answer is allowed to become\n');

/* the pastrami, as the live endpoint actually returned it today */
const read = await run({
  ok: true, product_name: 'פסטרמה הודו פרוסה דק', brand: 'יחיעם',
  serving: '120g', packaged: true, estimated: false,
  values: { kcal: null, p: 26, c: 0, f: 1.2, sod: 0 },
  items: [], why: 'קראתי 26 גרם חלבון',
});
check('a READ packet goes to the tables with a label', read && read.to === 'rows' && !!read.L);
check('one item, at the serving it was read per    ', read.items.length === 1 && read.items[0].amount === 120);
check('the brand is on the name                    ', /יחיעם/.test(read.items[0].food), read.items[0].food);
check('the protein it read is carried              ', read.L.p === 26);
check('a kcal it did NOT read is absent, not zero  ', read.L.kcal === undefined,
  read.L.kcal === undefined ? '(the table fills it)' : 'kcal=' + read.L.kcal);
check('a printed zero IS carried                   ', read.L.c === 0);
check('and it says what it read                    ', ctx._picNote === 'קראתי 26 גרם חלבון');

/* a plate: figures refused at the endpoint, items instead */
const plate = await run({
  ok: true, product_name: 'צלחת', brand: null, serving: '1 unit',
  packaged: false, estimated: true, values: null,
  items: [{ name: 'אורז', grams: 150 }, { name: 'חזה עוף', grams: 120 }],
  why: 'צלחת מוכנה',
});
check('an ESTIMATE carries no label at all         ', plate && plate.to === 'rows' && plate.L === null);
check('and hands over what is on the plate         ', plate.items.length === 2 && plate.items[0].amount === 150);
check('marked ai, because a weight was judged      ', plate.items[0].ai === true);

/* an estimate that smuggled figures back must still not be believed */
const smuggled = await run({
  ok: true, product_name: 'עוגה', brand: null, serving: '100g',
  packaged: false, estimated: true, values: { kcal: 400, p: 5, c: 50, f: 20, sod: 0 },
  items: [{ name: 'עוגת שוקולד', grams: 100 }], why: 'הערכה',
});
check('figures on an ESTIMATE are ignored          ', smuggled && smuggled.L === null,
  'estimated:true wins over any numbers beside it');

/* every failure shape falls back to the old path rather than dead-ending */
for (const [what, ans] of [
  ['the endpoint said no          ', { ok: false, error: 'x' }],
  ['nothing readable came back    ', { ok: true, values: null, items: [] }],
  ['the reply was not an object   ', null],
]) check('fallback to /see: ' + what, (await run(ans))?.to === 'picSee');

/* ── the product the tables have never heard of ──
   sayResolveAll does NOT answer "nothing found" with an empty list. It answers
   with a row carrying q and no food, which is what draws the red חפש tag - so
   a guard testing rows.length never saw a miss, and an Ísey Skyr read
   perfectly by /vision showed "אין פריטים שזוהו" and no numbers at all. */
vm.runInContext(cut('function picVisionRows(items,L){', 'function picSee('), ctx);
/* picFromLabel and picNum live in their own context so the stubs above cannot
   shadow them; they are lifted, not restated. */
const ctx2 = vm.createContext({ console });
vm.runInContext('function _t(s){return s;}', ctx2);
vm.runInContext(cut('function picNum(', 'function picFromLabel('), ctx2);
/* to the END of picFromLabel, not to the next name I happened to remember:
   picLabelOverlay sits 12,000 characters later with ADD_WAYS in between, and
   lifting all of it dragged in half the app. */
const fromLabel = (() => {
  const i = src.indexOf('function picFromLabel(');
  const j = src.indexOf('\r\n}', i);
  if (i < 0 || j < 0) throw new Error('could not lift picFromLabel');
  return src.slice(i, j + 3);
})();
vm.runInContext(fromLabel, ctx2);

const rowsCase = (resolved, L, amount) => {
  const seen = {};
  Object.assign(ctx, {
    foodsLoad: (fn) => fn(),
    sayResolveAll: (items, done) => done(resolved(items)),
    picExact: (row, src, g) => { seen.exact = { n: row.n, k: row.k, p: row.p, src, g }; },
    /* the real one, lifted - it is what decides that an incomplete reading
       cannot stand alone, and stubbing it would test the stub */
    picFromLabel: (L, n) => vm.runInContext(`picFromLabel(${JSON.stringify(L)},${JSON.stringify(n)})`, ctx2),
    picLabelOverlay: () => { seen.overlaid = true; return true; },
    picFail: (m) => { seen.failed = String(m).slice(0, 30); },
    sayCross: () => {}, sayPaint: () => {},
    _sayItems: null, _sayRow: 0, _picBusy: true,
  });
  vm.runInContext('picVisionRows(arg1,arg2)', Object.assign(ctx, {
    arg1: [{ food: 'Ísey Skyr', amount, unit: 'g' }], arg2: L,
  }));
  return seen;
};

const FULL = { basis: 'serving', serving_g: 100, kcal: 61, p: 11, c: 4, f: 0.2 };
const PARTIAL = { basis: 'serving', serving_g: 100, p: 11 };
const noFood = () => [{ q: 'Ísey Skyr', food: null }];
const gotFood = () => [{ q: 'Ísey Skyr', food: { n: 'יוגורט', k: 60, p: 5, c: 4, f: 2 } }];

console.log('\n  a product with no row in the tables\n');
let r = rowsCase(noFood, FULL, 170);
check('a row with NO FOOD counts as a miss         ', !!r.exact, r.exact ? '' : 'fell through to ' + (r.failed || 'nothing'));
check('a complete reading becomes a row of its own ', r.exact && r.exact.k === 61 && r.exact.p === 11);
check('tagged as coming from the label             ', r.exact && r.exact.src === 'label');
check('at the PACK weight, not the panel basis     ', r.exact && r.exact.g === 170, r.exact ? r.exact.g + ' g' : '');

r = rowsCase(noFood, PARTIAL, 170);
check('an INCOMPLETE reading does not stand alone  ', !r.exact && !!r.failed,
  'with no row underneath, an unread macro would be stored as a measured 0');

r = rowsCase(gotFood, FULL, 170);
check('a row WITH a food is still overlaid, not replaced', !!r.overlaid && !r.exact);

console.log(bad ? '\n' + bad + ' FAILED' : '\nthe packet decides, the plate does not');
process.exit(bad ? 1 : 0);

