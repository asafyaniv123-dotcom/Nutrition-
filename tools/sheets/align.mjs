// Put the end frame exactly where the start frame is (Asaf, 6 Nov: "the body stays in the same place,
// without moving at all"). Two generated frames never sit in the same spot, so a GIF between them makes
// the whole man drift. This finds the scale and shift that lay the end frame's still part (legs, bench,
// floor - the bottom of the picture) onto the start frame's, applies it, then takes that still part
// from the start frame outright, blended in over a soft band, so it is identical in both. No credits.
// node tools/sheets/align.mjs <start.png> <end.png> <out.png> [still=0.55]
//   still: the fraction of the height, from the top, below which the picture does not move
import fs from 'fs'; import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const [A, B, OUT, ...OPT] = process.argv.slice(2);
if (!OUT) { console.log('usage: align.mjs <start.png> <end.png> <out.png> [still=0.55]'); process.exit(2); }
const STILL = +((OPT.find((o) => o.startsWith('still=')) || 'still=0.55').slice(6));
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const N = 1024;
/* raw pixels at N x N: grey for the search, rgb for the blend */
const raw = (f, fmt) => execFileSync(FF, ['-v', 'error', '-i', f, '-vf', `scale=${N}:${N}`, '-f', 'rawvideo', '-pix_fmt', fmt, '-'], { maxBuffer: 1 << 26 });
const ga = raw(A, 'gray'), gb = raw(B, 'gray');
/* the cost of laying B, scaled by s about the centre and shifted by (dx,dy), over A - summed on the
   still part only, sampled every `step` pixels */
function cost(s, dx, dy, step) {
  let sum = 0, n = 0;
  for (let y = Math.round(N * STILL); y < N; y += step) for (let x = 0; x < N; x += step) {
    const bx = Math.round((x - N / 2 - dx) / s + N / 2), by = Math.round((y - N / 2 - dy) / s + N / 2);
    if (bx < 0 || by < 0 || bx >= N || by >= N) continue;
    const d = ga[y * N + x] - gb[by * N + bx]; sum += d * d; n++;
  }
  return n ? sum / n : Infinity;
}
/* coarse to fine: a wide search on a sparse grid, then a narrow one on a dense grid */
let best = { s: 1, dx: 0, dy: 0, c: cost(1, 0, 0, 8) };
for (let s = 0.85; s <= 1.15; s += 0.01) for (let dx = -120; dx <= 120; dx += 6) for (let dy = -120; dy <= 120; dy += 6) {
  const c = cost(s, dx, dy, 8); if (c < best.c) best = { s, dx, dy, c };
}
const c0 = best;
for (let s = c0.s - 0.012; s <= c0.s + 0.012; s += 0.002) for (let dx = c0.dx - 6; dx <= c0.dx + 6; dx++) for (let dy = c0.dy - 6; dy <= c0.dy + 6; dy++) {
  const c = cost(s, dx, dy, 3); if (c < best.c) best = { s, dx, dy, c };
}
console.log(`scale ${best.s.toFixed(3)}  shift ${best.dx},${best.dy}  (before: ${Math.round(cost(1, 0, 0, 3))}, after: ${Math.round(best.c)})`);
/* apply it to the colour picture, then blend the start frame's still part in over a soft band */
/* Below the line, a pixel is taken from the start frame only where the two frames ALREADY nearly agree
   there - the same bench, the same leg drawn a shade differently. Where they differ, something moved into
   that place (the pullover's dumbbell hangs below the line; 6 Nov, the first version wiped it out and
   half-blended two heads), and the end frame's pixel stays. */
const ca = raw(A, 'rgb24'), cb = raw(B, 'rgb24'), moved = Buffer.alloc(N * N * 3), out = Buffer.alloc(N * N * 3);
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  const bx = Math.min(N - 1, Math.max(0, Math.round((x - N / 2 - best.dx) / best.s + N / 2)));
  const by = Math.min(N - 1, Math.max(0, Math.round((y - N / 2 - best.dy) / best.s + N / 2)));
  for (let c = 0; c < 3; c++) moved[(y * N + x) * 3 + c] = cb[(by * N + bx) * 3 + c];
}
/* how far apart the frames are at each pixel, smoothed over a few pixels so the mask has no speckle */
const R = 6, diff = new Float32Array(N * N), sm = new Float32Array(N * N);
for (let i = 0; i < N * N; i++) diff[i] = (Math.abs(ca[i * 3] - moved[i * 3]) + Math.abs(ca[i * 3 + 1] - moved[i * 3 + 1]) + Math.abs(ca[i * 3 + 2] - moved[i * 3 + 2])) / 3;
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  let s = 0, n = 0;
  for (let j = -R; j <= R; j += 2) for (let i = -R; i <= R; i += 2) { const yy = y + j, xx = x + i; if (yy >= 0 && yy < N && xx >= 0 && xx < N) { s += diff[yy * N + xx]; n++; } }
  sm[y * N + x] = s / n;
}
const y0 = N * STILL, band = N * 0.08;
for (let y = 0; y < N; y++) {
  const below = Math.min(1, Math.max(0, (y - y0) / band));
  for (let x = 0; x < N; x++) {
    const agree = Math.min(1, Math.max(0, 1 - (sm[y * N + x] - 12) / 28));   // 1 under ~12 levels apart, 0 past ~40
    const k = below * agree, i = (y * N + x) * 3;
    for (let c = 0; c < 3; c++) out[i + c] = Math.round(moved[i + c] * (1 - k) + ca[i + c] * k);
  }
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${N}x${N}`, '-i', '-', OUT], { input: out });
console.log(OUT);
