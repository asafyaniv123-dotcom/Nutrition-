// node headlock64.mjs <start.png> <end.png> <out.png> [F] - x64 head lock (Asaf, 17 Nov, 0 credits; from x4/headlock4.mjs): the end frame
//   moved the head ~50 px forward and ~17 px down (contact-check on the head: dx -49.8, dy 17.3). v3 - the mask is the union of two
//   ellipses, each fitted to one head (frame 1's: centre 1260,372, radii 112 x 134; the end's: 1208,372, 104 x 108, read off the 2048 crop):
//   inside it the picture comes from frame 1 - its head, and its plain studio background where the end's head used to be. v1 was one wide
//   ellipse: its narrow left side left a faint arc of the end's head and its rim faded frame 1's skull. v2 took every bright pixel in a box
//   and pasted frame 1's shoulders with hard box edges. The near arm crosses IN FRONT of frame 1's chin in the end frame, so everything below
//   the arm's upper edge (a line from 1140,480 to 1500,370) stays the end frame's. Feathered F px; frame 1's bright pixels are brought to
//   the end frame's colour (per channel mean/sd), as in x4. No limb is warped.
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [SP, EP, OUT, Fs = '10'] = process.argv.slice(2);
const F = Number(Fs);
const armY = (x) => 480 - (x - 1140) * 110 / 360;
const W = 2048, H = 2048;
const read = (p) => execFileSync(FF, ['-v', 'error', '-i', p, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const S = read(SP), E = read(EP);
const ELL = [[1260, 372, 112, 134], [1208, 372, 104, 108]];
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
