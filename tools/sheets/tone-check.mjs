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
/* Hue in degrees, any colour. The amber figure always has red as its largest channel, which is what the old
   one-line formula assumed; the teal stretch figure (12 Nov) has green, and read as 11.7 instead of ~168.
   Where red IS the largest, this returns exactly what the old formula did. */
function hueOf(r, g, b) { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return 0;
  let h = mx === r ? (g - b) / d : mx === g ? 2 + (b - r) / d : 4 + (r - g) / d; h *= 60; return h < 0 ? h + 360 : h; }
function measure(f) {
  const a = raw(f, ''), b = raw(f, 'gblur=sigma=2,');
  let n = 0, r = 0, g = 0, bl = 0, rough = 0, hn = 0, hr = 0, hg = 0, hb = 0;
  for (let i = 0; i < S * S; i++) {
    const R = a[i * 3], G = a[i * 3 + 1], B = a[i * 3 + 2], Y = 0.299 * R + 0.587 * G + 0.114 * B;
    if (Y < 70) continue;
    n++; r += R; g += G; bl += B;
    if (Y >= 170) { hn++; hr += R; hg += G; hb += B; }
    rough += (Math.abs(R - b[i * 3]) + Math.abs(G - b[i * 3 + 1]) + Math.abs(B - b[i * 3 + 2])) / 3;
  }
  r /= n; g /= n; bl /= n;
  const mx = Math.max(r, g, bl), mn = Math.min(r, g, bl), sat = (mx - mn) / mx;
  const hue = hueOf(r, g, bl);
  const hiHue = hn ? hueOf(hr, hg, hb) : 0;   // hue of the highlights alone
  return { r: Math.round(r), g: Math.round(g), b: Math.round(bl), hue: +hue.toFixed(1), sat: +sat.toFixed(3), hiHue: +hiHue.toFixed(1), bright: Math.round(mx), rough: +(rough / n).toFixed(2), area: +(n / (S * S) * 100).toFixed(1) };
}
const ref = measure(files[0]);
console.log('approved', files[0].split(/[\\/]/).pop(), JSON.stringify(ref));
for (const f of files.slice(1)) {
  const m = measure(f);
  const d = { hue: +(m.hue - ref.hue).toFixed(1), sat: +(m.sat - ref.sat).toFixed(3), bright: m.bright - ref.bright, rough: +(m.rough - ref.rough).toFixed(2), hiHue: +(m.hiHue - ref.hiHue).toFixed(1) };
  /* tolerances: hue within 1 degree, saturation within 0.02, roughness within 15% - x20 at hue -1.5 read as
     "more orange" to him. The numbers alone passed that frame's lumpy texture, so the crop stays mandatory. */
  const ok = Math.abs(d.hue) <= 1 && Math.abs(d.sat) <= 0.02 && m.rough <= ref.rough * 1.15;
  console.log(ok ? 'PASS' : 'FAIL', f.split(/[\\/]/).pop(), JSON.stringify(m), 'diff', JSON.stringify(d));
}
