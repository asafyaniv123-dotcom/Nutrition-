/* The line under the stopwatch face read "14.00:00·4 הקפה": its digit boxes
   were flex items of a right-to-left row, so they were laid out backwards and
   spaced by the row's gap. The digits go in one left-to-right group. */
import fs from 'fs';
const f = 'dev/index.html';
let s = fs.readFileSync(f, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n, a.slice(0, 60)); process.exit(1); } s = s.replace(a, () => b); };
rep(`    sub.innerHTML=(_ckSw.run||laps.length)?esc(_t('הקפה {n}',{n:laps.length+1}))+' &middot; '+ckDigits(ckSwText(cur)):'';`,
    `    sub.innerHTML=(_ckSw.run||laps.length)?'<span>'+esc(_t('הקפה {n}',{n:laps.length+1}))+'</span><span>&middot;</span><span class="ck-num">'+ckDigits(ckSwText(cur))+'</span>':'';`);
rep(`.ck-sub .ck-d{width:.6em}`, `.ck-sub .ck-d{width:.6em}
.ck-num{display:inline-flex;direction:ltr}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(f, s);
console.log('ok');
