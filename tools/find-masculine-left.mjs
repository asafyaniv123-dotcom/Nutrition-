// A WORD THE APP STILL SAYS TO HER IN THE MASCULINE.
//
// data/he-f.json is built by a rule that fires on an imperative at the START
// of a clause. That rule is right about where an imperative usually stands
// and blind to where it sometimes does: after "+ ", after "ואז", after a full
// stop inside a longer sentence. Four strings got through it, and one of them
// came out HALF turned - "כתבי בפלוס, ואז גרור ללוח" - the first verb hers
// and the second not, which is worse than leaving the sentence alone.
//
// I found those four by rendering every area in the feminine and reading the
// screen. This is that reading, as a check.
//
// WHAT IT ASKS, per key the app can say:
//   if the overlay answers it  -> does the ANSWER still carry a masculine
//                                 word? that is a half-turned sentence.
//   if it does not answer it   -> does the KEY carry one, anywhere, not only
//                                 at the start? that is one the rule missed.
//
// It carries an allow-list, spelled out below, because a list is the thing
// that rots and this one has to be arguable in the open: the app's own voice
// ("חושב…"), impersonal sentences ("צריך לאשר הרשאה"), and adjectives whose
// subject is a masculine noun ("פירוק בטוח", "הגיבוי מוכן"). Those are not
// the app talking to her and must not change.
//
//     node tools/find-masculine-left.mjs [dev/index.html]
//
// Against the overlay as it stood before the four were written by hand it
// reports 4; against the fixed one, 0.
import fs from 'fs';

const SRC = process.argv.find((a) => a.endsWith('.html')) || 'dev/index.html';
const OVERLAY = 'data/he-f.json';
const HEB = '֐-׿';

/* the masculine words that mean the app is addressing HER */
const W = [
  'כתוב','שמור','גרור','בחר','סמן','מחק','ערוך','פתח','סגור','רשום','נסה','צלם',
  'לחץ','קבע','בדוק','אשר','צרף','עצור','שלח','דלג','חזור','סיים','גלול','הוסף',
  'הזן','הקלד','הכנס','התחל','הפעל','העלה','השלם','הרחב','הגדר','הצג','קום','זכור',
  'תקן','חפש','סרוק','בטל','הורד','החלף','מלא',
  'אתה','שאתה','ואתה','תוכל','תרצה','תקבל','תמצא','תבחר','תכתוב','תרשום','תוסיף',
  'מרגיש','נמצא','יכול','צריך','חושב','מתאמן','אוהב','זוכר','מוכן','בטוח','עייף',
  'שורף','קורא','לוקח','אוכל','הולך','עובד','לומד','מחפש','בוחר','כותב',
];
const RE = new RegExp('(^|[^' + HEB + '])(' + W.join('|') + ')(?![' + HEB + '])');

/* Not the app talking to her. Each one is here for a reason that has to hold
   up on its own, because a list is the thing that rots. */
const ALLOW = new Set([
  'חושב…',                                                     /* the app thinking */
  'חושב מהחלבון שהמוצר מצהיר עליו ומהערך ל־100 גרם — לא הערכה.',/* the app thinking */
  'מחפש','מחפש…','מחפש גם לפי המשמעות…',                        /* the app searching */
  'קורא את הספרות…','קורא את התמונה…','קורא מה כתבת…',           /* the app reading */
  'מסתכל על התמונה…',                                           /* the app looking */
  'פירוק בטוח',                                                 /* adjective on פירוק */
  'הגיבוי מוכן',                                                /* adjective on גיבוי */
  'לא הצלחתי לטעון את קורא הספרות. אפשר להקליד אותן למטה.',      /* קורא הספרות = the reader */
  'הסרטון לא נמצא על המכשיר. אפשר להקליט חדש.',                 /* subject הסרטון */
  'המוצר {code} לא נמצא במאגר.','לא נמצא במאגר.',               /* subject המוצר */
  'המודול הזה נמצא בפיתוח','זה תמיד עובד.','לאן זה הולך',        /* subject is a thing */
  'צריך לפחות 2 אימונים לגרף',                                  /* impersonal */
  'כדי לקבל התראה על מסך הטלפון צריך לאשר הרשאה.',              /* impersonal */
  'מה צריך להביא, עם מי, מה להגיד, מה לא לשכוח...',             /* impersonal */
  'מה החודש צריך להחזיק, ומתי',                                 /* subject החודש */
  'עד שקיימת גרסת האפליקציה, קיצור דרך באייפון יכול לשלוח את הצעדים לשרת. זה פיגום לבדיקות, לא חלק מהמוצר.',
  'זה יכול להיות רגע, מקום, אדם, משהו שעשית — או פשוט תמונה שמרגישה כמו היום שעבר עליך.',
  'שאל על אוכל — מה יש בזה?','אוכל',                            /* אוכל = food */
  'הערכה של גודל המנה. תקן אם צריך, וזה ייזכר.',                /* צריך impersonal */
  'תרגיל שלא מרגיש נכון אחרי שתי ניסיונות — החלף אותו היום ותברר אחר כך.',
  'כתוב לפחות מספר אחד.',                                       /* מספר = a number */
  'לאן הולך הזמן',
  'בוקר מלא באנרגיה',
  'גיבוי מלא עם התמונות',
  'עדיף אימון קצר שהיה מאשר אימון מלא שלא.',
  'איך העולם באמת עובד',
  'מי שמתאמן כדי לגדול נמצא בדרך כלל בין {lo} ל־{hi} סטים לשריר בשבוע. זה טווח, לא ציון — וריצה או שחייה לא נמדדות בו.',
  'שקילה אחת ביום, באותה שעה. אחרי כשבוע יופיע כאן קו שמראה לאן זה הולך — משקל יומי בודד הוא בעיקר מים.',
  'עוד {n} ימים ואפשר יהיה לומר לאן זה הולך. עד אז זה בעיקר מים.',
  'אם זה קורה שלושה אימונים ברצף — הבעיה היא שינה, אוכל או עומס, לא האימון.',
  'כבר שמור',
  'הפסים לא נקראו. קורא את הספרות…',
  'אם גם זה לא הולך: השלם את הסטים שנשארו במשקל שאתה שולט בו והפסק שם.',
  /* A BUTTON'S NAME is not an imperative addressed to her. "press Scan" and
     "press Search" quote a label; the word inside the quote belongs to the
     button, not to the sentence, and turning it would rename the button. */
  'ואז לחץ סרוק',
  'אבל זה לא מסתדר עם ספרת הביקורת. תקן מה שצריך ולחץ חפש.',
  /* and אוכל here is food, which the word list cannot tell from "you eat" */
  'לא זיהיתי אוכל בתמונה. נסה מקרוב יותר, או כתוב מה אכלת.',
]);

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

let over = {};
try { over = JSON.parse(fs.readFileSync(OVERLAY, 'utf8')); } catch {}

const half = [], missed = [];
for (const k of keysOf(SRC)) {
  if (ALLOW.has(k)) continue;
  const v = over[k];
  if (v !== undefined) { if (RE.test(v)) half.push([k, v]); }
  else if (RE.test(k)) missed.push(k);
}

for (const [k, v] of half) console.log('  half turned  ' + v);
for (const k of missed)     console.log('  still his    ' + k);

const n = half.length + missed.length;
console.log(n
  ? '\n' + n + ' string(s) the app still says to her in the masculine' +
    ' (' + half.length + ' half turned, ' + missed.length + ' untouched)'
  : '  none — every sentence the app addresses her with is hers.');
process.exit(n ? 1 : 0);
