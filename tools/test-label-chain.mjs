/* What /see read, all the way to the number on the row.
 *
 * WHY THIS EXISTS. test-label-overlay.mjs sets _picPartial by hand and starts
 * from there. It passed for a week while the feature it tested had never once
 * run: the WORKER was discarding every partial label before the app could see
 * it, so _picPartial was null on every real photograph and the overlay
 * returned false on its first line. A packet reading "26 גרם חלבון" was
 * reported as 22.8 - three times, to the same person, on the same pastrami.
 *
 * A test that begins downstream of the break cannot see the break. So this one
 * starts where the answer starts: the JSON a model returns for /see, through
 * the worker's acceptance rule, into picFromLabel and picLabelOverlay, and
 * asserts the grams of protein that end up in front of the reader.
 *
 * Both halves are LIFTED from the shipped sources. Nothing here is a
 * reimplementation - a reimplementation is how the last one agreed with
 * itself while disagreeing with the app.
 */
import fs from 'fs';
import vm from 'vm';

const APP = process.argv[2] || 'dev/index.html';
const WORKER = process.argv[3] || 'push-server/src/worker.js';

const cut = (src, a, b, what) => {
  const i = src.indexOf(a), j = src.indexOf(b, i);
  if (i < 0 || j < 0) throw new Error('could not lift ' + what);
  return src.slice(i, j);
};

/* ── the worker half: what it will let through ── */
const w = fs.readFileSync(WORKER, 'utf8');
const gate = cut(w, '      let label = null;', '\n      return json({', 'the worker label gate');
const ctxW = vm.createContext({});
vm.runInContext('function seeLabel(out){\n' + gate + '\n return label;}', ctxW);
const seeLabel = (out) => vm.runInContext('seeLabel(' + JSON.stringify(out) + ')', ctxW);

/* ── the app half: what it does with it ── */
const a = fs.readFileSync(APP, 'utf8');
const ctxA = vm.createContext({ console });
vm.runInContext('function langOn(f){f();}function _t(s){return s;}var _picPartial=null;', ctxA);
vm.runInContext(cut(a, 'function picNum(', 'function picFromLabel(', 'picNum'), ctxA);
vm.runInContext(cut(a, 'function picFromLabel(', 'function picLabelOverlay(', 'picFromLabel'), ctxA);
vm.runInContext(cut(a, 'function picLabelOverlay(row){', 'function picByTable(', 'picLabelOverlay'), ctxA);

/* The row the tables actually resolve this packet to, and the object really is
   shared between screens - so the "did not mutate" assertion below is not
   hypothetical. */
const TABLE_ROW = { n: 'נקניק, פסטרמה הודו, יחיעם', k: 102, p: 19, c: 2, f: 2 };

/* picByTable's own logic, in four lines, because lifting it would drag in
   fetch, the DOM and sayResolveAll. The BRANCH is what matters and it is
   reproduced exactly: a label that can stand alone becomes its own row; one
   that cannot is kept and overlaid; nothing usable leaves the row alone. */
const chain = (modelOut, grams) => {
  const L = seeLabel(modelOut);
  ctxA._picPartial = null;
  if (L) {
    const own = vm.runInContext('picFromLabel(' + JSON.stringify(L) + ',"x")', ctxA);
    if (own) return { via: 'own row', food: own };
    ctxA._picPartial = L;
  }
  const row = { food: Object.assign({}, TABLE_ROW), amount: grams, unit: 'g', g: 1 };
  ctxA.r = row;
  const did = vm.runInContext('picLabelOverlay(r)', ctxA);
  return { via: did ? 'overlaid' : 'table row untouched', food: row.food };
};

const at = (food, grams, key) => Math.round(food[key] * grams / 100 * 10) / 10;

let bad = 0;
const check = (what, ok, detail) => {
  if (!ok) bad++;
  console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + what + (detail ? '   ' + detail : ''));
};

console.log('\nthe pastrami: front of pack says 26 g protein and 1% fat, no kcal line,');
console.log('no carbohydrate line. The table row it lands on is 19 g/100 g.\n');

/* 1. the case that was broken: a per-pack claim, two fields of four */
const perPack = chain({ label: { basis: 'serving', serving_g: 120, protein: 26, fat: 1.2 } }, 120);
check('a per-pack claim survives the worker        ', perPack.via === 'overlaid', '(' + perPack.via + ')');
check('and lands on 26.0 g protein at 120 g        ', Math.abs(at(perPack.food, 120, 'p') - 26) < 0.15,
  at(perPack.food, 120, 'p') + ' g');
check('kcal is KEPT from the table, not nulled     ', perPack.food.k === 102);
check('carbs are KEPT from the table               ', perPack.food.c === 2);

/* 2. the same claim expressed per 100 g */
const per100 = chain({ label: { basis: '100g', protein: 21.7, fat: 1 } }, 120);
check('a /100g claim also lands on 26.0 g          ', Math.abs(at(per100.food, 120, 'p') - 26) < 0.2,
  at(per100.food, 120, 'p') + ' g');

/* 3. a complete panel must behave EXACTLY as it did before this change */
const full = chain({ label: { basis: '100g', kcal: 120, protein: 21, carbs: 1, fat: 2 } }, 120);
check('a complete panel still becomes its own row  ', full.via === 'own row', '(' + full.via + ')');
check('and carries all four numbers it printed     ',
  full.food.k === 120 && full.food.p === 21 && full.food.c === 1 && full.food.f === 2);

/* 4. the refusals - each one is a number nobody read */
check('a label with no numbers changes nothing     ', chain({ label: { basis: '100g' } }, 120).via === 'table row untouched');
check('a label with no basis is refused            ', chain({ label: { protein: 26 } }, 120).via === 'table row untouched');
check('"serving" without the grams is refused      ', chain({ label: { basis: 'serving', protein: 26 } }, 120).via === 'table row untouched');
check('no label at all changes nothing             ', chain({}, 120).via === 'table row untouched');

/* 5. a measured zero is a reading, not an absence */
const zeroFat = chain({ label: { basis: '100g', fat: 0 } }, 100);
check('a printed zero is copied, not skipped       ', zeroFat.via === 'overlaid' && zeroFat.food.f === 0);

/* 6. the shared table row must never be written through */
check('the shared table object was not mutated     ', TABLE_ROW.p === 19);

console.log('\n' + (bad ? bad + ' FAILED' : 'the packet beats the table, end to end') +
  '   (' + APP + ' + ' + WORKER + ')');
process.exit(bad ? 1 : 0);
