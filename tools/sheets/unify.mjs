// Every demo in the 3 Nov figure (Asaf, 9 Nov: "everything not in the exact style of this figure - change it").
// node tools/sheets/unify.mjs list                -> writes exercise-sheets/UNIFY.md from the 80 ids and their status
// node tools/sheets/unify.mjs prep <outDir> id... -> for each id: <outDir>/<id>/guide.png (our approved start | end) and a
//                                                    prompt line (figure ref, muscle) in <outDir>/prompts.json
// The poses, equipment, range and camera come from frames Asaf already approved, so only the figure changes.
import fs from 'fs'; import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
const R = 'C:/Projects/Nutrition-/';
const FF = path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const IDS = 'x10 x112 x7 x103 x124 x19 x244 x245 x100 x128 x145 x246 x219 x190 x248 x223 x247 x20 x4 x240 x142 x150 x102 x237 x86 x114 x249 x251 x165 x252 x187 x253 x254 x199 x69 x76 x51 x42 x40 x12 x39 x88 x109 x94 x206 x198 x68 x129 x259 x55 x85 x2 x26 x61 x95 x104 x79 x123 x108 x13 x24 x236 x6 x84 x115 x67 x82 x74 x17 x53 x44 x183 x130 x164 x78 x140 x153 x238 x48 x239'.split(' ');
const MUSCLE = { 'יד אחורית': 'triceps', 'חזה': 'chest', 'כתפיים': 'shoulders', 'גב תחתון': 'lower back', 'גב': 'upper back', 'בטן': 'abs', 'ארבע ראשי': 'quadriceps', 'ישבן': 'glutes', 'ירך אחורית': 'hamstrings', 'יד קדמית': 'biceps', 'אירובי': 'legs', 'אלכסונים': 'obliques', 'גב רחב': 'lats', 'טרפז': 'trapezius', 'אמה': 'forearms' };
const ex = JSON.parse(fs.readFileSync(R + 'data/exercises.json', 'utf8'));
const by = Object.fromEntries((Array.isArray(ex) ? ex : ex.exercises || Object.values(ex)).map((e) => [e.id, e]));
const prog = JSON.parse(fs.readFileSync(R + 'exercise-sheets/progress.json', 'utf8'));
const frames = (id) => { const q = prog[id]; return R + 'exercise-sheets/' + q.dir + (q.tries ? '/' + q.tries[0].d : '') + '/'; };
const pose = (e) => { const n = (e.en || '').toLowerCase();
  if (/bench|lying|floor|crunch|plank|skull|leg raise|fly|pullover|bridge|thrust|sit up|dead bug|hollow|bird|superman|cobra/.test(n) && !/seated|step/.test(n)) return 'bench';
  if (/seated|machine|preacher|pulldown|row machine|leg press|leg extension|calf raise seated|concentration/.test(n)) return 'seated';
  return 'stand'; };
const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'list') {
  const md = ['# איחוד הדמויות לדמות של 3.11 (+ זוהר עדין לשריר העובד)', '', 'אסף, 9.11: "כל מה שהוא לא בסגנון המדויק של הדמות הזאת לשנות". הסטטוס מתעדכן אחרי כל סבב; ההדגמה הישנה נשארת ב-dev עד שהחדשה מאושרת.', '', '| # | תרגיל | סטטוס |', '|---|---|---|'];
  IDS.forEach((id, i) => md.push(`| ${i + 1} | ${id} ${by[id].n} | ${(prog[id] && prog[id].unify) || 'ממתין'} |`));
  fs.writeFileSync(R + 'exercise-sheets/UNIFY.md', md.join('\n') + '\n');
  console.log(IDS.length, 'listed');
} else if (cmd === 'prep') {
  const [out, ...ids] = rest; const prompts = {};
  for (const id of ids) {
    const d = frames(id); fs.mkdirSync(path.join(out, id), { recursive: true });
    execFileSync(FF, ['-v', 'error', '-y', '-i', d + 'start.jpg', '-i', d + 'end.jpg', '-filter_complex', '[0]scale=1152:1152[a];[1]scale=1152:1152[b];[a][b]hstack', path.join(out, id, 'guide.png')]);
    const e = by[id]; prompts[id] = { name: e.en, ref: pose(e), muscle: MUSCLE[(e.m || [])[0]] || 'working muscles' };
  }
  fs.writeFileSync(path.join(out, 'prompts.json'), JSON.stringify(prompts, null, 1));
  console.log(JSON.stringify(prompts));
} else console.log('usage: list | prep <outDir> id...');
