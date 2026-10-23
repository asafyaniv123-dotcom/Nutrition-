/* The launch screen: plain sand (#ece3d4), the colour the first run opens
 * on, instead of Capacitor's logo - so the app opens without a flash of
 * someone else's brand. Three identical 2732px files, as the template expects. */
import fs from 'fs';
import zlib from 'zlib';
const W = 2732, rgb = [0xec, 0xe3, 0xd4];
const row = Buffer.alloc(W * 3 + 1); for (let x = 0; x < W; x++) row.set(rgb, 1 + x * 3);
const raw = Buffer.concat(Array.from({ length: W }, () => row));
const crcT = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0; }
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t, 'latin1'), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(W, 4); ih[8] = 8; ih[9] = 2;
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
const D = 'native/ios/App/App/Assets.xcassets/Splash.imageset/';
for (const f of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) fs.writeFileSync(D + f, png);
console.log('splash', (png.length / 1024).toFixed(1) + 'KB x3');
