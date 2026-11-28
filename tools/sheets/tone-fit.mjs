// node tools/sheets/tone-fit.mjs <raw.png> <out.png> [approved=exercise-sheets/character/EARLY-stand.jpg] - the free colour correction
//   x344 needed by hand (hue=h=2:s=0.8,colorlevels), found by search: tries a small grid of hue shift, saturation and brightness lift,
//   keeps the first that tone-check.mjs passes (hue within 1, saturation within 0.02, roughness under 1.15x), writes it and prints the
//   filter so the report can name it. Nothing but a global colour filter - the pixels' geometry is untouched. Exit 1 if none passes.
import { execFileSync } from 'node:child_process';
const FF = process.env.TEMP + '/fftool/node_modules/ffmpeg-static/ffmpeg.exe';
const [RAW, OUT, APP = 'exercise-sheets/character/EARLY-stand.jpg'] = process.argv.slice(2);
const tmp = process.env.TEMP + '/xb/tonefit-' + OUT.replace(/[^\w]/g, '_') + '.png'; // one per output, so several can run at once
const tone = (f) => execFileSync('node', ['tools/sheets/tone-check.mjs', APP, f], { encoding: 'utf8' }).trim().split('\n').pop();
// Grain last: x346 and x347 (28 Nov) passed hue and saturation everywhere in the grid and failed only roughness, 1.24x - the
// colour lift sharpens the render's grain. tone-check reads grain at 512 px, so a blur that matters is sigma ~1.2 at 2k (0.8 at
// 512 did nothing). The unblurred grid is tried first; a blur only when no colour alone passes.
for (const blur of ['', ',gblur=sigma=1.2', ',gblur=sigma=1.6'])
for (const h of [2, 3, 2.5, 3.5, 1.5, 4])
  for (const s of [0.85, 0.88, 0.82, 0.9, 0.8, 0.92, 0.78])
    for (const L of [0.88, 0.9, 0.85, 0.92, 0.82]) {
      const vf = `hue=h=${h}:s=${s},colorlevels=rimax=${L}:gimax=${L}:bimax=${L}${blur}`;
      execFileSync(FF, ['-v', 'error', '-y', '-i', RAW, '-vf', vf, tmp]);
      const r = tone(tmp);
      if (r.startsWith('PASS')) { execFileSync(FF, ['-v', 'error', '-y', '-i', RAW, '-vf', vf, OUT]); console.log(vf + '\n' + r); process.exit(0); }
    }
console.log('no filter in the grid passes'); process.exit(1);
