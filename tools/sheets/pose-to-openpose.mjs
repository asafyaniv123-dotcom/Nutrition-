// node tools/sheets/pose-to-openpose.mjs <start-landmarks.json> <end-landmarks.json> <outDir> [moving=arms] [size=1024]
// MediaPipe landmarks (pose-extract.mjs) of a real person -> the two OpenPose point sets that pose-skeleton.mjs draws.
//  - both frames share ONE square crop around the person (union of both, +18%), so the skeletons line up;
//  - the end frame is first aligned to the start by a similarity fit on the parts that do not move (hips, knees, ankles)
//    - the reference camera drifts between the two moments, and a drift would come out as a sliding bench;
//  - then everything but the moving limbs is taken from the START, so the two control images differ only where the
//    exercise moves (moving = arms | legs | arms,legs). Writes start.json, end.json and crop.json in <outDir>.
import fs from 'fs'; import path from 'path';
const [fa, fb, out, moving = 'arms', sz = '1024'] = process.argv.slice(2);
const A = JSON.parse(fs.readFileSync(fa, 'utf8')), B = JSON.parse(fs.readFileSync(fb, 'utf8')), S = +sz;
const MAP = { nose: 0, r_shoulder: 12, r_elbow: 14, r_wrist: 16, l_shoulder: 11, l_elbow: 13, l_wrist: 15, r_hip: 24, r_knee: 26, r_ankle: 28,
  l_hip: 23, l_knee: 25, l_ankle: 27, r_eye: 5, l_eye: 2, r_ear: 8, l_ear: 7 };
const MOVE = { arms: ['r_elbow', 'r_wrist', 'l_elbow', 'l_wrist'], legs: ['r_knee', 'r_ankle', 'l_knee', 'l_ankle'] };
const moves = moving.split(',').flatMap((m) => MOVE[m] || []);
const STILL = [23, 24, 25, 26, 27, 28].filter((i) => !moves.some((n) => MAP[n] === i)).concat(moving.includes('legs') ? [23, 24, 11, 12] : []);
// similarity transform (scale, rotation, shift) taking B's still points onto A's
function fit(src, dst) {
  const n = src.length, mx = (p, k) => p.reduce((s, q) => s + q[k], 0) / n;
  const sx = mx(src, 0), sy = mx(src, 1), dx = mx(dst, 0), dy = mx(dst, 1);
  let a = 0, b = 0, d = 0;
  for (let i = 0; i < n; i++) { const x = src[i][0] - sx, y = src[i][1] - sy, u = dst[i][0] - dx, v = dst[i][1] - dy; a += x * u + y * v; b += x * v - y * u; d += x * x + y * y; }
  const c = a / d, s = b / d;
  return (p) => [c * (p[0] - sx) - s * (p[1] - sy) + dx, s * (p[0] - sx) + c * (p[1] - sy) + dy];
}
const P = (L, i) => [L.landmarks[i].x, L.landmarks[i].y];
const T = fit(STILL.map((i) => P(B, i)), STILL.map((i) => P(A, i)));
const res = STILL.map((i) => Math.hypot(...T(P(B, i)).map((v, k) => v - P(A, i)[k]))).reduce((s, v) => s + v, 0) / STILL.length;
const ptsA = {}, ptsB = {};
for (const [n, i] of Object.entries(MAP)) { ptsA[n] = P(A, i); ptsB[n] = moves.includes(n) ? T(P(B, i)) : P(A, i); }
for (const o of [ptsA, ptsB]) o.neck = [(o.l_shoulder[0] + o.r_shoulder[0]) / 2, (o.l_shoulder[1] + o.r_shoulder[1]) / 2];
// one square crop around both
const all = [...Object.values(ptsA), ...Object.values(ptsB)];
const x0 = Math.min(...all.map((p) => p[0])), x1 = Math.max(...all.map((p) => p[0])), y0 = Math.min(...all.map((p) => p[1])), y1 = Math.max(...all.map((p) => p[1]));
const side = Math.max(x1 - x0, y1 - y0) * 1.18, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, ox = cx - side / 2, oy = cy - side / 2, k = S / side;
const toSq = (o) => Object.fromEntries(Object.entries(o).map(([n, p]) => [n, [Math.round((p[0] - ox) * k), Math.round((p[1] - oy) * k)]]));
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'start.json'), JSON.stringify({ points: toSq(ptsA) }));
fs.writeFileSync(path.join(out, 'end.json'), JSON.stringify({ points: toSq(ptsB) }));
fs.writeFileSync(path.join(out, 'crop.json'), JSON.stringify({ x: Math.round(ox), y: Math.round(oy), side: Math.round(side), size: S }));
// which arm is nearer the camera (MediaPipe z: smaller = nearer) - the prompt should say it, a flat skeleton cannot
const zr = A.landmarks[12].z, zl = A.landmarks[11].z;
console.log(JSON.stringify({ still_fit_residual_px: +res.toFixed(1), crop: { x: Math.round(ox), y: Math.round(oy), side: Math.round(side) }, nearer: zr < zl ? 'right side (r_*)' : 'left side (l_*)' }));
