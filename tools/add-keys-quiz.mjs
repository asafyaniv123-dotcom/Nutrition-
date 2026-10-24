/* The built-for-you questionnaire and the one "+ new" sheet (24 Oct). */
import fs from 'fs';
const K = ['כמה זמן יש לך?', 'שאלה {a} מתוך {b}', 'בנה אימון מראש'];
const A = {
  en: ['How much time do you have?', 'Question {a} of {b}', 'Build a workout ahead'],
  de: ['Wie viel Zeit hast du?', 'Frage {a} von {b}', 'Training vorab erstellen'],
  es: ['¿Cuánto tiempo tienes?', 'Pregunta {a} de {b}', 'Crear un entrenamiento por adelantado'],
  fr: ['Combien de temps as-tu ?', 'Question {a} sur {b}', 'Préparer une séance à l’avance'],
  it: ['Quanto tempo hai?', 'Domanda {a} di {b}', 'Prepara un allenamento in anticipo'],
  pt: ['Quanto tempo você tem?', 'Pergunta {a} de {b}', 'Montar um treino com antecedência'],
  ja: ['時間はどれくらいありますか？', '質問 {a}/{b}', 'ワークアウトを前もって作る'],
  'zh-Hans': ['你有多少时间？', '第 {a} 题，共 {b} 题', '提前制定训练'],
  'zh-Hant': ['你有多少時間？', '第 {a} 題，共 {b} 題', '提前制定訓練'],
  ar: ['كم من الوقت لديك؟', 'السؤال {a} من {b}', 'أنشئ تمرينًا مسبقًا'],
};
for (const [l, v] of Object.entries(A)) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  K.forEach((k, i) => { d[k] = v[i]; }); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
const FEM = { 'בנה אימון מראש': 'בני אימון מראש' };
const PLU = { 'כמה זמן יש לך?': 'כמה זמן יש לכם?', 'בנה אימון מראש': 'בנו אימון מראש' };
for (const [f, m] of [['data/he-f.json', FEM], ['data/he-x.json', PLU]]) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8')); Object.assign(d, m); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('done');
