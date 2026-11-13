// node tools/sheets/eq-tone.mjs <inDir> <outDir> [dark=383532] [mid=78746f] [sharp=0.7]  - transparent <slug>.png in, recoloured <slug>.png out; env AMP, CURVE = shading depth
// Graphite and titanium (Asaf, 13 Nov): the amber-glowing parts of the generated kit become dark charcoal rubber, the
// white porcelain becomes titanium grey, and nothing yellow is left. Per pixel:
//   t      how amber it was, (r-b)/r through a smoothstep - the part that glowed, which is the part that weighs
//   shade  its lightness against the median of the whole object, pushed through an S-curve: the 3D form survives the
//          recolour because it was only ever in the lightness
//   out    mix(titanium, charcoal, t) * shade - both bases are warm greys, so the result has the ink's warmth, no blue
// Then a light unsharp mask on the colour (alpha untouched), so a handle reads at 46 px on a phone.
import fs from 'fs'; import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const [inDir, outDir, darkHex = '383532', midHex = '78746f', sharpArg = '0.7'] = process.argv.slice(2);
if (!outDir) { console.log('usage: eq-tone.mjs <inDir> <outDir> [dark] [mid] [sharp]'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const rgb = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
const DARK = rgb(darkHex), MID = rgb(midHex), SHARP = +sharpArg;
/* how deep the shading goes: AMP is the reach of the S-curve either side of the base tone, CURVE its steepness.
   0.62 / 2.6 was the graphite pass; the soft stone pass (13 Nov) runs lighter tones, which would burn out at that reach */
const AMP = +(process.env.AMP || 0.62), CURVE = +(process.env.CURVE || 2.6);
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(inDir).filter((x) => x.endsWith('.png'))) {
  const src = path.join(inDir, f);
  const banner = (() => { try { execFileSync(FF, ['-i', src], { stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { return String(e.stderr); } return ''; })();
  const [W, H] = banner.match(/, (\d+)x(\d+)/).slice(1).map(Number);
  const px = execFileSync(FF, ['-v', 'error', '-i', src, '-pix_fmt', 'rgba', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 26 });
  const N = W * H, L = new Float32Array(N), T = new Float32Array(N), lum = [];
  for (let i = 0; i < N; i++) {
    const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2], a = px[i * 4 + 3];
    L[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    T[i] = sstep(0.12, 0.34, (r - b) / Math.max(r, 1));
    if (a > 128) lum.push(L[i]);
  }
  lum.sort((x, y) => x - y);
  const med = lum[lum.length >> 1] || 200;
  const out = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    let s = L[i] / med;                                 // 1 = an ordinary lit surface
    s = 1 + Math.tanh((s - 1) * CURVE) * AMP;           // S-curve: deeper shade, brighter lit edge, never clipped
    for (let c = 0; c < 3; c++) {
      const base = MID[c] + (DARK[c] - MID[c]) * T[i];
      out[i * 4 + c] = Math.max(0, Math.min(255, Math.round(base * s)));
    }
    out[i * 4 + 3] = px[i * 4 + 3];
  }
  /* unsharp: colour minus a 3x3 blur of itself, added back */
  if (SHARP > 0) {
    const cp = Buffer.from(out);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = (y * W + x) * 4;
      if (!cp[i + 3]) continue;
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) sum += cp[((y + dy) * W + x + dx) * 4 + c];
        out[i + c] = Math.max(0, Math.min(255, Math.round(cp[i + c] + (cp[i + c] - sum / 9) * SHARP)));
      }
    }
  }
  const raw = path.join(os.tmpdir(), 'eq-tone-' + process.pid + '.raw');
  fs.writeFileSync(raw, out);
  execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', W + 'x' + H, '-i', raw, '-frames:v', '1',
    '-compression_level', '9', path.join(outDir, f)]);
  fs.unlinkSync(raw);
  console.log(f, 'median', Math.round(med));
}
