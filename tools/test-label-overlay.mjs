/* The pastrami pack, end to end through the new overlay.
 *
 * Front of pack: "26 גרם חלבון" and "1%". No carbohydrate line, no kcal line -
 * which is exactly why the all-or-none rule threw the whole thing away and the
 * app reported the table's 22.8 instead of the packet's 26.
 *
 * Lifted and run rather than reasoned about, including the case the old rule
 * existed to prevent: a label with nothing usable must still change nothing.
 */
import fs from 'fs';
import vm from 'vm';

const src = fs.readFileSync('dev/index.html', 'utf8');
const lift = (a, b) => { const i = src.indexOf(a), j = src.indexOf(b); if (i < 0 || j < 0) throw new Error('lift ' + a); return src.slice(i, j); };

const ctx = { console };
vm.createContext(ctx);
vm.runInContext('function langOn(fn){fn();}function _t(s){return s;}', ctx);
vm.runInContext(lift('function picNum(', 'function picFromLabel('), ctx);

/* the row the app actually landed on, and the pack's own figures */
const row = {
  food: { n: 'נקניק, פסטרמה הודו, יחיעם', k: 102, p: 19, c: 2, f: 2, sod: 900 },
  amount: 120, unit: 'g', g: 1,
};
const shared = row.food;   // the same object the tables hand out

ctx.row = row;
ctx._picPartialCases = {
  /* what /see should return for this front of pack: basis 100 g, protein and
     fat stated, the other two absent */
  frontOfPack: { basis: '100g', p: 21.7, f: 1 },
  /* the pack's own per-pack claim, as a serving */
  perPack: { basis: 'serving', serving_g: 120, p: 26, f: 1.2 },
  /* and the case the old rule was written for: nothing usable at all */
  useless: { basis: '100g' },
};

const fn = lift('function picLabelOverlay(', 'function picByTable(j,items){');
vm.runInContext('var _picPartial=null;\n' + fn, ctx);

let bad = 0;
const show = (label, key) => {
  const clone = { food: shared, amount: 120, unit: 'g', g: 1 };
  ctx.r = clone;
  ctx._picPartial = ctx._picPartialCases[key];
  const did = vm.runInContext('picLabelOverlay(r)', ctx);
  const f = clone.food;
  const per = 120 / 100;
  console.log('  ' + label.padEnd(22) +
    (did ? 'applied  ' : 'no change') +
    '   at 120 g: ' + Math.round(f.k * per) + ' kcal, ' +
    (f.p * per).toFixed(1) + ' p, ' + (f.f * per).toFixed(1) + ' f');
  return { did, f };
};

console.log('the row the app landed on, untouched:');
console.log('                            120 g: ' + Math.round(102 * 1.2) + ' kcal, ' +
  (19 * 1.2).toFixed(1) + ' p, ' + (2 * 1.2).toFixed(1) + ' f   <- what he was shown\n');

const a = show('front of pack /100g', 'frontOfPack');
const b = show('per-pack claim', 'perPack');
const c = show('nothing usable', 'useless');

console.log('\nthe packet says 26 g protein and 1% fat; Gemini read 26 and 1.2\n');

const check = (what, ok) => { if (!ok) bad++; console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + what); };
check('a per-pack claim lands on 26.0 g protein', Math.abs(b.f.p * 1.2 - 26) < 0.15);
check('kcal is KEPT from the row, not nulled    ', b.f.k === 102);
check('carbs are KEPT from the row              ', b.f.c === 2);
check('a useless label changes nothing          ', c.did === false);
check('the shared table row was NOT mutated     ', shared.p === 19);

console.log(bad ? '\n' + bad + ' FAILED' : '\nall good');
process.exit(bad ? 1 : 0);
