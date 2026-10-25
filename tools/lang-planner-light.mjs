import fs from 'fs';
const L = ['en', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar'];
const T = {
  'מה עוד להכניס?': ['What else goes in?', 'Was kommt noch dazu?', '¿Qué más incluimos?', 'Quoi d’autre ajouter ?', 'Cos’altro inseriamo?', 'O que mais entra?', 'ほかに入れたいものは？', '还要加入什么？', '還要加入什麼？', 'ماذا نضيف أيضًا؟'],
  'מה עוד נכנס': ['What else goes in', 'Was noch dazukommt', 'Qué más entra', 'Ce qu’on ajoute', 'Cos’altro entra', 'O que mais entra', 'ほかに入れるもの', '还要加入的', '還要加入的', 'ما نضيفه أيضًا'],
  'לפגוש מישהו': ['Seeing someone', 'Jemanden treffen', 'Ver a alguien', 'Voir quelqu’un', 'Vedere qualcuno', 'Encontrar alguém', '誰かに会う', '见某人', '見某人', 'لقاء شخص'],
  'סידורים וקניות': ['Errands and shopping', 'Besorgungen und Einkäufe', 'Recados y compras', 'Courses et démarches', 'Commissioni e spesa', 'Recados e compras', '用事と買い物', '杂事和购物', '雜事和購物', 'مشاوير وتسوّق'],
  'פרויקט או משימה': ['A project or task', 'Ein Projekt oder eine Aufgabe', 'Un proyecto o tarea', 'Un projet ou une tâche', 'Un progetto o un compito', 'Um projeto ou tarefa', 'プロジェクトやタスク', '项目或任务', '專案或任務', 'مشروع أو مهمة'],
  'זמן לעצמי': ['Time for myself', 'Zeit für mich', 'Tiempo para mí', 'Du temps pour moi', 'Tempo per me', 'Tempo para mim', '自分の時間', '留给自己的时间', '留給自己的時間', 'وقت لنفسي'],
  'מה זה?': ['What is it?', 'Was ist es?', '¿Qué es?', 'C’est quoi ?', 'Che cos’è?', 'O que é?', 'それは何？', '是什么？', '是什麼？', 'ما هو؟'],
  'אין מה להוסיף, לבנות': ['Nothing to add - build it', 'Nichts mehr - jetzt planen', 'Nada más - armarlo', 'Rien à ajouter - on construit', 'Niente da aggiungere - costruiamo', 'Nada a acrescentar - montar', '追加なし、作成する', '没有要加的，开始安排', '沒有要加的，開始安排', 'لا شيء آخر، ابنِه'],
  'כמה פעמים בשבוע': ['How often a week', 'Wie oft pro Woche', 'Cuántas veces por semana', 'Combien de fois par semaine', 'Quante volte a settimana', 'Quantas vezes por semana', '週に何回', '每周几次', '每週幾次', 'كم مرة في الأسبوع'],
  'כמה זמן': ['How long', 'Wie lange', 'Cuánto tiempo', 'Combien de temps', 'Quanto tempo', 'Quanto tempo', 'どのくらい', '多长时间', '多長時間', 'كم من الوقت'],
  'התארגנות והגעה': ['Getting ready and there', 'Vorbereiten und Hinkommen', 'Prepararse y llegar', 'Se préparer et y aller', 'Prepararsi e arrivare', 'Se arrumar e chegar', '準備と移動', '准备和路程', '準備和路程', 'التجهّز والوصول'],
  'פעמיים': ['Twice', 'Zweimal', 'Dos veces', 'Deux fois', 'Due volte', 'Duas vezes', '2回', '两次', '兩次', 'مرتان'],
  'שעתיים': ['Two hours', 'Zwei Stunden', 'Dos horas', 'Deux heures', 'Due ore', 'Duas horas', '2時間', '两小时', '兩小時', 'ساعتان'],
  'חצי יום': ['Half a day', 'Ein halber Tag', 'Medio día', 'Une demi-journée', 'Mezza giornata', 'Meio dia', '半日', '半天', '半天', 'نصف يوم'],
  'בבית, בלי נסיעה': ['At home, no travel', 'Zu Hause, kein Weg', 'En casa, sin trayecto', 'À la maison, pas de trajet', 'A casa, niente viaggio', 'Em casa, sem deslocamento', '家で、移動なし', '在家，不用出门', '在家，不用出門', 'في البيت، بلا تنقّل'],
  'רבע שעה לכל כיוון': ['15 minutes each way', '15 Minuten pro Weg', '15 minutos cada trayecto', '15 minutes dans chaque sens', '15 minuti per tratta', '15 minutos cada trajeto', '片道15分', '单程15分钟', '單程15分鐘', '15 دقيقة لكل اتجاه'],
  'חצי שעה לכל כיוון': ['Half an hour each way', 'Eine halbe Stunde pro Weg', 'Media hora cada trayecto', 'Une demi-heure dans chaque sens', 'Mezz’ora per tratta', 'Meia hora cada trajeto', '片道30分', '单程半小时', '單程半小時', 'نصف ساعة لكل اتجاه'],
  'שעה לכל כיוון': ['An hour each way', 'Eine Stunde pro Weg', 'Una hora cada trayecto', 'Une heure dans chaque sens', 'Un’ora per tratta', 'Uma hora cada trajeto', '片道1時間', '单程一小时', '單程一小時', 'ساعة لكل اتجاه'],
  'להוסיף: {list}.': ['To add: {list}.', 'Dazu: {list}.', 'Añadir: {list}.', 'À ajouter : {list}.', 'Da aggiungere: {list}.', 'Adicionar: {list}.', '追加：{list}。', '要加入：{list}。', '要加入：{list}。', 'للإضافة: {list}.'],
  'אין מה להוסיף.': ['Nothing to add.', 'Nichts hinzuzufügen.', 'Nada que añadir.', 'Rien à ajouter.', 'Niente da aggiungere.', 'Nada a acrescentar.', '追加なし。', '没有要加的。', '沒有要加的。', 'لا شيء للإضافة.'],
};
for (let i = 0; i < L.length; i++) { const f = 'data/lang/' + L[i] + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const k of Object.keys(T)) d[k] = T[k][i]; fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); }
console.log('ok');
