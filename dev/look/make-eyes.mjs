// Draw the expressions onto the FULL-RESOLUTION render, instead of cutting
// faces out of a sheet.
//
// WHY THIS REPLACES make-faces.mjs. I proposed cutting only the eyes and
// compositing them onto the body we already had, then when it came to it I cut
// the whole SPHERE because that was easier. All three things he spotted follow
// from that one shortcut, and two of them measure:
//
//   EYES TWICE AS TALL   the render's eye pair is 259x170; the sheet-derived
//                        one is 338x338 at the same scale. 1.31x wider and
//                        1.99x taller.
//   HALF THE DETAIL      six characters share one 1024x688 sheet, so each
//                        sphere is ~256px across against the render's ~476.
//   PLASTICINE EYES      the sheet draws a closed eye as a thick 3D-shaded
//                        sausage, because it is rendering an object rather
//                        than squashing a shape.
//
// None of that is a limit of the character. It is a limit of taking the face
// from a small cell in a shared image.
//
// So: keep the render's own sphere at 1024, erase the eyes by reconstructing
// the gradient across them, and draw each expression as shapes. The eye
// geometry is MEASURED FROM THE RENDER, not invented - 83 wide, 169 tall,
// centres at x 512+-98 and y 499, colour rgb(47,24,10).
import { decode } from './png-pixel.mjs';
import { writeRGBA } from './png-write.mjs';

const SRC = 'C:/Projects/Nutrition-/dev/look/sun-gen/sun-30-vol-balanced.png';
const OUT = 'C:/Projects/Nutrition-/dev/assets/';
const OUTSIZE = 512;
const CUT = 245, FEATHER = 9;     // the same cut the ring layers were made with

/* measured from the render */
const EYE = [47, 24, 10];
/* The render's eye centres are at x 414 and 589, y 499. So the PAIR's centre is
   501.5 - ten pixels left of the image's - and the half-separation is 87.5.
   My first pass used 98, which is the left eye's offset from the image centre,
   and the result was a pair 279px wide against the render's 258. Reading one
   number as another is how an 8% error gets in without anything looking wrong. */
const EXC = -10.5;                // the pair's centre, from the image's
const EX  = 87.5;                 // half the distance between the two eyes
const EY  = -13;
const EW = 83, EH = 169;          // one eye, full size
/* The region rebuilt around each eye. The first pass used a half-width of 118,
   which spans 236px of the sphere - far more than its shading stays linear
   across - and interpolating edge to edge flattened it into two visible
   rectangles. 52 spans 104px, barely wider than the 83px eye, and the two
   boxes still leave 71px of untouched sphere between them. */
const BOX = 68, BOXY = 136;

const im = decode(SRC);
const W = im.w, CXI = W/2, CYI = W/2;

/* ── 1. erase the eyes ──
   The sphere's colour varies smoothly, and an eye is only 83px wide, so each
   erased row is rebuilt by interpolating between the colours just outside the
   region at the same y. Across 83px of a gradient that is indistinguishable
   from the real surface. */
const base = Buffer.alloc(W*W*4);
for (let y = 0; y < W; y++)
  for (let x = 0; x < W; x++){
    const p = im.at(x, y), i = (y*W + x)*4;
    base[i]=p[0]; base[i+1]=p[1]; base[i+2]=p[2]; base[i+3]=p[3];
  }
[-EX, EX].forEach(function(sx){
  const cx = CXI + EXC + sx, cy = CYI + EY;
  const x0 = Math.round(cx - BOX), x1 = Math.round(cx + BOX);
  const y0 = Math.round(cy - BOXY), y1 = Math.round(cy + BOXY);
  for (let y = y0; y <= y1; y++){
    const lo = im.at(x0 - 2, y), hi = im.at(x1 + 2, y);
    for (let x = x0; x <= x1; x++){
      const t = (x - x0) / (x1 - x0), i = (y*W + x)*4;
      /* The fade is measured from the EYE's own ellipse, not from the box.
         Deriving it from the box gave the repair only 53% strength exactly at
         the eye's edge - where it is needed most - and the original eye ghosted
         through as a pale oval. Full strength out to the eye plus 6px, then
         down to nothing by 1.55 times that. */
      const k = Math.hypot((x - cx)/(EW/2 + 6), (y - cy)/(EH/2 + 6));
      const w = k <= 1 ? 1 : Math.max(0, 1 - (k - 1)/0.55);
      if (w <= 0) continue;
      for (let c = 0; c < 4; c++){
        const rebuilt = lo[c]*(1-t) + hi[c]*t;
        base[i+c] = Math.round(base[i+c]*(1-w) + rebuilt*w);
      }
    }
  }
});

/* ── 2. the shapes, in eye-local coordinates ── */
function oval(rx, ry){ return function(x, y){
  return (x*x)/(rx*rx) + (y*y)/(ry*ry) <= 1 ? 1 : 0; }; }
function bar(w, h){ return function(x, y){
  const dx = Math.max(0, Math.abs(x) - (w/2 - h/2));
  return Math.hypot(dx, y) <= h/2 ? 1 : 0; }; }
/* a stroked circular arc: sag>0 arches UP, sag<0 arches DOWN */
function arc(halfW, sag, stroke){
  const R = (halfW*halfW + sag*sag) / (2*Math.abs(sag));
  const cy = (sag > 0 ? 1 : -1) * (R - Math.abs(sag));
  return function(x, y){
    const d = Math.hypot(x, y - cy);
    if (Math.abs(d - R) > stroke/2) return 0;
    return (sag > 0 ? y < cy : y > cy) ? 1 : 0;
  };
}

const FACES = {
  calm:      {shape: oval(EW/2, EH/2),            hi: 1},
  closed:    {shape: bar(EW, 15),                 hi: 0},
  thinking:  {shape: oval(EW/2, EH/2), dx: 15, dy: -26, hi: 1},
  happy:     {shape: arc(EW/2, 34, 26),           hi: 0},
  surprised: {shape: oval(EW/2*1.18, EH/2*1.04),  hi: 1.3},
  content:   {shape: arc(EW/2, -34, 26),          hi: 0},
};

/* ── 3. draw, downscale, write ── */
const SS = 3;                                  // supersample for a clean edge
Object.keys(FACES).forEach(function(name){
  const F = FACES[name];
  const big = Buffer.from(base);

  [-EX, EX].forEach(function(sx, side){
    const cx = CXI + EXC + sx + (F.dx || 0), cy = CYI + EY + (F.dy || 0);
    const x0 = Math.round(cx - BOX), x1 = Math.round(cx + BOX);
    const y0 = Math.round(cy - BOXY), y1 = Math.round(cy + BOXY);
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++){
        let cov = 0;
        for (let sy2 = 0; sy2 < SS; sy2++)
          for (let sx2 = 0; sx2 < SS; sx2++)
            cov += F.shape(x + (sx2+0.5)/SS - 0.5 - cx, y + (sy2+0.5)/SS - 0.5 - cy);
        cov /= SS*SS;
        if (!cov) continue;
        const i = (y*W + x)*4;
        for (let c = 0; c < 3; c++)
          big[i+c] = Math.round(big[i+c]*(1-cov) + EYE[c]*cov);
      }
    /* the catchlights, on the shapes that are an open eye */
    if (F.hi) [[-14.6, -50.8, 13.5*F.hi, 1], [14.6, 41.6, 6*F.hi, .72]].forEach(function(h){
      const hx = cx + h[0]*(side ? -1 : 1), hy = cy + h[1], r = h[2];
      for (let y = Math.round(hy-r-1); y <= hy+r+1; y++)
        for (let x = Math.round(hx-r-1); x <= hx+r+1; x++){
          let cov = 0;
          for (let b = 0; b < SS*SS; b++){
            const ox = x + ((b%SS)+0.5)/SS - 0.5, oy = y + ((b/SS|0)+0.5)/SS - 0.5;
            if (Math.hypot(ox-hx, oy-hy) <= r) cov++;
          }
          cov = cov/(SS*SS) * h[3];
          if (!cov) continue;
          const i = (y*W + x)*4;
          for (let c = 0; c < 3; c++) big[i+c] = Math.round(big[i+c]*(1-cov) + 255*cov);
        }
    });
  });

  /* downscale to 512 and cut at the same radius the ring layers used */
  const SC = W / OUTSIZE, out = Buffer.alloc(OUTSIZE*OUTSIZE*4);
  for (let oy = 0; oy < OUTSIZE; oy++)
    for (let ox = 0; ox < OUTSIZE; ox++){
      let r=0,g=0,b=0,a=0,n=0;
      for (let sy = oy*SC|0; sy < (oy+1)*SC; sy++)
        for (let sx = ox*SC|0; sx < (ox+1)*SC; sx++){
          const i = (sy*W + sx)*4, A = big[i+3];
          r += big[i]*A; g += big[i+1]*A; b += big[i+2]*A; a += A; n++;
        }
      const d = Math.hypot((ox+0.5)*SC - CXI, (oy+0.5)*SC - CYI);
      const t = Math.min(1, Math.max(0, (d - (CUT - FEATHER)) / (FEATHER*2)));
      const o = (oy*OUTSIZE + ox)*4;
      out[o]   = a ? Math.round(r/a) : 0;
      out[o+1] = a ? Math.round(g/a) : 0;
      out[o+2] = a ? Math.round(b/a) : 0;
      out[o+3] = Math.round((a/n) * (1-t));
    }
  const bytes = writeRGBA(OUT + 'sun-f-' + name + '.png', OUTSIZE, OUTSIZE, out);
  console.log('wrote sun-f-' + (name+'.png').padEnd(16) + (bytes/1024).toFixed(0).padStart(4) + 'KB');
});

/* the numbers he will check */
console.log('\neye pair, measured back out of each written file (512px frame):');
const L = ([r,g,b]) => 0.2126*r + 0.7152*g + 0.0722*b;
Object.keys(FACES).forEach(function(name){
  const f = decode(OUT + 'sun-f-' + name + '.png');
  let x0=1e9,x1=-1,y0=1e9,y1=-1;
  for (let y = OUTSIZE*0.3|0; y < OUTSIZE*0.7; y++)
    for (let x = OUTSIZE*0.3|0; x < OUTSIZE*0.7; x++){
      const p = f.at(x,y);
      if (p[3] > 200 && L(p) < 45){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
    }
  console.log('  ' + name.padEnd(10) + (x1-x0+1) + 'x' + (y1-y0+1) +
    '   (the render is 130x85 at this scale)');
});
