/* One face across the app (Asaf, 27 Nov 2026): "this font should be the rule everywhere, except where
 * the person writes something deep herself - Insights, the journal, סיום יום - where a different face
 * feels more personal." The app had two faces: Assistant everywhere, and Frank Ruhl Libre in the places
 * she writes. That is the rule he gave, except for two screens where the serif had spread to things she
 * does not write: the progress sheet (a book's cover, its last page and quote) and the books shelf.
 * Those return to the app's face; the writing places keep theirs:
 *   kept - .rf-* / .rfq-* / .rfb-* / .rff-* (סיום יום), .sm4-* (its summary), .ins-ta (Insights),
 *          .jb-dt (journal), .door .dr-lined / .dr-fol (the first run's own reflection question)
 * usage: node tools/patches/one-face.mjs [file] [--reverse]
 */
import fs from 'node:fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  [String.raw`.prg .bcov b{font-family:"Frank Ruhl Libre",Georgia,serif;font-size:14px;`,
   String.raw`.prg .bcov b{font-size:14px;font-weight:700;`],
  [String.raw`.prg .qt{margin-bottom:9px;padding:11px 14px 9px;border-radius:16px;font-family:"Frank Ruhl Libre",Georgia,serif;font-size:15px;`,
   String.raw`.prg .qt{margin-bottom:9px;padding:11px 14px 9px;border-radius:16px;font-size:15px;`],
  [String.raw`.prg .finb{font-family:"Frank Ruhl Libre",Georgia,serif;font-size:22px;`,
   String.raw`.prg .finb{font-size:22px;`],
  [String.raw`.prg .pg p{margin:0;font-family:"Frank Ruhl Libre",Georgia,serif;font-size:15px;`,
   String.raw`.prg .pg p{margin:0;font-size:15px;`],
  [String.raw`  background:var(--c);color:#3d3630;font-family:"Frank Ruhl Libre",serif;font-weight:700;font-size:16px;`,
   String.raw`  background:var(--c);color:#3d3630;font-weight:700;font-size:16px;`],
  [String.raw`.bka-t{font-family:"Frank Ruhl Libre",serif;font-size:20px;`,
   String.raw`.bka-t{font-size:20px;`],
  [String.raw`.bkn-x b{font-family:"Frank Ruhl Libre",serif;font-size:15.5px;`,
   String.raw`.bkn-x b{font-size:15.5px;`],
  [String.raw`.bk-q-t{font-family:"Frank Ruhl Libre",serif}`,
   String.raw`.bk-q-t{}`],
];

let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 200)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
