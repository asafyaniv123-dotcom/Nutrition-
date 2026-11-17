// node benchlock250.mjs <start.png> <shifted-end.png> <out.png> - x250 end fix, step 2 (Asaf, 17 Nov): after the global shift (shiftfit250.mjs)
//   the torso and head sit on frame 1's, but the bench, the knees and the feet - which the model left where they were while sliding the
//   body - are now 14-22 px off. Everything under POLY's upper edge (2048 coords: along the underside of the torso on the bench, then
//   along both shorts hems, where the shifted body lies within 2 px of frame 1) comes from frame 1: the whole bench, the floor, the lower legs and the feet. Above it, the shifted end
//   frame: head, torso, arms and bar. Feathered F px. No limb is warped.
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [SP, EP, OUT] = process.argv.slice(2);
const POLY = [[0, 985], [810, 985], [1160, 1112], [1255, 1122], [1445, 1097], [1530, 1050], [2048, 1050], [2048, 2048], [0, 2048]];
const F = 16, W = 2048, H = 2048;
const read = (p) => execFileSync(FF, ['-v', 'error', '-i', p, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const S = read(SP), E = read(EP);
const inside = (x, y) => { let c = false; for (let i = 0, j = POLY.length - 1; i < POLY.length; j = i++) { const [xi, yi] = POLY[i], [xj, yj] = POLY[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
const edgeDist = (x, y) => { let m = Infinity; for (let i = 0, j = POLY.length - 1; i < POLY.length; j = i++) { const [ax, ay] = POLY[j], [bx, by] = POLY[i], dx = bx - ax, dy = by - ay; const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy))); m = Math.min(m, Math.hypot(x - ax - t * dx, y - ay - t * dy)); } return m; };
const out = Buffer.from(E);
for (let y = 900; y < H; y++) for (let x = 0; x < W; x++) {
  const d = (inside(x, y) ? 1 : -1) * edgeDist(x, y);
  const s = Math.min(1, Math.max(0, (d + F) / (2 * F))); // 1 = frame 1
  if (s === 0) continue;
  const i = (y * W + x) * 3;
  for (let c = 0; c < 3; c++) out[i + c] = Math.round(S[i + c] * s + E[i + c] * (1 - s));
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', OUT], { input: out });
console.log('benchlock ->', OUT);
