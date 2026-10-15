// Read real pixels out of a PNG with no library: zlib is built in, and the only
// other thing needed is the row filter, which is five cases.
//
// Why it exists: every claim on the sun decision pages about colour - "the body
// is lighter", "the orange is shallower" - is otherwise an eyeball judgement
// made on a preview that composites onto black. One of those nearly became a
// bug report. This answers the same questions with numbers.
//
//   node dev/look/png-pixel.mjs <file.png> x,y [x,y ...]
//   node dev/look/png-pixel.mjs <file.png> --column 0.5   (a vertical slice)
import fs from 'node:fs';
import zlib from 'node:zlib';

export function decode(file){
  const b = fs.readFileSync(file);
  let off = 8, idat = [], w = 0, h = 0, depth = 0, ct = 0;
  while (off < b.length){
    const len = b.readUInt32BE(off), type = b.toString('ascii', off + 4, off + 8);
    if (type === 'IHDR'){ w = b.readUInt32BE(off+8); h = b.readUInt32BE(off+12);
                          depth = b[off+16]; ct = b[off+17]; }
    if (type === 'IDAT') idat.push(b.subarray(off + 8, off + 8 + len));
    if (type === 'IEND') break;
    off += len + 12;
  }
  if (depth !== 8) throw new Error(file + ': only 8-bit is handled, got ' + depth);
  const ch = {0:1, 2:3, 3:1, 4:2, 6:4}[ct];
  if (!ch) throw new Error(file + ': colour type ' + ct + ' is not handled');
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const out = Buffer.alloc(stride * h);
  let p = 0;
  for (let y = 0; y < h; y++){
    const ft = raw[p++];
    for (let i = 0; i < stride; i++){
      const x = raw[p + i];
      const a = i >= ch ? out[y*stride + i - ch] : 0;          /* left */
      const bb = y > 0 ? out[(y-1)*stride + i] : 0;            /* up */
      const c = (i >= ch && y > 0) ? out[(y-1)*stride + i - ch] : 0;  /* upper-left */
      let v;
      switch (ft){
        case 0: v = x; break;
        case 1: v = x + a; break;
        case 2: v = x + bb; break;
        case 3: v = x + ((a + bb) >> 1); break;
        case 4: {
          const pp = a + bb - c, pa = Math.abs(pp-a), pb = Math.abs(pp-bb), pc = Math.abs(pp-c);
          v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? bb : c); break;
        }
        default: throw new Error('unknown filter ' + ft + ' on row ' + y);
      }
      out[y*stride + i] = v & 255;
    }
    p += stride;
  }
  return { w, h, ch, data: out,
           at(x, y){ const i = (y*w + x)*ch;
             return ch === 4 ? [out[i],out[i+1],out[i+2],out[i+3]]
                  : ch === 3 ? [out[i],out[i+1],out[i+2],255]
                             : [out[i],out[i],out[i],255]; } };
}

if (process.argv[1] && process.argv[1].endsWith('png-pixel.mjs')){
  const [file, ...rest] = process.argv.slice(2);
  const im = decode(file);
  const name = file.split(/[\\/]/).pop();
  if (rest[0] === '--column'){
    const fx = Math.round(im.w * parseFloat(rest[1] ?? '0.5'));
    console.log(name + '  column x=' + fx + ' of ' + im.w);
    for (let f = 0.1; f <= 0.9001; f += 0.1){
      const y = Math.round(im.h * f), px = im.at(fx, y);
      console.log('  y ' + String(y).padStart(4) + ' (' + (f*100).toFixed(0).padStart(2) +
        '%)  rgba(' + px.join(', ') + ')');
    }
  } else {
    rest.forEach(s => {
      const [x, y] = s.split(',').map(Number);
      console.log(name + '  (' + x + ',' + y + ')  rgba(' + im.at(x, y).join(', ') + ')');
    });
  }
}
