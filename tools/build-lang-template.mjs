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
   variable walks, and are added below. */
const CALL = /_t\((['"])((?:(?!\1).)*)\1/g;
const keys = new Set();
let m;
while ((m = CALL.exec(app))) keys.add(m[2]);

/* Collections whose values are handed to _t at the point of display. They are
   data in the file and text on the screen, so their keys are real but invisible
   to the pattern above. Named explicitly, because guessing which arrays feed a
   _t(variable) is exactly the guess this whole exercise exists to avoid. */
const VIA_VARIABLE = ['SAY_DERIVED_NONE', 'PLAN_FEELINGS', 'RELATIONSHIP_TYPES',
                      'PEOPLE_PLACES', 'RF_IMPACT', 'WIZ_NAME_OPTS'];
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
/* and the muscle names, which the browser's cards translate one by one */
const mu = app.indexOf('var MU_SECTIONS=[');
if (mu >= 0) {
  const end = app.indexOf('\n];', mu);
  for (const k of app.slice(mu, end).matchAll(/m:\s*\[([^\]]*)\]/g))
    for (const w of k[1].matchAll(/(['"])([^'"]*[֐-׿][^'"]*)\1/g)) keys.add(w[2]);
}

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
