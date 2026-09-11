/* Run the shipped picFromLabel against printed panels whose right answer is
   known. The function is lifted out of dev/index.html rather than retyped, so
   the thing under test is the thing that ships.

       node tools/test-label-panel.mjs [file]

   WHY THIS EXISTS. picFromLabel turns a nutrition panel read off a photograph
   into a food row. The panel is READ, not queried, so any one line of it can
   come back missing, blurred into a negative, or as the string it was printed
   as - and the row it produces is stored in a day and summed into a total.

   The barcode path has kept an all-four-or-none rule from the beginning, and
   says why in its own comment. This path did not, and the consequence was
   visible on the screen: a panel whose protein line could not be read came
   back with p undefined, Math.round made it NaN, JSON.stringify wrote it as
   null, the meal row then printed the literal placeholder "{p}ח" because _t
   hands the hole back when a value is missing, and the day total counted the
   protein as ZERO, because `m.p||0` cannot tell a measured zero from an
   absent one.

   Both numbers, as the rule asks:

       against 5479a3e (the revision with the bug)   3 of 12 fail
       against the fix                               12 of 12 pass

   The three are the two unreadable-line cases and the negative one. Run it
   at an older revision with:  node tools/test-label-panel.mjs old.html
*/
import fs from 'fs';
import vm from 'vm';

const FILE = process.argv[2] || 'dev/index.html';
const src = fs.readFileSync(FILE, 'utf8');

/* picNum arrived with the fix, so the lift starts at whichever comes first
   and an older file simply has one less function in the slice. */
const HEAD = ['function picNum(', 'function picFromLabel(']
  .map((s) => src.indexOf(s)).filter((i) => i >= 0);
const start = Math.min(...HEAD);
const end = src.indexOf('function barcodeLookup(');
if (!HEAD.length || end < 0 || end <= start) throw new Error('could not lift picFromLabel from ' + FILE);

const ctx = { _t: (s) => s, Math, Date, parseFloat, isFinite };
vm.createContext(ctx);
vm.runInContext(src.slice(start, end), ctx);
const picFromLabel = vm.runInContext('picFromLabel', ctx);

/* Each case is a panel and the row it must produce, or null for a panel that
   must be refused. A refused panel is not a dead end: picByTable falls
   through to the food tables, which is a measured number rather than a
   half-read one. */
const CASES = [
  ['per-100 panel, all four',
    { basis: '100g', kcal: 264, p: 8.3, c: 53.6, f: 1.7 },
    { k: 264, p: 8.3, c: 53.6, f: 1.7 },
    'the plain case: nothing to scale, the numbers pass straight through'],

  ['per-serving, 30 g',
    { basis: 'serving', serving_g: 30, kcal: 150, p: 3, c: 20, f: 6 },
    { k: 500, p: 10, c: 66.7, f: 20 },
    'x100/30. Everything is held per 100 g inside the app, so a per-serving panel is divided by the serving it names'],

  ['per-serving, 125 g',
    { basis: 'serving', serving_g: 125, kcal: 120, p: 5, c: 16, f: 3.5 },
    { k: 96, p: 4, c: 12.8, f: 2.8 },
    'a serving LARGER than 100 g scales down, which is the direction that looks wrong and is right'],

  ['printed as strings',
    { basis: '100g', kcal: '264', p: '8.3', c: '53.6', f: '1.7' },
    { k: 264, p: 8.3, c: 53.6, f: 1.7 },
    'a panel is read off a picture, so a number can arrive as the text it was printed as'],

  ['a measured zero stays zero',
    { basis: '100g', kcal: 884, p: 0, c: 0, f: 100 },
    { k: 884, p: 0, c: 0, f: 100 },
    'olive oil really is 0 g protein. This is the case that stops the fix from throwing away good rows'],

  ['a measured zero, per serving',
    { basis: 'serving', serving_g: 14, kcal: 124, p: 0, c: 0, f: 14 },
    { k: 886, p: 0, c: 0, f: 100 },
    'the same, scaled - zero times anything is still a measurement'],

  ['serving basis with no serving size',
    { basis: 'serving', kcal: 150, p: 3, c: 20, f: 6 }, null,
    'there is nothing to divide by, and guessing 100 would be inventing the serving'],

  ['serving size of zero',
    { basis: 'serving', serving_g: 0, kcal: 150, p: 3, c: 20, f: 6 }, null,
    'the same, arriving as a number rather than as nothing'],

  ['no energy',
    { basis: '100g', kcal: 0, p: 3, c: 20, f: 6 }, null,
    'a food with no calories at all is a panel that was not read, not a food'],

  ['energy read, protein not',
    { basis: '100g', kcal: 264, c: 53.6, f: 1.7 }, null,
    'THE BUG. Used to return p:NaN, which reached the screen as a literal {p} and the day total as 0'],

  ['energy read, nothing else',
    { basis: '100g', kcal: 264 }, null,
    'the same failure, complete rather than partial'],

  ['a macro read as negative',
    { basis: '100g', kcal: 264, p: -2, c: 53.6, f: 1.7 }, null,
    'a blur across the line, not a food that owes you protein'],
];

let bad = 0;
for (const [name, panel, want, why] of CASES) {
  const got = picFromLabel(panel, 'x');
  let ok;
  if (want === null) ok = got === null;
  else ok = !!got && got.k === want.k && got.p === want.p && got.c === want.c && got.f === want.f;
  if (!ok) bad++;
  const shown = got ? JSON.stringify({ k: got.k, p: got.p, c: got.c, f: got.f }) : 'refused';
  console.log((ok ? '  ok   ' : '  FAIL ') + name.padEnd(32) + shown);
  if (!ok) console.log('         wanted ' + (want === null ? 'refused' : JSON.stringify(want)) + ' - ' + why);
}
console.log('');
console.log((CASES.length - bad) + '/' + CASES.length + ' panels read as they should be  (' + FILE + ')');
if (bad) process.exit(1);
