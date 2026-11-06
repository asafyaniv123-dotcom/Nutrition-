// Both poses in ONE generation (6 Nov): a wide image with two identical panels, start left and end right,
// is drawn in one pass, so the box, the hands, the feet and the weight stay put far better than across two
// separate generations. This finds the divider, cuts the two panels at the same offsets and makes each square.
// node tools/sheets/split-pair.mjs <pair.png> <start-out.png> <end-out.png>
import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const [IN, A, B] = process.argv.slice(2);
if (!B) { console.log('usage: split-pair.mjs <pair.png> <start-out.png> <end-out.png>'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
let W, H;
try { execFileSync(FF, ['-i', IN], { stdio: 'pipe' }); } catch (e) { const m = String(e.stderr).match(/, (\d{3,5})x(\d{3,5})/); W = +m[1]; H = +m[2]; }
const g = execFileSync(FF, ['-v', 'error', '-i', IN, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 1 << 28 });
/* the divider: the column near the middle whose mean brightness, over the WHOLE height, stands furthest from
   the columns 8 px either side - dark band or light line. A sharp vertical edge (the side of a box) is only
   part of the height, so it loses; the first version scored local sharpness, took the box edge at 0.40 W and
   cut the two panels 42 px apart. Searched only in the middle tenth, where a divider has to be. */
const col = new Float64Array(W);
for (let x = 0; x < W; x++) { let s = 0; for (let y = 0; y < H; y++) s += g[y * W + x]; col[x] = s / H; }
let best = W >> 1, bestScore = -1;
for (let x = Math.round(W * 0.45); x < Math.round(W * 0.55); x++) {
  const s = Math.abs(col[x] - (col[x - 8] + col[x + 8]) / 2);
  if (s > bestScore) { bestScore = s; best = x; }
}
const gap = 4, side = Math.min(H, best - gap, W - best - gap - 1);
/* the same square from each panel, centred on each panel's own middle */
const cx = (x0, x1) => Math.round((x0 + x1) / 2 - side / 2);
const ax = Math.max(0, cx(0, best - gap)), bx = Math.max(best + gap, cx(best + gap, W));
const ay = Math.round((H - side) / 2);
execFileSync(FF, ['-v', 'error', '-y', '-i', IN, '-vf', `crop=${side}:${side}:${ax}:${ay}`, A]);
execFileSync(FF, ['-v', 'error', '-y', '-i', IN, '-vf', `crop=${side}:${side}:${bx}:${ay}`, B]);
console.log(`${W}x${H}, divider at x=${best}, panels ${side}px square at x=${ax} and x=${bx}`);
