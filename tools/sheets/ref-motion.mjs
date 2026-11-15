// node tools/sheets/ref-motion.mjs <id> - writes exercise-sheets/<id>/ref-motion.png: the reference's START crop on the left half and its END
//   crop on the right half of one 2048x1024 white sheet, both at the same scale and the same place in their halves. This is the reference
//   that frame 2 is generated from (Asaf, 15 Nov, after x178 and x170).
//   Why: frame 2 used to get the END crop alone, as the third and smallest of three pictures (frame 1 at 2048, the style anchor, then a
//   ~450x600 line drawing). The end pose then had to be guessed onto frame 1's geometry, and the model filled the gap itself - x178 slid
//   the whole legs or the feet instead of turning the ankle, x170 brought the knees in toward the camera and redrew the pads. With both
//   halves side by side the CHANGE is visible as a change: what differs between the halves is the motion, what is equal is frozen.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
const [ID] = process.argv.slice(2);
if (!ID) { console.log('usage: ref-motion.mjs <id>'); process.exit(2); }
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const d = path.join(here, '..', '..', 'exercise-sheets', ID);
const S = path.join(d, 'ref-start.png'), E = path.join(d, 'ref-end.png'), OUT = path.join(d, 'ref-motion.png');
for (const f of [S, E]) if (!fs.existsSync(f)) { console.log('missing', f); process.exit(1); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
// each crop fits a 960 box inside its 1024 half, centred, on white - same filter for both, so the same scale
const half = 'scale=960:960:force_original_aspect_ratio=decrease:flags=lanczos,pad=1024:1024:(ow-iw)/2:(oh-ih)/2:white';
execFileSync(FF, ['-v', 'error', '-y', '-i', S, '-i', E, '-filter_complex', `[0]${half}[a];[1]${half}[b];[a][b]hstack,format=rgb24`, '-frames:v', '1', OUT]);
console.log('ref-motion:', OUT);
