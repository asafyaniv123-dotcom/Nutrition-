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
for (const name of VIA_VARIABLE) {
  const at = app.indexOf('var ' + name + '=[');
  if (at < 0) continue;
  const end = app.indexOf('];', at);
  for (const k of app.slice(at, end).matchAll(/(['"])([^'"]*[֐-׿][^'"]*)\1/g)) keys.add(k[2]);
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

if (process.argv.includes('--check')) {
  if (next === prev) { console.log('template is current: ' + keys.size + ' keys'); process.exit(0); }
  const had = new Set(Object.keys(prev ? JSON.parse(prev) : {}));
  const added = [...keys].filter(k => !had.has(k));
  const gone = [...had].filter(k => !keys.has(k));
  console.log('template is STALE: +' + added.length + ' -' + gone.length);
  for (const k of added.slice(0, 12)) console.log('  + ' + JSON.stringify(k));
  for (const k of gone.slice(0, 12)) console.log('  - ' + JSON.stringify(k));
  process.exit(1);
}

fs.writeFileSync(P, next);
console.log(keys.size + ' keys (' + plural.size + ' plural) -> ' + P);

const en = JSON.parse(fs.readFileSync('data/lang/en.json', 'utf8'));
const missing = [...keys].filter(k => !(k in en));
console.log(Object.keys(en).length + ' answered in en.json, ' + missing.length + ' still empty');
const stale = Object.keys(en).filter(k => !keys.has(k));
if (stale.length) console.log(stale.length + ' answer(s) in en.json no longer asked for: ' +
  stale.slice(0, 8).map(x => JSON.stringify(x)).join(' '));
