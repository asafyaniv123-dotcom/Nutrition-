// node composite250.mjs <start.png> <end.png> <out.png> [DX DY] - x250 arms-only composite (Asaf, 17 Nov): end-r1 slid the torso and
//   head ~20 px toward the head end of the bench while the feet stayed. Everything Asaf froze (bench, feet, legs, pelvis, torso) comes
//   from frame 1; the end frame, shifted whole by DX,DY so its head lies on frame 1's head, supplies only what moves - the forearms, the
//   hands and the bar - inside POLY (2048 coords: above the shoulder line, plus the box where the lowered bar's near plate hangs),
//   feathered F px. No limb is warped: both parts are real pixels of one frame each, moved whole.
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [SP, EP, OUT, DXs = '14', DYs = '15'] = process.argv.slice(2);
const DX = +DXs, DY = +DYs;
const POLY = [[0, 0], [2048, 0], [2048, 700], [900, 700], [880, 760], [700, 780], [700, 980], [0, 980]];
const F = 18, W = 2048, H = 2048;
const read = (p) => execFileSync(FF, ['-v', 'error', '-i', p, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const S = read(SP), E = read(EP);
const inside = (x, y) => { let c = false; for (let i = 0, j = POLY.length - 1; i < POLY.length; j = i++) { const [xi, yi] = POLY[i], [xj, yj] = POLY[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
const edgeDist = (x, y) => { let m = Infinity; for (let i = 0, j = POLY.length - 1; i < POLY.length; j = i++) { const [ax, ay] = POLY[j], [bx, by] = POLY[i], dx = bx - ax, dy = by - ay; const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy))); m = Math.min(m, Math.hypot(x - ax - t * dx, y - ay - t * dy)); } return m; };
const out = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = (y * W + x) * 3;
  let e = 0;
  if (y < 1040) { const d = (inside(x, y) ? 1 : -1) * edgeDist(x, y); e = Math.min(1, Math.max(0, (d + F) / (2 * F))); }
  const ex = Math.min(W - 1, Math.max(0, x - DX)), ey = Math.min(H - 1, Math.max(0, y - DY)), j = (ey * W + ex) * 3;
  for (let c = 0; c < 3; c++) out[i + c] = Math.round(E[j + c] * e + S[i + c] * (1 - e));
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', OUT], { input: out });
console.log('composite ->', OUT, { DX, DY });
