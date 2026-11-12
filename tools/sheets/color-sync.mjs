// Step C colour sync (Asaf, 10 Nov, after x60): measures each frame the way tone-check does, then pulls every frame
// to one target - highlight hue 36.5 and figure saturation 0.79, the middle of the approved frames - with one ffmpeg
// hue/sat pass per frame, and re-measures. Run it on the full-size frames right before gif.mjs.
// node tools/sheets/color-sync.mjs <outDir> <frame1> <frame2> [more ...]   -> <outDir>/<name>.png per frame
import { execFileSync } from 'child_process'; import path from 'path'; import os from 'os'; import fs from 'fs';
const [out, ...files] = process.argv.slice(2);
if (!out || files.length < 2) { console.log('usage: color-sync.mjs <outDir> <frame1> <frame2> [...]'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
/* Two colour profiles (Asaf, 12 Nov). PROFILE=stretch pulls to the teal of CANONICAL-STRETCH-x267.png, measured
   with this same function: highlight hue 177.2, figure saturation 0.597. Anything else is amber. */
const STRETCH = process.env.PROFILE === 'stretch';
const HI = STRETCH ? 177.2 : 36.5, SAT = STRETCH ? 0.597 : 0.79, S = 512;
/* Hue in degrees, any colour. The amber figure always has red as its largest channel, which is what the old
   one-line formula assumed; the teal stretch figure (12 Nov) has green, and read as 11.7 instead of ~168.
   Where red IS the largest, this returns exactly what the old formula did. */
function hueOf(r, g, b) { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return 0;
  let h = mx === r ? (g - b) / d : mx === g ? 2 + (b - r) / d : 4 + (r - g) / d; h *= 60; return h < 0 ? h + 360 : h; }
const raw = (f) => execFileSync(FF, ['-v', 'error', '-i', f, '-vf', `scale=${S}:${S},format=rgb24`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 26 });
function measure(f) {   // same figure / highlight selection as tone-check.mjs
  const a = raw(f); let n = 0, r = 0, g = 0, b = 0, hn = 0, hr = 0, hg = 0, hb = 0;
  for (let i = 0; i < S * S; i++) { const R = a[i * 3], G = a[i * 3 + 1], B = a[i * 3 + 2], Y = 0.299 * R + 0.587 * G + 0.114 * B;
    if (Y < 70) continue; n++; r += R; g += G; b += B; if (Y >= 170) { hn++; hr += R; hg += G; hb += B; } }
  r /= n; g /= n; b /= n; const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return { sat: (mx - mn) / mx, hiHue: hn ? hueOf(hr / hn, hg / hn, hb / hn) : HI, bright: mx };
}
fs.mkdirSync(out, { recursive: true });
const res = [];
/* The hue target is shared: 36.5, or the reddest frame if one is already below it (x121, 11 Nov - the start
   measured 34.5, could not be moved because shifts only ever go one way, and the pair came out 2.1 apart). */
const ms = files.map(measure), hiT = Math.min(HI, ...ms.map((m) => m.hiHue));
for (const [i, f] of files.entries()) {
  const m = ms[i];
  // only ever cooler: the figure drifts yellow, never red. MAXSHIFT (default 5) can raise the limit, but check the
  // BODY hue (tone-check "hue") as well: on x234 the end's strong muscle glow read 46.6 and a 10-degree shift turned
  // the whole body red (25 -> 18). The default 5 kept the bodies 1.9 apart, and that version shipped.
  const h = Math.max(-(+process.env.MAXSHIFT || 5), Math.min(0, hiT - m.hiHue));
  const s = SAT / m.sat;
  const o = path.join(out, path.basename(f).replace(/\.[^.]+$/, '') + '.png');
  execFileSync(FF, ['-v', 'error', '-y', '-i', f, '-vf', `hue=h=${h.toFixed(2)}:s=${s.toFixed(3)}`, o]);
  const a = measure(o);
  res.push({ frame: path.basename(f), before: { sat: +m.sat.toFixed(3), hiHue: +m.hiHue.toFixed(1) }, after: { sat: +a.sat.toFixed(3), hiHue: +a.hiHue.toFixed(1), bright: Math.round(a.bright) }, out: o });
}
const sats = res.map((r) => r.after.sat), his = res.map((r) => r.after.hiHue);
const spread = { sat: +(Math.max(...sats) - Math.min(...sats)).toFixed(3), hiHue: +(Math.max(...his) - Math.min(...his)).toFixed(1) };
const ok = spread.sat <= 0.02 && spread.hiHue <= 1;
for (const r of res) console.log(JSON.stringify(r));
console.log(ok ? 'SYNCED' : 'NOT SYNCED', 'spread between frames', JSON.stringify(spread));
process.exit(ok ? 0 : 1);
