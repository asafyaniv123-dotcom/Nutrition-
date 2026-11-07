// Step A in one run: from one of Asaf's screen recordings, the two poses, the app's chrome covered, the guide
// image (both poses side by side) and a dense frame sheet of the whole recording (7 Nov, the batch of 15).
// node tools/sheets/prep-guide.mjs <recording> <out-dir> [crop=1170:1000:0:230]
//   writes ref/ref-start.png, ref/ref-end.png (white squares), guide.png, sheet.png
// Covers the two top corners of each pose square (the app's "..." and ">" marks); LOOK at guide.png anyway -
// a logo elsewhere has to be covered by hand.
import fs from 'fs'; import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const [V, OUT, CROP = 'crop=1170:1000:0:230'] = process.argv.slice(2);
if (!OUT) { console.log('usage: prep-guide.mjs <recording> <out-dir> [crop=w:h:x:y]'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
fs.mkdirSync(path.join(OUT, 'ref'), { recursive: true });
console.log(execFileSync('node', [path.join(here, 'poses-from-video.mjs'), V, path.join(OUT, 'ref'), CROP], { encoding: 'utf8' }).trim());
const ff = (...a) => execFileSync(FF, ['-v', 'error', '-y', ...a]);
for (const p of ['start', 'end']) {
  const f = path.join(OUT, 'ref', `ref-${p}.png`), g = path.join(OUT, 'ref', `g-${p}.png`);
  ff('-i', f, '-vf', 'format=rgb24,drawbox=x=0:y=0:w=iw*0.17:h=ih*0.11:color=0xFFFFFF:t=fill,drawbox=x=iw*0.84:y=0:w=iw*0.16:h=ih*0.13:color=0xFFFFFF:t=fill', g);
}
ff('-i', path.join(OUT, 'ref', 'g-start.png'), '-i', path.join(OUT, 'ref', 'g-end.png'), '-filter_complex', '[0][1]hstack', path.join(OUT, 'guide.png'));
ff('-i', V, '-vf', 'fps=8,scale=234:-1,tile=10x3', '-frames:v', '1', path.join(OUT, 'sheet.png'));
console.log('guide.png and sheet.png in', OUT);
