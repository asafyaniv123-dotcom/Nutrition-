/* Beem the helper (21 Oct): the corner, the chat, and three questions per
 * screen. Beem keeps his Latin name everywhere, as the paired-Beem line does. */
import fs from 'fs';
const K = ['איך בוחרים אילו אזורים יופיעו?', 'איך בונים לי תוכנית?', 'איך זה עובד?', 'איך מוסיפים אדם?', 'איך מוסיפים משהו למחר?',
  'איך מוסיפים תחביב?', 'איך מזיזים משימה לשעה אחרת?', 'איך מסמנים שעשיתי אותו?', 'איך מצלמים בגד?', 'איך מרכיבים לוק?',
  'איך משנים את שעת התזכורת?', 'איך נקבע היעד היומי שלי?', 'איך רואים את כל השבוע?', 'איך רואים מה לא לבשתי?', 'איך רושמים אימון?',
  'איך רושמים ארוחה?', 'איפה התשובות שלי נשמרות?', 'אפשר לדלג על שאלה?', 'אפשר לשאול אותי כל דבר על האפליקציה', 'בים',
  'בים חושב…', 'היי {name}. מה תרצה לדעת?', 'היי. מה תרצה לדעת?', 'כמה חלבון אכלתי היום?', 'לשאול את בים',
  'מה זה השיאים האישיים?', 'מה זה סיום יום?', 'מה רואים בכרטיס של אדם?', 'מה רואים לאורך זמן?', 'מה תרצה לדעת?', 'מתי תזכיר לי להתקשר?'];
const A = {
  en: ['How do I choose which areas show up?', 'How do I get a plan built for me?', 'How does this work?', 'How do I add a person?', 'How do I add something for tomorrow?',
    'How do I add a hobby?', 'How do I move a task to another time?', 'How do I mark that I did it?', 'How do I photograph a piece of clothing?', 'How do I put together a look?',
    'How do I change the reminder time?', 'How is my daily target set?', 'How do I see the whole week?', 'How do I see what I haven’t worn?', 'How do I log a workout?',
    'How do I log a meal?', 'Where are my answers kept?', 'Can I skip a question?', 'Ask me anything about the app', 'Beem',
    'Beem is thinking…', 'Hi {name}. What would you like to know?', 'Hi. What would you like to know?', 'How much protein have I had today?', 'Ask Beem',
    'What are personal records?', 'What is Day’s end?', 'What’s on a person’s card?', 'What do I see over time?', 'What would you like to know?', 'When will you remind me to call?'],
  de: ['Wie wähle ich, welche Bereiche erscheinen?', 'Wie bekomme ich einen Plan erstellt?', 'Wie funktioniert das?', 'Wie füge ich eine Person hinzu?', 'Wie füge ich etwas für morgen hinzu?',
    'Wie füge ich ein Hobby hinzu?', 'Wie verschiebe ich eine Aufgabe auf eine andere Zeit?', 'Wie markiere ich, dass ich es gemacht habe?', 'Wie fotografiere ich ein Kleidungsstück?', 'Wie stelle ich ein Outfit zusammen?',
    'Wie ändere ich die Erinnerungszeit?', 'Wie wird mein Tagesziel festgelegt?', 'Wie sehe ich die ganze Woche?', 'Wie sehe ich, was ich nicht getragen habe?', 'Wie trage ich ein Training ein?',
    'Wie trage ich eine Mahlzeit ein?', 'Wo werden meine Antworten gespeichert?', 'Kann ich eine Frage überspringen?', 'Frag mich alles über die App', 'Beem',
    'Beem denkt nach…', 'Hallo {name}. Was möchtest du wissen?', 'Hallo. Was möchtest du wissen?', 'Wie viel Protein hatte ich heute?', 'Beem fragen',
    'Was sind persönliche Bestleistungen?', 'Was ist der Tagesabschluss?', 'Was steht auf der Karte einer Person?', 'Was sehe ich mit der Zeit?', 'Was möchtest du wissen?', 'Wann erinnerst du mich ans Anrufen?'],
  es: ['¿Cómo elijo qué áreas aparecen?', '¿Cómo consigo que me hagan un plan?', '¿Cómo funciona esto?', '¿Cómo añado a una persona?', '¿Cómo añado algo para mañana?',
    '¿Cómo añado un hobby?', '¿Cómo muevo una tarea a otra hora?', '¿Cómo marco que lo hice?', '¿Cómo fotografío una prenda?', '¿Cómo armo un look?',
    '¿Cómo cambio la hora del recordatorio?', '¿Cómo se fija mi objetivo diario?', '¿Cómo veo toda la semana?', '¿Cómo veo lo que no me he puesto?', '¿Cómo registro un entrenamiento?',
    '¿Cómo registro una comida?', '¿Dónde se guardan mis respuestas?', '¿Puedo saltarme una pregunta?', 'Pregúntame lo que quieras sobre la app', 'Beem',
    'Beem está pensando…', 'Hola, {name}. ¿Qué te gustaría saber?', 'Hola. ¿Qué te gustaría saber?', '¿Cuánta proteína he tomado hoy?', 'Preguntar a Beem',
    '¿Qué son los récords personales?', '¿Qué es el Cierre del día?', '¿Qué hay en la ficha de una persona?', '¿Qué veo con el tiempo?', '¿Qué te gustaría saber?', '¿Cuándo me recordarás llamar?'],
  fr: ['Comment choisir les domaines affichés ?', 'Comment obtenir un programme fait pour moi ?', 'Comment ça marche ?', 'Comment ajouter une personne ?', 'Comment ajouter quelque chose pour demain ?',
    'Comment ajouter un loisir ?', 'Comment déplacer une tâche à une autre heure ?', 'Comment indiquer que je l’ai fait ?', 'Comment photographier un vêtement ?', 'Comment composer une tenue ?',
    'Comment changer l’heure du rappel ?', 'Comment mon objectif quotidien est-il fixé ?', 'Comment voir toute la semaine ?', 'Comment voir ce que je n’ai pas porté ?', 'Comment enregistrer une séance ?',
    'Comment enregistrer un repas ?', 'Où mes réponses sont-elles gardées ?', 'Puis-je passer une question ?', 'Demande-moi tout sur l’app', 'Beem',
    'Beem réfléchit…', 'Salut {name}. Qu’aimerais-tu savoir ?', 'Salut. Qu’aimerais-tu savoir ?', 'Combien de protéines ai-je mangé aujourd’hui ?', 'Demander à Beem',
    'Que sont les records personnels ?', 'Qu’est-ce que la Clôture du jour ?', 'Que montre la fiche d’une personne ?', 'Que vois-je au fil du temps ?', 'Qu’aimerais-tu savoir ?', 'Quand me rappelleras-tu d’appeler ?'],
  it: ['Come scelgo quali aree compaiono?', 'Come mi faccio costruire un piano?', 'Come funziona?', 'Come aggiungo una persona?', 'Come aggiungo qualcosa per domani?',
    'Come aggiungo un hobby?', 'Come sposto un’attività a un altro orario?', 'Come segno che l’ho fatto?', 'Come fotografo un capo?', 'Come compongo un look?',
    'Come cambio l’orario del promemoria?', 'Come viene fissato il mio obiettivo giornaliero?', 'Come vedo tutta la settimana?', 'Come vedo cosa non ho indossato?', 'Come registro un allenamento?',
    'Come registro un pasto?', 'Dove vengono salvate le mie risposte?', 'Posso saltare una domanda?', 'Chiedimi qualsiasi cosa sull’app', 'Beem',
    'Beem sta pensando…', 'Ciao {name}. Cosa vorresti sapere?', 'Ciao. Cosa vorresti sapere?', 'Quante proteine ho mangiato oggi?', 'Chiedi a Beem',
    'Cosa sono i record personali?', 'Cos’è la Chiusura del giorno?', 'Cosa c’è nella scheda di una persona?', 'Cosa vedo nel tempo?', 'Cosa vorresti sapere?', 'Quando mi ricorderai di chiamare?'],
  pt: ['Como escolho quais áreas aparecem?', 'Como peço um plano feito para mim?', 'Como isto funciona?', 'Como adiciono uma pessoa?', 'Como adiciono algo para amanhã?',
    'Como adiciono um hobby?', 'Como movo uma tarefa para outro horário?', 'Como marco que fiz?', 'Como fotografo uma peça de roupa?', 'Como monto um look?',
    'Como mudo a hora do lembrete?', 'Como é definida a minha meta diária?', 'Como vejo a semana inteira?', 'Como vejo o que não vesti?', 'Como registo um treino?',
    'Como registo uma refeição?', 'Onde ficam guardadas as minhas respostas?', 'Posso saltar uma pergunta?', 'Pergunta-me tudo sobre a app', 'Beem',
    'O Beem está a pensar…', 'Olá, {name}. O que gostarias de saber?', 'Olá. O que gostarias de saber?', 'Quanta proteína comi hoje?', 'Perguntar ao Beem',
    'O que são recordes pessoais?', 'O que é o Fechamento do dia?', 'O que aparece no cartão de uma pessoa?', 'O que vejo ao longo do tempo?', 'O que gostarias de saber?', 'Quando me lembras de ligar?'],
  ja: ['表示するエリアはどう選ぶ？', 'プランを作ってもらうには？', 'これはどういう仕組み？', '人を追加するには？', '明日の予定を追加するには？',
    '趣味を追加するには？', 'タスクを別の時間に移すには？', 'やったことを記録するには？', '服を撮影するには？', 'コーデを組むには？',
    'リマインダーの時刻を変えるには？', '1日の目標はどう決まる？', '1週間全体を見るには？', '着ていない服を見るには？', 'トレーニングを記録するには？',
    '食事を記録するには？', '答えはどこに保存される？', '質問をスキップできる？', 'アプリのことなら何でも聞いてね', 'Beem',
    'Beemが考え中…', 'こんにちは、{name}さん。何が知りたい？', 'こんにちは。何が知りたい？', '今日のたんぱく質はどれくらい？', 'Beemに聞く',
    '自己ベストって何？', '「一日の締めくくり」って何？', '人のカードには何が載ってる？', '時間がたつと何が見える？', '何が知りたい？', '電話のリマインドはいつ来る？'],
  'zh-Hans': ['怎么选择显示哪些领域？', '怎么让你帮我做一个计划？', '这是怎么用的？', '怎么添加一个人？', '怎么添加明天的事？',
    '怎么添加爱好？', '怎么把任务移到别的时间？', '怎么标记我做过了？', '怎么拍衣服？', '怎么搭配一套造型？',
    '怎么修改提醒时间？', '我的每日目标是怎么定的？', '怎么看整周？', '怎么看哪些衣服没穿过？', '怎么记录训练？',
    '怎么记录一餐？', '我的回答保存在哪里？', '可以跳过问题吗？', '关于这个应用，什么都可以问我', 'Beem',
    'Beem 正在想…', '你好，{name}。想了解什么？', '你好。想了解什么？', '我今天吃了多少蛋白质？', '问 Beem',
    '什么是个人纪录？', '什么是“一天的收尾”？', '一个人的卡片上有什么？', '时间久了能看到什么？', '想了解什么？', '你什么时候提醒我打电话？'],
  'zh-Hant': ['怎麼選擇顯示哪些領域？', '怎麼讓你幫我做一個計畫？', '這是怎麼用的？', '怎麼新增一個人？', '怎麼新增明天的事？',
    '怎麼新增嗜好？', '怎麼把任務移到別的時間？', '怎麼標記我做過了？', '怎麼拍衣服？', '怎麼搭配一套造型？',
    '怎麼修改提醒時間？', '我的每日目標是怎麼定的？', '怎麼看整週？', '怎麼看哪些衣服沒穿過？', '怎麼記錄訓練？',
    '怎麼記錄一餐？', '我的回答儲存在哪裡？', '可以跳過問題嗎？', '關於這個應用程式，什麼都可以問我', 'Beem',
    'Beem 正在想…', '你好，{name}。想了解什麼？', '你好。想了解什麼？', '我今天吃了多少蛋白質？', '問 Beem',
    '什麼是個人紀錄？', '什麼是「一天的收尾」？', '一個人的卡片上有什麼？', '時間久了能看到什麼？', '想了解什麼？', '你什麼時候提醒我打電話？'],
  ar: ['كيف أختار المجالات التي تظهر؟', 'كيف أحصل على خطة مصمّمة لي؟', 'كيف يعمل هذا؟', 'كيف أضيف شخصًا؟', 'كيف أضيف شيئًا للغد؟',
    'كيف أضيف هواية؟', 'كيف أنقل مهمة إلى وقت آخر؟', 'كيف أسجّل أنني فعلتها؟', 'كيف أصوّر قطعة ملابس؟', 'كيف أنسّق إطلالة؟',
    'كيف أغيّر وقت التذكير؟', 'كيف يُحدَّد هدفي اليومي؟', 'كيف أرى الأسبوع كله؟', 'كيف أرى ما لم أرتدِه؟', 'كيف أسجّل تمرينًا؟',
    'كيف أسجّل وجبة؟', 'أين تُحفظ إجاباتي؟', 'هل يمكنني تخطّي سؤال؟', 'اسألني أي شيء عن التطبيق', 'Beem',
    'Beem يفكّر…', 'مرحبًا {name}. ماذا تودّ أن تعرف؟', 'مرحبًا. ماذا تودّ أن تعرف؟', 'كم تناولت من البروتين اليوم؟', 'اسأل Beem',
    'ما هي الأرقام الشخصية؟', 'ما هو إغلاق اليوم؟', 'ماذا يوجد في بطاقة الشخص؟', 'ماذا أرى مع الوقت؟', 'ماذا تودّ أن تعرف؟', 'متى ستذكّرني بالاتصال؟'],
};
for (const [l, v] of Object.entries(A)) {
  if (v.length !== K.length) { console.log(l + ' has ' + v.length + ' of ' + K.length); process.exit(1); }
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  K.forEach((k, i) => { d[k] = v[i]; });
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
/* the Hebrew she reads: Beem asks HER what she wants to know */
const hf = 'data/he-f.json', H = JSON.parse(fs.readFileSync(hf, 'utf8'));
H['היי {name}. מה תרצה לדעת?'] = 'היי {name}. מה תרצי לדעת?';
H['היי. מה תרצה לדעת?'] = 'היי. מה תרצי לדעת?';
H['מה תרצה לדעת?'] = 'מה תרצי לדעת?';
fs.writeFileSync(hf, JSON.stringify(H, null, 2) + '\n');
console.log('answered', K.length);
