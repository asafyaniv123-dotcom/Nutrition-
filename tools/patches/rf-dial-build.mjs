// Builds assets/rf-dial.webp and assets/rf-dial-glaze.webp from the approved render hf/q19 (25 Nov): no hand-drawn geometry.
// node tools/patches/rf-dial-build.mjs <dir> - reads <dir>/crop.rgb (600x600 crop of the render at 140,200; ffmpeg -f rawvideo -pix_fmt rgb24), writes base.rgb (600x600) and ring.rgb (four 432 squares). Encode: crop=528:528:34:34 for the base, colorchannelmixer rr=1.073 gg=1.120 bb=1.152, webp q84.
import fs from 'node:fs';
const D = process.argv[2], W = 600, raw = fs.readFileSync(D + '/crop.rgb'), src = Buffer.from(raw);
const CX = 298.5, CY = 298.4;
// clean the source first: the four printed numbers with their ticks, and the "24 h" in the well
{
  const at = (x, y) => { const i = (Math.round(Math.min(W - 1, Math.max(0, y))) * W + Math.round(Math.min(W - 1, Math.max(0, x)))) * 3; return [raw[i], raw[i + 1], raw[i + 2]]; };
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
    const dx = x - CX, dy = y - CY, r = Math.hypot(dx, dy), a = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
    let c = null;
    if (r > 206 && r < 268) for (const L of [0, 90, 180, 270]) { const d = ((a - L + 540) % 360) - 180; if (Math.abs(d) < 11) { const rot = (dd) => { const t = (a + dd) * Math.PI / 180; return at(CX + r * Math.sin(t), CY - r * Math.cos(t)); }, qp = rot(15), qm = rot(-15), sw = (d + 11) / 22, q = qm.map((v, k) => v * (1 - sw) + qp[k] * sw), o = at(x, y); const w = Math.min(1, (11 - Math.abs(d)) / 4, (r - 206) / 6, (268 - r) / 6); c = o.map((v, k) => v * (1 - w) + q[k] * w); } }
    if (Math.abs(dx) < 60 && Math.abs(dy) < 30) { // the well floor varies top to bottom only: interpolate from just above and below the text
      const avg = (yy) => { const o = [0, 0, 0]; for (let k = -9; k <= 9; k++) { const q = at(x + k, yy); o[0] += q[0] / 19; o[1] += q[1] / 19; o[2] += q[2] / 19; } return o; }; const up = avg(CY - 31), dn = avg(CY + 31), t = (dy + 31) / 62; c = up.map((v, k) => v * (1 - t) + dn[k] * t);
    }
    if (c) { const i = (y * W + x) * 3; src[i] = c[0]; src[i + 1] = c[1]; src[i + 2] = c[2]; }
  }
}
const get = (x, y) => { // bilinear
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, o = [0, 0, 0];
  for (const [dx, dy, w] of [[0, 0, (1 - fx) * (1 - fy)], [1, 0, fx * (1 - fy)], [0, 1, (1 - fx) * fy], [1, 1, fx * fy]]) {
    const xx = Math.min(W - 1, Math.max(0, x0 + dx)), yy = Math.min(W - 1, Math.max(0, y0 + dy)), i = (yy * W + xx) * 3;
    o[0] += src[i] * w; o[1] += src[i + 1] * w; o[2] += src[i + 2] * w;
  }
  return o;
};
const polar = (r, a) => { const t = a * Math.PI / 180; return [CX + r * Math.sin(t), CY - r * Math.cos(t)]; };
const disc = [220, 208, 198], dist = (c, d) => Math.hypot(c[0] - d[0], c[1] - d[1], c[2] - d[2]);
const isTile = (c) => dist(c, disc) > 30;
// gaps between tiles, measured along r=179
const prof = []; for (let i = 0; i < 720; i++) prof.push(isTile(get(...polar(179, i / 2))) ? 1 : 0);
let runs = [], st = -1; for (let i = 0; i < 1440 + 40; i++) { const v = prof[i % 720]; if (!v && st < 0) st = i; if (v && st >= 0) { runs.push((st + i) / 4); st = -1; } }
let gaps = [...new Set(runs.map((g) => +(g % 360).toFixed(2)))].sort((a, b) => a - b);
// merge gaps closer than 5 deg; a run wider than a gap (cream tile) shows as one centre - mark those tiles cream
gaps = gaps.filter((g, i) => i === 0 || g - gaps[i - 1] > 5);
const tiles = []; for (let i = 0; i < gaps.length; i++) { const a = gaps[i], b = i + 1 < gaps.length ? gaps[i + 1] : gaps[0] + 360; tiles.push({ a, b, c: (a + b) / 2 }); }
// tile core colour
for (const t of tiles) {
  let s = [0, 0, 0], n = 0;
  for (let r = 162; r <= 198; r += 2) for (let f = 0.25; f <= 0.75; f += 0.05) { const c = get(...polar(r, t.a + (t.b - t.a) * f)); s[0] += c[0]; s[1] += c[1]; s[2] += c[2]; n++; }
  t.m = s.map((v) => v / n); t.cream = !isTile(t.m);
}
console.log(tiles.length + ' tiles', tiles.map((t) => t.c.toFixed(0) + (t.cream ? 'c' : '') + '[' + t.m.map(Math.round) + ']').join(' '));
const pick = (want) => tiles.filter((t) => !t.cream && want(t.m));
const avg = (ts) => [0, 1, 2].map((k) => ts.reduce((s, t) => s + t.m[k], 0) / ts.length);
const rose = avg(pick((m) => m[0] - m[1] > 30)), sage = avg(pick((m) => m[1] >= m[0] - 1 && m[1] > m[2] + 25)), lav = avg(pick((m) => m[2] > m[1] + 8 && m[2] > m[0] - 5));
const creamT = tiles.filter((t) => t.cream), cream = avg(creamT);
const lum = (c) => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
const sandHue = [204, 170, 121], k = lum(rose) / lum(sandHue) * 1.04, sand = sandHue.map((v) => Math.min(255, v * k));
console.log('rose', rose.map(Math.round), 'sage', sage.map(Math.round), 'lav', lav.map(Math.round), 'sand', sand.map(Math.round), 'cream', cream.map(Math.round));
const GL = { none: cream, sleep: rose, work: sage, social: lav, other: sand };
// the source pixel for output angle a at radius r: the nearest coloured tile, widened to 15 deg
const srcTiles = tiles.filter((t) => !t.cream);
function mapped(r, a, glaze) {
  const h = Math.floor(((a % 360) + 360) % 360 / 15), f = (((a % 360) + 360) % 360 - h * 15) / 15, cen = h * 15 + 7.5;
  let best = srcTiles[0], bd = 1e9;
  for (const t of srcTiles) { const d = Math.abs(((t.c - cen + 540) % 360) - 180); if (d < bd) { bd = d; best = t; } }
  const c = get(...polar(r, best.a + (best.b - best.a) * f));
  // keep the render's light (luminance), swap the glaze (chroma): rims take the new glaze too, highlights stay white
  const w0 = Math.min(1, Math.max(0, (dist(c, disc) - 8) / 14)), w = w0 * (1 - Math.min(1, Math.max(0, (lum(c) - lum(best.m) - 14) / 26))), tgt = GL[glaze], Y = lum(c), shift = lum(tgt) - lum(best.m);
  return c.map((v, i) => { const own = v - Y, want = tgt[i] - lum(tgt); return Math.min(255, Math.max(0, Y + w0 * shift + own * (1 - w) + want * w)); });
}
const R0 = 144, R1 = 216, FE = 6; // band replaced, feathered into the original
// BASE: every hour empty; the "24 h" in the well and the four printed numbers removed
const base = Buffer.alloc(W * W * 3);
for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
  const dx = x - CX, dy = y - CY, r = Math.hypot(dx, dy), a = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
  let c = get(x, y);
  if (r > R0 - FE && r < R1 + FE) {
    const m = mapped(r, a, 'none'), w = Math.min(1, (r - (R0 - FE)) / FE, ((R1 + FE) - r) / FE);
    c = c.map((v, i) => v * (1 - w) + m[i] * w);
  }
  const i = (y * W + x) * 3; base[i] = c[0]; base[i + 1] = c[1]; base[i + 2] = c[2];
}
fs.writeFileSync(D + '/base.rgb', base);
// RING: one 432x432 square per glaze, centred on the dial; outside the band it is the base
const S = 432, off = [CX - S / 2, CY - S / 2], order = ['sleep', 'work', 'social', 'other'];
const ring = Buffer.alloc(S * 4 * S * 3);
order.forEach((g, gi) => {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const X = x + off[0], Y = y + off[1], dx = X - CX, dy = Y - CY, r = Math.hypot(dx, dy), a = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
    const bi = (Math.round(Y) * W + Math.round(X)) * 3;
    let c = [base[bi], base[bi + 1], base[bi + 2]];
    if (r > R0 && r < R1) c = mapped(r, a, g);
    const i = (y * S * 4 + gi * S + x) * 3; ring[i] = c[0]; ring[i + 1] = c[1]; ring[i + 2] = c[2];
  }
});
fs.writeFileSync(D + '/ring.rgb', ring);
console.log('ok');
