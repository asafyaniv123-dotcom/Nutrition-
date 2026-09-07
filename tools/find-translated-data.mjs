/* Find strings that are being translated but are used as DATA.
 *
 * The extraction wrapped every Hebrew literal it could safely reach. Most of
 * those are text on a screen. Some are not: a lookup key, a search needle, a
 * value being compared. Those must match whatever they are compared against -
 * usually the exercise database or something already stored - and a
 * translation breaks that silently. No error, no crash, just a test that is
 * quietly always false.
 *
 * Two were found by accident while doing other work:
 *   foodKey()  wrapped the replacement characters in a normaliser whose own
 *              comment says the result "exists to be compared"
 *   exAltRank  searched the exercise database's equipment tags with a
 *              translated needle, so in English it stopped preferring machines
 *
 * Finding them by accident is not a plan. This looks for the shape.
 *
 *     node tools/find-translated-data.mjs
 *
 * It cannot see everything - a translated string handed to a function that
 * compares it three calls later is invisible here. It catches the shapes that
 * are visible at the call site, which is where both known bugs lived.
 */
import fs from 'fs';

const CR = String.fromCharCode(13), LF = String.fromCharCode(10);
/* Takes a path so it can be pointed at an older revision - a detector that has
   never been shown finding anything is not evidence of anything. */
const FILE = process.argv[2] || 'dev/index.html';
const s = fs.readFileSync(FILE, 'utf8').split(CR + LF).join(LF);
const gs = s.indexOf('id="game-src"'), ge = s.indexOf('</script>', gs);

/* Offsets stay honest by blanking the game rather than cutting it out. */
const app = s.slice(0, gs) + ' '.repeat(ge - gs) + s.slice(ge);

/* A _t call, with whatever immediately precedes and follows it. */
const CALL = /_t\((['"])((?:(?!\1).)*)\1(?:\s*,[^)]*)?\)/g;

const SHAPES = [
  { why: 'search needle',   before: /\.(indexOf|lastIndexOf|includes|search|startsWith|endsWith)\(\s*(''\+)?$/ },
  { why: 'split separator', before: /\.split\(\s*(''\+)?$/ },
  { why: 'replace target',  before: /\.replace\(\s*(''\+)?$/ },
  /* The foodKey bug was this shape and the first version of this tool missed
     it: with a regex as the first argument, the translated string is the
     SECOND - the replacement - so nothing named "replace" sits just before it.
     What sits before it is the end of a regex literal and a comma. */
  { why: 'replacement value', before: /\/[gimsuy]*\s*,\s*(''\+)?$/ },
  { why: 'compared',        before: /[=!]==?\s*(''\+)?$/ },
  { why: 'compared',        after:  /^(\+'')?\s*[=!]==?/ },
  { why: 'lookup index',    before: /\[\s*(''\+)?$/ },
  { why: 'lookup index',    after:  /^(\+'')?\s*\]/ },
  { why: 'storage key',     before: /(getItem|setItem|removeItem)\(\s*(''\+)?$/ },
  { why: 'element id',      before: /(getElementById|querySelector|querySelectorAll)\(\s*(''\+)?$/ },
];

const hits = [];
let m;
while ((m = CALL.exec(app)) !== null) {
  const before = app.slice(Math.max(0, m.index - 40), m.index);
  const after = app.slice(m.index + m[0].length, m.index + m[0].length + 24);
  for (const sh of SHAPES) {
    if ((sh.before && sh.before.test(before)) || (sh.after && sh.after.test(after))) {
      hits.push({
        line: app.slice(0, m.index).split(LF).length,
        why: sh.why,
        key: m[2].slice(0, 34),
        ctx: (before.slice(-24) + '_t(…)' + after.slice(0, 14)).replace(/\s+/g, ' '),
      });
      break;
    }
  }
}

console.log('translated strings used as data: ' + hits.length);
if (!hits.length) {
  console.log('');
  console.log('  none — every _t() result reaches a screen rather than a comparison.');
  process.exit(0);
}
console.log('');
const byWhy = {};
for (const h of hits) (byWhy[h.why] = byWhy[h.why] || []).push(h);
for (const why of Object.keys(byWhy).sort((a, b) => byWhy[b].length - byWhy[a].length)) {
  console.log('  ' + why + '  (' + byWhy[why].length + ')');
  for (const h of byWhy[why]) {
    console.log('    line ' + String(h.line).padStart(6) + '  ' + JSON.stringify(h.key));
    console.log('              ' + h.ctx);
  }
}
process.exit(1);
