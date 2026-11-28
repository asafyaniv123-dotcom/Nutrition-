// node exercise-sheets/incoming-28nov/sheet.mjs - one mapping sheet of the 28 Nov references: a row per exercise, its label, START | END crops.
import { execFileSync } from 'node:child_process';
const FF = process.env.TEMP + '/fftool/node_modules/ffmpeg-static/ffmpeg.exe';
const D = 'exercise-sheets/incoming-28nov/';
const FONT = 'C\\:/Windows/Fonts/arialbd.ttf';
const ROWS = [
  ['1  x345 NEW  Stability Ball Pike  (5499 > 5498)', 'pike-ball/ref-start', 'pike-ball/ref-end'],
  ['2  x346 NEW  Curtsy Step Down  (5505 > 5504)', 'curtsy-step-down/ref-start', 'curtsy-step-down/ref-end'],
  ['3  x347 NEW  SL Abducted Contralateral DB RDL  (5501 > 5502)', 'sl-abducted-rdl/ref-start', 'sl-abducted-rdl/ref-end'],
  ['4  x161 EXISTS, no demo  Single Leg Hip Thrust  (5506 > 5507)', 'sl-bridge-band/ref-start', 'sl-bridge-band/ref-end'],
  ['5  x348 NEW  All Fours to Single-Leg Airplane  (5496 > 5494)', 'airplane/ref-start', 'airplane/ref-end'],
  ['6  x349 NEW  Wall Ball ISO Hip Flexion - hold  (5503)', 'wall-ball-iso/ref-start', null],
  ['7  x350 NEW  Wedge Split Squat ISO - hold  (5497)', 'wedge-split-squat/ref-start', null],
];
const H = 420, W = 1500, LAB = 70;
const files = [];
for (const [i, [label, a, b]] of ROWS.entries()) {
  const out = process.env.TEMP + `/xb/row${i}.png`;
  const ins = [], parts = []; let n = 0;
  for (const f of [a, b]) {
    if (f) { ins.push('-i', D + f + '.png'); parts.push(`[${n++}]scale=w=${W / 2}:h=${H}:force_original_aspect_ratio=decrease,pad=${W / 2}:${H}:(ow-iw)/2:0:0x1a1410[p${parts.length}]`); }
    else { ins.push('-f', 'lavfi', '-i', `color=c=0x2a221c:s=${W / 2}x${H}`); parts.push(`[${n++}]drawtext=fontfile='${FONT}':text='${/hold/.test(label) ? "hold - one pose, no second frame" : "waiting for this frame"}':fontcolor=0xc9b49a:fontsize=34:x=(w-tw)/2:y=(h-th)/2[p${parts.length}]`); }
  }
  const fc = parts.join(';') + `;[p0][p1]hstack,pad=${W}:${H + LAB}:0:${LAB}:0x1a1410,drawtext=fontfile='${FONT}':text='${label.replace(/'/g, '')}':fontcolor=0xf3e6d6:fontsize=36:x=20:y=18`;
  execFileSync(FF, ['-v', 'error', '-y', ...ins, '-filter_complex', fc, '-frames:v', '1', out]);
  files.push(out);
}
const ins = files.flatMap((f) => ['-i', f]);
execFileSync(FF, ['-v', 'error', '-y', ...ins, '-filter_complex', files.map((_, i) => `[${i}]`).join('') + `vstack=${files.length},scale=1100:-1`, '-q:v', '4', D + 'mapping.jpg']);
console.log(D + 'mapping.jpg');
