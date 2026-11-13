// node tools/sheets/eq-cut.mjs <sheet.png> <outDir> <slug1,slug2,...> [grey=179] [fill=0.68]  -> <outDir>/<slug>.jpg (420x420); ALPHA=<px> -> transparent <slug>.png
// The equipment icons (13 Nov) come as generated sheets: a 3x2 grid, five objects, the sixth cell empty. Each object is
// cut out by the same background-removal model the muscle pictures went through (muscle-grey.mjs), and laid on the
// same flat grey, so the two tabs of the picker read as one set. An object fills `fill` of the square on its longer
// side - the circle it is shown in clips the corners, so the diagonal has to fit, not the side.
// Needs, once:  npm i @imgly/background-removal-node --prefix %TEMP%/bgrm
import fs from 'fs'; import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process'; import { createRequire } from 'module';
const [sheet, outDir, slugList, grey = '179', fillArg = '0.68'] = process.argv.slice(2);
if (!slugList) { console.log('usage: eq-cut.mjs <sheet.png> <outDir> <slug1,...> [grey] [fill]'); process.exit(2); }
const slugs = slugList.split(','), FILL = +fillArg;
const BG = path.join(os.tmpdir(), 'bgrm');
const { removeBackground } = createRequire(path.join(BG, 'package.json'))('@imgly/background-removal-node');
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const publicPath = 'file:///' + path.join(BG, 'node_modules/@imgly/background-removal-node/dist/').split(path.sep).join('/');
const blob = await removeBackground('file:///' + path.resolve(sheet).split(path.sep).join('/'), { publicPath, model: 'medium', output: { format: 'image/png' } });
const cut = path.join(os.tmpdir(), 'eq-cut-' + process.pid + '.png'); fs.writeFileSync(cut, Buffer.from(await blob.arrayBuffer()));
/* ffmpeg with no output exits non-zero, and its banner is the only place the size is printed */
const probe = (() => { try { execFileSync(FF, ['-i', cut], { stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { return String(e.stderr); } return ''; })();
const [W, H] = probe.match(/, (\d{3,5})x(\d{3,5})/).slice(1).map(Number);
const rgba = execFileSync(FF, ['-v', 'error', '-i', cut, '-pix_fmt', 'rgba', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 28 });
fs.mkdirSync(outDir, { recursive: true });
const hex = '0x' + (+grey).toString(16).padStart(2, '0').repeat(3);
slugs.forEach((slug, i) => {
  if (!slug) return;
  /* GRID=<cols>x<rows>, 3x2 by default; ten objects on one sheet came as 4x3 (13 Nov) */
  const [GC, GR] = (process.env.GRID || '3x2').split('x').map(Number);
  const cx0 = Math.round((i % GC) * W / GC), cy0 = Math.round(Math.floor(i / GC) * H / GR), cw = Math.round(W / GC), ch = Math.round(H / GR);
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = cy0; y < cy0 + ch; y++) for (let x = cx0; x < cx0 + cw; x++) if (rgba[(y * W + x) * 4 + 3] > 24) {
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) { console.log(slug, 'EMPTY CELL'); return; }
  const w = x1 - x0 + 1, h = y1 - y0 + 1, side = Math.ceil(Math.max(w, h) / FILL);
  const touches = x0 === cx0 || y0 === cy0 || x1 === cx0 + cw - 1 || y1 === cy0 + ch - 1;
  /* ALPHA=<px>: no ground at all - a transparent square of that size, for eq-tone.mjs to recolour */
  if (process.env.ALPHA) {
    const px = +process.env.ALPHA;
    execFileSync(FF, ['-v', 'error', '-y', '-i', cut, '-vf',
      `crop=${w}:${h}:${x0}:${y0},format=rgba,pad=${side}:${side}:${Math.floor((side - w) / 2)}:${Math.floor((side - h) / 2)}:color=black@0,scale=${px}:${px}:flags=lanczos`,
      '-frames:v', '1', path.join(outDir, slug + '.png')]);
    console.log(slug, w + 'x' + h, touches ? 'TOUCHES ITS CELL EDGE - check it is whole' : 'ok');
    return;
  }
  const out = path.join(outDir, slug + '.jpg');
  execFileSync(FF, ['-v', 'error', '-y', '-f', 'lavfi', '-i', `color=c=${hex}:s=420x420`, '-i', cut, '-filter_complex',
    `[1]crop=${w}:${h}:${x0}:${y0},format=rgba,pad=${side}:${side}:${Math.floor((side - w) / 2)}:${Math.floor((side - h) / 2)}:color=black@0,scale=420:420[f];[0][f]overlay=format=auto`,
    '-frames:v', '1', '-q:v', '3', out]);
  console.log(slug, w + 'x' + h, touches ? 'TOUCHES ITS CELL EDGE - check it is whole' : 'ok');
});
fs.unlinkSync(cut);
