// node farleg226.mjs <end-fit.png> <start.png> <out.png> [DX=68] - x226 far-leg slide (Asaf, 16 Nov: "move the far foot and shin out
//   ~67 px so it locks on frame 1's far foot", 0 credits). The model narrowed the stance when he stood up: contact-check put the far
//   shoe 67 px inside frame 1's (and 7 px low) while the near shoe sits at 0.3 px.
//   v2 - the far leg is a LAYER, not a seam: v1 cut a column per row through the gap, which split the far thigh where it hides behind
//   the near one (a notch at the knee) and left a piece of heel behind. Now:
//   - LEG = a polygon traced round the far leg on end-fit.png (thigh from the shorts hem, knee, shin, shoe, and its reflection),
//     grown 14 px for the amber halo and feathered 8 px.
//   - the layer is slid right by d(y), linear from 0 at the hem (y 1073) to DX at the ankle (y 1560) - a straight tilt of thigh and
//     shin, no bend - and up by up to 7 px at shoe level to sit on frame 1's sole line.
//   v3 - NEAR = the near leg's right edge per row (thigh 990, shin 965, toe 995, reflection 990): nothing left of it is moved or
//     filled (v2's grown mask ate the near thigh - a notch - and carried the near toe tip along - a ghost stub). The hole fill is
//     averaged over 9 rows so the per-row blend draws no streaks.
//   - where the leg used to be and nothing covers it now: frame 1's own floor at shoe/reflection rows (the shoes now stand where frame
//     1's do, so frame 1 has clean floor there), above that a horizontal blend between the pixels either side of the hole.
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [EP, SP, OUT, dxs = '68'] = process.argv.slice(2);
const W = 2048, H = 2048, DX = +dxs, HEM = 1073, ANK = 1560, FLOOR = 1540, DYF = 7, GROW = 14, FEATHER = 8;
const rd = (p) => execFileSync(FF, ['-v', 'error', '-i', p, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const E = rd(EP), S = rd(SP);
const LEG = [[980, HEM], [1120, HEM], [1087, 1200], [1073, 1333], [1067, 1400], [1047, 1540], [1067, 1567], [1211, 1653], [1200, 1673],
  [1215, 2048], [990, 2048], [973, 1680], [967, 1600], [987, 1560], [947, 1400], [971, 1267], [980, 1133]];
const inPoly = (x, y) => { let c = false; for (let i = 0, j = LEG.length - 1; i < LEG.length; j = i++) { const [xi, yi] = LEG[i], [xj, yj] = LEG[j];
  if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
// mask: polygon, grown by GROW (box max), then feathered (box blur)
let m = new Float32Array(W * H); for (let y = HEM; y < H; y++) for (let x = 900; x < 1300; x++) if (inPoly(x, y)) m[y * W + x] = 1;
const pass = (src, r, horiz, op) => { const o = new Float32Array(W * H); for (let a = 0; a < H; a++) for (let b = 0; b < W; b++) {
  let v = op === 'max' ? 0 : 0; for (let k = -r; k <= r; k++) { const q = b + k; if (q < 0 || q >= W) continue; const s = horiz ? src[a * W + q] : src[q * W + a];
    v = op === 'max' ? Math.max(v, s) : v + s; } horiz ? (o[a * W + b] = op === 'max' ? v : v / (2 * r + 1)) : (o[b * W + a] = op === 'max' ? v : v / (2 * r + 1)); } return o; };
m = pass(pass(m, GROW, true, 'max'), GROW, false, 'max');
const NEAR = (y) => y < 1160 ? 990 : y < 1560 ? 990 - 25 * Math.min(1, (y - 1160) / 120) : y < 1720 ? 995 : 990;
for (let y = 0; y < H; y++) { const e = NEAR(y); for (let x = 0; x < e; x++) m[y * W + x] = 0; }
const hard = m.slice();
for (let y = 0; y < HEM; y++) for (let x = 0; x < W; x++) { m[y * W + x] = 0; hard[y * W + x] = 0; } // nothing above the hem moves
m = pass(pass(m, FEATHER, true, 'avg'), FEATHER, false, 'avg');
for (let y = 0; y < H; y++) { const e = NEAR(y); for (let x = 0; x < e; x++) m[y * W + x] = 0; }
const d = (y) => DX * Math.max(0, Math.min(1, (y - HEM) / (ANK - HEM)));
const up = (y) => y < FLOOR - 90 ? 0 : DYF * Math.min(1, (y - (FLOOR - 90)) / 90);
const sampE = (x, y, c) => { x = Math.min(W - 1.001, Math.max(0, x)); y = Math.min(H - 1, Math.max(0, Math.round(y))); const x0 = Math.floor(x), fx = x - x0, i = (y * W + x0) * 3 + c; return E[i] * (1 - fx) + E[i + 3] * fx; };
const sampM = (x, y) => { x = Math.min(W - 1, Math.max(0, Math.round(x))); y = Math.min(H - 1, Math.max(0, Math.round(y))); return m[y * W + x]; };
const out = Buffer.from(E), fill = new Float32Array(W * H * 3), isHole = new Uint8Array(W * H);
for (let y = HEM; y < H; y++) {
  const dd = d(y), uu = up(y);
  // the hole on this row: where the old leg was (hard mask) - filled before the moved layer goes on top
  let x = 0;
  while (x < W) {
    if (!hard[y * W + x]) { x++; continue; }
    let x1 = x; while (x1 < W && hard[y * W + x1]) x1++;
    const L = Math.max(0, x - 1), R = Math.min(W - 1, x1);
    for (let k = x; k < x1; k++) for (let c = 0; c < 3; c++) {
      const i = (y * W + k) * 3 + c;
      fill[i] = y >= FLOOR ? S[i] : E[(y * W + L) * 3 + c] + (E[(y * W + R) * 3 + c] - E[(y * W + L) * 3 + c]) * (k - L) / Math.max(1, R - L);
      isHole[y * W + k] = 1;
    }
    x = x1;
  }
}
for (let y = HEM; y < H; y++) for (let x = 0; x < W; x++) { if (!isHole[y * W + x]) continue;
  for (let c = 0; c < 3; c++) { let s2 = 0, n = 0; if (y >= FLOOR) { s2 = fill[(y * W + x) * 3 + c]; n = 1; } else for (let k = -4; k <= 4; k++) { const j = y + k; if (j >= HEM && j < FLOOR && isHole[j * W + x]) { s2 += fill[(j * W + x) * 3 + c]; n++; } }
    out[(y * W + x) * 3 + c] = Math.round(s2 / Math.max(1, n)); } }
for (let y = HEM; y < H; y++) {
  const dd = d(y), uu = up(y);
  // the moved leg layer on top, with its own (moved) feathered mask
  for (let x2 = 880; x2 < 1400; x2++) {
    const sx = x2 - dd, sy = y + uu, a = sampM(sx, sy);
    if (a <= 0) continue;
    for (let c = 0; c < 3; c++) { const i = (y * W + x2) * 3 + c; out[i] = Math.round(out[i] * (1 - a) + sampE(sx, sy, c) * a); }
  }
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', OUT], { input: out });
console.log('far leg layer slid', DX, 'px ->', OUT);
