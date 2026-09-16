/* Measure a motion reference instead of describing it.
 *
 *     node tools/measure-gif.mjs "Taste library/screenshots/whatever.gif"
 *
 * Writes <name>.series.json beside the GIF and prints the shape of the motion.
 *
 * WHY THIS EXISTS. Three attempts at the hub were built from this library's
 * dented-sensor GIF by looking at it, and all three were wrong in the same
 * way - a still frame caught at a random moment tells you nothing about which
 * direction the surface is travelling. The fourth was built from a decode, and
 * that one worked. Then the numbers from that decode turned out to be wrong
 * too, because they were read off a console and never written down: the swing,
 * the tonal range and the timing were all misquoted afterwards, the timing by
 * a factor of three. So the tool saves its series to disk, and the file is the
 * thing to argue with.
 *
 * WHAT IT MEASURES. For every frame, the mean luminance of a band above the
 * moving object's centre minus a band below it. With light from above that
 * number IS the curvature: a bulge is bright on top and dark below, a dent is
 * the reverse, and a SIGN CHANGE across the loop means the surface inverts
 * rather than merely deepening. It also reports the tonal range of the whole
 * disc, which is what "soft" turns out to mean numerically, and the duration
 * of each transition, which is what it turns out to mean temporally.
 *
 * THE OBJECT FINDS ITSELF. Nothing is hand-placed: the pixels that MOVE across
 * the loop are the object, so pass one takes the bounding box of everything
 * with temporal variance and pass two measures inside it.
 *
 * NO DEPENDENCIES. A GIF is LZW over palette indices plus a disposal rule per
 * frame. The one real subtlety is that most frames are PARTIAL - a rectangle
 * pasted over the previous composite - so a frame's own pixels are whatever
 * happened to change, not the picture; every frame here is composited first.
 */
import fs from 'fs';
import path from 'path';

const SRC = process.argv[2];
if (!SRC) {
  console.error('usage: node tools/measure-gif.mjs <file.gif>');
  process.exit(2);
}
const b = fs.readFileSync(SRC);
if (b.slice(0, 3).toString() !== 'GIF') throw new Error('not a GIF: ' + SRC);

/* ── the LZW decoder, the ordinary one ── */
function lzw(minCodeSize, data, pixelCount) {
  const MAX = 4096;
  const clear = 1 << minCodeSize;
  const eoi = clear + 1;
  const prefix = new Int32Array(MAX);
  const suffix = new Uint8Array(MAX);
  const stack = new Uint8Array(MAX + 1);
  for (let i = 0; i < clear; i++) { prefix[i] = -1; suffix[i] = i; }

  const out = new Uint8Array(pixelCount);
  let codeSize = minCodeSize + 1;
  let next = eoi + 1;
  let bit = 0, oi = 0, old = -1;

  const readCode = () => {
    let v = 0;
    for (let i = 0; i < codeSize; i++) {
      const byte = bit >> 3;
      if (byte >= data.length) return eoi;
      v |= ((data[byte] >> (bit & 7)) & 1) << i;
      bit++;
    }
    return v;
  };

  while (oi < pixelCount) {
    const code = readCode();
    if (code === eoi) break;
    if (code === clear) { codeSize = minCodeSize + 1; next = eoi + 1; old = -1; continue; }
    let sp = 0, c = code;
    if (code >= next) {                      /* the KwKwK case */
      if (old < 0) break;
      stack[sp++] = suffix[old];
      c = old;
    }
    while (c >= clear) { stack[sp++] = suffix[c]; c = prefix[c]; }
    stack[sp++] = c & 0xff;
    const first = c & 0xff;
    while (sp > 0 && oi < pixelCount) out[oi++] = stack[--sp];
    if (old >= 0 && next < MAX) {
      prefix[next] = old;
      suffix[next] = first;
      next++;
      if ((next & (next - 1)) === 0 && next < MAX) codeSize++;
    }
    old = code;
  }
  return out;
}

function* interlaceRows(h) {
  for (let y = 0; y < h; y += 8) yield y;
  for (let y = 4; y < h; y += 8) yield y;
  for (let y = 2; y < h; y += 4) yield y;
  for (let y = 1; y < h; y += 2) yield y;
}

/* ── walk the file, handing each COMPOSITED frame to a callback ── */
function frames(onFrame) {
  let p = 6;
  const W = b[p] | (b[p + 1] << 8);
  const H = b[p + 2] | (b[p + 3] << 8);
  const packed = b[p + 4];
  p += 7;

  let gct = null;
  if (packed & 0x80) {
    const n = 2 ** ((packed & 7) + 1);
    gct = b.slice(p, p + 3 * n);
    p += 3 * n;
  }

  const canvas = new Uint8Array(W * H * 4);
  let saved = null;
  let gce = { delay: 0, disposal: 0, tIndex: -1 };
  let count = 0;

  const subBlocks = () => {
    const parts = [];
    while (b[p]) { parts.push(b.slice(p + 1, p + 1 + b[p])); p += b[p] + 1; }
    p++;
    return Buffer.concat(parts);
  };

  while (p < b.length) {
    const c = b[p];
    if (c === 0x3b) break;
    if (c === 0x21) {
      const label = b[p + 1];
      p += 2;
      if (label === 0xf9) {
        const f = b[p + 1];
        /* block size, packed field, THEN the little-endian delay. Reading it
           one byte early folds the packed field into the low byte and reports
           a twenty-minute loop, which is how that bug announced itself. */
        gce = {
          delay: (b[p + 2] | (b[p + 3] << 8)) * 10,
          disposal: (f >> 2) & 7,
          tIndex: (f & 1) ? b[p + 4] : -1,
        };
      }
      subBlocks();
      continue;
    }
    if (c !== 0x2c) throw new Error('unexpected block 0x' + c.toString(16));

    const fx = b[p + 1] | (b[p + 2] << 8);
    const fy = b[p + 3] | (b[p + 4] << 8);
    const fw = b[p + 5] | (b[p + 6] << 8);
    const fh = b[p + 7] | (b[p + 8] << 8);
    const lp = b[p + 9];
    p += 10;

    let table = gct;
    if (lp & 0x80) {
      const n = 2 ** ((lp & 7) + 1);
      table = b.slice(p, p + 3 * n);
      p += 3 * n;
    }
    const interlaced = !!(lp & 0x40);

    const minCodeSize = b[p]; p++;
    const idx = lzw(minCodeSize, subBlocks(), fw * fh);

    if (gce.disposal === 3) saved = canvas.slice();

    const rows = interlaced ? [...interlaceRows(fh)] : Array.from({ length: fh }, (_, i) => i);
    for (let r = 0; r < fh; r++) {
      const srcRow = rows[r];
      for (let x = 0; x < fw; x++) {
        const v = idx[r * fw + x];
        if (v === gce.tIndex) continue;
        const cx = fx + x, cy = fy + srcRow;
        if (cx >= W || cy >= H) continue;
        const o = (cy * W + cx) * 4;
        canvas[o] = table[v * 3];
        canvas[o + 1] = table[v * 3 + 1];
        canvas[o + 2] = table[v * 3 + 2];
        canvas[o + 3] = 255;
      }
    }

    onFrame(canvas, W, H, count++, gce.delay);

    if (gce.disposal === 2) {
      for (let i = 0; i < fh; i++) for (let x = 0; x < fw; x++) {
        const cx = fx + x, cy = fy + i;
        if (cx >= W || cy >= H) continue;
        const o = (cy * W + cx) * 4;
        canvas[o] = canvas[o + 1] = canvas[o + 2] = canvas[o + 3] = 0;
      }
    } else if (gce.disposal === 3 && saved) {
      canvas.set(saved);
    }
  }
  return { W, H, count };
}

const lum = (c, o) => 0.2126 * c[o] + 0.7152 * c[o + 1] + 0.0722 * c[o + 2];

/* ── pass one: what moves? ── */
let sum = null, sumsq = null, N = 0;
const { W, H } = frames((c, w, h) => {
  if (!sum) { sum = new Float64Array(w * h); sumsq = new Float64Array(w * h); }
  for (let k = 0; k < w * h; k++) {
    const v = lum(c, k * 4);
    sum[k] += v; sumsq[k] += v * v;
  }
  N++;
});

const varr = new Float64Array(W * H);
let vmax = 0;
for (let k = 0; k < W * H; k++) {
  const m = sum[k] / N;
  const v = Math.max(0, sumsq[k] / N - m * m);
  varr[k] = v;
  if (v > vmax) vmax = v;
}
let x0 = W, x1 = 0, y0 = H, y1 = 0, moving = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (varr[y * W + x] > vmax * 0.08) {
    moving++;
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
}
const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
const R = Math.min(x1 - x0, y1 - y0) / 2;

console.log(path.basename(SRC));
console.log('  frame      ' + W + 'x' + H + ', ' + N + ' frames');
console.log('  moving     ' + (100 * moving / (W * H)).toFixed(1) + '% of the frame');
console.log('  object     centre ' + cx.toFixed(0) + ',' + cy.toFixed(0) + '  r=' + R.toFixed(0));

/* ── pass two: the curvature signature, frame by frame ──
 *
 * BARE SURFACE ONLY, and this is the second definition. The first read a band
 * straight across the middle of the disc, which is fine on a blank dome and
 * wrong the moment the object has anything drawn on it: measured that way our
 * own hub reported "no inversion", because a white icon disc sits in its top
 * band and outweighs the shading entirely. So both are read on the annulus
 * from 0.70R to 0.95R - the surface, past any label - and within it the arc
 * within 40 degrees of straight up against the arc within 40 degrees of
 * straight down. */
const ARC = { rIn: 0.70, rOut: 0.95, halfAngle: 40 };
const arcs = (c) => {
  const rad = ARC.halfAngle * Math.PI / 180;
  let ts = 0, tn = 0, bs = 0, bn = 0, all = [];
  for (let y = Math.round(cy - R); y <= Math.round(cy + R); y++)
    for (let x = Math.round(cx - R); x <= Math.round(cx + R); x++) {
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy;
      if (d2 > (R * ARC.rOut) ** 2 || d2 < (R * ARC.rIn) ** 2) continue;
      const v = lum(c, (y * W + x) * 4);
      all.push(v);
      if (Math.atan2(Math.abs(dx), -dy) <= rad) { ts += v; tn++; }
      else if (Math.atan2(Math.abs(dx), dy) <= rad) { bs += v; bn++; }
    }
  all.sort((a, b) => a - b);
  const p = (q) => all[Math.floor(q * (all.length - 1))];
  return {
    top: tn ? ts / tn : 0,
    bot: bn ? bs / bn : 0,
    mean: all.reduce((a, v) => a + v, 0) / all.length,
    spread: p(0.95) - p(0.05),
  };
};

const series = [];
let per = 20;
frames((c, w, h, i, delay) => {
  if (i === 1) per = delay || per;
  const a = arcs(c);
  series.push({
    i, ms: i * (delay || per),
    top: +a.top.toFixed(2), bot: +a.bot.toFixed(2), d: +(a.top - a.bot).toFixed(2),
    disc: +a.mean.toFixed(2), spread: +a.spread.toFixed(2),
  });
});

const out = SRC.replace(/\.gif$/i, '') + '.series.json';
fs.writeFileSync(out, JSON.stringify(series, null, 1));

const d = series.map(f => f.d);
const disc = series.map(f => f.disc);
const lo = Math.min(...d), hi = Math.max(...d), span = hi - lo;
const dLo = Math.min(...disc), dHi = Math.max(...disc);

console.log('  loop       ' + ((series.length * per) / 1000).toFixed(2) + ' s at ' + per + ' ms/frame');
console.log('');
console.log('  top - bottom   ' + lo.toFixed(1) + ' .. ' + hi.toFixed(1) +
            (lo < 0 && hi > 0 ? '    IT FLIPS SIGN - the surface inverts' : '    no sign change - it only deepens'));
console.log('  tonal range    ' + (dHi - dLo).toFixed(1) + ' of 255  (' + (100 * (dHi - dLo) / 255).toFixed(1) + '%)');

/* the plateaux, and the runs between them - a transition is the run that is
   neither, which is the only definition that survives a wobble at the ends */
const hiT = lo + span * 0.9, loT = lo + span * 0.1;
const state = d.map(v => v >= hiT ? 'H' : v <= loT ? 'L' : '-');
const runs = [];
let cur = state[0], start = 0;
for (let i = 1; i <= state.length; i++) {
  if (state[i] !== cur) { runs.push({ s: cur, from: start, n: i - start }); cur = state[i]; start = i; }
}
console.log('');
console.log('  the loop, in order:');
for (const r of runs) {
  if (r.n * per < 60) continue;                      /* a wobble, not a state */
  const name = r.s === 'H' ? 'convex, held ' : r.s === 'L' ? 'concave, held' : 'IN TRANSIT   ';
  console.log('    ' + name + '  ' + String(r.n * per).padStart(5) + ' ms');
}
console.log('');
console.log('  series -> ' + out);
