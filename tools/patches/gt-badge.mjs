// node tools/patches/gt-badge.mjs <index.html> [--undo] - the DEV badge sits at the bottom corner over every screen, and on the clock
//   that corner is "+10 seconds" (found on 20 Nov by a real tap that landed on the badge). It steps aside while the full-screen
//   clock or the page before it is open - !important, because the badge carries display:flex inline and an inline style beats a rule. The badge exists only in dev, so in the stable app the rule matches nothing.
import fs from 'node:fs';
const F = process.argv[2], undo = process.argv.includes('--undo');
const E = [
  ["  document.addEventListener('DOMContentLoaded',function(){\n    var b=document.createElement('div');\n",
   "  document.addEventListener('DOMContentLoaded',function(){\n    var b=document.createElement('div');\n    b.id='dev-badge';\n"],
  ['.wtr,.wtp{--nu-ground:#e9e7e3;',
   '/* the dev badge steps aside while the clock fills the screen: it sat on "+10" */\nbody:has(.wtr) #dev-badge{display:none!important}\n.wtr,.wtp{--nu-ground:#e9e7e3;'],
];
let s = fs.readFileSync(F, 'utf8');
for (const [o, n] of undo ? E.slice().reverse() : E) {
  const [a, b] = undo ? [n, o] : [o, n], c = s.split(a).length - 1;
  if (c !== 1) throw new Error(`expected 1 of ${JSON.stringify(a.slice(0, 60))}, found ${c}`);
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s); console.log(undo ? 'undone' : 'applied', E.length);
