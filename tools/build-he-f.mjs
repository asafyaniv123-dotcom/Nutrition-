// BUILD THE FEMININE HEBREW OVERLAY.
//
// The app speaks Hebrew in the masculine singular. Asaf chose to ask the
// person how to address her and to keep a second Hebrew rather than neuter
// the first, so this writes that second Hebrew.
//
// It is an OVERLAY, not a language: it holds only the keys whose Hebrew
// actually changes, and _t falls through to the masculine text for everything
// else - which is already what _t does for a missing key, so nothing new had
// to be taught to the lookup.
//
// It lives at data/he-f.json rather than in data/lang/, on purpose: it is not
// a language anyone picks, and a partial file in that folder would make
// build-lang-template --check report every key it does not carry as a gap.
//
// WHAT IT CHANGES. Only whole words, from an explicit table - never a rule
// applied to a shape. Hebrew without niqqud spells many second-person past
// forms identically for both genders (ענית, אמרת, עשית), so those are absent
// from the table and correctly left alone. Infinitives are absent too, which
// is what keeps לשמור from being rewritten when שמור is.
//
//     node tools/build-he-f.mjs          write data/he-f.json
//     node tools/build-he-f.mjs --check  fail if it is stale
import fs from 'fs';
import path from 'path';

const SRC = process.argv.find((a) => a.endsWith('.html')) || 'dev/index.html';
const OUT = 'data/he-f.json';

/* masculine singular → feminine singular, whole words only */
/* IMPERATIVES ONLY, and only where an imperative can actually stand.
   Everything else was tried and thrown away: a Hebrew verb agrees with its
   SUBJECT, and the subject of 'הסרטון לא נמצא' or 'זה תמיד עובד' is not the
   reader. A table cannot know that, and unpointed Hebrew hides the
   difference - אוכל is both 'food' and 'you eat', מספר is both 'a number'
   and 'tells', החלק is both 'the part' and 'slide'. The sentences that
   address her in any other way are answered by hand in FIX. */
const W = {
  'כתוב': 'כתבי', 'שמור': 'שמרי', 'גרור': 'גררי', 'בחר': 'בחרי',
  'סמן': 'סמני', 'מחק': 'מחקי', 'ערוך': 'ערכי', 'פתח': 'פתחי',
  'סגור': 'סגרי', 'רשום': 'רשמי', 'נסה': 'נסי', 'צלם': 'צלמי',
  'לחץ': 'לחצי', 'קבע': 'קבעי', 'בדוק': 'בדקי', 'אשר': 'אשרי',
  'צרף': 'צרפי', 'עצור': 'עצרי', 'שלח': 'שלחי', 'דלג': 'דלגי',
  'חזור': 'חזרי', 'סיים': 'סיימי', 'גלול': 'גללי', 'הוסף': 'הוסיפי',
  'הזן': 'הזיני', 'הקלד': 'הקלידי', 'הכנס': 'הכניסי', 'התחל': 'התחילי',
  'הפעל': 'הפעילי', 'העלה': 'העלי', 'השלם': 'השלימי', 'הרחב': 'הרחיבי',
  'הגדר': 'הגדירי', 'הצג': 'הציגי', 'קום': 'קומי', 'זכור': 'זכרי',
  'תקן': 'תקני', 'חפש': 'חפשי', 'סרוק': 'סרקי', 'בטל': 'בטלי',
  /* בוא is a cohortative rather than a plain imperative - "let's take a
     moment" - and it is how the reflection opens, which is the first
     sentence of the thing the app is for. */
  'בוא': 'בואי', 'תן': 'תני', 'שים': 'שימי',
  /* המשך is the button under every question of the reflection, and it is
     also a noun in three greetings. The rule only fires at a clause
     opening, which keeps 'שיהיה המשך' and 'שבהם המשך' out of its way;
     'המשך יום טוב' opens its own string and is named in KEEP. */
  'המשך': 'המשיכי',
  /* the last screen of the reflection, the button that asks the assistant
     anything, and two placeholders */
  'הראה': 'הראי', 'שאל': 'שאלי', 'תאר': 'תארי',
  /* Twenty-one more, found by asking the key set for the first word of
     every key the overlay does not answer - 821 distinct words, read once -
     rather than by walking into them one screen at a time. Each was checked
     against EVERY key that holds it, not only the ones that open with it. */
  'הסר': 'הסירי', 'העתק': 'העתיקי', 'גע': 'געי',
  'הבחן': 'הבחיני', 'החזק': 'החזיקי', 'הישאר': 'הישארי',
  'הצפן': 'הצפיני', 'התמקד': 'התמקדי', 'נקה': 'נקי',
  'סנכרן': 'סנכרני', 'עדכן': 'עדכני', 'רד': 'רדי',
  'שכפל': 'שכפלי', 'שתף': 'שתפי', 'תכנן': 'תכנני',
  'בנה': 'בני', 'ותר': 'ותרי', 'הרכב': 'הרכיבי',
  'החזר': 'החזירי', 'הפוך': 'הפכי', 'קצץ': 'קצצי',
};
/* WRITTEN BY HAND. Every sentence that addresses her in any way other than a
   plain opening imperative - because agreement runs through a whole sentence
   and no table can carry it: את takes שורפת, מרימה, עובדת, לוקחת.
   Counted before writing: 151 keys the rule can do, 43 it cannot.
   Deliberately absent, and so left in the masculine: the app's own voice
   ("חושב…"), impersonal sentences ("צריך לאשר הרשאה"), and adjectives whose
   subject is a masculine noun ("פירוק בטוח", "הגיבוי מוכן"). */
const FIX = {
  /* ספר is the verb here and a book in four other keys, so it cannot be a
     rule: ספרי is 'my books', and ספר המתכונים would become 'my recipe
     books'. This is the planner's first sentence. */
  'ספר לי מה יש לך בשבוע, ואבנה לוח שמחזיק את הכול.':
    'ספרי לי מה יש לך בשבוע, ואבנה לוח שמחזיק את הכול.',
  /* Found by rendering every area in the feminine and scanning what was
     actually on the screen, not by reading the table. The rule fires on an
     imperative at the START of a clause, and these four stand where it does
     not look: after "+ ", after "ואז", and after a full stop inside a longer
     sentence. One of them had been HALF feminised - "כתבי בפלוס, ואז גרור
     ללוח" - which is worse than not at all. */
  '+ הוסף אדם': '+ הוסיפי אדם',
  /* The same two shapes as the four above, found by the check after the
     twenty-one words joined the rule: a verb after "+ ", which is not a
     clause opening the rule can see, and two verbs standing mid-sentence
     after ו and after או. The second one had been HALF turned - סיימי with
     שמור and בנה left behind it - which is the worse state. */
  '+ הרכב ארוחה חדשה': '+ הרכיבי ארוחה חדשה',
  '+ בנה אימון מראש': '+ בני אימון מראש',
  'סיים אימון חדש ושמור אותו, או בנה אחד מראש.':
    'סיימי אימון חדש ושמרי אותו, או בני אחד מראש.',
  'החלף מצלמה': 'החליפי מצלמה',
  'או הקלד את הספרות שמתחת לפסים': 'או הקלידי את הספרות שמתחת לפסים',
  'ואז לחץ סרוק': 'ואז לחצי סרוק',
  '+ הוסף מרכיב מהספרייה': '+ הוסיפי מרכיב מהספרייה',
  '+ הוסף': '+ הוסיפי',
  'או צלם את הצלחת': 'או צלמי את הצלחת',
  'או בחר תמונה מהגלריה': 'או בחרי תמונה מהגלריה',
  '+ הוסף פריט': '+ הוסיפי פריט',
  'הורד פלטה': 'הורידי פלטה',
  'או לחץ כאן אם סיימת': 'או לחצי כאן אם סיימת',
  '+ הוסף סט': '+ הוסיפי סט',
  '+ הוסף תרגיל': '+ הוסיפי תרגיל',
  'החלף לתרגיל שעובד על אותו שריר. למטה האפשרויות לפי מה שכנראה פנוי.':
    'החליפי לתרגיל שעובד על אותו שריר. למטה האפשרויות לפי מה שכנראה פנוי.',
  'הורד 10–20% מהמשקל והשלם את החזרות המתוכננות.':
    'הורידי 10–20% מהמשקל והשלימי את החזרות המתוכננות.',
  'החלף תרגיל': 'החליפי תרגיל',
  'נא הזן שם מתכון': 'נא הזיני שם מתכון',
  'החלף תמונה': 'החליפי תמונה',
  'או כתוב בעצמך...': 'או כתבי בעצמך...',
  'מלא שם ותאריך': 'מלאי שם ותאריך',
  'נא הזן שם': 'נא הזיני שם',
  'כשיש לך תובנה על החיים — תרשום אותה כאן.': 'כשיש לך תובנה על החיים — תרשמי אותה כאן.',
  'אני קורא עכשיו...': 'אני קוראת עכשיו...',
  '+ הוסף ספר': '+ הוסיפי ספר',
  'או סמן והעתק ידנית:': 'או סמני והעתיקי ידנית:',
  'או כתוב במילים שלך': 'או כתבי במילים שלך',
  'אבל זה לא מסתדר עם ספרת הביקורת. תקן מה שצריך ולחץ חפש.':
    'אבל זה לא מסתדר עם ספרת הביקורת. תקני מה שצריך ולחצי חפש.',
  'לא זיהיתי אוכל בתמונה. נסה מקרוב יותר, או כתוב מה אכלת.':
    'לא זיהיתי אוכל בתמונה. נסי מקרוב יותר, או כתבי מה אכלת.',
  'לא הצלחתי לקרוא את זה. נסה לנסח אחרת, או חפש ידנית.':
    'לא הצלחתי לקרוא את זה. נסי לנסח אחרת, או חפשי ידנית.',
  'כתוב למטה, ואז גרור לשעה. מה שנכתב כאן נשאר כאן ולא עולה לטבלה השבועית.':
    'כתבי למטה, ואז גררי לשעה. מה שנכתב כאן נשאר כאן ולא עולה לטבלה השבועית.',
  'כתוב בפלוס, ואז גרור ללוח.': 'כתבי בפלוס, ואז גררי ללוח.',
  'יעד התחלתי. מלא פרטים בפרופיל ואחשב אותו לפיך':
    'יעד התחלתי. מלאי פרטים בפרופיל ואחשב אותו לפייך',
  'מלא את כל הפרטים למעלה ואחשב לך יעד קלוריות ומאקרו.':
    'מלאי את כל הפרטים למעלה ואחשב לך יעד קלוריות ומאקרו.',
  'בדיוק מה שאתה שורף': 'בדיוק מה שאת שורפת',
  'איפה אתה מתאמן': 'איפה את מתאמנת',
  'כמה אתה מרים בכל תרגיל': 'כמה את מרימה בכל תרגיל',
  'אחרי האימון הראשון יופיע כאן כל תרגיל עם המשקל שאתה עובד איתו. אפשר יהיה גם להקליד אותו ידנית.':
    'אחרי האימון הראשון יופיע כאן כל תרגיל עם המשקל שאת עובדת איתו. אפשר יהיה גם להקליד אותו ידנית.',
  'איך תרצה לקרוא לתוכנית?': 'איך תרצי לקרוא לתוכנית?',
  'כמה פעמים בשבוע אתה מתאמן?': 'כמה פעמים בשבוע את מתאמנת?',
  'הפעם הראשונה שאתה עושה את זה': 'הפעם הראשונה שאת עושה את זה',
  'עוד לא רשמת את התרגיל הזה. אחרי האימון הראשון יופיע כאן איפה אתה עומד.':
    'עוד לא רשמת את התרגיל הזה. אחרי האימון הראשון יופיע כאן איפה את עומדת.',
  'הורד סט מכל תרגיל לפני שאתה מוריד תרגיל שלם.':
    'הורידי סט מכל תרגיל לפני שאת מורידה תרגיל שלם.',
  'אני לא בטוח בטכניקה': 'אני לא בטוחה בטכניקה',
  'הורד למשקל שבו אתה יכול לעשות את התנועה לאט ובשליטה מלאה.':
    'הורידי למשקל שבו את יכולה לעשות את התנועה לאט ובשליטה מלאה.',
  'תרגיל שלא מרגיש נכון אחרי שתי ניסיונות — החלף אותו היום ותברר אחר כך.':
    'תרגיל שלא מרגיש נכון אחרי שתי ניסיונות — החליפי אותו היום ותבררי אחר כך.',
  'מה אני אוהב בו/בה': 'מה אני אוהבת בו/בה',
  'תמונות ומילים של מה שאתה רוצה לראות קורה': 'תמונות ומילים של מה שאת רוצה לראות קורה',
  'מה אתה רוצה לראות קורה?': 'מה את רוצה לראות קורה?',
  'אם היית צריך לתת ליום הזה ציון — איזה ציון הוא מקבל?':
    'אם היית צריכה לתת ליום הזה ציון — איזה ציון הוא מקבל?',
  'מה אתה לוקח': 'מה את לוקחת',
  'מה אתה לוקח מהיום הזה למחר?': 'מה את לוקחת מהיום הזה למחר?',
  'על מה אתה אסיר תודה היום?': 'על מה את אסירת תודה היום?',
  'במה אתה הכי גאה היום?': 'במה את הכי גאה היום?',
  'אם היית יכול לחזור לרגע אחד היום — מה היית עושה אחרת?':
    'אם היית יכולה לחזור לרגע אחד היום — מה היית עושה אחרת?',
  'איך אתה עכשיו': 'איך את עכשיו',
  'איך אתה מרגיש עכשיו, ברגע הזה?': 'איך את מרגישה עכשיו, ברגע הזה?',
  'מה היה שם היום שאתה בדרך כלל לא שם לב אליו — ובלעדיו היום היה נראה אחרת?':
    'מה היה שם היום שאת בדרך כלל לא שמה לב אליו — ובלעדיו היום היה נראה אחרת?',
  'הרגע הכי טוב, מה שהשפיע, במה אתה גאה': 'הרגע הכי טוב, מה שהשפיע, במה את גאה',
  'מעקב דברים שאתה אוהב': 'מעקב דברים שאת אוהבת',
  'מי אתה?': 'מי את?',
  /* these the rule reached, but only as far as the first word */
  'צלם את הבגדים שלך אחד אחד. כל שורה היא סוג אחד — גלגל אותה עד שהפריט שאתה רוצה באמצע, וכל השורות ביחד הן הלוק.':
    'צלמי את הבגדים שלך אחד אחד. כל שורה היא סוג אחד — גלגלי אותה עד שהפריט שאת רוצה באמצע, וכל השורות ביחד הן הלוק.',
  'אם גם זה לא הולך: השלם את הסטים שנשארו במשקל שאתה שולט בו והפסק שם.':
    'אם גם זה לא הולך: השלימי את הסטים שנשארו במשקל שאת שולטת בו והפסיקי שם.',
  'אתה בתוך הטווח. חזור על {w} ונסה להוסיף חזרה.':
    'את בתוך הטווח. חזרי על {w} ונסי להוסיף חזרה.',
  'התחל להוסיף את האנשים שאתה רוצה לזכור ולהיות נוכח בחיים שלהם.':
    'התחילי להוסיף את האנשים שאת רוצה לזכור ולהיות נוכחת בחיים שלהם.',
  'הוסף את הספר שאתה קורא': 'הוסיפי את הספר שאת קוראת',
};

/* Keys that must not change at all, whatever the table says. */
const KEEP = new Set([
  /* המשך the NOUN, opening its own string, where the rule would otherwise
     read it as the imperative and write 'המשיכי יום טוב'. */
  'המשך יום טוב',
]);

const HEB = '֐-׿';
const bounded = (w) =>
  new RegExp('(^|(?<=[.,:!?—–\-] )|(?<=^ו)|(?<=[.,:!?] ו))' + w + '(?![' + HEB + '])', 'g');
const RULES = Object.keys(W)
  .sort((a, b) => b.length - a.length)          // longest first: שאתה before אתה
  .map((w) => [bounded(w), '$1' + W[w]]);

export function feminise(s) {
  let out = s;
  for (const [re, to] of RULES) out = out.replace(re, to);
  return out;
}

/* every string _t is CALLED with, escapes resolved - a key is the string at
   runtime, not the source between the quotes */
function keysOf(src) {
  const s = fs.readFileSync(src, 'utf8');
  const keys = new Set();
  const re = /_t\(\s*(['"])((?:[^'"\\]|\\.)*?)\1/g;
  let m;
  while ((m = re.exec(s))) {
    let k = m[2];
    try { k = JSON.parse('"' + k.replace(/"/g, '\\"').replace(/\\'/g, "'") + '"'); } catch {}
    keys.add(k);
  }
  return [...keys];
}

const built = {};
for (const k of keysOf(SRC)) {
  if (KEEP.has(k)) continue;
  if (Object.prototype.hasOwnProperty.call(FIX, k)) {
    if (FIX[k] !== k) built[k] = FIX[k];
    continue;
  }
  let f = feminise(k);
  if (f === k) continue;
  /* a key may carry a context after a bar - 'מחק|מברשת'. The bar is part of
     the KEY, never of the answer: _t returns a dictionary value as it stands,
     and only a fallback strips the bar. */
  const bar = f.indexOf('|');
  if (bar > 0) f = f.slice(0, bar);
  built[k] = f;
}
const text = JSON.stringify(built, null, 2) + '\n';

if (process.argv.includes('--check')) {
  let now = '';
  try { now = fs.readFileSync(OUT, 'utf8'); } catch {}
  if (now !== text) {
    console.log('data/he-f.json is stale — run: node tools/build-he-f.mjs');
    process.exit(1);
  }
  console.log('he-f is current: ' + Object.keys(built).length + ' keys differ');
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, text);
  console.log(Object.keys(built).length + ' keys differ -> ' + OUT);
}
