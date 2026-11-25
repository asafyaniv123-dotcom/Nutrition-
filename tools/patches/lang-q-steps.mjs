// צעדים (25 Nov): the rough count on a pebble, "about {n}" - the number is a hole, so each reader gets their own
// digits and separators. Capitalised like the "More" beside it. usage: node tools/patches/lang-q-steps.mjs
import fs from 'node:fs';
const T = { 'בערך {n}': { en: 'About {n}', de: 'Etwa {n}', es: 'Unos {n}', ja: '約{n}', fr: 'Environ {n}', it: 'Circa {n}', pt: 'Cerca de {n}', 'zh-Hans': '约{n}', 'zh-Hant': '約{n}', ar: 'حوالي {n}' } };
const L = ['en', 'de', 'es', 'ja', 'fr', 'it', 'pt', 'zh-Hans', 'zh-Hant', 'ar'];
for (const l of L) {
  const f = 'data/lang/' + l + '.json', j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const k in T) { if (!T[k][l]) throw new Error(l + ' ' + k); j[k] = T[k][l]; }
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n');
}
console.log('answered', Object.keys(T).length, 'key in', L.length);
