// node tools/sheets/muscle-grey.mjs <inDir> <outDir> <grey 0-255> [tol=4]   (env T2=28 GROW=6 AREA=150)
// The muscle pictures' ground is one flat light tone (≈233,229,226) and the white body is in fact a little DARKER
// than it, so no tone curve can lift the body off the ground. This replaces the ground only: a flood fill from the
// image's border over everything within `tol` of the ground colour, feathered, then shifted down to the grey.
// Shading inside the filled area (the floor shadow) is shifted by the same amount and so survives as shading.
import { execFileSync } from 'child_process'; import fs from 'fs'; import path from 'path'; import os from 'os';
const [inDir, outDir, greyArg, tolArg] = process.argv.slice(2);
if (!greyArg) { console.log('usage: muscle-grey.mjs <inDir> <outDir> <grey> [tol]'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const G = +greyArg, T = +(tolArg || 14);
const T2 = +(process.env.T2 || 28), GROW = +(process.env.GROW || 3), AREA = +(process.env.AREA || 400), EDGE = +(process.env.EDGE || 4);
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(inDir).filter(f => f.endsWith('.jpg'))) {
  const src = path.join(inDir, f);
  const [W, H] = probe(src);
  const b = execFileSync(FF, ['-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 26 });
  // the ground: median of the border pixels
  const border = []; for (let x = 0; x < W; x++) border.push(x, x + (H - 1) * W); for (let y = 0; y < H; y++) border.push(y * W, y * W + W - 1);
  const bg = [0, 1, 2].map(c => { const v = border.map(p => b[p * 3 + c]).sort((a, z) => a - z); return v[v.length >> 1]; });
  /* Colour alone cannot tell them apart: large parts of the body ARE the ground colour, and a fill by colour walks
     into them. What separates them is the body's outline, so a pixel on an edge (luminance gradient above EDGE)
     is a wall the fill does not cross. */
  const L = new Float32Array(W * H); for (let p = 0; p < W * H; p++) L[p] = 0.3 * b[p * 3] + 0.59 * b[p * 3 + 1] + 0.11 * b[p * 3 + 2];
  const grad = new Float32Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const p = y * W + x;
    const gx = L[p - W + 1] + 2 * L[p + 1] + L[p + W + 1] - L[p - W - 1] - 2 * L[p - 1] - L[p + W - 1];
    const gy = L[p + W - 1] + 2 * L[p + W] + L[p + W + 1] - L[p - W - 1] - 2 * L[p - W] - L[p - W + 1];
    grad[p] = Math.hypot(gx, gy) / 4; }
  // a wall is an edge pixel and its neighbours, so a one-pixel gap in the outline does not let the fill through
  const wall = new Uint8Array(W * H);
  for (let p = 0; p < W * H; p++) if (grad[p] > EDGE) { const x = p % W, y = (p / W) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H) wall[yy * W + xx] = 1; } }
  const near = p => !wall[p] && Math.max(Math.abs(b[p * 3] - bg[0]), Math.abs(b[p * 3 + 1] - bg[1]), Math.abs(b[p * 3 + 2] - bg[2])) <= T;
  const m = new Float32Array(W * H), q = [];
  for (const p of border) if (!m[p] && near(p)) { m[p] = 1; q.push(p); }
  while (q.length) { const p = q.pop(), x = p % W, y = (p / W) | 0;
    for (const n of [x > 0 && p - 1, x < W - 1 && p + 1, y > 0 && p - W, y < H - 1 && p + W]) if (n !== false && !m[n] && near(n)) { m[n] = 1; q.push(n); } }
  /* Enclosed ground - the gap between the legs, under an arm - is not reached from the border. A component of
     ground-coloured pixels is taken when it is large; the body's own matching patches are small. */
  const seen = new Uint8Array(W * H);
  for (let p0 = 0; p0 < W * H; p0++) { if (m[p0] || seen[p0] || !near(p0)) continue;
    const comp = [p0]; seen[p0] = 1;
    for (let i = 0; i < comp.length; i++) { const p = comp[i], x = p % W, y = (p / W) | 0;
      for (const n of [x > 0 && p - 1, x < W - 1 && p + 1, y > 0 && p - W, y < H - 1 && p + W]) if (n !== false && !seen[n] && !m[n] && near(n)) { seen[n] = 1; comp.push(n); } }
    if (comp.length >= AREA) for (const p of comp) m[p] = 1; }
  /* The halo: the soft shading just outside the body differs from the ground by more than tol, so the fill stops
     short of the body and leaves a pale ring. Grow the fill a few pixels into anything still close to the ground
     colour - limited in distance, which is what keeps it out of the body this time. */
  for (let k = 0; k < GROW; k++) { const add = [];
    for (let p = 0; p < W * H; p++) { if (m[p]) continue; const x = p % W, y = (p / W) | 0;
      if (!((x > 0 && m[p - 1]) || (x < W - 1 && m[p + 1]) || (y > 0 && m[p - W]) || (y < H - 1 && m[p + W]))) continue;
      let d = 0; for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(b[p * 3 + c] - bg[c]));
      if (d <= T2) add.push(p); }
    for (const p of add) m[p] = 1; }
  // feather: two 3x3 box blurs
  let a = m; for (let k = 0; k < 2; k++) { const o = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H) { s += a[yy * W + xx]; n++; } }
      o[y * W + x] = s / n; } a = o; }
  const tgt = [G, G, G], o = Buffer.from(b);
  for (let p = 0; p < W * H; p++) for (let c = 0; c < 3; c++) o[p * 3 + c] = Math.max(0, Math.min(255, Math.round(b[p * 3 + c] - (bg[c] - tgt[c]) * a[p])));
  const raw = path.join(os.tmpdir(), 'mg-' + process.pid + '.rgb'); fs.writeFileSync(raw, o);
  execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', raw, '-q:v', '3', path.join(outDir, f)]);
  fs.unlinkSync(raw);
  console.log(f, 'ground', bg.join(','), 'filled', Math.round(100 * m.reduce((s, v) => s + v, 0) / (W * H)) + '%');
}
function probe(src) { try { execFileSync(FF, ['-i', src], { stdio: 'pipe' }); } catch (e) { const r = String(e.stderr).match(/, (\d+)x(\d+)/); return [+r[1], +r[2]]; } }
