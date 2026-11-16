// one-off: rewrite farleg226.mjs's slide for v2 (linear tilt from the hem, frame-1 floor in the seam at shoe rows, far shoe up 7 px)
import fs from 'node:fs';
let s = fs.readFileSync('farleg226.mjs', 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) throw new Error('not once: ' + a.slice(0, 50)); s = s.replace(a, b); };
rep("const [EP, OUT, dxs = '68'] = process.argv.slice(2);", "const [EP, OUT, dxs = '68', SP] = process.argv.slice(2);");
rep("Y0 = 1150, Y1 = 1450,", "Y0 = 1080, Y1 = 1560, FLOOR = 1540, DYF = 7,");
rep("const E = execFileSync(FF, ['-v', 'error', '-i', EP,", "const rd = (p) => execFileSync(FF, ['-v', 'error', '-i', p, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: W * H * 4 });\nconst S = rd(SP);\nconst E = execFileSync(FF, ['-v', 'error', '-i', EP,");
rep("const samp = (x, y, c) => {\n  x = Math.min(W - 1.001, Math.max(0, x));\n  const x0 = Math.floor(x), fx = x - x0, i = (y * W + x0) * 3 + c;\n  return E[i] * (1 - fx) + E[i + 3] * fx;\n};",
    "const samp = (x, y, c) => {\n  x = Math.min(W - 1.001, Math.max(0, x)); y = Math.min(H - 1, Math.max(0, Math.round(y)));\n  const x0 = Math.floor(x), fx = x - x0, i = (y * W + x0) * 3 + c;\n  return E[i] * (1 - fx) + E[i + 3] * fx;\n};");
rep("const t = Math.min(1, (y - Y0) / (Y1 - Y0)), d = DX * (t * t * (3 - 2 * t)); // smoothstep ramp down the shin",
    "const t = Math.min(1, (y - Y0) / (Y1 - Y0)), d = DX * t; // linear: a straight tilt of thigh and shin from the shorts hem\n  const dy = y < FLOOR - 90 ? 0 : DYF * Math.min(1, (y - (FLOOR - 90)) / 90); // far shoe up to frame 1's sole line");
rep("    if (x < B[y] + d) sx = B[y];                                   // the opened seam: the gap's own dark column",
    "    if (x < B[y] + d && y >= FLOOR) { for (let c = 0; c < 3; c++) out[(y * W + x) * 3 + c] = S[(y * W + x) * 3 + c]; continue; } // seam at shoe rows: frame 1's own floor\n    if (x < B[y] + d) sx = B[y];                                   // the opened seam: the gap's own dark column");
rep("for (let c = 0; c < 3; c++) out[(y * W + x) * 3 + c] = Math.round(samp(sx, y, c));", "for (let c = 0; c < 3; c++) out[(y * W + x) * 3 + c] = Math.round(samp(sx, sx === B[y] ? y : y + dy, c));");
rep("// node farleg226.mjs <end-fit.png> <out.png> [DX=68]", "// node farleg226.mjs <end-fit.png> <out.png> [DX=68] <start.png>");
fs.writeFileSync('farleg226.mjs', s); console.log('patched');
