// node tools/sheets/guide-sheet.mjs <id> <out.jpg> [assetsDir] - the frames a step guide (EX_GUIDE) is measured on: the loop at
//   0.1 s and then every 0.8 s to its end, side by side, each 400 px square with a line every 10% of the frame (the brighter line
//   every 50%). A ring is [seconds, x%, y%, diameter%] read straight off this grid. Frame k (from 0, left to right, top row first)
//   is at the time printed by this tool. No text is drawn on the frames: ffmpeg's drawtext crashes on this machine (fontconfig).
import fs from 'node:fs'; import { execFileSync } from 'node:child_process';
const [id, out, dir = 'assets/exdemo'] = process.argv.slice(2);
let f = `${dir}/${id}.mp4`; if (!fs.existsSync(f)) f = `stable/assets/exdemo/${id}.mp4`;
const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();
const T = [0.1]; for (let t = 0.8; t < dur - 0.15; t += 0.8) T.push(+t.toFixed(1));
const tmp = out + '.d'; fs.mkdirSync(tmp, { recursive: true });
const grid = 'scale=400:400,drawgrid=w=40:h=40:t=1:c=white@0.28,drawgrid=w=200:h=200:t=2:c=cyan@0.55';
T.forEach((t, k) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', String(t), '-i', f, '-frames:v', '1', '-vf', grid, `${tmp}/${k}.png`]));
const cols = 4, rows = Math.ceil(T.length / cols), ins = [], fl = [];
for (let k = 0; k < rows * cols; k++) {
  if (k < T.length) ins.push('-i', `${tmp}/${k}.png`);
  else ins.push('-f', 'lavfi', '-i', 'color=c=black:s=400x400:d=1');
}
const lab = [...Array(rows * cols).keys()].map((k) => `[${k}:v]`);
for (let r = 0; r < rows; r++) fl.push(lab.slice(r * cols, r * cols + cols).join('') + `hstack=${cols}[r${r}]`);
fl.push([...Array(rows).keys()].map((r) => `[r${r}]`).join('') + (rows > 1 ? `vstack=${rows}[o]` : 'null[o]'));
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...ins, '-filter_complex', fl.join(';'), '-map', '[o]', '-frames:v', '1', '-q:v', '4', out]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(JSON.stringify({ id, duration: +dur.toFixed(2), frames: T }));
