// Split the chosen render into TWO layers by radius, so the rings can turn
// while the face stays level.
//
// WHY: a single flat PNG rotated is a picture rotated - the eyes go round with
// it and he looks like he is falling over. The rings are the only part that
// should turn, and in this image they are separated from the body by a clean
// gap. Measured along a ray from the centre of sun-30:
//
//     0-216px   the body, alpha 252, orange deepening outward
//   228-360px   the gap: alpha falls to 89 then 21 - this is the glow
//   372-408px   the first bead, alpha back to 252
//
// So 290 cuts through the middle of the gap and touches neither.
//
// The glow belongs with the BODY, not the rings: it is light coming off him,
// and a halo that counter-rotates while its source stands still looks wrong.
import { decode } from './png-pixel.mjs';
import { writeRGBA } from './png-write.mjs';

const SRC  = 'C:/Projects/Nutrition-/dev/look/sun-gen/sun-30-vol-balanced.png';
const OUT  = 'C:/Projects/Nutrition-/dev/assets/';
const CUT  = 290;          // px from centre, in the source's own 1024 frame
const FEATHER = 14;        // soften the seam so neither layer has a hard edge

const OUTSIZE = 512;        // the splash shows him at ~260 CSS px; 512 covers 2x
const im = decode(SRC);
const SC = im.w / OUTSIZE;  // source pixels per output pixel
const cx = im.w/2, cy = im.h/2;
const body  = Buffer.alloc(OUTSIZE*OUTSIZE*4);
const rings = Buffer.alloc(OUTSIZE*OUTSIZE*4);

for (let oy = 0; oy < OUTSIZE; oy++)
  for (let ox = 0; ox < OUTSIZE; ox++){
    /* box-average the source square this output pixel covers, weighting colour
       by alpha so the transparent surround cannot grey the edges */
    let r=0,g=0,b=0,a=0,n=0;
    const X0 = Math.floor(ox*SC), X1 = Math.max(X0+1, Math.floor((ox+1)*SC));
    const Y0 = Math.floor(oy*SC), Y1 = Math.max(Y0+1, Math.floor((oy+1)*SC));
    for (let sy = Y0; sy < Y1; sy++)
      for (let sx = X0; sx < X1; sx++){
        const q = im.at(sx, sy);
        r += q[0]*q[3]; g += q[1]*q[3]; b += q[2]*q[3]; a += q[3]; n++;
      }
    const p = [a ? Math.round(r/a) : 0, a ? Math.round(g/a) : 0,
               a ? Math.round(b/a) : 0, Math.round(a/n)];
    const i = (oy*OUTSIZE + ox)*4;
    const x = (ox + 0.5)*SC, y = (oy + 0.5)*SC;
    const d = Math.hypot(x - cx, y - cy);
    // a smooth 0..1 across the feather band rather than a hard cut
    let t = (d - (CUT - FEATHER)) / (FEATHER*2);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    body[i]=p[0];  body[i+1]=p[1];  body[i+2]=p[2];  body[i+3]  = Math.round(p[3]*(1-t));
    rings[i]=p[0]; rings[i+1]=p[1]; rings[i+2]=p[2]; rings[i+3] = Math.round(p[3]*t);
  }

const b = writeRGBA(OUT + 'sun-body.png',  OUTSIZE, OUTSIZE, body);
const r = writeRGBA(OUT + 'sun-rings.png', OUTSIZE, OUTSIZE, rings);
console.log('wrote dev/assets/sun-body.png   ' + (b/1024).toFixed(0) + 'KB');
console.log('wrote dev/assets/sun-rings.png  ' + (r/1024).toFixed(0) + 'KB');

// prove the split put each thing in the right file
const B = decode(OUT + 'sun-body.png'), R = decode(OUT + 'sun-rings.png');
const probe = (im2, d, label) => {
  const p = im2.at(OUTSIZE>>1, Math.round(OUTSIZE/2 + d/SC));
  console.log('  ' + label.padEnd(14) + ' at ' + String(d).padStart(3) + 'px  alpha ' +
    String(p[3]).padStart(3));
};
console.log('body layer:');   probe(B, 100, 'on the body'); probe(B, 390, 'on a bead');
console.log('rings layer:');  probe(R, 100, 'on the body'); probe(R, 390, 'on a bead');
