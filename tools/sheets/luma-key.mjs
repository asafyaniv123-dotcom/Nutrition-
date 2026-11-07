// Lift a glowing figure off its own dark ground by brightness, so it can be laid on the one static
// background (7 Nov, x20): a figure generated on transparency came out lumpy and speckled, the same figure on a
// dark ground comes out clean like the approved frames. The figure glows and the ground is near-black, so
// alpha = smoothstep of luminance between LO and HI keeps the body solid, the rim and the halo soft, and
// drops the ground. Everything in the frame that is not the figure (floor, a drawn bench) must be dark.
// node tools/sheets/luma-key.mjs <in.png> <out-rgba.png> [lo=34] [hi=90]
import { execFileSync } from 'child_process'; import path from 'path'; import os from 'os';
const [IN, OUT, lo = '34', hi = '90'] = process.argv.slice(2);
if (!OUT) { console.log('usage: luma-key.mjs <in.png> <out-rgba.png> [lo] [hi]'); process.exit(2); }
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const L = '(0.299*r(X,Y)+0.587*g(X,Y)+0.114*b(X,Y))';
const t = `clip((${L}-${lo})/(${hi}-${lo}),0,1)`;
execFileSync(FF, ['-v', 'error', '-y', '-i', IN, '-vf',
  `format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*${t}*${t}*(3-2*${t})'`, OUT]);
console.log('wrote', OUT);
