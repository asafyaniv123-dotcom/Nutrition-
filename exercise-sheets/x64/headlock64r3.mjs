// node headlock64r3.mjs <start.png> <end.png> <out.png> [F] - x64 head lock for end-r3 (Asaf, 17 Nov: "the head locked, not moving forward";
//   0 credits). headlock64.mjs with the end-r3 measurements: contact-check on the head dx -38.7 dy 0.0 - only the head moved, the body
//   is locked (shoes 0.0/0.3, seat 0.6, bench 0.0 px). Frame 1 head ellipse 1260,372 112x134 (unchanged start.png); the end-r3 head
//   1218,372 116x140 (read off the 2048 crop, widened after v1 left a faint arc of its left rim). Inside their union the picture is frame 1 - its head and its studio background where the
//   end head was. The near arm crosses in front of the chin: everything below its upper edge (1130,470)-(1550,360) stays end-r3. Feathered,
//   colour matched per channel as before. No limb is warped.
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [SP, EP, OUT, Fs = '10'] = process.argv.slice(2);
const F = Number(Fs);
const armY = (x) => 470 - (x - 1130) * 110 / 420;
const W = 2048, H = 2048;
const read = (p) => execFileSync(FF, ['-v', 'error', '-i', p, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const S = read(SP), E = read(EP);
const ELL = [[1260, 372, 112, 134], [1218, 372, 116, 140]];
const lum = (B, i) => 0.299 * B[i] + 0.587 * B[i + 1] + 0.114 * B[i + 2];
const weight = (x, y) => {
  let w = 0;
  for (const [cx, cy, rx, ry] of ELL) { const r = Math.hypot((x - cx) / rx, (y - cy) / ry); w = Math.max(w, Math.min(1, Math.max(0, (1 - r) * Math.min(rx, ry) / F + 0.5))); }
  const above = Math.min(1, Math.max(0, (armY(x) - y) / 4 + 0.5));
  return w * above;
};
const st = (B) => { const s = [0, 0, 0], q = [0, 0, 0]; let n = 0;
  for (let y = 230; y < 520; y++) for (let x = 1090; x < 1390; x++) { if (weight(x, y) < 1) continue; const i = (y * W + x) * 3; if (lum(B, i) < 90) continue; n++; for (let c = 0; c < 3; c++) { s[c] += B[i + c]; q[c] += B[i + c] ** 2; } }
  return s.map((v, c) => ({ m: v / n, sd: Math.sqrt(q[c] / n - (v / n) ** 2) })); };
const sS = st(S), sE = st(E);
const out = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = (y * W + x) * 3, t = (x > 1060 && x < 1400 && y > 220 && y < 540) ? weight(x, y) : 0;
  if (t === 0) { out[i] = E[i]; out[i + 1] = E[i + 1]; out[i + 2] = E[i + 2]; continue; }
  const k = Math.min(1, Math.max(0, (lum(S, i) - 60) / 40));
  for (let c = 0; c < 3; c++) {
    const m = (S[i + c] - sS[c].m) * (sE[c].sd / sS[c].sd) + sE[c].m;
    const s = S[i + c] * (1 - k) + m * k;
    out[i + c] = Math.max(0, Math.min(255, Math.round(E[i + c] * (1 - t) + s * t)));
  }
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', OUT], { input: out });
console.log('head lock v3 ->', OUT, { F, start: sS.map((v) => Math.round(v.m)), end: sE.map((v) => Math.round(v.m)) });
