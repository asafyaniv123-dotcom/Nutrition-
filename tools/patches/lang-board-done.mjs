// the one string of rf-board-done.mjs, in every language and the plural Hebrew form.
// English first: the heading over what has already been answered today.
import fs from 'node:fs';
const K = 'מה כבר כתבת היום';
const T = { en: 'What you have written today', de: 'Was du heute schon geschrieben hast', es: 'Lo que ya escribiste hoy',
  ja: '今日すでに書いたこと', fr: 'Ce que tu as déjà écrit aujourd’hui', it: 'Quello che hai già scritto oggi',
  pt: 'O que você já escreveu hoje', 'zh-Hans': '今天已经写下的', 'zh-Hant': '今天已經寫下的', ar: 'ما كتبته اليوم' };
for (const l in T) { const f = `data/lang/${l}.json`, j = JSON.parse(fs.readFileSync(f, 'utf8')); j[K] = T[l]; fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n'); }
const fx = 'data/he-x.json', jx = JSON.parse(fs.readFileSync(fx, 'utf8')); jx[K] = 'מה כבר כתבתם היום'; fs.writeFileSync(fx, JSON.stringify(jx, null, 2) + '\n');
console.log('ok');
