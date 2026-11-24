// The words of the fourth pair (24 Nov): the three kinds of thing a sentence for tomorrow can be, the "+" for
// another thing to be grateful for, and the workout card on home with its two acknowledgements. English first;
// the rest from the English. None of them is gendered in Hebrew - the card says "did it happen", not "did you
// go" - so he-f and he-x need nothing.
// usage: node tools/patches/lang-q-take-thanks.mjs
import fs from 'node:fs';
const L = ['en', 'de', 'es', 'ja', 'fr', 'it', 'pt', 'zh-Hans', 'zh-Hant', 'ar'];
const T = {
  'מחשבה': ['A thought', 'Ein Gedanke', 'Un pensamiento', '考えたこと', 'Une pensée', 'Un pensiero', 'Um pensamento', '一个想法', '一個想法', 'فكرة'],
  'כוונה': ['An intention', 'Ein Vorsatz', 'Una intención', '心がけ', 'Une intention', 'Un’intenzione', 'Uma intenção', '一个心意', '一個心意', 'نيّة'],
  'צעד קטן': ['A small step', 'Ein kleiner Schritt', 'Un pequeño paso', '小さな一歩', 'Un petit pas', 'Un piccolo passo', 'Um pequeno passo', '一小步', '一小步', 'خطوة صغيرة'],
  'עוד דבר': ['One more thing', 'Noch etwas', 'Una cosa más', 'もうひとつ', 'Encore une chose', 'Un’altra cosa', 'Mais uma coisa', '再加一件', '再加一件', 'شيء آخر'],
  'האימון של היום — יצא?': ['Today’s workout — did it happen?', 'Das Training heute — hat es geklappt?', 'El entrenamiento de hoy, ¿se hizo?', '今日のトレーニング、できましたか？', 'L’entraînement du jour — c’est fait ?', 'L’allenamento di oggi: fatto?', 'O treino de hoje — rolou?', '今天的训练，完成了吗？', '今天的訓練，完成了嗎？', 'تمرين اليوم — هل تمّ؟'],
  'לא היום': ['Not today', 'Heute nicht', 'Hoy no', '今日はなし', 'Pas aujourd’hui', 'Oggi no', 'Hoje não', '今天没有', '今天沒有', 'ليس اليوم'],
  'נרשם. כל הכבוד.': ['Noted. Well done.', 'Notiert. Stark.', 'Anotado. ¡Bien hecho!', '記録しました。おつかれさま。', 'C’est noté. Bravo.', 'Segnato. Ottimo lavoro.', 'Anotado. Mandou bem.', '已记下。做得好。', '已記下。做得好。', 'تم التسجيل. عمل رائع.'],
  'נרשם. מחר יום חדש.': ['Noted. Tomorrow is a new day.', 'Notiert. Morgen ist ein neuer Tag.', 'Anotado. Mañana es otro día.', '記録しました。明日はまた新しい一日。', 'C’est noté. Demain est un autre jour.', 'Segnato. Domani è un altro giorno.', 'Anotado. Amanhã é um novo dia.', '已记下。明天又是新的一天。', '已記下。明天又是新的一天。', 'تم التسجيل. غدًا يوم جديد.'],
};
L.forEach((l, i) => {
  const f = 'data/lang/' + l + '.json', j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const k in T) j[k] = T[k][i];
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n');
});
console.log('written', Object.keys(T).length, 'keys x', L.length);
