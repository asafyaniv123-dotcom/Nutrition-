// One sheet to check a pair against Asaf's pictures BEFORE he sees it (6 Nov: "find the method in which you
// notice everything"). Every lesson so far was a detail seen only once it was put next to something else -
// his picture, the other frame, the same spot zoomed. So the sheet puts each of those next to each other:
//   row 1  his start | our start, LARGE                          (is it the same pose - every joint, the depth)
//   row 2  his end   | our end,   LARGE
//   row 3  our start + end overlaid | what changed between them (what must stay still, stays still)
//   row 4+ zooms, same spot in both our frames, per box given     (head, hands and grip, weight size, feet)
// Rows 1-2 are large because at thumbnail size half a push-up passed for a whole one (x19, 6 Nov).
// node tools/sheets/check-sheet.mjs <his-start> <our-start> <his-end> <our-end> <out.png> [x,y,size ...]
//   each x,y,size is a square on the 1024 frame, cropped from BOTH our frames side by side
import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const [HS, OS, HE, OE, OUT, ...boxes] = process.argv.slice(2);
if (!OUT) { console.log('usage: check-sheet.mjs <his-start> <our-start> <his-end> <our-end> <out.png> [x,y,size ...]'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const W = 600, n = boxes.length, zs = boxes.map((_, i) => `[sz${i}]`).join(''), ze = boxes.map((_, i) => `[ez${i}]`).join('');
let g = `[0:v]scale=${W}:${W}[hs];[2:v]scale=${W}:${W}[he];`;
g += `[1:v]scale=1024:1024,split=${3 + n}[s0][s1][s2]${zs};[3:v]scale=1024:1024,split=${3 + n}[e0][e1][e2]${ze};`;
g += `[s0]scale=${W}:${W}[sb];[e0]scale=${W}:${W}[eb];[hs][sb]hstack[r1];[he][eb]hstack[r2];`;
g += `[s1][e1]blend=all_mode=average,scale=${W}:${W}[ov];[s2][e2]blend=all_mode=difference,eq=contrast=3,scale=${W}:${W}[df];[ov][df]hstack[r3];`;
const rows = ['[r1]', '[r2]', '[r3]'];
boxes.forEach((b, i) => { const [x, y, s] = b.split(',').map(Number);
  g += `[sz${i}]crop=${s}:${s}:${x}:${y},scale=${W}:${W}[zs${i}];[ez${i}]crop=${s}:${s}:${x}:${y},scale=${W}:${W}[ze${i}];[zs${i}][ze${i}]hstack[z${i}];`;
  rows.push(`[z${i}]`); });
g += `${rows.join('')}vstack=${rows.length}`;
execFileSync(FF, ['-v', 'error', '-y', '-i', HS, '-i', OS, '-i', HE, '-i', OE, '-filter_complex', g, OUT]);
console.log('wrote', OUT);
