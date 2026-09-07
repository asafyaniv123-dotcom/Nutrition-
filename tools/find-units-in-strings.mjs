/* Find translatable strings that carry a unit.
 *
 * A unit is not text - it is a consequence of a preference. Writing kg into a
 * sentence asks a translator to know something they cannot see, and it makes
 * the sentence wrong for anyone reading in pounds.
 *
 * This check exists because an earlier sweep claimed to have finished the job
 * and had not. It searched for the LATIN "kg" and missed every Hebrew ק"ג. And
 * the app spells that two ways - with a straight quote and with a gershayim -
 * so even a Hebrew search finds half of them unless it knows to look for both.
 * That is how "ק״ג נפח" survived a commit whose message said it had fixed
 * "kg נפח": different strings, same meaning, one search.
 *
 *     node tools/find-units-in-strings.mjs [file]
 *
 * Exits non-zero when it finds anything.
 *
 * The bare label is allowed. weightUnit() returns _t('ק"ג') for metric, and it
 * should - a German build wants to translate the word, it just must not be
 * welded into a sentence beside a number nobody converted.
 */
import fs from 'fs';

const CR = String.fromCharCode(13), LF = String.fromCharCode(10);
const FILE = process.argv[2] || 'dev/index.html';
const s = fs.readFileSync(FILE, 'utf8').split(CR + LF).join(LF);
const gs = s.indexOf('id="game-src"'), ge = s.indexOf('</script>', gs);
const app = s.slice(0, gs) + s.slice(ge);

/* Both spellings of the Hebrew, and the two the app can display. */
const UNITS = ['ק"ג', String.fromCharCode(1511, 1524, 1490), 'kg', 'lb', 'מ"ל', 'ml'];
const ALLOWED = ['ק"ג', String.fromCharCode(1511, 1524, 1490), 'מ"ל'];

/* A bare unit as its own key was allowed on the reasoning that a unit standing
   alone is not a sentence. That is true of the key and false of the code: the
   weight card's verdict was
       word + " " + n.toFixed(1) + " " + _t("ק״ג") + " " + _t("ב־") + days + …
   which is the glued-unit bug exactly, assembled at run time instead of being
   written out. So the exemption now has a condition — the unit may stand alone
   only if it is not being welded to something else. */
function gluedAt(i) {
  /* The extraction pass wraps every call as ''+_t(x)+'', so those empty strings
     are punctuation, not content, and have to come off before the question can
     be asked. Without that, weightUnit() - whose entire job is to return the
     unit, correctly and alone - reads as glued. */
  const before = app.slice(Math.max(0, i - 40), i).replace(/''\s*\+\s*$/, '').replace(/\s+$/, '');
  const rest = app.slice(i).replace(/^_t\([^)]*\)/, '').replace(/^\s*\+\s*''/, '').replace(/^\s+/, '');
  /* Joined to something on either side that is not just the wrapper. */
  return /\+$/.test(before) || /^\+/.test(rest);
}

const found = new Map();
for (const m of app.matchAll(/_t\((['"])(.*?)\1\s*[,)]/g)) {
  const key = m[2];
  const bare = ALLOWED.indexOf(key) >= 0;
  if (bare && !gluedAt(m.index)) continue;
  const hit = UNITS.filter(u => key.includes(u));
  if (!hit.length) continue;
  const line = app.slice(0, m.index).split(LF).length;
  if (!found.has(key)) found.set(key, { line, units: hit, n: 0, glued: bare });
  found.get(key).n++;
}

console.log('translatable strings carrying a unit: ' + found.size);
if (!found.size) {
  console.log('');
  console.log('  none — every unit comes from weightUnit() or fmtWeight().');
  process.exit(0);
}
console.log('');
for (const [key, v] of found)
  console.log('  line ' + String(v.line).padStart(6) + '  x' + v.n +
              '  [' + v.units.join(' ') + ']  ' + JSON.stringify(key));
process.exit(1);
