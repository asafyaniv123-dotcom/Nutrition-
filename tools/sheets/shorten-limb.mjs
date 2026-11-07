// Shorten a limb that a generation drew too long, by squeezing ONLY the rows above (or left of) its joint inside
// a column, our own pixels and nothing pasted in (x190, 7 Nov: the raised legs came out 12% longer than lying).
// The column's edges blend into the untouched picture over `feather` px, so no seam shows on the dark ground.
// node tools/sheets/shorten-limb.mjs <in.png> <out.png> <x0> <x1> <joint-y> <tip-y> <new-tip-y> [feather=40]
//   vertical limb: rows from tip-y down to joint-y are squeezed so the tip lands on new-tip-y; joint-y stays put
import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const [IN, OUT, ...n] = process.argv.slice(2);
if (n.length < 5) { console.log('usage: shorten-limb.mjs <in> <out> <x0> <x1> <joint-y> <tip-y> <new-tip-y> [feather]'); process.exit(2); }
const [X0, X1, J, T, NT, F = 40] = n.map(Number);
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
let W, H; try { execFileSync(FF, ['-i', IN], { stdio: 'pipe' }); } catch (e) { const m = String(e.stderr).match(/, (\d{3,5})x(\d{3,5})/); W = +m[1]; H = +m[2]; }
const src = execFileSync(FF, ['-v', 'error', '-i', IN, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 28 });
const out = Buffer.from(src), k = (J - T) / (J - NT);           // source rows per output row, > 1 squeezes
const at = (x, y, c) => { y = Math.max(0, Math.min(H - 1, y)); const y0 = Math.floor(y), f = y - y0, y1 = Math.min(H - 1, y0 + 1);
  return src[(y0 * W + x) * 3 + c] * (1 - f) + src[(y1 * W + x) * 3 + c] * f; };
for (let x = Math.max(0, X0 - F); x < Math.min(W, X1 + F); x++) {
  const w = x < X0 ? (x - (X0 - F)) / F : x > X1 ? ((X1 + F) - x) / F : 1;   // 0 at the feather's outer edge, 1 inside
  for (let y = 0; y < J; y++) {
    const sy = J - (J - y) * k;                                  // the joint row maps to itself, rows above stretch from higher up
    for (let c = 0; c < 3; c++) { const i = (y * W + x) * 3 + c; out[i] = Math.round(src[i] * (1 - w) + at(x, sy, c) * w); }
  }
}
execFileSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', OUT], { input: out });
console.log(`squeezed rows ${T}-${J} to ${NT}-${J} in x ${X0}-${X1} (k=${k.toFixed(3)})`);
