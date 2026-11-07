// node tools/sheets/band-shift.mjs <start.png> <end.png> <y0frac> <y1frac> - best (dx,dy) that lays END's band onto START's band
// (the rows that must not move: legs, feet, floor). Grayscale, quarter size first, then refined at full size.
import { execFileSync } from 'child_process'; import path from 'path'; import os from 'os';
const [A, B, f0, f1] = process.argv.slice(2);
const FF = path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const gray = (f) => execFileSync(FF, ['-v', 'error', '-i', f, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 1 << 28 });
const a = gray(A), b = gray(B), N = Math.round(Math.sqrt(a.length));
const y0 = Math.round(N * +f0), y1 = Math.round(N * +f1), R = 80;
function cost(dx, dy, step) {
  let s = 0, n = 0;
  for (let y = y0; y < y1; y += step) for (let x = R; x < N - R; x += step) {
    const yy = y + dy; if (yy < 0 || yy >= N) continue;
    s += Math.abs(a[y * N + x] - b[yy * N + x + dx]); n++;
  }
  return s / n;
}
let best = [0, 0, cost(0, 0, 4)];
for (let dy = -R; dy <= R; dy += 2) for (let dx = -R; dx <= R; dx += 2) { const c = cost(dx, dy, 4); if (c < best[2]) best = [dx, dy, c]; }
const [cx, cy] = best;
for (let dy = cy - 2; dy <= cy + 2; dy++) for (let dx = cx - 2; dx <= cx + 2; dx++) { const c = cost(dx, dy, 1); if (dx === cx - 2 && dy === cy - 2 || c < best[2]) best = [dx, dy, c]; }
console.log(JSON.stringify({ size: N, dx: best[0], dy: best[1], cost: +best[2].toFixed(2), unshifted: +cost(0, 0, 1).toFixed(2) }));
