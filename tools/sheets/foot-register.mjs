// node tools/sheets/foot-register.mjs <start> <end> "x0,y0,x1,y1;..." - scale s + shift (tx,ty) that put the end frame's shoes on the start's (boxes = the shoes in the start, 2048 coords). s outside 0.99-1.01 = the frames differ in SIZE, which band-shift cannot see (x335, 14 Nov).
// out = end scaled by s about the origin, then shifted by (tx,ty): out(x,y) = end((x-tx)/s, (y-ty)/s)
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
const [a, b, boxArg] = process.argv.slice(2);
const FF = path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const N = 1024, K = 2048 / N;
const gray = (f) => execFileSync(FF, ['-v', 'error', '-i', f, '-vf', `scale=${N}:${N},format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 26 });
const A = gray(a), B = gray(b);
const boxes = boxArg.split(';').map((s) => s.split(',').map((v) => Math.round(+v / K)));
const pts = [];
for (const [x0, y0, x1, y1] of boxes) for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) pts.push(x, y, A[y * N + x]);
const samp = (x, y) => {
  if (x < 0 || y < 0 || x >= N - 1 || y >= N - 1) return 0;
  const xi = x | 0, yi = y | 0, fx = x - xi, fy = y - yi, i = yi * N + xi;
  return (B[i] * (1 - fx) + B[i + 1] * fx) * (1 - fy) + (B[i + N] * (1 - fx) + B[i + N + 1] * fx) * fy;
};
const cost = (s, tx, ty) => { let c = 0; for (let i = 0; i < pts.length; i += 3) c += Math.abs(samp((pts[i] - tx) / s, (pts[i + 1] - ty) / s) - pts[i + 2]); return c / (pts.length / 3); };
let best = { c: Infinity };
for (let s = 0.96; s <= 1.18; s += 0.01) for (let tx = -100; tx <= 40; tx += 4) for (let ty = -140; ty <= 40; ty += 4) { const c = cost(s, tx, ty); if (c < best.c) best = { c, s, tx, ty }; }
for (const [ds, dt] of [[0.004, 2], [0.002, 1], [0.001, 0.5], [0.0005, 0.25]]) {
  const o = { ...best };
  for (let s = o.s - 3 * ds; s <= o.s + 3 * ds + 1e-9; s += ds) for (let tx = o.tx - 3 * dt; tx <= o.tx + 3 * dt; tx += dt) for (let ty = o.ty - 3 * dt; ty <= o.ty + 3 * dt; ty += dt) { const c = cost(s, tx, ty); if (c < best.c) best = { c, s, tx, ty }; }
}
const id = cost(1, 0, 0);
console.log(JSON.stringify({ identityCost: +id.toFixed(2), cost: +best.c.toFixed(2), s: +best.s.toFixed(4), tx2048: +(best.tx * K).toFixed(1), ty2048: +(best.ty * K).toFixed(1) }));
