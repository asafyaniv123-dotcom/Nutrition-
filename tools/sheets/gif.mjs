// The exercise animation (Asaf, 6 Nov): two approved frames and a GIF that only moves between them. No
// video model, no credits. Run align.mjs on the end frame first, so whatever does not move is identical.
// node tools/sheets/gif.mjs <start.png> <end.png> <out-dir> [hold=1.0] [fade=0.6] [mode=cross] [name=anim.gif]
//   writes start.jpg, end.jpg and the GIF into out-dir; hold and fade are seconds
//
// The change is never a cross-fade. A cross-fade shows both frames at once, and with arms in two places
// that reads as four arms (his words: "they hide each other instead of being soft and clean"). Here the
// start frame's moving part fades out to the background and only then does the end frame's fade in.
// The background in between is min(start, end) per pixel: the figure glows brighter than the dark
// ground, so wherever either frame has a limb the other does not, the minimum is the ground - and
// wherever the two are identical (the aligned body, the bench) it is that same picture, which therefore
// never moves. No mask, no threshold.
import fs from 'fs'; import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const [A, B, OUT, ...OPT] = process.argv.slice(2);
if (!OUT) { console.log('usage: gif.mjs <start.png> <end.png> <out-dir> [hold=s] [fade=s] [name=file.gif]'); process.exit(2); }
const opt = (k, d) => { const o = OPT.find((a) => a.startsWith(k + '=')); return o ? o.slice(k.length + 1) : d; };
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const ff = (a, input) => execFileSync(FF, ['-v', 'error', '-y', ...a], { input, maxBuffer: 1 << 28 });
/* mode=cross (default since 6 Nov, when Asaf sent a recording of exactly the GIF he wants): a cross-fade,
   1.0 s held on each pose and 0.6 s to change, as measured off that recording. It works because align.mjs
   has made the still body identical, so only the moving limb is seen in both places. mode=through: out to
   the ground, then in (he saw a moment with no arms). mode=cut: no fade. */
const N = 540, FPS = 20, HOLD = +opt('hold', 1.0), FADE = +opt('fade', 0.6), NAME = opt('name', 'anim.gif'), MODE = opt('mode', 'cross');
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
console.log(`${NAME}: ${frames.length} frames, ${(frames.length / FPS).toFixed(1)} s, ${fs.statSync(path.join(OUT, NAME)).size} bytes`);
