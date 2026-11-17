// node x221/loop221.mjs - x221 box jump as a three-pose loop (Asaf, 17 Nov: crouch -> in the air -> landed; two frames would jump).
//   start.png (approved), mid.png and end.png (both box-locked by boxfit221.mjs: box edges within 2 px of frame 1) are scaled to
//   1152, their backdrops levelled to frame 1's as stage-c.mjs does, colour-synced together (color-sync.mjs, must say SYNCED), then
//   gif-seq.mjs: the fixed 0.85 s hold / 0.3 s dissolve, and the landing fades back into the crouch so the loop has no jump.
//   No feet lock: the figure leaves the floor, so nothing it stands on stays the same.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const FF = path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const D = 'C:/Projects/Nutrition-/exercise-sheets/x221', T = 'C:/Projects/Nutrition-/tools/sheets';
const work = path.join(os.tmpdir(), 'loop221-' + Date.now()); fs.mkdirSync(work, { recursive: true });
const run = (a) => execFileSync(FF, ['-v', 'error', '-y', ...a]);
const [px, py, pw, ph] = [30, 30, 200, 120];
const mean = (f) => { const b = execFileSync(FF, ['-v', 'error', '-i', f, '-vf', `crop=${pw}:${ph}:${px}:${py}`, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 27 });
  const s = [0, 0, 0]; for (let i = 0; i < b.length; i += 3) for (let k = 0; k < 3; k++) s[k] += b[i + k]; return s.map((v) => v / (b.length / 3)); };
const ch = (v) => (v >= 0 ? `max(val-${v}\\,0)` : `min(val+${-v}\\,255)`);
const S = path.join(work, 'start.png'); run(['-i', `${D}/start.png`, '-vf', 'scale=1152:1152', S]);
const ms = mean(S), lev = [S];
for (const n of ['mid', 'end']) {
  const raw = path.join(work, n + '-raw.png'), out = path.join(work, n + '.png');
  run(['-i', `${D}/${n}.png`, '-vf', 'scale=1152:1152', raw]);
  const d = mean(raw).map((v, k) => Math.round(v - ms[k]));
  run(['-i', raw, '-vf', `lutrgb=r='${ch(d[0])}':g='${ch(d[1])}':b='${ch(d[2])}'`, out]);
  console.log(n, 'backdrop shifted by', d.map((v) => -v).join('/'));
  lev.push(out);
}
const SY = path.join(work, 'sync');
execFileSync('node', [`${T}/color-sync.mjs`, SY, ...lev], { stdio: 'inherit' });
execFileSync('node', [`${T}/gif-seq.mjs`, `${D}/stagec`, ...['start', 'mid', 'end'].map((n) => path.join(SY, n + '.png'))], { stdio: 'inherit' });
console.log('x221 loop ->', `${D}/stagec`);
