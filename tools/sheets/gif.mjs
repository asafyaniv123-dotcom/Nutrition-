// The exercise animation (Asaf, 6 Nov): two approved frames and a GIF that only moves between them -
// hold the start, cross-fade to the end, hold, cross-fade back. No video model, no credits.
// node tools/sheets/gif.mjs <start.png> <end.png> <out-dir>
//   writes start.jpg, end.jpg and anim.gif into out-dir
import fs from 'fs'; import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const [A, B, OUT] = process.argv.slice(2);
if (!OUT) { console.log('usage: gif.mjs <start.png> <end.png> <out-dir>'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const ff = (a) => execFileSync(FF, ['-v', 'error', '-y', ...a]);
const SIZE = 540, FPS = 15, HOLD = 0.9, FADE = 1.1;
fs.mkdirSync(OUT, { recursive: true });
ff(['-i', A, '-vf', 'scale=768:-1', '-q:v', '3', path.join(OUT, 'start.jpg')]);
ff(['-i', B, '-vf', 'scale=768:-1', '-q:v', '3', path.join(OUT, 'end.jpg')]);
const seg = HOLD + FADE;
/* a still image is one frame: -loop 1 with -t makes it a clip long enough for xfade on both sides */
const len = (seg * 2).toFixed(2);
const graph = [
  `[0:v]scale=${SIZE}:${SIZE},fps=${FPS},format=rgb24[a]`, `[1:v]scale=${SIZE}:${SIZE},fps=${FPS},format=rgb24[b]`,
  `[a]split[a1][a2]`, `[b]split[b1][b2]`,
  `[a1][b1]xfade=transition=fade:duration=${FADE}:offset=${HOLD}[ab]`,
  `[b2][a2]xfade=transition=fade:duration=${FADE}:offset=${HOLD}[ba]`,
  `[ab]trim=duration=${seg + HOLD},setpts=PTS-STARTPTS[x]`, `[ba]trim=start=${HOLD},setpts=PTS-STARTPTS[y]`,
  `[x][y]concat=n=2:v=1:a=0,split[s1][s2]`,
  `[s1]palettegen=max_colors=256:stats_mode=full[p]`, `[s2][p]paletteuse=dither=sierra2_4a`,
].join(';');
ff(['-loop', '1', '-t', len, '-i', A, '-loop', '1', '-t', len, '-i', B, '-filter_complex', graph, '-loop', '0', path.join(OUT, 'anim.gif')]);
console.log(fs.readdirSync(OUT).map((n) => `${n} ${fs.statSync(path.join(OUT, n)).size}`).join('\n'));
