// node composite119.mjs <start.png> <end.png> <out.png> - x119 Composite Lock (from x33/x315) (16 Nov, 0 credits; Asaf opened x119 from
//   parking for a 0-credit lock). end.png (v2) is aligned with frame 1 to the pixel on the bench, the foot, the knee and the support hand
//   (contact-check 0-0.9 px), but both edits narrowed the rear outline of the shorts (13 Nov). So out = frame 1 everywhere - shorts, legs,
//   bench, support arm - and the end frame only where the working arm moves: A over the back (shoulder, upper arm, the old forearm and
//   dumbbell), B above the seat for the straightened hand and its dumbbell, stopping above the seat's rear outline. Feathered 24 px.
//   v3: B stops at y 520; below it the lower plate overlaps the seat top, so there only the PLATE comes from the end frame: its whole box
//   (x 1440-1592, y 520-606, corners rounded 14 px) - the plate stands in front of the seat. v2 took every dark pixel and pulled the end
//   frame's brown background over frame 1's seat; v3 took only neutral-grey pixels and lost the plate (its faces carry amber light). The rects feather 24 px (the backdrop levels differ a little), the plate 3 px.
//   13 Nov's lock "left a visible seam" - this one cuts above the shorts instead of through them.
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [SP, EP, OUT] = process.argv.slice(2);
const W = 2048, H = 2048;
const read = (p) => execFileSync(FF, ['-v', 'error', '-i', p, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const S = read(SP), E = read(EP);
const RECTS = [[878, 263, 1375, 966], [1375, 263, 1639, 520]]; // 2048 coords
const PLATE = [1440, 520, 1592, 606]; // the lower plate's box: neutral-grey end pixels only
const m = new Float32Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (RECTS.some(([a, b, c, d]) => x >= a && x < c && y >= b && y < d)) m[y * W + x] = 1;
const pm = new Float32Array(W * H);
{ const [a, b, c, d] = PLATE; for (let y = b; y < d; y++) for (let x = a; x < c; x++) { const i = (y * W + x) * 3; const r = 14, cx = Math.min(Math.max(x, a + r), c - r), cy = Math.min(Math.max(y, b + r), d - r); if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) pm[y * W + x] = 1; } }
const blur = (src, horiz, F) => { const o = new Float32Array(W * H); for (let a = 0; a < H; a++) { let s = 0; const g = (b) => horiz ? src[a * W + b] : src[b * W + a];
  for (let b = -F; b <= F; b++) s += g(Math.min(W - 1, Math.max(0, b)));
  for (let b = 0; b < W; b++) { (horiz ? (o[a * W + b] = s / (2 * F + 1)) : (o[b * W + a] = s / (2 * F + 1))); s += g(Math.min(W - 1, b + F + 1)) - g(Math.max(0, b - F)); } } return o; };
const mr = blur(blur(m, true, 24), false, 24), mp = blur(blur(pm, true, 3), false, 3);
const mk = new Float32Array(W * H); for (let i = 0; i < W * H; i++) mk[i] = Math.max(mr[i], mp[i]);
const out = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) for (let c = 0; c < 3; c++) out[i * 3 + c] = Math.round(S[i * 3 + c] * (1 - mk[i]) + E[i * 3 + c] * mk[i]);
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', OUT], { input: out });
console.log('composite ->', OUT);
