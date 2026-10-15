// Cut the six expressions out of the sheet and scale them onto our character's
// own geometry, so they can be swapped with no jump.
//
// WHY CUT RATHER THAN USE THE CELLS AS THEY ARE: the six cells are internally
// consistent - the body measures r=128 in ALL SIX, with its gap at 134 - but
// their rings are not ours and their framing drifts about 20px across the
// sheet. Taking only the sphere and dropping it onto our existing ring layers
// means the rings never change at all, so the only thing that can move between
// expressions is the face. Which is the point.
//
// THE SCALE IS MEASURED, NOT CHOSEN. Our body layer is 512px cut from sun-30 at
// 1024, where the sphere's radius was 222 - so 111 at our size. The sheet's
// sphere is 128. 111/128 = 0.867.
//
// Each cell's own centroid is the anchor, because the characters are very
// slightly bunched toward the middle of the sheet: measured centroids run
// 181.3, 171.3, 161.3 across the columns, a clean 10px drift that is framing
// and not the character moving.
import { decode } from './png-pixel.mjs';
import { writeRGBA } from './png-write.mjs';
import fs from 'node:fs';

const SHEET = 'C:/Projects/Nutrition-/dev/look/sun-gen/sun-33-faces.png';
const OUT   = 'C:/Projects/Nutrition-/dev/assets/';
const OUTSIZE   = 512;
const OUR_R     = 111;     // our sphere's radius at 512
const SHEET_R   = 128;     // the sheet's sphere radius, measured in every cell
const CUT       = 133;     // just inside the gap at 134
const FEATHER   = 5;

const NAMES = ['calm','closed','thinking','happy','surprised','content'];
const CENT  = [[181.3,176.7],[171.3,176.8],[161.3,177.0],
               [180.6,170.3],[170.8,170.8],[160.8,170.5]];

const im = decode(SHEET);
const CW = im.w/3, CH = im.h/2;
const SC = SHEET_R / OUR_R;        // sheet px per output px

NAMES.forEach(function(name, i){
  const col = i % 3, row = (i / 3) | 0;
  const px = col*CW + CENT[i][0], py = row*CH + CENT[i][1];
  const buf = Buffer.alloc(OUTSIZE*OUTSIZE*4);

  for (let oy = 0; oy < OUTSIZE; oy++)
    for (let ox = 0; ox < OUTSIZE; ox++){
      const dx = (ox - OUTSIZE/2) * SC, dy = (oy - OUTSIZE/2) * SC;
      const d = Math.hypot(dx, dy);
      if (d > CUT + FEATHER) continue;
      // box-average the source square this output pixel covers
      let r=0,g=0,b=0,a=0,n=0;
      const X0 = Math.floor(px + dx - SC/2), Y0 = Math.floor(py + dy - SC/2);
      for (let sy = Y0; sy < Y0 + Math.max(1, Math.round(SC)); sy++)
        for (let sx = X0; sx < X0 + Math.max(1, Math.round(SC)); sx++){
          if (sx < 0 || sy < 0 || sx >= im.w || sy >= im.h) continue;
          const q = im.at(sx, sy);
          r += q[0]*q[3]; g += q[1]*q[3]; b += q[2]*q[3]; a += q[3]; n++;
        }
      if (!n) continue;
      const t = Math.min(1, Math.max(0, (d - (CUT - FEATHER)) / (FEATHER*2)));
      const o = (oy*OUTSIZE + ox)*4;
      buf[o]   = a ? Math.round(r/a) : 0;
      buf[o+1] = a ? Math.round(g/a) : 0;
      buf[o+2] = a ? Math.round(b/a) : 0;
      buf[o+3] = Math.round((a/n) * (1 - t));
    }

  const bytes = writeRGBA(OUT + 'sun-f-' + name + '.png', OUTSIZE, OUTSIZE, buf);
  console.log('wrote sun-f-' + (name + '.png').padEnd(16) + (bytes/1024).toFixed(0).padStart(4) + 'KB');
});

/* the calm one becomes the default body, so every page that already draws
   sun-body.png keeps working and simply gains the new face */
fs.copyFileSync(OUT + 'sun-f-calm.png', OUT + 'sun-body.png');
console.log('copied sun-f-calm.png -> sun-body.png');

/* prove the six really are swappable: the sphere must be the same size and in
   the same place in all of them, or a swap will jump */
console.log('\nsphere radius and centre in each written face:');
NAMES.forEach(function(name){
  const L = decode(OUT + 'sun-f-' + name + '.png');
  let x0=1e9,x1=-1,y0=1e9,y1=-1;
  for (let y = 0; y < OUTSIZE; y++)
    for (let x = 0; x < OUTSIZE; x++)
      if (L.at(x,y)[3] > 240){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
  console.log('  ' + name.padEnd(10) + ' box ' + (x1-x0+1) + 'x' + (y1-y0+1) +
    '  centre (' + (((x0+x1)/2)|0) + ',' + (((y0+y1)/2)|0) + ')');
});
