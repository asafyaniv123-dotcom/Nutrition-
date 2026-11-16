// node composite33.mjs <start.png> <end.png> <out.png> [figDx figDy] - x156 Composite Lock (from x33) (Asaf, 16 Nov, 0 credits):
//   1. the end frame's machine was redrawn squeezed (contact-check: dy -3 at the top, -27 at the base), so the end frame is first resampled
//      by a smooth per-row shift measured on the machine (points below) - E'(x,y) = E(x+dx(y), y+dy(y)) - which puts its machine back on
//      frame 1's; nothing is warped locally.
//   2. out = frame 1 everywhere, and E' only inside the moving region (both figures, the knee pad and its rod, the stack and its cables),
//      feathered 24 px. The machine, the floor and the reflections outside that region are frame 1's pixels.
//   3. optional figDx figDy: an extra shift of the end figure layer only (hands back onto frame 1's grip, chin to the bar).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [SP, EP, OUT, fdx = '0', fdy = '0'] = process.argv.slice(2);
const W = 2048, H = 2048;
const read = (p) => execFileSync(FF, ['-v', 'error', '-i', p, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const S = read(SP), E = read(EP);
// machine shift measured by contact-check (start box centre y -> how far the end frame's machine moved)
const PTS = [[0, 0, 0], [2048, 0, 0]]; // x156: the machine already matches (contact-check 0.8-2.2 px), so no resampling
const at = (y) => {
  if (y <= PTS[0][0]) return PTS[0].slice(1);
  for (let i = 1; i < PTS.length; i++) if (y <= PTS[i][0]) { const [y0, x0, d0] = PTS[i - 1], [y1, x1, d1] = PTS[i], t = (y - y0) / (y1 - y0); return [x0 + t * (x1 - x0), d0 + t * (d1 - d0)]; }
  return PTS[PTS.length - 1].slice(1);
};
const samp = (buf, x, y, c) => {
  x = Math.min(W - 1.001, Math.max(0, x)); y = Math.min(H - 1.001, Math.max(0, y));
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, i = (y0 * W + x0) * 3 + c;
  return (buf[i] * (1 - fx) + buf[i + 3] * fx) * (1 - fy) + (buf[i + W * 3] * (1 - fx) + buf[i + W * 3 + 3] * fx) * fy;
};
// moving regions, 1024-grid coordinates read off both frames (figure = both poses; pad = both pad heights and the rod; stack = both heights)
const FIG = [[250, 170, 600, 780], [260, 590, 960, 860]], REST = [];
const inR = (rs, x, y) => rs.some(([a, b, c, d]) => x >= a * 2 && x < c * 2 && y >= b * 2 && y < d * 2);
const F = 24;
const mask = (rs) => { // feathered: 1 inside, falling to 0 over F px outside, via a separable box blur of the hard mask
  const m = new Float32Array(W * H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) m[y * W + x] = inR(rs, x, y) ? 1 : 0;
  const blur = (src, horiz) => { const o = new Float32Array(W * H); for (let a = 0; a < H; a++) { let s = 0; const g = (b) => horiz ? src[a * W + b] : src[b * W + a];
    for (let b = -F; b <= F; b++) s += g(Math.min(W - 1, Math.max(0, b)));
    for (let b = 0; b < W; b++) { (horiz ? (o[a * W + b] = s / (2 * F + 1)) : (o[b * W + a] = s / (2 * F + 1))); s += g(Math.min(W - 1, b + F + 1)) - g(Math.max(0, b - F)); } } return o; };
  const h = blur(m, true), v = blur(h, false); for (let i = 0; i < W * H; i++) v[i] = Math.min(1, v[i] * 2); return v; };
const mFig = mask(FIG), mRest = mask(REST);
const out = Buffer.alloc(W * H * 3), ddx = +fdx, ddy = +fdy;
for (let y = 0; y < H; y++) {
  const [dx, dy] = at(y), [dx2, dy2] = at(y - ddy);
  for (let x = 0; x < W; x++) {
    const i = y * W + x, mf = mFig[i], mr = Math.max(mRest[i], 0) * (1 - mf);
    for (let c = 0; c < 3; c++) {
      const s = S[i * 3 + c];
      const e = samp(E, x + dx, y + dy, c);                         // end frame on frame 1's machine
      const ef = samp(E, x - ddx + dx2, y - ddy + dy2, c);          // figure layer, shifted by (figDx, figDy)
      out[i * 3 + c] = Math.round(s * (1 - mf - mr) + ef * mf + e * mr);
    }
  }
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', OUT], { input: out });
console.log('composite ->', OUT, 'figure shift', ddx, ddy);
