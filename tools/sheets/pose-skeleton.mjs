// node tools/sheets/pose-skeleton.mjs <pose.json> <out.png> [size=1024] - draw an OpenPose (COCO-18) control image for a
// pose ControlNet (fal-ai/flux-general, controlnet_unions mode "pose"). fal has no skeleton extractor, so the skeleton is
// written by hand: pose.json = { "points": { "nose":[x,y], "neck":[x,y], ... } } in pixels of a <size> square. A point
// left out is simply not drawn (a hidden ear). Standard OpenPose limb order and colours, on black, so the model reads it
// as the skeleton it was trained on. The start and end of one exercise share every point but the ones that move - which
// is what makes the two frames sit on each other by construction (Asaf, 9 Nov: the bench "falls", the neck is too long).
import fs from 'fs'; import os from 'os'; import path from 'path'; import { execFileSync } from 'child_process';
const FF = path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const NAMES = ['nose', 'neck', 'r_shoulder', 'r_elbow', 'r_wrist', 'l_shoulder', 'l_elbow', 'l_wrist', 'r_hip', 'r_knee', 'r_ankle',
  'l_hip', 'l_knee', 'l_ankle', 'r_eye', 'l_eye', 'r_ear', 'l_ear'];
const LIMBS = [[1, 2], [1, 5], [2, 3], [3, 4], [5, 6], [6, 7], [1, 8], [8, 9], [9, 10], [1, 11], [11, 12], [12, 13], [1, 0], [0, 14], [14, 16], [0, 15], [15, 17]];
const COLORS = [[255, 0, 0], [255, 85, 0], [255, 170, 0], [255, 255, 0], [170, 255, 0], [85, 255, 0], [0, 255, 0], [0, 255, 85], [0, 255, 170],
  [0, 255, 255], [0, 170, 255], [0, 85, 255], [0, 0, 255], [85, 0, 255], [170, 0, 255], [255, 0, 255], [255, 0, 170], [255, 0, 85]];
const [src, out, sz = '1024'] = process.argv.slice(2);
const S = +sz, P = JSON.parse(fs.readFileSync(src, 'utf8')).points, buf = Buffer.alloc(S * S * 3);
const pt = (i) => P[NAMES[i]];
const k = S / 512, W = 4 * k, R = 4 * k;               // OpenPose draws 4px limbs and joints at 512
function plot(x, y, c, a = 1) {
  x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= S || y >= S) return;
  const i = (y * S + x) * 3; for (let j = 0; j < 3; j++) buf[i + j] = Math.round(buf[i + j] * (1 - a) + c[j] * a);
}
function capsule(a, b, w, c, alpha) {                 // a filled stroke from a to b, width w
  const x0 = Math.min(a[0], b[0]) - w, x1 = Math.max(a[0], b[0]) + w, y0 = Math.min(a[1], b[1]) - w, y1 = Math.max(a[1], b[1]) + w;
  const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1;
  for (let y = Math.floor(y0); y <= y1; y++) for (let x = Math.floor(x0); x <= x1; x++) {
    const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2));
    if (Math.hypot(x - (a[0] + t * dx), y - (a[1] + t * dy)) <= w) plot(x, y, c, alpha);
  }
}
LIMBS.forEach(([i, j], n) => { if (pt(i) && pt(j)) capsule(pt(i), pt(j), W, COLORS[n], 0.6); });
NAMES.forEach((_, i) => { if (pt(i)) capsule(pt(i), pt(i), R, COLORS[i], 1); });
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${S}x${S}`, '-i', '-', '-frames:v', '1', out], { input: buf });
console.log('ok', out, Object.keys(P).length, 'points');
