// "Go deeper" renamed and moved up (27 Nov): one new key, two retired.
// להעמיק is an infinitive, so Hebrew needs no feminine or plural form; the
// card no longer has a "שאלה לעומק" heading (it names the topic instead).
// Arabic gets a noun phrase rather than an imperative, which would mark gender.
import fs from 'fs';
const NEW = {
  en: 'Go deeper', de: 'Tiefer gehen', es: 'Profundizar', fr: 'Approfondir', it: 'Approfondire',
  pt: 'Aprofundar', ja: 'もっと深く', 'zh-Hans': '深入一点', 'zh-Hant': '深入一點', ar: 'سؤال أعمق',
};
// 'התובנה שלך' went with the porcelain writing screen (ins-porcelain.mjs): the ruled well needs no label
const GONE = ['חפור עמוק יותר', 'שאלה לעומק', 'התובנה שלך'];
for (const [lang, v] of Object.entries(NEW)) {
  const f = 'data/lang/' + lang + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const k of GONE) delete d[k];
  d['להעמיק'] = v;
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
for (const f of ['data/he-f.json', 'data/he-x.json']) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const k of GONE) delete d[k];
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('done');
