// node endfit208.mjs <end.png> <out.png> - x208 end-frame fit (16 Nov, 0 credits; from x226/endfit226.mjs): the end frame came back
//   ~39 px higher (contact-check: near shoe dx -1.5 dy -38.6, far shoe dx -5.2 dy -38.8, bar end dx 2.3 dy -41.1 - their mean is taken), so the END frame is moved back
//   down onto frame 1's two shoes and bar end (their mean), whole picture, no scaling, nothing warped. The band this opens at the top is filled from a heavily
//   blurred copy clamped to the edge (as headroom2.mjs does), so it carries no grain streaks.
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [EP, OUT] = process.argv.slice(2);
const W = 2048, H = 2048, DX = -1.5, DY = -39.5, FEATHER = 40;
const rd = (vf) => execFileSync(FF, ['-v', 'error', '-i', EP, '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const E = rd(`scale=${W}:${H}`), B = rd(`scale=${W}:${H},gblur=sigma=48`);
const samp = (buf, x, y, c) => {
  x = Math.min(W - 1.001, Math.max(0, x)); y = Math.min(H - 1.001, Math.max(0, y));
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, i = (y0 * W + x0) * 3 + c;
  return (buf[i] * (1 - fx) + buf[i + 3] * fx) * (1 - fy) + (buf[i + W * 3] * (1 - fx) + buf[i + W * 3 + 3] * fx) * fy;
};
const out = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const ex = x + DX, ey = y + DY, d = Math.min(ex, W - 1 - ex, ey, H - 1 - ey), t = d <= 0 ? 0 : Math.min(1, d / FEATHER);
  for (let c = 0; c < 3; c++) out[(y * W + x) * 3 + c] = Math.round(samp(E, ex, ey, c) * t + samp(B, ex, ey, c) * (1 - t));
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', OUT], { input: out });
console.log('end fit ->', OUT);
