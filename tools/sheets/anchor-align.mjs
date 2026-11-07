// Align a transparent figure to another by two contact clusters, same scale, shift only:
// toes = alpha pixels in the leftmost 4% of the figure's columns, hands = alpha pixels in its lowest 3% of rows.
// node anchor-align.mjs <ref-rgba> <move-rgba> <out-rgba>
import { execFileSync } from 'child_process'; import path from 'path'; import os from 'os';
const [REF, MOV, OUT] = process.argv.slice(2);
const FF = path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const W = 1024, H = 1024;
function anchors(f) {
  const a = execFileSync(FF, ['-v', 'error', '-i', f, '-vf', 'format=rgba,alphaextract', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 1 << 26 });
  let x0 = W, x1 = 0, y0 = H, y1 = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (a[y * W + x] > 128) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const mean = (t) => { let sx = 0, sy = 0, n = 0; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (a[y * W + x] > 128 && t(x, y)) { sx += x; sy += y; n++; } return [sx / n, sy / n]; };
  const tx = x0 + (x1 - x0) * 0.04, hy = y1 - (y1 - y0) * 0.03;
  return { toe: mean((x) => x <= tx), hand: mean((x, y) => y >= hy), box: [x0, y0, x1, y1] };
}
const r = anchors(REF), m = anchors(MOV);
const dx = Math.round(((r.toe[0] - m.toe[0]) + (r.hand[0] - m.hand[0])) / 2), dy = Math.round(((r.toe[1] - m.toe[1]) + (r.hand[1] - m.hand[1])) / 2);
const off = (p, q) => Math.hypot(p[0] + dx - q[0], p[1] + dy - q[1]).toFixed(1);
console.log('ref toe', r.toe.map(Math.round), 'hand', r.hand.map(Math.round), '| move toe', m.toe.map(Math.round), 'hand', m.hand.map(Math.round));
console.log(`shift ${dx},${dy}; after: toe off ${off(m.toe, r.toe)} px, hand off ${off(m.hand, r.hand)} px`);
execFileSync(FF, ['-v', 'error', '-y', '-f', 'lavfi', '-i', `color=c=black@0.0:s=${W}x${H},format=rgba`, '-i', MOV, '-filter_complex', `[1:v]format=rgba[f];[0:v][f]overlay=${dx}:${dy}:format=auto,format=rgba`, '-frames:v', '1', OUT]);
