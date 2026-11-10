// Stage C in one command, zero credits (Asaf, 10 Nov): for an isolated upper-body exercise with locked legs.
//  1. level the end frame's backdrop to the start's (an edit tends to lift the whole backdrop a few levels, which a
//     lock then shows as a band - x97): mean RGB of an empty patch in both, the difference taken off the end;
//  2. lower-lock: below row Y the end frame is the start frame, feathered (tools/sheets/lower-lock.mjs);
//  3. color-sync both frames to the shared target (tools/sheets/color-sync.mjs) - stops if it does not report SYNCED;
//  4. gif.mjs into <outDir>.
// node tools/sheets/stage-c.mjs <start> <end> <outDir> <lockY> [feather=40] [patch=x,y,w,h of empty backdrop]
//   lockY: below the lowest moving part in BOTH frames (not the waist - x97's start dumbbells hung by the thighs).
import { execFileSync } from 'child_process'; import path from 'path'; import os from 'os'; import fs from 'fs';
const [start, end, out, Ys, Fs = '40', patch = '900,60,200,600'] = process.argv.slice(2);
if (!out || !Ys) { console.log('usage: stage-c.mjs <start> <end> <outDir> <lockY> [feather] [x,y,w,h]'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const work = path.join(os.tmpdir(), 'stage-c-' + Date.now()); fs.mkdirSync(work, { recursive: true });
const run = (args) => execFileSync(FF, ['-v', 'error', '-y', ...args]);
// full size, same for both
const S = path.join(work, 'start.png'), E0 = path.join(work, 'end-raw.png');
run(['-i', start, '-vf', 'scale=1152:1152', S]); run(['-i', end, '-vf', 'scale=1152:1152', E0]);
// 1. backdrop levels
const [px, py, pw, ph] = patch.split(',').map(Number);
const mean = (f) => { const b = execFileSync(FF, ['-v', 'error', '-i', f, '-vf', `crop=${pw}:${ph}:${px}:${py}`, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 27 });
  const s = [0, 0, 0]; for (let i = 0; i < b.length; i += 3) for (let k = 0; k < 3; k++) s[k] += b[i + k]; return s.map((v) => v / (b.length / 3)); };
const ms = mean(S), me = mean(E0), d = me.map((v, k) => Math.round(v - ms[k]));
const E1 = path.join(work, 'end-level.png');
const ch = (v) => (v >= 0 ? `max(val-${v}\\,0)` : `min(val+${-v}\\,255)`);
run(['-i', E0, '-vf', `lutrgb=r='${ch(d[0])}':g='${ch(d[1])}':b='${ch(d[2])}'`, E1]);
console.log('backdrop start', ms.map((v) => v.toFixed(1)).join('/'), 'end', me.map((v) => v.toFixed(1)).join('/'), '-> end shifted by', d.map((v) => -v).join('/'));
// 2. lower lock
const E2 = path.join(work, 'end.png');
execFileSync('node', [path.join(here, 'lower-lock.mjs'), S, E1, E2, Ys, Fs], { stdio: 'inherit' });
// 3. colour sync (exits non-zero unless SYNCED)
const SY = path.join(work, 'sync');
execFileSync('node', [path.join(here, 'color-sync.mjs'), SY, S, E2], { stdio: 'inherit' });
// 4. animation
execFileSync('node', [path.join(here, 'gif.mjs'), path.join(SY, 'start.png'), path.join(SY, 'end.png'), out], { stdio: 'inherit' });
console.log('stage C done ->', out, '(work files in', work + ')');
