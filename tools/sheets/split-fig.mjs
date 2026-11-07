// Split a transparent two-figure image at the emptiest column between the figures, keep each figure WHOLE
// (no crop through it), and report each figure's box, toe (leftmost 4%) and hand (lowest 3%) in image pixels.
// node split-fig.mjs <pair-rgba> <left-out> <right-out>   (both outs keep the full image size, the other half cleared)
import { execFileSync } from 'child_process'; import path from 'path'; import os from 'os';
const [IN, L, R] = process.argv.slice(2);
const FF = path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
let W, H; try { execFileSync(FF, ['-i', IN], { stdio: 'pipe' }); } catch (e) { const m = String(e.stderr).match(/, (\d{3,5})x(\d{3,5})/); W = +m[1]; H = +m[2]; }
const a = execFileSync(FF, ['-v', 'error', '-i', IN, '-vf', 'format=rgba,alphaextract', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 1 << 28 });
const col = new Float64Array(W); for (let x = 0; x < W; x++) { let s = 0; for (let y = 0; y < H; y++) s += a[y * W + x] > 128 ? 1 : 0; col[x] = s; }
let gap = W >> 1, best = Infinity; for (let x = Math.round(W * 0.35); x < Math.round(W * 0.65); x++) if (col[x] < best) { best = col[x]; gap = x; }
function info(x0b, x1b) {
  let x0 = W, x1 = 0, y0 = H, y1 = 0;
  for (let y = 0; y < H; y++) for (let x = x0b; x < x1b; x++) if (a[y * W + x] > 128) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const mean = (t) => { let sx = 0, sy = 0, n = 0; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (a[y * W + x] > 128 && t(x, y)) { sx += x; sy += y; n++; } return [Math.round(sx / n), Math.round(sy / n)]; };
  return { box: [x0, y0, x1, y1], toe: mean((x) => x <= x0 + (x1 - x0) * 0.04), hand: mean((x, y) => y >= y1 - (y1 - y0) * 0.03) };
}
console.log(JSON.stringify({ W, H, gap, gapPixels: best, left: info(0, gap), right: info(gap, W) }));
execFileSync(FF, ['-v', 'error', '-y', '-i', IN, '-vf', `format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lt(X,${gap}),alpha(X,Y),0)'`, L]);
execFileSync(FF, ['-v', 'error', '-y', '-i', IN, '-vf', `format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(gte(X,${gap}),alpha(X,Y),0)'`, R]);
