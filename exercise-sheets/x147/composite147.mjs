// node composite147.mjs <start.png> <end.png> <out.png> - x147 Composite Lock (from x33) (16 Nov, 0 credits):
//   1. the end frame's metal frame was redrawn a little larger and lower (contact-check on its corners: dx -2..+12, dy -1.5 at the top,
//      -18 at the base), so the end frame is first resampled by a smooth affine shift fitted to those corners -
//      E'(x,y) = E(x+dx(x,y), y+dy(x,y)) - which puts its frame back on frame 1's; nothing is warped locally.
//   2. out = frame 1 everywhere, and E' only inside the moving region (both figures and their reflections), feathered 24 px.
//      The frame, the floor and the backdrop outside that region are frame 1's pixels.
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [SP, EP, OUT] = process.argv.slice(2);
const W = 2048, H = 2048;
const read = (p) => execFileSync(FF, ['-v', 'error', '-i', p, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const S = read(SP), E = read(EP);
// fitted on topRight (1517,127) 7.0/-1.3, baseRight (1575,1455) 12.4/-16.8, baseLeft (520,1660) -1.9/-18.1, topLeft dy -1.7, leftPost dx 2.9
const dxAt = (x, y) => -14.1 + 0.0136 * x + 0.0041 * y;
const dyAt = (x, y) => -1.5 - 0.0108 * (y - 130);
const samp = (buf, x, y, c) => {
  x = Math.min(W - 1.001, Math.max(0, x)); y = Math.min(H - 1.001, Math.max(0, y));
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, i = (y0 * W + x0) * 3 + c;
  return (buf[i] * (1 - fx) + buf[i + 3] * fx) * (1 - fy) + (buf[i + W * 3] * (1 - fx) + buf[i + W * 3 + 3] * fx) * fy;
};
// moving region, 1024-grid coordinates read off both frames: the standing figure, the leaning figure, both pairs of feet and reflections
const FIG = [[440, 220, 600, 920], [205, 445, 670, 900], [430, 880, 600, 1010]];
const inR = (rs, x, y) => rs.some(([a, b, c, d]) => x >= a * 2 && x < c * 2 && y >= b * 2 && y < d * 2);
const F = 24;
const mask = (rs) => {
  const m = new Float32Array(W * H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) m[y * W + x] = inR(rs, x, y) ? 1 : 0;
  const blur = (src, horiz) => { const o = new Float32Array(W * H); for (let a = 0; a < H; a++) { let s = 0; const g = (b) => horiz ? src[a * W + b] : src[b * W + a];
    for (let b = -F; b <= F; b++) s += g(Math.min(W - 1, Math.max(0, b)));
    for (let b = 0; b < W; b++) { (horiz ? (o[a * W + b] = s / (2 * F + 1)) : (o[b * W + a] = s / (2 * F + 1))); s += g(Math.min(W - 1, b + F + 1)) - g(Math.max(0, b - F)); } } return o; };
  const h = blur(m, true), v = blur(h, false); for (let i = 0; i < W * H; i++) v[i] = Math.min(1, v[i] * 2); return v; };
const mFig = mask(FIG);
const out = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = y * W + x, mf = mFig[i], ex = x + dxAt(x, y), ey = y + dyAt(x, y);
  for (let c = 0; c < 3; c++) out[i * 3 + c] = Math.round(S[i * 3 + c] * (1 - mf) + samp(E, ex, ey, c) * mf);
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', OUT], { input: out });
console.log('composite ->', OUT);
