// node tools/sheets/rom-check.mjs <ours.json> <ref.json> [min=0.6] [tol=0.10] - Active-ROM Delta Gate (Asaf, 14 Nov, after x54): did the ACTIVE limb and the
//   equipment travel at least min (60%) of the way the reference travels between frame 1 and frame 2? Frame 2 is not shown otherwise.
//   Each json, read off a grid of that pair (gridimg.mjs), in that picture's own pixels:
//     { "scale": 575,                                   // one fixed length in the same picture: the figure's height, or shin, to compare sizes
//       "points": { "hand": [[x,y],[x,y]], "elbow": [[x,y],[x,y]] },          // start -> end of each active joint
//       "angles": { "bar": [[x1,y1,x2,y2],[x1,y1,x2,y2]] },                  // start segment -> end segment (degrees)
//       "ends": { "foot": { "anchor": [[x,y],[x,y]], "joint": [[x,y],[x,y]] } } }  // start -> end of a FROZEN anchor and of an active joint
//   Every key of ref.json must be in ours.json. A joint our frame hides (null) cannot be measured and FAILS: if the elbow is behind the
//   torso, nobody can see it travel either.
//   Travel alone passed x170 (15 Nov): the knees closed 71% of the way, but the legs came in pointing at the camera with the feet tucked
//   under the seat, where the reference has them out in front. So two more questions, both against the reference:
//   - "points": the travel must also go the same WAY - within 45 degrees of the reference's direction, or it FAILS.
//   - "ends": where the joint ENDS, measured from a frozen anchor of the same body (the seat, the shoulder) and divided by scale, must land
//     within tol (0.10 of the scale) of where the reference's joint ends from its anchor. The start is checked the same way, so a frame 1
//     that already disagreed is named rather than blamed on frame 2.
import fs from 'node:fs';
const [O, R, ...OPT] = process.argv.slice(2);
if (!R) { console.log('usage: rom-check.mjs <ours.json> <ref.json> [min=0.6] [tol=0.10]'); process.exit(2); }
const opt = (k, d) => +((OPT.find((o) => o.startsWith(k + '=')) || `${k}=${d}`).slice(k.length + 1));
const MIN = opt('min', 0.6), TOL = opt('tol', 0.1);
const ours = JSON.parse(fs.readFileSync(O, 'utf8')), ref = JSON.parse(fs.readFileSync(R, 'utf8'));
const dist = ([[a, b], [c, d]], s) => Math.hypot(c - a, d - b) / s;
const ang = ([x1, y1, x2, y2]) => Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
const dAng = ([s, e]) => { let d = Math.abs(ang(e) - ang(s)) % 360; return d > 180 ? 360 - d : d; };
const between = (a, b) => { let d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
let bad = 0;
const row = (name, o, r, unit) => {
  const ratio = o == null ? 0 : o / r, ok = o != null && ratio >= MIN; if (!ok) bad++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(10)} ours ${o == null ? 'hidden' : o.toFixed(unit === 'deg' ? 1 : 3)} ref ${r.toFixed(unit === 'deg' ? 1 : 3)} ${unit} -> ${(ratio * 100).toFixed(0)}% of the reference`);
};
for (const [k, v] of Object.entries(ref.points || {})) {
  const o = ours.points?.[k];
  row(k, o ? dist(o, ours.scale) : null, dist(v, ref.scale), 'x height');
  if (!o || dist(o, ours.scale) < 0.02 || dist(v, ref.scale) < 0.02) continue; // a direction of almost no travel is noise
  const d = between(ang([...o[0], ...o[1]]), ang([...v[0], ...v[1]])), ok = d <= 45; if (!ok) bad++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${(k + ' way').padEnd(10)} travels ${d.toFixed(0)} deg off the reference's direction (max 45)`);
}
for (const [k, v] of Object.entries(ref.angles || {})) row(k, ours.angles?.[k] ? dAng(ours.angles[k]) : null, dAng(v), 'deg');
for (const [k, v] of Object.entries(ref.ends || {})) {
  const o = ours.ends?.[k];
  for (const [i, when] of [[0, 'start'], [1, 'end']]) {
    if (!o) { bad++; console.log(`FAIL ${(k + ' ' + when).padEnd(10)} hidden in our frame`); continue; }
    const rel = (e, s) => [(e.joint[i][0] - e.anchor[i][0]) / s, (e.joint[i][1] - e.anchor[i][1]) / s];
    const [ox, oy] = rel(o, ours.scale), [rx, ry] = rel(v, ref.scale), d = Math.hypot(ox - rx, oy - ry), ok = d <= TOL; if (!ok) bad++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${(k + ' ' + when).padEnd(10)} lands ${d.toFixed(3)} x height from where the reference's lands (ours ${ox.toFixed(2)},${oy.toFixed(2)} ref ${rx.toFixed(2)},${ry.toFixed(2)}; max ${TOL})`);
  }
}
console.log(bad ? `FAIL: ${bad} check(s) - the active part travels too little, the wrong way, or ends somewhere the reference does not - do not show this frame` : `PASS: every active part travels at least ${MIN * 100}% of the reference, the same way, and ends where it ends`);
process.exit(bad ? 1 : 0);
