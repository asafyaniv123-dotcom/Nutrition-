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

const found = new Map();
for (const m of app.matchAll(/_t\((['"])(.*?)\1\s*[,)]/g)) {
  const key = m[2];
  if (ALLOWED.indexOf(key) >= 0) continue;
  const hit = UNITS.filter(u => key.includes(u));
  if (!hit.length) continue;
  const line = app.slice(0, m.index).split(LF).length;
  if (!found.has(key)) found.set(key, { line, units: hit, n: 0 });
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
