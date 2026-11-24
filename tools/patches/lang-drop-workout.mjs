// The four answers the evening workout question left behind when it stopped being asked (24 Nov). build-lang-template --check
// fails on an answer nothing asks for, so they go from every language, and from he-f/he-x if present.
// usage: node tools/patches/lang-drop-workout.mjs
import fs from 'node:fs';
const K = ['האימון', 'יצא לך?', 'היום היה מתוכנן אימון. יצא לך?', 'היום היה מתוכנן {what}. יצא לך?'];
const files = fs.readdirSync('data/lang').filter((f) => /^[a-z].*\.json$/.test(f) && f !== 'README.md').map((f) => 'data/lang/' + f).concat(['data/he-f.json', 'data/he-x.json']);
let n = 0;
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  let hit = false;
  for (const k of K) if (k in j) { delete j[k]; hit = true; n++; }
  if (hit) fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n');
}
console.log('removed', n);
