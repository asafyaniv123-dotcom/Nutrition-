// The two poses out of a screen recording of a reference GIF (Asaf, 6 Nov: "I'll send a video like the
// GIF, you take the two exact pictures out of it"). A two-pose GIF holds one pose, fades, holds the other:
// this measures every frame's distance from the first, and takes the frame in the middle of the longest
// stretch at each end of the scale - the start pose and the end pose, each well clear of any fade.
// No credits. The crop is the picture area of the phone screen; pass crop=w:h:x:y for another layout.
// node tools/sheets/poses-from-video.mjs <recording.mp4> <out-dir> [crop=880:1150:160:150]
//   writes ref-start.png and ref-end.png, each padded to a white square
import fs from 'fs'; import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const [V, OUT, ...OPT] = process.argv.slice(2);
if (!OUT) { console.log('usage: poses-from-video.mjs <recording.mp4> <out-dir> [crop=w:h:x:y]'); process.exit(2); }
const CROP = ((OPT.find((o) => o.startsWith('crop=')) || 'crop=880:1150:160:150').slice(5));
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
fs.mkdirSync(OUT, { recursive: true });
const S = 64, buf = execFileSync(FF, ['-v', 'error', '-i', V, '-vf', `crop=${CROP},scale=${S}:${S}`, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 1 << 28 });
const n = buf.length / (S * S), fr = (i) => buf.subarray(i * S * S, (i + 1) * S * S);
const dist = (p, q) => { let s = 0; for (let i = 0; i < p.length; i++) s += Math.abs(p[i] - q[i]); return s / p.length; };
const d = Array.from({ length: n }, (_, i) => dist(fr(i), fr(0))), top = Math.max(...d);
/* the longest run of frames within 5% of each end of the scale; its middle frame is the cleanest */
function middleOfLongestRun(test) {
  let best = [0, -1], from = -1;
  for (let i = 0; i <= n; i++) {
    if (i < n && test(d[i])) { if (from < 0) from = i; continue; }
    if (from >= 0 && i - from > best[1] - best[0]) best = [from, i - 1];
    from = -1;
  }
  return Math.round((best[0] + best[1]) / 2);
}
const a = middleOfLongestRun((v) => v <= top * 0.05), b = middleOfLongestRun((v) => v >= top * 0.95);
const [w, h] = CROP.split(':').map(Number), side = Math.max(w, h);
for (const [i, name] of [[a, 'ref-start.png'], [b, 'ref-end.png']])
  execFileSync(FF, ['-v', 'error', '-y', '-i', V, '-vf', `select=eq(n\\,${i}),crop=${CROP},pad=${side}:${side}:(ow-iw)/2:(oh-ih)/2:white`, '-frames:v', '1', path.join(OUT, name)]);
console.log(`${n} frames; start pose = frame ${a}, end pose = frame ${b}; written to ${OUT}`);
