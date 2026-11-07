// Draw a skeleton on a picture and print its joint angles - to READ Asaf's reference exactly, and to check our
// frame against it with the same numbers (7 Nov: the lines that steered x190 can also measure a pose).
// Joints are read off a grid first (ffmpeg drawgrid), then given here as chains of x,y points:
// node tools/sheets/skeleton.mjs <in.png> <out.png> "<name>:x,y x,y x,y" ["<name>:x,y x,y" ...]
//   e.g. "leg:590,735 590,460 590,190"  (hip knee ankle)   "arm:300,400 360,520 420,640" (shoulder elbow wrist)
// Prints, per chain: each segment's length and its angle from horizontal (0 = pointing right, 90 = straight up),
// and the bend at each inner joint (180 = straight). Compare ours to his: angles within 10 degrees, and the
// segment RATIOS within 3% (absolute lengths differ with the picture's scale).
import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const [IN, OUT, ...chains] = process.argv.slice(2);
if (!chains.length) { console.log('usage: skeleton.mjs <in> <out> "name:x,y x,y ..." [...]'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const colors = ['0x00E5FF', '0xFF2A6D', '0x7CFF4F', '0xFFD400', '0xB26BFF'];
const boxes = [], report = {};
chains.forEach((c, ci) => {
  const [name, pts] = c.includes(':') ? c.split(':') : ['chain' + ci, c];
  const P = pts.trim().split(/\s+/).map((p) => p.split(',').map(Number)), col = colors[ci % colors.length];
  const seg = [], bend = [];
  for (let i = 1; i < P.length; i++) {
    const [x0, y0] = P[i - 1], [x1, y1] = P[i], len = Math.hypot(x1 - x0, y1 - y0);
    seg.push({ len: Math.round(len), deg: Math.round(Math.atan2(y0 - y1, x1 - x0) * 180 / Math.PI) });
    for (let t = 0; t <= len; t += 3) boxes.push(`drawbox=x=${Math.round(x0 + (x1 - x0) * t / len) - 3}:y=${Math.round(y0 + (y1 - y0) * t / len) - 3}:w=6:h=6:color=${col}:t=fill`);
  }
  for (let i = 1; i < P.length - 1; i++) {
    const a = Math.atan2(P[i - 1][1] - P[i][1], P[i - 1][0] - P[i][0]), b = Math.atan2(P[i + 1][1] - P[i][1], P[i + 1][0] - P[i][0]);
    let d = Math.abs(a - b) * 180 / Math.PI; if (d > 180) d = 360 - d; bend.push(Math.round(d));
  }
  for (const [x, y] of P) boxes.push(`drawbox=x=${x - 9}:y=${y - 9}:w=18:h=18:color=white:t=fill`);
  const total = seg.reduce((s, q) => s + q.len, 0);
  report[name] = { segments: seg, ratios: seg.map((q) => +(q.len / total).toFixed(3)), bends: bend };
});
execFileSync(FF, ['-v', 'error', '-y', '-i', IN, '-vf', 'format=rgb24,' + boxes.join(','), OUT]);
console.log(JSON.stringify(report, null, 1));
