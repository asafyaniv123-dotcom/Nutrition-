// Turn the chosen render into the dev app's icon.
//
// TWO THINGS THAT ARE NOT OBVIOUS AND BOTH MATTER:
//
//   iOS BLACKENS ALPHA. An apple-touch-icon with a transparent background does
//   not come out transparent on a home screen, it comes out BLACK. So the icon
//   is flattened onto the app's own ground, #e9e7e3, and written without an
//   alpha channel at all.
//
//   ONLY dev CHANGES. dev/index.html and dev/manifest.json both point at
//   'assets/logo.png', which from /dev/ resolves to dev/assets/logo.png. The
//   root manifest points at stable/assets/logo.png. Writing here cannot reach
//   the app on her phone.
import { decode } from './png-pixel.mjs';
import { writeRGB, flattenAndScale } from './png-write.mjs';

const SRC = 'C:/Projects/Nutrition-/dev/look/sun-gen/sun-30-vol-balanced.png';
const OUT = 'C:/Projects/Nutrition-/dev/assets/logo.png';
const GROUND = [0xe9, 0xe7, 0xe3];
const SIZE = 512, PAD = 0.06;

const im = decode(SRC);
console.log('source ' + im.w + 'x' + im.h + ', ' + (im.ch === 4 ? 'RGBA' : 'RGB'));
const rgb = flattenAndScale(im, SIZE, GROUND, PAD);
const bytes = writeRGB(OUT, SIZE, SIZE, rgb);
console.log('wrote dev/assets/logo.png  ' + SIZE + 'x' + SIZE + '  ' +
  (bytes/1024).toFixed(0) + 'KB');

// prove the two things the comment claims
const back = decode(OUT);
const corner = back.at(0, 0), mid = back.at(SIZE>>1, SIZE>>1);
console.log('  corner rgb(' + corner.slice(0,3).join(',') + ') alpha ' + corner[3] +
  (corner[3] === 255 ? '  OPAQUE - iOS safe' : '  STILL TRANSPARENT - iOS will blacken it'));
console.log('  centre rgb(' + mid.slice(0,3).join(',') + ')  (should be the sun, not the ground)');
