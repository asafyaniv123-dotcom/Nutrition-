// node tools/patches/gt-lang-stale.mjs - "בנה לי אימון" was the generator's one button; ON THE CLOCK (20 Nov) replaced it with two, so the
//   key is asked for nowhere and build-lang-template --check fails on it. Removes it from every language file, nothing else.
import fs from 'node:fs';
const K = 'בנה לי אימון', D = 'C:/Projects/Nutrition-/data/lang';
for (const f of fs.readdirSync(D).filter((x) => x.endsWith('.json') && x !== '_template.json')) {
  const raw = fs.readFileSync(`${D}/${f}`, 'utf8'), j = JSON.parse(raw);
  if (!(K in j)) continue;
  // remove the line itself, so the rest of the file stays byte for byte as it was
  const lines = raw.split('\n'), i = lines.findIndex((l) => l.startsWith('  ' + JSON.stringify(K) + ':'));
  if (i < 0) throw new Error('line not found in ' + f);
  if (!lines[i].endsWith(',')) { lines[i - 1] = lines[i - 1].replace(/,$/, ''); }
  lines.splice(i, 1);
  const out = lines.join('\n'); const j2 = JSON.parse(out);
  if (K in j2 || Object.keys(j2).length !== Object.keys(j).length - 1) throw new Error('bad removal in ' + f);
  fs.writeFileSync(`${D}/${f}`, out); console.log(f, 'removed');
}
