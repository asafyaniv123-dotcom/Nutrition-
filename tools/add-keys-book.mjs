/* The book on Me, option A, and the to-read-next list (24 Oct). */
import fs from 'fs';
let s = fs.readFileSync('dev/index.html', 'utf8');
const a = `showToast(_t('נוסף ל"לקרוא בהמשך"'));`;
if (s.split(a).length === 2) { s = s.replace(a, `showToast(_t('נוסף לרשימה'));`); fs.writeFileSync('dev/index.html', s); }
const K = ['הבא בתור', 'הבא בתור: {name}. להתחיל עכשיו?', 'להתחיל את {name}', 'להתחיל את {name}?',
  'להתחיל את {name}? "{cur}" יחזור לראש הרשימה, בעמוד שבו עצרת.', 'לקרוא בהמשך', 'מתוך {n}', 'נוסף לרשימה',
  'ספר שמישהו המליץ עליו? כתוב אותו כאן כדי שלא ילך לאיבוד.', 'עוד {n} עמודים'];
const A = {
  en: ['Up next', 'Up next: {name}. Start it now?', 'Start {name}', 'Start {name}?', 'Start {name}? “{cur}” goes back to the top of the list, at the page you stopped on.', 'To read next', 'of {n}', 'Added to the list', 'A book someone recommended? Write it here so it does not get lost.', '{n} pages to go'],
  de: ['Als Nächstes', 'Als Nächstes: {name}. Jetzt anfangen?', '{name} anfangen', '{name} anfangen?', '{name} anfangen? „{cur}“ kommt zurück an den Anfang der Liste, bei der Seite, an der du warst.', 'Als Nächstes lesen', 'von {n}', 'Zur Liste hinzugefügt', 'Ein Buch, das dir jemand empfohlen hat? Schreib es hier auf, damit es nicht verloren geht.', 'Noch {n} Seiten'],
  es: ['El siguiente', 'El siguiente: {name}. ¿Empezarlo ahora?', 'Empezar {name}', '¿Empezar {name}?', '¿Empezar {name}? «{cur}» vuelve al principio de la lista, en la página donde lo dejaste.', 'Para leer después', 'de {n}', 'Añadido a la lista', '¿Un libro que te recomendaron? Escríbelo aquí para que no se pierda.', 'Quedan {n} páginas'],
  fr: ['Le prochain', 'Le prochain : {name}. Le commencer maintenant ?', 'Commencer {name}', 'Commencer {name} ?', 'Commencer {name} ? « {cur} » revient en haut de la liste, à la page où tu t’es arrêté.', 'À lire ensuite', 'sur {n}', 'Ajouté à la liste', 'Un livre qu’on t’a recommandé ? Note-le ici pour ne pas l’oublier.', 'Encore {n} pages'],
  it: ['Il prossimo', 'Il prossimo: {name}. Iniziarlo ora?', 'Inizia {name}', 'Iniziare {name}?', 'Iniziare {name}? «{cur}» torna in cima alla lista, alla pagina dove eri arrivato.', 'Da leggere dopo', 'di {n}', 'Aggiunto alla lista', 'Un libro che ti hanno consigliato? Scrivilo qui così non si perde.', 'Mancano {n} pagine'],
  pt: ['O próximo', 'O próximo: {name}. Começar agora?', 'Começar {name}', 'Começar {name}?', 'Começar {name}? “{cur}” volta para o topo da lista, na página onde você parou.', 'Para ler depois', 'de {n}', 'Adicionado à lista', 'Um livro que alguém recomendou? Escreva aqui para não esquecer.', 'Faltam {n} páginas'],
  ja: ['次に読む本', '次は「{name}」。今すぐ読み始めますか？', '「{name}」を読み始める', '「{name}」を読み始めますか？', '「{name}」を読み始めますか？「{cur}」は止めたページのまま、リストの先頭に戻ります。', '次に読む', '／{n}', 'リストに追加しました', '誰かに勧められた本は？忘れないようにここに書いておきましょう。', '残り{n}ページ'],
  'zh-Hans': ['下一本', '下一本：{name}。现在开始读吗？', '开始读{name}', '开始读{name}？', '开始读{name}？“{cur}”会回到列表最前面，停在你读到的那一页。', '接下来要读', '共 {n}', '已加入列表', '有人推荐的书？写在这里，免得忘了。', '还剩 {n} 页'],
  'zh-Hant': ['下一本', '下一本：{name}。現在開始讀嗎？', '開始讀{name}', '開始讀{name}？', '開始讀{name}？「{cur}」會回到清單最前面，停在你讀到的那一頁。', '接下來要讀', '共 {n}', '已加入清單', '有人推薦的書？寫在這裡，免得忘了。', '還剩 {n} 頁'],
  ar: ['التالي', 'التالي: {name}. هل تبدأ به الآن؟', 'ابدأ {name}', 'هل تبدأ {name}؟', 'هل تبدأ {name}؟ سيعود «{cur}» إلى أول القائمة، عند الصفحة التي توقفت عندها.', 'للقراءة لاحقًا', 'من {n}', 'أُضيف إلى القائمة', 'كتاب نصحك به أحد؟ اكتبه هنا كي لا يضيع.', 'تبقّت {n} صفحة'],
};
for (const [l, v] of Object.entries(A)) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  K.forEach((k, i) => { d[k] = v[i]; }); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
const add = (f, m) => { const d = JSON.parse(fs.readFileSync(f, 'utf8')); Object.assign(d, m); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); };
add('data/he-f.json', { 'ספר שמישהו המליץ עליו? כתוב אותו כאן כדי שלא ילך לאיבוד.': 'ספר שמישהו המליץ עלייך? כתבי אותו כאן כדי שלא ילך לאיבוד.'.replace('עלייך', 'עליו') });
add('data/he-x.json', { 'ספר שמישהו המליץ עליו? כתוב אותו כאן כדי שלא ילך לאיבוד.': 'ספר שמישהו המליץ עליו? כתבו אותו כאן כדי שלא ילך לאיבוד.',
  'להתחיל את {name}? "{cur}" יחזור לראש הרשימה, בעמוד שבו עצרת.': 'להתחיל את {name}? "{cur}" יחזור לראש הרשימה, בעמוד שבו עצרתם.' });
add('data/he-f.json', { 'להתחיל את {name}? "{cur}" יחזור לראש הרשימה, בעמוד שבו עצרת.': 'להתחיל את {name}? "{cur}" יחזור לראש הרשימה, בעמוד שבו עצרת.' });
console.log('done');
