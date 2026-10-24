/* The journal: notebooks, paper, prompts (24 Oct). Thirty-one strings in
   every language, the Hebrew feminine and plural for the ones that address
   the person, and the English "that day" that had said "today". */
import fs from 'fs';
const K = ['+ מחברת', 'איזה דבר קטן שימח אותך היום?', 'איזה רעיון לא עוזב אותך?', 'אם צריך מאיפה להתחיל: {q}', 'השבוע עוד לא כתבת',
  'השבוע: {n} מתוך 7', 'חיפוש', 'חלומות', 'חלק|נייר', 'יום קודם', 'לא נכתב ביום הזה', 'לדף', 'למחוק את המחברת {name} וכל הדפים בה?',
  'מה היה הרגע הכי טוב היום?', 'מה היית רוצה להגיד לעצמך בעוד שנה?', 'מה היית רוצה לזכור מהיום הזה?', 'מה הצחיק אותך היום?', 'מה חלמת הלילה?',
  'מחברת חדשה', 'מחק את המחברת', 'מי עשה לך טוב השבוע?', 'מכתבים לעצמי', 'משבצות|נייר', 'נייר', 'נקודות|נייר', 'על מה אתה מודה היום?',
  'צור מחברת', 'רעיונות', 'שאלה אחרת', 'שורות|נייר', 'שם המחברת'];
const A = {
  en: ['+ Notebook', 'What small thing made you happy today?', 'What idea won’t leave you alone?', 'If you need somewhere to start: {q}', 'Nothing written this week yet',
    'This week: {n} of 7', 'Search', 'Dreams', 'Plain', 'Day before', 'Nothing written that day', 'To the page', 'Delete the notebook {name} and every page in it?',
    'What was the best moment today?', 'What would you like to tell yourself a year from now?', 'What would you like to remember from today?', 'What made you laugh today?', 'What did you dream last night?',
    'New notebook', 'Delete notebook', 'Who was good to you this week?', 'Letters to myself', 'Squares', 'Paper', 'Dots', 'What are you grateful for today?',
    'Create notebook', 'Ideas', 'Another question', 'Lines', 'Notebook name'],
  de: ['+ Notizbuch', 'Welche Kleinigkeit hat dich heute gefreut?', 'Welche Idee lässt dich nicht los?', 'Falls du einen Anfang brauchst: {q}', 'Diese Woche noch nichts geschrieben',
    'Diese Woche: {n} von 7', 'Suchen', 'Träume', 'Blanko', 'Tag davor', 'An diesem Tag nichts geschrieben', 'Aufs Blatt', 'Das Notizbuch {name} mit allen Seiten löschen?',
    'Was war heute der schönste Moment?', 'Was möchtest du dir in einem Jahr sagen?', 'Woran möchtest du dich von heute erinnern?', 'Worüber hast du heute gelacht?', 'Was hast du letzte Nacht geträumt?',
    'Neues Notizbuch', 'Notizbuch löschen', 'Wer hat dir diese Woche gutgetan?', 'Briefe an mich', 'Kariert', 'Papier', 'Punktraster', 'Wofür bist du heute dankbar?',
    'Notizbuch anlegen', 'Ideen', 'Andere Frage', 'Liniert', 'Name des Notizbuchs'],
  es: ['+ Cuaderno', '¿Qué cosa pequeña te alegró hoy?', '¿Qué idea no te suelta?', 'Si necesitas por dónde empezar: {q}', 'Esta semana aún no has escrito',
    'Esta semana: {n} de 7', 'Buscar', 'Sueños', 'Liso', 'Día anterior', 'Nada escrito ese día', 'A la página', '¿Eliminar el cuaderno {name} y todas sus páginas?',
    '¿Cuál fue el mejor momento de hoy?', '¿Qué te gustaría decirte dentro de un año?', '¿Qué te gustaría recordar de hoy?', '¿Qué te hizo reír hoy?', '¿Qué soñaste anoche?',
    'Cuaderno nuevo', 'Eliminar cuaderno', '¿Quién se portó bien contigo esta semana?', 'Cartas a mí mismo', 'Cuadrícula', 'Papel', 'Puntos', '¿Por qué estás agradecido hoy?',
    'Crear cuaderno', 'Ideas', 'Otra pregunta', 'Rayado', 'Nombre del cuaderno'],
  fr: ['+ Carnet', 'Quelle petite chose t’a fait plaisir aujourd’hui ?', 'Quelle idée ne te lâche pas ?', 'Si tu cherches par où commencer : {q}', 'Rien d’écrit cette semaine',
    'Cette semaine : {n} sur 7', 'Rechercher', 'Rêves', 'Blanc', 'Jour d’avant', 'Rien d’écrit ce jour-là', 'Sur la page', 'Supprimer le carnet {name} et toutes ses pages ?',
    'Quel a été le meilleur moment de la journée ?', 'Que voudrais-tu te dire dans un an ?', 'Que voudrais-tu retenir d’aujourd’hui ?', 'Qu’est-ce qui t’a fait rire aujourd’hui ?', 'De quoi as-tu rêvé cette nuit ?',
    'Nouveau carnet', 'Supprimer le carnet', 'Qui a été bon pour toi cette semaine ?', 'Lettres à moi-même', 'Quadrillé', 'Papier', 'Pointillé', 'De quoi es-tu reconnaissant aujourd’hui ?',
    'Créer le carnet', 'Idées', 'Autre question', 'Ligné', 'Nom du carnet'],
  it: ['+ Quaderno', 'Quale piccola cosa ti ha reso felice oggi?', 'Quale idea non ti lascia?', 'Se ti serve da dove partire: {q}', 'Questa settimana non hai ancora scritto',
    'Questa settimana: {n} su 7', 'Cerca', 'Sogni', 'Bianco', 'Giorno prima', 'Niente scritto quel giorno', 'Sulla pagina', 'Eliminare il quaderno {name} e tutte le sue pagine?',
    'Qual è stato il momento più bello di oggi?', 'Cosa vorresti dirti tra un anno?', 'Cosa vorresti ricordare di oggi?', 'Cosa ti ha fatto ridere oggi?', 'Cosa hai sognato stanotte?',
    'Nuovo quaderno', 'Elimina quaderno', 'Chi è stato buono con te questa settimana?', 'Lettere a me stesso', 'Quadretti', 'Carta', 'Puntini', 'Per cosa sei grato oggi?',
    'Crea quaderno', 'Idee', 'Un’altra domanda', 'Righe', 'Nome del quaderno'],
  pt: ['+ Caderno', 'Que coisa pequena te deixou feliz hoje?', 'Que ideia não te larga?', 'Se precisar de um começo: {q}', 'Nada escrito esta semana ainda',
    'Esta semana: {n} de 7', 'Buscar', 'Sonhos', 'Liso', 'Dia anterior', 'Nada escrito nesse dia', 'Para a página', 'Excluir o caderno {name} e todas as páginas?',
    'Qual foi o melhor momento de hoje?', 'O que você gostaria de dizer a si mesmo daqui a um ano?', 'O que você gostaria de lembrar de hoje?', 'O que te fez rir hoje?', 'O que você sonhou esta noite?',
    'Novo caderno', 'Excluir caderno', 'Quem foi bom com você esta semana?', 'Cartas para mim', 'Quadriculado', 'Papel', 'Pontilhado', 'Pelo que você é grato hoje?',
    'Criar caderno', 'Ideias', 'Outra pergunta', 'Pautado', 'Nome do caderno'],
  ja: ['+ ノート', '今日うれしかった小さなことは？', '頭から離れないアイデアは？', '書き出しに迷ったら：{q}', '今週はまだ書いていません',
    '今週：7日中{n}日', '検索', '夢', '無地', '前の日', 'この日は何も書いていません', 'ページへ', 'ノート「{name}」とすべてのページを削除しますか？',
    '今日いちばん良かった瞬間は？', '1年後の自分に何を伝えたい？', '今日のことで覚えておきたいことは？', '今日笑ったことは？', 'ゆうべどんな夢を見ましたか？',
    '新しいノート', 'ノートを削除', '今週あなたに優しくしてくれたのは誰？', '自分への手紙', '方眼', '紙', 'ドット', '今日感謝していることは？',
    'ノートを作成', 'アイデア', '別の質問', '罫線', 'ノートの名前'],
  'zh-Hans': ['+ 笔记本', '今天有什么小事让你开心？', '哪个想法一直萦绕着你？', '如果不知道从哪儿开始：{q}', '本周还没写',
    '本周：7 天中 {n} 天', '搜索', '梦', '空白', '前一天', '那天什么也没写', '写到页上', '删除笔记本「{name}」及其所有页面？',
    '今天最好的时刻是什么？', '你想对一年后的自己说什么？', '今天有什么想记住的？', '今天什么让你笑了？', '昨晚梦见了什么？',
    '新笔记本', '删除笔记本', '这周谁对你好？', '写给自己的信', '方格', '纸张', '点阵', '今天你感恩什么？',
    '创建笔记本', '想法', '换个问题', '横线', '笔记本名称'],
  'zh-Hant': ['+ 筆記本', '今天有什麼小事讓你開心？', '哪個想法一直縈繞著你？', '如果不知道從哪裡開始：{q}', '本週還沒寫',
    '本週：7 天中 {n} 天', '搜尋', '夢', '空白', '前一天', '那天什麼也沒寫', '寫到頁上', '刪除筆記本「{name}」及其所有頁面？',
    '今天最好的時刻是什麼？', '你想對一年後的自己說什麼？', '今天有什麼想記住的？', '今天什麼讓你笑了？', '昨晚夢見了什麼？',
    '新筆記本', '刪除筆記本', '這週誰對你好？', '寫給自己的信', '方格', '紙張', '點陣', '今天你感恩什麼？',
    '建立筆記本', '想法', '換個問題', '橫線', '筆記本名稱'],
  ar: ['+ دفتر', 'ما الشيء الصغير الذي أسعدك اليوم؟', 'ما الفكرة التي لا تفارقك؟', 'إن احتجت إلى بداية: {q}', 'لم تكتب شيئًا هذا الأسبوع بعد',
    'هذا الأسبوع: {n} من 7', 'بحث', 'أحلام', 'سادة', 'اليوم السابق', 'لم يُكتب شيء في ذلك اليوم', 'إلى الصفحة', 'حذف الدفتر {name} وكل صفحاته؟',
    'ما أجمل لحظة اليوم؟', 'ماذا تحب أن تقول لنفسك بعد عام؟', 'ماذا تحب أن تتذكر من اليوم؟', 'ما الذي أضحكك اليوم؟', 'بماذا حلمت الليلة الماضية؟',
    'دفتر جديد', 'حذف الدفتر', 'من أحسن إليك هذا الأسبوع؟', 'رسائل إلى نفسي', 'مربعات', 'الورق', 'نقاط', 'على ماذا أنت ممتن اليوم؟',
    'إنشاء دفتر', 'أفكار', 'سؤال آخر', 'أسطر', 'اسم الدفتر'],
};
for (const [l, v] of Object.entries(A)) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  K.forEach((k, i) => { d[k] = v[i]; }); delete d['חזרה להיום'];
  if (l === 'en') d['מה היה ביום הזה?'] = 'What happened that day?';
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
const add = (f, m) => { const d = JSON.parse(fs.readFileSync(f, 'utf8')); Object.assign(d, m); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); };
add('data/he-f.json', { 'על מה אתה מודה היום?': 'על מה את מודה היום?', 'מה היית רוצה להגיד לעצמך בעוד שנה?': 'מה היית רוצה להגיד לעצמך בעוד שנה?' });
add('data/he-x.json', { 'על מה אתה מודה היום?': 'על מה אתם מודים היום?', 'השבוע עוד לא כתבת': 'השבוע עוד לא כתבתם',
  'מה היית רוצה להגיד לעצמך בעוד שנה?': 'מה הייתם רוצים להגיד לעצמכם בעוד שנה?', 'מה היית רוצה לזכור מהיום הזה?': 'מה הייתם רוצים לזכור מהיום הזה?',
  'איזה דבר קטן שימח אותך היום?': 'איזה דבר קטן שימח אתכם היום?', 'איזה רעיון לא עוזב אותך?': 'איזה רעיון לא עוזב אתכם?',
  'מה הצחיק אותך היום?': 'מה הצחיק אתכם היום?', 'מה חלמת הלילה?': 'מה חלמתם הלילה?', 'מי עשה לך טוב השבוע?': 'מי עשה לכם טוב השבוע?' });
console.log('done');
