// Build one exercise sheet (exercise-sheets/<id>-<slug>/) from its research file and its production
// record - for exercises made without a mannequin, which is all of them after round 3 (5 Nov).
// node tools/sheets/build.mjs <research.json> <production.json>
//
// production.json: { slug, start_png, end_png, clip_mp4, start_job, end_job, video_job,
//   prompts: {start, end, video}, trim: {from_frame, slow} | null, fixes: [], rejected: [], open: [] }
// trim cuts a clip that did more than one rep down to its last rep (Seedance often does two),
// slowed so the rep keeps a controlled pace. The sheet's frames and clip are what the check passed.
import fs from 'fs'; import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const [RES, PROD] = process.argv.slice(2);
const R = JSON.parse(fs.readFileSync(RES, 'utf8')), P = JSON.parse(fs.readFileSync(PROD, 'utf8'));
/* the round-3 sheets are a draft since 6 Nov (Asaf: start over - two frames, his approval, a GIF; see gif.mjs) */
const ROOT = new URL('../../drafts/exercise-sheets-v1/', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const L = JSON.parse(fs.readFileSync(path.join(ROOT, '../../data/exercises.json'), 'utf8')).exercises.find((e) => e.id === R.id);
if (!L) throw new Error('no library entry for ' + R.id);
const FF = process.env.FFMPEG || path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const ff = (a) => execFileSync(FF, ['-v', 'error', '-y', ...a]);
const dir = `${R.id}-${P.slug}`, D = path.join(ROOT, dir); fs.mkdirSync(D, { recursive: true });
ff(['-i', P.start_png, '-vf', 'scale=768:-1', '-q:v', '4', path.join(D, 'start.jpg')]);
ff(['-i', P.end_png, '-vf', 'scale=768:-1', '-q:v', '4', path.join(D, 'end.jpg')]);
let clip = P.clip_mp4;
if (P.trim) { clip = path.join(os.tmpdir(), `trim-${R.id}.mp4`); /* past about 1.6x, repeated frames stutter, so new frames are interpolated in between */
ff(['-i', P.clip_mp4, '-vf', `trim=start_frame=${P.trim.from_frame},setpts=${P.trim.slow || 1.4}*(PTS-STARTPTS)` + ((P.trim.slow || 1.4) > 1.6 ? ',minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1' : ',fps=24'), '-an', '-c:v', 'libx264', '-crf', '18', clip]); }
ff(['-i', clip, '-filter_complex', '[0:v]scale=540:540,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0,format=yuv420p', '-an', '-c:v', 'libx264', '-crf', '26', '-preset', 'slow', '-movflags', '+faststart', path.join(D, 'loop.mp4')]);
const sheet = {
  id: R.id, slug: P.slug, name: { he: L.n, en: L.en }, muscle: L.m, equipment: L.q,
  status: 'סרטון מוכן, מחכה לאישור', start: R.keyframes.start.text, end: R.keyframes.end.text,
  keyframes: R.keyframes, camera: R.camera, still: R.still, moves: R.moves, setup: R.setup, cues: R.cues, mistakes: R.mistakes,
  tempo: R.tempo, breathing: R.breathing, muscles_secondary: R.muscles_secondary, variations: R.variations, safety: R.safety,
  spec: [], open: P.open || [], disagreements: R.disagreements || [], app_text_conflicts: R.app_text_conflicts || [], sources: R.sources,
  files: { start: 'start.jpg', end: 'end.jpg', poseStart: null, poseEnd: null, loop: 'loop.mp4' },
  production: { higgsfield_project: 'Olimei – אנימציות תרגילים', mannequin: null,
    frames: { model: 'gpt_image_2_5 medium 1:1', start_job: P.start_job, end_job: P.end_job, style_ref: '0737425a-3bde-466b-bbb5-279671a67d7e', start_prompt: P.prompts.start, end_prompt: P.prompts.end },
    video: { model: 'seedance_2_0 fast 480p 4s silent 1:1, start_image + end_image; loop = clip + reverse', job: P.video_job, prompt: P.prompts.video, trim: P.trim || null, rejected: P.rejected || [] },
    fixes: P.fixes || [] } };
fs.writeFileSync(path.join(D, 'sheet.json'), JSON.stringify(sheet, null, 1) + '\n');
const list = path.join(ROOT, 'sheets.json'), dirs = JSON.parse(fs.readFileSync(list, 'utf8'));
if (!dirs.includes(dir)) { dirs.push(dir); fs.writeFileSync(list, JSON.stringify(dirs, null, 1) + '\n'); }
console.log(dir, fs.readdirSync(D).join(' '));
