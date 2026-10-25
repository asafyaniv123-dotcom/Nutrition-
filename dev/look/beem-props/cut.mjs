// Cuts sheet.png (3x3 prop sheet from Higgsfield) into nine trimmed sprites.
//     node dev/look/beem-props/cut.mjs
// The "transparent" background came with a pale halo around every object, so
// alpha alone does not cut: each cell keeps only its largest solid piece
// (alpha high and not near-white), feathered by a couple of pixels.
import fs from 'node:fs';
import zlib from 'node:zlib';
import { decode } from '../png-pixel.mjs';
const D = new URL('.', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
/* two sheets: the first 3x3 (19.10, 2.75 credits), the second 4x5 (4.25) */
const SHEETS = {
  sheet:  {cols: 3, rows: 3, names: ['glass', 'dumbbell', 'plate', 'notebook', 'pillow', 'clock', 'gift', 'ball', 'plant']},
  sheet2: {cols: 4, rows: 5, names: ['apple', 'salad', 'coffee', 'bottle', 'shoe', 'kettlebell', 'rope', 'yogamat',
    'candle', 'hourglass', 'checklist', 'envelope', 'phone', 'heart', 'palette', 'headphones', 'tshirt', 'bulb', 'camera', 'trophy']},
  /* 19.10: two 5x5 sheets at 4K, 4.25 credits each */
  sheet3: {cols: 5, rows: 5, names: ['banana', 'carrot', 'avocado', 'juice', 'oatmeal', 'sandwich', 'egg', 'strawberry', 'cookie', 'teapot',
    'sleepmask', 'toothbrush', 'towel', 'sunhat', 'umbrella', 'backpack', 'bicycle', 'skateboard', 'basketball', 'tennis',
    'stopwatch', 'drop', 'flame', 'bolt', 'scale']},
  sheet4: {cols: 5, rows: 5, names: ['book', 'pen', 'stickynote', 'calendar', 'magnifier', 'guitar', 'keyboard', 'microphone', 'gamepad', 'dice',
    'flower', 'sunflower', 'gem', 'star', 'rainbow', 'balloon', 'popper', 'cupcake', 'medal', 'crown',
    'speech', 'puzzle', 'rocket', 'plane', 'house']},
  /* 25.10: Mip's birthday, one 2x2 at 1K, 0.25 credits (gpt_image_2_5, white ground) */
  sheet5: {cols: 2, rows: 2, names: ['partyhat', 'cake', 'bdcandle', 'bunting']}
};
const which = process.argv[2] || 'sheet', S = SHEETS[which];
const P = decode(D + which + '.png'), W = P.w, H = P.h;
/* sheet5 came with no alpha at all (RGB on white): give it an opaque one */
const d = P.data.length === W*H*3 ? (() => { const o = Buffer.alloc(W*H*4); for (let p = 0; p < W*H; p++){ o[p*4] = P.data[p*3]; o[p*4+1] = P.data[p*3+1]; o[p*4+2] = P.data[p*3+2]; o[p*4+3] = 255; } return o; })() : P.data;
let a0 = 0, a255 = 0, white = 0;
for (let i = 3; i < d.length; i += 4){ if (d[i] < 10) a0++; if (d[i] > 245) a255++; }
console.log('sheet', W + 'x' + H, 'alpha<10:', (a0/(W*H)*100).toFixed(1) + '%', 'alpha>245:', (a255/(W*H)*100).toFixed(1) + '%');

const NAMES = S.names;
function solid(i){ const a = d[i+3], m = Math.min(d[i], d[i+1], d[i+2]); return a > 200 && m < 236; }
function png(w, h, rgba){
  const raw = Buffer.alloc((w*4 + 1)*h);
  for (let y = 0; y < h; y++){ raw[y*(w*4 + 1)] = 0; rgba.copy(raw, y*(w*4 + 1) + 1, y*w*4, (y + 1)*w*4); }
  const crc = (buf) => { let c, t = []; for (let n = 0; n < 256; n++){ c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    let x = 0xffffffff; for (const b of buf) x = t[(x ^ b) & 255] ^ (x >>> 8); return (x ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw, {level: 9})), chunk('IEND', Buffer.alloc(0))]);
}
const cw = W/S.cols, ch = H/S.rows, out = [];
for (let n = 0; n < S.cols*S.rows; n++){
  const cx0 = Math.round((n % S.cols)*cw), cy0 = Math.round(Math.floor(n/S.cols)*ch), w = Math.round(cw), h = Math.round(ch);
  /* the solid pieces in the cell: the largest is the object, and any piece
     at least 1.5% of its size is kept too - the coffee's steam, the candle's
     flame - while specks of the halo are dropped */
  const lab = new Int32Array(w*h), sizes = [0], edges = [false]; let best = 0, bestN = 0, id = 0;
  for (let p = 0; p < w*h; p++){
    if (lab[p]) continue; const x = p % w, y = (p/w) | 0, i = ((cy0 + y)*W + cx0 + x)*4;
    if (!solid(i)) continue;
    id++; let cnt = 0, edge = false; const st = [p]; lab[p] = id;
    while (st.length){ const q = st.pop(); cnt++; const qx = q % w, qy = (q/w) | 0;
      if (qx === 0 || qy === 0 || qx === w - 1 || qy === h - 1) edge = true;
      for (const [nx, ny] of [[qx-1,qy],[qx+1,qy],[qx,qy-1],[qx,qy+1]]){
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const r = ny*w + nx; if (lab[r]) continue;
        if (solid(((cy0 + ny)*W + cx0 + nx)*4)){ lab[r] = id; st.push(r); } } }
    sizes[id] = cnt; edges[id] = edge; if (cnt > bestN){ bestN = cnt; best = id; }
  }
  /* a piece that touches the cell's edge is a NEIGHBOUR reaching over the
     line, not part of this object - the first version kept such slivers
     above the shoe, the rope, the mat and the kettlebell */
  const keep = new Uint8Array(id + 1);
  /* .004, not .015: the party popper's confetti are tiny separate pieces */
  for (let k = 1; k <= id; k++) keep[k] = k === best || (sizes[k] >= bestN*.004 && !edges[k]) ? 1 : 0;
  // fill holes (the glass's water, highlights) - everything enclosed by the piece belongs to it
  const out_ = new Uint8Array(w*h), st = [];
  for (let x = 0; x < w; x++) st.push(x, (h-1)*w + x); for (let y = 0; y < h; y++) st.push(y*w, y*w + w - 1);
  while (st.length){ const q = st.pop(); if (out_[q] || keep[lab[q]]) continue; out_[q] = 1; const qx = q % w, qy = (q/w) | 0;
    if (qx > 0) st.push(q-1); if (qx < w-1) st.push(q+1); if (qy > 0) st.push(q-w); if (qy < h-1) st.push(q+w); }
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let p = 0; p < w*h; p++) if (!out_[p]){ const x = p % w, y = (p/w) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const pad = 6; x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad);
  const ow = x1 - x0 + 1, oh = y1 - y0 + 1, buf = Buffer.alloc(ow*oh*4);
  // distance to the outside, for a 2px feather
  for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++){
    const p = (y0 + y)*w + x0 + x, i = ((cy0 + y0 + y)*W + cx0 + x0 + x)*4, o = (y*ow + x)*4;
    if (out_[p]) continue;
    let near = 0; for (let k = 1; k <= 2 && !near; k++) for (const [dx, dy] of [[k,0],[-k,0],[0,k],[0,-k]]){
      const xx = x0 + x + dx, yy = y0 + y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h || out_[yy*w + xx]){ near = k; break; } }
    buf[o] = d[i]; buf[o+1] = d[i+1]; buf[o+2] = d[i+2]; buf[o+3] = Math.round(d[i+3]*(near ? near/3 : 1));
  }
  fs.writeFileSync(D + NAMES[n] + '.png', png(ow, oh, buf));
  out.push(NAMES[n] + ' ' + ow + 'x' + oh);
}
console.log(out.join(', '));
