// מה שמובן מאליו (25 Nov): the five kinds of what was always there, in every language. Capitalised as chips.
// usage: node tools/patches/lang-q-overlooked.mjs
import fs from 'node:fs';
const T = {
  'אדם': { en: 'A person', de: 'Ein Mensch', es: 'Una persona', ja: '人', fr: 'Une personne', it: 'Una persona', pt: 'Uma pessoa', 'zh-Hans': '一个人', 'zh-Hant': '一個人', ar: 'شخص' },
  'מקום': { en: 'A place', de: 'Ein Ort', es: 'Un lugar', ja: '場所', fr: 'Un lieu', it: 'Un luogo', pt: 'Um lugar', 'zh-Hans': '一个地方', 'zh-Hant': '一個地方', ar: 'مكان' },
  'חפץ': { en: 'A thing', de: 'Ein Ding', es: 'Una cosa', ja: 'もの', fr: 'Un objet', it: 'Un oggetto', pt: 'Uma coisa', 'zh-Hans': '一样东西', 'zh-Hant': '一樣東西', ar: 'شيء' },
  'הגוף שלי': { en: 'My body', de: 'Mein Körper', es: 'Mi cuerpo', ja: '自分の体', fr: 'Mon corps', it: 'Il mio corpo', pt: 'Meu corpo', 'zh-Hans': '我的身体', 'zh-Hant': '我的身體', ar: 'جسدي' },
  'משהו בטבע': { en: 'Something in nature', de: 'Etwas in der Natur', es: 'Algo de la naturaleza', ja: '自然の中のもの', fr: 'Quelque chose dans la nature', it: 'Qualcosa nella natura', pt: 'Algo na natureza', 'zh-Hans': '大自然里的东西', 'zh-Hant': '大自然裡的東西', ar: 'شيء في الطبيعة' },
};
const L = ['en', 'de', 'es', 'ja', 'fr', 'it', 'pt', 'zh-Hans', 'zh-Hant', 'ar'];
for (const l of L) {
  const f = 'data/lang/' + l + '.json', j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const k in T) { if (!T[k][l]) throw new Error(l + ' ' + k); j[k] = T[k][l]; }
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n');
}
console.log('answered', Object.keys(T).length, 'keys in', L.length);
