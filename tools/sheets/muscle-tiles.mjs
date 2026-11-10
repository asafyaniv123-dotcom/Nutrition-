// Muscle-picker tile images, direction B (Asaf, 11 Nov): one soft-white embossed body from the front and one from
// the back (generated once), and for each muscle the same body with only that muscle lit amber from inside.
// The light is painted here, free: first the glow the base images were generated with is neutralised back to the
// white material, then each muscle gets soft elliptical amber light (screen blend, gaussian falloff).
// node tools/sheets/muscle-tiles.mjs <front.png> <back.png> <outDir> [only=key,key]
// Coordinates are on the 1024 px body images, measured on a 40 px grid (front and back separately).
import { execFileSync } from 'child_process'; import path from 'path'; import os from 'os'; import fs from 'fs';
const [front, back, out, only] = process.argv.slice(2);
if (!out) { console.log('usage: muscle-tiles.mjs <front> <back> <outDir> [only=k1,k2]'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const S = 1024;
const load = (f) => execFileSync(FF, ['-v', 'error', '-i', f, '-vf', `scale=${S}:${S}`, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 26 });
// neutralise the generated glow: any warm-saturated pixel is put back to the white material at its own lightness
function neutral(buf) { const o = Buffer.from(buf);
  for (let i = 0; i < o.length; i += 3) { const r = o[i], g = o[i + 1], b = o[i + 2], sat = r - b;
    if (sat > 14) { const L = Math.min(236, g); const t = Math.min(1, (sat - 14) / 30);
      const w = [Math.min(255, L * 1.012), L, L * 0.972]; for (let k = 0; k < 3; k++) o[i + k] = Math.round(o[i + k] * (1 - t) + w[k] * t); } }
  return o; }
// muscles: view, list of ellipses [cx, cy, rx, ry] on the 1024 image, Hebrew key = the app's muscle name
const F = (x, y) => [x + 232, y + 12], B = (x, y) => [x - 560 + 232, y + 12];
const M = {
  'חזה':        ['f', [[...F(240, 252), 46, 34], [...F(320, 252), 46, 34]]],
  'כתפיים':     ['f', [[...F(178, 222), 30, 36], [...F(382, 222), 30, 36]]],
  'יד קדמית':   ['f', [[...F(180, 295), 22, 44], [...F(380, 295), 22, 44]]],
  'אמה':        ['f', [[...F(155, 400), 18, 50], [...F(405, 400), 18, 50]]],
  'בטן':        ['f', [[...F(280, 330), 34, 70]]],
  'אלכסונים':   ['f', [[...F(226, 345), 18, 50], [...F(334, 345), 18, 50]]],
  'ארבע ראשי':  ['f', [[...F(232, 640), 34, 92], [...F(328, 640), 34, 92]]],
  'מקרבים':     ['f', [[...F(262, 600), 16, 70], [...F(298, 600), 16, 70]]],
  'מרחיקים':    ['f', [[...F(205, 525), 20, 52], [...F(355, 525), 20, 52]]],
  'טרפז':       ['b', [[...B(840, 180), 64, 40]]],
  'גב':         ['b', [[...B(840, 250), 70, 56]]],
  'גב רחב':     ['b', [[...B(792, 300), 34, 62], [...B(888, 300), 34, 62]]],
  'יד אחורית':  ['b', [[...B(735, 282), 22, 46], [...B(945, 282), 22, 46]]],
  'גב תחתון':   ['b', [[...B(840, 372), 44, 30]]],
  'ישבן':       ['b', [[...B(797, 470), 40, 42], [...B(883, 470), 40, 42]]],
  'ירך אחורית': ['b', [[...B(792, 645), 32, 88], [...B(888, 645), 32, 88]]],
  'תאומים':     ['b', [[...B(782, 785), 24, 56], [...B(898, 785), 24, 56]]],
};
const keys = only ? only.split(',') : Object.keys(M);
const base = { f: neutral(load(front)), b: neutral(load(back)) };
fs.mkdirSync(out, { recursive: true });
const AMBER = [255, 168, 52];
for (const k of keys) {
  const [view, els] = M[k]; const o = Buffer.from(base[view]);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    let a = 0; for (const [cx, cy, rx, ry] of els) { const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2; a = Math.max(a, Math.exp(-1.6 * d)); }
    if (a < 0.01) continue; const i = (y * S + x) * 3;
    // a warm light under the white skin: tint toward amber, a hotter, lighter core where the light is strongest
    const core = Math.max(0, a - 0.6) / 0.4;
    for (let c = 0; c < 3; c++) { const tint = o[i + c] + (AMBER[c] - o[i + c]) * a * 0.85; o[i + c] = Math.round(Math.min(255, tint + (255 - tint) * core * 0.55)); }
  }
  const raw = path.join(os.tmpdir(), 'mt-' + Date.now() + '.rgb'); fs.writeFileSync(raw, o);
  const name = path.join(out, `${view}-${Object.keys(M).indexOf(k)}.jpg`);
  execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${S}x${S}`, '-i', raw, '-vf', 'scale=600:600', '-q:v', '3', name]);
  fs.unlinkSync(raw); console.log(k, '->', name);
}
