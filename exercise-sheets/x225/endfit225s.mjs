// node endfit225s.mjs <end.png> <out.png> [s=0.98] (x225: at s=1 the head lands 0.111 high, at 0.95 the pelvis 0.121 low - the mannequin's legs are shorter than the reference's; 0.98 puts both inside 0.1) - x225 end-frame fit (16 Nov, 0 credits; from x227/endfit227.mjs): the end frame came back with the whole
//   scene drawn ~6% larger and ~118 px higher (contact-check on the left shoe: dx 2.7, dy -117.6, scale 1.02; the standing figure is
//   653/1024 tall where frame 1 x the reference's own stand/squat ratio 1.52 gives 616). stage-c's foot-fit scales FRAME 1 onto the end
//   soles instead, which shrank the approved squat by 16% and made the head travel 171% of the reference. So the END frame is scaled
//   uniformly by s about its left shoe and that shoe is put back on frame 1's (nothing is warped; every proportion is kept); the band
//   this opens at the edges is filled by clamping to the nearest edge pixel (dark backdrop and floor).
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [EP, OUT, ss = '0.98'] = process.argv.slice(2);
const W = 2048, H = 2048, s = +ss;
const E = execFileSync(FF, ['-v', 'error', '-i', EP, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const START = [1140, 1734], END = [1140 - 8.1, 1734 - 47.6]; // far-shoe box centre in frame 1 (the near one hides behind the plate), and where contact-check found it in the end frame
const samp = (x, y, c) => {
  x = Math.min(W - 1.001, Math.max(0, x)); y = Math.min(H - 1.001, Math.max(0, y));
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, i = (y0 * W + x0) * 3 + c;
  return (E[i] * (1 - fx) + E[i + 3] * fx) * (1 - fy) + (E[i + W * 3] * (1 - fx) + E[i + W * 3 + 3] * fx) * fy;
};
const out = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const ex = END[0] + (x - START[0]) / s, ey = END[1] + (y - START[1]) / s;
  for (let c = 0; c < 3; c++) out[(y * W + x) * 3 + c] = Math.round(samp(ex, ey, c));
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', OUT], { input: out });
console.log('end fit ->', OUT, 'scale', s);
