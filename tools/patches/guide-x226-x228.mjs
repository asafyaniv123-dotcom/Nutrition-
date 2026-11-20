// node tools/patches/guide-x226-x228.mjs <index.html> [--undo] - the step-by-step card's rings for the power clean (x226) and the
//   snatch (x228), whose steps were written today (ex-steps-x226-x228.mjs). Each ring is [seconds, x%, y%, diameter%], read off
//   tools/sheets/guide-sheet.mjs's grid for that loop: the set-up at 0.1 s, the bar by the shins at 0.8 s, the catch at 1.6 s
//   (on the front of the shoulders / locked overhead), and standing tall in the same frame. --undo restores the file byte for byte.
import fs from 'node:fs';
const F = process.argv[2], undo = process.argv.includes('--undo');
const E = [
  [`var EX_GUIDE={
  x1:`,
   `var EX_GUIDE={
  x226:[[.1,47,45,44],[.8,55,72,36],[1.6,47,20,32],[1.6,47,55,46]],
  x228:[[.1,50,65,48],[.8,50,76,40],[1.6,50,24,44],[1.6,50,58,44]],
  x1:`],
];
let s = fs.readFileSync(F, 'utf8');
for (const [o, n] of undo ? E.slice().reverse() : E) {
  const [a, b] = undo ? [n, o] : [o, n], c = s.split(a).length - 1;
  if (c !== 1) throw new Error(`${undo ? 'undo' : 'apply'}: expected 1 of ${JSON.stringify(a.slice(0, 60))}, found ${c}`);
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(undo ? 'undone' : 'applied');
