// The exercise animation (Asaf, 6 Nov): two approved frames and a GIF that only moves between them. No
// video model, no credits. Run align.mjs on the end frame first, so whatever does not move is identical.
// node tools/sheets/gif.mjs <start.png> <end.png> <out-dir> [name=anim.gif]
//   writes start.jpg, end.jpg, the GIF and the mp4 into out-dir. Run foot-fit.mjs first (stage-c.mjs does).
//
// ONE timing for every loop (Asaf, 14 Nov, after x335 v3): 0.85 s on frame 1, a 0.3 s ease-out dissolve, 0.85 s on
// frame 2, 0.3 s back - a 2.2 s cycle. Not a parameter: hold=, fade= and mode= are refused. A dry cut lost the rhythm
// of batch A (x335 v2, rejected), a long cross-fade drew two bodies (x335 v1), and a mesh morph turned the head into
// a cone and doubled the plates (x335, never shown) - none of the three comes back.
import fs from 'fs'; import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const [A, B, OUT, ...OPT] = process.argv.slice(2);
if (!OUT) { console.log('usage: gif.mjs <start.png> <end.png> <out-dir> [name=file.gif]'); process.exit(2); }
const banned = OPT.find((o) => /^(hold|fade|mode)=/.test(o));
if (banned) { console.log('gif.mjs: ' + banned + ' refused - the timing is fixed (0.85 s hold, 0.3 s ease-out dissolve)'); process.exit(2); }
const opt = (k, d) => { const o = OPT.find((a) => a.startsWith(k + '=')); return o ? o.slice(k.length + 1) : d; };
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const ff = (a, input) => execFileSync(FF, ['-v', 'error', '-y', ...a], { input, maxBuffer: 1 << 28 });
/* mode=cross (default since 6 Nov, when Asaf sent a recording of exactly the GIF he wants): a cross-fade,
   1.0 s held on each pose and 0.6 s to change, as measured off that recording. It works because align.mjs
   has made the still body identical, so only the moving limb is seen in both places. mode=through: out to
   the ground, then in (he saw a moment with no arms). mode=cut: no fade. */
const N = 540, FPS = 20, HOLD = 0.85, FADE = 0.3, NAME = opt('name', 'anim.gif'), MODE = 'cross';
fs.mkdirSync(OUT, { recursive: true });
ff(['-i', A, '-vf', 'scale=768:-1', '-q:v', '3', path.join(OUT, 'start.jpg')]);
ff(['-i', B, '-vf', 'scale=768:-1', '-q:v', '3', path.join(OUT, 'end.jpg')]);
const px = (f) => ff(['-i', f, '-vf', `scale=${N}:${N}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
const a = px(A), b = px(B), m = Buffer.alloc(a.length);
for (let i = 0; i < a.length; i++) m[i] = Math.min(a[i], b[i]);
const mix = (p, q, k) => { const o = Buffer.alloc(p.length); for (let i = 0; i < p.length; i++) o[i] = Math.round(p[i] + (q[i] - p[i]) * k); return o; };
const ease = (t) => (1 - Math.cos(Math.PI * t)) / 2;
/* one cycle: hold start, start -> ground, ground -> end, hold end, end -> ground, ground -> start */
const frames = [], hold = Math.round(HOLD * FPS), half = Math.max(1, Math.round(FADE * FPS / 2));
const go = (p, q) => { for (let i = 1; i <= half; i++) frames.push(mix(p, q, ease(i / half))); };
const full = Math.max(1, Math.round(FADE * FPS));
const change = (p, q) => {
  if (MODE === 'cut') return;
  /* ease-out, measured off the reference GIF he recorded (6 Nov): 27, 50, 68, 82, 92, 100 per tenth of a second */
  if (MODE === 'cross') { for (let i = 1; i < full; i++) frames.push(mix(p, q, Math.sin(Math.PI / 2 * i / full))); return; }
  go(p, m); go(m, q);
};
for (let i = 0; i < hold; i++) frames.push(a);
change(a, b);
for (let i = 0; i < hold; i++) frames.push(b);
change(b, a);
ff(['-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${N}x${N}`, '-r', String(FPS), '-i', '-', '-filter_complex',
  'split[s1][s2];[s1]palettegen=max_colors=256:stats_mode=full[p];[s2][p]paletteuse=dither=sierra2_4a', '-loop', '0', path.join(OUT, NAME)], Buffer.concat(frames));
/* the same cycle as a video, for the app: a GIF is 1.5-2 MB, this is a tenth of it, and the app's
   "how it looks" already plays assets/exdemo/<id>.mp4 in a looping <video> */
ff(['-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${N}x${N}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-crf', '22', '-preset', 'slow',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', path.join(OUT, NAME.replace(/\.gif$/, '.mp4'))], Buffer.concat(frames));
console.log(`${NAME}: ${frames.length} frames, ${(frames.length / FPS).toFixed(1)} s, ${fs.statSync(path.join(OUT, NAME)).size} bytes`);
