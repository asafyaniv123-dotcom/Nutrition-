/* the chat-that-does strings, in every shipped language. The suggestion lines
 * are the PERSON's words to the chat; a line ending in "…" is the start of a
 * sentence put in the box for them to finish, so it must read as a start. */
import fs from 'fs';
const L = ['en', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar'];
const T = {
  'לרשום סט…': ['Log a set…', 'Trag einen Satz ein…', 'Registra una serie…', 'Note une série…', 'Registra una serie…', 'Registre uma série…', 'セットを記録：…', '记录一组：…', '記錄一組：…', 'سجّل مجموعة…'],
  'מה האימון של היום?': ["What's today's workout?", 'Was ist heute mein Training?', '¿Cuál es el entrenamiento de hoy?', "Quel est l'entraînement du jour ?", "Qual è l'allenamento di oggi?", 'Qual é o treino de hoje?', '今日のワークアウトは？', '今天的训练是什么？', '今天的訓練是什麼？', 'ما تمرين اليوم؟'],
  'מה יש לי היום?': ["What's on today?", 'Was steht heute an?', '¿Qué tengo hoy?', "Qu'est-ce que j'ai aujourd'hui ?", 'Cosa ho oggi?', 'O que eu tenho hoje?', '今日の予定は？', '我今天有什么安排？', '我今天有什麼安排？', 'ماذا لديّ اليوم؟'],
  'מה יש לי מחר?': ["What's on tomorrow?", 'Was steht morgen an?', '¿Qué tengo mañana?', "Qu'est-ce que j'ai demain ?", 'Cosa ho domani?', 'O que eu tenho amanhã?', '明日の予定は？', '我明天有什么安排？', '我明天有什麼安排？', 'ماذا لديّ غدًا؟'],
  'להזכיר לי…': ['Remind me…', 'Erinnere mich…', 'Recuérdame…', 'Rappelle-moi…', 'Ricordami…', 'Me lembre…', 'リマインド：…', '提醒我…', '提醒我…', 'ذكّرني…'],
  'למי כדאי שאתקשר?': ['Who should I call?', 'Wen sollte ich anrufen?', '¿A quién debería llamar?', 'Qui devrais-je appeler ?', 'Chi dovrei chiamare?', 'Para quem eu deveria ligar?', '誰に連絡するといい？', '我该给谁打电话？', '我該給誰打電話？', 'بمن يجدر أن أتصل؟'],
  'דיברתי עם…': ['I talked to…', 'Gesprochen mit…', 'Hablé con…', "J'ai parlé avec…", 'Ho parlato con…', 'Falei com…', '話した相手：…', '我联系了…', '我聯絡了…', 'تحدثت مع…'],
  'כמה הקדשתי לתחביבים השבוע?': ['How much time did I give my hobbies this week?', 'Wie viel Zeit hatte ich diese Woche für meine Hobbys?', '¿Cuánto tiempo dediqué a mis aficiones esta semana?', "Combien de temps ai-je consacré à mes loisirs cette semaine ?", 'Quanto tempo ho dedicato ai miei hobby questa settimana?', 'Quanto tempo dediquei aos meus hobbies esta semana?', '今週、趣味にどれくらい時間を使った？', '我这周在爱好上花了多少时间？', '我這週在興趣上花了多少時間？', 'كم من الوقت خصصت لهواياتي هذا الأسبوع؟'],
  'להוסיף זמן ל…': ['Add time to…', 'Zeit hinzufügen für…', 'Añade tiempo a…', 'Ajoute du temps à…', 'Aggiungi tempo a…', 'Adicione tempo a…', '時間を追加：…', '添加时间：…', '新增時間：…', 'أضف وقتًا إلى…'],
  'מה לא לבשתי בחודש האחרון?': ["What haven't I worn in the last month?", 'Was habe ich im letzten Monat nicht getragen?', '¿Qué no me he puesto en el último mes?', "Qu'est-ce que je n'ai pas porté depuis un mois ?", "Cosa non ho indossato nell'ultimo mese?", 'O que eu não usei no último mês?', 'この1か月で着ていない服は？', '最近一个月我没穿过什么？', '最近一個月我沒穿過什麼？', 'ما الذي لم أرتده في الشهر الأخير؟'],
  'שאלה לכתוב עליה': ['Give me a question to write about', 'Gib mir eine Frage zum Schreiben', 'Dame una pregunta para escribir', 'Donne-moi une question sur laquelle écrire', 'Dammi una domanda su cui scrivere', 'Me dê uma pergunta para escrever', '書くための問いをちょうだい', '给我一个可以写的问题', '給我一個可以寫的問題', 'أعطني سؤالًا أكتب عنه'],
  'למדתי היום ש…': ['Today I learned that…', 'Heute habe ich gelernt, dass…', 'Hoy aprendí que…', "Aujourd'hui j'ai appris que…", 'Oggi ho imparato che…', 'Hoje aprendi que…', '今日学んだこと：…', '今天我学到…', '今天我學到…', 'تعلّمت اليوم أن…'],
  'מה נשאר לי לענות הערב?': ["What's left to answer tonight?", 'Was ist heute Abend noch offen?', '¿Qué me queda por responder esta noche?', 'Que me reste-t-il à répondre ce soir ?', 'Cosa mi resta da rispondere stasera?', 'O que falta responder hoje à noite?', '今夜まだ答えていないのは？', '今晚还有哪些没回答？', '今晚還有哪些沒回答？', 'ما الذي بقي لأجيب عنه الليلة؟'],
  'הרגע הכי טוב היום…': ['The best moment today…', 'Der schönste Moment heute…', 'El mejor momento de hoy…', "Le meilleur moment aujourd'hui…", 'Il momento migliore di oggi…', 'O melhor momento de hoje…', '今日いちばんの瞬間：…', '今天最好的时刻：…', '今天最好的時刻：…', 'أجمل لحظة اليوم…'],
  'לשמור ב{area}?': ['Save in {area}?', 'In {area} speichern?', '¿Guardar en {area}?', 'Enregistrer dans {area} ?', 'Salvare in {area}?', 'Salvar em {area}?', '{area}に保存しますか？', '保存到{area}？', '儲存到{area}？', 'أحفظ في {area}؟'],
};
for (let i = 0; i < L.length; i++) {
  const f = 'data/lang/' + L[i] + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const k of Object.keys(T)) d[k] = T[k][i];
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('ok');
