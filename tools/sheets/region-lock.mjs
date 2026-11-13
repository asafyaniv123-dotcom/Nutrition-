// node tools/sheets/region-lock.mjs <start> <end> <out> <feather> <x0,y0[,x1]> ... - zero-cost lock of static
// corners (x1, when given, is a right bound, to step around a moving part beside the corner): every corner right of x0 and below y0 (full-size pixels) is taken from the START into the END, feathered
// over F px on both edges; several corners make a staircase. lower-lock's sibling, for when the start's moving part
// hangs low beside a static part and a full-width row would bring it back (x119, 13 Nov: the kickback's dumbbell
// hangs beside the shorts, and the edit narrowed the rear outline of the shorts by ~18 px, which a loop shows as a
// distortion). Check with a difference map that only the moving arm is left.
import { execFileSync } from 'child_process'; import path from 'path'; import os from 'os';
const [start, end, out, Fs, ...corners] = process.argv.slice(2);
if (!corners.length) { console.log('usage: region-lock.mjs <start> <end> <out> <feather> <x0,y0> [x0,y0 ...]'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const F = Number(Fs);
const one = (c) => { const [x0, y0, x1] = c.split(',').map(Number);
  return `clip((X-${x0})/${F}\\,0\\,1)*clip((Y-${y0})/${F}\\,0\\,1)` + (x1 ? `*clip((${x1}-X)/${F}\\,0\\,1)` : ''); };
const expr = corners.map(one).reduce((a, b) => `max(${a}\\,${b})`);
execFileSync(FF, ['-v', 'error', '-y', '-i', start, '-i', end, '-filter_complex',
  `[0]format=rgba,split[s][m];[m]format=gray,geq=lum='255*${expr}'[a];[s][a]alphamerge[t];[1][t]overlay=0:0:format=auto,format=rgb24`,
  '-frames:v', '1', out]);
console.log(`locked ${corners.join(' ')} (feather ${F}) -> ${out}`);
