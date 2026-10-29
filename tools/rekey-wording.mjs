/* Items 10-60 of tools/hebrew-wording-audit.md, approved by Asaf on 29 Oct:
 * "השינויים שהצעת מצויינים". The pairs are read from the audit itself (key
 * and proposed, byte for byte), so nothing is retyped here.
 *
 *   node tools/rekey-wording.mjs --list   # the pairs, and which he-f/he-x carry them
 *   node tools/rekey-wording.mjs          # apply: dev/index.html + every language file
 *
 * The translations meant the right thing all along, so their values stay
 * under the new key. he-f / he-x are Hebrew and must say the new wording in
 * their own address - those values come from GENDERED below, written by hand. */
import fs from 'fs';
import { GENDERED } from './rekey-wording-gendered.mjs';

const md = fs.readFileSync('tools/hebrew-wording-audit.md', 'utf8');
const P = [];
let item = 0;
for (const block of md.split(/\n## /).slice(1)) {
  item = parseInt(block, 10);
  if (!(item >= 10 && item <= 60)) continue;
  const re = /- key: `([^`]+)`[\s\S]*?- proposed: `([^`]+)`/g;
  let m;
  while ((m = re.exec(block))) if (m[1] !== m[2]) P.push([m[1], m[2], item]);
}
const LANGS = ['en', 'de', 'fr', 'it', 'es', 'pt', 'ar', 'ja', 'zh-Hans', 'zh-Hant', '_template'];
const he = { f: JSON.parse(fs.readFileSync('data/he-f.json', 'utf8')), x: JSON.parse(fs.readFileSync('data/he-x.json', 'utf8')) };

if (process.argv.includes('--list')) {
  for (const [a, b, i] of P) {
    console.log(`${i}\t${a}\n\t-> ${b}`);
    for (const g of ['f', 'x']) if (a in he[g]) console.log(`\the-${g}: ${JSON.stringify(he[g][a])}`);
  }
  console.log(P.length + ' pairs');
  process.exit(0);
}

/* every pair must be found in the code, and every gendered value supplied */
let s = fs.readFileSync('dev/index.html', 'utf8'), bad = 0;
const esc = (t) => t.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
for (const [a, b, i] of P) {
  let c = 0;
  for (const q of ["'", '"']) { const x = q + esc(a) + q; const n = s.split(x).length - 1; c += n; s = s.split(x).join(q + esc(b) + q); }
  if (!c) { console.log(`NOT IN CODE (${i}): ${a}`); bad++; }
  for (const g of ['f', 'x']) if (a in he[g] && !(GENDERED[g] && b in GENDERED[g])) { console.log(`NO he-${g} VALUE (${i}): ${b}`); bad++; }
}
if (bad) { console.log(bad + ' problems - nothing written'); process.exit(1); }
fs.writeFileSync('dev/index.html', s);

for (const l of LANGS) {
  const f = `data/lang/${l}.json`, d = JSON.parse(fs.readFileSync(f, 'utf8')), o = {};
  for (const k in d) { const p = P.find((x) => x[0] === k); o[p ? p[1] : k] = d[k]; }
  fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\n');
}
for (const g of ['f', 'x']) {
  const f = `data/he-${g}.json`, d = he[g], o = {};
  for (const k in d) { const p = P.find((x) => x[0] === k); o[p ? p[1] : k] = p ? GENDERED[g][p[1]] : d[k]; }
  /* a new wording can address her where the old one did not ("תזכור") */
  let added = 0;
  for (const k in GENDERED[g]) if (!(k in o) && P.some((x) => x[1] === k)) { o[k] = GENDERED[g][k]; added++; }
  for (const k in GENDERED[g]) if (!P.some((x) => x[1] === k)) { console.log(`he-${g}: not a new key: ${k}`); }
  fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\n');
  console.log(`he-${g}: ${added} added`);
}
console.log(P.length + ' keys renamed');
