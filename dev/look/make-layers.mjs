// Split the chosen render into FOUR layers by radius: the body, and each of
// the three rings on its own.
//
// WHY FOUR AND NOT TWO. Two layers let the rings lag behind the body. Three
// rings turning at three different speeds - or in three different directions
// while he is thinking - needs each ring to be its own layer, and that is a
// thing the render can be cut into rather than a thing that has to be drawn.
//
// THE BOUNDARIES ARE MEASURED, NOT CHOSEN. Sampling a whole circle at each
// radius of sun-30 and recording what fraction of it is opaque:
//
//     230-248   72% -> 31%   the body's rim and its glow
//     254-302   peak 62% at 278     RING 1
//     308-362   peak 54% at 335     RING 2
//     368-425   peak 50% at 396     RING 3
//     430+      nothing
//
// So the cuts fall in the troughs between those peaks: 245, 311, 365, 430.
// Each gets a feather so no layer carries a hard edge, and the feathers are
// complementary - what one layer loses the next one gains, so recombining all
// four is the original image.
import { decode } from './png-pixel.mjs';
import { writeRGBA } from './png-write.mjs';

const SRC  = 'C:/Projects/Nutrition-/dev/look/sun-gen/sun-30-vol-balanced.png';
const OUT  = 'C:/Projects/Nutrition-/dev/assets/';
const OUTSIZE = 512;
const FEATHER = 9;
/* name, outer edge of this band (in the SOURCE's 1024 frame) */
const BANDS = [
  ['sun-body',  245],   // the sphere, its rim and its glow
  ['sun-r1',    311],   // red
  ['sun-r2',    365],   // orange
  ['sun-r3',    430],   // yellow
];

const im = decode(SRC);
const SC = im.w / OUTSIZE;
const cx = im.w/2, cy = im.h/2;
const bufs = BANDS.map(() => Buffer.alloc(OUTSIZE*OUTSIZE*4));

/* how much of a pixel at distance d belongs to band i: 1 inside, falling to 0
   across the feather at that band's outer edge, and 0 before the previous one */
function share(d, i){
  const lo = i === 0 ? -Infinity : BANDS[i-1][1];
  const hi = BANDS[i][1];
  const up = i === 0 ? 1 : Math.min(1, Math.max(0, (d - (lo - FEATHER)) / (FEATHER*2)));
  const dn = i === BANDS.length-1 ? 1
           : 1 - Math.min(1, Math.max(0, (d - (hi - FEATHER)) / (FEATHER*2)));
  return up * dn;
}

for (let oy = 0; oy < OUTSIZE; oy++)
  for (let ox = 0; ox < OUTSIZE; ox++){
    let r=0,g=0,b=0,a=0,n=0;
    const X0 = Math.floor(ox*SC), X1 = Math.max(X0+1, Math.floor((ox+1)*SC));
    const Y0 = Math.floor(oy*SC), Y1 = Math.max(Y0+1, Math.floor((oy+1)*SC));
    for (let sy = Y0; sy < Y1; sy++)
      for (let sx = X0; sx < X1; sx++){
        const q = im.at(sx, sy);
        r += q[0]*q[3]; g += q[1]*q[3]; b += q[2]*q[3]; a += q[3]; n++;
      }
    const R = a ? Math.round(r/a) : 0, G = a ? Math.round(g/a) : 0,
          B = a ? Math.round(b/a) : 0, A = a/n;
    const d = Math.hypot((ox+0.5)*SC - cx, (oy+0.5)*SC - cy);
    const i4 = (oy*OUTSIZE + ox)*4;
    for (let i = 0; i < BANDS.length; i++){
      const s = share(d, i);
      bufs[i][i4]=R; bufs[i][i4+1]=G; bufs[i][i4+2]=B;
      bufs[i][i4+3] = Math.round(A * s);
    }
  }

BANDS.forEach(function(band, i){
  const bytes = writeRGBA(OUT + band[0] + '.png', OUTSIZE, OUTSIZE, bufs[i]);
  console.log('wrote dev/assets/' + (band[0]+'.png').padEnd(14) +
    (bytes/1024).toFixed(0).padStart(4) + 'KB');
});

/* prove each band kept its own thing and nothing else, and that the four
   together still add up to the original alpha */
console.log('\nalpha at each radius, per layer (source px from centre):');
const back = BANDS.map(b => decode(OUT + b[0] + '.png'));
[100, 278, 335, 396].forEach(function(d){
  const row = back.map(function(L){
    const p = L.at(OUTSIZE>>1, Math.round(OUTSIZE/2 + d/SC));
    return String(p[3]).padStart(4);
  });
  const sum = back.reduce(function(t, L){
    return t + L.at(OUTSIZE>>1, Math.round(OUTSIZE/2 + d/SC))[3]; }, 0);
  const orig = im.at(Math.round(cx), Math.round(cy + d))[3];
  console.log('  ' + String(d).padStart(4) + 'px  ' + row.join(' ') +
    '   sum ' + String(sum).padStart(4) + '  original ' + String(orig).padStart(4) +
    (Math.abs(sum - orig) <= 3 ? '  ok' : '  MISMATCH'));
});
