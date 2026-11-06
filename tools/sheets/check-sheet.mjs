// One sheet to check a pair against Asaf's pictures BEFORE he sees it (6 Nov: "find the method in which you
// notice everything"). Every lesson so far was a detail seen only once it was put next to something else -
// his picture, the other frame, the same spot zoomed. So the sheet puts each of those next to each other:
//   row 1  his start | our start | his end | our end            (pose, angle, equipment, size, framing)
//   row 2  our start + end overlaid | what changed between them (what must stay still, stays still)
//   row 3  zooms, same spot in both frames, for each box given  (head, hands and grip, weight size, feet)
// node tools/sheets/check-sheet.mjs <his-start> <our-start> <his-end> <our-end> <out.png> [x,y,size ...]
//   each x,y,size is a square on the 1024 frame, cropped from BOTH our frames side by side
import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const [HS, OS, HE, OE, OUT, ...boxes] = process.argv.slice(2);
if (!OUT) { console.log('usage: check-sheet.mjs <his-start> <our-start> <his-end> <our-end> <out.png> [x,y,size ...]'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const W = 300, n = boxes.length;
let g = `[0:v]scale=${W}:${W}[hs];[1:v]scale=1024:1024,split=${3 + n}[os0][os1][os2]` + boxes.map((_, i) => `[osz${i}]`).join('') + ';';
g += `[3:v]scale=1024:1024,split=${3 + n}[oe0][oe1][oe2]` + boxes.map((_, i) => `[oez${i}]`).join('') + ';';
g += `[2:v]scale=${W}:${W}[he];[os0]scale=${W}:${W}[a];[oe0]scale=${W}:${W}[b];[hs][a][he][b]hstack=4[r1];`;
g += `[os1][oe1]blend=all_mode=average,scale=${W * 2}:${W * 2}[ov];[os2][oe2]blend=all_mode=difference,eq=contrast=3,scale=${W * 2}:${W * 2}[df];[ov][df]hstack[r2];`;
const rows = ['[r1]', '[r2]'];
if (n) {
  boxes.forEach((b, i) => { const [x, y, s] = b.split(',').map(Number);
    g += `[osz${i}]crop=${s}:${s}:${x}:${y},scale=${W * 2}:${W * 2}[zs${i}];[oez${i}]crop=${s}:${s}:${x}:${y},scale=${W * 2}:${W * 2}[ze${i}];[zs${i}][ze${i}]hstack[z${i}];`;
    rows.push(`[z${i}]`); });
}
g += `${rows.join('')}vstack=${rows.length}`;
execFileSync(FF, ['-v', 'error', '-y', '-i', HS, '-i', OS, '-i', HE, '-i', OE, '-filter_complex', g, OUT]);
console.log('wrote', OUT);
