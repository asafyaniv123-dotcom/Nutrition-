// one-off: composite119 v2 - in the strip where the lower plate overlaps the seat top, only the dumbbell's dark pixels come from the end frame
import fs from 'node:fs';
let s = fs.readFileSync('composite119.mjs', 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) throw new Error('not once: ' + a.slice(0, 50)); s = s.replace(a, b); };
rep("//   13 Nov's lock", "//   v2: B stops at y 520; below it (y 520-660, x 1375-1700) the lower plate overlaps the seat top, so there only the dumbbell's own dark\n//   pixels (max channel < 95 in the end frame) come from the end frame - the seat outline stays frame 1's (v1 showed a bump there).\n//   13 Nov's lock");
rep("const RECTS = [[878, 263, 1375, 966], [1375, 263, 1639, 629]]; // 2048 coords", "const RECTS = [[878, 263, 1375, 966], [1375, 263, 1639, 520]]; // 2048 coords\nconst STRIP = [1375, 520, 1700, 660]; // the plate-over-seat strip: dark end pixels only");
rep("const blur = (src, horiz)", "{ const [a, b, c, d] = STRIP; for (let y = b; y < d; y++) for (let x = a; x < c; x++) { const i = (y * W + x) * 3; if (Math.max(E[i], E[i + 1], E[i + 2]) < 95) m[y * W + x] = 1; } }\nconst blur = (src, horiz)");
rep("const W = 2048, H = 2048, F = 24;", "const W = 2048, H = 2048, F = 6;");
fs.writeFileSync('composite119.mjs', s); console.log('patched');
