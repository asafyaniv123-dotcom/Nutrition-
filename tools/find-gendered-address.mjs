/* Who is the Hebrew talking to?
 *
 * The first person outside this room gets the app on the 25th, and she is a
 * woman. Hebrew marks gender on the verb and on the pronoun, so every
 * instruction the app gives is addressed to one sex or the other - there is
 * no neutral second person to fall back on. This counts which.
 *
 * A key is the string _t is CALLED with, so escapes are resolved before
 * looking, the way find-crowd-address does it.
 */
import fs from 'fs';

const s = fs.readFileSync(process.argv[2] || 'dev/index.html', 'utf8');

const keys = new Set();
const re = /_t\('((?:[^'\\]|\\.)*)'/g;
let m;
while ((m = re.exec(s))) {
  keys.add(m[1].replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/\\\\/g, '\\'));
}

/* masculine singular: the pronoun, the 2ms future, the 2ms imperative */
const MASC = ['אתה', 'תוכל', 'כתוב', 'בחר', 'לחץ', 'שמור', 'הוסף', 'צלם', 'נסה',
  'המשך', 'הזן', 'עדכן', 'סמן', 'ספר', 'זכור', 'שים', 'קח', 'ענה', 'התחל',
  'בדוק', 'חזור', 'גרור', 'פתח', 'סגור', 'מוכן', 'בטוח', 'תתחיל', 'תראה',
  'רשום', 'הקלד', 'סרוק', 'אמור', 'הכנס', 'עבור', 'דלג', 'סיים'];
const FEM = ['את ', 'תוכלי', 'כתבי', 'בחרי', 'לחצי', 'שמרי', 'הוסיפי', 'צלמי',
  'נסי', 'המשיכי', 'הזיני', 'עדכני', 'סמני', 'ספרי', 'זכרי', 'שימי', 'קחי',
  'עני', 'התחילי', 'בדקי', 'חזרי', 'גררי', 'פתחי', 'סגרי', 'מוכנה', 'בטוחה',
  'רשמי', 'הקלידי', 'סרקי', 'הכניסי', 'עברי', 'דלגי', 'סיימי'];

const isL = c => c !== undefined && /[א-ת]/.test(c);
/* Hebrew glues prefixes on, so a letter BEFORE the word is allowed only when
   it is one of the prefix letters; a letter after means a different word. */
function word(hay, w) {
  let i = -1;
  while ((i = hay.indexOf(w, i + 1)) >= 0) {
    const a = hay[i - 1], b = hay[i + w.length];
    if (!isL(b) && (!isL(a) || 'ובכלמשה'.indexOf(a) >= 0)) return true;
  }
  return false;
}

const mHits = {}, fHits = {};
let mc = 0, fc = 0;
const examples = [];
for (const k of keys) {
  let hit = null;
  for (const w of MASC) if (word(k, w)) { hit = w; break; }
  if (hit) { mc++; mHits[hit] = (mHits[hit] || 0) + 1; if (examples.length < 12) examples.push([hit, k]); }
  for (const w of FEM) if (word(k, w)) { fc++; fHits[w] = (fHits[w] || 0) + 1; break; }
}

console.log('distinct _t keys           : ' + keys.size);
console.log('keys addressing a MAN      : ' + mc);
console.log('keys addressing a WOMAN    : ' + fc);
console.log('\nmost common masculine forms:');
Object.entries(mHits).sort((a, b) => b[1] - a[1]).slice(0, 15)
  .forEach(([w, n]) => console.log('   ' + String(n).padStart(4) + '  ' + w));
console.log('\nwhat she would actually read:');
for (const [w, k] of examples) console.log('   [' + w + ']  ' + k.split('\n')[0].slice(0, 66));
