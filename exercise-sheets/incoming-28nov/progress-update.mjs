// node exercise-sheets/incoming-28nov/progress-update.mjs - records the 28 Nov frame-1 batch in progress.json (stage-a: frame 1 only, no dir,
//   so it stays off review.html and out of the gate). Asserts the file round-trips byte for byte before touching it.
import fs from 'node:fs';
const F = 'exercise-sheets/progress.json';
const raw = fs.readFileSync(F, 'utf8');
const P = JSON.parse(raw);
const nl = raw.includes('\r\n') ? '\r\n' : '\n'; // core.autocrlf checks it out CRLF
const ser = (o) => (JSON.stringify(o, null, 2) + (raw.endsWith('\n') ? '\n' : '')).replace(/\n/g, nl);
if (ser(P) !== raw) throw new Error('progress.json does not round-trip - not touching it');
const D = '2026-11-28';
const par = (id) => fs.readFileSync(`exercise-sheets/${id}/parity/result.txt`, 'utf8').trim().split('\n').filter((l) => l.startsWith('FAIL ')).map((l) => l.replace(/\s+/g, ' ').replace(/ x height.*$/, '')).join(', ');
const A = {
  x345: ['Stability Ball Pike', '6a8c2bde-804e-4696-b0d9-0fd2acf52430', '9ec6357f6c2e', 'pose-parity PASS (all within 0.034)', 'hue+3 sat0.8 levels0.88'],
  x346: ['Curtsy Step Down', '52056d65-6a1d-48f9-a54c-750f7989fae5', '94b67004a6cf', null, 'hue+3 sat0.8 levels0.9 + gblur 1.2 (grain)'],
  x347: ['Single Leg Abducted Romanian Deadlift', 'ad287d76-1153-4c86-a996-0396aaf0a9b0', '465ca47baafa', null, 'hue+3 sat0.8 levels0.9 + gblur 1.2 (grain)'],
  x161: ['Single Leg Hip Thrust', 'ae37ef55-9a55-43bc-b940-a2ca8142a125', '626580e5ac6a', null, 'tone-fit'],
  x348: ['Bear Plank Hover', 'c7b8d2e1-2e45-41e5-856e-2e5d37603847', '6c3399f6aea6', null, 'tone-fit'],
  x349: ['Wall Ball Isometric Hip Flexion', '491a0aa4-7814-417a-90c3-9a7f0d00c89f', '35f5e9c00742', 'pose-parity PASS (all within 0.072)', 'tone-fit'],
  x351: ['Knee Jump to Squat', 'baaf4a9c-a5ea-4253-ac1b-205b4d15a025', 'a04f04514594', 'pose-parity PASS (all within 0.078)', 'tone-fit'],
  x352: ['Barbell Knee Jump to Squat', '64ab8a9e-cc29-49e5-96d4-faca8d102789', '5e1dcc2e8d24', null, 'tone-fit'],
};
const HOLD = { x348: 1, x349: 1 };
for (const [id, [name, job, sha, pass, tone]] of Object.entries(A)) {
  const was = P[id];
  const note = `28 Nov: frame 1 in the batch of 8 Asaf approved by name (1 credit); ref-gate PASS ${sha}; limbs 2+2; tone PASS after free fix (${tone}); ` +
    (pass || `pose-parity FAIL: ${par(id)} - marked "לא לאישור" on incoming-28nov/review-frame1.html, regenerating waits for his yes`) +
    (HOLD[id] ? '; a hold: frame 1 only, static loop' : '') + (id === 'x351' || id === 'x352' ? '; three stages at his word: kneel > land in squat > top of the jump (ref-top.png)' : '') +
    (id === 'x161' ? '; new refs 5506/5507 with the band above the knees (old 17 Nov refs in x161/old-17nov)' : '');
  P[id] = { id, name, status: 'stage-a', start_job: job, credits: 1, date: D, note: was && was.note ? note + ' | ' + was.note : note };
}
P.x350 = { id: 'x350', name: 'Wedge Split Squat Hold', status: 'stage-a', credits: 0, date: D,
  note: '28 Nov: approved by Asaf as a hold, the caption "effective" to be removed; NOT generated - it was not in the 8-credit list; refs in x350/' };
fs.writeFileSync(F, ser(P));
console.log('progress.json:', Object.keys(A).concat('x350').join(' '));
