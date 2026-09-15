/* The feminine Hebrew, checked against the app rather than trusted.
 *
 * data/lang/he.gender.json maps a key - the masculine Hebrew string _t is
 * CALLED with - to the same sentence addressed to a woman. Four things have
 * to hold, and each of them has already been got wrong somewhere in this
 * project by a pass that looked right:
 *
 *   1. the key still exists in the app. A key that no longer matches is not
 *      an error anyone sees - _t just falls back and the feminine form is
 *      silently dead, which is exactly how two recipe placeholders sat
 *      translated into eleven languages with every answer unreachable.
 *   2. the feminine differs from the masculine. An entry that copies its key
 *      is work that looks done and is not.
 *   3. the holes survive. A dropped {n} is a sentence with a number missing
 *      and nothing to report it.
 *   4. no \uXXXX escape reaches a key, for the same reason as everywhere
 *      else: the extractor files the escape and the runtime asks for the
 *      character, and the lookup misses.
 *
 *     node tools/check-gender-forms.mjs [dev/index.html]
 */
import fs from 'fs';

const APP = process.argv[2] || 'dev/index.html';
const MAP = 'data/lang/he.gender.json';

const src = fs.readFileSync(APP, 'utf8');
const pairs = JSON.parse(fs.readFileSync(MAP, 'utf8'));

/* every string _t is CALLED with, escapes resolved */
const keys = new Set();
const re = /_t\('((?:[^'\\]|\\.)*)'/g;
let m;
while ((m = re.exec(src))) {
  keys.add(m[1].replace(/\\n/g, '\n').replace(/\\t/g, '\t')
    .replace(/\\'/g, "'").replace(/\\\\/g, '\\'));
}

const holes = t => (t.match(/\{(\w+)\}/g) || []).sort().join(',');
const problems = [];

for (const [k, v] of Object.entries(pairs)) {
  if (/\\u[0-9a-fA-F]{4}/.test(k)) problems.push(['escape in key', k]);
  if (!keys.has(k)) problems.push(['key is not in the app', k]);
  if (typeof v !== 'string' || !v) problems.push(['no feminine form', k]);
  else {
    if (v === k) problems.push(['feminine is identical to the key', k]);
    if (holes(v) !== holes(k)) problems.push(['holes differ: ' + holes(k) + ' vs ' + holes(v), k]);
  }
}

const n = Object.keys(pairs).length;
if (problems.length) {
  console.log(problems.length + ' problem(s) in ' + MAP + ':\n');
  for (const [why, k] of problems.slice(0, 40)) console.log('  ' + why.padEnd(38) + k.split('\n')[0].slice(0, 54));
  console.log('\n' + n + ' pairs checked.');
  process.exit(1);
}
console.log(n + ' feminine forms, every key present in the app, every hole intact.');
