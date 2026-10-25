/* Two from testing the MedlinePlus lookup against the live service:
 *  - "high blood pressure" found "How to Prevent High Blood Pressure";
 *    "hypertension" finds the topic itself. And MedlinePlus has no sarcopenia
 *    topic: the nearest hit was spinal muscular atrophy, a different disease,
 *    so sarcopenia is not looked up at all - wrong reference is worse than
 *    none.
 *  - a summary's question headings ran into the next paragraph
 *    ("What is X?X is..."): an opening <p> is a line break too. */
import fs from 'fs';
const W = 'push-server/src/worker.js';
let w = fs.readFileSync(W, 'utf8');
const rep = (a, b) => { if (w.split(a).length !== 2) { console.log('ANCHOR', a.slice(0, 70)); process.exit(1); } w = w.replace(a, b); };
rep(`      for (const id of healthIds.slice(0, 3)) {
        const key = 'mlp:' + id;`, `      const MLP_TERM = { mg: 'myasthenia gravis', dm: 'diabetes', bp: 'hypertension', ckd: 'chronic kidney disease', preg: 'pregnancy', op: 'osteoporosis' };
      for (const id of healthIds.filter((x) => MLP_TERM[x]).slice(0, 3)) {
        const key = 'mlp2:' + id;`);
rep(`encodeURIComponent(HL[id]),`, `encodeURIComponent(MLP_TERM[id]),`);
rep(`.replace(/<\\/(p|li|h\\d)>/g, '\\n')`, `.replace(/<\\/?(p|li|h\\d)>/g, '\\n')`);
fs.writeFileSync(W, w);
/* the test asks the same terms */
const T = 'tools/test-medlineplus.mjs';
let t = fs.readFileSync(T, 'utf8');
t = t.replace(/const HL = \{[^\n]*\};/, "const HL = { mg: 'myasthenia gravis', dm: 'diabetes', bp: 'hypertension', ckd: 'chronic kidney disease', preg: 'pregnancy', op: 'osteoporosis' };");
fs.writeFileSync(T, t);
console.log('ok');
