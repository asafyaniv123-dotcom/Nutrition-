// node headroom227.mjs <start.png> <out.png> [s=0.86] - x227 headroom (16 Nov, 0 credits): the thruster ends with the bar locked out
//   overhead. At frame 1's scale the standing figure's head would reach row ~153/1024 and the far plate ~-50 - outside the picture.
//   So frame 1 is shrunk UNIFORMLY by s about the bottom centre (nothing is warped; the figure keeps every proportion), and the
//   empty band this opens at the top and sides is filled by clamping to the nearest edge pixel of the shrunk picture - the dark
//   studio backdrop and floor, which are near-uniform there.
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [SP, OUT, ss = '0.86'] = process.argv.slice(2);
const W = 2048, H = 2048, s = +ss;
const S = execFileSync(FF, ['-v', 'error', '-i', SP, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const samp = (x, y, c) => {
  x = Math.min(W - 1.001, Math.max(0, x)); y = Math.min(H - 1.001, Math.max(0, y));
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, i = (y0 * W + x0) * 3 + c;
  return (S[i] * (1 - fx) + S[i + 3] * fx) * (1 - fy) + (S[i + W * 3] * (1 - fx) + S[i + W * 3 + 3] * fx) * fy;
};
const out = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const sx = W / 2 + (x - W / 2) / s, sy = H - (H - y) / s; // inverse of the shrink about (W/2, H)
  for (let c = 0; c < 3; c++) out[(y * W + x) * 3 + c] = Math.round(samp(sx, sy, c));
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', OUT], { input: out });
console.log('headroom ->', OUT, 'scale', s);
