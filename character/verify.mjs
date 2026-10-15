// Is the working character still the character we approved?
//
// WHY THIS EXISTS. make-faces.mjs overwrote dev/assets/sun-body.png and every
// page that draws it silently started showing a worse face - including one that
// had already been approved. Nothing shouted. He found it himself, days of work
// later, by reopening a page he trusted.
//
// Two different questions, because they fail differently:
//
//   IDENTICAL   are the working files byte-for-byte the master's? This catches
//               a file being replaced, which is what actually happened.
//   FAITHFUL    do the four layers still composite back into the source render?
//               This catches a file being EDITED rather than replaced - the
//               same bytes count, a different picture.
//
//     node character/verify.mjs          check
//     node character/verify.mjs --fix    copy the master back over the working
//                                        files and check again
import fs from 'node:fs';
import crypto from 'node:crypto';
import { decode } from '../dev/look/png-pixel.mjs';

const ROOT   = 'C:/Projects/Nutrition-/';
const MASTER = ROOT + 'character/layers/';
const LIVE   = ROOT + 'dev/assets/';
const SOURCE = ROOT + 'character/sun-source.png';
const LAYERS = ['sun-body','sun-r1','sun-r2','sun-r3'];
const FIX    = process.argv.includes('--fix');

const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex').slice(0,12);
let bad = 0;

if (FIX) {
  LAYERS.forEach(n => fs.copyFileSync(MASTER + n + '.png', LIVE + n + '.png'));
  console.log('restored ' + LAYERS.length + ' layers from character/layers/\n');
}

console.log('1. are the working files the master, byte for byte?');
LAYERS.forEach(function(n){
  const m = MASTER + n + '.png', l = LIVE + n + '.png';
  if (!fs.existsSync(l)) { console.log('  MISSING  ' + n + '.png'); bad++; return; }
  const a = sha(m), b = sha(l);
  console.log('  ' + (a === b ? 'ok      ' : 'CHANGED ') + (n + '.png').padEnd(15) +
    a + (a === b ? '' : '  vs  ' + b));
  if (a !== b) bad++;
});

console.log('\n2. do the four layers still composite into the source render?');
const src = decode(SOURCE);
const L = LAYERS.map(n => decode(MASTER + n + '.png'));
const S = L[0].w, SC = src.w / S;
let sum = 0, n = 0, worst = 0;
for (let y = 0; y < S; y += 2)
  for (let x = 0; x < S; x += 2){
    let r=0,g=0,b=0,a=0;
    for (let i = 3; i >= 0; i--){
      const p = L[i].at(x,y), pa = p[3]/255;
      r = p[0]*pa + r*(1-pa); g = p[1]*pa + g*(1-pa);
      b = p[2]*pa + b*(1-pa); a = pa + a*(1-pa);
    }
    let R=0,G=0,B=0,A=0,k=0;
    for (let sy = y*SC|0; sy < (y+1)*SC; sy++)
      for (let sx = x*SC|0; sx < (x+1)*SC; sx++){
        const q = src.at(sx,sy); R+=q[0]*q[3]; G+=q[1]*q[3]; B+=q[2]*q[3]; A+=q[3]; k++;
      }
    const aa = A/k/255;
    if (aa < 0.08 && a < 0.08) continue;
    /* compare STRAIGHT colour on both sides. Comparing a composite-over-black
       against an un-premultiplied average is what made the first version of
       this report 75/255 and 'they differ' on files that were perfect. */
    const cr = a ? r/a : 0, cg = a ? g/a : 0, cb = a ? b/a : 0;
    const rr = A ? R/A : 0, gg = A ? G/A : 0, bb = A ? B/A : 0;
    const d = Math.max(Math.abs(cr-rr), Math.abs(cg-gg), Math.abs(cb-bb), Math.abs(a-aa)*255);
    sum += d; n++; if (d > worst) worst = d;
  }
const mean = sum/n;
console.log('  mean difference  ' + mean.toFixed(2) + ' / 255   (worst ' + worst.toFixed(0) + ')');
if (mean > 4){ console.log('  THE LAYERS NO LONGER MAKE THE SOURCE'); bad++; }
else console.log('  ok - the layers are still the source, cut into four');

console.log('\n' + (bad ? bad + ' PROBLEM(S). Run with --fix to restore.'
                        : 'the working character is the approved one.'));
process.exit(bad ? 1 : 0);
