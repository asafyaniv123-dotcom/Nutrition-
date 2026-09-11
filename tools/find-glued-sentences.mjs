/* Find sentences that were built by gluing pieces together.

   The shape that breaks in translation is: a translated fragment, then a value,
   then another translated fragment. Each half is meaningless alone and the
   order is fixed by the language it was written in, so no dictionary can
   repair it - agoText was the first of these, and there are more.

   Reports them ranked by how many _t fragments the sentence spans, because
   that is roughly how badly it breaks. */
import fs from 'fs';

const CR = String.fromCharCode(13), LF = String.fromCharCode(10);
const BS = String.fromCharCode(92);       // a literal backslash, in source text
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
  /* A key carrying its own line breaks is a worked EXAMPLE - the placeholder
     that shows what to type into the recipe box, "למשל:\n200ג עוף\n1 בצל..."
     - and the welded-number rule fires on it every time, because 200ג is
     exactly what a person would write. An example is not a sentence cut in
     half, which is what this rule is for, and it was the single finding that
     kept this check from being able to fail at all. */
  const example = key.indexOf(BS + 'n') >= 0;
  let why = '';
  if (opens !== closes) why = 'an unclosed bracket';
  else if (quotes % 2) why = 'one lone quote';
  else if (!example && /\d[֐-׿]|[֐-׿]\d/.test(welded)) why = 'a number welded to a word';
  if (why) LONE.push({ line: app.slice(0, m.index).split(LF).length, key, why });
}

const hits = [];
let m;
while ((m = re.exec(app)) !== null) {
  /* Rewind so every _t gets a turn as the left half of a pair.
     Without this a match CONSUMES its text even when the filters below throw it
     away, so a real glued sentence sitting after a false one on the same line
     is never examined. That is what hid "עברו {n} ימים": the ternary before it
     matched first, was correctly discarded, and took the real pair with it. */
  re.lastIndex = m.index + 1;
  const between = m[3];
  if (!/\+/.test(between)) continue;
  /* Markup between two fragments usually means two blocks rather than one
     sentence - </div><div>, or a span wrapping a value. <br> is the
     exception and has to stay in: a line break is how one sentence gets laid
     across two lines, and skipping it hid

         _t('התחל להוסיף…')+'<br>'+_t('ולהיות נוכח בחיים שלהם.')

     which reads as one sentence in Hebrew because the second half opens
     with ו, and comes apart in German, where "willst" wants a finite
     clause and got an infinitive. */
  if (/<\/?[a-z]/i.test(between.replace(/<br\s*\/?>/gi, ' '))) continue;

  /* The overwhelming majority of matches are ARRAYS of labels -
     ['ינואר','פברואר',…] - where all that sits between two _t calls is a comma
     and the empty strings the extraction left behind. Those are independent
     words, each translatable on its own, and nothing is glued.

     A real glued sentence has a VALUE interpolated between the fragments. So
     strip the string literals out of the gap; what remains must still contain
     an identifier. */
  /* A fragment that ends in a full stop is a finished SENTENCE, and nothing is
     glued to it - what follows is the next sentence, not the rest of this one.
     Three complete sentences concatenated with spaces look exactly like a glued
     pair from the gap alone, which is what this tells apart. A real fragment
     stops mid-clause: ", RPE ממוצע" opens with a comma and closes on nothing. */
  if (/[.!?]["'׳״)\]]?\s*$/.test(m[2])) continue;

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

/* ── one sentence, laid across two lines ──
   The pair rule above wants a VALUE between the fragments and throws away a
   pair with only punctuation between them, because that is what an array of
   labels looks like. A line break is neither: it is one sentence broken for
   layout, and it breaks in translation the same way a glued one does - the
   second half is written to continue the first, and no other language is
   obliged to break in the same place or at all. */
const BR = [];
for (const m of app.matchAll(
  /_t\((['"])((?:(?!\1).)*)\1\)[^;\n]{0,12}?<br\s*\/?>[^;\n]{0,12}?_t\((['"])((?:(?!\3).)*)\3\)/g)) {
  const a = m[2], b = m[4];
  /* Most pairs either side of a <br> are two FINISHED sentences that happen to
     share a block - "No saved workouts yet." / "Finish one and save it." -
     and nothing is glued. What marks a real continuation is the same thing
     that marks a lone fragment: the punctuation.

     A second half opening with the Hebrew ו, "and", cannot stand alone and
     was written to continue the first. So can a first half that stops on a
     comma or a dash. Everything else is two sentences. */
  if (!/^ו[֐-׿]/.test(b) && !/[,:;־–-]\s*$/.test(a)) continue;
  BR.push({ line: app.slice(0, m.index).split(LF).length, a, b });
}
if (BR.length) {
  console.log('');
  console.log('one sentence split across a line break: ' + BR.length);
  for (const f of BR)
    console.log('    line ' + String(f.line).padStart(6) + '  ' + JSON.stringify(f.a) + '  +<br>+  ' + JSON.stringify(f.b));
}

/* ── a plural chosen by hand ──
   n===1 ? _t(singular) : _t(plural). The pair rule cannot see this: the value
   sits BEFORE both fragments and only a colon sits between them, so the "must
   contain an identifier" filter throws it away. That is how

       days.length +' '+ (days.length===1?_t('יום'):_t('ימים')) +' '+ _t('שכתבת בהם')

   put "1 Tag an denen du geschrieben hast" on a German screen.

   It is a bug on its own terms too, not only a glued one. A ternary has two
   branches; CLDR gives Hebrew three plural categories and Arabic six, so "2
   ימים" can never become "יומיים". _t already selects a category with
   Intl.PluralRules whenever a key answers with an object, so the fix is to
   make it a plural key and pass the count.

   Narrowed by two things, both learned from what it reported on its first
   run. The test has to compare against 1 - `_cmCelebrate===2` chooses between
   "goal completed" and "milestone completed" and is a mode flag, not a count.
   And the two branches have to BEGIN alike, which a singular and a plural of
   one word do - יום/ימים, פעם/פעמים, אימון/אימונים - and two different words
   do not: `_cropQ.length>1?_t('דלג'):_t('ביטול')` is skip versus cancel.
   With both, the two false pairs go quiet and all six real ones stay. */
const PLU = [];
const PLU_RE = new RegExp(
  '([A-Za-z_$][\\w.$\\[\\]]*)\\s*(?:===|==|!==|!=|>|<|>=|<=)\\s*1\\s*\\?' +
  '([^;' + LF + ']{0,200})', 'g');
const PLU_T = /_t\((['"])((?:(?!\1).)*)\1\)/g;
for (const m of app.matchAll(PLU_RE)) {
  const ts = [...m[2].matchAll(PLU_T)].map((x) => x[2]);
  if (ts.length < 2) continue;
  const a = ts[0], b = ts[1];
  if (a === b || a[0] !== b[0]) continue;
  PLU.push({ line: app.slice(0, m.index).split(LF).length, count: m[1], a, b });
}
if (PLU.length) {
  console.log('');
  console.log('a plural chosen by hand rather than by a plural key: ' + PLU.length);
  for (const f of PLU)
    console.log('    line ' + String(f.line).padStart(6) + '  ' + f.count + '  ' +
      JSON.stringify(f.a) + ' / ' + JSON.stringify(f.b));
}

/* ── a counted noun that never tries to inflect ──
   The rule above catches a plural chosen BADLY. This catches one not chosen
   at all: `now.sets +' '+ _t('סטים')`, which prints the plural form whatever
   the number is. "1 Sätze" on My Numbers, "1 Portionen" on a recipe, "1
   Sekunden" on a one-second vlog. Twenty-four of these shipped.

   The noun usually has to KEEP its bare key, because most of them are also
   labels - a table header, a form field - and a label is not counted. So the
   fix is a second key, `{n} noun`, or the same key answered with plural
   categories and the count passed in; _t selects on vars.n whether or not the
   key prints it.

   Three narrowings, each from a false positive this reported:

   1. The noun comes AFTER the number. All eleven shipped languages put the
      count first, Japanese and Chinese included, so `_t('שיא')+' '+st.best`
      is "best: 3" - a label and a value, not a counted noun. Same for
      `_t('עמוד')+' '+q.page`.
   2. Exactly one space between them, or none. Anything else means they are
      not adjacent at all: `'+at+')">'+_t('ערוך')` is an onclick argument
      ending just before a button label.
   3. One word. A phrase that happens to follow a number is not a counted
      noun - "steps per day" and "cannot be loaded" are invariant however
      many precede them.

   And a closed list of UNITS, which do not inflect in any of the eleven and
   are find-units-in-strings' ground rather than this one's. It is a list and
   lists rot, so it is spelled out here rather than hidden in a helper: if a
   real counted noun is ever added to it, this rule goes quiet about it. */
const UNIT = ['קק"ל', 'קלוריות', 'גרם', 'ג', 'קג', 'ק"ג', 'מ"ל', 'מל',
              'דק', 'דקה', 'ש׳', 'שעה', 'חלבון', 'פחמ׳', 'שומן', 'סמ', 'ס"מ'];
const CNT = [];
const CNT_RE = new RegExp(
  '([A-Za-z_$][\\w.$\\[\\]]*(?:\\([^()]*\\))?)' +
  '\\s*\\+\\s*(?:([\'"]) \\2\\s*\\+\\s*)?' +
  '_t\\((\'[^\']*\'|"[^"]*")\\)', 'g');
for (const m of app.matchAll(CNT_RE)) {
  const key = m[3].slice(1, -1);
  if (!key || key.indexOf('{') >= 0) continue;          // already a whole key
  if (!/^[֐-׿][֐-׿'׳״"]*$/.test(key)) continue;          // one Hebrew word
  if (UNIT.indexOf(key) >= 0) continue;
  CNT.push({ line: app.slice(0, m.index).split(LF).length, count: m[1], key });
}
if (CNT.length) {
  console.log('');
  console.log('a count printed beside a noun that cannot inflect: ' + CNT.length);
  for (const f of CNT)
    console.log('    line ' + String(f.line).padStart(6) + '  ' + f.count +
      " + _t('" + f.key + "')");
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

/* This check printed its findings and exited 0, so nothing it found could
   ever fail a build - and the one finding it always had, a worked example, is
   why. With that example no longer reported, it can say so properly. */
if (rows.length || BR.length || LONE.length || PLU.length || CNT.length) process.exit(1);
