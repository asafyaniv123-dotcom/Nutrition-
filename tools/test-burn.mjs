// THE BURN ESTIMATE'S ARITHMETIC, lifted out of the shipped file.
//
// A screenshot proves the band is on the screen. It cannot prove that 505 is
// the right answer for an hour of hard work at 80 kg, and that is the whole
// substance of the change - so the two functions that decide it are read out
// of dev/index.html and run against figures worked out by hand.
//
// The formula is the compendium's own: MET x 3.5 x kg / 200 kcal a minute.
// One MET is 3.5 ml of oxygen per kilo per minute and a litre of oxygen is
// about 5 kcal, which is where the 200 comes from (1000 / 5).
//
//     node tools/test-burn.mjs [dev/index.html]
//
// Exits non-zero on any disagreement. A check that has never caught anything
// has not been tested, so: against the shipped file it reports 0, and against
// a copy with the divisor changed from 200 to 100 it reports 3.
import fs from 'fs';

const SRC = process.argv[2] || 'dev/index.html';
const s = fs.readFileSync(SRC, 'utf8');

/* Lift, rather than re-implement. A second copy of the arithmetic would pass
   this test while the app did something else. */
function lift(name) {
  const at = s.indexOf('function ' + name + '(');
  if (at < 0) { console.error('ABORT: ' + name + ' is not in ' + SRC); process.exit(1); }
  /* brace matching from the first { after the signature */
  let i = s.indexOf('{', at), d = 0, j = i;
  for (; j < s.length; j++) {
    if (s[j] === '{') d++;
    else if (s[j] === '}') { d--; if (!d) break; }
  }
  return s.slice(at, j + 1);
}

/* fitBurn reaches for fitBodyKg, fitMET and loadProfile; the first two are
   lifted with it and loadProfile is the seam the test drives. */
const KG = { v: 80 };
const sandbox = new Function('loadProfile',
  lift('fitBodyKg') + '\n' + lift('fitMET') + '\n' + lift('fitBurn') + '\n' +
  'return {fitBurn:fitBurn,fitMET:fitMET,fitBodyKg:fitBodyKg};')(
  () => ({ weight: KG.v }));

const { fitBurn, fitMET, fitBodyKg } = sandbox;

let fails = 0;
const eq = (what, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fails++;
  console.log((ok ? '  ok   ' : '  FAIL ') + what +
    (ok ? '' : '   got ' + JSON.stringify(got) + ', wanted ' + JSON.stringify(want)));
};

/* a session of n sets, all at the same rpe */
const W = (n, rpe, duration) => ({
  duration,
  exercises: [{ sets: Array.from({ length: n }, () => ({ weight: 50, reps: 8, rpe })) }]
});

console.log('the MET comes from the effort, and the compendium has three:');
eq('nothing rated is the middle one', fitMET(null), 5);
eq('rpe 5 is light',                  fitMET(5),    3.5);
eq('rpe 6 is moderate',               fitMET(6),    5);
eq('rpe 7.4 is still moderate',       fitMET(7.4),  5);
eq('rpe 7.5 is vigorous',             fitMET(7.5),  6);
eq('rpe 10 is no more than vigorous', fitMET(10),   6);

console.log('\nand the kcal are MET x 3.5 x kg / 200 x minutes, to the nearest five:');
/* 6 x 3.5 x 80 / 200 = 8.4 kcal a minute; x 60 = 504 -> 505 */
KG.v = 80; eq('80 kg, 60 min, rpe 8',  fitBurn(W(12, 8, 60)).kcal,   505);
/* 5 x 3.5 x 70 / 200 = 6.125; x 45 = 275.625 -> 275 */
KG.v = 70; eq('70 kg, 45 min, rpe 7',  fitBurn(W(12, 7, 45)).kcal,   275);
/* 3.5 x 3.5 x 60 / 200 = 3.675; x 30 = 110.25 -> 110 */
KG.v = 60; eq('60 kg, 30 min, rpe 5',  fitBurn(W(9, 5, 30)).kcal,    110);

console.log('\nthe minutes are the clock’s, and the clock is not always there:');
KG.v = 80;
/* no duration at all: three minutes a set, which is a working set and its rest */
eq('no clock, 12 sets, becomes 36 min', fitBurn(W(12, 8, 0)).min,  36);
eq('and the same with no field at all', fitBurn({exercises:W(12,8,0).exercises}).min, 36);
/* left open overnight */
eq('nine hours is capped at 180',       fitBurn(W(12, 8, 540)).min, 180);
eq('an honest 95 minutes is 95',        fitBurn(W(20, 8, 95)).min,  95);

console.log('\nand there is no estimate where there is nothing to estimate from:');
eq('no sets, no number',   fitBurn(W(0, 8, 60)), null);
eq('no entry, no number',  fitBurn(null),        null);
KG.v = 0;   eq('no body weight on file', fitBurn(W(12, 8, 60)), null);
KG.v = -3;  eq('a negative weight',      fitBodyKg(),           0);
KG.v = 900; eq('a weight in pounds, by mistake', fitBodyKg(),   0);
KG.v = '72.5'; eq('a weight stored as text', fitBodyKg(),       72.5);

console.log('\nthe effort is an AVERAGE, and unrated sets do not vote:');
KG.v = 80;
const mixed = { duration: 60, exercises: [{ sets: [
  { rpe: 9 }, { rpe: 9 }, { rpe: null }, { rpe: null }
] }] };
/* 9 and 9 average 9 -> vigorous, and the two unrated ones stay out of it */
eq('two at 9 and two unrated is vigorous', fitBurn(mixed).met, 6);
const none = { duration: 60, exercises: [{ sets: [{}, {}, {}] }] };
eq('none rated at all is the middle MET',  fitBurn(none).met,  5);

console.log('\n' + (fails ? fails + ' disagreement(s)' : 'every figure agrees'));
process.exit(fails ? 1 : 0);
