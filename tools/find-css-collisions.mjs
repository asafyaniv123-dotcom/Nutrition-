/* Two different things wearing the same class name.
 *
 *     node tools/find-css-collisions.mjs [file]
 *
 * This is the CSS half of the bug class this project keeps finding. A shadowed
 * `deleteGoal` was silently eating goals; a `daysSince` repeated the mistake
 * within the hour of being warned about it. The rule that came out of that —
 * assert a new top-level name is free before adding it — was about JavaScript,
 * and the stylesheet had no equivalent.
 *
 * So `.wt` was the water card's title: a 13px blue span beside the count.
 * `.wt` was ALSO the workout timer overlay, added months later: position
 * fixed, centred, dark, with a shadow. The later rule won, and the water
 * title became a dark pill floating in the middle of the screen over whatever
 * was beneath it. It went both ways — the overlay was picking up the title's
 * font-size, because its own block never set one — and nothing in the
 * toolchain could see either half.
 *
 * WHAT IT LOOKS FOR. Redefining a class is ordinary and usually deliberate: a
 * base rule and a later tweak. What is never deliberate is two blocks that
 * disagree about where the element IS. So a bare `.name` rule is reported
 * against another bare `.name` rule when they disagree about a positioning
 * property both set, OR when one of them takes the element out of the flow —
 * position, transform, float — and the other has no idea.
 *
 * THAT SECOND CLAUSE IS THE WHOLE POINT, and the first version of this check
 * did not have it. It required both rules to mention position, so it missed
 * `.wt` — the bug it was written for — and reported one unrelated finding
 * instead, which is exactly the "a tool that has never caught anything has not
 * been tested" trap. Against the revision that HAS the bug it now reports it.
 *
 * AT-RULE BLOCKS ARE SKIPPED WHOLE. A `@media` override redefining a class is
 * the responsive pattern itself; counting those buried the real finding under
 * twenty-seven of them.
 *
 * THE BASELINE IS SIXTEEN, and they are not claimed to be bugs. Against the
 * revision that had the `.wt` collision it reported seventeen; the fix took it
 * to sixteen, and that is the number this should never rise above. Most of the
 * rest are a one-property rule left behind by a later full one - `.hcard` is
 * `position:relative` on line 2099 and a complete home-board petal on 2285,
 * the first of which has done nothing since the second was written. Dead
 * rather than dangerous, but worth knowing about.
 *
 * Exits non-zero when it finds anything.
 */
import fs from 'fs';

const FILE = process.argv[2] || 'dev/index.html';
const CR = String.fromCharCode(13), LF = String.fromCharCode(10);
/* Every line ending, not only CRLF: this file has mixed endings, and a lone
   CR is still a line break to anything that counts lines. */
const src = fs.readFileSync(FILE, 'utf8').split(CR + LF).join(LF).split(CR).join(LF);

/* The game is a standalone document with its own :root and its own classes. */
const gs = src.indexOf('id="game-src"');
const ge = gs < 0 ? -1 : src.indexOf('</script>', gs);
const app = gs < 0 ? src : src.slice(0, gs) + src.slice(ge);

const PLACE = ['position', 'display', 'top', 'right', 'bottom', 'left',
               'inset', 'inset-inline-end', 'inset-inline-start', 'transform', 'float'];
const OUT_OF_FLOW = ['position', 'transform', 'float'];

/* Blank out every at-rule block, keeping the line count, so the rules inside
   a @media are not read as a second definition of the class. */
function blankAtRules(css) {
  const out = css.split('');
  for (let i = 0; i < css.length; i++) {
    if (css[i] !== '@') continue;
    const open = css.indexOf('{', i);
    if (open < 0) break;
    /* only block at-rules; @import and friends end at the semicolon */
    const semi = css.indexOf(';', i);
    if (semi >= 0 && semi < open) continue;
    let depth = 0, j = open;
    for (; j < css.length; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') { depth--; if (!depth) break; }
    }
    for (let k = i; k <= Math.min(j, css.length - 1); k++)
      if (out[k] !== '\n') out[k] = ' ';
    i = j;
  }
  return out.join('');
}

const rules = [];
const seen = {};
for (const m of app.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
  const base = app.slice(0, m.index).split(LF).length;
  /* comments blanked first, so a selector inside one is not read as a rule */
  const clean = blankAtRules(m[1].replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' ')));
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let r;
  while ((r = re.exec(clean))) {
    const sel = r[1].trim();
    if (!sel) continue;
    /* The line is found by locating this rule in the ORIGINAL text rather than
       by counting lines in the cleaned copy - and tolerantly, because some
       rules put a space before the brace. Counting occurrences is what makes
       the SECOND `.foo{` report its own line instead of the first one's.
       It has to be anchored to the start of a line, too: without that,
       `.hcards.ring .hcard{` counts as an occurrence of `.hcard{` and the
       second real rule reports the wrong line entirely. Every top-level rule
       in this file starts its own line, so that is a safe anchor. */
    const needle = new RegExp('(?:^|\\n)\\s*' + sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{', 'g');
    const nth = (seen[sel] = (seen[sel] || 0) + 1);
    let at = -1, hit;
    for (let k = 0; k < nth && (hit = needle.exec(app)); k++) at = hit.index;
    rules.push({ sel, body: r[2], line: at < 0 ? 0 : app.slice(0, at).split(LF).length });
  }
}

/* only BARE single-class selectors: .name and nothing else */
const byClass = new Map();
for (const rule of rules) {
  for (const part of rule.sel.split(',')) {
    const s = part.trim();
    if (!/^\.[A-Za-z_][-\w]*$/.test(s)) continue;
    const props = {};
    for (const d of rule.body.split(';')) {
      const i = d.indexOf(':');
      if (i < 0) continue;
      const k = d.slice(0, i).trim().toLowerCase();
      if (PLACE.indexOf(k) >= 0) props[k] = d.slice(i + 1).trim().replace(/\s+/g, ' ');
    }
    if (!byClass.has(s)) byClass.set(s, []);
    byClass.get(s).push({ line: rule.line, props });
  }
}

const moves = (v) => v !== undefined && v !== 'static' && v !== 'none';
const found = [];
for (const [name, defs] of byClass) {
  if (defs.length < 2) continue;
  for (let i = 0; i < defs.length; i++)
    for (let j = i + 1; j < defs.length; j++) {
      const A = defs[i].props, B = defs[j].props, clash = [];
      for (const k of Object.keys(A))
        if (B[k] !== undefined && B[k] !== A[k]) clash.push(k);
      /* or one of them moves the element and the other never mentions it */
      for (const k of OUT_OF_FLOW)
        if (clash.indexOf(k) < 0 &&
            ((moves(A[k]) && B[k] === undefined) || (moves(B[k]) && A[k] === undefined))) clash.push(k);
      if (clash.length) found.push({ name, a: defs[i], b: defs[j], clash });
    }
}

console.log('classes two different things are using: ' + found.length);
if (!found.length) {
  console.log('');
  console.log('  none — no two bare class rules disagree about where the element is.');
  process.exit(0);
}
console.log('');
const show = (v) => (v === undefined ? 'not set' : v);
for (const f of found) {
  console.log('  ' + f.name + '   line ' + f.a.line + ' and line ' + f.b.line);
  for (const k of f.clash)
    console.log('      ' + k + ': ' + show(f.a.props[k]) + '   vs   ' + show(f.b.props[k]));
}
process.exit(1);
