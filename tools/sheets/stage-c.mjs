// Stage C in one command, zero credits (Asaf, 10 Nov): for an isolated upper-body exercise with locked legs.
//  0. foot-fit.mjs (Asaf, 14 Nov, x335 - required): scale + shift frame 1 onto the end frame's soles and copy the soles across;
//     feet="x0,y0,x1,y1;..." = what stands on the floor in the START frame (2048 coords, above the reflection). feet=none only
//     for a figure that touches nothing (say why in the report). feet=local:<boxes> when the scene already matches and only
//     a shoe moved (foot-fit --local, x336): nothing is rescaled, each shoe of the end frame is put on frame 1's. After colour sync the lock is applied again and measured:
//     mean difference under 1/255 or no loop is built.
//  1. level the end frame's backdrop to the start's (an edit tends to lift the whole backdrop a few levels, which a
//     lock then shows as a band - x97): mean RGB of an empty patch in both, the difference taken off the end;
//  2. lower-lock: below row Y the end frame is the start frame, feathered (tools/sheets/lower-lock.mjs);
//  3. color-sync both frames to the shared target (tools/sheets/color-sync.mjs) - stops if it does not report SYNCED;
//  4. gif.mjs into <outDir>.
// node tools/sheets/stage-c.mjs <start> <end> <outDir> <lockY> [feather=40] [patch=x,y,w,h of empty backdrop] feet=<boxes>|none
//   lockY: below the lowest moving part in BOTH frames (not the waist - x97's start dumbbells hung by the thighs).
import { execFileSync } from 'child_process'; import path from 'path'; import os from 'os'; import fs from 'fs';
const ARGS = process.argv.slice(2), FEET = (ARGS.find((a) => a.startsWith('feet=')) || '').slice(5);
const [start0, end0, out, Ys, Fs = '40', patch = '900,60,200,600'] = ARGS.filter((a) => !a.startsWith('feet='));
if (!out || !Ys || !FEET) { console.log('usage: stage-c.mjs <start> <end> <outDir> <lockY> [feather] [x,y,w,h] feet=<x0,y0,x1,y1;...>|none'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const work = path.join(os.tmpdir(), 'stage-c-' + Date.now()); fs.mkdirSync(work, { recursive: true });
const run = (args) => execFileSync(FF, ['-v', 'error', '-y', ...args]);
// 0. one floor
let start = start0, end = end0; const FIT = path.join(work, 'fit');
if (FEET !== 'none') {
  const LOCAL = FEET.startsWith('local:');
  execFileSync('node', [path.join(here, 'foot-fit.mjs'), start0, end0, FIT, LOCAL ? FEET.slice(6) : FEET, ...(LOCAL ? ['--local'] : [])], { stdio: 'inherit' });
  start = path.join(FIT, 'start.png'); end = path.join(FIT, 'end.png');
}
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
// 3b. colour sync moved both frames a little differently: the soles are copied across again, and measured
let SS = path.join(SY, 'start.png'), SE = path.join(SY, 'end.png');
if (FEET !== 'none') {
  /* default: the end frame's soles go into frame 1; --local: frame 1's soles go into the end frame */
  const toEnd = JSON.parse(fs.readFileSync(path.join(FIT, 'lock.json'), 'utf8')).dir === 'start-to-end';
  const R2 = path.join(work, toEnd ? 'end-relocked.png' : 'start-relocked.png');
  const [base, over] = toEnd ? [SE, SS] : [SS, SE];
  run(['-i', base, '-i', over, '-i', path.join(FIT, 'mask.png'), '-filter_complex', '[2]scale=1152:1152,format=gray,format=gbrp[m];[0]format=gbrp[a];[1]format=gbrp[b];[a][b][m]maskedmerge,format=rgb24', R2]);
  if (toEnd) SE = R2; else SS = R2;
  execFileSync('node', [path.join(here, 'foot-fit.mjs'), '--check', SS, SE, path.join(FIT, 'lock.json')], { stdio: 'inherit' });
}
// 4. animation
execFileSync('node', [path.join(here, 'gif.mjs'), SS, SE, out], { stdio: 'inherit' });
console.log('stage C done ->', out, '(work files in', work + ')');
