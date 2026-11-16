// node slowloop.mjs <start.jpg> <end.jpg> <out.mp4> [fade=0.6] [hold=0.85] [fps=30] - x152 only (Asaf, 16 Nov): a slower dissolve than the fixed
//   0.3 s for a long-range move; ease-out weight w = 1-(1-t)^2, the same two frames, no morphing. gif.mjs keeps the fixed timing for everything else.
import { execFileSync } from 'node:child_process';
import os from 'node:os'; import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [S, E, OUT, fade = '0.6', hold = '0.85', fps = '30'] = process.argv.slice(2);
const W = 540, H = 540, rd = (p) => execFileSync(FF, ['-v', 'error', '-i', p, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const a = rd(S), b = rd(E), F = +fps, nh = Math.round(+hold * F), nf = Math.round(+fade * F);
const frames = [];
const mix = (x, y, w) => { const o = Buffer.alloc(x.length); for (let i = 0; i < x.length; i++) o[i] = Math.round(x[i] * (1 - w) + y[i] * w); return o; };
for (let i = 0; i < nh; i++) frames.push(a);
for (let i = 1; i <= nf; i++) { const t = i / nf; frames.push(mix(a, b, 1 - (1 - t) ** 2)); }
for (let i = 0; i < nh; i++) frames.push(b);
for (let i = 1; i <= nf; i++) { const t = i / nf; frames.push(mix(b, a, 1 - (1 - t) ** 2)); }
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(F), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', OUT], { input: Buffer.concat(frames), maxBuffer: 1 << 30 });
console.log(OUT, frames.length, 'frames,', (frames.length / F).toFixed(2), 's');
