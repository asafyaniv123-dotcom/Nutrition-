// node tools/sheets/demo-of-scan.mjs [index.html] [exercises.json] - every EX_DEMO_OF link, the exercise beside the loop it borrows:
//   name, equipment (q), and whether the borrowed loop is actually what plays (an exercise with its own EX_DEMO entry plays its own).
//   Flags a link where the equipment differs, so a "barbell lunge" never plays a bodyweight lunge (Asaf, 20 Nov). Exits 1 on any.
import fs from 'node:fs';
const H = process.argv[2] || 'dev/index.html', X = process.argv[3] || 'data/exercises.json';
const src = fs.readFileSync(H, 'utf8');
const lit = (name) => {
  const m = src.match(new RegExp('var ' + name + '=\\{([\\s\\S]*?)\\};'));
  if (!m) throw new Error(name + ' not found');
  const body = m[1].replace(/\/\*[\s\S]*?\*\//g, '');
  const o = {};
  for (const p of body.matchAll(/(x\d+)\s*:\s*('?)(x?\d+)\2/g)) o[p[1]] = p[2] ? p[3] : +p[3];
  return o;
};
const DEMO = lit('EX_DEMO'), OF = lit('EX_DEMO_OF');
const EX = Object.fromEntries(JSON.parse(fs.readFileSync(X, 'utf8')).exercises.map((e) => [e.id, e]));
const eq = (e) => (e.q || []).slice().sort().join('+') || '(גוף)';
const rows = [];
for (const [k, s] of Object.entries(OF)) {
  const a = EX[k], b = EX[s];
  const own = !!DEMO[k], live = !!DEMO[s];
  const same = a && b && eq(a) === eq(b);
  rows.push({ k, s, a, b, own, live, same });
}
let bad = 0;
for (const r of rows) {
  const flag = r.own ? 'OWN ' : !r.live ? 'DEAD' : r.same ? 'ok  ' : 'EQ≠ ';
  if (flag === 'EQ≠ ') bad++;
  console.log(`${flag} ${r.k.padEnd(5)} ${(r.a?.en || '?').padEnd(36)} [${r.a ? eq(r.a) : '?'}]  ->  ${r.s.padEnd(5)} ${(r.b?.en || '?').padEnd(32)} [${r.b ? eq(r.b) : '?'}]`);
}
console.log(`${rows.length} links: ${rows.filter((r) => r.own).length} have their own loop, ${rows.filter((r) => !r.own && !r.live).length} borrow a loop that does not exist, ${bad} with different equipment`);
process.exit(bad ? 1 : 0);
