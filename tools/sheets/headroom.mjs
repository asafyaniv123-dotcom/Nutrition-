// node tools/sheets/headroom.mjs <in.png> <out.png> <scale> <x0> <y0> - make room in an approved frame 1 for a pose that reaches past its edge
//   (x73, 14 Nov: the dumbbells of the end pose would land ~60 px above the top edge, and an edit with no room zooms out - x4).
//   The frame is scaled by <scale> and placed with its top-left at (x0, y0) on a 2048 canvas; a side that runs past the canvas is
//   cropped, and every uncovered margin is the frame's own edge smeared outward and blurred - never invented, never a blur of the
//   whole picture (that carried x4's dumbbells into the margin). The pose does not change by a degree; only its size and place.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
const [IN, OUT, SC, XS, YS] = process.argv.slice(2);
if (!YS) { console.log('usage: headroom.mjs <in.png> <out.png> <scale> <x0> <y0>'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const ff = (a) => execFileSync(FF, ['-v', 'error', '-y', ...a]);
const W = 2 * Math.round(1024 * +SC), X0 = +XS, Y0 = +YS;
const L = Math.max(X0, 0), T = Math.max(Y0, 0), cx = Math.max(-X0, 0), cy = Math.max(-Y0, 0);
const even = (v) => v - (v % 2); // lavfi colour sources round odd sizes, and alphamerge needs both inputs equal
const cw = even(Math.min(W - cx, 2048 - L)), ch = even(Math.min(W - cy, 2048 - T));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'headroom-'));
const bg = path.join(tmp, 'bg.png'), am = path.join(tmp, 'alpha.png');
ff(['-i', IN, '-vf', `scale=2048:2048,scale=${W}:${W}:flags=lanczos,crop=${cw}:${ch}:${cx}:${cy},pad=2048:2048:${L}:${T},fillborders=left=${L}:right=${2048 - L - cw}:top=${T}:bottom=${2048 - T - ch}:mode=smear,gblur=sigma=40,format=rgb24`, bg]);
ff(['-f', 'lavfi', '-i', `color=black:s=${cw}x${ch}`, '-vf', "format=gray,geq=lum='255*min(1\\,min(min(X\\,W-1-X)\\,min(Y\\,H-1-Y))/24)'", '-frames:v', '1', am]);
ff(['-i', bg, '-i', IN, '-i', am, '-filter_complex', `[1]scale=2048:2048,scale=${W}:${W}:flags=lanczos,crop=${cw}:${ch}:${cx}:${cy},format=rgb24[f];[2]format=gray[a];[f][a]alphamerge[fa];[0][fa]overlay=${L}:${T},format=rgb24`, OUT]);
console.log(`headroom: ${W}px frame at ${X0},${Y0} -> ${OUT}`);
