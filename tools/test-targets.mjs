// THE DAILY TARGET'S ARITHMETIC, lifted out of the shipped file.
//
// Asaf was handed 2,705 kcal on 1 Nov 2026 - his maintenance, with no deficit
// for his goal, and his workouts counted twice: once every day inside the
// activity factor and again on the day by the activity bonus. The fix is in
// nutriCalc, and this runs nutriCalc itself (and the goal/target-weight
// rules and the adjustment offer) against figures worked out by hand:
//
//   BMR, Mifflin-St Jeor: 10w + 6.25h - 5age + 5 (man) / - 161 (woman)
//   maintenance = BMR x 1.4 / 1.5 / 1.6 for a regular day with NO training
//   cut -10/-15/-20 % by pace, maintain 0, build +10 %; floor 1,500 / 1,200
//   protein 2.2 g/kg on a cut, 1.8 otherwise; fat 0.9 g/kg, >= 20 % of kcal;
//   above BMI 27 both from the weight at BMI 25; carbs the rest
//   kcal to 10, grams to 5
//
//     node tools/test-targets.mjs [dev/index.html]
//
// "About" means one rounding step: 10 kcal, 5 g. Exits non-zero on any
// disagreement. Pointed at a file that has no nutriCalc (HEAD before the fix)
// it runs the OLD profileTargets on the same people, so the failure is a
// number and not just a missing function.
import fs from 'fs';
import { reader } from './lift.mjs';

const FILE = process.argv[2] || 'dev/index.html';
const { src, lift, liftVar } = reader(FILE);

let fails = 0;
const ok = (c, what) => { if (!c) fails++; console.log((c ? '  ok   ' : '  FAIL ') + what); };
const near = (got, want, tol, what) => ok(typeof got === 'number' && Math.abs(got - want) <= tol, what + ': ' + got + ' (about ' + want + ')');

const CASES = [
  { name: 'man, 25, 173 cm, 68 kg, moving part of the day, cut regular',
    x: { sex: 'm', age: 25, h: 173, w: 68, day: 'part', goal: 'lose', pace: 'regular' }, old: 3,
    want: { bmr: 1640, maint: 2460, kcal: 2090, p: 150, f: 60, c: 235 } },
  { name: 'woman, 30, 165 cm, 65 kg, mostly sitting, cut regular',
    x: { sex: 'f', age: 30, h: 165, w: 65, day: 'sit', goal: 'lose', pace: 'regular' }, old: 1,
    want: { bmr: 1370, maint: 1920, kcal: 1630, p: 145, f: 60, c: 130 } },
];

if (!src.includes('\nfunction nutriCalc(')) {
  /* ── THE FILE BEFORE THE FIX ── the same people through the old code. Its
     activity rung stands in for the day type (3 = "3-4 workouts a week",
     1 = "a sitting day, no workouts"), which is exactly the confusion. */
  console.log('no nutriCalc in ' + FILE + ' - running its profileTargets instead\n');
  const goals = /var GOALS;langOn\(function\(\)\{GOALS=\[[\s\S]*?\];\}\);/.exec(src)[0];
  const NOW = new Date(2026, 10, 1, 12);
  const T = new Function('_t', 'langOn', 'appNow',
    liftVar('FQ_ORDER') + '\n' + goals + '\n' + liftVar('ACT_FACTOR') + '\n' + liftVar('FLOOR_KCAL') + '\n' +
    liftVar('PROT_PER_KG') + '\n' + liftVar('PROT_MIN') + '\n' + lift('goalDef') + '\n' + lift('fqHas') + '\n' +
    lift('profileAge') + '\n' + lift('profileTargets') + '\nreturn profileTargets;')((s) => s, (f) => f(), () => NOW);
  const prof = (x, act) => ({ sex: x.sex, birth: (2026 - x.age) + '-01-01', height: x.h, weight: x.w, activity: act, goal: x.goal });
  for (const C of CASES) {
    console.log(C.name + ' (old activity level ' + C.old + ')');
    const r = T(prof(C.x, C.old));
    near(r && r.kcal, C.want.kcal, 10, 'target kcal');
    near(r && r.p, C.want.p, 5, 'protein g');
    near(r && r.c, C.want.c, 5, 'carbs g');
  }
  console.log('man, 40, 180 cm, 110 kg, cut regular');
  near((T(prof({ sex: 'm', age: 40, h: 180, w: 110, goal: 'lose' }, 3)) || {}).p, 180, 5, 'protein from the BMI-25 weight');
  console.log('a 16-year-old choosing a cut');
  const y = T(prof({ sex: 'm', age: 16, h: 175, w: 70, goal: 'lose' }, 3));
  ok(y && y.kcal >= y.tdee - 10, 'no deficit for a 16-year-old (old target ' + (y && y.kcal) + ' against maintenance ' + (y && y.tdee) + ')');
  console.log('a goal weight of 50 kg at 170 cm');
  ok(false, 'refused - the old file has no rule about a goal weight at all');
  console.log('\n' + fails + ' failed');
  process.exit(fails ? 1 : 0);
}

const N = new Function(
  liftVar('DAY_FACTOR') + '\n' + liftVar('PACE_CUT') + '\n' + liftVar('FLOOR_KCAL') + '\n' + liftVar('EWMA_ALPHA') + '\n' +
  lift('nutriGoalsFor') + '\n' + lift('nutriTargetOk') + '\n' + lift('nutriCalc') + '\n' +
  lift('dayAdd') + '\n' + lift('weighDays') + '\n' + lift('ewma') + '\n' + lift('trendRate') + '\n' + lift('nqAdjCalc') + '\n' +
  'return {nutriGoalsFor,nutriTargetOk,nutriCalc,nqAdjCalc,DAY_FACTOR};')();

for (const C of CASES) {
  console.log(C.name);
  const r = N.nutriCalc(C.x);
  near(r && r.bmr, C.want.bmr, 5, 'BMR');
  near(r && r.maint, C.want.maint, 10, 'maintenance');
  near(r && r.kcal, C.want.kcal, 10, 'target kcal');
  near(r && r.p, C.want.p, 5, 'protein g');
  near(r && r.f, C.want.f, 5, 'fat g');
  near(r && r.c, C.want.c, 5, 'carbs g');
  ok(r && Math.abs(r.p * 4 + r.f * 9 + r.c * 4 - r.kcal) <= 20, 'the macros add back up to the target (' + (r.p * 4 + r.f * 9 + r.c * 4) + ' vs ' + r.kcal + ')');
}

console.log('man, 40, 180 cm, 110 kg, cut regular');
const big = N.nutriCalc({ sex: 'm', age: 40, h: 180, w: 110, day: 'part', goal: 'lose', pace: 'regular' });
near(big.basis, 81, 0.5, 'protein and fat worked from the weight at BMI 25');
near(big.p, 180, 5, 'protein g, not 240');
ok(big.lean === true, 'and the screen is told why');

console.log('a 16-year-old choosing a cut');
ok(N.nutriGoalsFor(16, 22, false).goals.indexOf('lose') < 0, 'the cut is not offered: ' + N.nutriGoalsFor(16, 22, false).goals.join(', '));
ok(N.nutriGoalsFor(16, 22, false).goals.join() === 'keep', 'only maintaining is');
const teen = N.nutriCalc({ sex: 'm', age: 16, h: 175, w: 70, day: 'part', goal: 'lose', pace: 'fast' });
ok(teen.goal === 'keep' && teen.block === 'minor' && teen.kcal === Math.round(teen.maint / 10) * 10, 'a stored cut is answered with maintenance, and the reason (' + teen.kcal + ', ' + teen.block + ')');

console.log('a goal weight of 50 kg for a woman of 170 cm');
ok(N.nutriTargetOk(170, 50) === false, 'refused (BMI ' + (50 / 1.7 / 1.7).toFixed(1) + ')');
ok(N.nutriTargetOk(170, 54) === true, 'and 54 kg is accepted (BMI ' + (54 / 1.7 / 1.7).toFixed(1) + ')');

console.log('the other rules');
ok(N.nutriGoalsFor(30, 18, false).goals.join() === 'keep,gain', 'BMI under 18.5: maintain or build');
ok(N.nutriGoalsFor(30, 24, true).goals.join() === 'keep', 'pregnant or breastfeeding: maintain only');
const preg = N.nutriCalc({ sex: 'f', age: 30, h: 165, w: 65, day: 'sit', goal: 'lose', preg: true });
ok(preg.goal === 'keep' && preg.block === 'preg', 'and a stored cut becomes maintenance with the reason');
const tiny = N.nutriCalc({ sex: 'f', age: 75, h: 150, w: 45, day: 'sit', goal: 'lose', pace: 'fast' });
ok(tiny.kcal === 1200 && tiny.floored, 'a woman is never under 1,200 kcal, and is told (' + tiny.kcal + ')');
ok(Math.max(...Object.values(N.DAY_FACTOR)) <= 1.6, 'no day type is a training factor (highest ' + Math.max(...Object.values(N.DAY_FACTOR)) + ')');
const g = N.nutriCalc({ sex: 'm', age: 25, h: 173, w: 68, day: 'part', goal: 'gain' });
near(g.kcal, 2710, 10, 'building adds 10 %');
const one = N.nutriCalc({ sex: 'm', age: 25, h: 173, w: 68, day: 'part', goal: 'lose', pace: 'regular', tw: 63 });
near(one.kgWeek, 0.336, 0.005, 'kilos a week = deficit x 7 / 7700');
ok(one.weeks === 15, 'about 15 weeks from 68 to 63 kg (' + one.weeks + ')');
const adj = N.nutriCalc({ sex: 'm', age: 25, h: 173, w: 68, day: 'part', goal: 'lose', pace: 'regular', adj: -150 });
ok(adj.kcal === 1940 && adj.kgWeek === one.kgWeek, 'an accepted adjustment moves the target, not the plan\'s expected pace');

console.log('the adjustment offer (trend engine, three weeks)');
const days = (n, f) => Array.from({ length: n }, (_, i) => { const d = new Date(2026, 9, 1 + i, 12);
  return { d: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'), v: f(i) }; });
const noise = (i) => [0.4, -0.3, 0.1, -0.5, 0.3, 0, -0.2][i % 7];
const flat = days(28, (i) => 70 + noise(i));
const o1 = N.nqAdjCalc(flat, flat[27].d, '0000', -0.336, 2090, 1500);
ok(o1 && o1.n === -150, 'not losing while a loss of 0.34 kg a week was expected: offer 150 less (' + JSON.stringify(o1) + ')');
const onTrack = days(28, (i) => 70 - 0.048 * i + noise(i));
ok(N.nqAdjCalc(onTrack, onTrack[27].d, '0000', -0.336, 2090, 1500) === null, 'on track: no offer');
ok(N.nqAdjCalc(flat, flat[27].d, flat[14].d, -0.336, 2090, 1500) === null, 'counted from a refusal two weeks ago: not yet');
ok(N.nqAdjCalc(flat.slice(0, 18), flat[17].d, '0000', -0.336, 2090, 1500) === null, 'under three weeks of weigh-ins: no offer');
const fast = days(28, (i) => 70 - 0.15 * i + noise(i));
const o2 = N.nqAdjCalc(fast, fast[27].d, '0000', -0.336, 2090, 1500);
ok(o2 && o2.n > 0 && o2.n <= 150 && o2.n >= 100, 'losing a kilo a week against 0.34 expected: offer more (' + JSON.stringify(o2) + ')');
ok(N.nqAdjCalc(flat, flat[27].d, '0000', -0.336, 1250, 1200) === null, 'never offered below the floor');

console.log('\n' + fails + ' failed');
process.exit(fails ? 1 : 0);
