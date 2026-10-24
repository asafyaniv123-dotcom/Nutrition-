/* "ספר שמישהו המליץ עליו?" opens with ספר, which find-masculine-left reads as
   the imperative "tell". Said without the word, in every file. */
import fs from 'fs';
const OLD = 'ספר שמישהו המליץ עליו? כתוב אותו כאן כדי שלא ילך לאיבוד.';
const NEW = 'מישהו המליץ לך על משהו לקרוא? כתוב אותו כאן כדי שלא ילך לאיבוד.';
let s = fs.readFileSync('dev/index.html', 'utf8');
if (s.split(OLD).length !== 2) { console.log('anchor'); process.exit(1); }
fs.writeFileSync('dev/index.html', s.replace(OLD, NEW));
for (const f of fs.readdirSync('data/lang').filter(f => f.endsWith('.json') && !f.startsWith('_')).map(f => 'data/lang/' + f)) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (OLD in d) { d[NEW] = d[OLD]; delete d[OLD]; fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); }
}
const fix = (f, v) => { const d = JSON.parse(fs.readFileSync(f, 'utf8')); delete d[OLD]; d[NEW] = v; fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); };
fix('data/he-f.json', 'מישהו המליץ לך על משהו לקרוא? כתבי אותו כאן כדי שלא ילך לאיבוד.');
fix('data/he-x.json', 'מישהו המליץ לכם על משהו לקרוא? כתבו אותו כאן כדי שלא ילך לאיבוד.');
console.log('ok');
