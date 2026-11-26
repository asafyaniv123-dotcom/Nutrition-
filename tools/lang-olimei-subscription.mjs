/* The subscription screen's strings, in every shipped language (26 Nov 2026).
 * The answers live in tools/patches/olimei-subscription-lang.json, keyed by
 * the Hebrew and then by language; English was written first and the rest
 * from it. Brand names (Olimei, Olimei Pro, Mip, App Store) stay as they are.
 *   node tools/lang-olimei-subscription.mjs */
import fs from 'fs';
const L = ['en', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar'];
const T = JSON.parse(fs.readFileSync('tools/patches/olimei-subscription-lang.json', 'utf8'));
for (const l of L) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const k of Object.keys(T)) { if (!T[k][l]) throw new Error(l + ' has no answer for ' + k); d[k] = T[k][l]; }
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('ok', Object.keys(T).length, 'keys x', L.length);
