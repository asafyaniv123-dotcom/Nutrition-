// Split the chosen render into four layers: the body, and each ring's BEADS.
//
// THE BUG THIS FIXES, which he caught on a phone. The first version split by
// radius alone, so each ring layer carried everything in its band - including
// the soft haze between the beads. That haze is not rotationally symmetric: it
// holds the render's own light and shadow. Spin it and the haze spins, against
// a body that does not, and the seam between them is visible as a static arc
// across a moving halo.
//
// MEASURED, which is what makes the fix obvious. Inside the ring bands:
//
//     ring 1   alpha <50: 3%   50-100: 54%   >230: 35%
//     ring 2   alpha <50: 44%  50-100: 17%   >230: 35%
//     ring 3   alpha <50: 68%  50-100: 2%    >230: 28%
//
// Only 1-3% of each band sits between 100 and 230. So the beads are the >230
// group and the haze is everything under it, and they separate cleanly at 180.
//
// THE MASK IS DILATED BY 2px before it is used. A bead's antialiased rim is
// mid-alpha, and leaving it behind would paint a static ghost of every bead on
// the body layer that the moving bead then slides off.
import { decode } from './png-pixel.mjs';
import { writeRGBA } from './png-write.mjs';

const SRC = 'C:/Projects/Nutrition-/dev/look/sun-gen/sun-30-vol-balanced.png';
const OUT = 'C:/Projects/Nutrition-/dev/assets/';
const OUTSIZE = 1024;   /* the source IS 1024, so this upscales nothing. At 512 the
                           model sheet showed him at ~700 CSS px, which is 2100
                           device px on a phone - a four-fold upscale of an asset
                           we already had at full size. */
const BEAD_A  = 180;     // alpha above which a pixel in a band is bead, not haze
const DILATE  = 2;
/* name, inner and outer edge, in the source's 1024 frame. The inner edge of
   ring 1 is 254 and not 248 because that is where the MEASURED trough is: the
   share of a full circle with alpha above 180 falls from 89% at r=226 to 19%
   at r=253 and climbs again after it. Starting at 248 pulled the body's own
   rim light into the first ring layer, and it span with the beads. */
const BANDS = [['sun-r1', 254, 311], ['sun-r2', 311, 365], ['sun-r3', 365, 440]];

const im = decode(SRC);
const W = im.w, cx = W/2, cy = W/2;

/* 1. which pixels are bead?
   NOT by radius. The rings are not perfectly concentric in the render - at the
   bottom the inner ones sit closer in - so any fixed boundary slices through
   some beads and leaves their tops behind. Cutting at 254 did exactly that.
   Instead: find each bead as a CONNECTED BLOB of high alpha outside the body,
   and give the whole blob to whichever ring its centre is nearest. A bead is
   then never cut, wherever it happens to sit. */
const INNER = 250;                       // outside the body and its rim
const CENTRES = [278, 335, 396];         // measured peak radius of each ring
const bead = new Uint8Array(W*W);
{
  const seen = new Uint8Array(W*W);
  const isOn = i => im.at(i % W, (i / W) | 0)[3] > BEAD_A;
  let blobs = 0, kept = 0, counts = [0,0,0];
  for (let y = 0; y < W; y++)
    for (let x = 0; x < W; x++){
      const i = y*W + x;
      if (seen[i] || Math.hypot(x-cx, y-cy) < INNER || !isOn(i)) continue;
      /* flood fill this blob */
      const stack = [i], px = [];
      seen[i] = 1;
      while (stack.length){
        const j = stack.pop(); px.push(j);
        const jx = j % W, jy = (j / W) | 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++){
            const nx = jx+dx, ny = jy+dy;
            if (nx < 0 || ny < 0 || nx >= W || ny >= W) continue;
            const k = ny*W + nx;
            if (seen[k] || Math.hypot(nx-cx, ny-cy) < INNER || !isOn(k)) continue;
            seen[k] = 1; stack.push(k);
          }
      }
      blobs++;
      /* a bead is a compact blob. The body's rim light survives as a long thin
         arc, and that is what this rejects. */
      let sx = 0, sy = 0, x0=1e9, x1=-1, y0=1e9, y1=-1;
      px.forEach(j => { const a = j % W, b = (j / W)|0;
        sx += a; sy += b; if(a<x0)x0=a; if(a>x1)x1=a; if(b<y0)y0=b; if(b>y1)y1=b; });
      const w = x1-x0+1, h = y1-y0+1;
      if (px.length < 60 || w > h*2.4 || h > w*2.4) continue;
      const r = Math.hypot(sx/px.length - cx, sy/px.length - cy);
      let best = 0;
      for (let c = 1; c < 3; c++)
        if (Math.abs(r - CENTRES[c]) < Math.abs(r - CENTRES[best])) best = c;
      px.forEach(j => bead[j] = best + 1);
      kept++; counts[best]++;
    }
  console.log('blobs found ' + blobs + ', kept as beads ' + kept +
    '   per ring: ' + counts.join(' / '));
}
/* 2. grow it, so antialiased bead rims travel with their bead */
const grown = new Uint8Array(bead);
for (let y = DILATE; y < W-DILATE; y++)
  for (let x = DILATE; x < W-DILATE; x++){
    if (bead[y*W + x]) continue;
    let v = 0;
    for (let dy = -DILATE; dy <= DILATE && !v; dy++)
      for (let dx = -DILATE; dx <= DILATE && !v; dx++)
        if (bead[(y+dy)*W + x+dx]) v = bead[(y+dy)*W + x+dx];
    if (v) grown[y*W + x] = v;
  }

/* 3. every pixel goes to exactly one layer: its bead's ring, or the body */
const bufs = [Buffer.alloc(OUTSIZE*OUTSIZE*4), Buffer.alloc(OUTSIZE*OUTSIZE*4),
              Buffer.alloc(OUTSIZE*OUTSIZE*4), Buffer.alloc(OUTSIZE*OUTSIZE*4)];
const SC = W / OUTSIZE;
for (let oy = 0; oy < OUTSIZE; oy++)
  for (let ox = 0; ox < OUTSIZE; ox++){
    /* box-average each destination layer separately, so a pixel that is half
       bead and half haze contributes its halves to different layers */
    const acc = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
    const X0 = ox*SC|0, X1 = Math.max(X0+1, ((ox+1)*SC)|0);
    const Y0 = oy*SC|0, Y1 = Math.max(Y0+1, ((oy+1)*SC)|0);
    let n = 0;
    for (let sy = Y0; sy < Y1; sy++)
      for (let sx = X0; sx < X1; sx++){
        const p = im.at(sx, sy), L = grown[sy*W + sx];   // 0 = body
        const a = acc[L];
        a[0] += p[0]*p[3]; a[1] += p[1]*p[3]; a[2] += p[2]*p[3]; a[3] += p[3]; a[4]++;
        n++;
      }
    const o = (oy*OUTSIZE + ox)*4;
    for (let L = 0; L < 4; L++){
      const a = acc[L];
      bufs[L][o]   = a[3] ? Math.round(a[0]/a[3]) : 0;
      bufs[L][o+1] = a[3] ? Math.round(a[1]/a[3]) : 0;
      bufs[L][o+2] = a[3] ? Math.round(a[2]/a[3]) : 0;
      bufs[L][o+3] = Math.round(a[3] / n);          // share of the whole pixel
    }
  }

['sun-body','sun-r1','sun-r2','sun-r3'].forEach(function(name, i){
  const bytes = writeRGBA(OUT + name + '.png', OUTSIZE, OUTSIZE, bufs[i]);
  console.log('wrote ' + (name + '.png').padEnd(14) + (bytes/1024).toFixed(0).padStart(4) + 'KB');
});

/* the ring layers must now be beads and NOTHING ELSE. If any haze stayed
   behind, it will show up as opaque area far from any bead. */
console.log('\nhow much of each layer is actually drawn, and how solid it is:');
['sun-body','sun-r1','sun-r2','sun-r3'].forEach(function(name){
  const L = decode(OUT + name + '.png');
  let n = 0, solid = 0, soft = 0;
  for (let y = 0; y < OUTSIZE; y++)
    for (let x = 0; x < OUTSIZE; x++){
      const a = L.at(x,y)[3];
      if (a < 8) continue;
      n++; if (a > 230) solid++; else if (a < 120) soft++;
    }
  console.log('  ' + name.padEnd(9) + String(n).padStart(6) + 'px drawn   ' +
    (solid/n*100).toFixed(0).padStart(3) + '% solid   ' +
    (soft/n*100).toFixed(0).padStart(3) + '% faint');
});
