/* The tester agreement, version 6 (Asaf approved it on 26 Nov): a bug is
 * reported at once and the rest is noted down for when he asks; "what we see"
 * names everything that is now collected - the how of the evening, errors,
 * and what TestFlight shows. Hebrew, English and German, together.
 *   node tools/patches/testers-terms-6.mjs            apply
 *   node tools/patches/testers-terms-6.mjs --reverse  undo */
import fs from 'fs';
const rev = process.argv.includes('--reverse');
const file = 'testers/index.html';

const PAIRS = [
  [`var TERMS_VERSION = '5';`, `var TERMS_VERSION = '6';`],
  /* ── Hebrew ── */
  [`'לדווח בקבוצה על כל באג, כל מסך מבלבל וכל דבר שהיה חסר לי, גם אם הוא נראה קטן.',`,
   `'לדווח מיד בקבוצה על כל באג: משהו שלא עובד, נתקע או נעלם, גם אם הוא נראה קטן. מסך שבלבל אותי או משהו שהיה חסר לי אני רושם/ת לעצמי במשפט, ומספר/ת כשאסף שואל.',`],
  [`לאילו אזורים נכנסת, אם סיימת את היום, ובאיזו שפה. הכול תחת מספר אקראי של המכשיר, בלי שם, בלי טלפון ובלי מייל, ונמחק אחרי 120 יום.',`,
   `לאילו אזורים נכנסת, אם סיימת את היום, באיזו שפה ובאיזו גרסה. וגם, במספרים בלבד: עד איזה שלב בסיום היום הגעת, כמה זמן זה לקח, באיזו שעה, אם הגעת מהתזכורת, וכמה שאלות ענית. אף פעם לא התשובות עצמן. הכול תחת מספר אקראי של המכשיר, בלי שם, בלי טלפון ובלי מייל, ונמחק אחרי 120 יום.',
       '<b>שגיאות:</b> כשמשהו באפליקציה נשבר, נשלחים הודעת השגיאה, המקום בקוד, המסך והגרסה, כדי שנוכל לתקן גם באג שאף אחד לא דיווח עליו. בלי שום דבר שכתבת. תחת אותו מספר אקראי, ונמחק אחרי 60 יום.',`],
  [`       '<b>מה שלא יוצא מהטלפון:</b>`,
   `       '<b>TestFlight:</b> אפל מראה לנו כמה פעמים האפליקציה הותקנה, נפתחה וקרסה, וכל משוב שתשלח/י דרך TestFlight.',
       '<b>מה שלא יוצא מהטלפון:</b>`],
  /* ── English ── */
  [`'Report in the group every bug, every confusing screen and anything I missed, however small it seems.',`,
   `'Report every bug in the group straight away — anything that does not work, gets stuck or disappears — however small it seems. A screen that confused me, or something I missed, I note down in a sentence and tell Asaf when he asks.',`],
  [`whether you closed the day, and in which language. All under a random number for the device: no name, no phone number, no email. Deleted after 120 days.',`,
   `whether you closed the day, in which language and on which version. And, as numbers only: how far into Day’s end you got, how long it took, at what hour, whether you came from the reminder, and how many questions you answered — never the answers themselves. All under a random number for the device: no name, no phone number, no email. Deleted after 120 days.',
       '<b>Errors:</b> when something in the app breaks, the error message, where in the code it happened, the screen and the version are sent, so we can fix a bug nobody reported. Nothing you wrote. Under the same random number, deleted after 60 days.',`],
  [`       '<b>What never leaves your phone:</b>`,
   `       '<b>TestFlight:</b> Apple shows us how often the app was installed, opened and crashed, and any feedback you send through TestFlight.',
       '<b>What never leaves your phone:</b>`],
  /* ── German ── */
  [`'Jeden Fehler, jeden verwirrenden Bildschirm und alles, was mir gefehlt hat, in der Gruppe melden, auch wenn es klein wirkt.',`,
   `'Jeden Fehler sofort in der Gruppe melden — alles, was nicht funktioniert, hängen bleibt oder verschwindet —, auch wenn es klein wirkt. Einen Bildschirm, der mich verwirrt hat, oder etwas, das mir gefehlt hat, notiere ich mir in einem Satz und erzähle es Asaf, wenn er fragt.',`],
  [`ob du den Tag abgeschlossen hast und in welcher Sprache. Alles unter einer Zufallsnummer des Geräts: kein Name, keine Telefonnummer, keine E-Mail. Gelöscht nach 120 Tagen.',`,
   `ob du den Tag abgeschlossen hast, in welcher Sprache und mit welcher Version. Und, nur als Zahlen: wie weit du beim Tagesabschluss gekommen bist, wie lange es gedauert hat, um welche Uhrzeit, ob du über die Erinnerung gekommen bist und wie viele Fragen du beantwortet hast — nie die Antworten selbst. Alles unter einer Zufallsnummer des Geräts: kein Name, keine Telefonnummer, keine E-Mail. Gelöscht nach 120 Tagen.',
       '<b>Fehler:</b> Wenn in der App etwas kaputtgeht, werden die Fehlermeldung, die Stelle im Code, der Bildschirm und die Version gesendet, damit wir auch einen Fehler beheben können, den niemand gemeldet hat. Nichts von dem, was du geschrieben hast. Unter derselben Zufallsnummer, gelöscht nach 60 Tagen.',`],
  [`       '<b>Was dein Telefon nie verlässt:</b>`,
   `       '<b>TestFlight:</b> Apple zeigt uns, wie oft die App installiert, geöffnet und abgestürzt ist, und jedes Feedback, das du über TestFlight sendest.',
       '<b>Was dein Telefon nie verlässt:</b>`],
];

let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 120)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
