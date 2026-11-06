// Frames for an exercise that travels (walking lunge, 6 Nov): the model will not move a figure across the frame
// at a fixed size, so the figures are cut from frames it did draw and set down on ONE background plate at the
// offsets a stride needs. Shifting a whole frame instead shows a seam, because the ground is vignetted.
// node tools/sheets/compose-walk.mjs <plate.png> <out-dir> <frame.png>:<dx> [<frame.png>:<dx> ...]
//   plate  - the empty ground (no figure, no floor reflection), 1024 square
//   frame  - a frame drawn on the same ground; its figure is everything brighter than the plate, softly masked
//   dx     - pixels to move that figure right (negative: left)
//   writes <out-dir>/p1.png, p2.png ... in the order given
import fs from 'fs'; import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const [PLATE, OUT, ...specs] = process.argv.slice(2);
if (!specs.length) { console.log('usage: compose-walk.mjs <plate.png> <out-dir> <frame.png>:<dx> ...'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe'), N = 1024;
const ff = (a, input) => execFileSync(FF, ['-v', 'error', '-y', ...a], { input, maxBuffer: 1 << 28 });
const px = (f) => ff(['-i', f, '-vf', `scale=${N}:${N}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
const plate = px(PLATE), lum = (b, i) => 0.3 * b[i] + 0.59 * b[i + 1] + 0.11 * b[i + 2];
fs.mkdirSync(OUT, { recursive: true });
specs.forEach((s, k) => {
  const at = s.lastIndexOf(':'), file = s.slice(0, at), dx = Math.round(+s.slice(at + 1)), f = px(file), out = Buffer.from(plate);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const sx = x - dx; if (sx < 0 || sx >= N) continue;
    const i = (y * N + x) * 3, j = (y * N + sx) * 3;
    /* how much brighter than its own (unshifted) ground: the plate stands in for that ground */
    const w = Math.max(0, Math.min(1, (lum(f, j) - lum(plate, j) - 6) / 26));
    for (let c = 0; c < 3; c++) out[i + c] = Math.round(out[i + c] * (1 - w) + f[j + c] * w);
  }
  const o = path.join(OUT, `p${k + 1}.png`);
  ff(['-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${N}x${N}`, '-i', '-', o], out);
  console.log('wrote', o, 'dx', dx);
});
