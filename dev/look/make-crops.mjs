// Cut the model sheet's close-ups as real images.
//
// They were CSS: a 300% image shifted by calc(50% - 34% * 3) inside a small
// window. Two things were wrong and both showed on his phone - the window is
// 264x112 while the source is square, so the image was stretched, and the
// offsets framed a sliver of one eye instead of the pair. Cropping to a file
// removes the arithmetic entirely: what is in the picture is what was chosen.
import { decode } from './png-pixel.mjs';
import { writeRGBA } from './png-write.mjs';

const SRC = 'C:/Projects/Nutrition-/character/sun-source.png';
const OUT = 'C:/Projects/Nutrition-/dev/look/sun-gen/';
const im = decode(SRC);

/* name, centre x, centre y, width, height - all in the source's 1024 frame.
   Every centre is a MEASURED feature, not a guess at one. */
const CROPS = [
  ['crop-eyes',  502, 499, 460, 230],   // the eye pair's own centre, 501.5 / 499
  ['crop-rim',   666, 672, 460, 230],   // the lower-right edge, where the rim is
  ['crop-beads', 512, 200, 460, 230],   // three rings, top
  ['crop-gap',   512, 742, 460, 230],   // body edge, the gap, the first beads
];

CROPS.forEach(function(c){
  const [name, cx, cy, w, h] = c;
  const buf = Buffer.alloc(w*h*4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++){
      const p = im.at(cx - (w>>1) + x, cy - (h>>1) + y), i = (y*w + x)*4;
      buf[i]=p[0]; buf[i+1]=p[1]; buf[i+2]=p[2]; buf[i+3]=p[3];
    }
  const bytes = writeRGBA(OUT + name + '.png', w, h, buf);
  console.log('wrote ' + (name+'.png').padEnd(16) + w + 'x' + h + '  ' +
    (bytes/1024).toFixed(0) + 'KB');
});

/* say what actually landed in each, so a mis-framed crop cannot ship quietly */
console.log('\nwhat is in each crop (share of it that is opaque):');
CROPS.forEach(function(c){
  const L = decode(OUT + c[0] + '.png');
  let on = 0, dark = 0, n = 0;
  for (let y = 0; y < L.h; y++)
    for (let x = 0; x < L.w; x++){
      const p = L.at(x,y); n++;
      if (p[3] > 200) on++;
      if (p[3] > 200 && 0.2126*p[0]+0.7152*p[1]+0.0722*p[2] < 60) dark++;
    }
  console.log('  ' + c[0].padEnd(12) + (on/n*100).toFixed(0).padStart(3) + '% opaque   ' +
    (dark/n*100).toFixed(1).padStart(5) + '% eye-dark');
});
