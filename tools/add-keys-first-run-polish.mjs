/* The centre of the dial is סיום יום, fed by every area - not "the well".
 * Each language names it the way its own dial button does. */
import fs from 'fs';
const OLD = ['רואה איך הבאר התמלאה? כך היא תיראה בכל ערב שתסכם.', 'יופי', 'וזו הבאר.',
  'כל ערב, כשתסכם את היום, היא מתמלאת באור. זה הלב של הכול.'];
const K = ['וזה סיום היום.', 'כל אזור שאתה עוקב אחריו מזין אותו. בערב לוחצים כאן, מסכמים את היום, והוא מתמלא באור.',
  'רואה את האור? כך מתמלא סיום היום, בכל ערב שתסכם.'];
const A = {
  en: ['And this is Day’s end.', 'Every area you track feeds it. In the evening you tap here, sum up your day, and it fills with light.',
    'See the light? That’s how Day’s end fills, every evening you sum up your day.'],
  de: ['Und das ist der Tagesabschluss.', 'Jeder Bereich, den du verfolgst, fließt hinein. Am Abend tippst du hier, fasst deinen Tag zusammen, und er füllt sich mit Licht.',
    'Siehst du das Licht? So füllt sich der Tagesabschluss an jedem Abend, an dem du deinen Tag zusammenfasst.'],
  es: ['Y este es el Cierre del día.', 'Cada área que sigues lo alimenta. Por la noche tocas aquí, resumes tu día y se llena de luz.',
    '¿Ves la luz? Así se llena el Cierre del día cada noche que resumes tu día.'],
  fr: ['Et voici la Clôture du jour.', 'Chaque domaine que tu suis l’alimente. Le soir, tu touches ici, tu résumes ta journée, et elle se remplit de lumière.',
    'Tu vois la lumière ? C’est ainsi que la Clôture du jour se remplit, chaque soir où tu résumes ta journée.'],
  it: ['E questa è la Chiusura del giorno.', 'Ogni area che segui la alimenta. La sera tocchi qui, riassumi la giornata e si riempie di luce.',
    'Vedi la luce? Così si riempie la Chiusura del giorno, ogni sera che riassumi la giornata.'],
  pt: ['E este é o Fechamento do dia.', 'Cada área que você acompanha o alimenta. À noite você toca aqui, resume o dia, e ele se enche de luz.',
    'Viu a luz? É assim que o Fechamento do dia se enche, toda noite em que você resume o dia.'],
  ja: ['そしてこれが「一日の締めくくり」。', '記録しているすべてのエリアがここにつながっています。夜にここをタップして一日をまとめると、光で満ちていきます。',
    'この光、見える？一日をまとめる夜は、いつもこうして「一日の締めくくり」が満ちていくよ。'],
  'zh-Hans': ['这是“一天的收尾”。', '你记录的每个领域都会汇入这里。晚上点这里，总结一天，它就会被光填满。',
    '看到光了吗？每个你总结一天的夜晚，“一天的收尾”都会这样被填满。'],
  'zh-Hant': ['這是「一天的收尾」。', '你記錄的每個領域都會匯入這裡。晚上點這裡，總結一天，它就會被光填滿。',
    '看到光了嗎？每個你總結一天的夜晚，「一天的收尾」都會這樣被填滿。'],
  ar: ['وهذا هو إغلاق اليوم.', 'كل مجال تتابعه يغذّيه. في المساء تضغط هنا، تلخّص يومك، فيمتلئ بالضوء.',
    'هل ترى الضوء؟ هكذا يمتلئ إغلاق اليوم في كل مساء تلخّص فيه يومك.'],
};
for (const [l, v] of Object.entries(A)) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  OLD.forEach((k) => delete d[k]);
  K.forEach((k, i) => { d[k] = v[i]; });
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
const hf = 'data/he-f.json', H = JSON.parse(fs.readFileSync(hf, 'utf8'));
OLD.forEach((k) => delete H[k]);
H[K[1]] = 'כל אזור שאת עוקבת אחריו מזין אותו. בערב לוחצים כאן, מסכמים את היום, והוא מתמלא באור.';
H[K[2]] = 'רואה את האור? כך מתמלא סיום היום, בכל ערב שתסכמי.';
fs.writeFileSync(hf, JSON.stringify(H, null, 2) + '\n');
console.log('done');
