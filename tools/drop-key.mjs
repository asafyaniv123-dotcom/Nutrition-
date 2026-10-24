/* Drop a key nothing asks for any more, from every language file.
     node tools/drop-key.mjs '<key>'
   First used for: 'סט {n}' was option F's set-card label; the rows that replaced the cards
   number the sets under a 'סט' heading instead, so nothing asks for it. */
import fs from 'fs';
const K = process.argv[2] || 'סט {n}';
for (const f of fs.readdirSync('data/lang').filter(f => f.endsWith('.json') && !f.startsWith('_')).map(f => 'data/lang/' + f)) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (K in d) { delete d[K]; fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); console.log('dropped from', f); }
}
