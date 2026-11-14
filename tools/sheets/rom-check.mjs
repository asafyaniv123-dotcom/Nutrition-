// node tools/sheets/rom-check.mjs <ours.json> <ref.json> [min=0.6] - Active-ROM Delta Gate (Asaf, 14 Nov, after x54): did the ACTIVE limb and the
//   equipment travel at least min (60%) of the way the reference travels between frame 1 and frame 2? Frame 2 is not shown otherwise.
//   Each json, read off a grid of that pair (gridimg.mjs), in that picture's own pixels:
//     { "scale": 575,                                   // one fixed length in the same picture: the figure's height, or shin, to compare sizes
//       "points": { "hand": [[x,y],[x,y]], "elbow": [[x,y],[x,y]] },          // start -> end of each active joint
//       "angles": { "bar": [[x1,y1,x2,y2],[x1,y1,x2,y2]] } }                 // start segment -> end segment (degrees)
//   Every key of ref.json must be in ours.json. A joint our frame hides (null) cannot be measured and FAILS: if the elbow is behind the
//   torso, nobody can see it travel either.
import fs from 'node:fs';
const [O, R, ...OPT] = process.argv.slice(2);
if (!R) { console.log('usage: rom-check.mjs <ours.json> <ref.json> [min=0.6]'); process.exit(2); }
const MIN = +((OPT.find((o) => o.startsWith('min=')) || 'min=0.6').slice(4));
const ours = JSON.parse(fs.readFileSync(O, 'utf8')), ref = JSON.parse(fs.readFileSync(R, 'utf8'));
const dist = ([[a, b], [c, d]], s) => Math.hypot(c - a, d - b) / s;
const ang = ([x1, y1, x2, y2]) => Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
const dAng = ([s, e]) => { let d = Math.abs(ang(e) - ang(s)) % 360; return d > 180 ? 360 - d : d; };
let bad = 0;
const row = (name, o, r, unit) => {
  const ratio = o == null ? 0 : o / r, ok = o != null && ratio >= MIN; if (!ok) bad++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(10)} ours ${o == null ? 'hidden' : o.toFixed(unit === 'deg' ? 1 : 3)} ref ${r.toFixed(unit === 'deg' ? 1 : 3)} ${unit} -> ${(ratio * 100).toFixed(0)}% of the reference`);
};
for (const [k, v] of Object.entries(ref.points || {})) row(k, ours.points?.[k] ? dist(ours.points[k], ours.scale) : null, dist(v, ref.scale), 'x height');
for (const [k, v] of Object.entries(ref.angles || {})) row(k, ours.angles?.[k] ? dAng(ours.angles[k]) : null, dAng(v), 'deg');
console.log(bad ? `FAIL: ${bad} active part(s) under ${MIN * 100}% of the reference range - do not show this frame` : `PASS: every active part at least ${MIN * 100}% of the reference range`);
process.exit(bad ? 1 : 0);
