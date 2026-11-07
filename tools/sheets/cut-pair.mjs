// Cut the two panels out of one two-panel generation at a chosen width and offset, square them and scale to 1152.
// split-pair.mjs cuts 1152 squares; a lying or wide exercise does not fit one and loses a dumbbell or a head
// (x246), and an end panel that has to move to match the start (band-shift) needs its own offset.
// node tools/sheets/cut-pair.mjs <pair.png> <start-out> <end-out> <width> <startX> <endX> [endDY=0]
//   endDY > 0 moves the end picture DOWN by that many source pixels (band-shift's dy, sign flipped: dy=-19 -> 19)
import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const [IN, A, B, Ws, AXs, BXs, DYs = '0'] = process.argv.slice(2);
if (!BXs) { console.log('usage: cut-pair.mjs <pair.png> <start-out> <end-out> <width> <startX> <endX> [endDY]'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
let H; try { execFileSync(FF, ['-i', IN], { stdio: 'pipe' }); } catch (e) { H = +String(e.stderr).match(/, \d{3,5}x(\d{3,5})/)[1]; }
const W = +Ws, side = Math.max(W, H), pad = Math.round((side - H) / 2), dy = +DYs;
const cut = (x, d, out) => {
  /* d>0: drop d rows at the bottom and fill d at the top; the smear repeats the edge row, so the ground continues */
  const src = d > 0 ? `crop=${W}:${H - d}:${x}:0` : d < 0 ? `crop=${W}:${H + d}:${x}:${-d}` : `crop=${W}:${H}:${x}:0`;
  const top = pad + Math.max(d, 0), bot = side - top - (H - Math.abs(d));
  execFileSync(FF, ['-v', 'error', '-y', '-i', IN, '-vf',
    `${src},pad=${side}:${side}:0:${top},fillborders=top=${top}:bottom=${bot}:mode=smear,scale=1152:1152:flags=lanczos`, out]);
};
cut(+AXs, 0, A); cut(+BXs, dy, B);
console.log(`${W}x${H} -> ${side} square, start x=${AXs}, end x=${BXs} dy=${dy}`);
