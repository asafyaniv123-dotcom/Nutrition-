// node tools/sheets/muscle-grey.mjs <inDir> <outDir> <grey 0-255> [grey2 ...]   -> <outDir>/<grey>/<name>.jpg
// The muscle pictures on a grey ground (Asaf, 11 Nov), so the white body reads against it. The body is cut out by a
// background-removal model and laid on flat grey. Needs, once:  npm i @imgly/background-removal-node --prefix %TEMP%/bgrm
// What does NOT work, and was tried first: a flood fill by colour. The white body is in large parts exactly the ground's
// colour (≈233,229,226; the body ≈213-233), so the fill walks into it; walled by the outline's gradient it stays out but
// leaves a ragged pale rim. Asaf on that version: "the figure is not clean".
import { createRequire } from 'module'; import { execFileSync } from 'child_process'; import fs from 'fs'; import path from 'path'; import os from 'os';
const [inDir, outDir, ...greys] = process.argv.slice(2);
if (!greys.length) { console.log('usage: muscle-grey.mjs <inDir> <outDir> <grey> [grey2 ...]'); process.exit(2); }
const BG = path.join(os.tmpdir(), 'bgrm');
const { removeBackground } = createRequire(path.join(BG, 'package.json'))('@imgly/background-removal-node');
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const publicPath = 'file:///' + path.join(BG, 'node_modules/@imgly/background-removal-node/dist/').split(path.sep).join('/');
for (const f of fs.readdirSync(inDir).filter(f => f.endsWith('.jpg'))) {
  const blob = await removeBackground('file:///' + path.resolve(inDir, f).split(path.sep).join('/'), { publicPath, model: 'medium', output: { format: 'image/png' } });
  const cut = path.join(os.tmpdir(), 'mg-cut-' + process.pid + '.png'); fs.writeFileSync(cut, Buffer.from(await blob.arrayBuffer()));
  for (const g of greys) {
    const hex = '0x' + (+g).toString(16).padStart(2, '0').repeat(3), od = path.join(outDir, String(g)); fs.mkdirSync(od, { recursive: true });
    execFileSync(FF, ['-v', 'error', '-y', '-f', 'lavfi', '-i', `color=c=${hex}:s=420x420`, '-i', cut, '-filter_complex', '[1]scale=420:420[f];[0][f]overlay=format=auto', '-frames:v', '1', '-q:v', '3', path.join(od, f)]);
  }
  fs.unlinkSync(cut); console.log(f);
}
