// node tools/sheets/foot-fit.mjs <start> <end> <outDir> "<x0,y0,x1,y1;...>" - put both frames on one floor before any loop (Asaf, 14 Nov, x335).
//   boxes = what stands on the floor in the START frame (the shoes, above the floor reflection), 2048 coordinates.
//   writes outDir/start.png + end.png (2048, the end frame untouched) and mask.png (the sole lock, end coordinates); exit 1 if the soles still differ.
// 1. foot-register.mjs measures scale s and shift. The end frame stays as it is (scaling IT up cut x335's head off);
//    frame 1 is scaled by 1/s and moved onto the end frame's soles, its margins filled from its own blurred edge.
// 2. the lower part of every box (sole + toe box - above it the ankles change angle) is copied from the end frame into
//    frame 1, feathered, so those pixels are the same pixels. Re-applied after colour sync by stage-c.mjs (mask.png).
// 3. measured: mean difference inside the lock under 1 (of 255), or it fails.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
// node foot-fit.mjs --check <start> <end> <lock.json> - the measurement alone (stage-c.mjs runs it on the synced frames)
if (process.argv[2] === '--check') {
  const [, a, b, lj] = process.argv.slice(2);
  const FFc = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
  const raw = (f) => execFileSync(FFc, ['-v', 'error', '-i', f, '-vf', 'scale=2048:2048,format=rgb24', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 28 });
  const A = raw(a), B = raw(b); let worst = 0;
  for (const [x0, y0, x1, y1] of JSON.parse(fs.readFileSync(lj, 'utf8')).lock) {
    let sum = 0, n = 0;
    for (let y = y0 + 20; y < y1 - 20; y++) for (let x = x0 + 20; x < x1 - 20; x++) for (let c = 0; c < 3; c++) { const i = (y * 2048 + x) * 3 + c; sum += Math.abs(A[i] - B[i]); n++; }
    const mean = n ? sum / n : 255; worst = Math.max(worst, mean);
    console.log(`sole lock ${x0},${y0},${x1},${y1}: mean difference ${mean.toFixed(3)} / 255`);
  }
  console.log(worst < 1 ? 'PASS soles identical' : 'FAIL soles differ - the loop would slide');
  process.exit(worst < 1 ? 0 : 1);
}
const [START, END, OUT, BOXES] = process.argv.slice(2);
if (!BOXES) { console.log('usage: foot-fit.mjs <start> <end> <outDir> "<x0,y0,x1,y1;...>"'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const ff = (a) => execFileSync(FF, ['-v', 'error', '-y', ...a], { maxBuffer: 1 << 28 });
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
fs.mkdirSync(OUT, { recursive: true });
const S0 = path.join(OUT, 'start-2048.png'), E = path.join(OUT, 'end.png');
ff(['-i', START, '-vf', 'scale=2048:2048:flags=lanczos,format=rgb24', S0]);
ff(['-i', END, '-vf', 'scale=2048:2048:flags=lanczos,format=rgb24', E]);
const reg = JSON.parse(execFileSync('node', [path.join(here, 'foot-register.mjs'), S0, E, BOXES], { encoding: 'utf8' }).trim().split('\n').pop());
const s = reg.s, tx = reg.tx2048, ty = reg.ty2048;
console.log(`foot-register: scale ${s} shift ${tx},${ty}` + (Math.abs(s - 1) > 0.01 ? '  <- SIZE differs by more than 1%' : ''));
// 1. frame 1 into the end frame's coordinates: start x -> end (x - tx) / s
const W = 2 * Math.round(1024 / s), X0 = Math.round(-tx / s), Y0 = Math.round(-ty / s);
const bg = path.join(OUT, 'bg.png'), am = path.join(OUT, 'alpha.png'), sf = path.join(OUT, 'start-fit.png');
ff(['-i', S0, '-vf', 'gblur=sigma=40,format=rgb24', bg]);
ff(['-f', 'lavfi', '-i', `color=black:s=${W}x${W}`, '-vf', "format=gray,geq=lum='255*min(1\\,min(min(X\\,W-1-X)\\,min(Y\\,H-1-Y))/20)'", '-frames:v', '1', am]);
ff(['-i', bg, '-i', S0, '-i', am, '-filter_complex', `[1]scale=${W}:${W}:flags=lanczos,format=rgb24[f];[2]format=gray[a];[f][a]alphamerge[fa];[0][fa]overlay=${X0}:${Y0},format=rgb24`, sf]);
// 2. sole lock: the boxes in end coordinates, lower 55% of each
const lock = BOXES.split(';').map((b) => b.split(',').map(Number)).map(([x0, y0, x1, y1]) => {
  const m = (v, t) => Math.round((v - t) / s);
  const a = m(x0, tx), b = m(x1, tx), top = m(y0, ty), bot = m(y1, ty);
  return [a, Math.round(bot - (bot - top) * 0.55), b, bot];
});
const mask = path.join(OUT, 'mask.png');
const inside = lock.map(([x0, y0, x1, y1]) => `between(X\\,${x0}\\,${x1})*between(Y\\,${y0}\\,${y1})`).join('+');
ff(['-f', 'lavfi', '-i', 'color=black:s=2048x2048', '-vf', `format=gray,geq=lum='255*min(1\\,${inside})',gblur=sigma=10`, '-frames:v', '1', mask]);
fs.writeFileSync(path.join(OUT, 'lock.json'), JSON.stringify({ s, tx, ty, lock }) + '\n');
const SL = path.join(OUT, 'start.png');
ff(['-i', sf, '-i', E, '-i', mask, '-filter_complex', '[0]format=gbrp[a];[1]format=gbrp[b];[2]format=gray,format=gbrp[m];[a][b][m]maskedmerge,format=rgb24', SL]);
// 3. measure inside the lock, 20 px in from its feathered edge
const chk = spawnSync('node', [path.join(here, 'foot-fit.mjs'), '--check', SL, E, path.join(OUT, 'lock.json')], { encoding: 'utf8' });
process.stdout.write(chk.stdout + chk.stderr);
process.exit(chk.status === 0 ? 0 : 1);
