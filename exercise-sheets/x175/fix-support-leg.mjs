// node fix-support-leg.mjs <end.png> <out.png> - x175 (Asaf, 15 Nov, 0 credits): put the standing leg of frame 2 back where frame 1's support
//   foot stands. One smooth displacement field, no cut-and-paste: every pixel in the lower right of the figure is read from a little to its
//   right, by t(y) * w(x) * the foot offset - t is 0 at the shorts' hem (the thigh stays attached) and 1 from the ankle down (the shoe, the
//   floor and its reflection move together); w is 1 over the new leg and fades to 0 on both sides, so the old foot's place is refilled with
//   the background that was beside it, and nothing else is touched. The thin cable in front of the leg is kept exactly as it was.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
const [IN, OUT] = process.argv.slice(2);
const FF = path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const N = 2048;
const E = execFileSync(FF, ['-v', 'error', '-i', IN, '-vf', `scale=${N}:${N},format=rgb24`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 26 });
const O = Buffer.from(E);
const DX = -76, DY = 19;                 // frame 1 heel = frame 2 heel + (DX, DY), from contact-check
const Y0 = 1165, Y1 = 1660;              // hem -> ankle ramp
const ss = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
const w = (x) => ss(640, 780, x) * (1 - ss(1000, 1090, x));
const cable = (x) => 1332.2 - 0.07912 * (x - 874);   // fitted: cablefit.mjs
const core = (x, y) => Math.abs(y - cable(x)) <= 3;
const samp = (x, y, c) => { // bilinear
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, i = (yi * N + xi) * 3 + c;
  return (E[i] * (1 - fx) + E[i + 3] * fx) * (1 - fy) + (E[i + N * 3] * (1 - fx) + E[i + N * 3 + 3] * fx) * fy;
};
for (let y = Y0; y < N; y++) {
  const t = ss(Y0, Y1, y);
  for (let x = 600; x < 1260; x++) {
    const k = t * w(x); if (!k || core(x, y)) continue;
    const sx = x - DX * k, sy = Math.min(N - 2, y - DY * k);
    const io = (y * N + x) * 3;
    for (let c = 0; c < 3; c++) O[io + c] = Math.round(samp(sx, sy, c));
  }
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${N}x${N}`, '-i', '-', OUT], { input: O });
console.log('fixed ->', OUT);
