// node exercise-sheets/incoming-28nov/crop-knee.mjs - Asaf's knee-jump references (IMG_5509-5518, 28 Nov), 0 credits.
//   One box for all ten so the poses line up: the video area left of Instagram's side icons, above the caption (REAL px, x1.266).
//   The "0~50kg" / "10kg" captions and the header that crosses the airborne head are NOT painted over - they go into AVOID.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const FF = process.env.TEMP + '/fftool/node_modules/ffmpeg-static/ffmpeg.exe';
const U = 'C:/Users/asafy/.claude/uploads/6d423cbd-ef1c-5ea7-88dc-5a0082bcbfc0/';
const OUT = 'exercise-sheets/incoming-28nov/';
const BOX = '715:1361:177:323';
const J = [
  ['knee-jump-bw', 'p1-kneel', '2941b82a-image.png'],   // 5509 kneeling, sitting on the heels
  ['knee-jump-bw', 'p2-air', '31b5a6b7-image.png'],     // 5510 off the knees, in the air
  ['knee-jump-bw', 'p3-squat', '939ec0ff-image.png'],   // 5511 landed in a deep squat
  ['knee-jump-bw', 'p4-jump', '4fc3e497-image.png'],    // 5512 squat jump, top
  ['knee-jump-bw', 'p5-land', 'acce230e-image.png'],    // 5513 landed again
  ['knee-jump-bb', 'p1-kneel', '5c26ba4c-image.png'],   // 5514 kneeling, bar on the back
  ['knee-jump-bb', 'p2-air', 'fbd1ea52-image.png'],     // 5515
  ['knee-jump-bb', 'p3-squat', 'a3d4a7ae-image.png'],   // 5516
  ['knee-jump-bb', 'p4-jump', '6de01c16-image.png'],    // 5517
  ['knee-jump-bb', 'p5-land', '394ebdcf-image.png'],    // 5518
];
for (const [dir, name, src] of J) {
  fs.mkdirSync(OUT + dir, { recursive: true });
  execFileSync(FF, ['-v', 'error', '-y', '-i', U + src, '-vf', 'crop=' + BOX, OUT + dir + '/' + name + '.png']);
}
for (const d of ['knee-jump-bw', 'knee-jump-bb']) {
  fs.copyFileSync(OUT + d + '/p1-kneel.png', OUT + d + '/ref-start.png');
  fs.copyFileSync(OUT + d + '/p3-squat.png', OUT + d + '/ref-end.png');
}
// sheet: one row per version, five poses, numbered
const FONT = 'C\:/Windows/Fonts/arialbd.ttf';
const rows = [];
for (const [d, lab] of [['knee-jump-bw', 'x352 NEW  Knee Jump to Squat Jump - bodyweight (5509-5513)'], ['knee-jump-bb', 'x353 NEW  Knee Jump to Squat Jump - barbell (5514-5518)']]) {
  const ins = [], f = [];
  ['p1-kneel', 'p2-air', 'p3-squat', 'p4-jump', 'p5-land'].forEach((p, i) => {
    ins.push('-i', OUT + d + '/' + p + '.png');
    const tag = ['1 START', '2 air', '3 END squat', '4 jump top', '5 land'][i];
    f.push(`[${i}]scale=300:-1,drawtext=fontfile='${FONT}':text='${tag}':fontcolor=0xffe08a:fontsize=26:box=1:boxcolor=0x000000a0:x=8:y=h-40[c${i}]`);
  });
  const out = process.env.TEMP + `/xb/kj-${d}.png`;
  execFileSync(FF, ['-v', 'error', '-y', ...ins, '-filter_complex', f.join(';') + `;[c0][c1][c2][c3][c4]hstack=5,pad=iw:ih+64:0:64:0x1a1410,drawtext=fontfile='${FONT}':text='${lab}':fontcolor=0xf3e6d6:fontsize=32:x=16:y=16`, out]);
  rows.push(out);
}
execFileSync(FF, ['-v', 'error', '-y', '-i', rows[0], '-i', rows[1], '-filter_complex', 'vstack=2', '-q:v', '3', OUT + 'mapping-knee.jpg']);
console.log(OUT + 'mapping-knee.jpg');
