// The words of the fifth review (25 Nov): what moved a day off its plan, what a moment changed, where a pride was,
// and their titles. English first; the rest from the English. Each list keeps one shape per language (all nouns,
// or all "with/at" phrases) so the pebbles in a row read as one set. Hebrew addresses the reader once, in
// "what will you do differently tomorrow", so that one gets its he-f and he-x forms.
// usage: node tools/patches/lang-q-moved-moment-pride.mjs
import fs from 'node:fs';
const L = ['en', 'de', 'es', 'ja', 'fr', 'it', 'pt', 'zh-Hans', 'zh-Hant', 'ar'];
const T = {
  'מה הזיז את היום?': ['What moved the day?', 'Was hat den Tag verschoben?', '¿Qué movió el día?', '何が一日を動かした？', 'Qu’est-ce qui a bousculé la journée ?', 'Cosa ha spostato la giornata?', 'O que mudou o rumo do dia?', '是什么改变了今天？', '是什麼改變了今天？', 'ما الذي غيّر مسار اليوم؟'],
  'משהו לא צפוי': ['Something unexpected', 'Etwas Unerwartetes', 'Algo inesperado', '予想外のこと', 'Un imprévu', 'Un imprevisto', 'Algo inesperado', '意外的事', '意外的事', 'شيء غير متوقع'],
  'עייפות': ['Tiredness', 'Müdigkeit', 'Cansancio', '疲れ', 'La fatigue', 'Stanchezza', 'Cansaço', '疲惫', '疲憊', 'التعب'],
  'תכננתי יותר מדי': ['I planned too much', 'Zu viel vorgenommen', 'Planeé demasiado', '予定を詰めすぎた', 'Trop de choses prévues', 'Ho pianificato troppo', 'Planejei demais', '计划太多', '計畫太多', 'خطّطت لأكثر من اللازم'],
  'אנשים אחרים': ['Other people', 'Andere Menschen', 'Otras personas', 'ほかの人', 'Les autres', 'Altre persone', 'Outras pessoas', '其他人', '其他人', 'أشخاص آخرون'],
  'בריאות': ['Health', 'Gesundheit', 'Salud', '体調', 'La santé', 'Salute', 'Saúde', '健康', '健康', 'الصحة'],
  'דחיתי': ['I put it off', 'Aufgeschoben', 'Lo pospuse', '先延ばしにした', 'J’ai remis à plus tard', 'Ho rimandato', 'Adiei', '拖延了', '拖延了', 'أجّلت'],
  'ומה תעשה אחרת מחר?': ['What will you do differently tomorrow?', 'Was machst du morgen anders?', '¿Qué harás distinto mañana?', '明日は何を変えますか？', 'Que feras-tu autrement demain ?', 'Cosa farai di diverso domani?', 'O que você vai fazer diferente amanhã?', '明天你会怎么做得不一样？', '明天你會怎麼做得不一樣？', 'ماذا ستفعل بشكل مختلف غدًا؟'],
  'לא חובה. משפט אחד.': ['Optional. One sentence.', 'Freiwillig. Ein Satz.', 'Opcional. Una frase.', '任意です。一文で。', 'Facultatif. Une phrase.', 'Facoltativo. Una frase.', 'Opcional. Uma frase.', '可不填。一句话就好。', '可不填。一句話就好。', 'اختياري. جملة واحدة.'],
  'מה לעשות אחרת מחר': ['To do differently tomorrow', 'Morgen anders machen', 'Hacer distinto mañana', '明日変えること', 'À faire autrement demain', 'Da fare diversamente domani', 'Fazer diferente amanhã', '明天换个做法', '明天換個做法', 'ما سأفعله بشكل مختلف غدًا'],
  'מה הוא שינה?': ['What did it change?', 'Was hat er verändert?', '¿Qué cambió?', '何が変わった？', 'Qu’a-t-il changé ?', 'Cosa ha cambiato?', 'O que ele mudou?', '它改变了什么？', '它改變了什麼？', 'ماذا غيّر فيك؟'],
  'את ההרגשה': ['How I felt', 'Wie ich mich fühlte', 'Cómo me sentía', '気持ち', 'Ce que je ressentais', 'Come mi sentivo', 'Como eu me sentia', '我的感受', '我的感受', 'مشاعري'],
  'את המחשבות': ['What I thought', 'Was ich dachte', 'Lo que pensaba', '考え', 'Ce que je pensais', 'Cosa pensavo', 'O que eu pensava', '我的想法', '我的想法', 'أفكاري'],
  'את המשך היום': ['The rest of the day', 'Den Rest des Tages', 'El resto del día', 'その後の一日', 'La suite de la journée', 'Il resto della giornata', 'O resto do dia', '这一天接下来的时间', '這一天接下來的時間', 'بقية اليوم'],
  'איפה זה היה?': ['Where was it?', 'Wo war das?', '¿Dónde fue?', 'どこでのこと？', 'C’était où ?', 'Dov’era?', 'Onde foi?', '在哪方面？', '在哪方面？', 'أين كان ذلك؟'],
  'בעבודה': ['At work', 'Bei der Arbeit', 'En el trabajo', '仕事で', 'Au travail', 'Al lavoro', 'No trabalho', '工作上', '工作上', 'في العمل'],
  'בבית|גאווה': ['At home', 'Zu Hause', 'En casa', '家で', 'À la maison', 'A casa', 'Em casa', '在家里', '在家裡', 'في البيت'],
  'בגוף': ['In my body', 'Im Körper', 'En mi cuerpo', '体で', 'Dans mon corps', 'Nel corpo', 'No corpo', '身体上', '身體上', 'في جسدي'],
  'עם אנשים': ['With people', 'Mit anderen', 'Con otras personas', '人と', 'Avec les autres', 'Con gli altri', 'Com pessoas', '和别人', '和別人', 'مع الناس'],
  'עם עצמי': ['With myself', 'Mit mir selbst', 'Conmigo', '自分と', 'Avec moi-même', 'Con me', 'Comigo', '和自己', '和自己', 'مع نفسي'],
};
L.forEach((l, i) => {
  const f = 'data/lang/' + l + '.json', j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const k in T) j[k] = T[k][i];
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n');
});
const HE = { 'ומה תעשה אחרת מחר?': ['ומה תעשי אחרת מחר?', 'ומה תעשו אחרת מחר?'] };
[['data/he-f.json', 0], ['data/he-x.json', 1]].forEach(([f, i]) => {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const k in HE) j[k] = HE[k][i];
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n');
});
console.log('written', Object.keys(T).length, 'keys x', L.length, '+ he-f/he-x');
