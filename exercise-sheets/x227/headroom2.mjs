// node headroom2.mjs <start.png> <out.png> [s=0.86] - headroom with a smooth fill (16 Nov, 0 credits; after headroom227.mjs):
//   frame 1 is shrunk UNIFORMLY by s about the bottom centre exactly as headroom227 does (nothing warped), but the band this opens
//   is filled from a heavily blurred copy of the picture (gblur sigma 48) clamped to its edge, instead of the raw edge pixel - the raw
//   pixel carries the backdrop's grain, and repeating it drew faint vertical streaks (Asaf saw them on x225/x228). The last 40 px of
//   the shrunk picture blend into the fill so there is no seam.
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [SP, OUT, ss = '0.86'] = process.argv.slice(2);
const W = 2048, H = 2048, s = +ss, FEATHER = 40;
const rd = (vf) => execFileSync(FF, ['-v', 'error', '-i', SP, '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const S = rd(`scale=${W}:${H}`), B = rd(`scale=${W}:${H},gblur=sigma=48`);
const samp = (buf, x, y, c) => {
  x = Math.min(W - 1.001, Math.max(0, x)); y = Math.min(H - 1.001, Math.max(0, y));
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, i = (y0 * W + x0) * 3 + c;
  return (buf[i] * (1 - fx) + buf[i + 3] * fx) * (1 - fy) + (buf[i + W * 3] * (1 - fx) + buf[i + W * 3 + 3] * fx) * fy;
};
const out = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const sx = W / 2 + (x - W / 2) / s, sy = H - (H - y) / s;
  // distance (in output px) inside the shrunk picture's top/left/right edge; <= 0 means the opened band
  const d = Math.min(sx, W - 1 - sx, sy) * s;
  const t = d <= 0 ? 0 : Math.min(1, d / FEATHER);
  for (let c = 0; c < 3; c++) out[(y * W + x) * 3 + c] = Math.round(samp(S, sx, sy, c) * t + samp(B, sx, sy, c) * (1 - t));
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', OUT], { input: out });
console.log('headroom (smooth fill) ->', OUT, 'scale', s);
