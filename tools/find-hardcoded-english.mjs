/* Find English written straight into the markup.
 *
 * This is the hole the other checks cannot cover. find-unwrapped-hebrew looks
 * for HEBREW that never reaches _t(), which is most of what gets missed - but
 * a hardcoded ENGLISH word has no key to be missing, and no language file can
 * reveal it. Twice that has shipped:
 *
 *   "Exercises"        a heading among German ones, on the workout summary
 *   "1.1p 20.2c 0.3f"  on every meal row, in all eleven languages
 *
 * Both were found by driving a screen in German and reading it. Nothing else
 * could have.
 *
 * Two shapes, because those two bugs have two shapes.
 *
 *   1. Text between two tags.  '>Exercises</div>'
 *   2. Prose concatenated between two values.  +m.p+'p '+m.c+'c '+m.f+'f'
 *      The second never sits between tags, so the first rule cannot see it.
 *
 * Takes a file path, so it can be pointed at an older revision - which is how
 * both rules were shown to detect the bug they were written for rather than
 * being trusted because they reported nothing:
 *
 *     rule 1, against 71ee1e8~1   "Exercises", line 12999
 *     rule 2, against bf7e84f     'p ' and 'c ', line 6838 and 6864
 *     both, against this revision  silent
 */
import fs from 'fs';

const CR = String.fromCharCode(13), LF = String.fromCharCode(10);
const FILE = process.argv[2] || 'dev/index.html';
const s = fs.readFileSync(FILE, 'utf8').split(CR + LF).join(LF);
const gs = s.indexOf('id="game-src"'), ge = s.indexOf('</script>', gs);
/* The game is a standalone document with its own language and is never
   translated; it is excluded from every check here for the same reason. */
const app = s.slice(0, gs) + s.slice(ge);
const lineOf = (i) => app.slice(0, i).split(LF).length;

/* ── English that is meant to stay English ──
   Two kinds, and they are different.

   PROPER NOUNS name something that has one name everywhere: the app itself,
   and a platform it talks to. Translating those would be wrong.

   The rest are a DESIGN CHOICE, not an oversight: the habit tracker and the
   vision board are laid out as a paper spread, and their headings are set in
   English as part of that drawing. They are recorded in TODO.md as Asaf's
   call, and they are listed here rather than quietly skipped so that the
   decision stays visible to whoever reads this next.

   A list is the thing that rots. Add a real string to it and this check goes
   quiet about that string forever, so add one only with a reason. */
const KEPT = [
  'Better Me', 'Better', 'Apple Health',                       // proper nouns
  'HABIT TRACKER', 'THIS MONTH I WILL', 'NOTES',               // the paper spread
  'progress, not perfection', 'VISION BOARD',
  'Become the best version of yourself',
];

/* ── 1. text sitting between two tags ── */
const BETWEEN = [];
for (const m of app.matchAll(/>([A-Za-z][A-Za-z0-9 ,.!?&:%()\/-]{2,60})</g)) {
  const txt = m[1].trim();
  /* three letters together, or it is a code, an id or a number with a suffix */
  if (!/[A-Za-z]{3,}/.test(txt)) continue;
  if (KEPT.indexOf(txt) >= 0) continue;
  BETWEEN.push({ line: lineOf(m.index), txt });
}

/* ── 2. prose concatenated between two values ──
   Pure letters and spaces, no markup character anywhere in it - that is what
   separates "p " from a class name, a style fragment or an attribute.

   It must hold a space or be three letters long. Without that, 'w'+w+'d'+dw
   reports: a single letter glued to a number is how this file builds a
   storage key, and a key is not text. */
const GLUED = [];
for (const m of app.matchAll(/\+\s*'([A-Za-z][A-Za-z ]{0,22})'\s*\+/g)) {
  const txt = m[1];
  if (txt.indexOf(' ') < 0 && txt.length < 3) continue;
  if (KEPT.indexOf(txt.trim()) >= 0) continue;
  GLUED.push({ line: lineOf(m.index), txt });
}

if (BETWEEN.length) {
  console.log('English written between two tags: ' + BETWEEN.length);
  for (const f of BETWEEN)
    console.log('    line ' + String(f.line).padStart(6) + '  ' + JSON.stringify(f.txt));
}
if (GLUED.length) {
  if (BETWEEN.length) console.log('');
  console.log('English concatenated between two values: ' + GLUED.length);
  for (const f of GLUED)
    console.log('    line ' + String(f.line).padStart(6) + '  ' + JSON.stringify(f.txt));
}
if (!BETWEEN.length && !GLUED.length) console.log('no hardcoded English found');
if (BETWEEN.length || GLUED.length) process.exit(1);
