/* Runs the worker's MedlinePlus extraction - copied from the worker's own
   source at run time, so the test reads exactly what ships - against the
   live service for the seven conditions.
     node tools/test-medlineplus.mjs */
import fs from 'fs';
const src = fs.readFileSync('push-server/src/worker.js', 'utf8');
const a = src.indexOf("const doc = (x.match(");
const b = src.indexOf("if (doc[1]) {", a);
const body = src.slice(a, b);
const extract = new Function('x', body + '\nreturn { doc, pick, text };');
const HL = { mg: 'myasthenia gravis', dm: 'diabetes', bp: 'hypertension', ckd: 'chronic kidney disease', preg: 'pregnancy', op: 'osteoporosis' };
for (const id of Object.keys(HL)) {
  const r = await fetch('https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&retmax=1&term=' + encodeURIComponent(HL[id]));
  const { doc, pick, text } = extract(await r.text());
  const sum = text(pick('FullSummary'));
  console.log(id.padEnd(5), (text(pick('title')) || '-').padEnd(28), doc[1] || '-', sum.length, '|', sum.slice(0, 90).replace(/\n/g, ' / '));
}
