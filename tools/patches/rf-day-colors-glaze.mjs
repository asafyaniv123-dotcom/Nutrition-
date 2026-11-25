// The day's colour (25 Nov): the calendar in Me, the summary and the binder painted the old bright lights while the
// pebble a person picks is now a glaze cut from the approved render (Asaf: "the colours don't match the calendar").
// The stored key is unchanged; only the paint is retuned, to the body of each pebble in assets/rf-glaze8.webp,
// sampled away from its highlight. usage: node tools/patches/rf-day-colors-glaze.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`var DAY_COLORS=[{k:'sun',c:'#f6c56b'},{k:'peach',c:'#f2a07e'},{k:'rose',c:'#ee8fa6'},{k:'lilac',c:'#c3a3e6'},
  {k:'sky',c:'#93b6ee'},{k:'sea',c:'#86cfd0'},{k:'leaf',c:'#9fd39b'},{k:'sand',c:'#d8c7a8'}];`,
   `/* the paint is the body of each glazed pebble in assets/rf-glaze8.webp, so the day in the calendar wears the glaze that was picked */
var DAY_COLORS=[{k:'sun',c:'#dfbc84'},{k:'peach',c:'#cb9671'},{k:'rose',c:'#c99f8f'},{k:'lilac',c:'#baa5aa'},
  {k:'sky',c:'#9caebe'},{k:'sea',c:'#8da9a4'},{k:'leaf',c:'#939e80'},{k:'sand',c:'#c8b9a2'}];`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
