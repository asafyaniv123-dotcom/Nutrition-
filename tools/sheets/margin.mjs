// node tools/sheets/margin.mjs <in> <out.jpg> [scale=0.84] - give a frame breathing room (Asaf, 9 Nov: "they leave the frame"). The input may be a wide panel; it is fitted, not cropped.
// The content is scaled down onto a flat ground of ITS OWN edge colour (the mean of the outer ring, pure-black letterbox
// rows skipped) with a wide feathered edge. A fixed near-black ground showed as a box on lighter frames (x145, x219), and
// a blurred copy of the frame left orange stains. Run it on both frames with the same scale before gif.mjs.
import { execFileSync } from 'child_process'; import os from 'os'; import path from 'path';
const FF = path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [src, out, k = '0.84'] = process.argv.slice(2);
const S = 1152, I = Math.round(S * +k / 2) * 2, o = (S - I) / 2, F = Math.round(I * 0.12);
const N = 64, px = execFileSync(FF, ['-v', 'error', '-i', src, '-vf', `scale=${N}:${N},format=rgb24`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 20 });
// the ground is a top-to-bottom gradient: dark sky above, floor glow below - one flat colour showed as a box either way
const med = (rows) => { const v = [[], [], []];
  for (const y of rows) for (let x = 0; x < N; x++) { const i = (y * N + x) * 3; if (px[i] + px[i + 1] + px[i + 2] < 9) continue; for (let c = 0; c < 3; c++) v[c].push(px[i + c]); }
  return v.map((a) => (a.sort((p, q) => p - q), a.length ? a[a.length >> 1] : 8)); };
const firstRow = (dir) => { for (let k = 0; k < N; k++) { const y = dir > 0 ? k : N - 1 - k; let s = 0; for (let x = 0; x < N; x++) { const i = (y * N + x) * 3; s += px[i] + px[i + 1] + px[i + 2]; } if (s / N > 9) return y; } return dir > 0 ? 0 : N - 1; };
const t0 = firstRow(1), b0 = firstRow(-1);
const top = med([t0, t0 + 1, t0 + 2]), bot = med([b0, b0 - 1, b0 - 2]);
const ch = (c) => `${top[c]}+(${bot[c] - top[c]})*Y/H`;
const hex = 'gradient ' + top.join(',') + ' -> ' + bot.join(',');
execFileSync(FF, ['-v', 'error', '-y', '-i', src, '-filter_complex',
  `color=c=black:s=${S}x${S},format=rgb24,geq=r='${ch(0)}':g='${ch(1)}':b='${ch(2)}'[bg];` +
  `[0]scale=w=${I}:h=${I}:force_original_aspect_ratio=decrease,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*clip(min(min(X,Y),min(W-1-X,H-1-Y))/${F},0,1)'[fg];` +
  `[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuvj444p`, '-frames:v', '1', '-q:v', '2', out]);
console.log('ok', out, I, o, hex);
