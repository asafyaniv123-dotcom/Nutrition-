/* The tour's last stop: Beem in his corner (23 Oct). */
import fs from 'fs';
const K = ['ואני כאן לכל שאלה.', 'יש לך שאלה על האפליקציה? לוחצים עליי כאן למעלה, ואני עונה.'];
const A = {
  en: ['And I’m here for any question.', 'Have a question about the app? Tap me up here, and I’ll answer.'],
  de: ['Und ich bin für jede Frage da.', 'Eine Frage zur App? Tipp mich hier oben an, und ich antworte.'],
  es: ['Y aquí estoy para cualquier pregunta.', '¿Tienes una pregunta sobre la app? Tócame aquí arriba y te respondo.'],
  fr: ['Et je suis là pour toutes tes questions.', 'Une question sur l’app ? Touche-moi ici en haut, et je réponds.'],
  it: ['E io sono qui per ogni domanda.', 'Hai una domanda sull’app? Toccami qui in alto e ti rispondo.'],
  pt: ['E estou aqui para qualquer pergunta.', 'Tens uma pergunta sobre a app? Toca em mim aqui em cima e eu respondo.'],
  ja: ['どんな質問にも、ぼくが答えるよ。', 'アプリのことで聞きたいことがあったら、ここにいるぼくをタップしてね。'],
  'zh-Hans': ['有任何问题，我都在这里。', '对应用有疑问？点一下这里的我，我来回答。'],
  'zh-Hant': ['有任何問題，我都在這裡。', '對應用程式有疑問？點一下這裡的我，我來回答。'],
  ar: ['وأنا هنا لأي سؤال.', 'لديك سؤال عن التطبيق؟ اضغط عليّ هنا في الأعلى، وسأجيب.'],
};
for (const [l, v] of Object.entries(A)) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  K.forEach((k, i) => { d[k] = v[i]; }); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
/* the plural reader: "have you (pl.) a question" */
const x = JSON.parse(fs.readFileSync('data/he-x.json', 'utf8'));
x[K[1]] = 'יש לכם שאלה על האפליקציה? לוחצים עליי כאן למעלה, ואני עונה.';
fs.writeFileSync('data/he-x.json', JSON.stringify(x, null, 2) + '\n');
console.log('done');
