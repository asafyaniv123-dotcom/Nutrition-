/* The language screen's question, and the plural form of address (23 Oct). */
import fs from 'fs';
const K = ['באיזו שפה נדבר?', 'בלשון רבים', 'אפנה אליכם בלשון רבים'];
const A = {
  en: ['Which language shall we speak?', 'Plural form', 'I’ll address you in the plural'],
  de: ['In welcher Sprache sprechen wir?', 'Pluralform', 'Ich spreche dich in der Pluralform an'],
  es: ['¿En qué idioma hablamos?', 'Forma plural', 'Te hablaré en plural'],
  fr: ['Dans quelle langue on se parle ?', 'Forme plurielle', 'Je m’adresserai à toi au pluriel'],
  it: ['In che lingua parliamo?', 'Forma plurale', 'Ti parlerò al plurale'],
  pt: ['Em que língua falamos?', 'Forma plural', 'Vou falar contigo no plural'],
  ja: ['何語で話しましょう？', '複数形', '複数形で呼びかけます'],
  'zh-Hans': ['我们用哪种语言交流？', '复数形式', '我会用复数形式称呼你'],
  'zh-Hant': ['我們用哪種語言交流？', '複數形式', '我會用複數形式稱呼你'],
  ar: ['بأي لغة نتحدث؟', 'صيغة الجمع', 'سأخاطبك بصيغة الجمع'],
};
for (const [l, v] of Object.entries(A)) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  K.forEach((k, i) => { d[k] = v[i]; }); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('done');
