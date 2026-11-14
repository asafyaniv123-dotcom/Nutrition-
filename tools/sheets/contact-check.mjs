// node tools/sheets/contact-check.mjs <start> <end> "name:x0,y0,x1,y1;name:x0,y0,x1,y1" [max=6] - does any body part that rests on the bench,
//   the pad or the floor move between frame 1 and frame 2? Boxes in 2048 coordinates of the START frame, one per contact (seat, thighs on the
//   pad, lower back, shoulders, soles...). Each box is registered on its own (foot-register.mjs: scale + shift) and the move of its centre
//   is printed; any box that moves more than max px FAILS and the exit code is 1 - the frame is not shown (Asaf, 14 Nov, after x66: the
//   bench and the shins measured 0 px while the thighs and the seat slid ~80 px into the pad; only the loop showed it).
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const [A, B, BOXES, ...OPT] = process.argv.slice(2);
if (!BOXES) { console.log('usage: contact-check.mjs <start> <end> "name:x0,y0,x1,y1;..." [max=6]'); process.exit(2); }
const MAX = +((OPT.find((o) => o.startsWith('max=')) || 'max=6').slice(4));
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
let bad = 0;
for (const item of BOXES.split(';')) {
  const [name, coords] = item.includes(':') ? item.split(':') : ['box', item];
  const [x0, y0, x1, y1] = coords.split(',').map(Number);
  const r = JSON.parse(execFileSync('node', [path.join(here, 'foot-register.mjs'), A, B, coords], { encoding: 'utf8' }).trim().split('\n').pop());
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  // a start pixel x sits at end pixel (x - tx) / s
  const dx = (cx - r.tx2048) / r.s - cx, dy = (cy - r.ty2048) / r.s - cy, d = Math.hypot(dx, dy);
  const ok = d <= MAX; if (!ok) bad++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(10)} moved ${d.toFixed(1)} px (dx ${dx.toFixed(1)}, dy ${dy.toFixed(1)}, scale ${r.s})`);
}
console.log(bad ? `FAIL: ${bad} contact(s) moved more than ${MAX} px - do not show this frame` : `PASS: every contact within ${MAX} px`);
process.exit(bad ? 1 : 0);
