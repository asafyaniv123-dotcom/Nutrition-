// The ninth pair (25 Nov): the dial's totals no longer print "of 24 hours" under the numbers - the centre of the
// dial says it - so the key is no longer asked for. usage: node tools/patches/lang-q-timeline-clock.mjs
import fs from 'node:fs';
const L = ['en', 'de', 'es', 'ja', 'fr', 'it', 'pt', 'zh-Hans', 'zh-Hant', 'ar'];
const DROP = ['מתוך 24 שעות'];
for (const l of L) {
  const f = 'data/lang/' + l + '.json', j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const k of DROP) { if (!(k in j)) throw new Error(l + ' lacks ' + k); delete j[k]; }
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n');
}
console.log('dropped', DROP.length, 'from', L.length);
