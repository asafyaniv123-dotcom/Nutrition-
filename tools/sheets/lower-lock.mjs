// Zero-cost lower lock (Asaf, 10 Nov, after x60): for an upper-body isolation exercise, everything below row Y of
// the end frame is replaced by the start frame - legs, lower torso, floor - so it cannot drift by a pixel. The
// switch is feathered over F rows. Both frames must be the same size (the full-size frames, before gif.mjs).
// node tools/sheets/lower-lock.mjs <start> <end> <out> <Y> [F=16]     Y: a row just below the lowest moving part
import { execFileSync } from 'child_process'; import path from 'path'; import os from 'os';
const [s, e, out, Ys, Fs = '16'] = process.argv.slice(2);
if (!out || !Ys) { console.log('usage: lower-lock.mjs <start> <end> <out> <Y> [F]'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const Y = +Ys, F = +Fs;
// alpha of the start frame: 0 above Y, ramping to 1 over F rows
execFileSync(FF, ['-v', 'error', '-y', '-i', e, '-i', s, '-filter_complex',
  `[1][0]scale2ref[st][en];[st]format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='clip((Y-${Y})*255/${F},0,255)'[lk];[en][lk]overlay=0:0,format=rgb24`,
  out]);
console.log('locked below row', Y, '->', out);
