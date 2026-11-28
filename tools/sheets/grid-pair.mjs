// node tools/sheets/grid-pair.mjs <ref.png> <ours.png> <out.jpg> [H=700] - the reference and our frame side by side, each scaled to height H,
//   each with its OWN labelled grid (a line every 25 px, a number every 100) so pose-parity.mjs points can be read off both pictures in their
//   own pixels at that height. Both jsons are then in the H-scaled pixels of their picture: pose-parity compares relative to the figure's
//   height (scale) and an anchor, so the two pictures need not share a scale.
import { execFileSync } from 'node:child_process';
const FF = process.env.TEMP + '/fftool/node_modules/ffmpeg-static/ffmpeg.exe';
const [A, B, OUT, Hs] = process.argv.slice(2); const H = +(Hs || 700);
const FONT = 'C\\:/Windows/Fonts/arial.ttf';
const lab = (tag) => {
  const t = [];
  for (let v = 100; v < 2000; v += 100) {
    t.push(`drawtext=fontfile='${FONT}':text='${v}':fontcolor=yellow:fontsize=14:box=1:boxcolor=black@0.6:x=${v}+2:y=2`);
    t.push(`drawtext=fontfile='${FONT}':text='${v}':fontcolor=yellow:fontsize=14:box=1:boxcolor=black@0.6:x=2:y=${v}+2`);
  }
  return `scale=-2:${H},drawgrid=w=25:h=25:color=white@0.18,drawgrid=w=100:h=100:color=yellow@0.55,${t.join(',')}[${tag}]`;
};
execFileSync(FF, ['-v', 'error', '-y', '-i', A, '-i', B, '-filter_complex', `[0]${lab('a')};[1]${lab('b')};[a]pad=iw+12:ih:0:0:black[a2];[a2][b]hstack`, '-q:v', '3', OUT]);
console.log(OUT);
