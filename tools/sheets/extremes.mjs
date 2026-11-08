// The two ends of a rep, measured, out of a folder of video frames (masgrab.mjs output). Asaf, 8 Nov: "I don't want
// range-of-motion problems" - picking the ends by eye from thumbnails gave a hammer curl that stopped mid-rep.
// Splits the frames into camera shots (a jump between consecutive frames), drops title cards (little detail),
// and in every shot long enough finds the pair of frames farthest apart: with a still camera that is the full range.
// node tools/sheets/extremes.mjs <framesDir> [minShotFrames=10] [from-to] [crop=w:h:x:y]   -> per shot: best pair, distance
// A shot also holds the setup (sitting down, lying back), a bigger change than the rep (x3, x5 gave sitting vs lying):
// from-to keeps only the reps, crop weighs only the moving part.
import fs from 'fs'; import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const [dir, minLen = '10', range = '', crop = ''] = process.argv.slice(2);
const [lo, hi] = range ? range.split('-').map(Number) : [0, 1e9];
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const W = 64, H = 36;
const files = fs.readdirSync(dir).filter((f) => /^\d+\.jpg$/.test(f)).sort().filter((f) => +f.slice(0, 3) >= lo && +f.slice(0, 3) <= hi);
const px = files.map((f) => execFileSync(FF, ['-v', 'error', '-i', path.join(dir, f), '-vf', `${crop ? 'crop=' + crop.replace('crop=', '') + ',' : ''}scale=${W}:${H},format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 20 }));
const dist = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s / a.length; };
const detail = (a) => { let m = 0; for (const v of a) m += v; m /= a.length; let s = 0; for (const v of a) s += (v - m) ** 2; return Math.sqrt(s / a.length); };
const shots = []; let start = 0;
for (let i = 1; i <= px.length; i++) if (i === px.length || dist(px[i - 1], px[i]) > 18) { shots.push([start, i - 1]); start = i; }
for (const [a, b] of shots) {
  if (b - a + 1 < +minLen) continue;
  if (detail(px[a]) < 25 && detail(px[b]) < 25) continue; // title cards: flat blue
  let best = [a, a, 0];
  for (let i = a; i <= b; i++) for (let j = i + 1; j <= b; j++) { const d = dist(px[i], px[j]); if (d > best[2]) best = [i, j, d]; }
  console.log(`shot ${files[a]}-${files[b]}: ends ${files[best[0]]} / ${files[best[1]]}  distance ${best[2].toFixed(1)}`);
}
