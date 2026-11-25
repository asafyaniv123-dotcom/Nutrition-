// "+ אדם חדש" becomes "אדם חדש" (25 Nov): the plus is drawn on the porcelain pebble now, not written into the
// sentence. Every language's answer moves to the new key with its leading "+" taken off, and the old key goes.
// usage: node tools/patches/lang-q-proc-person.mjs
import fs from 'node:fs';
const OLD = '+ אדם חדש', NEW = 'אדם חדש';
const files = fs.readdirSync('data/lang').filter((f) => /^[a-z].*\.json$/.test(f)).map((f) => 'data/lang/' + f).concat(['data/he-f.json', 'data/he-x.json']);
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (!(OLD in j)) continue;
  j[NEW] = String(j[OLD]).replace(/^\s*[+＋]\s*/, '');
  delete j[OLD];
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n');
  console.log(f, '->', j[NEW]);
}
