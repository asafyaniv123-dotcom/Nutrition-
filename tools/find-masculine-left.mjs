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
  /* Added after one of them shipped on the first screen of the reflection:
     it opened with בוא, and this list had never heard of it. Found by
     asking the KEY SET which common masculine forms stand alone in it,
     rather than by adding to the list from memory. */
  'בוא','תן','שים',
  /* ספר is four books and one 'tell me' - the planner's opening line. The
     word is here and the four books are named below, because leaving it
     out is how the verb shipped. */
  'ספר',
  /* המשך is the reflection's own continue button, and a noun in three
     greetings, which are named below. */
  'המשך',
  'הראה','שאל','תאר',
  /* Twenty-one found by reading the first word of every unanswered key,
     which is a bounded question the key set can answer - walking the
     screens had been finding them one at a time. הסר was the one that
     looked like a bug in this file and was not: it simply sat missing from
     this list, beside הוסף, which is here. */
  'הסר','העתק','גע','הבחן','החזק','הישאר','הצפן',
  'התמקד','נקה','סנכרן','עדכן','רד','שכפל','שתף',
  'תכנן','בנה','ותר','הרכב','החזר','הפוך','קצץ',
  /* NOT קרא, and not by an allowance: it names the assistant's own action
     in all three keys that hold it - קרא את היום, קרא {from} עד {to} - the
     same case as קורא above, and the set grows with every tool the
     assistant learns. A list that has to grow with a feature rots. */
  /* DELIBERATELY ABSENT, each for a reason that has to hold on its own,
     because a list is the thing that rots:
       ספר   is the noun in all five keys that hold it - ספר המתכונים
       לך    is the dative, and לְךָ and לָךְ are the same letters unpointed
       שלך   the same, in 47 keys; אותך the same, in 12
       עשה, תדע, תעשה   whose subject is the app or the day, not her */
  'אתה','שאתה','ואתה','תוכל','תרצה','תקבל','תמצא','תבחר','תכתוב','תרשום','תוסיף',
  'מרגיש','נמצא','יכול','צריך','חושב','מתאמן','אוהב','זוכר','מוכן','בטוח','עייף',
  'שורף','קורא','לוקח','אוכל','הולך','עובד','לומד','מחפש','בוחר','כותב',
];
/* THE ו IS PART OF THE BOUNDARY, NOT PART OF THE WORD.
   ו is the commonest prefix in Hebrew and it hid a half-turned sentence in
   plain sight: the reminder card reads "קבעי שעה קבועה, ותקבל תזכורת" -
   קבע turned and ותקבל did not - and the first version of this line asked for
   a NON-Hebrew character in front of the word, which the ו is not. One
   optional ו after the boundary is the whole fix. */
const RE = new RegExp('(^|[^' + HEB + '])ו?(' + W.join('|') + ')(?![' + HEB + '])');

/* Not the app talking to her. Each one is here for a reason that has to hold
   up on its own, because a list is the thing that rots.

   A WEAKNESS TO KNOW ABOUT: an allowance excuses a whole KEY, not the word it
   was written for, so a key allowed for one reason is invisible if it later
   turns out to carry a different masculine word. One already did - "שאל על
   אוכל — מה יש בזה?" is here because אוכל is food, and nobody noticed that
   שאל is also an imperative to her. The generator turned it anyway, so it did
   not ship, but nothing here would have said so. An allowance should name the
   word it excuses; that is a change to make before this list grows further. */
const ALLOW = new Set([
  /* ספר the NOUN. The fifth key holding that word - ספר לי מה יש לך בשבוע -
     is the verb, and is not here. */
  '+ הוסף ספר','ספר המתכונים','ספר המתכונים ריק','✓ סיימת לקרוא ספר זה',
  /* המשך the NOUN - a continuation, not an instruction. */
  'המשך יום טוב','שיהיה המשך יום מצוין',
  'כאב בגב תחתון בדדליפט או סקוואט: עצור לגמרי. אלה התרגילים שבהם המשך פוגע.',
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
  /* מלא here is the ADJECTIVE - full width - not the imperative "fill".
     It only became visible when the boundary learned to read past a ו, and
     it is the one false positive that cost. */
  'החזק את הברקוד בתוך המסגרת, קרוב ומלא רוחב',
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
