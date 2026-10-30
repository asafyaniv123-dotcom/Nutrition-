/* English answers for the Hebrew rewording of 29 Oct (audit items 10-60).
 * The keys were renamed with their old English kept; this writes the English
 * the new wording means. English is the pivot every other language is
 * written from, so it is written as an original, not as a gloss of the
 * Hebrew. Keys whose English already said it well are left alone.
 *
 *   node tools/reword-en.mjs          # writes data/lang/en.json
 *   node tools/reword-en.mjs --list   # prints old -> new, writes nothing */
import fs from 'fs';
export const EN = {
  'התמונה הגדולה של הימים שלך': 'The bigger picture of your days',
  'החוגה הזאת היא היום שלך.': 'This dial is your day.',
  'מה היית רוצה שיקרה?': 'What would you like to happen?',
  'תמונות ומילים של מה שהיית רוצה שיקרה': "Pictures and words of what you'd like to happen",
  'מצב הרוח שלך היה יציב החודש.': 'Your mood held steady this month.',
  'סוף החודש היה כבד יותר מתחילתו.': 'The month ended heavier than it began.',
  'כמה שאלות בערב, ומבט על היום': 'A few questions in the evening, and a look at the day',
  'החישוב יצא נמוך מדי, אז העליתי את היעד למינימום בטוח': 'The calculation came out too low, so I raised the target to a safe minimum',
  'מעכשיו אלה היעדים שלך': 'From now on, these are your targets',
  'פירוק מדויק': 'Precise breakdown',
  'פירוק משוער': 'Estimated breakdown',
  'עד כמה היום שלך היה כמו שתכננת?': 'How close was today to what you planned?',
  'כמה זה דומה לתוכנית': 'how close it came to the plan',
  'איך עבר היום': 'How the day went',
  'איך עבר עליך היום?': 'How did your day go?',
  'כמה נקודות ציון לפי הסדר — ככה תזכור אותו.': "A few landmarks, in order — that's how you'll remember it.",
  'מהלך היום': 'How the day went',
  'יש משפט שנשאר איתך היום?': 'Is there a line that stayed with you today?',
  'מה מהיום הזה תרצה לקחת איתך למחר?': 'What from today would you like to take into tomorrow?',
  'מה לוקחים למחר': 'what to take into tomorrow',
  'הוסף את האנשים שחשוב לך לזכור ולשמור איתם על קשר.': 'Add the people you want to remember and stay in touch with.',
  'מהתשובות מצטיירת תמונה של מי שאתה': 'Your answers draw a picture of who you are',
  'זה יכול להיות רגע, מקום, אדם, משהו שעשית — או פשוט תמונה שמזכירה לך את היום שעבר עליך.': 'It could be a moment, a place, a person, something you did — or simply a picture that brings back the day you had.',
  'איזו תמונה הכי מסכמת את היום שלך?': 'Which picture sums up your day best?',
  'התמונה שמסכמת את היום': 'The picture that sums up the day',
  'כמה דקות רק בשבילך.': 'A few minutes, just for you.',
  'בוא נעצור רגע ונסתכל על היום שלך.': "Let's pause for a moment and look at your day.",
  'השעון והאפליקציות שלך כבר מעדכנים את אפליקציית בריאות, אז רק אותה צריך לחבר:': 'Your watch and apps already update the Health app, so that is the only one to connect:',
  'שמור אותו גם מחוץ לטלפון': 'Keep a copy off the phone too',
  'אי אפשר לשחזר אותו — לא אני ולא אף אחד אחר.': 'It cannot be recovered — not by me, not by anyone.',
  'תשובה אחת, והמספרים כאן יותאמו אליך ולא לאדם ממוצע': 'One answer, and the numbers here fit you rather than an average person',
  'לפני שנתחיל, כמה שאלות קצרות, כדי שהמספרים יתאימו לך.': 'Before we start, a few short questions so the numbers fit you.',
  'מאיזו מדינה לחפש מוצרים? לא חייבת להיות זו שבה נולדת.': "Which country should products come from? It doesn't have to be where you were born.",
  'אשר את המבנה': 'Approve the structure',
  'המבנה מאושר, עכשיו מתכננים את הימים': 'Structure approved — now plan the days',
  'אין מה להוסיף — אפשר לבנות': 'Nothing to add — ready to build',
  'מספרים לו מה יש השבוע, והוא בונה לו״ז מלא. אחר כך מאשרים מה נכנס.': 'Tell it what your week holds and it builds a full schedule. Then you approve what goes in.',
  'או לתת למתכנן לבנות את הלו״ז.': 'Or let the planner build the schedule.',
  'ב־+ שומרים משימות בצד.': 'Use + to keep tasks on the side.',
  'טווח: {h}. הדברים הקבועים, כולל זמן הדרך: {list}.': 'Range: {h}. Fixed commitments, including travel time: {list}.',
  'כמה אתה באמת יכול, לא כמה היית רוצה. עדיף תוכנית שמחזיקה.': "What you can really do, not what you'd like to. A plan that holds beats one that breaks.",
  'מה אתה רוצה להשיג?': 'What do you want to achieve?',
  'זה יוצא בערך {n} סטים לשריר בשבוע, ולגדילה צריך לפחות {lo}. עוד אימון, או עוד עשרים דקות, יסגרו את הפער.': 'That works out at about {n} sets per muscle a week, and growth needs at least {lo}. One more session, or twenty more minutes, closes the gap.',
  'הם תרגילים שהקלדת בעצמך, ולכן לא ידוע איזה שריר הם עובדים. בחירה מהספרייה תשייך אותם.': "Those are exercises you typed in yourself, so it isn't known which muscle they work. Picking them from the library will assign one.",
  'המספר מתעדכן לבד מכל אימון שתסיים. אפשר גם להקליד אותו — והאימון הבא יעדכן אותו שוב.': 'The number updates itself from every workout you finish. You can also type it in — and the next workout will update it again.',
  'לא הגעת לטווח באף סט: חזור למשקל של האימון הקודם.': "Didn't reach the range on any set: go back to last session's weight.",
  'בסט אחד או שניים לא הגעת לטווח: המשך באותו משקל בפעם הבאה.': 'Missed the range on a set or two: stay at the same weight next time.',
  'צלם את עצמך מהצד. זה יעזור יותר מכל הסבר.': 'Film yourself from the side. It will help more than any explanation.',
  'שמור על התרגיל המורכב הראשון: בו נמצאת רוב התועלת של האימון.': "Keep the first compound lift: it's where most of the session's benefit lies.",
  'חשוב להבדיל: שריר שנשרף ומתעייף זה בסדר. כאב חד, דוקר, או במפרק עצמו — לא.': "It's important to tell them apart: a muscle burning and tiring is fine. Sharp or stabbing pain, or pain in the joint itself, is not.",
  'בפעם הקודמת עשית {s}. גם ימים פחות טובים הם חלק מהדרך.': 'Last time you did {s}. Weaker days are part of the way too.',
  'אפשר לבחור יותר מאחת. לפיהן אקבע את טווח החזרות, את המנוחה ואת הקפיצה במשקל.': "You can pick more than one. I'll set the rep range, the rest and the weight step from them.",
  'כאן אתה בונה אימון, עוקב אחרי המשקלים ורואה את ההתקדמות לאורך זמן. כמה שאלות קצרות, ואתאים את זה אליך.': "This is where you build a workout, track your weights and watch your progress over time. A few short questions, and I'll tailor it to you.",
  'נשמר. נשאל על זה כל ערב.': "Saved. We'll ask about it every evening.",
  'מה שמסומן כאן תישאל עליו כל ערב. השאר מחכה בצד, ואפשר לפתוח אותו מתי שבא לך. שום דבר לא נמחק.': "You'll be asked about what's ticked here every evening. The rest waits on the side — open it whenever you like. Nothing is deleted.",
  'מעקב אחרי מה שאתה אוהב לעשות': 'Track what you love doing',
  'כמה זזת היום': 'How much you moved today',
  'מזמן לא דיברת עם {name}': "You haven't talked to {name} in a while",
  'היום יום ההולדת של {name}. הודעה קטנה ממך יכולה לשמח מאוד.': "It's {name}'s birthday today. A short message from you could really make them happy.",
  'הודעה קטנה ממך יכולה לשמח מאוד.': 'A short message from you could really make them happy.',
  'תוצאות דומות': 'Similar results',
  'תוצאות שמכילות את מה שכתבת': 'Results containing what you wrote',
  'קורא את היום': 'Reading the day',
  'קורא את היעדים שלך': 'Reading your targets',
  'מה קרה, מה שכנע אותך...': 'What happened, what convinced you…',
  'מתוך התשובות שלך לשאלות ההעמקה': 'From your answers to the deeper questions',
  'לא הצלחתי לענות על זה. נסה לשאול שאלה ממוקדת יותר.': "I couldn't answer that. Try asking a more focused question.",
  'רואים לאורך השבועות למה אתה מקדיש זמן': 'See over the weeks what you spend your time on',
  'מי שחשובים לך, כדי שלא תאבד קשר עם אף אחד.': "The people who matter to you, so you don't lose touch with anyone.",
  'בגד שתוסיף עכשיו יישמר תחת {season}': 'A garment you add now is filed under {season}',
  'פספסת אתמול, אבל יום החסד שמר על הרצף.': 'You missed yesterday, but the grace day kept your streak.',
  'ולא אמור להיות': "and isn't meant to be",
  'ערב נפלא': 'A lovely evening',
  'צהריים נפלאים': 'A lovely afternoon',
};
if (process.argv[1] && process.argv[1].endsWith('reword-en.mjs')) {
  const f = 'data/lang/en.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  let n = 0, miss = 0;
  for (const k in EN) {
    if (!(k in d)) { console.log('NOT A KEY: ' + k); miss++; continue; }
    if (process.argv.includes('--list')) console.log(JSON.stringify(d[k]) + '\n  -> ' + JSON.stringify(EN[k]));
    if (d[k] !== EN[k]) n++;
    d[k] = EN[k];
  }
  if (miss) process.exit(1);
  if (!process.argv.includes('--list')) fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
  console.log(n + ' English answers rewritten');
}
