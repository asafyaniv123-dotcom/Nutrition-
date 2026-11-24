// The words of the two porcelain questions (24 Nov): 26 feelings under the five faces, 8 more states of the
// body, and two lines. English first; the rest from the English. Adjectives keep the masculine the body list
// already used in Spanish, French, Italian and Portuguese; Hebrew gets its feminine (he-f) and plural (he-x)
// forms, including the seven old body words, which never had them.
// usage: node tools/patches/lang-q-mood-body.mjs
import fs from 'node:fs';
const L = ['en', 'de', 'es', 'ja', 'fr', 'it', 'pt', 'zh-Hans', 'zh-Hant', 'ar'];
const T = {
  'מה בדיוק הרגשת?': ['What exactly did you feel?', 'Was genau hast du gefühlt?', '¿Qué sentiste exactamente?', '具体的にはどんな気持ちでしたか？', 'Qu’as-tu ressenti, exactement ?', 'Cosa hai provato, esattamente?', 'O que você sentiu, exatamente?', '具体是什么感受？', '具體是什麼感受？', 'بماذا شعرت بالضبط؟'],
  'עוד רגשות': ['More feelings', 'Weitere Gefühle', 'Más emociones', 'ほかの気持ち', 'Autres émotions', 'Altre emozioni', 'Mais sentimentos', '更多感受', '更多感受', 'مشاعر أخرى'],
  'שמח': ['Happy', 'Glücklich', 'Feliz', 'うれしい', 'Heureux', 'Felice', 'Feliz', '开心', '開心', 'سعيد'],
  'גאה': ['Proud', 'Stolz', 'Orgulloso', '誇らしい', 'Fier', 'Orgoglioso', 'Orgulhoso', '自豪', '自豪', 'فخور'],
  'אסיר תודה': ['Grateful', 'Dankbar', 'Agradecido', '感謝', 'Reconnaissant', 'Grato', 'Grato', '感恩', '感恩', 'ممتن'],
  'נרגש': ['Excited', 'Aufgeregt', 'Emocionado', 'わくわく', 'Enthousiaste', 'Entusiasta', 'Animado', '兴奋', '興奮', 'متحمّس'],
  'מלא תקווה': ['Hopeful', 'Hoffnungsvoll', 'Esperanzado', '希望がある', 'Plein d’espoir', 'Fiducioso', 'Esperançoso', '充满希望', '充滿希望', 'متفائل'],
  'אהוב': ['Loved', 'Geliebt', 'Querido', '愛されている', 'Aimé', 'Amato', 'Amado', '被爱', '被愛', 'محبوب'],
  'סקרן': ['Curious', 'Neugierig', 'Curioso', '好奇心', 'Curieux', 'Curioso', 'Curioso', '好奇', '好奇', 'فضولي'],
  'מסופק': ['Content', 'Zufrieden', 'Satisfecho', '満ち足りた', 'Comblé', 'Appagato', 'Satisfeito', '满足', '滿足', 'راضٍ'],
  'בטוח בעצמי': ['Confident', 'Selbstsicher', 'Seguro de mí', '自信がある', 'Sûr de moi', 'Sicuro di me', 'Confiante', '自信', '自信', 'واثق من نفسي'],
  'שקט|רגש': ['Quiet', 'Still', 'Sereno', '静か', 'Paisible', 'Quieto', 'Quieto', '安静', '安靜', 'ساكن'],
  'מעורב|רגש': ['Mixed', 'Gemischt', 'Con sentimientos encontrados', '複雑', 'Partagé', 'Contrastante', 'Dividido', '复杂', '複雜', 'مشاعر مختلطة'],
  'מבולבל': ['Confused', 'Verwirrt', 'Confundido', '混乱', 'Perdu', 'Confuso', 'Confuso', '困惑', '困惑', 'مرتبك'],
  'משועמם': ['Bored', 'Gelangweilt', 'Aburrido', '退屈', 'Ennuyé', 'Annoiato', 'Entediado', '无聊', '無聊', 'ضجِر'],
  'מפוזר': ['Scattered', 'Zerstreut', 'Disperso', '気が散る', 'Dispersé', 'Distratto', 'Disperso', '心不在焉', '心不在焉', 'مشتّت'],
  'נוסטלגי': ['Nostalgic', 'Nostalgisch', 'Nostálgico', '懐かしい', 'Nostalgique', 'Nostalgico', 'Nostálgico', '怀旧', '懷舊', 'حنين'],
  'עצוב': ['Sad', 'Traurig', 'Triste', '悲しい', 'Triste', 'Triste', 'Triste', '难过', '難過', 'حزين'],
  'מתוסכל': ['Frustrated', 'Frustriert', 'Frustrado', 'もどかしい', 'Frustré', 'Frustrato', 'Frustrado', '沮丧', '沮喪', 'محبط'],
  'לחוץ': ['Stressed', 'Gestresst', 'Estresado', 'ストレス', 'Stressé', 'Stressato', 'Estressado', '有压力', '有壓力', 'مضغوط'],
  'חרד': ['Anxious', 'Ängstlich', 'Ansioso', '不安', 'Anxieux', 'Ansioso', 'Ansioso', '焦虑', '焦慮', 'قلق'],
  'כועס': ['Angry', 'Wütend', 'Enfadado', '怒り', 'En colère', 'Arrabbiato', 'Com raiva', '生气', '生氣', 'غاضب'],
  'בודד': ['Lonely', 'Einsam', 'Solo', '孤独', 'Seul', 'Solo', 'Sozinho', '孤单', '孤單', 'وحيد'],
  'מאוכזב': ['Disappointed', 'Enttäuscht', 'Decepcionado', 'がっかり', 'Déçu', 'Deluso', 'Decepcionado', '失望', '失望', 'خائب الأمل'],
  'מוצף': ['Overwhelmed', 'Überfordert', 'Abrumado', 'いっぱいいっぱい', 'Submergé', 'Sopraffatto', 'Sobrecarregado', '不堪重负', '不堪重負', 'مُثقَل'],
  'אשם': ['Guilty', 'Schuldig', 'Culpable', '罪悪感', 'Coupable', 'In colpa', 'Culpado', '内疚', '內疚', 'مذنب'],
  'פגוע': ['Hurt', 'Verletzt', 'Dolido', '傷ついた', 'Blessé', 'Ferito', 'Magoado', '受伤', '受傷', 'مجروح'],
  'רענן': ['Refreshed', 'Erfrischt', 'Renovado', 'すっきり', 'Reposé', 'Rinfrescato', 'Renovado', '神清气爽', '神清氣爽', 'منتعش'],
  'גמיש': ['Flexible', 'Beweglich', 'Flexible', 'しなやか', 'Souple', 'Agile', 'Flexível', '灵活', '靈活', 'مرن'],
  'קליל|גוף': ['Light', 'Leicht', 'Ligero', '軽い', 'Léger', 'Leggero', 'Leve', '轻盈', '輕盈', 'خفيف'],
  'ישנוני': ['Sleepy', 'Schläfrig', 'Con sueño', '眠い', 'Somnolent', 'Assonnato', 'Com sono', '困倦', '睏倦', 'نعسان'],
  'תפוס|גוף': ['Stiff', 'Steif', 'Rígido', 'こわばっている', 'Raide', 'Rigido', 'Rígido', '僵硬', '僵硬', 'متيبّس'],
  'כאב ראש': ['Headache', 'Kopfschmerzen', 'Dolor de cabeza', '頭痛', 'Mal de tête', 'Mal di testa', 'Dor de cabeça', '头痛', '頭痛', 'صداع'],
  'נפוח': ['Bloated', 'Aufgebläht', 'Hinchado', 'お腹が張る', 'Ballonné', 'Gonfio', 'Inchado', '腹胀', '腹脹', 'منتفخ'],
  'חולה': ['Unwell', 'Krank', 'Enfermo', '体調が悪い', 'Malade', 'Malato', 'Doente', '不舒服', '不舒服', 'مريض'],
};
// feminine and plural Hebrew, for the old seven body words too
const HE = {
  'מה בדיוק הרגשת?': ['מה בדיוק הרגשת?', 'מה בדיוק הרגשתם?'],
  'אנרגטי': ['אנרגטית', 'אנרגטיים'], 'עייף': ['עייפה', 'עייפים'], 'רגוע': ['רגועה', 'רגועים'], 'מתוח': ['מתוחה', 'מתוחים'],
  'כבד|גוף': ['כבדה', 'כבדים'], 'חזק': ['חזקה', 'חזקים'], 'כאוב': ['כאובה', 'כאובים'],
  'רענן': ['רעננה', 'רעננים'], 'גמיש': ['גמישה', 'גמישים'], 'קליל|גוף': ['קלילה', 'קלילים'], 'ישנוני': ['ישנונית', 'ישנוניים'],
  'תפוס|גוף': ['תפוסה', 'תפוסים'], 'נפוח': ['נפוחה', 'נפוחים'],
  'שמח': ['שמחה', 'שמחים'], 'גאה': ['גאה', 'גאים'], 'אסיר תודה': ['אסירת תודה', 'אסירי תודה'], 'נרגש': ['נרגשת', 'נרגשים'],
  'מלא תקווה': ['מלאת תקווה', 'מלאי תקווה'], 'אהוב': ['אהובה', 'אהובים'], 'סקרן': ['סקרנית', 'סקרנים'], 'מסופק': ['מסופקת', 'מסופקים'],
  'בטוח בעצמי': ['בטוחה בעצמי', 'בטוחים בעצמנו'], 'שקט|רגש': ['שקטה', 'שקטים'], 'מעורב|רגש': ['מעורבת', 'מעורבים'],
  'מבולבל': ['מבולבלת', 'מבולבלים'], 'משועמם': ['משועממת', 'משועממים'], 'מפוזר': ['מפוזרת', 'מפוזרים'], 'נוסטלגי': ['נוסטלגית', 'נוסטלגיים'],
  'עצוב': ['עצובה', 'עצובים'], 'מתוסכל': ['מתוסכלת', 'מתוסכלים'], 'לחוץ': ['לחוצה', 'לחוצים'], 'חרד': ['חרדה', 'חרדים'],
  'כועס': ['כועסת', 'כועסים'], 'בודד': ['בודדה', 'בודדים'], 'מאוכזב': ['מאוכזבת', 'מאוכזבים'], 'מוצף': ['מוצפת', 'מוצפים'],
  'אשם': ['אשמה', 'אשמים'], 'פגוע': ['פגועה', 'פגועים'],
};
const sortedWrite = (f, j, add) => { for (const k in add) j[k] = add[k]; fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n'); };
L.forEach((l, i) => {
  const f = 'data/lang/' + l + '.json', j = JSON.parse(fs.readFileSync(f, 'utf8')), add = {};
  for (const k in T) add[k] = T[k][i];
  sortedWrite(f, j, add);
});
[['data/he-f.json', 0], ['data/he-x.json', 1]].forEach(([f, i]) => {
  const j = JSON.parse(fs.readFileSync(f, 'utf8')), add = {};
  for (const k in HE) if (HE[k][i] !== k) add[k] = HE[k][i];
  sortedWrite(f, j, add);
});
console.log('written', Object.keys(T).length, 'keys x', L.length, '+ he-f/he-x');
