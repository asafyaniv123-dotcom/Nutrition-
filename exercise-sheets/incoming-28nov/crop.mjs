// node exercise-sheets/incoming-28nov/crop.mjs - crops Asaf's 28 Nov reference screenshots (Instagram) to the figure and the equipment, 0 credits.
//   Phone screenshots are 1170x2532 and were read at 924 px wide, so every box below is in REAL pixels (x1.266). Text labels that cross the
//   figure are NOT painted over (x243: cleaning a label erased a shoulder) - "text, watermark, logo" goes into AVOID instead.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const FF = process.env.TEMP + '/fftool/node_modules/ffmpeg-static/ffmpeg.exe';
const U = 'C:/Users/asafy/.claude/uploads/6d423cbd-ef1c-5ea7-88dc-5a0082bcbfc0/';
const OUT = 'exercise-sheets/incoming-28nov/';
const J = [
  // [folder, name, source, crop w:h:x:y]
  ['pike-ball', 'ref-start', '9499daf9-image.png', '700:560:177:1013'],   // IMG_5499 plank on the ball
  ['pike-ball', 'ref-end', '7b2727e7-image.png', '700:560:177:1013'],     // IMG_5498 full pike
  ['curtsy-step-down', 'ref-start', '3ebb351d-image.png', '820:1440:175:395'], // IMG_5505 standing on the box
  ['curtsy-step-down', 'ref-end', 'f85aa69b-image.png', '820:1440:175:395'],   // IMG_5504 lowered, leg crossed behind
  ['sl-abducted-rdl', 'ref-start', '1be14fba-image.png', '820:1090:177:709'], // IMG_5501 standing
  ['sl-abducted-rdl', 'ref-end', '98848be9-image.png', '820:1090:177:709'],   // IMG_5502 hinged
  ['sl-bridge-band', 'ref-start', 'c2de21be-image.png', '820:560:175:709'],   // IMG_5506 seat down
  ['sl-bridge-band', 'ref-end', '4fac9c5d-image.png', '820:560:175:709'],     // IMG_5507 seat up
  ['bear-hover', 'ref-start', '73682afb-image.jpg', '700:330:0:170'],         // IMG_5496 hold
  ['wall-ball-iso', 'ref-start', '1db28330-image.png', '820:1180:175:418'],   // IMG_5503 hold
  ['airplane', 'ref-end', 'b40e6c6d-image.jpg', '1050:640:100:40'],          // IMG_5494 top only - start frame missing
  ['wedge-split-squat', 'ref-end', '11bf7051-image.jpg', '880:1753:150:0'],   // IMG_5497 bottom only - start frame missing
];
for (const [dir, name, src, crop] of J) {
  fs.mkdirSync(OUT + dir, { recursive: true });
  execFileSync(FF, ['-v', 'error', '-y', '-i', U + src, '-vf', 'crop=' + crop, OUT + dir + '/' + name + '.png']);
  console.log(dir + '/' + name + '.png', crop);
}
