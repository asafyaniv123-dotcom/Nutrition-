// node tools/sheets/ref-upscale.mjs <id> - writes exercise-sheets/<id>/ref-start-1024.png and ref-end-1024.png: the crops enlarged (lanczos)
//   so their long side is 1024 px. This is what is uploaded for frame 1 when a crop is under 800 px (Asaf, 15 Nov, after x175: a 360x360
//   GIF frame lost to the 2048 style anchor - the crossed leg came out as two legs side by side). ref-gate.mjs refuses frame 1 otherwise.
//   Only a resize: no sharpening, no redrawing - the reference stays what it was.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
const [ID] = process.argv.slice(2);
if (!ID) { console.log('usage: ref-upscale.mjs <id>'); process.exit(2); }
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const d = path.join(here, '..', '..', 'exercise-sheets', ID);
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
for (const n of ['ref-start', 'ref-end']) {
  const src = path.join(d, n + '.png');
  if (!fs.existsSync(src)) { console.log('missing', src); process.exit(1); }
  execFileSync(FF, ['-v', 'error', '-y', '-i', src, '-vf', 'scale=1024:1024:force_original_aspect_ratio=decrease:flags=lanczos,format=rgb24', path.join(d, n + '-1024.png')]);
  console.log('ref-upscale:', path.join(d, n + '-1024.png'));
}
