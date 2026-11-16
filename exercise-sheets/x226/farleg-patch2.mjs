// one-off: v3 of farleg226.mjs - protect the near leg, smooth the fill vertically
import fs from 'node:fs';
let s = fs.readFileSync('farleg226.mjs', 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) throw new Error('not once: ' + a.slice(0, 60)); s = s.replace(a, b); };
rep("//   - where the leg used to be", "//   v3 - NEAR = the near leg's right edge per row (thigh 990, shin 965, toe 995, reflection 990): nothing left of it is moved or\n//     filled (v2's grown mask ate the near thigh - a notch - and carried the near toe tip along - a ghost stub). The hole fill is\n//     averaged over 9 rows so the per-row blend draws no streaks.\n//   - where the leg used to be");
rep("const hard = m.slice();", "const NEAR = (y) => y < 1160 ? 990 : y < 1560 ? 990 - 25 * Math.min(1, (y - 1160) / 120) : y < 1720 ? 995 : 990;\nfor (let y = 0; y < H; y++) { const e = NEAR(y); for (let x = 0; x < e; x++) m[y * W + x] = 0; }\nconst hard = m.slice();");
rep("m = pass(pass(m, FEATHER, true, 'avg'), FEATHER, false, 'avg');", "m = pass(pass(m, FEATHER, true, 'avg'), FEATHER, false, 'avg');\nfor (let y = 0; y < H; y++) { const e = NEAR(y); for (let x = 0; x < e; x++) m[y * W + x] = 0; }");
// fill into a separate buffer, then vertical 9-row average over the hole pixels (non-floor rows)
rep("const out = Buffer.from(E);", "const out = Buffer.from(E), fill = new Float32Array(W * H * 3), isHole = new Uint8Array(W * H);");
rep("      out[i] = y >= FLOOR ? S[i] : Math.round(E[(y * W + L) * 3 + c] + (E[(y * W + R) * 3 + c] - E[(y * W + L) * 3 + c]) * (k - L) / Math.max(1, R - L));",
    "      fill[i] = y >= FLOOR ? S[i] : E[(y * W + L) * 3 + c] + (E[(y * W + R) * 3 + c] - E[(y * W + L) * 3 + c]) * (k - L) / Math.max(1, R - L);\n      isHole[y * W + k] = 1;");
rep("  // the moved leg layer on top, with its own (moved) feathered mask\n  for (let x2 = 880;", "}\nfor (let y = HEM; y < H; y++) for (let x = 0; x < W; x++) { if (!isHole[y * W + x]) continue;\n  for (let c = 0; c < 3; c++) { let s2 = 0, n = 0; if (y >= FLOOR) { s2 = fill[(y * W + x) * 3 + c]; n = 1; } else for (let k = -4; k <= 4; k++) { const j = y + k; if (j >= HEM && j < FLOOR && isHole[j * W + x]) { s2 += fill[(j * W + x) * 3 + c]; n++; } }\n    out[(y * W + x) * 3 + c] = Math.round(s2 / Math.max(1, n)); } }\nfor (let y = HEM; y < H; y++) {\n  const dd = d(y), uu = up(y);\n  // the moved leg layer on top, with its own (moved) feathered mask\n  for (let x2 = 880;");
fs.writeFileSync('farleg226.mjs', s); console.log('patched v3');
