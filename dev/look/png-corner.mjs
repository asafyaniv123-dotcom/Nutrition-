// Is the background actually transparent? A PNG having an alpha CHANNEL says
// nothing - our own reference is RGBA with an opaque ground. Decode the real
// top-left pixel instead.
//
// Only pixel (0,0) is needed, and it is recoverable whatever the row filter is:
// on the first row the 'up' neighbour is zero, and for the first pixel the
// 'left' neighbour is zero too, so every one of the five filters reduces to the
// raw bytes. That is the whole reason this needs no PNG library.
import fs from 'node:fs';
import zlib from 'node:zlib';

for (const f of process.argv.slice(2)) {
  const b = fs.readFileSync(f);
  let off = 8, idat = [];
  let ct = 0, w = 0, h = 0;
  while (off < b.length) {
    const len = b.readUInt32BE(off), type = b.toString('ascii', off + 4, off + 8);
    if (type === 'IHDR') { w = b.readUInt32BE(off+8); h = b.readUInt32BE(off+12); ct = b[off+17]; }
    if (type === 'IDAT') idat.push(b.subarray(off + 8, off + 8 + len));
    if (type === 'IEND') break;
    off += len + 12;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const ch = ct === 6 ? 4 : ct === 2 ? 3 : 1;
  const filter = raw[0];
  const px = [...raw.subarray(1, 1 + ch)];
  const name = f.split(/[\\/]/).pop().padEnd(22);
  const alpha = ch === 4 ? px[3] : 255;
  console.log(`${name} ${w}x${h}  row0 filter ${filter}  corner rgba(${px.join(', ')})  ` +
    `-> ${alpha === 0 ? 'TRANSPARENT' : alpha === 255 ? 'OPAQUE' : 'alpha ' + alpha}`);
}
