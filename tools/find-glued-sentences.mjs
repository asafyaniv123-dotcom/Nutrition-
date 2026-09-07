/* Find sentences that were built by gluing pieces together.

   The shape that breaks in translation is: a translated fragment, then a value,
   then another translated fragment. Each half is meaningless alone and the
   order is fixed by the language it was written in, so no dictionary can
   repair it - agoText was the first of these, and there are more.

   Reports them ranked by how many _t fragments the sentence spans, because
   that is roughly how badly it breaks. */
import fs from 'fs';

const CR = String.fromCharCode(13), LF = String.fromCharCode(10);
/* Takes a path so it can be pointed at an older revision. */
const FILE = process.argv[2] || 'dev/index.html';
const s = fs.readFileSync(FILE, 'utf8').split(CR + LF).join(LF);
const gs = s.indexOf('id="game-src"'), ge = s.indexOf('</script>', gs);
const app = s.slice(0, gs) + s.slice(ge);

/* A _t call, then up to ~60 characters of anything that is not a _t call, then
   another _t call - all inside one expression (no semicolons or line breaks). */
const re = /_t\((['"])((?:(?!\1).)*)\1\)((?:[^;\n]{0,70}?))_t\((['"])((?:(?!\4).)*)\4\)/g;

/* ── a fragment that needs no partner to be one ──
   The pair rule above needs two _t() calls with something between them, so it
   cannot see a single fragment glued to a number: _t('(כעת') + ' ' + n + ')'.
   What gives those away is the punctuation itself. A key that opens a bracket
   and never closes it, or carries one lone quote, is half of something - you
   cannot hand it to a translator and expect a sentence back.

   Balanced punctuation is left alone: "(כשל)" is a complete parenthetical and
   "יעד:" is an ordinary label. Only the unbalanced ones are fragments.

   And a digit welded to a Hebrew letter - 60שני, ~1קג - is the same bug at
   word level, where the number was meant to be a placeholder. */
const LONE = [];
for (const m of app.matchAll(/_t\((['"])((?:(?!\1).)*)\1/g)) {
  const key = m[2];
  const opens = (key.match(/\(/g) || []).length, closes = (key.match(/\)/g) || []).length;
  /* A quote between two Hebrew letters is a GERSHAYIM - the abbreviation mark
     inside קק"ל, ק"ג, מ"ל - not an opening quotation mark. Counting it as one
     made the first version of this rule fire 44 times, nearly all of them on
     the app's own units. */
  const quotes = (key.replace(/(?<=[֐-׿])["׳״](?=[֐-׿])/g, '').match(/["]/g) || []).length;
  /* Likewise the maqaf: ל־100 is Hebrew punctuation joining a word to a number,
     not a placeholder that got welded shut. */
  const welded = key.replace(/[־–-]/g, ' ');
  let why = '';
  if (opens !== closes) why = 'an unclosed bracket';
  else if (quotes % 2) why = 'one lone quote';
  else if (/\d[֐-׿]|[֐-׿]\d/.test(welded)) why = 'a number welded to a word';
  if (why) LONE.push({ line: app.slice(0, m.index).split(LF).length, key, why });
}

const hits = [];
let m;
while ((m = re.exec(app)) !== null) {
  const between = m[3];
  if (!/\+/.test(between)) continue;
  if (/<\/?[a-z]/i.test(between)) continue;         // separated by markup, not one sentence

  /* The overwhelming majority of matches are ARRAYS of labels -
     ['ינואר','פברואר',…] - where all that sits between two _t calls is a comma
     and the empty strings the extraction left behind. Those are independent
     words, each translatable on its own, and nothing is glued.

     A real glued sentence has a VALUE interpolated between the fragments. So
     strip the string literals out of the gap; what remains must still contain
     an identifier. */
  const bare = between.replace(/(['"])(?:(?!\1).)*\1/g, '').replace(/[\s+,]/g, '');
  if (!/[A-Za-z_$]/.test(bare)) continue;
  if (/^[[\]{}:()]*$/.test(bare)) continue;

  /* Two more shapes that look glued and are not.
     An OBJECT LITERAL - {sleep:'שינה', work:'עבודה'} - puts a key between two
     labels, and a key is an identifier, so the test above lets it through.
     A TERNARY chooses between two whole labels rather than joining them.

     Both are recognisable once the string literals are stripped: an object key
     leaves "work:" and a ternary leaves ":allGood?", while a real interpolated
     value leaves "tot.p" or "ms[i].text||". A leading or trailing colon is the
     tell. */
  if (/:$/.test(bare) || /^:/.test(bare)) continue;
  /* An object key whose value is an array or object leaves "m:[" rather than
     "m:" - same shape, one character further along. */
  if (/:[[{]$/.test(bare)) continue;

  /* An ARGUMENT LIST is the last shape that looks glued from outside:
     inputRow(label, id, value, placeholder) puts two _t calls either side of
     real identifiers, so every test above lets it through.

     What separates it from a sentence is the COMMA. A glued sentence is pure
     concatenation and never contains one at the top level, so anything left
     after the bracketed groups and string literals are removed means these are
     arguments rather than prose. */
  const noGroups = between.replace(/\([^()]*\)/g, '').replace(/\[[^\][]*\]/g, '');
  if (/,/.test(noGroups.replace(/(['"])(?:(?!\1).)*\1/g, ''))) continue;

  const line = app.slice(0, m.index).split(LF).length;
  hits.push({ line, a: m[2], between: between.trim(), b: m[5] });
  re.lastIndex = m.index + 1;                        // allow overlapping chains
}

/* group by line so a three-part sentence shows as one finding */
if (LONE.length) {
  console.log('');
  console.log('fragments that are one on their own: ' + LONE.length);
  for (const f of LONE) console.log('    line ' + String(f.line).padStart(6) + '  ' + f.why + '  ' + JSON.stringify(f.key));
}

const byLine = {};
for (const h of hits) (byLine[h.line] = byLine[h.line] || []).push(h);

const rows = Object.entries(byLine)
  .map(([line, hs]) => ({ line: +line, n: hs.length, hs }))
  .sort((a, b) => b.n - a.n || a.line - b.line);

console.log('glued sentences found: ' + rows.length + '  (across ' + hits.length + ' fragment pairs)');
console.log('');
for (const r of rows.slice(0, 22)) {
  const h = r.hs[0];
  const mid = h.between.replace(/\s+/g, ' ').slice(0, 34);
  console.log('  line ' + String(r.line).padStart(6) + '  [' + r.n + ']  ' +
    JSON.stringify(h.a).slice(0, 34) + '  <' + mid + '>  ' + JSON.stringify(h.b).slice(0, 30));
}
