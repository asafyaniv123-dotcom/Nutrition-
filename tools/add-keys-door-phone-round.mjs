/* The first run after the iPhone walk (23 Oct): new words, and the ones that
 * left with the old "why" screen, "בוא" and "מה חשוב לך?". */
import fs from 'fs';
const tpl = JSON.parse(fs.readFileSync('data/lang/_template.json', 'utf8'));
const K = ['במה חשוב לך להתמקד?', 'בסוף כל יום, שתי דקות.', 'ועכשיו, היום הראשון שלך.',
  'כמה שאלות קצרות בערב, וכל יום נשמר כדף ביומן. ככה נראה דף כזה:', 'להזכיר לך כל יום ב־{t}?', 'נשמע טוב',
  'קפה עם נועה, בשמש', 'שתי שאלות קטנות על היום הזה. ככה מתחיל היומן שלך.'];
const A = {
  en: ['What would you like to focus on?', 'Two minutes at the end of each day.', 'And now, your first day.',
    'A few short questions in the evening, and each day is kept as a page in your journal. This is what a page looks like:',
    'Remind you every day at {t}?', 'Sounds good', 'Coffee with Noa, in the sun', 'Two small questions about today. That’s how your journal begins.'],
  de: ['Worauf möchtest du dich konzentrieren?', 'Zwei Minuten am Ende jedes Tages.', 'Und jetzt: dein erster Tag.',
    'Ein paar kurze Fragen am Abend, und jeder Tag bleibt als Seite in deinem Tagebuch. So sieht eine Seite aus:',
    'Soll ich dich jeden Tag um {t} erinnern?', 'Klingt gut', 'Kaffee mit Noa, in der Sonne', 'Zwei kleine Fragen zu heute. So beginnt dein Tagebuch.'],
  es: ['¿En qué te gustaría centrarte?', 'Dos minutos al final de cada día.', 'Y ahora, tu primer día.',
    'Unas preguntas cortas por la noche, y cada día se guarda como una página de tu diario. Así se ve una página:',
    '¿Te lo recuerdo cada día a las {t}?', 'Suena bien', 'Café con Noa, al sol', 'Dos preguntas pequeñas sobre hoy. Así empieza tu diario.'],
  fr: ['Sur quoi aimerais-tu te concentrer ?', 'Deux minutes à la fin de chaque journée.', 'Et maintenant, ton premier jour.',
    'Quelques questions courtes le soir, et chaque jour est gardé comme une page de ton journal. Voici à quoi ressemble une page :',
    'Je te le rappelle chaque jour à {t} ?', 'Ça me va', 'Un café avec Noa, au soleil', 'Deux petites questions sur aujourd’hui. C’est ainsi que commence ton journal.'],
  it: ['Su cosa vorresti concentrarti?', 'Due minuti alla fine di ogni giorno.', 'E ora, il tuo primo giorno.',
    'Qualche breve domanda la sera, e ogni giorno resta come una pagina del tuo diario. Ecco com’è una pagina:',
    'Te lo ricordo ogni giorno alle {t}?', 'Mi sta bene', 'Caffè con Noa, al sole', 'Due piccole domande su oggi. Così comincia il tuo diario.'],
  pt: ['Em que gostarias de te concentrar?', 'Dois minutos no fim de cada dia.', 'E agora, o teu primeiro dia.',
    'Algumas perguntas curtas à noite, e cada dia fica guardado como uma página do teu diário. Uma página é assim:',
    'Lembro-te todos os dias às {t}?', 'Parece-me bem', 'Café com a Noa, ao sol', 'Duas pequenas perguntas sobre hoje. É assim que começa o teu diário.'],
  ja: ['何に集中したいですか？', '一日の終わりに、2分だけ。', 'さあ、最初の一日です。',
    '夜に短い質問がいくつか。毎日が日記の1ページとして残ります。1ページはこんな感じ：',
    '毎日{t}にお知らせしましょうか？', 'いいね', '日なたでノアとコーヒー', '今日について小さな質問を2つ。ここから日記が始まります。'],
  'zh-Hans': ['你想专注在哪些方面？', '每天结束时，两分钟。', '现在，开始你的第一天。',
    '晚上几个简短的问题，每一天都会成为你日记里的一页。一页看起来是这样的：',
    '每天{t}提醒你吗？', '听起来不错', '和诺亚在阳光下喝咖啡', '关于今天的两个小问题。你的日记就这样开始。'],
  'zh-Hant': ['你想專注在哪些方面？', '每天結束時，兩分鐘。', '現在，開始你的第一天。',
    '晚上幾個簡短的問題，每一天都會成為你日記裡的一頁。一頁看起來是這樣的：',
    '每天{t}提醒你嗎？', '聽起來不錯', '和諾亞在陽光下喝咖啡', '關於今天的兩個小問題。你的日記就這樣開始。'],
  ar: ['على ماذا تودّ أن تركّز؟', 'دقيقتان في نهاية كل يوم.', 'والآن، يومك الأول.',
    'بضعة أسئلة قصيرة في المساء، ويُحفظ كل يوم كصفحة في دفترك. هكذا تبدو الصفحة:',
    'أذكّرك كل يوم في {t}؟', 'يبدو جيدًا', 'قهوة مع نوعا تحت الشمس', 'سؤالان صغيران عن اليوم. هكذا يبدأ دفترك.'],
};
const dropFrom = (d) => { for (const k of Object.keys(d)) if (!(k in tpl) && !K.includes(k)) delete d[k]; };
for (const [l, v] of Object.entries(A)) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  dropFrom(d); K.forEach((k, i) => { d[k] = v[i]; });
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
for (const p of ['data/he-f.json', 'data/he-x.json']) {
  const d = JSON.parse(fs.readFileSync(p, 'utf8')); dropFrom(d);
  if (p.endsWith('he-x.json')) Object.assign(d, {
    'במה חשוב לך להתמקד?': 'במה חשוב לכם להתמקד?', 'להזכיר לך כל יום ב־{t}?': 'להזכיר לכם כל יום ב־{t}?',
    'ועכשיו, היום הראשון שלך.': 'ועכשיו, היום הראשון שלכם.', 'שתי שאלות קטנות על היום הזה. ככה מתחיל היומן שלך.': 'שתי שאלות קטנות על היום הזה. ככה מתחיל היומן שלכם.' });
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
}
console.log('done');
