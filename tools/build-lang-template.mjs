/* Rebuild data/lang/_template.json from the app itself.
 *
 * Every _t('…') in dev/index.html is a key a translator has to answer. The
 * template is that list with empty values, so it has to be regenerated whenever
 * the wrapping changes - otherwise a translator fills in words for strings that
 * no longer exist and misses the ones that appeared.
 *
 *     node tools/build-lang-template.mjs           # rewrite the template
 *     node tools/build-lang-template.mjs --check   # fail if it is out of date
 *
 * Keys already answered in en.json are reported, so a pass that adds fifty
 * strings says so rather than leaving them to be discovered by a blank screen.
 * A plural key - one whose value in HE is an object - is emitted with the
 * categories the target locale needs, not the ones Hebrew happens to use.
 */
import fs from 'fs';

const CR = String.fromCharCode(13), LF = String.fromCharCode(10);
const s = fs.readFileSync('dev/index.html', 'utf8').split(CR + LF).join(LF);
const gs = s.indexOf('id="game-src"'), ge = s.indexOf('</script>', gs);
const app = s.slice(0, gs) + ' '.repeat(ge - gs) + s.slice(ge);

/* The literal form only. A _t(variable) - the muscle captions, the feeling
   chips - cannot be read statically; those keys come from the collection the
   variable walks, and are added below.

   The optional backslash matters more than it looks. A _t() written inside
   an html attribute must escape its quotes - onclick="...confirm(_t(\'…\'))"
   - and without this the regex found a backslash where it wanted a quote,
   emitted no key, and _t returned its own Hebrew argument in all ten
   languages while --check stayed green. Three strings were shipped that way
   before anyone noticed, and one of them was a confirm dialog. */
const CALL = /_t\(\\?(['"])((?:(?!\1).)*)\1/g;
const keys = new Set();
let m;
/* The closing quote is escaped too, so the capture can end with a stray
   backslash that is not part of the key. */
while ((m = CALL.exec(app))) keys.add(m[2].replace(/\\$/, ''));
/* Kept apart from the rest: a key with a real _t() call behind it is asked
   for no matter what any collection says about it. LABEL_CTX below needs to
   tell the two apart. */
const called = new Set(keys);

/* Collections whose values are handed to _t at the point of display. They are
   data in the file and text on the screen, so their keys are real but invisible
   to the pattern above. Named explicitly, because guessing which arrays feed a
   _t(variable) is exactly the guess this whole exercise exists to avoid. */
const VIA_VARIABLE = ['SAY_DERIVED_NONE', 'PLAN_FEELINGS', 'RELATIONSHIP_TYPES',
                      'PEOPLE_FREQS', 'PEOPLE_DATE_TYPES',
                      'PEOPLE_PLACES', 'WIZ_NAME_OPTS', 'CLOSET_SEASONS',
                      /* Every reflection list, not just RF_IMPACT. The other
                         six were missing, so thirty answers to "what made you
                         put it off?" and "how does your body feel?" were
                         Hebrew in every other language - in the part of the
                         app the rest of it exists to serve. */
                      'RF_IMPACT', 'RF_BODY', 'RF_ENERGY', 'RF_DRAIN',
                      'RF_PROC', 'RF_SELFCARE', 'RF_PLANNED'];
/* Bracket-matched rather than cut at the next "];", which is fragile for a
   multi-line collection: indexOf can run past the end of the declaration and
   let the regex pick fragments out of unrelated code.

   No such fragment was actually found - I went looking for one after deciding
   that קל, אמן and רשות were substrings of קלה, מתאמן and דורשות, and they are
   not. All three are real keys written with DOUBLE quotes, which is why
   grep "_t('קל')" found nothing and I drew the wrong conclusion. The bracket
   matching stays because the old cut was fragile on its own terms, and it is
   worth saying that it fixed nothing. */
function arrayAt(from) {
  let depth = 0, q = null;
  for (let i = from; i < app.length; i++) {
    const c = app[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (c === '[') depth++;
    else if (c === ']' && !--depth) return app.slice(from, i + 1);
  }
  return '';
}
for (const name of VIA_VARIABLE) {
  const at = app.indexOf('var ' + name + '=[');
  if (at < 0) continue;
  const body = arrayAt(app.indexOf('[', at));
  for (const k of body.matchAll(/(['"])([^'"]*[֐-׿][^'"]*)\1/g)) keys.add(k[2]);
}
/* LABEL_CTX maps a stored word to the key it is painted under. The values are
   the keys a translator has to answer, and they appear in no _t() call - the
   call reads the map. Without this the two contexts vanish from the template,
   every language quietly loses its answer, and _t falls back to the part
   before the bar, which is the very word the context existed to disambiguate. */
const lc = app.indexOf('var LABEL_CTX={');
const remapped = new Set();
if (lc >= 0) {
  const block = app.slice(lc, app.indexOf('};', lc));
  for (const m of block.matchAll(/(['"])([^'"]*[֐-׿][^'"]*)\1\s*:\s*(['"])([^'"]*[֐-׿][^'"]*)\3/g)) {
    remapped.add(m[2]);   // the stored word, never looked up
    keys.add(m[4]);       // the key it is painted under
  }
}
/* A word LABEL_CTX remaps is painted under its mapped key, so asking for the
   bare word as well would put a key in every language file that nothing
   reads — UNLESS something calls _t() on it directly somewhere else, which is
   the whole reason it needed a context: כבד is the body chip AND the word in
   the RPE legend, and dropping it would have left that legend untranslated
   while every check stayed green. */
for (const k of remapped) if (!called.has(k)) keys.delete(k);
/* and the muscle names, which the browser's cards translate one by one -
   plus the three section headings above them, which the exercise picker
   translates the same way. */
const mu = app.indexOf('var MU_SECTIONS=[');
if (mu >= 0) {
  const end = app.indexOf('\n];', mu);
  const block = app.slice(mu, end);
  for (const k of block.matchAll(/m:\s*\[([^\]]*)\]/g))
    for (const w of k[1].matchAll(/(['"])([^'"]*[֐-׿][^'"]*)\1/g)) keys.add(w[2]);
  for (const w of block.matchAll(/\bt:\s*(['"])([^'"]*[֐-׿][^'"]*)\1/g)) keys.add(w[2]);
}

/* The five words written into the document's own markup carry their key in a
   data-t attribute instead of a _t call, because nothing renders them and so
   there is no call site to put one in. They are still keys, and a language file
   that misses them shows Hebrew tabs, so the check has to know about them. */
for (const m of app.matchAll(/\bdata-t="([^"]+)"/g)) keys.add(m[1]);

/* Plurals: Hebrew has one/two/other, and the target locale decides its own. */
const HE_AT = app.indexOf('var HE={');
const heBlock = HE_AT < 0 ? '' : app.slice(HE_AT, app.indexOf('\n};', HE_AT));
const plural = new Set();
for (const k of keys) if (heBlock.includes("'" + k + "':{")) plural.add(k);

const out = {};
for (const k of [...keys].sort()) out[k] = plural.has(k) ? { one: '', other: '' } : '';

const P = 'data/lang/_template.json';
const next = JSON.stringify(out, null, 1) + LF;
const prev = fs.existsSync(P) ? fs.readFileSync(P, 'utf8').split(CR + LF).join(LF) : '';

/* Every language the app actually offers, so a change cannot quietly ship a
   screen that is English everywhere except the four words somebody just added.
   A file that exists is a language a person can pick, and every key it is
   missing is a Hebrew word on their screen. */
function shipped() {
  return fs.readdirSync('data/lang')
    .filter(f => f.endsWith('.json') && f !== '_template.json')
    .map(f => ({ code: f.replace(/\.json$/, ''), path: 'data/lang/' + f }));
}
function gaps() {
  const out = [];
  for (const { code, path } of shipped()) {
    let d = {};
    try { d = JSON.parse(fs.readFileSync(path, 'utf8')); } catch (e) { out.push({ code, unreadable: true }); continue; }
    const missing = [...keys].filter(k => !(k in d));
    const stale = Object.keys(d).filter(k => !keys.has(k));
    if (missing.length || stale.length) out.push({ code, missing, stale });
  }
  return out;
}

if (process.argv.includes('--check')) {
  let bad = false;
  if (next !== prev) {
    const had = new Set(Object.keys(prev ? JSON.parse(prev) : {}));
    const added = [...keys].filter(k => !had.has(k));
    const gone = [...had].filter(k => !keys.has(k));
    console.log('template is STALE: +' + added.length + ' -' + gone.length);
    for (const k of added.slice(0, 12)) console.log('  + ' + JSON.stringify(k));
    for (const k of gone.slice(0, 12)) console.log('  - ' + JSON.stringify(k));
    bad = true;
  } else {
    console.log('template is current: ' + keys.size + ' keys');
  }
  for (const g of gaps()) {
    bad = true;
    if (g.unreadable) { console.log(g.code + '.json will not parse'); continue; }
    console.log(g.code + '.json: ' + g.missing.length + ' unanswered, ' + g.stale.length + ' no longer asked for');
    for (const k of g.missing.slice(0, 8)) console.log('  ? ' + JSON.stringify(k));
  }
  process.exit(bad ? 1 : 0);
}

fs.writeFileSync(P, next);
console.log(keys.size + ' keys (' + plural.size + ' plural) -> ' + P);

const en = JSON.parse(fs.readFileSync('data/lang/en.json', 'utf8'));
const missing = [...keys].filter(k => !(k in en));
console.log(Object.keys(en).length + ' answered in en.json, ' + missing.length + ' still empty');
const stale = Object.keys(en).filter(k => !keys.has(k));
if (stale.length) console.log(stale.length + ' answer(s) in en.json no longer asked for: ' +
  stale.slice(0, 8).map(x => JSON.stringify(x)).join(' '));
