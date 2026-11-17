// node composite166.mjs <start.png> <end.png> <out.png> - x166 supporting-leg lock (Asaf, 17 Nov): end-r2 redrew the supporting leg
//   (narrower thigh, merged with the rising one). Everything inside POLY (2048 coords: the supporting thigh below the shorts hem, the
//   knee on the pad, the shin and the foot - following the top edge of the shin so frame 1's working leg, hidden behind it there, is
//   not carried over) comes from frame 1, feathered F px; everything else is the end frame's own. No limb is warped.
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [SP, EP, OUT] = process.argv.slice(2);
const POLY = [[880, 1205], [1068, 1205], [1072, 1345], [1300, 1296], [1385, 1270], [1425, 1270], [1425, 1600], [880, 1600]];
const F = 10;
const W = 2048, H = 2048;
const read = (p) => execFileSync(FF, ['-v', 'error', '-i', p, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });
const S = read(SP), E = read(EP);
const inside = (x, y) => {
  let c = false;
  for (let i = 0, j = POLY.length - 1; i < POLY.length; j = i++) {
    const [xi, yi] = POLY[i], [xj, yj] = POLY[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const edgeDist = (x, y) => {
  let m = Infinity;
  for (let i = 0, j = POLY.length - 1; i < POLY.length; j = i++) {
    const [ax, ay] = POLY[j], [bx, by] = POLY[i], dx = bx - ax, dy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    m = Math.min(m, Math.hypot(x - ax - t * dx, y - ay - t * dy));
  }
  return m;
};
const out = Buffer.from(E);
for (let y = 1150; y < 1660; y++) for (let x = 830; x < 1490; x++) {
  const d = (inside(x, y) ? 1 : -1) * edgeDist(x, y);
  const s = Math.min(1, Math.max(0, (d + F) / (2 * F))); // 1 = frame 1
  if (s === 0) continue;
  const i = (y * W + x) * 3;
  for (let c = 0; c < 3; c++) out[i + c] = Math.round(S[i + c] * s + E[i + c] * (1 - s));
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', OUT], { input: out });
console.log('composite ->', OUT);
