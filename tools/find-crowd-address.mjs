/* Hebrew that speaks to a CROWD in an app that speaks to one person.
 *
 *     node tools/find-crowd-address.mjs [file]
 *
 * The app's voice is singular throughout - "מעקב דברים שאתה אוהב", "לכתוב כל
 * יום מה שבא", "מה שתוריד רק נעלם מהמסך". The reminder card used to say
 * "קבעו שעה קבועה, ותקבלו תזכורת יומית", which is the plural, and ALL TEN
 * TRANSLATIONS had read it as singular and informal - German "Leg fest / dich",
 * Spanish "Fija / recibirás", French "Fixe / tu recevras", Chinese 提醒你.
 * Nobody heard a crowd. Only Hebrew marks it on the verb, so only Hebrew can
 * show it - and Hebrew is its own key, so no language file can report it
 * missing and no other check here can see it either.
 *
 * A KEY IS THE STRING _t IS CALLED WITH, not the source between the quotes.
 * The recipe placeholder is written 'למשל:\nחממו שמן...' - a backslash and an
 * n in the source, a line break at runtime - so the character sitting in front
 * of חממו is the LETTER n, and a word boundary that expects whitespace or
 * punctuation there matches nothing. The first version of this scan reported
 * one hit across the whole file and that was why. Escapes are resolved first.
 *
 * THIS IS A WORD LIST RATHER THAN A GRAMMAR, so it is a floor and not a sweep:
 * it finds what it knows and says how many words it knew. That is stated in
 * the output on purpose, because a list is the thing that rots.
 *
 * Proved before it is believed: it is run against two planted plurals and must
 * find both, and against three singular strings from the same screens and must
 * find none.
 */
import fs from 'fs';

const CR = String.fromCharCode(13), LF = String.fromCharCode(10);
const FILE = process.argv[2] || 'dev/index.html';
const raw = fs.readFileSync(FILE, 'utf8').split(CR + LF).join(LF);
/* The game is a standalone document with its own voice. */
const gs = raw.indexOf('id="game-src"'), ge = raw.indexOf('</script>', gs);
const app = raw.slice(0, gs) + ' '.repeat(ge - gs) + raw.slice(ge);

/* Plural imperatives an app reaches for, and the plural futures and pronouns
   that follow them in a sentence. */
const WORDS = [
  'קבעו', 'בחרו', 'לחצו', 'הוסיפו', 'כתבו', 'נסו', 'הזינו', 'שמרו', 'סמנו',
  'הקלידו', 'בדקו', 'זכרו', 'צלמו', 'מלאו', 'סרקו', 'גררו', 'פתחו', 'סגרו',
  'התחילו', 'המשיכו', 'עצרו', 'ענו', 'רשמו', 'הביטו', 'שימו', 'קחו', 'תנו',
  'ותקבלו', 'תקבלו', 'תוכלו', 'תראו', 'תמצאו', 'תרצו', 'שלכם', 'שלכן', 'אתכם',
  'חממו', 'ערבבו', 'קצצו', 'חתכו', 'בשלו', 'טגנו', 'אפו', 'קררו', 'הניחו',
  'יצקו', 'סננו', 'טחנו', 'מרחו', 'פזרו', 'הפכו', 'הגישו', 'תבלו', 'שטפו',
  'קלפו', 'הקציפו',
];
const RE = new RegExp('(?:^|[\\s"\'>,.:;(\\[-])(' + WORDS.join('|') + ')(?:$|[\\s"\'<,.:;)\\]!?-])');

/* A RECIPE BODY IS NOT THE APP TALKING. The instructions placeholder shows an
   example of the text a person would type into the field, and every language
   wrote it in its own cooking register: German and French used the infinitive
   - "Öl in der Pfanne erhitzen", "Faire chauffer" - Japanese the dictionary
   form, Chinese the bare verb, and Spanish, Italian, Portuguese and Arabic the
   singular imperative. Hebrew's cooking register is the PLURAL, which is what
   this holds, and it is the counterpart of German's infinitive rather than a
   slip. Eleven languages, eleven house styles, all of them right.

   Spelled out here rather than kept in a head, and kept short on purpose. */
const RECIPE_REGISTER = ['למשל:\nחממו שמן במחבת...\nהוסיפו בצל...'];

const unescape = (s) =>
  s.replace(/\\n/g, LF).replace(/\\t/g, '\t').replace(/\\(['"\\])/g, '$1');

(function selfTest() {
  const bad = [
    'קבעו שעה קבועה, ותקבלו תזכורת יומית לסכם את היום.',
    'למשל:\nחממו שמן במחבת...',
  ];
  const good = [
    'מעקב דברים שאתה אוהב',
    'מה שתוריד רק נעלם מהמסך',
    'קבע שעה קבועה, ותקבל תזכורת יומית לסכם את היום.',
  ];
  let caught = 0, fp = 0;
  for (const b of bad) if (RE.test(b)) caught++;
  for (const g of good) if (RE.test(g)) fp++;
  if (caught !== bad.length || fp)
    throw new Error('self-test failed: ' + caught + '/' + bad.length + ' found, ' + fp + ' false');
})();

const seen = new Set(), hits = [];
for (const m of app.matchAll(/_t\((['"])((?:(?!\1).)*)\1/g)) {
  const key = unescape(m[2]);
  if (!/[֐-׿]/.test(key) || seen.has(key)) continue;
  seen.add(key);
  if (RECIPE_REGISTER.indexOf(key) >= 0) continue;
  const w = key.match(RE);
  if (w) hits.push({ line: app.slice(0, m.index).split(LF).length, w: w[1], key });
}

console.log('Hebrew speaking to a crowd: ' + hits.length +
            '   (across ' + seen.size + ' Hebrew keys, against ' + WORDS.length +
            ' plural forms - a floor rather than a sweep)');
if (!hits.length) {
  console.log('');
  console.log('  none — the app addresses one person everywhere.');
  process.exit(0);
}
console.log('');
for (const h of hits)
  console.log('    line ' + String(h.line).padStart(6) + '  [' + h.w + ']  ' +
              JSON.stringify(h.key).slice(0, 88));
process.exit(1);
