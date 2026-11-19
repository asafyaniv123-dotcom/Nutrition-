// node x220/loop220.mjs [dir] - x220 burpee as a FIVE-pose loop (Asaf, 19 Nov: every stage of a sequence is made, none skipped):
//   start.png (stand) -> frame-2-crouch-fit.png (shifted whole 38 px: the feet slid) -> end-r3-fit.png (plank, scaled whole to the standing size) -> the same crouch again
//   (the sheet's stage 4 is the same crouch, seat a little lower: no new credit) -> frame-4-jump.png -> back to stand.
//   Same path as x221/loop221.mjs: scaled to 1152, backdrops levelled to frame 1's, colour-synced, gif-seq.mjs (0.85 s hold, 0.3 s
//   dissolve, the last pose fades into the first). No feet lock: the feet leave the floor in the plank and the jump.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const FF = path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const D = 'C:/Projects/Nutrition-/exercise-sheets/x220', T = 'C:/Projects/Nutrition-/tools/sheets';
const OUT = process.argv[2] || `${D}/stagec`;
const work = path.join(os.tmpdir(), 'loop220-' + Date.now()); fs.mkdirSync(work, { recursive: true });
const run = (a) => execFileSync(FF, ['-v', 'error', '-y', ...a]);
const [px, py, pw, ph] = [30, 30, 200, 120];
const mean = (f) => { const b = execFileSync(FF, ['-v', 'error', '-i', f, '-vf', `crop=${pw}:${ph}:${px}:${py}`, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 27 });
  const s = [0, 0, 0]; for (let i = 0; i < b.length; i += 3) for (let k = 0; k < 3; k++) s[k] += b[i + k]; return s.map((v) => v / (b.length / 3)); };
const ch = (v) => (v >= 0 ? `max(val-${v}\\,0)` : `min(val+${-v}\\,255)`);
const SRC = { stand: 'start.png', crouch: 'frame-2-crouch-fit.png', plank: 'end-r3-fit.png', jump: 'frame-4-jump.png' };
const S = path.join(work, 'stand.png'); run(['-i', `${D}/${SRC.stand}`, '-vf', 'scale=1152:1152', S]);
const ms = mean(S), lev = { stand: S };
for (const n of ['crouch', 'plank', 'jump']) {
  const raw = path.join(work, n + '-raw.png'), out = path.join(work, n + '.png');
  run(['-i', `${D}/${SRC[n]}`, '-vf', 'scale=1152:1152', raw]);
  const d = mean(raw).map((v, k) => Math.round(v - ms[k]));
  run(['-i', raw, '-vf', `lutrgb=r='${ch(d[0])}':g='${ch(d[1])}':b='${ch(d[2])}'`, out]);
  console.log(n, 'backdrop shifted by', d.map((v) => -v).join('/'));
  lev[n] = out;
}
const SY = path.join(work, 'sync');
execFileSync('node', [`${T}/color-sync.mjs`, SY, lev.stand, lev.crouch, lev.plank, lev.jump], { stdio: 'inherit' });
const seq = ['stand', 'crouch', 'plank', 'crouch', 'jump'].map((n) => path.join(SY, n + '.png'));
execFileSync('node', [`${T}/gif-seq.mjs`, OUT, ...seq], { stdio: 'inherit' });
