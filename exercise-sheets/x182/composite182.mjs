// node composite182.mjs <start.png> <end.png> <out.png> [DX DY WX WY F] - x182 lower-body lock (Asaf, 16 Nov): the end frame was
//   generated as a direct copy of ref-end (frame-1 style), so its legs drifted from frame 1 (feet 34 px, knees 14, seat 18). The end is
//   first shifted by DX,DY (its seat onto frame 1's seat), then everything on the feet side of a line across the body at the waist
//   (WX,WY), square to the body's axis (seat -> head), comes from frame 1, feathered F px. No limb is warped: the legs are frame 1's own,
//   the upper body is the end frame's own, and the seam runs across the waistband.
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [SP, EP, OUT, DXs = '7', DYs = '17', WXs = '1000', WYs = '1000', Fs = '40'] = process.argv.slice(2);
const [DX, DY, WX, WY, F] = [DXs, DYs, WXs, WYs, Fs].map(Number);
const W = 2048, H = 2048;
const read = (p) => execFileSync(FF, ['-v', 'error', '-i', p, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const S = read(SP), E = read(EP);
// body axis, seat -> head, in frame 1 (2048 coords)
const AX = 1450 - 900, AY = 500 - 1200, AL = Math.hypot(AX, AY), ux = AX / AL, uy = AY / AL;
const out = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const d = (x - WX) * ux + (y - WY) * uy;           // < 0: the feet side
  const t = Math.min(1, Math.max(0, (d + F) / (2 * F))); // 0 = frame 1, 1 = end
  const ex = Math.min(W - 1, Math.max(0, x - DX)), ey = Math.min(H - 1, Math.max(0, y - DY));
  const i = (y * W + x) * 3, j = (ey * W + ex) * 3;
  for (let c = 0; c < 3; c++) out[i + c] = Math.round(S[i + c] * (1 - t) + E[j + c] * t);
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', OUT], { input: out });
console.log('composite ->', OUT, { DX, DY, WX, WY, F });
