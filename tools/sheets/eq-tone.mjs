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
  /* the amber map is noisy where the glow fades, and once the two tones are far apart (porcelain beside sunset
     orange) that noise is grain on the boundary - so it is softened first: a 5 px box blur, twice */
  for (let pass = 0; pass < 2; pass++) for (const horiz of [true, false]) {
    const src2 = Float32Array.from(T);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let sum = 0, n = 0;
      for (let d = -2; d <= 2; d++) { const xx = horiz ? x + d : x, yy = horiz ? y : y + d;
        if (xx >= 0 && xx < W && yy >= 0 && yy < H) { sum += src2[yy * W + xx]; n++; } }
      T[y * W + x] = sum / n;
    }
  }
  /* ...and then made into an EDGE again: a glow fades, a material does not. A steep step through the middle of the
     softened map gives one clean anti-aliased boundary instead of a halo or grain */
  const E0 = +(process.env.EDGE0 || 0.32), E1 = +(process.env.EDGE1 || 0.62);
  for (let i = 0; i < N; i++) T[i] = sstep(E0, E1, T[i]);
  lum.sort((x, y) => x - y);
  const med = lum[lum.length >> 1] || 200;
  const out = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    let s = L[i] / med;                                 // 1 = an ordinary lit surface
    s = 1 + Math.tanh((s - 1) * CURVE) * AMP;           // S-curve: deeper shade, brighter lit edge, never clipped
    /* a highlight that would pass 255 is scaled down whole, not clipped per channel: clipping red first leaves green
       climbing, and an orange highlight turns yellow (13 Nov, the sunset amber pass) */
    const v = [0, 1, 2].map((c) => (MID[c] + (DARK[c] - MID[c]) * T[i]) * s), top = Math.max(v[0], v[1], v[2]);
    const k = top > 255 ? 255 / top : 1;
    for (let c = 0; c < 3; c++) out[i * 4 + c] = Math.max(0, Math.round(v[c] * k));
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
