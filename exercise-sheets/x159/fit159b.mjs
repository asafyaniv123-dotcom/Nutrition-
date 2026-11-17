// node fit159b.mjs <end.png> <out.png> DX DY K - x159 end-lm-r2 fit (17 Nov, 0 credits): the end frame came back with the whole scene ~18 px
//   higher (contact-check: far shoe dy -19.1 scale 1.024, bench foot dy -18.1 scale 1.039) - the camera, not the pose. Scaled uniformly by 1/K
//   about the point between the shoes and the bench foot (1030,1380) and put back on frame 1 (endfit111.mjs with this anchor). Nothing warped.
//   this opens at the edges is filled by clamping to the nearest edge pixel (dark backdrop and floor).
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [EP, OUT, DXs, DYs, Ks] = process.argv.slice(2);
const W = 2048, H = 2048, K = +Ks;
const E = execFileSync(FF, ['-v', 'error', '-i', EP, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const START = [1030, 1380], END = [1030 + +DXs, 1380 + +DYs]; // the anchor in frame 1, and where the end frame drew it
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
