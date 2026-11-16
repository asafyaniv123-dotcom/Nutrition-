// node composite315.mjs <start.png> <end-fit.png> <out.png> - x315 Composite Lock (from x147/composite147.mjs) (16 Nov, 0 credits):
//   the end frame was shifted back onto frame 1 (endfit315.mjs: bench foot 1.1 px, hands 5.9, bench leg 6.4) but the model also moved
//   the head ~22 px, and Asaf's brief freezes the whole upper body on the bench. So out = frame 1 everywhere - bench, torso, arms, head -
//   and the shifted end frame only in the moving region: the legs, the dumbbell and their reflections, i.e. everything left of the
//   lower back (x < 1250 of 2048 - the pelvis tilts as the legs rise, and a cut at 1000 showed two seats), feathered 40 px. Nothing is warped.
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [SP, EP, OUT] = process.argv.slice(2);
const W = 2048, H = 2048, X1 = 1250, Y0 = 250, F = 40;
const read = (p) => execFileSync(FF, ['-v', 'error', '-i', p, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const S = read(SP), E = read(EP);
const ramp = (d) => Math.max(0, Math.min(1, 0.5 + d / (2 * F))); // 0..1 across a 2F band centred on the edge
const out = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const m = ramp(X1 - x) * ramp(y - Y0), i = (y * W + x) * 3;
  for (let c = 0; c < 3; c++) out[i + c] = Math.round(S[i + c] * (1 - m) + E[i + c] * m);
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', OUT], { input: out });
console.log('composite ->', OUT);
