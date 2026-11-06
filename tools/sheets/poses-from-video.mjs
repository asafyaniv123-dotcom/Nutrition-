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
/* -fps_mode passthrough: a phone recording can have a variable frame rate, and without it the raw output
   is padded to a constant rate - frame numbers here would then not be the n that select= picks below */
const S = 64, buf = execFileSync(FF, ['-v', 'error', '-i', V, '-vf', `crop=${CROP},scale=${S}:${S}`, '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 1 << 28 });
const n = buf.length / (S * S), fr = (i) => buf.subarray(i * S * S, (i + 1) * S * S);
const dist = (p, q) => { let s = 0; for (let i = 0; i < p.length; i++) s += Math.abs(p[i] - q[i]); return s / p.length; };
/* The two poses are where the picture STANDS longest. Not the first frame and not the extremes: the
   pullover's GIF (6 Nov) starts mid-fade and flashes a single frame of both poses at once between holds,
   and that blended frame is the one farthest from everything. So: split the recording into runs of frames
   that do not change, take the longest run, then the longest run that looks different from it, and the
   middle frame of each. */
const runs = []; let from = 0;
for (let i = 1; i <= n; i++) if (i === n || dist(fr(i), fr(i - 1)) > 0.25) { runs.push([from, i - 1]); from = i; }
const mid = ([lo, hi]) => Math.round((lo + hi) / 2), len = ([lo, hi]) => hi - lo;
runs.sort((x, y) => len(y) - len(x));
const r1 = runs[0], r2 = runs.find((r) => dist(fr(mid(r)), fr(mid(r1))) > 3);
if (!r2) { console.log('only one pose found - is this a recording of a two-pose GIF?'); process.exit(1); }
/* the start pose is the one the recording reaches first */
const [a, b] = [mid(r1), mid(r2)].sort((x, y) => x - y);
const [w, h] = CROP.split(':').map(Number), side = Math.max(w, h);
for (const [i, name] of [[a, 'ref-start.png'], [b, 'ref-end.png']])
  execFileSync(FF, ['-v', 'error', '-y', '-i', V, '-vf', `select=eq(n\\,${i}),crop=${CROP},pad=${side}:${side}:(ow-iw)/2:(oh-ih)/2:white`, '-frames:v', '1', path.join(OUT, name)]);
console.log(`${n} frames; start pose = frame ${a}, end pose = frame ${b}; written to ${OUT}`);
