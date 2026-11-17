// node shiftfit250.mjs <start.png> <end.png> <out.png> DX DY [Y0 F] - x250 end fix (Asaf, 17 Nov): the end frame slid the torso and head
//   toward the head of the bench. 1) the whole end frame is shifted by DX,DY (a global canvas shift - nothing inside it moves relative to
//   anything else); 2) below the line y = Y0 (2048 coords: the floor, the bench legs, the shins and the feet - far from the arms and the
//   bar) frame 1 is laid back in, feathered F px, so the floor and the feet stay exactly where frame 1 has them. No limb is warped.
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [SP, EP, OUT, DXs, DYs, Y0s = '-1', Fs = '24'] = process.argv.slice(2);
const DX = +DXs, DY = +DYs, Y0 = +Y0s, F = +Fs, W = 2048, H = 2048;
const read = (p) => execFileSync(FF, ['-v', 'error', '-i', p, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const S = read(SP), E = read(EP);
const out = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = (y * W + x) * 3;
  const s = Y0 < 0 ? 0 : Math.min(1, Math.max(0, (y - Y0 + F) / (2 * F))); // 1 = frame 1
  const ex = Math.min(W - 1, Math.max(0, x - DX)), ey = Math.min(H - 1, Math.max(0, y - DY)), j = (ey * W + ex) * 3;
  for (let c = 0; c < 3; c++) out[i + c] = Math.round(S[i + c] * s + E[j + c] * (1 - s));
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', OUT], { input: out });
console.log('shiftfit ->', OUT, { DX, DY, Y0, F });
