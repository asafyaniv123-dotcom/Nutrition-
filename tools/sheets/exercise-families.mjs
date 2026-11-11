// The parent-variant view of data/exercises.json (Asaf, 11 Nov), in the shape he asked for: one entry per movement
// family, its primary and secondary muscles, and every variant with its id, name, equipment tag and difficulty.
// The families and the rules live in tools/exercise-families-data.mjs and reach the data through build-exercises;
// this only reads the built file. node tools/sheets/exercise-families.mjs [out=exercise-sheets/exercise-families.json]
import fs from 'fs';
const out = process.argv[2] || 'exercise-sheets/exercise-families.json';
const d = JSON.parse(fs.readFileSync('data/exercises.json', 'utf8'));
const EQ_NAME = { 'סמית׳': "סמית' מאשין" };   // his spelling of the tag
const res = Object.entries(d.families).map(([k, f]) => ({ parent_exercise: k, primary_muscle: f.m, secondary_muscles: f.m2,
  variants: d.exercises.filter(e => e.f === k).map(e => ({ id: e.id, name: e.n, equipment: EQ_NAME[e.eqt] || e.eqt, difficulty: e.lv })) }));
const n = res.reduce((a, f) => a + f.variants.length, 0);
if (n !== d.exercises.length) throw Error(n + ' variants for ' + d.exercises.length + ' exercises');
fs.writeFileSync(out, JSON.stringify(res, null, 2) + '\n');
const compact = '[\n' + res.map(f => `  {"parent_exercise":${JSON.stringify(f.parent_exercise)},"primary_muscle":${JSON.stringify(f.primary_muscle)},"secondary_muscles":${JSON.stringify(f.secondary_muscles)},"variants":[\n` +
  f.variants.map(v => '    ' + JSON.stringify(v)).join(',\n') + '\n  ]}').join(',\n') + '\n]\n';
fs.writeFileSync(out.replace(/\.json$/, '.compact.json'), compact);
console.log(res.length, 'parents,', n, 'variants');
