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
 *
 * A SECOND pass catches the shape the first one structurally cannot: the _t
 * sits in a declaration and the comparison happens thousands of lines away.
 *
 *   MU_SECTIONS  the browse-by-muscle list, whose values are matched against
 *                the exercise database with e.m.indexOf(_exFilter) - so in any
 *                language but Hebrew every muscle filter returned nothing
 *   SAY_DERIVED  words like "dried" and "powder", searched for inside Hebrew
 *                food names to push derived products down the ranking
 *   PLAN_FEELINGS  compared against the feelings already saved on a day
 *
 * None of the three is visible at its own call site. The declaration looks
 * exactly like a list of labels, because that is what it is - until you read
 * who consumes it.
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

/* "return [" ends in a word character and so looks exactly like "foo[" - but a
   keyword is not an object, and the bracket after one opens a literal. Missing
   this is how the discriminator below flagged the weekday initials it had just
   been taught to leave alone. */
const KEYWORD_BRACKET = /\b(?:return|typeof|new|case|of|in|delete|void|await|yield)\s*\[\s*(?:''\+)?$/;

/* For the closing-bracket shape the opener has to be found first: walk back to
   the '[' that matches, then ask the same one-character question of it. */
function openerIsIndex(at) {
  let depth = 0;
  for (let i = at; i >= 0 && at - i < 4000; i--) {
    const c = app[i];
    if (c === ']') depth++;
    else if (c === '[') {
      if (depth) { depth--; continue; }
      const before = app.slice(Math.max(0, i - 12), i);
      if (KEYWORD_BRACKET.test(before + '[')) return false;   // the same keyword trap
      return /[\w$)\]]$/.test(before.replace(/\s+$/, ''));
    }
    else if (c === LF && !depth) return false;      // a literal, spread over lines
  }
  return false;
}

const SHAPES = [
  { why: 'search needle',   before: /\.(indexOf|lastIndexOf|includes|search|startsWith|endsWith)\(\s*(''\+)?$/ },
  { why: 'split separator', before: /\.split\(\s*(''\+)?$/ },
  /* FOOD_STOP was the mirror of that one and slipped straight past: the
     translated string is the SUBJECT of .split(), not its argument, so nothing
     named split sits before it. A sentence of Hebrew stop words was split into
     a lookup set and asked about words taken from Hebrew food names, which in
     any other language matched nothing at all. */
  /* Only whitespace and closing parens may stand between the call and the dot.
     A looser gap let `_t(…):when.replace(` match, where the .replace belongs to
     `when` on the other side of a ternary and not to the translated string. */
  { why: 'the subject of a text operation', after: /^(\+'')?[\s)]*\.\s*(split|indexOf|includes|match|test|replace|startsWith|endsWith)\s*\(/ },
  { why: 'replace target',  before: /\.replace\(\s*(''\+)?$/ },
  /* The foodKey bug was this shape and the first version of this tool missed
     it: with a regex as the first argument, the translated string is the
     SECOND - the replacement - so nothing named "replace" sits just before it.
     What sits before it is the end of a regex literal and a comma. */
  { why: 'replacement value', before: /\/[gimsuy]*\s*,\s*(''\+)?$/ },
  { why: 'compared',        before: /[=!]==?\s*(''\+)?$/ },
  { why: 'compared',        after:  /^(\+'')?\s*[=!]==?/ },
  /* A bracket against a quote is either obj['שם'] or the first element of
     ['שם', …], and telling them apart is the whole of this file's history: not
     telling them apart is what left Sunday and Saturday untranslated while
     Monday through Friday were fine. What separates them is one character. A
     lookup's '[' follows the thing being indexed - a name, a ')' or a ']'. An
     array literal's '[' follows '=', '(', ',', '[', ':' or 'return'. */
  { why: 'lookup index',    before: /[\w$)\]]\s*\[\s*(''\+)?$/, unless: KEYWORD_BRACKET },
  { why: 'lookup index',    after:  /^(\+'')?\s*\]/, andBefore: openerIsIndex },
  { why: 'storage key',     before: /(getItem|setItem|removeItem)\(\s*(''\+)?$/ },
  { why: 'element id',      before: /(getElementById|querySelector|querySelectorAll)\(\s*(''\+)?$/ },
];

const hits = [];
let m;
while ((m = CALL.exec(app)) !== null) {
  const before = app.slice(Math.max(0, m.index - 40), m.index);
  const after = app.slice(m.index + m[0].length, m.index + m[0].length + 24);
  for (const sh of SHAPES) {
    if (sh.unless && sh.unless.test(before)) continue;
    const fires = (sh.before && sh.before.test(before)) || (sh.after && sh.after.test(after));
    if (fires && (!sh.andBefore || sh.andBefore(m.index))) {
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

/* ── second pass: a translated collection whose values reach a comparison ──
   Every collection in this file is declared on one line, so finding them needs
   no brace matching. What matters is the consumer: reading an element and
   handing it to indexOf, ===, or an object index means the value is being
   matched against something, and something is always untranslated data. */
/* Two shapes, because the language pass changed one of them. A collection that
   has to be rebuilt when the language changes is written

       var FOOD_UNITS;langOn(function(){FOOD_UNITS=[ … ]});

   and the plain `var NAME=[` pattern stops seeing it. That is exactly how this
   check silently fell from 23 findings to 10 without a single one being fixed:
   every top-level collection it was watching had moved to the second shape. */
const DECL = /\bvar\s+([A-Za-z_$][\w$]*)\s*(?:=|;\s*langOn\s*\(\s*function\s*\(\s*\)\s*\{\s*\1\s*=)\s*[\[{]/g;

/* The declaration is found by matching brackets, not by taking a line: the two
   collections that motivated this pass are both written across several lines,
   and the first version of it missed them both for exactly that reason. */
function spanOf(from) {
  const open = app[from], close = open === '[' ? ']' : '}';
  let depth = 0, q = null;
  for (let i = from; i < app.length; i++) {
    const c = app[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (c === open) depth++;
    else if (c === close && !--depth) return app.slice(from, i + 1);
  }
  return '';
}

while ((m = DECL.exec(app))) {
  const name = m[1], at = m.index + m[0].length - 1;
  const body = spanOf(at);
  if (!body || !/_t\(/.test(body)) continue;
  const rest = app.slice(0, m.index) + app.slice(at + body.length);

  /* Where to look for the comparison. Reading the collection directly can be
     matched anywhere; a value read into a VARIABLE can only be trusted inside
     the function that read it - loop variables are named i and x everywhere,
     and searching the whole file for them finds every function in the app.
     So each indirect name carries the window it is allowed to be seen in. */
  const probes = [{ re: name + '\\s*\\[[^\\]]{0,24}\\]', from: 0, to: rest.length }];
  const READ = new RegExp('\\b(\\w+)\\s*=\\s*' + name + '\\s*\\[', 'g');
  let r;
  while ((r = READ.exec(rest))) {
    const stop = rest.indexOf(LF + 'function ', r.index);
    probes.push({ re: '\\b' + r[1] + '\\b', from: r.index, to: stop < 0 ? rest.length : stop });
  }
  /* A collection of objects is reached through its members, not its index: the
     muscle filter walks MU_SECTIONS, then reads sec.m[j] off each section. The
     member names come from the declaration, so only the keys this collection
     actually defines are followed. */
  const keys = new Set([...body.matchAll(/\b(\w+)\s*:\s*\[/g)].map(x => x[1]));
  if (keys.size) {
    /* Only where this collection is actually being walked. `.m[` on its own
       matches half the file; inside the loop that reads MU_SECTIONS it can only
       be MU_SECTIONS. The window runs from the mention to the next function. */
    const WALK = new RegExp('\\b' + name + '\\b', 'g');
    while ((r = WALK.exec(rest))) {
      const stop = rest.indexOf(LF + 'function ', r.index);
      const to = stop < 0 ? rest.length : stop;
      for (const k of keys) {
        probes.push({ re: '\\w+\\.' + k + '\\s*\\[[^\\]]{0,24}\\]', from: r.index, to });
        const MEMB = new RegExp('\\b(\\w+)\\s*=\\s*\\w+\\.' + k + '\\s*\\[', 'g');
        MEMB.lastIndex = r.index;
        let q;
        while ((q = MEMB.exec(rest)) && q.index < to)
          probes.push({ re: '\\b' + q[1] + '\\b', from: q.index, to });
      }
    }
  }

  const USES = [
    { why: 'collection searched for in data', pat: p => '\\.(?:indexOf|includes|lastIndexOf)\\s*\\(\\s*(?:' + p + ')\\s*\\)' },
    { why: 'collection compared',             pat: p => '(?:' + p + ')\\s*[=!]==|[=!]==\\s*(?:' + p + ')(?![\\w$])' },
    /* The last one a regex can reach. MU_SECTIONS travels collection -> member
       -> function argument -> an onclick attribute -> a global -> indexOf: five
       hops, and following them is dataflow analysis, not pattern matching. What
       IS visible is the first hop, so a value handed straight to a function is
       reported as a candidate to read rather than a finding. Being told where to
       look is the whole job here; the tool does not pretend to conclude. */
    { why: 'collection handed to a function - read the callee', pat: p => '\\b\\w+\\s*\\(\\s*(?:' + p + ')\\s*[,)]' },
  ];
  let why = '';
  for (const u of USES) {
    for (const p of probes)
      if (new RegExp(u.pat(p.re)).test(rest.slice(p.from, p.to))) { why = u.why; break; }
    if (why) break;
  }
  if (why)
    hits.push({ line: app.slice(0, m.index).split(LF).length, why, key: name, ctx: 'var ' + name + ' = [ … _t(…) … ]' });
}

/* And the mirror of a lookup index: a table whose keys stayed Hebrew - rightly,
   they are data - while its values were translated. Reading one hands back a
   translated string that the next line compares against a Hebrew literal. */
const ROLLUP = /\bvar\s+([A-Za-z_$][\w$]*)\s*=\s*\{[^\n]*?["'][֐-׿][^"']*["']\s*:\s*(?:''\s*\+\s*)?_t\(/g;
while ((m = ROLLUP.exec(app)))
  hits.push({
    line: app.slice(0, m.index).split(LF).length,
    why: 'hebrew keys, translated values',
    key: m[1],
    ctx: 'var ' + m[1] + ' = { "…": _t(…) }',
  });

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
