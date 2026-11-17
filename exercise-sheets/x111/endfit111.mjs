// node endfit111.mjs <end.png> <out.png> [DX DY K] - x111 end-frame fit (17 Nov, 0 credits): the end frame came back with the whole scene
//   ~20 px higher and drawn ~1.2% larger (contact-check: feet dx -1.1 dy -20.4 scale 1.012, tower base dx -6.9 dy -18.8, roller -3.9/-14.7,
//   head -6.7/-4.2) - the feet, the tower and the head all moved together, so it is the camera, not the pose. The END frame is scaled
//   uniformly by 1/K about frame 1's feet and its feet are put back on frame 1's (nothing is warped; every proportion is kept); the band
//   this opens at the edges is filled by clamping to the nearest edge pixel (dark backdrop and floor).
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [EP, OUT, DXs = '-1.1', DYs = '-20.4', Ks = '1.012'] = process.argv.slice(2);
const W = 2048, H = 2048, K = +Ks;
const E = execFileSync(FF, ['-v', 'error', '-i', EP, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const START = [800, 1680], END = [800 + +DXs, 1680 + +DYs]; // frame 1's feet, and where the end frame drew them
const samp = (x, y, c) => {
  x = Math.min(W - 1.001, Math.max(0, x)); y = Math.min(H - 1.001, Math.max(0, y));
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, i = (y0 * W + x0) * 3 + c;
  return (E[i] * (1 - fx) + E[i + 3] * fx) * (1 - fy) + (E[i + W * 3] * (1 - fx) + E[i + W * 3 + 3] * fx) * fy;
};
const out = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const ex = END[0] + (x - START[0]) * K, ey = END[1] + (y - START[1]) * K;
  for (let c = 0; c < 3; c++) out[(y * W + x) * 3 + c] = Math.round(samp(ex, ey, c));
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', OUT], { input: out });
console.log('end fit ->', OUT, { DX: +DXs, DY: +DYs, K });
