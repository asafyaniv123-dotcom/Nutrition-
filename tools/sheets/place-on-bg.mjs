// The shared-background method (7 Nov): the model cannot keep a wall, a box or a bench in the same place in
// two pictures - it redraws everything, every time - so the equipment is drawn ONCE, as an empty scene, and
// both poses are generated as a figure only, on a transparent background. Each figure is then placed on that
// one scene: the start where its feet and palms land where they should, the end moved and scaled (no rotation)
// so ITS feet and palms land on the start's. The figure is never cut or assembled - it stays whole, as drawn.
// node tools/sheets/place-on-bg.mjs <bg.png> <start-rgba.png> <end-rgba.png> <out-dir> feetX,feetY palmX,palmY
//   feetX,feetY / palmX,palmY: where the start's feet and palms go on the background (its own pixels)
//   anchors: feet = the figure's lowest 3% of rows, palms = its rightmost 5% of columns (a figure facing right)
//   writes start.png and end.png in out-dir, and prints how far the end's anchors still are from the start's
import fs from 'fs'; import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const [BG, S, E, OUT, F, P] = process.argv.slice(2);
if (!P) { console.log('usage: place-on-bg.mjs <bg.png> <start-rgba.png> <end-rgba.png> <out-dir> feetX,feetY palmX,palmY'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const size = (f) => { try { execFileSync(FF, ['-i', f], { stdio: 'pipe' }); } catch (e) { const m = String(e.stderr).match(/, (\d{2,5})x(\d{2,5})/); return [+m[1], +m[2]]; } };
function anchors(f) {
  const [w, h] = size(f);
  const a = execFileSync(FF, ['-v', 'error', '-i', f, '-vf', 'alphaextract', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 1 << 28 });
  let x0 = w, x1 = 0, y0 = h, y1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (a[y * w + x] > 128) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const mean = (test) => { let sx = 0, sy = 0, n = 0;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (a[y * w + x] > 128 && test(x, y)) { sx += x; sy += y; n++; }
    return [sx / n, sy / n]; };
  const fy = y1 - (y1 - y0) * 0.03, px = x1 - (x1 - x0) * 0.05;
  return { feet: mean((x, y) => y >= fy), palm: mean((x) => x >= px), box: [x0, y0, x1, y1] };
}
const sA = anchors(S), eA = anchors(E);
const tf = F.split(',').map(Number), tp = P.split(',').map(Number);
/* start: the scale that makes its feet-to-palm distance the one asked for, then the shift that puts its feet there */
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const ks = dist(tf, tp) / dist(sA.feet, sA.palm);
const ts = [tf[0] - ks * sA.feet[0], tf[1] - ks * sA.feet[1]];
const place = (p, k, t) => [k * p[0] + t[0], k * p[1] + t[1]];
const sF = place(sA.feet, ks, ts), sP = place(sA.palm, ks, ts);
/* end: least squares scale + shift taking its feet and palms onto the start's placed ones */
const cE = [(eA.feet[0] + eA.palm[0]) / 2, (eA.feet[1] + eA.palm[1]) / 2], cS = [(sF[0] + sP[0]) / 2, (sF[1] + sP[1]) / 2];
const d = (p, c) => [p[0] - c[0], p[1] - c[1]];
const num = [[eA.feet, sF], [eA.palm, sP]].reduce((s, [e, t]) => { const a = d(e, cE), b = d(t, cS); return s + a[0] * b[0] + a[1] * b[1]; }, 0);
const den = [eA.feet, eA.palm].reduce((s, e) => { const a = d(e, cE); return s + a[0] * a[0] + a[1] * a[1]; }, 0);
/* a free scale lies when the model moved the palms: on the first wall push-up the end's palms sat 10% nearer its
   feet, and the fit answered by drawing the end man 10% BIGGER. Both poses come from one generation, so they
   are already the same size - by default the end keeps the start's scale and only the shift is fitted */
const free = process.argv.includes('--free-scale');
const ke = free ? num / den : ks, te = [cS[0] - ke * cE[0], cS[1] - ke * cE[1]];
const eF = place(eA.feet, ke, te), eP = place(eA.palm, ke, te);
fs.mkdirSync(OUT, { recursive: true });
const r = (p) => p.map((v) => v.toFixed(0)).join(',');
const put = (fig, k, t, out) => { const [w, h] = size(fig);
  execFileSync(FF, ['-v', 'error', '-y', '-i', BG, '-i', fig, '-filter_complex',
    `[1:v]scale=${Math.round(w * k)}:${Math.round(h * k)}:flags=lanczos[f];[0:v][f]overlay=${Math.round(t[0])}:${Math.round(t[1])}:format=auto`, '-frames:v', '1', out]); };
put(S, ks, ts, path.join(OUT, 'start.png'));
/* --stretch: the end figure, whole and uncut, is stretched along its own feet-to-palm line (and only along it)
   until its feet and palms land EXACTLY on the start's - one smooth affine map, no pieces. Asaf, 7 Nov: "can't
   you just put the figure where it belongs, without credits?" The wall push-up end was 8% short on that line. */
if (process.argv.includes('--stretch')) {
  const [bw, bh] = size(BG), [w, h] = size(E);
  /* the end on a transparent canvas the size of the background, at the start's scale */
  const can = path.join(OUT, 'end-canvas.png');
  execFileSync(FF, ['-v', 'error', '-y', '-f', 'lavfi', '-i', `color=c=black@0.0:s=${bw}x${bh},format=rgba`, '-i', E, '-filter_complex',
    `[1:v]scale=${Math.round(w * ks)}:${Math.round(h * ks)}:flags=lanczos,format=rgba[f];[0:v][f]overlay=${Math.round(te[0])}:${Math.round(te[1])}:format=auto,format=rgba`, '-frames:v', '1', can]);
  const f0 = place(eA.feet, ke, te), p0 = place(eA.palm, ke, te);
  const v = [p0[0] - f0[0], p0[1] - f0[1]], wv = [sP[0] - sF[0], sP[1] - sF[1]];
  const L = Math.hypot(...v), Lw = Math.hypot(...wv);
  /* M takes v to wv, and the direction across the body to the same direction across, unscaled */
  const A = [[v[0], -v[1]], [v[1], v[0]]];
  const B = [[wv[0], -wv[1] * L / Lw], [wv[1], wv[0] * L / Lw]];
  const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const Ai = [[A[1][1] / det, -A[0][1] / det], [-A[1][0] / det, A[0][0] / det]];
  const M = [[B[0][0] * Ai[0][0] + B[0][1] * Ai[1][0], B[0][0] * Ai[0][1] + B[0][1] * Ai[1][1]],
             [B[1][0] * Ai[0][0] + B[1][1] * Ai[1][0], B[1][0] * Ai[0][1] + B[1][1] * Ai[1][1]]];
  const map = (x, y) => [sF[0] + M[0][0] * (x - f0[0]) + M[0][1] * (y - f0[1]), sF[1] + M[1][0] * (x - f0[0]) + M[1][1] * (y - f0[1])];
  const c = [map(0, 0), map(bw, 0), map(0, bh), map(bw, bh)].map((p) => p.map((n) => n.toFixed(2)));
  const warped = path.join(OUT, 'end-warped.png');
  execFileSync(FF, ['-v', 'error', '-y', '-i', can, '-vf',
    `format=rgba,perspective=x0=${c[0][0]}:y0=${c[0][1]}:x1=${c[1][0]}:y1=${c[1][1]}:x2=${c[2][0]}:y2=${c[2][1]}:x3=${c[3][0]}:y3=${c[3][1]}:sense=destination:interpolation=cubic`, warped]);
  execFileSync(FF, ['-v', 'error', '-y', '-i', BG, '-i', warped, '-filter_complex', '[0:v][1:v]overlay=0:0:format=auto', '-frames:v', '1', path.join(OUT, 'end.png')]);
  const wA = anchors(warped);
  console.log(`stretched ${(Lw / L * 100 - 100).toFixed(1)}% along feet-palm; measured again: feet ${r(wA.feet)} palm ${r(wA.palm)}, off by ${dist(wA.feet, sF).toFixed(1)} and ${dist(wA.palm, sP).toFixed(1)} px`);
} else put(E, ke, te, path.join(OUT, 'end.png'));
console.log(`start x${ks.toFixed(3)}: feet ${r(sF)} palm ${r(sP)}`);
console.log(`end   x${ke.toFixed(3)}: feet ${r(eF)} palm ${r(eP)}   off by ${dist(eF, sF).toFixed(1)} and ${dist(eP, sP).toFixed(1)} px`);
