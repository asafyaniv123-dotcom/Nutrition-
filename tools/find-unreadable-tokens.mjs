#!/usr/bin/env node
/* find-unreadable-tokens.mjs — a colour named "readable as text" that is not.
 *
 * The palette declares five tokens whose comment says, in English, that they
 * are the readable member of their hue. Over one night THREE of the five
 * turned out not to be, each found by accident on a different screen:
 *
 *   --terra-700   #c2664a   3.21:1   thirteen places trusted the comment
 *   --amber-700   #a8842e   2.83:1   eleven places, found by a 9px heading
 *   --green-700   #4c9a4c   2.82:1   five places: a ✓ beside a connected
 *                                    service, an arrow saying a lift went up
 *   --indigo-600  #6274eb   3.26:1   zero places - a trap, not a defect
 *
 * The comment stopped being evidence the first time it was wrong. This is the
 * assertion that replaces it.
 *
 * It reads TWO things, and the second is the one that matters:
 *
 *   1. every token whose comment claims it is readable as text
 *   2. every token actually USED as a `color:` anywhere in the file
 *
 * and measures each against the ground the app really has. That single ground
 * is what makes this cheap: --card, --panel and --page all resolve to
 * --nu-ground inside the twelve module blocks, so the app has one background
 * and one number answers the question.
 *
 * THE OVERRIDES ARE HONOURED. --muted-soft is #7a6f68 at :root, which is
 * 3.95 - but every module block redefines it to --nu-muted at 4.53, and the
 * app is always inside a module. Reporting it would be reporting a value that
 * never paints. The block-level redefinitions are read from the file rather
 * than listed here, because a list is the thing that rots.
 *
 * WHAT IT DELIBERATELY DOES NOT REPORT:
 *   --white          124 uses, and all of them are text ON a dark fill
 *   a token used only as a background or a border
 *   a token whose only text uses are inside a module block that redefines it
 *
 * Usage:  node tools/find-unreadable-tokens.mjs [path]   (default dev/index.html)
 * Exits non-zero when it finds anything.
 *
 * TESTED, the way CLAUDE.md demands:
 *   against the revision before the fix   2  (--green-700, --indigo-600)
 *   against the revision before tonight   4  (+ --terra-700, --amber-700)
 *   against the fix                       0
 */
import fs from 'fs';

const FILE = process.argv[2] || 'dev/index.html';
const src = fs.readFileSync(FILE, 'utf8');

const FLOOR = 4.5;                 /* small text; large text would be 3 */
const GROUND = '#e9e7e3';          /* --nu-ground: the page, the card, the sheet */

const lum = h => {
  const v = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
const ratio = (a, b) => {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/* --name:#hex, wherever it is declared */
const hex = {};
for (const m of src.matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g))
  hex[m[1]] = m[2].toLowerCase();

/* A token a MODULE BLOCK redefines never paints its :root value in this app,
   because every screen is inside one of the twelve. Read them rather than
   name them.

   TWO WRONG VERSIONS BEFORE THIS ONE, and both failed the same way: they
   read the braces in a COMMENT as structure. The first matched each module
   rule with a non-greedy [\s\S]*? up to the next '}'. The second walked back
   from each declaration to the brace that opened its rule. Both put
   --muted-soft outside every block and reported 127 uses of a value that
   never paints - because this file's comments are prose about CSS, and one
   of them contains the literal text `.app{background:var(--nu-ground)}`.
   That closing brace is not structure; it is a sentence.

   So the structural walk runs over a copy with every comment blanked to
   spaces, which keeps offsets and removes the braces that are only prose.
   The claim scan still reads the real source, because the claim IS a
   comment. */
const code = src.replace(/\/\*[\s\S]*?\*\//g, c => ' '.repeat(c.length));
const overridden = new Set();
for (const m of code.matchAll(/(--[a-z0-9-]+)\s*:/g)) {
  const open = code.lastIndexOf('{', m.index);
  if (open < 0) continue;
  const close = code.lastIndexOf('}', m.index);
  if (close > open) continue;                    /* not inside a rule body */
  const selStart = Math.max(code.lastIndexOf('}', open), code.lastIndexOf(';', open));
  const sel = code.slice(selStart < 0 ? 0 : selStart, open);
  if (/html body\.mod-/.test(sel)) overridden.add(m[1]);
}

/* the comment that this check exists to stop trusting */
const claims = new Set();
for (const m of src.matchAll(/(--[a-z0-9-]+)\s*:[^;]*;\s*\/\*[^*]*readable as text/g))
  claims.add(m[1]);

const findings = [];
for (const t of Object.keys(hex)) {
  if (t === '--white') continue;                 /* text ON a fill, by design */
  if (overridden.has(t)) continue;               /* the block decides, not :root */
  const esc = t.replace(/-/g, '\\-');
  const uses = (src.match(new RegExp('color:\\s*var\\(' + esc + '\\)', 'g')) || []).length;
  if (!uses && !claims.has(t)) continue;         /* neither read nor claimed */
  const r = ratio(hex[t], GROUND);
  if (r >= FLOOR) continue;
  const line = src.slice(0, src.indexOf(t + ':')).split(/\r?\n/).length;
  findings.push({ t, hex: hex[t], uses, r, line, claimed: claims.has(t) });
}

findings.sort((a, b) => a.r - b.r);

if (!findings.length) {
  console.log('every named colour that is read as text clears ' + FLOOR + ':1 on the ground');
  process.exit(0);
}

console.log('\nA COLOUR THAT IS READ AS TEXT AND CANNOT BE\n');
for (const f of findings) {
  console.log('  line ' + String(f.line).padStart(6) + '  ' + f.t.padEnd(15) + f.hex +
              '   ' + f.r.toFixed(2) + ':1 on the ground');
  console.log('          ' + (f.claimed ? 'its own comment says "readable as text"' : 'no claim') +
              ', read as text ' + f.uses + (f.uses === 1 ? ' time' : ' times'));
}
console.log('\n' + findings.length + ' found in ' + FILE + '\n');
process.exit(1);
