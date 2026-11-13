// node tools/sheets/shear-top.mjs <end> <out> <y0> <dxTop> [yTop=0] - zero-cost: shear the END above row y0 so that the
// row y0 stays put and the row yTop moves by dxTop px (linear in between and above), at full size. For an edit that
// leaned the whole upper body over while the floor contacts held (x64, 13 Nov: feet and shorts 0 px, the head 38 px
// toward the camera's left, the shift growing row by row from the waist up - a lean, not a slide, so neither
// cut-pair nor fit-still can take it out). Measure the first lit pixel row by row in both frames first and choose
// y0 where the difference starts.
import { execFileSync } from 'child_process'; import path from 'path'; import os from 'os';
const [end, out, y0s, dxs, yts = '0'] = process.argv.slice(2);
if (!dxs) { console.log('usage: shear-top.mjs <end> <out> <y0> <dxTop> [yTop]'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const W = 2048, y0 = +y0s, dxTop = +dxs, yTop = +yts;
const src = execFileSync(FF, ['-v', 'error', '-i', end, '-vf', `scale=${W}:${W}`, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 26 });
const dst = Buffer.from(src);
for (let y = 0; y < y0; y++) {
  const s = dxTop * (y0 - y) / (y0 - yTop); // how far this row is to be moved
  for (let x = 0; x < W; x++) {
    const sx = Math.min(W - 1.001, Math.max(0, x - s)), x1 = Math.floor(sx), f = sx - x1;
    for (let k = 0; k < 3; k++) dst[(y * W + x) * 3 + k] = Math.round(src[(y * W + x1) * 3 + k] * (1 - f) + src[(y * W + x1 + 1) * 3 + k] * f);
  }
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${W}`, '-i', '-', '-frames:v', '1', out], { input: dst });
console.log(`sheared rows above ${y0}: row ${yTop} moved ${dxTop} px -> ${out}`);
