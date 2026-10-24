/* "The sun feels too small" (Asaf, 24 Oct): three bigger suns, from the
   previous largest up to one nearly the height of the lowercase letters. A
   sun this size cannot sit where the dot was without touching the stem, so
   it rises until its lowest ray clears the top of the ı by a hair, and the
   canvas grows to hold it. */
import fs from 'fs';
const F = 'review/olimei-wordmark/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR', a.slice(0, 60)); process.exit(1); } s = s.replace(a, b); };
rep(`var SIZES=[['א׳ · שמש קטנה, בגודל נקודה גדולה',.13],['ב׳ · שמש בינונית',.18],['ג׳ · שמש גדולה',.24]];`,
    `var SIZES=[['א׳ · שמש גדולה',.24],['ב׳ · שמש גדולה יותר',.30],['ג׳ · שמש הכי גדולה',.36]];`);
/* the canvas is taller, and the sun clears the stem rather than a fixed rise */
rep(`cv.width=w+pad*2;cv.height=Math.ceil(px*1.55);`, `cv.width=w+pad*2;cv.height=Math.ceil(px*1.75);`);
rep(`var base=Math.round(px*1.22);`, `var base=Math.round(px*1.42);`);
rep(`  cy-=Math.max(0,R-px*.11)*.55;   /* a bigger sun rises a little, so its rays clear the stem */`,
    `  /* the top of the ı's stem is the x-height: the sun's lowest ray clears it */
  var xh=px*.5;var low=cy+R;if(low>base-xh-px*.04)cy-=low-(base-xh-px*.04);`);
fs.writeFileSync(F, s);
console.log('ok');
