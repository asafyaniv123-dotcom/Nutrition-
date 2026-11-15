// node tools/sheets/pose-parity.mjs <ours.json> <ref.json> [tol=0.08] [deg=15] - Stage A Pose-Parity Check (Asaf, 15 Nov, after x175): before
//   frame 1 is shown, does it stand the way ref-start.png stands? Limb count alone passed a frame whose crossed leg came out as two legs side
//   by side, the strap on the wrong ankle and the cable cut across the standing shin.
//   Each json, read off a grid of the picture, in that picture's own pixels:
//     { "scale": 575,                                  // the figure's height (head top to sole) in that picture
//       "anchor": [x, y],                              // one fixed point of the body, the same in both (the waist centre, the seat)
//       "points": { "knee-work": [x, y], "ankle-work": [x, y], "ankle-stand": [x, y] },
//       "lines":  { "cable": [x1, y1, x2, y2] },       // a cable, a bar, a handle line: compared by angle
//       "order":  [["ankle-work", "ankle-stand", "x"]] } // which of two points is further right ("x") or lower ("y") must match
//   Every point, measured from the anchor and divided by scale, must land within tol of the reference's; every line within deg degrees;
//   every order the same way round. Any miss FAILS and frame 1 is not shown.
import fs from 'node:fs';
const [O, R, ...OPT] = process.argv.slice(2);
if (!R) { console.log('usage: pose-parity.mjs <ours.json> <ref.json> [tol=0.08] [deg=15]'); process.exit(2); }
const opt = (k, d) => +((OPT.find((o) => o.startsWith(k + '=')) || `${k}=${d}`).slice(k.length + 1));
const TOL = opt('tol', 0.08), DEG = opt('deg', 15);
const ours = JSON.parse(fs.readFileSync(O, 'utf8')), ref = JSON.parse(fs.readFileSync(R, 'utf8'));
const rel = (j, p) => [(p[0] - j.anchor[0]) / j.scale, (p[1] - j.anchor[1]) / j.scale];
const ang = ([x1, y1, x2, y2]) => Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
let bad = 0;
const say = (ok, msg) => { if (!ok) bad++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); };
for (const [k, p] of Object.entries(ref.points || {})) {
  const o = ours.points?.[k];
  if (!o) { say(false, `${k.padEnd(12)} hidden in our frame`); continue; }
  const [ox, oy] = rel(ours, o), [rx, ry] = rel(ref, p), d = Math.hypot(ox - rx, oy - ry);
  say(d <= TOL, `${k.padEnd(12)} ${d.toFixed(3)} x height from the reference (ours ${ox.toFixed(2)},${oy.toFixed(2)} ref ${rx.toFixed(2)},${ry.toFixed(2)}; max ${TOL})`);
}
for (const [k, l] of Object.entries(ref.lines || {})) {
  const o = ours.lines?.[k];
  if (!o) { say(false, `${k.padEnd(12)} missing in our frame`); continue; }
  let d = Math.abs(ang(o) - ang(l)) % 360; if (d > 180) d = 360 - d; if (d > 90) d = 180 - d; // a line has no direction
  say(d <= DEG, `${k.padEnd(12)} ${d.toFixed(0)} deg off the reference's line (max ${DEG})`);
}
for (const [a, b, axis] of ref.order || []) {
  const i = axis === 'y' ? 1 : 0, r = Math.sign(ref.points[b][i] - ref.points[a][i]);
  const o = ours.points?.[a] && ours.points?.[b] ? Math.sign(ours.points[b][i] - ours.points[a][i]) : 0;
  say(o === r, `${(a + ' / ' + b).padEnd(12)} ${axis === 'y' ? 'above/below' : 'left/right'} order ${o === r ? 'matches' : 'is reversed or lost'}`);
}
console.log(bad ? `FAIL: ${bad} check(s) - frame 1 does not stand the way the reference stands - do not show it` : 'PASS: frame 1 stands the way the reference stands');
process.exit(bad ? 1 : 0);
