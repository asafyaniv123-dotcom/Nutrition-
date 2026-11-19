// node x201/loop201.mjs [dir] - x201 Turkish get-up, ALL 8 stages up and the same stages back down, as the fitnessprogramer GIF does (19 Nov):
//   start.png -> stage-2b-fit .. stage-8-fit (each made from frame 1 with ref-k, then shifted whole so the planted foot sits on frame 1's pixels)
//   -> back down 7..2 -> fades into start. Same path as x220/loop220.mjs (scaled to 1152, backdrops levelled, colour-synced, gif-seq.mjs).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const FF = path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const D = 'C:/Projects/Nutrition-/exercise-sheets/x201', T = 'C:/Projects/Nutrition-/tools/sheets';
const OUT = process.argv[2] || `${D}/stagec`;
const work = path.join(os.tmpdir(), 'loop220-' + Date.now()); fs.mkdirSync(work, { recursive: true });
const run = (a) => execFileSync(FF, ['-v', 'error', '-y', ...a]);
const [px, py, pw, ph] = [30, 30, 200, 120];
const mean = (f) => { const b = execFileSync(FF, ['-v', 'error', '-i', f, '-vf', `crop=${pw}:${ph}:${px}:${py}`, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 27 });
  const s = [0, 0, 0]; for (let i = 0; i < b.length; i += 3) for (let k = 0; k < 3; k++) s[k] += b[i + k]; return s.map((v) => v / (b.length / 3)); };
const ch = (v) => (v >= 0 ? `max(val-${v}\\,0)` : `min(val+${-v}\\,255)`);
const SRC = { s1: 'start.png', s2: 'stage-2b-fit.png', s3: 'stage-3-fit.png', s4: 'stage-4-fit.png', s5: 'stage-5-fit.png', s6: 'stage-6-fit.png', s7: 'stage-7-fit.png', s8: 'stage-8-fit.png' };
const S = path.join(work, 's1.png'); run(['-i', `${D}/${SRC.s1}`, '-vf', 'scale=1152:1152', S]);
const ms = mean(S), lev = { s1: S };
for (const n of ['s2', 's3', 's4', 's5', 's6', 's7', 's8']) {
  const raw = path.join(work, n + '-raw.png'), out = path.join(work, n + '.png');
  run(['-i', `${D}/${SRC[n]}`, '-vf', 'scale=1152:1152', raw]);
  const d = mean(raw).map((v, k) => Math.round(v - ms[k]));
  run(['-i', raw, '-vf', `lutrgb=r='${ch(d[0])}':g='${ch(d[1])}':b='${ch(d[2])}'`, out]);
  console.log(n, 'backdrop shifted by', d.map((v) => -v).join('/'));
  lev[n] = out;
}
const SY = path.join(work, 'sync');
execFileSync('node', [`${T}/color-sync.mjs`, SY, ...['s1','s2','s3','s4','s5','s6','s7','s8'].map((n) => lev[n])], { stdio: 'inherit' });
const seq = ['s1','s2','s3','s4','s5','s6','s7','s8','s7','s6','s5','s4','s3','s2'].map((n) => path.join(SY, n + '.png'));
execFileSync('node', [`${T}/gif-seq.mjs`, OUT, ...seq], { stdio: 'inherit' });
