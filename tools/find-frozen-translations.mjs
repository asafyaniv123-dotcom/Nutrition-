/* Top-level declarations that call _t() once, at load, and then never again.
 *
 *     node tools/find-frozen-translations.mjs [file]
 *
 * A collection written as
 *
 *     var FIT_AREAS=[ {t:''+_t('אימון חדש')+'', …}, … ];
 *
 * is translated exactly once - while the page is booting, before any dictionary
 * has been fetched. _t() with no dictionary returns its own key, so the array
 * fills with Hebrew and stays Hebrew for the life of the tab. Nothing throws,
 * nothing looks wrong in Hebrew, and switching to German repaints every screen
 * except the ones these feed.
 *
 * The cure already exists in the file: langOn(fn) runs fn now AND again on every
 * language change. This finds the declarations that are missing it.
 *
 * Why the check earns its keep: it was written after a browser sweep in German
 * found the whole כושר hub, the closet categories and the insight categories
 * still in Hebrew, and it names all three - plus eleven more that the sweep
 * never reached, because a sweep only sees the screens it opens.
 */
import fs from 'fs';

const CR = String.fromCharCode(13), LF = String.fromCharCode(10);
const FILE = process.argv[2] || 'dev/index.html';
const raw = fs.readFileSync(FILE, 'utf8').split(CR + LF).join(LF);

/* The game is a document of its own and is never touched. */
const gs = raw.indexOf('id="game-src"');
const ge = gs < 0 ? -1 : raw.indexOf('</script>', gs);
const app = gs < 0 ? raw : raw.slice(0, gs) + ' '.repeat(ge - gs) + raw.slice(ge);

/* Every top-level `var NAME=` — column zero, so a var inside any function body
   is skipped by construction rather than by a brace count that can drift. */
const DECL = /^var ([A-Za-z_$][\w$]*)\s*=/gm;

/* Where the declaration ends: the matching close of whatever bracket opens it,
   or the end of the line for a plain scalar. Quote-aware, because an SVG path
   attribute in these collections is full of characters that look structural.

   Count ONLY the opening bracket that started us. The first draft counted every
   opener - `[`, `{` and `(` alike - and decremented on one closer, so an array
   of objects went depth-positive on its first `{` and never came back: the body
   ran to the end of the file, picked up somebody else's langOn, and the whole
   check reported one finding instead of fourteen. It looked like good news. */
function endOf(from) {
  const OPEN = { '[': ']', '{': '}', '(': ')' };
  let i = from;
  while (i < app.length && ' \t'.includes(app[i])) i++;
  const open = app[i], close = OPEN[open];
  if (!close) { const nl = app.indexOf(LF, from); return nl < 0 ? app.length : nl; }
  let depth = 0, q = null;
  for (; i < app.length; i++) {
    const c = app[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === open) depth++;
    else if (c === close && !--depth) return i + 1;
  }
  return app.length;
}

const lineOf = (i) => app.slice(0, i).split(LF).length;

const frozen = [];
let m;
while ((m = DECL.exec(app))) {
  const at = m.index, name = m[1];
  const body = app.slice(at, endOf(at + m[0].length));
  if (!/_t\(/.test(body)) continue;
  /* langOn's own idiom is `var X;langOn(function(){X=…});` — the declaration
     carries no _t at all and never reaches here. A declaration that both
     assigns and calls _t is the frozen shape. */
  if (/\blangOn\s*\(/.test(body)) continue;
  const keys = [...body.matchAll(/_t\((['"])((?:(?!\1).)*)\1/g)].map((k) => k[2]);
  frozen.push({ name, line: lineOf(at), keys });
}

console.log('translations frozen at load: ' + frozen.length + LF);
for (const f of frozen) {
  console.log('  line ' + String(f.line).padStart(6) + '  ' + f.name +
              '  (' + f.keys.length + ')');
  console.log('           ' + f.keys.slice(0, 6).join(' · ') +
              (f.keys.length > 6 ? ' …' : ''));
}
if (!frozen.length) console.log('  none — every top-level _t is inside langOn.');
process.exit(frozen.length ? 1 : 0);
