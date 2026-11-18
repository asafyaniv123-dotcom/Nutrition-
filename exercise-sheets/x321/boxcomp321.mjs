// node boxcomp321.mjs <end-shift.png> <out.png> - x321 end (18 Nov, 0 credits, Asaf: "the box shrank and rose - put frame 1's low box and
//   floor back in the end frame"). end-shift.png is end.png moved down 49 px whole (x159/fit159.mjs 1 -49 1): that alone puts the box's front
//   face (444 px wide, 350 high in both), its bottom edge, the floor line and the shoes back on frame 1's rows - measured by colpeaks.mjs.
//   What is left is the TOP face: the end frame drew it ~19% shallower (back-left corner 390,1340 against frame 1's 440,1320).
//   A first version pasted frame 1's own top face where the seated thigh does not hide it and resampled the rest - the two halves differ in
//   brightness and the seam showed. So the whole top face is the end frame's own, resampled to frame 1's depth: the front top edge is fixed
//   and the depth vector 245,-118 becomes 295,-140, a single affine map of the box surface. The standing legs are never touched:
//   right of endLeft(y) the end frame is kept as it is.
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const W = 2048;
const [EP, OUT] = process.argv.slice(2);
const E = execFileSync(FF, ['-v', 'error', '-i', EP, '-vf', `scale=${W}:${W}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * W * 4 });
const lerp = pts => y => {
  if (y <= pts[0][1]) return pts[0][0];
  for (let i = 1; i < pts.length; i++) if (y <= pts[i][1]) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return x0 + (x1 - x0) * (y - y0) / (y1 - y0); }
  return pts[pts.length - 1][0];
};
// left edge of the standing legs in end-shift (x, y), read off pb82/legs.jpg
const endLeft = lerp([[780, 1198], [775, 1248], [760, 1298], [740, 1348], [725, 1398], [722, 1448], [725, 1498], [735, 1548]]);
const FL = [145, 1460], U = [445, 40], DS = [295, -140], DE = [245, -118];
const det = U[0] * DS[1] - U[1] * DS[0];
const sampE = (x, y, c) => {
  x = Math.min(W - 1.001, Math.max(0, x)); y = Math.min(W - 1.001, Math.max(0, y));
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, i = (y0 * W + x0) * 3 + c;
  return (E[i] * (1 - fx) + E[i + 3] * fx) * (1 - fy) + (E[i + W * 3] * (1 - fx) + E[i + W * 3 + 3] * fx) * fy;
};
const cl = v => Math.min(1, Math.max(0, v));
const out = Buffer.from(E);
let n = 0;
for (let y = 1150; y < 1560; y++) for (let x = 40; x < 900; x++) {
  const px = x - FL[0], py = y - FL[1];
  const a = (px * DS[1] - py * DS[0]) / det, k = (U[0] * py - U[1] * px) / det; // k: 0 on the front top edge, 1 on frame 1's back edge
  if (k <= 0) continue; // the front face and everything below it stay as they are
  const w = cl((endLeft(y) - 8 - x) / 8) * cl((1.6 - k) / 0.2); // up to the legs; fades out well above the back edge, in the backdrop
  if (w <= 0) continue;
  const i = (y * W + x) * 3;
  for (let c = 0; c < 3; c++) out[i + c] = Math.round(w * sampE(FL[0] + a * U[0] + k * DE[0], FL[1] + a * U[1] + k * DE[1], c) + (1 - w) * E[i + c]);
  n++;
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${W}`, '-i', '-', OUT], { input: out });
console.log('box top resampled ->', OUT, { pixels: n });
