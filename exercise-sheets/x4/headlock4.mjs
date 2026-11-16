// node headlock4.mjs <start.png> <end.png> <out.png> [ARMX F ARMX2 FR] - x4 head lock (Asaf, 16 Nov, 0 credits): the end frame turned the head
//   ~36 px forward. Inside an ellipse around both heads and the neck (the union of where the head is in frame 1 and in the end), the
//   picture comes from frame 1 - its head, and its plain studio background where the end's head used to be, so nothing is left behind.
//   The near arm passes IN FRONT of frame 1's head in the end frame, so everything right of the arm's left edge stays the end frame's:
//   the arm and the dumbbell are never cut by the mask. The edge slants - ARMX at row 460, ARMX2 at row 600, read off brightness rows
//   (the rim peaks at 1390 / 1374) - and above row 460 it stays at ARMX, so the upper arm is not notched. Feathered F px at the arm,
//   FR px at the ellipse rim so the neck seam fades. v2: frame 1's head is a little greyer than the end frame's figure, so its bright
//   pixels are brought to the end's colour (per channel mean/sd of the figure pixels on each side) before they are blended in.
//   No limb is warped. Python is not installed here (only the Windows Store stub), so this is node + ffmpeg like composite119/182.
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [SP, EP, OUT, ARMXs = '1386', Fs = '4', ARMX2s = '1370', FRs = '24'] = process.argv.slice(2);
const ARMX = Number(ARMXs), F = Number(Fs), ARMX2 = Number(ARMX2s), FR = Number(FRs);
const armX = (y) => (y < 460 ? ARMX : ARMX + (ARMX2 - ARMX) * (y - 460) / 140);
const W = 2048, H = 2048;
const read = (p) => execFileSync(FF, ['-v', 'error', '-i', p, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const S = read(SP), E = read(EP);
const CX = 1330, CY = 550, RX = 150, RY = 140; // both heads and the neck, 2048 coords
const weight = (x, y) => {
  const r = Math.hypot((x - CX) / RX, (y - CY) / RY);
  const inE = Math.min(1, Math.max(0, (1 - r) * Math.min(RX, RY) / FR));
  const left = Math.min(1, Math.max(0, (armX(y) - x) / F + 0.5));
  return inE * left;
};
// colour match: figure pixels (luma > 90) inside the ellipse, left of the arm, in each frame
const lum = (B, i) => 0.299 * B[i] + 0.587 * B[i + 1] + 0.114 * B[i + 2];
const st = (B) => { const s = [0, 0, 0], q = [0, 0, 0]; let n = 0;
  for (let y = CY - RY; y < CY + RY; y++) for (let x = CX - RX; x < CX + RX; x++) { if (weight(x, y) < 1) continue; const i = (y * W + x) * 3; if (lum(B, i) < 90) continue; n++; for (let c = 0; c < 3; c++) { s[c] += B[i + c]; q[c] += B[i + c] ** 2; } }
  return s.map((v, c) => ({ m: v / n, sd: Math.sqrt(q[c] / n - (v / n) ** 2) })); };
const sS = st(S), sE = st(E);
const out = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = (y * W + x) * 3, t = weight(x, y);
  if (t === 0) { out[i] = E[i]; out[i + 1] = E[i + 1]; out[i + 2] = E[i + 2]; continue; }
  const k = Math.min(1, Math.max(0, (lum(S, i) - 60) / 40)); // background stays as it is, the figure takes the end's colour
  for (let c = 0; c < 3; c++) {
    const m = (S[i + c] - sS[c].m) * (sE[c].sd / sS[c].sd) + sE[c].m;
    const s = S[i + c] * (1 - k) + m * k;
    out[i + c] = Math.max(0, Math.min(255, Math.round(E[i + c] * (1 - t) + s * t)));
  }
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', OUT], { input: out });
console.log('head lock ->', OUT, { ARMX, F, ARMX2, FR, start: sS.map((v) => Math.round(v.m)), end: sE.map((v) => Math.round(v.m)) });
