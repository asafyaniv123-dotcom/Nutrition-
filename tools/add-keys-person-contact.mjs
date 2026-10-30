/* One thing instead of five (30.10): the reach-out button and its sheet, the
 * card's line for a day you spoke, and the people met by chance. English is
 * the original; every other language is written from it. he-f and he-x
 * answer only the lines that address the reader.
 *
 *   node tools/add-keys-person-contact.mjs
 */
import fs from 'fs';
const K = ['לכתוב ל{name}', 'דיברנו היום · בוואטסאפ', 'דיברנו היום · בהודעה', 'דיברנו היום · בטלפון', 'דיברנו היום · זיכרון חדש',
  'דיברנו היום · פגישה בתכנון', 'הכרנו היום', 'אין עדיין מספר של {name}', 'הוסף מספר, ובפעם הבאה זה ייפתח ישר.', 'מספר טלפון', 'שמור מספר',
  'נרשום שדיברתם רק אם תשתמש באחד מאלה.', 'וואטסאפ', 'טלפון', 'להוסיף את {name} לאנשים שלי?', 'מה שכתבת יהיה הזיכרון הראשון.', 'להוסיף',
  '+ פגשתי מישהו', 'פגשתי מישהו', 'שם ושורה אחת', 'איפה נפגשתם, מה כדאי לזכור'];
const A = {
  en: ['Message {name}', 'Last spoke today · on WhatsApp', 'Last spoke today · by message', 'Last spoke today · by phone', 'Last spoke today · a new memory',
    'Last spoke today · a meeting in your plan', 'Met today', 'No number for {name} yet', 'Add a number, and next time this opens straight away.', 'Phone number', 'Save number',
    'We’ll note that you talked only if you use one of these.', 'WhatsApp', 'Phone', 'Add {name} to My people?', 'What you wrote becomes the first memory.', 'Add',
    '+ I met someone', 'I met someone', 'A name and one line', 'Where you met, what to remember'],
  de: ['Schreib {name}', 'Heute gesprochen · auf WhatsApp', 'Heute gesprochen · per Nachricht', 'Heute gesprochen · am Telefon', 'Heute gesprochen · neue Erinnerung',
    'Heute gesprochen · Treffen im Plan', 'Heute kennengelernt', 'Noch keine Nummer für {name}', 'Füg eine Nummer hinzu, dann öffnet sich das nächstes Mal direkt.', 'Telefonnummer', 'Nummer speichern',
    'Wir vermerken nur dann, dass ihr gesprochen habt, wenn du eines davon benutzt.', 'WhatsApp', 'Telefon', '{name} zu „Meine Menschen“ hinzufügen?', 'Was du geschrieben hast, wird die erste Erinnerung.', 'Hinzufügen',
    '+ Ich habe jemanden kennengelernt', 'Ich habe jemanden kennengelernt', 'Ein Name und eine Zeile', 'Wo ihr euch getroffen habt, was du dir merken willst'],
  es: ['Escribir a {name}', 'Hablamos hoy · por WhatsApp', 'Hablamos hoy · por mensaje', 'Hablamos hoy · por teléfono', 'Hablamos hoy · un recuerdo nuevo',
    'Hablamos hoy · una reunión del plan', 'Nos conocimos hoy', 'Aún no hay número de {name}', 'Añade un número y la próxima vez se abrirá directamente.', 'Número de teléfono', 'Guardar número',
    'Solo anotaremos que hablaron si usas uno de estos.', 'WhatsApp', 'Teléfono', '¿Añadir a {name} a Mi gente?', 'Lo que escribiste será el primer recuerdo.', 'Añadir',
    '+ Conocí a alguien', 'Conocí a alguien', 'Un nombre y una línea', 'Dónde se conocieron, qué recordar'],
  fr: ['Écrire à {name}', 'Parlé aujourd’hui · sur WhatsApp', 'Parlé aujourd’hui · par message', 'Parlé aujourd’hui · au téléphone', 'Parlé aujourd’hui · un nouveau souvenir',
    'Parlé aujourd’hui · un rendez-vous du planning', 'Rencontré aujourd’hui', 'Pas encore de numéro pour {name}', 'Ajoute un numéro, et la prochaine fois ça s’ouvrira directement.', 'Numéro de téléphone', 'Enregistrer le numéro',
    'On notera que vous vous êtes parlé seulement si tu utilises l’un de ceux-ci.', 'WhatsApp', 'Téléphone', 'Ajouter {name} à Mes proches ?', 'Ce que tu as écrit devient le premier souvenir.', 'Ajouter',
    '+ J’ai rencontré quelqu’un', 'J’ai rencontré quelqu’un', 'Un nom et une ligne', 'Où vous vous êtes rencontrés, ce qu’il faut retenir'],
  it: ['Scrivi a {name}', 'Sentiti oggi · su WhatsApp', 'Sentiti oggi · per messaggio', 'Sentiti oggi · al telefono', 'Sentiti oggi · un nuovo ricordo',
    'Sentiti oggi · un incontro nel piano', 'Conosciuti oggi', 'Ancora nessun numero per {name}', 'Aggiungi un numero, e la prossima volta si aprirà subito.', 'Numero di telefono', 'Salva numero',
    'Segneremo che vi siete sentiti solo se usi uno di questi.', 'WhatsApp', 'Telefono', 'Aggiungere {name} alle tue persone?', 'Quello che hai scritto sarà il primo ricordo.', 'Aggiungi',
    '+ Ho conosciuto qualcuno', 'Ho conosciuto qualcuno', 'Un nome e una riga', 'Dove vi siete conosciuti, cosa ricordare'],
  pt: ['Escrever para {name}', 'Conversamos hoje · pelo WhatsApp', 'Conversamos hoje · por mensagem', 'Conversamos hoje · por telefone', 'Conversamos hoje · uma nova lembrança',
    'Conversamos hoje · um encontro no plano', 'Nos conhecemos hoje', 'Ainda não há número de {name}', 'Adicione um número e da próxima vez isso abre direto.', 'Número de telefone', 'Salvar número',
    'Só vamos registrar que vocês conversaram se você usar um destes.', 'WhatsApp', 'Telefone', 'Adicionar {name} à Minha gente?', 'O que você escreveu vira a primeira lembrança.', 'Adicionar',
    '+ Conheci alguém', 'Conheci alguém', 'Um nome e uma linha', 'Onde vocês se conheceram, o que lembrar'],
  ja: ['{name}さんに連絡', '今日話した · WhatsAppで', '今日話した · メッセージで', '今日話した · 電話で', '今日話した · 新しい思い出',
    '今日話した · 予定のミーティング', '今日知り合った', '{name}さんの番号はまだありません', '番号を追加すると、次からすぐに開きます。', '電話番号', '番号を保存',
    'どれかを使ったときだけ、話したと記録します。', 'WhatsApp', '電話', '{name}さんを「自分の人たち」に追加しますか？', '書いたことが最初の思い出になります。', '追加する',
    '+ 誰かと知り合った', '誰かと知り合った', '名前と一行', 'どこで会ったか、覚えておきたいこと'],
  'zh-Hans': ['联系{name}', '今天聊过 · 通过WhatsApp', '今天聊过 · 通过消息', '今天聊过 · 通过电话', '今天聊过 · 新的回忆',
    '今天聊过 · 计划中的见面', '今天认识', '还没有{name}的号码', '添加号码，下次就能直接打开。', '电话号码', '保存号码',
    '只有当你用了其中一个，才会记下你们聊过。', 'WhatsApp', '电话', '把{name}加到“我的人”？', '你写的内容会成为第一条回忆。', '添加',
    '+ 我认识了一个人', '我认识了一个人', '一个名字和一句话', '在哪里认识的，要记住什么'],
  'zh-Hant': ['聯絡{name}', '今天聊過 · 透過WhatsApp', '今天聊過 · 透過訊息', '今天聊過 · 透過電話', '今天聊過 · 新的回憶',
    '今天聊過 · 計畫中的見面', '今天認識', '還沒有{name}的號碼', '新增號碼，下次就能直接開啟。', '電話號碼', '儲存號碼',
    '只有當你用了其中一個，才會記下你們聊過。', 'WhatsApp', '電話', '把{name}加到「我的人」？', '你寫的內容會成為第一則回憶。', '新增',
    '+ 我認識了一個人', '我認識了一個人', '一個名字和一句話', '在哪裡認識的，要記住什麼'],
  ar: ['راسِل {name}', 'تواصلنا اليوم · عبر واتساب', 'تواصلنا اليوم · برسالة', 'تواصلنا اليوم · بالهاتف', 'تواصلنا اليوم · ذكرى جديدة',
    'تواصلنا اليوم · لقاء في الخطة', 'تعارفنا اليوم', 'لا يوجد رقم لـ{name} بعد', 'أضف رقمًا، وفي المرة القادمة سيُفتح مباشرة.', 'رقم الهاتف', 'احفظ الرقم',
    'لن نسجّل أنكما تواصلتما إلا إذا استخدمت أحد هذه.', 'واتساب', 'الهاتف', 'إضافة {name} إلى أهلي وأصحابي؟', 'ما كتبته سيكون أول ذكرى.', 'إضافة',
    '+ تعرّفت على شخص', 'تعرّفت على شخص', 'اسم وسطر واحد', 'أين التقيتما، وما الذي تريد تذكّره'],
};
for (const [l, v] of Object.entries(A)) {
  if (v.length !== K.length) throw new Error(l + ' has ' + v.length + ' answers for ' + K.length + ' keys');
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  K.forEach((k, i) => { d[k] = v[i]; });
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
const F = { 'הוסף מספר, ובפעם הבאה זה ייפתח ישר.': 'הוסיפי מספר, ובפעם הבאה זה ייפתח ישר.', 'שמור מספר': 'שמרי מספר',
  'נרשום שדיברתם רק אם תשתמש באחד מאלה.': 'נרשום שדיברתם רק אם תשתמשי באחד מאלה.' };
const X = { 'הוסף מספר, ובפעם הבאה זה ייפתח ישר.': 'הוסיפו מספר, ובפעם הבאה זה ייפתח ישר.', 'שמור מספר': 'שמרו מספר',
  'נרשום שדיברתם רק אם תשתמש באחד מאלה.': 'נרשום שדיברתם רק אם תשתמשו באחד מאלה.', 'מה שכתבת יהיה הזיכרון הראשון.': 'מה שכתבתם יהיה הזיכרון הראשון.' };
for (const [f, add] of [['data/he-f.json', F], ['data/he-x.json', X]]) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  Object.assign(d, add);
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log('done: ' + K.length + ' keys in ' + Object.keys(A).length + ' languages, he-f +' + Object.keys(F).length + ', he-x +' + Object.keys(X).length);
