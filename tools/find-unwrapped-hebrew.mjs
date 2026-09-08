/* Hebrew that never passes through _t().
 *
 *     node tools/find-unwrapped-hebrew.mjs [file]
 *
 * The other checks all assume a string is at least *trying* to be translated:
 * find-translated-data watches where a _t result goes, find-frozen-translations
 * watches when _t runs. This one watches for the strings that were simply
 * missed - a literal handed straight to the DOM, which stays Hebrew in every
 * language and cannot be found by reading a language file, because it has no
 * key to be missing.
 *
 * What counts as wrapped:
 *   _t('…')           the argument of a call
 *   data-t="…"        markup that langStatic() fills in
 *   var HE={ '…': …}  the Hebrew dictionary itself, where keys are the source
 *   a line marked      // i18n-exempt: <reason>
 *
 * Everything else with a Hebrew letter in it is reported: string literals in
 * the script, and text nodes in the static markup.
 *
 * Validated against the revision that shipped German: it named the two weekday
 * names left bare in a seven-name array at line 11051, the water card heading,
 * and the season names - all three of which a browser sweep in German had
 * already found by hand, plus the ones the sweep never reached.
 */
import fs from 'fs';

const CR = String.fromCharCode(13), LF = String.fromCharCode(10);
const FILE = process.argv[2] || 'dev/index.html';
const raw = fs.readFileSync(FILE, 'utf8').split(CR + LF).join(LF);
const HEB = /[֐-׿]/;

/* The game is a document of its own and is never touched. */
const gs = raw.indexOf('id="game-src"');
const ge = gs < 0 ? -1 : raw.indexOf('</script>', gs);
const src = gs < 0 ? raw : raw.slice(0, gs) + ' '.repeat(ge - gs) + raw.slice(ge);

const lineOf = (i) => src.slice(0, i).split(LF).length;
const lineAt = (i) => {
  const a = src.lastIndexOf(LF, i) + 1, b = src.indexOf(LF, i);
  return src.slice(a, b < 0 ? src.length : b);
};

/* The script region, so markup and code can be judged by different rules. */
const scripts = [];
{
  const re = /<script(\b[^>]*)>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(src))) {
    if (/\bsrc=/.test(m[1]) || /id="game-src"/.test(m[1])) continue;
    scripts.push([m.index + m[0].indexOf('>') + 1, m.index + m[0].length - '</script>'.length]);
  }
}
const inScript = (i) => scripts.some(([a, b]) => i >= a && i < b);

/* <style> holds CSS, and a CSS comment is prose about the design. */
const styles = [];
for (const m of src.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g))
  styles.push([m.index, m.index + m[0].length]);
const inStyle = (i) => styles.some(([a, b]) => i >= a && i < b);

/* The HE dictionary block: its keys ARE the Hebrew source, by design. */
const heAt = src.indexOf('var HE={');
const heEnd = heAt < 0 ? -1 : src.indexOf(LF + '};', heAt);
const inHE = (i) => heAt >= 0 && i >= heAt && i < heEnd;

const found = [];

/* ── string literals in the script ────────────────────────────────────────── */
/* A `/` starts a regex only where a value may start. Without this the scanner
   treats the slashes of /יי/g as quotes, loses its place, and swallows whole
   functions into one imaginary string - which is what the first run did: it
   reported the HE dictionary and several comment blocks as literals. */
const VALUE_MAY_START = '(,=:[!&|?{};+-*%~^<>' + LF;
function isRegexAt(i) {
  let j = i - 1;
  while (j >= 0 && ' \t'.includes(src[j])) j--;
  return j < 0 || VALUE_MAY_START.includes(src[j]) || /\breturn$|\btypeof$|\bcase$/.test(src.slice(Math.max(0, j - 8), j + 1));
}
function endOfRegex(i) {
  let j = i + 1, cls = false;
  for (; j < src.length; j++) {
    const c = src[j];
    if (c === '\\') { j++; continue; }
    if (c === LF) return i + 1;          // not a regex after all
    if (c === '[') cls = true;
    else if (c === ']') cls = false;
    else if (c === '/' && !cls) return j + 1;
  }
  return i + 1;
}

for (const [a, b] of scripts) {
  let i = a;
  while (i < b) {
    const c = src[i];
    /* comments: a Hebrew comment is prose about the code, not UI */
    if (c === '/' && src[i + 1] === '/') { i = src.indexOf(LF, i); if (i < 0) break; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i); i = e < 0 ? b : e + 2; continue; }
    if (c === '/' && isRegexAt(i)) { i = endOfRegex(i); continue; }
    if (c !== '"' && c !== "'" && c !== '`') { i++; continue; }
    const q = c, from = i;
    i++;
    while (i < b && src[i] !== q) { if (src[i] === '\\') i++; i++; }
    const text = src.slice(from + 1, i);
    i++;
    if (!HEB.test(text)) continue;
    if (inHE(from)) continue;
    const before = src.slice(Math.max(0, from - 3), from);
    if (before.endsWith('_t(')) continue;
    if (/\/\/\s*i18n-exempt/.test(lineAt(from))) continue;
    found.push({ line: lineOf(from), where: 'script', text: text.slice(0, 60) });
  }
}

/* ── text nodes in the static markup ──────────────────────────────────────── */
{
  /* Everything outside a tag and outside every script. */
  const re = />([^<]+)</g;
  let m;
  while ((m = re.exec(src))) {
    const at = m.index + 1;
    if (inScript(at) || inStyle(at)) continue;
    const text = m[1].trim();
    if (!HEB.test(text)) continue;
    /* the element carries its key for langStatic() */
    const openFrom = src.lastIndexOf('<', m.index);
    if (/\bdata-t="/.test(src.slice(openFrom, m.index + 1))) continue;
    if (/\/\/\s*i18n-exempt/.test(lineAt(at))) continue;
    found.push({ line: lineOf(at), where: 'markup', text: text.slice(0, 60) });
  }
}

/* ── attributes that reach the eye ────────────────────────────────────────── */
for (const m of src.matchAll(/\b(placeholder|title|aria-label|alt|value)="([^"]*[֐-׿][^"]*)"/g)) {
  if (inScript(m.index)) continue;      // built strings are covered above
  found.push({ line: lineOf(m.index), where: m[1], text: m[2].slice(0, 60) });
}

found.sort((a, b) => a.line - b.line);
console.log('Hebrew that never reaches _t(): ' + found.length + LF);
for (const f of found)
  console.log('  line ' + String(f.line).padStart(6) + '  ' + f.where.padEnd(11) + '  ' + f.text);
if (!found.length) console.log('  none.');
process.exit(found.length ? 1 : 0);
