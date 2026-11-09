// node tools/sheets/frame-pair.mjs <pair.png> <outDir> [x0,y0,x1,y1,w,h] - two frames from a two-panel generation that sit on each
// other and fill the square (Asaf, 9 Nov: "the frames don't sit on each other", "the edges drown in black").
//  1. each panel taken whole (default insets drop the thin border the model sometimes draws): start 40,40 / end 1384,40, 1264x1072.
//  2. the end panel is aligned to the start by SCALE and SHIFT together, searched coarse-to-fine; the loss is the trimmed mean
//     of the absolute difference over lit pixels, lowest 55% only, so the limbs that move do not vote. A shift-only band
//     measurement had left a few-percent size change in every pair.
//  3. one square for both frames around the union of the lit content (+12%). If it fits inside the panel height it is cut
//     straight from the panel - no fill. If the content is wider, the panel is kept whole and the missing rows above and
//     below are filled from the panel itself: the floor MIRRORED, the sky as its own flat colour (a mirror reflected the
//     dumbbells of x4 that reach the top; a flat or feathered ground all round read as a box, or as drowning in black).
// Writes <outDir>/start.png, end.png and prints the transform. Colour is left to the caller.
import { execFileSync } from 'child_process'; import os from 'os'; import path from 'path'; import fs from 'fs';
const FF = path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [pair, out, geo] = process.argv.slice(2);
const TRIM = +(process.env.TRIM || 0.55);
// REGION=x0,y0,x1,y1 (fractions of the panel): measure only there - the box of a step-up, the bench of a bridge. When the
// whole body moves (x145, x219, x20, x240 on 9 Nov) the trimmed loss aligns the BODY and throws the equipment off by 100px.
// NOALIGN=1 keeps the panels as they are (a jump has nothing that stays).
const REG = (process.env.REGION || '0,0,1,1').split(',').map(Number), NOALIGN = process.env.NOALIGN === '1';
const [sx, sy, ex, ey, W, H] = (geo || '40,40,1384,40,1264,1072').split(',').map(Number);
fs.mkdirSync(out, { recursive: true });
const tmp = (n) => path.join(out, '_' + n);
const ff = (a) => execFileSync(FF, ['-v', 'error', '-y', ...a]);
ff(['-i', pair, '-vf', `crop=${W}:${H}:${sx}:${sy}`, tmp('s.png')]);
ff(['-i', pair, '-vf', `crop=${W}:${H}:${ex}:${ey}`, tmp('e.png')]);
const gray = (f, w, h) => execFileSync(FF, ['-v', 'error', '-i', f, '-vf', `scale=${w}:${h},format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 26 });
function loss(A, B, w, h, s, dx, dy) {          // B sampled at (x - cx)/s + cx - dx: the end frame scaled by s about the centre, then shifted
  const cx = w / 2, cy = h / 2, d = [];
  const ry0 = Math.max(4, Math.floor(REG[1] * h)), ry1 = Math.min(h - 4, Math.ceil(REG[3] * h)), rx0 = Math.max(4, Math.floor(REG[0] * w)), rx1 = Math.min(w - 4, Math.ceil(REG[2] * w));
  for (let y = ry0; y < ry1; y += 1) for (let x = rx0; x < rx1; x += 1) {
    const a = A[y * w + x], bx = Math.round((x - cx - dx) / s + cx), by = Math.round((y - cy - dy) / s + cy);
    if (bx < 0 || by < 0 || bx >= w || by >= h) continue;
    const b = B[by * w + bx]; if (a < 40 && b < 40) continue;
    d.push(Math.abs(a - b));
  }
  if (d.length < 50) return 1e9;
  d.sort((p, q) => p - q); const k = Math.floor(d.length * TRIM); let t = 0; for (let i = 0; i < k; i++) t += d[i]; return t / k;
}
function search(w, s0, d0, sr, ss, dr) {
  const h = Math.round(w * H / W), A = gray(tmp('s.png'), w, h), B = gray(tmp('e.png'), w, h);
  let best = [1e9];
  for (let s = s0 - sr; s <= s0 + sr + 1e-9; s += ss) for (let dx = d0[0] - dr; dx <= d0[0] + dr; dx++) for (let dy = d0[1] - dr; dy <= d0[1] + dr; dy++) {
    const l = loss(A, B, w, h, s, dx, dy); if (l < best[0]) best = [l, s, dx, dy];
  }
  return best;
}
let [l1, s1, dx1, dy1] = NOALIGN ? [0, 1, 0, 0] : search(128, 1, [0, 0], 0.06, 0.01, 10);
const k2 = 512 / 128; let [l2, s2, dx2, dy2] = NOALIGN ? [0, 1, 0, 0] : search(512, s1, [dx1 * k2, dy1 * k2], 0.012, 0.003, 4);
const sc = W / 512, DX = dx2 * sc, DY = dy2 * sc;
const unshift = loss(gray(tmp('s.png'), 512, Math.round(512 * H / W)), gray(tmp('e.png'), 512, Math.round(512 * H / W)), 512, Math.round(512 * H / W), 1, 0, 0);
// apply: scale the end panel by s2 about its centre, shift by DX,DY, keep W x H (edges filled by mirroring)
const SW = Math.round(W * s2 / 2) * 2, SH = Math.round(H * s2 / 2) * 2;
const ox = Math.round((W - SW) / 2 + DX), oy = Math.round((H - SH) / 2 + DY), P = 200;
ff(['-i', tmp('e.png'), '-vf', `scale=${SW}:${SH},pad=${SW + 2 * P}:${SH + 2 * P}:${P}:${P},fillborders=left=${P}:right=${P}:top=${P}:bottom=${P}:mode=mirror,crop=${W}:${H}:${P - ox}:${P - oy}`, tmp('ea.png')]);
// content box: lit pixels in either frame
const w4 = 316, h4 = Math.round(w4 * H / W), A = gray(tmp('s.png'), w4, h4), B = gray(tmp('ea.png'), w4, h4);
let x0 = w4, y0 = h4, x1 = 0, y1 = 0;
for (let y = 0; y < h4; y++) for (let x = 0; x < w4; x++) if (Math.max(A[y * w4 + x], B[y * w4 + x]) > 90) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
const f4 = W / w4; [x0, x1, y0, y1] = [x0 * f4, x1 * f4, y0 * f4, y1 * f4];
let L = Math.round(Math.max(x1 - x0, y1 - y0) * 1.12), mode;
const cxB = (x0 + x1) / 2, cyB = (y0 + y1) / 2;
let vf;
if (L <= H) {
  mode = 'cut';
  const cx = Math.round(Math.min(Math.max(cxB - L / 2, 0), W - L)), cy = Math.round(Math.min(Math.max(cyB - L / 2, 0), H - L));
  vf = `crop=${L}:${L}:${cx}:${cy},scale=1152:1152`;
} else {
  mode = 'mirror';
  L = Math.min(L, W);
  const cx = Math.round(Math.min(Math.max(cxB - L / 2, 0), W - L)), pt = Math.round((L - H) / 2), pb = L - H - pt;
  const rgb = execFileSync(FF, ['-v', 'error', '-i', tmp('s.png'), '-vf', `crop=${W}:6:0:0,scale=1:1,format=rgb24`, '-f', 'rawvideo', '-']);
  const sky = '0x' + [...rgb].map((v) => v.toString(16).padStart(2, '0')).join('');
  vf = `crop=${L}:${H}:${cx}:0,pad=${L}:${L}:0:${pt}:color=${sky},fillborders=bottom=${pb}:mode=mirror,scale=1152:1152`;
}
ff(['-i', tmp('s.png'), '-vf', vf, path.join(out, 'start.png')]);
ff(['-i', tmp('ea.png'), '-vf', vf, path.join(out, 'end.png')]);
for (const n of ['s.png', 'e.png', 'ea.png']) fs.rmSync(tmp(n));
console.log(JSON.stringify({ scale: +s2.toFixed(3), dx: Math.round(DX), dy: Math.round(DY), loss: +l2.toFixed(2), unaligned: +unshift.toFixed(2), mode, box: [x0, y0, x1, y1].map(Math.round), L }));
