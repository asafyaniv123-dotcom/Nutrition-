// The check every demo clip passes before it is accepted (Asaf, 5 Nov: "this must not happen again").
// node tools/r3d/check-clip.mjs <clip.mp4> <start.png> <end.png> <out.png>
//
// Writes one sheet: row 1 is the START IMAGE beside the clip's first frame, then the clip's
// last frame beside the END IMAGE; rows 2-3 are ten evenly spaced FULL frames. Two clips
// passed a review here and were wrong: the calf raise squatted - hidden because its frames
// had been cropped to the feet - and the one-arm row grew a huge supporting arm, missed
// because only the path of the dumbbell was watched. So the frames are never cropped, and
// reading the sheet means four questions, in this order:
//   1. Is frame 0 the start image and the last frame the end image? (the model can ignore them)
//   2. Are the proportions the start image's in every frame - no limb thicker, longer, doubled?
//   3. Does the part the sheet calls still stay still (sheet.json "still")?
//   4. One repetition, over the whole clip, through the full range?
import { execFileSync, spawnSync } from 'child_process'; import fs from 'fs'; import path from 'path'; import os from 'os';
const [clip, start, end, out] = process.argv.slice(2);
if (!out) { console.log('usage: check-clip.mjs <clip.mp4> <start.png> <end.png> <out.png>'); process.exit(2); }
/* ffmpeg from $FFMPEG, else an ffmpeg-static install under the temp folder */
const FF = process.env.FFMPEG || [path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe'), 'ffmpeg'].find((p) => p === 'ffmpeg' || fs.existsSync(p));
const ff = (args) => execFileSync(FF, ['-v', 'error', '-y', ...args]);
/* the frame count is in ffmpeg's progress line, on stderr */
const frames = +(spawnSync(FF, ['-i', clip, '-map', '0:v:0', '-f', 'null', '-']).stderr.toString().match(/frame=\s*(\d+)/g) || ['frame=120']).pop().match(/\d+/)[0];
const last = frames - 1;
const pick = Array.from({ length: 10 }, (_, i) => Math.round(i * last / 9));
const sel = pick.map((f) => `eq(n\\,${f})`).join('+');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'clip-'));
ff(['-i', start, '-vf', 'scale=320:320', path.join(tmp, 'a.png')]);
ff(['-i', clip, '-vf', 'select=eq(n\\,0),scale=320:320', '-frames:v', '1', path.join(tmp, 'b.png')]);
ff(['-i', clip, '-vf', `select=eq(n\\,${last}),scale=320:320`, '-frames:v', '1', path.join(tmp, 'c.png')]);
ff(['-i', end, '-vf', 'scale=320:320', path.join(tmp, 'd.png')]);
ff(['-i', clip, '-vf', `select=${sel},scale=256:256,tile=5x2`, '-vsync', '0', '-frames:v', '1', path.join(tmp, 'grid.png')]);
ff(['-i', path.join(tmp, 'a.png'), '-i', path.join(tmp, 'b.png'), '-i', path.join(tmp, 'c.png'), '-i', path.join(tmp, 'd.png'), '-i', path.join(tmp, 'grid.png'),
  '-filter_complex', '[0][1][2][3]hstack=4,pad=1280:320[top];[4]scale=1280:-1[g];[top][g]vstack=2', out]);
console.log(out, '- frames', frames, '- row 1: start image | first frame | last frame | end image');
