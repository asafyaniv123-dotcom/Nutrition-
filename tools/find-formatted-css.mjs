#!/usr/bin/env node
/* find-formatted-css.mjs — a reader's number used as a machine's number.
 *
 * nfmt, dfmt, fmtWeight and fmtGrams write numbers the way the READER writes
 * them. Arabic gets ٥٠, German gets 1.234,5. That is right on a screen and
 * wrong in a CSS value, because `style.height = "٥٠%"` is not a length and
 * the browser silently DISCARDS it - measured in the page: assigning it
 * leaves style.height empty, so the element draws at zero.
 *
 * It shipped. The daily summary's four macro bars wrote
 *     height:'+nfmt(sb.pct)+'%
 * and an Arabic reader's bars had been drawing at zero height. Nothing could
 * see it: the Hebrew and English builds are fine, because their digits happen
 * to be the ones CSS accepts.
 *
 * The same scan carries a second rule of the same shape. A PERCENT SIGN IS A
 * UNIT - CLAUDE.md rule 4 - and `nfmt(pct)+'%'` welds the Latin sign onto a
 * number that just went to the trouble of being Arabic. Intl knows the sign
 * and its spacing: ٪ in Arabic, a space before it in French. pfmt() is the
 * one place that asks.
 *
 * WHAT IT READS is the QUESTION the number is answering:
 *   inside a style="…" attribute   -> a machine reads it. Never format.
 *   followed by a bare % sign      -> a person reads it. Use pfmt.
 *
 * Usage:  node tools/find-formatted-css.mjs [path]     (default dev/index.html)
 * Exits non-zero when it finds anything.
 *
 * TESTED, the way CLAUDE.md demands - a detector that has never caught
 * anything has not been tested:
 *   against 96dd83b (the hobbies commit)  4 findings
 *   against the fix                       0 findings
 */
import fs from 'fs';

const FILE = process.argv[2] || 'dev/index.html';
const src = fs.readFileSync(FILE, 'utf8');

/* The formatters whose output is for a person to read. */
const FMT = /\b(nfmt|dfmt|fmtWeight|fmtGrams|pfmt)\s*\(/;

const lineOf = i => src.slice(0, i).split('\n').length;
const findings = [];

/* ── 1. a formatted number inside a style attribute ──
   The attribute is built across string concatenation, so the window runs
   from style=" to the next double quote, which is the one that closes it.
   Capped, so an unbalanced quote cannot swallow the rest of the file. */
const STYLE = /style\s*=\s*"/g;
let m;
while ((m = STYLE.exec(src))) {
  const from = m.index + m[0].length;
  const end = src.indexOf('"', from);
  if (end < 0) continue;
  const win = src.slice(from, Math.min(end, from + 600));
  const hit = FMT.exec(win);
  if (hit) {
    findings.push({
      line: lineOf(from + hit.index),
      rule: 'style',
      what: hit[1],
      text: win.slice(Math.max(0, hit.index - 30), hit.index + 44).replace(/\s+/g, ' '),
    });
  }
}

/* ── 2. a percent sign welded on by hand ──
   The shape is a string literal that STARTS with %, glued to whatever came
   before it: nfmt(b.pct)+'%</div>' as much as nfmt(b.pct)+'%'. The first
   version of this rule demanded the closing quote too and so matched only
   the one site in three where the literal held nothing else — which is how
   a detector reports nothing and gets believed.

   Two exemptions, and both are a MACHINE reading the number rather than a
   person: an assignment into .style.something, and a style attribute, which
   rule 1 owns. */
const PCT = /\+\s*'%/g;
while ((m = PCT.exec(src))) {
  const lineStart = src.lastIndexOf('\n', m.index) + 1;
  const lineEnd = src.indexOf('\n', m.index);
  const line = src.slice(lineStart, lineEnd < 0 ? src.length : lineEnd);
  if (/\.style\.[a-zA-Z]+\s*=/.test(line)) continue;          // CSS, by hand
  /* A percent a PERSON reads is followed by markup, a quote or a space. A
     semicolon after it means the next CSS declaration follows, so the string
     is a style being built in a variable - `'left:'+x+'%;top:'+y+'%'`. That
     shape is correct code and was this scan's only false positive. */
  if (src[m.index + m[0].length] === ';') continue;
  const back = src.lastIndexOf('style="', m.index);
  const close = back < 0 ? -1 : src.indexOf('"', back + 7);
  if (back >= 0 && close > m.index) continue;                  // rule 1 owns it
  findings.push({
    line: lineOf(m.index),
    rule: 'percent',
    what: 'literal',
    text: src.slice(Math.max(lineStart, m.index - 44), m.index + 10).replace(/\s+/g, ' '),
  });
}

if (!findings.length) {
  console.log('no reader-formatted number used as a machine number');
  process.exit(0);
}

console.log('\nA NUMBER FORMATTED FOR A READER, USED AS A MACHINE VALUE\n');
for (const f of findings) {
  const why = f.rule === 'style'
    ? 'inside style="…" — CSS wants a bare Latin number'
    : "a bare '%' — the sign is a unit; pfmt() knows the reader's";
  console.log('  line ' + String(f.line).padStart(6) + '  ' + f.what.padEnd(10) + why);
  console.log('           ' + f.text);
}
console.log('\n' + findings.length + ' found in ' + FILE + '\n');
process.exit(1);
