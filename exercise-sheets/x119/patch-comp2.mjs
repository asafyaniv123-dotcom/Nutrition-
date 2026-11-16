// one-off: composite119 v3 - plate mask = neutral-grey pixels inside the plate's own box; rects feathered 24, plate 3
import fs from 'node:fs';
let s = fs.readFileSync('composite119.mjs', 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) throw new Error('not once: ' + a.slice(0, 50)); s = s.replace(a, b); };
rep("//   v2: B stops at y 520; below it (y 520-660, x 1375-1700) the lower plate overlaps the seat top, so there only the dumbbell's own dark\n//   pixels (max channel < 95 in the end frame) come from the end frame - the seat outline stays frame 1's (v1 showed a bump there).",
    "//   v3: B stops at y 520; below it the lower plate overlaps the seat top, so there only the PLATE comes from the end frame: neutral-grey\n//   pixels (max < 120, R-B < 22) inside the plate's own box (x 1440-1592, y 520-606) - v2 took every dark pixel and pulled the end\n//   frame's brown background over frame 1's seat. The rects feather 24 px (the backdrop levels differ a little), the plate 3 px.");
rep("const W = 2048, H = 2048, F = 6;", "const W = 2048, H = 2048;");
rep("const STRIP = [1375, 520, 1700, 660]; // the plate-over-seat strip: dark end pixels only", "const PLATE = [1440, 520, 1592, 606]; // the lower plate's box: neutral-grey end pixels only");
rep("{ const [a, b, c, d] = STRIP; for (let y = b; y < d; y++) for (let x = a; x < c; x++) { const i = (y * W + x) * 3; if (Math.max(E[i], E[i + 1], E[i + 2]) < 95) m[y * W + x] = 1; } }",
    "const pm = new Float32Array(W * H);\n{ const [a, b, c, d] = PLATE; for (let y = b; y < d; y++) for (let x = a; x < c; x++) { const i = (y * W + x) * 3; if (Math.max(E[i], E[i + 1], E[i + 2]) < 120 && E[i] - E[i + 2] < 22) pm[y * W + x] = 1; } }");
rep("const blur = (src, horiz) =>", "const blur = (src, horiz, F) =>");
rep("const mk = blur(blur(m, true), false);", "const mr = blur(blur(m, true, 24), false, 24), mp = blur(blur(pm, true, 3), false, 3);\nconst mk = new Float32Array(W * H); for (let i = 0; i < W * H; i++) mk[i] = Math.max(mr[i], mp[i]);");
fs.writeFileSync('composite119.mjs', s); console.log('patched v3');
