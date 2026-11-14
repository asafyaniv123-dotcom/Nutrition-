// An exercise animation through more than two poses (walking lunge, 6 Nov: stand, lunge, stand further on,
// lunge on the other leg, and back to the start). The same timing as gif.mjs: each pose held, an ease-out
// cross-fade to the next, and the last pose fades back into the first so the loop has no jump.
// node tools/sheets/gif-seq.mjs <out-dir> <frame1.png> <frame2.png> ...   (timing fixed as gif.mjs: 0.85 s hold, 0.3 s dissolve)
//   writes start.jpg (first pose), end.jpg (the deepest pose: the second), anim.gif and anim.mp4 into out-dir
import fs from 'fs'; import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const args = process.argv.slice(2), OUT = args[0];
const opt = (k, d) => { const o = args.find((a) => a.startsWith(k + '=')); return o ? +o.slice(k.length + 1) : d; };
const files = args.slice(1).filter((a) => !a.includes('='));
if (!OUT || files.length < 2) { console.log('usage: gif-seq.mjs <out-dir> <frame1> <frame2> ...'); process.exit(2); }
if (args.some((a) => /^(hold|fade)=/.test(a))) { console.log('gif-seq.mjs: hold=/fade= refused - the timing is fixed (0.85 s hold, 0.3 s dissolve)'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const ff = (a, input) => execFileSync(FF, ['-v', 'error', '-y', ...a], { input, maxBuffer: 1 << 29 });
const N = 540, FPS = 20, HOLD = 0.85, FADE = 0.3;
fs.mkdirSync(OUT, { recursive: true });
ff(['-i', files[0], '-vf', 'scale=768:-1', '-q:v', '3', path.join(OUT, 'start.jpg')]);
ff(['-i', files[1], '-vf', 'scale=768:-1', '-q:v', '3', path.join(OUT, 'end.jpg')]);
const px = (f) => ff(['-i', f, '-vf', `scale=${N}:${N}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
const pics = files.map(px);
const mix = (p, q, k) => { const o = Buffer.alloc(p.length); for (let i = 0; i < p.length; i++) o[i] = Math.round(p[i] + (q[i] - p[i]) * k); return o; };
const hold = Math.round(HOLD * FPS), full = Math.max(1, Math.round(FADE * FPS)), frames = [];
for (let i = 0; i < pics.length; i++) {
  const a = pics[i], b = pics[(i + 1) % pics.length];
  for (let j = 0; j < hold; j++) frames.push(a);
  /* ease-out, as gif.mjs: measured off the reference GIF Asaf recorded */
  for (let j = 1; j < full; j++) frames.push(mix(a, b, Math.sin(Math.PI / 2 * j / full)));
}
ff(['-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${N}x${N}`, '-r', String(FPS), '-i', '-', '-filter_complex',
  'split[s1][s2];[s1]palettegen=max_colors=256:stats_mode=full[p];[s2][p]paletteuse=dither=sierra2_4a', '-loop', '0', path.join(OUT, 'anim.gif')], Buffer.concat(frames));
ff(['-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${N}x${N}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-crf', '22', '-preset', 'slow',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', path.join(OUT, 'anim.mp4')], Buffer.concat(frames));
console.log(`anim.gif: ${pics.length} poses, ${frames.length} frames, ${(frames.length / FPS).toFixed(1)} s`);
