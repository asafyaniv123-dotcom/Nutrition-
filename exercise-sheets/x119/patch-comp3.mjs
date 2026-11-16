// one-off: composite119 v4 - the whole plate box (rounded) from the end frame
import fs from 'node:fs';
let s = fs.readFileSync('composite119.mjs', 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) throw new Error('not once: ' + a.slice(0, 50)); s = s.replace(a, b); };
rep("so there only the PLATE comes from the end frame: neutral-grey\n//   pixels (max < 120, R-B < 22) inside the plate's own box (x 1440-1592, y 520-606) - v2 took every dark pixel and pulled the end\n//   frame's brown background over frame 1's seat.",
    "so there only the PLATE comes from the end frame: its whole box\n//   (x 1440-1592, y 520-606, corners rounded 14 px) - the plate stands in front of the seat. v2 took every dark pixel and pulled the end\n//   frame's brown background over frame 1's seat; v3 took only neutral-grey pixels and lost the plate (its faces carry amber light).");
rep("if (Math.max(E[i], E[i + 1], E[i + 2]) < 120 && E[i] - E[i + 2] < 22) pm[y * W + x] = 1;",
    "const r = 14, cx = Math.min(Math.max(x, a + r), c - r), cy = Math.min(Math.max(y, b + r), d - r); if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) pm[y * W + x] = 1;");
fs.writeFileSync('composite119.mjs', s); console.log('patched v4');
