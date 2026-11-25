// The words of "what kind of thought was it?" (25 Nov): four kinds, one shape per language, each one a short
// description of what the thought did. English first; the rest from the English. Not gendered in Hebrew.
// usage: node tools/patches/lang-q-thought.mjs
import fs from 'node:fs';
const L = ['en', 'de', 'es', 'ja', 'fr', 'it', 'pt', 'zh-Hans', 'zh-Hant', 'ar'];
const T = {
  'איזו מחשבה זו הייתה?': ['What kind of thought was it?', 'Was für ein Gedanke war es?', '¿Qué tipo de pensamiento fue?', 'どんな考えでしたか？', 'Quel genre de pensée était-ce ?', 'Che tipo di pensiero era?', 'Que tipo de pensamento foi?', '那是怎样的想法？', '那是怎樣的想法？', 'أي نوع من الأفكار كانت؟'],
  'העסיקה אותי': ['Kept me busy', 'Hat mich beschäftigt', 'Me mantuvo la mente ocupada', '頭を占めていた', 'Prenante', 'Mi ha occupato la mente', 'Me ocupou', '一直占着我的心', '一直佔著我的心', 'شغلتني'],
  'ריגשה אותי': ['Moved me', 'Hat mich berührt', 'Me emocionó', '心を動かされた', 'Émouvante', 'Mi ha emozionato', 'Me emocionou', '让我感动', '讓我感動', 'أثّرت فيّ'],
  'הדאיגה אותי': ['Worried me', 'Hat mir Sorgen gemacht', 'Me preocupó', '心配だった', 'Inquiétante', 'Mi ha preoccupato', 'Me preocupou', '让我担心', '讓我擔心', 'أقلقتني'],
  'פשוט נתקעה': ['Just stuck', 'Ist einfach hängen geblieben', 'Simplemente se quedó', 'ただ離れなかった', 'Tenace', 'Mi è rimasto in testa', 'Simplesmente ficou', '就是挥之不去', '就是揮之不去', 'علقت فقط'],
};
L.forEach((l, i) => {
  const f = 'data/lang/' + l + '.json', j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const k in T) j[k] = T[k][i];
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n');
});
console.log('written', Object.keys(T).length, 'keys x', L.length);
