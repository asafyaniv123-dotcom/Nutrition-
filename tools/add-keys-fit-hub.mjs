/* The fitness hub (24 Oct): thirteen strings in every language. None speaks
   to the person in a gendered or plural form, so he-f and he-x need nothing
   ("מוסיפים" is impersonal). */
import fs from 'fs';
const K = ['אימון ריק', 'אימונים השבוע', 'אימונים|מעקב', 'היום לפי הלוז: {name}', 'הכול', 'התקדמות', 'לפי הלוז של היום',
  'מהתוכניות שלי', 'מוסיפים תרגילים תוך כדי', 'מעקב', 'משקלים', 'צעדים היום', 'שיא אחרון'];
const A = {
  en: ['Empty workout', 'workouts this week', 'Workouts', 'Today on the schedule: {name}', 'All', 'Progress', "From today's schedule",
    'From my programs', 'Add exercises as you go', 'Tracking', 'Weights', 'steps today', 'latest record'],
  de: ['Leeres Training', 'Trainings diese Woche', 'Trainings', 'Heute laut Plan: {name}', 'Alle', 'Fortschritt', 'Laut heutigem Plan',
    'Aus meinen Programmen', 'Übungen unterwegs hinzufügen', 'Verlauf', 'Gewichte', 'Schritte heute', 'neuester Rekord'],
  es: ['Entrenamiento vacío', 'entrenamientos esta semana', 'Entrenamientos', 'Hoy según el plan: {name}', 'Todo', 'Progreso', 'Según el plan de hoy',
    'De mis programas', 'Añade ejercicios sobre la marcha', 'Seguimiento', 'Pesos', 'pasos hoy', 'último récord'],
  fr: ['Séance vide', 'séances cette semaine', 'Séances', 'Aujourd’hui au planning : {name}', 'Tout', 'Progrès', 'D’après le planning du jour',
    'Depuis mes programmes', 'Ajoutez les exercices au fur et à mesure', 'Suivi', 'Charges', 'pas aujourd’hui', 'dernier record'],
  it: ['Allenamento vuoto', 'allenamenti questa settimana', 'Allenamenti', 'Oggi in programma: {name}', 'Tutto', 'Progressi', 'Dal programma di oggi',
    'Dai miei programmi', 'Aggiungi gli esercizi strada facendo', 'Monitoraggio', 'Pesi', 'passi oggi', 'ultimo record'],
  pt: ['Treino vazio', 'treinos esta semana', 'Treinos', 'Hoje no cronograma: {name}', 'Tudo', 'Progresso', 'Pelo cronograma de hoje',
    'Dos meus programas', 'Adicione exercícios no caminho', 'Acompanhamento', 'Cargas', 'passos hoje', 'último recorde'],
  ja: ['空のワークアウト', '今週のワークアウト', 'ワークアウト', '今日の予定：{name}', 'すべて', '進捗', '今日のスケジュールから',
    'マイプログラムから', '種目は途中で追加', '記録', '重量', '今日の歩数', '最新の自己ベスト'],
  'zh-Hans': ['空白训练', '本周训练', '训练', '今天的安排：{name}', '全部', '进展', '按今天的安排',
    '从我的计划', '边练边加动作', '追踪', '重量', '今日步数', '最新纪录'],
  'zh-Hant': ['空白訓練', '本週訓練', '訓練', '今天的安排：{name}', '全部', '進展', '按今天的安排',
    '從我的計畫', '邊練邊加動作', '追蹤', '重量', '今日步數', '最新紀錄'],
  ar: ['تمرين فارغ', 'تمارين هذا الأسبوع', 'التمارين', 'اليوم حسب الجدول: {name}', 'الكل', 'التقدّم', 'حسب جدول اليوم',
    'من برامجي', 'أضف التمارين أثناء التمرين', 'المتابعة', 'الأوزان', 'خطوات اليوم', 'أحدث رقم قياسي'],
};
for (const [l, v] of Object.entries(A)) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  K.forEach((k, i) => { d[k] = v[i]; }); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('done');
