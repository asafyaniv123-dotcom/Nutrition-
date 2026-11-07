// The last step of the one-generation method (6 Nov): even two panels of one image can sit a few px apart and
// differ ~3% in scale. Search scale k and shift (dx,dy) for END so the parts that do not move match START, then
// write END moved - no blending and no masks, which is what left ghost lines when align.mjs was used for this.
// node tools/sheets/fit-still.mjs <start> <end> <out> x0,y0,x1,y1 [...]   (boxes on a 576 square: the still parts)
import { execFileSync } from 'child_process'; import path from 'path'; import os from 'os';
const FF = path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe'), N = 576;
const px = (f, fmt = 'gray') => execFileSync(FF, ['-v', 'error', '-i', f, '-vf', `scale=${N}:${N}`, '-f', 'rawvideo', '-pix_fmt', fmt, '-'], { maxBuffer: 1 << 27 });
const a = px(process.argv[2]), b = px(process.argv[3]);
const regions = process.argv.slice(5).map((r) => r.split(',').map(Number));
if (!regions.length) { console.log('give at least one still box x0,y0,x1,y1'); process.exit(2); }
const cost = (k, dx, dy) => { let s = 0, n = 0; const c = N / 2;
  for (const [x0, y0, x1, y1] of regions) for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
    const xs = Math.round((x - dx - c) / k + c), ys = Math.round((y - dy - c) / k + c);
    if (xs < 0 || xs >= N || ys < 0 || ys >= N) continue; s += Math.abs(a[y * N + x] - b[ys * N + xs]); n++; }
  return s / n; };
let best = [1, 0, 0, cost(1, 0, 0)];
for (let k = 0.95; k <= 1.05; k += 0.005) for (let dx = -30; dx <= 30; dx += 2) for (let dy = -20; dy <= 20; dy += 2) { const v = cost(k, dx, dy); if (v < best[3]) best = [k, dx, dy, v]; }
console.log('k', best[0].toFixed(3), 'dx', best[1], 'dy', best[2], 'cost', best[3].toFixed(2), 'was', cost(1, 0, 0).toFixed(2));
/* the search runs at 576; the move is applied at the END frame's own size, so a 1152 frame comes out 1152
   (it used to come out 576 - half the detail - x248, 7 Nov) */
let S = N; try { execFileSync(FF, ['-i', process.argv[3]], { stdio: 'pipe' }); } catch (e) { S = +String(e.stderr).match(/, (\d{3,5})x\d{3,5}/)[1]; }
const f = S / N, [k, dxs, dys] = best, dx = dxs * f, dy = dys * f, c = S / 2;
const rgb = execFileSync(FF, ['-v', 'error', '-i', process.argv[3], '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 28 }), out = Buffer.alloc(rgb.length);
for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
  const xs = Math.min(S - 1, Math.max(0, Math.round((x - dx - c) / k + c))), ys = Math.min(S - 1, Math.max(0, Math.round((y - dy - c) / k + c)));
  for (let q = 0; q < 3; q++) out[(y * S + x) * 3 + q] = rgb[(ys * S + xs) * 3 + q]; }
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${S}x${S}`, '-i', '-', process.argv[4]], { input: out });
