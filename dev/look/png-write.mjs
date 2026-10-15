// A minimal PNG ENCODER, so turning a render into an app icon is a command and
// not a sequence of clicks. The browser route worked once and Chrome then
// blocked every further automatic download, which is a bad thing to depend on
// for a step that will be repeated every time the character changes.
//
// zlib is built in and PNG's container is four chunks, so the only real work is
// CRC32. Filter 0 on every row keeps it to a few lines; the file is a little
// larger than an optimised encoder would make it, and for an icon that is a
// trade worth taking over adding a dependency.
import fs from 'node:fs';
import zlib from 'node:zlib';

const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++){
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return buf => {
    let c = -1;
    for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
})();

function chunk(type, data){
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(CRC(body));
  return Buffer.concat([len, body, crc]);
}

/** rgb: Buffer of w*h*3, opaque. Writes an 8-bit truecolour PNG. */
export function writeRGB(path, w, h, rgb){
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;    // bit depth
  ihdr[9] = 2;    // colour type 2 = truecolour, no alpha
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc(h * (w*3 + 1));
  for (let y = 0; y < h; y++){
    raw[y*(w*3+1)] = 0;                                  // filter: none
    rgb.copy(raw, y*(w*3+1) + 1, y*w*3, (y+1)*w*3);
  }
  fs.writeFileSync(path, Buffer.concat([
    Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, {level: 9})),
    chunk('IEND', Buffer.alloc(0)),
  ]));
  return fs.statSync(path).size;
}

/** Composite an RGBA image over a solid colour, box-downscale, return RGB. */
export function flattenAndScale(im, out, bg, padFrac){
  const [br, bg_, bb] = bg;
  const pad = Math.round(out * (padFrac || 0));
  const inner = out - pad*2;
  const rgb = Buffer.alloc(out*out*3);
  for (let i = 0; i < rgb.length; i += 3){ rgb[i]=br; rgb[i+1]=bg_; rgb[i+2]=bb; }
  // every destination pixel averages the source box it covers - exact for an
  // integer ratio and good enough for any other
  const sx = im.w / inner, sy = im.h / inner;
  for (let y = 0; y < inner; y++){
    const y0 = Math.floor(y*sy), y1 = Math.max(y0+1, Math.floor((y+1)*sy));
    for (let x = 0; x < inner; x++){
      const x0 = Math.floor(x*sx), x1 = Math.max(x0+1, Math.floor((x+1)*sx));
      let r=0, g=0, b=0, a=0, n=0;
      for (let yy = y0; yy < y1; yy++)
        for (let xx = x0; xx < x1; xx++){
          const p = im.at(xx, yy);
          r += p[0]*p[3]; g += p[1]*p[3]; b += p[2]*p[3]; a += p[3]; n++;
        }
      const A = a / n / 255;
      const sr = a ? r/a : 0, sg = a ? g/a : 0, sb = a ? b/a : 0;
      const o = ((y+pad)*out + (x+pad)) * 3;
      rgb[o]   = Math.round(sr*A + br*(1-A));
      rgb[o+1] = Math.round(sg*A + bg_*(1-A));
      rgb[o+2] = Math.round(sb*A + bb*(1-A));
    }
  }
  return rgb;
}
