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
};
/* WRITTEN BY HAND. Every sentence that addresses her in any way other than a
   plain opening imperative - because agreement runs through a whole sentence
   and no table can carry it: את takes שורפת, מרימה, עובדת, לוקחת.
   Counted before writing: 151 keys the rule can do, 43 it cannot.
   Deliberately absent, and so left in the masculine: the app's own voice
   ("חושב…"), impersonal sentences ("צריך לאשר הרשאה"), and adjectives whose
   subject is a masculine noun ("פירוק בטוח", "הגיבוי מוכן"). */
const FIX = {
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
const KEEP = new Set([]);

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
