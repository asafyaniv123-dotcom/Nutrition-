// Draw Beem's expressions onto the full-resolution render.
//
// WHAT THE NINTENDO RESEARCH CHANGED HERE, and both changes are structural
// rather than cosmetic:
//
//   TWO-TONE EYES: TRIED, MEASURED, AND REJECTED. Kirby's eye is 'long dark
//   ovals featuring white glare and blue irises', and it does not transfer.
//   HIS body is pink and the iris is BLUE - a different hue family, so the
//   iris reads as a feature. OURS is orange, and any warm iris sits in the
//   same family as the body, so the lower half of the eye reads as the eye
//   going transparent rather than as a detail inside it. Two attempts:
//   rgb(122,62,18) at 44 above the eye, then rgb(94,34,12) at 17 above it and
//   a smaller region. Both faded. The eye stays one solid colour, and the
//   finding is kept here because 'we tried it and it does not work for a warm
//   character' is worth more than the idea it replaced.
//
//   SURPRISE: THE INVERSION WAS BUILT AND THEN REJECTED. Kirby's eyes 'shift
//   to white circles with small black pupils', and it worked as an inversion -
//   1030 dark pixels against 5408 pale, where calm is 5053 against 2872. Asaf
//   did not like it and preferred the bigger oval. He decides. The idea is
//   recorded here because 'the research said X and the eye still said no' is
//   worth keeping, and because the measurement stands even though the choice
//   went the other way.
//
// Everything else is the measured geometry of the render: each eye 83 x 169,
// centres at x 414 and 589 and y 499, colour rgb(47,24,10). The eye pair's
// centre is 501.5 - ten pixels left of the image's, which is a real asymmetry
// in the render and not a mistake to correct.
import { decode } from './png-pixel.mjs';
import { writeRGBA } from './png-write.mjs';

const SRC = 'C:/Projects/Nutrition-/character/sun-source.png';
const OUT = 'C:/Projects/Nutrition-/dev/assets/';
const OUTSIZE = 512;
const CUT = 245, FEATHER = 9;

const EYE   = [47, 24, 10];        // measured
const PALE  = [252, 243, 226];     // the surprised field
const EXC = -10.5, EX = 87.5, EY = -13;
const EW = 83, EH = 169;
const BOX = 68, BOXY = 136;

const im = decode(SRC);
const W = im.w, CXI = W/2, CYI = W/2;

/* ── 1. erase the eyes ──
   Feathered from the EYE's own ellipse rather than from the box: deriving it
   from the box left the repair at 53% strength exactly at the eye's edge and
   the original ghosted through as a pale oval. */
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
      const k = Math.hypot((x - cx)/(EW/2 + 6), (y - cy)/(EH/2 + 6));
      const w = k <= 1 ? 1 : Math.max(0, 1 - (k - 1)/0.55);
      if (w <= 0) continue;
      for (let c = 0; c < 4; c++)
        base[i+c] = Math.round(base[i+c]*(1-w) + (lo[c]*(1-t) + hi[c]*t)*w);
    }
  }
});

/* ── 2. shapes, in eye-local coordinates ── */
const oval = (rx, ry) => (x, y) => (x*x)/(rx*rx) + (y*y)/(ry*ry) <= 1 ? 1 : 0;
const ovalAt = (rx, ry, oy) => (x, y) => oval(rx, ry)(x, y - oy);
const ring = (rx, ry, w) => (x, y) => {
  const o = (x*x)/(rx*rx) + (y*y)/(ry*ry);
  const i = (x*x)/((rx-w)*(rx-w)) + (y*y)/((ry-w)*(ry-w));
  return o <= 1 && i > 1 ? 1 : 0;
};
const bar = (w, h) => (x, y) =>
  Math.hypot(Math.max(0, Math.abs(x) - (w/2 - h/2)), y) <= h/2 ? 1 : 0;
function arc(halfW, sag, stroke){
  const R = (halfW*halfW + sag*sag) / (2*Math.abs(sag));
  const cy = (sag > 0 ? 1 : -1) * (R - Math.abs(sag));
  return (x, y) => {
    if (Math.abs(Math.hypot(x, y - cy) - R) > stroke/2) return 0;
    return (sag > 0 ? y < cy : y > cy) ? 1 : 0;
  };
}
const AND = (a, b) => (x, y) => a(x, y) && b(x, y) ? 1 : 0;

const RX = EW/2, RY = EH/2;
/* each expression is a list of {s: shape, c: colour}, painted in order */
const FACES = {
  calm:      {hi:1, L:[{s:oval(RX,RY), c:EYE}]},
  closed:    {hi:0, L:[{s:bar(EW, 15), c:EYE}]},
  thinking:  {hi:1, dx:15, dy:-26, L:[{s:oval(RX,RY), c:EYE}]},
  happy:     {hi:0, L:[{s:arc(RX, 34, 26), c:EYE}]},
  /* THE INVERSION: a pale field, a thin dark rim, a small pupil. Not a bigger
     version of the calm eye - a different KIND of eye. */
  surprised: {hi:1.32, L:[{s:oval(RX*1.18, RY*1.04), c:EYE}]},
  content:   {hi:0, L:[{s:arc(RX, -34, 26), c:EYE}]},
};

/* ── 3. draw, downscale, write ── */
const SS = 3;
Object.keys(FACES).forEach(function(name){
  const F = FACES[name];
  const big = Buffer.from(base);

  [-EX, EX].forEach(function(sx, side){
    const cx = CXI + EXC + sx + (F.dx || 0), cy = CYI + EY + (F.dy || 0);
    const x0 = Math.round(cx - BOX), x1 = Math.round(cx + BOX);
    const y0 = Math.round(cy - BOXY), y1 = Math.round(cy + BOXY);
    F.L.forEach(function(layer){
      for (let y = y0; y <= y1; y++)
        for (let x = x0; x <= x1; x++){
          let cov = 0;
          for (let b = 0; b < SS*SS; b++)
            cov += layer.s(x + ((b%SS)+0.5)/SS - 0.5 - cx, y + ((b/SS|0)+0.5)/SS - 0.5 - cy);
          cov /= SS*SS;
          if (!cov) continue;
          const i = (y*W + x)*4;
          for (let c = 0; c < 3; c++)
            big[i+c] = Math.round(big[i+c]*(1-cov) + layer.c[c]*cov);
        }
    });
    if (F.hi) [[-14.6, -50.8, 13.5, 1], [14.6, 41.6, 6, .72]].forEach(function(h){
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
  const bytes = writeRGBA(OUT + 'beem-f-' + name + '.png', OUTSIZE, OUTSIZE, out);
  console.log('wrote beem-f-' + (name+'.png').padEnd(16) + (bytes/1024).toFixed(0).padStart(4) + 'KB');
});

/* the eyes must match the render's geometry, and surprised must be PALE where
   the others are dark - that is the whole point of the inversion */
console.log('\neye pair, read back out of each file (512px frame):');
const L = ([r,g,b]) => 0.2126*r + 0.7152*g + 0.0722*b;
Object.keys(FACES).forEach(function(name){
  const f = decode(OUT + 'beem-f-' + name + '.png');
  let x0=1e9,x1=-1,y0=1e9,y1=-1, dark=0, pale=0;
  for (let y = OUTSIZE*0.33|0; y < OUTSIZE*0.66; y++)
    for (let x = OUTSIZE*0.33|0; x < OUTSIZE*0.66; x++){
      const p = f.at(x,y); if (p[3] < 200) continue;
      if (L(p) < 70){ dark++; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
      if (L(p) > 225) pale++;
    }
  console.log('  ' + name.padEnd(10) + (x1>0 ? (x1-x0+1)+'x'+(y1-y0+1) : '  -  ').padStart(8) +
    '   dark ' + String(dark).padStart(5) + '   pale ' + String(pale).padStart(5));
});
console.log('  the render itself is 130x85 at this scale');

/* ── 4. the body with NO eyes ──
   The research conclusion that forced this: a cross-fade between two drawings
   shows BOTH at 50% in the middle, which is a ghost, not a transition. Real
   animation moves the SHAPE. Six PNGs cannot morph into each other - but a
   body with no eyes, plus eyes drawn as vectors on top, can morph continuously
   and for nothing. This file is that body. */
{
  const SC = W / OUTSIZE, out = Buffer.alloc(OUTSIZE*OUTSIZE*4);
  for (let oy = 0; oy < OUTSIZE; oy++)
    for (let ox = 0; ox < OUTSIZE; ox++){
      let r=0,g=0,b=0,a=0,n=0;
      for (let sy = oy*SC|0; sy < (oy+1)*SC; sy++)
        for (let sx = ox*SC|0; sx < (ox+1)*SC; sx++){
          const i = (sy*W + sx)*4, A = base[i+3];
          r += base[i]*A; g += base[i+1]*A; b += base[i+2]*A; a += A; n++;
        }
      const d = Math.hypot((ox+0.5)*SC - CXI, (oy+0.5)*SC - CYI);
      const t = Math.min(1, Math.max(0, (d - (CUT - FEATHER)) / (FEATHER*2)));
      const o = (oy*OUTSIZE + ox)*4;
      out[o]   = a ? Math.round(r/a) : 0;
      out[o+1] = a ? Math.round(g/a) : 0;
      out[o+2] = a ? Math.round(b/a) : 0;
      out[o+3] = Math.round((a/n) * (1-t));
    }
  const bytes = writeRGBA(OUT + 'beem-body.png', OUTSIZE, OUTSIZE, out);
  console.log('\nwrote beem-body.png   ' + (bytes/1024).toFixed(0) + 'KB   (no eyes)');
  /* it must have NO dark pixels where the eyes were */
  const f = decode(OUT + 'beem-body.png');
  let dark = 0;
  for (let y = OUTSIZE*0.33|0; y < OUTSIZE*0.66; y++)
    for (let x = OUTSIZE*0.33|0; x < OUTSIZE*0.66; x++){
      const p = f.at(x,y);
      if (p[3] > 200 && (0.2126*p[0]+0.7152*p[1]+0.0722*p[2]) < 70) dark++;
    }
  console.log('  dark pixels where the eyes were: ' + dark +
    (dark < 40 ? '   clean' : '   SOMETHING IS LEFT'));
}
