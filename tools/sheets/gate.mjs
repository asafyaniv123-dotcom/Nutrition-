// node tools/sheets/gate.mjs [id] - Refuses (exit 1) every exercise waiting for Asaf ("frames") whose shown try has no
// checks.json, or whose checks.json does not prove all eleven checks with numbers. Run before every commit to review.
// The skill already said "a failed check stops"; x185 went to the page anyway with its pelvis at 30 of his 64 degrees,
// because a rule in prose can be skipped and a refusal cannot (8 Nov). checks.json, next to anim.gif:
//   { "row": "<the method row in the skill's table>", "why": "<why that row: what moves furthest>",
//     "checks": { "1": {"his": "...", "ours": "...", "pass": true}, ... "11": {...} } }
// "his" and "ours" are the numbers measured (degrees, px, %), never a word like "ok". Only check 4 may pass with a
// small known offset, and then "note" says it - that is the one defect a try may be shown with (x254's hand).
import fs from 'fs'; import path from 'path';
const ROOT = process.env.GATE_ROOT || 'C:/Projects/Nutrition-/exercise-sheets';
const prog = JSON.parse(fs.readFileSync(path.join(ROOT, 'progress.json'), 'utf8'));
const only = process.argv[2];
const bad = [];
for (const [id, e] of Object.entries(prog)) {
  if (e.status !== 'frames' || (only && id !== only)) continue;
  const dir = path.join(ROOT, e.dir, e.tries ? e.tries[0].d : '');
  const f = path.join(dir, 'checks.json');
  if (!fs.existsSync(f)) { bad.push(`${id}: no checks.json in ${path.relative(ROOT, dir) || e.dir}`); continue; }
  let c; try { c = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (err) { bad.push(`${id}: checks.json does not parse`); continue; }
  if (!c.row || !c.why) bad.push(`${id}: no method row or no reason for it`);
  for (let n = 1; n <= 11; n++) {
    const k = c.checks?.[n];
    if (!k) { bad.push(`${id}: check ${n} missing`); continue; }
    if (k.pass !== true) bad.push(`${id}: check ${n} failed (his ${k.his}, ours ${k.ours}) - stop and ask in chat, not on the page`);
    // ours is always measured; his has a number only where we measure against him (pose, proportion, tone, range)
    if (!/\d/.test(String(k.ours ?? '')) || ([1, 3, 8, 11].includes(n) && !/\d/.test(String(k.his ?? ''))))
      bad.push(`${id}: check ${n} has no measured numbers`);
  }
}
if (bad.length) { console.log(bad.join('\n')); process.exit(1); }
console.log('gate: every waiting exercise proves its eleven checks' + (only ? ` (${only})` : ''));
