/* the chat's five new strings, in every shipped language (English first) */
import fs from 'fs';
const T = {
  'חוגה': { en: 'Dial', de: 'Zifferblatt', es: 'Esfera', fr: 'Cadran', it: 'Quadrante', pt: 'Mostrador', ja: 'ダイヤル', 'zh-Hans': '表盘', 'zh-Hant': '錶盤', ar: 'القرص' },
  'צ׳אט': { en: 'Chat', de: 'Chat', es: 'Chat', fr: 'Discussion', it: 'Chat', pt: 'Conversa', ja: 'チャット', 'zh-Hans': '聊天', 'zh-Hant': '聊天', ar: 'محادثة' },
  'על מה נדבר?': { en: 'What shall we talk about?', de: 'Worüber wollen wir reden?', es: '¿De qué hablamos?', fr: 'De quoi parlons-nous ?', it: 'Di cosa parliamo?', pt: 'Sobre o que vamos falar?', ja: '何について話しましょうか？', 'zh-Hans': '我们聊点什么？', 'zh-Hant': '我們聊點什麼？', ar: 'عمّ نتحدث؟' },
  'נשמר ב{area}': { en: 'Saved in {area}', de: 'Gespeichert in {area}', es: 'Guardado en {area}', fr: 'Enregistré dans {area}', it: 'Salvato in {area}', pt: 'Salvo em {area}', ja: '{area}に保存しました', 'zh-Hans': '已保存到{area}', 'zh-Hant': '已儲存到{area}', ar: 'حُفظ في {area}' },
  'מה שנכתב כאן נשמר ב{area}': { en: 'What you write here is saved in {area}', de: 'Was du hier schreibst, wird in {area} gespeichert', es: 'Lo que escribas aquí se guarda en {area}', fr: 'Ce que tu écris ici est enregistré dans {area}', it: 'Quello che scrivi qui viene salvato in {area}', pt: 'O que você escreve aqui fica salvo em {area}', ja: 'ここに書いたことは{area}に保存されます', 'zh-Hans': '在这里写的内容会保存到{area}', 'zh-Hant': '在這裡寫的內容會儲存到{area}', ar: 'ما تكتبه هنا يُحفظ في {area}' },
};
for (const l of ['en', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar']) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const k of Object.keys(T)) d[k] = T[k][l];
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('ok');
