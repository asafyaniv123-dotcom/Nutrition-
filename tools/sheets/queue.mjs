// The order Asaf works through the exercise animations in (6 Nov): one muscle group at a time, and inside a
// group by equipment - bodyweight first, then dumbbells, kettlebell, barbells, cable, machines, the rest.
// An exercise belongs to the group of its FIRST muscle, so each one is asked for exactly once.
// node tools/sheets/queue.mjs           - the whole queue, what is done and what is next
// node tools/sheets/queue.mjs --next    - only the next exercise to ask him for
import fs from 'fs';
const ROOT = new URL('../../', import.meta.url);
const lib = JSON.parse(fs.readFileSync(new URL('data/exercises.json', ROOT), 'utf8')).exercises;
const prog = JSON.parse(fs.readFileSync(new URL('exercise-sheets/progress.json', ROOT), 'utf8'));
/* the muscle groups in the order he will see them; a group not listed here goes last */
const GROUPS = ['חזה', 'גב רחב', 'גב', 'כתפיים', 'יד קדמית', 'יד אחורית', 'אמה', 'טרפז', 'ארבע ראשי', 'ירך אחורית',
  'ישבן', 'מקרבים', 'מרחיקים', 'תאומים', 'בטן', 'אלכסונים', 'גב תחתון', 'אירובי'];
/* equipment rank: the first piece of the exercise that is not a bench, a mat or a step decides */
/* a pull-up bar is bodyweight work, so it sits right after bodyweight */
const KIT = ['משקל גוף', 'מתח', 'משקולות יד', 'קטלבל', 'מוט', 'מוט EZ', 'מוט טרפז', 'פלטה', 'פולי', 'מכונה', 'סמית׳', 'גומייה', 'כדור פיזיו', 'מכשיר אירובי'];
const SUPPORT = ['ספסל', 'מזרן', 'מדרגה'];
const kitOf = (e) => (e.q || []).find((q) => !SUPPORT.includes(q)) || 'משקל גוף';
const rank = (k) => { const i = KIT.indexOf(k); return i < 0 ? KIT.length : i; };
const st = (e) => (prog[e.id] && prog[e.id].status === 'done') ? 'done' : 'todo';
const groups = new Map(GROUPS.map((g) => [g, []]));
for (const e of lib) { const g = (e.m && e.m[0]) || 'אחר'; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(e); }
const queue = [];
for (const [g, list] of groups) {
  list.sort((a, b) => rank(kitOf(a)) - rank(kitOf(b)) || lib.indexOf(a) - lib.indexOf(b));
  for (const e of list) queue.push({ group: g, kit: kitOf(e), e });
}
const next = queue.find((q) => st(q.e) === 'todo');
if (process.argv.includes('--next')) {
  console.log(next ? `${next.e.id} | ${next.e.n} | ${next.e.en} | ${next.group} | ${next.kit}` : 'done');
} else {
  let g = '';
  for (const q of queue) {
    if (q.group !== g) { g = q.group; const l = queue.filter((x) => x.group === g); console.log(`\n== ${g}  (${l.filter((x) => st(x.e) === 'done').length}/${l.length})`); }
    console.log(`${st(q.e) === 'done' ? 'v' : ' '} ${q.e.id.padEnd(5)} ${q.kit.padEnd(12)} ${q.e.n} | ${q.e.en}${q === next ? '   <- next' : ''}`);
  }
}
