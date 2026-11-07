// The figure's colour and texture, measured against an approved frame (Asaf, 7 Nov: "the gold is not the same
// gold... more orange and rougher"). Figure pixels = luminance above a threshold; reports their mean colour,
// hue, saturation, brightness, and a roughness number (mean absolute difference from a 2px blur = grain).
// node tools/sheets/tone-check.mjs <approved.png|jpg> <ours.png|jpg> [more ours ...]
import { execFileSync } from 'child_process'; import path from 'path'; import os from 'os';
const files = process.argv.slice(2);
if (files.length < 2) { console.log('usage: tone-check.mjs <approved> <ours> [...]'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const S = 512;
const raw = (f, vf) => execFileSync(FF, ['-v', 'error', '-i', f, '-vf', `scale=${S}:${S},${vf}format=rgb24`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 26 });
function measure(f) {
  const a = raw(f, ''), b = raw(f, 'gblur=sigma=2,');
  let n = 0, r = 0, g = 0, bl = 0, rough = 0;
  for (let i = 0; i < S * S; i++) {
    const R = a[i * 3], G = a[i * 3 + 1], B = a[i * 3 + 2], Y = 0.299 * R + 0.587 * G + 0.114 * B;
    if (Y < 70) continue;
    n++; r += R; g += G; bl += B;
    rough += (Math.abs(R - b[i * 3]) + Math.abs(G - b[i * 3 + 1]) + Math.abs(B - b[i * 3 + 2])) / 3;
  }
  r /= n; g /= n; bl /= n;
  const mx = Math.max(r, g, bl), mn = Math.min(r, g, bl), sat = (mx - mn) / mx;
  const hue = 60 * ((g - bl) / (mx - mn));             // red is max for this palette
  return { r: Math.round(r), g: Math.round(g), b: Math.round(bl), hue: +hue.toFixed(1), sat: +sat.toFixed(3), bright: Math.round(mx), rough: +(rough / n).toFixed(2), area: +(n / (S * S) * 100).toFixed(1) };
}
const ref = measure(files[0]);
console.log('approved', files[0].split(/[\\/]/).pop(), JSON.stringify(ref));
for (const f of files.slice(1)) {
  const m = measure(f);
  const d = { hue: +(m.hue - ref.hue).toFixed(1), sat: +(m.sat - ref.sat).toFixed(3), bright: m.bright - ref.bright, rough: +(m.rough - ref.rough).toFixed(2) };
  /* tolerances from what passed his eye: hue within 2 degrees, saturation within 0.04, roughness within 25% */
  const ok = Math.abs(d.hue) <= 1 && Math.abs(d.sat) <= 0.02 && m.rough <= ref.rough * 1.15;   // x20 at hue -1.5 read as "more orange" to him
  console.log(ok ? 'PASS' : 'FAIL', f.split(/[\\/]/).pop(), JSON.stringify(m), 'diff', JSON.stringify(d));
}
