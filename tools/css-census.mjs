/* What visual grammar does the app actually speak, and is it converging?
 *
 *     node tools/css-census.mjs [dev/index.html]
 *
 * WHY THIS EXISTS. The hub was rebuilt against a measured reference, and the
 * rest of the app has not heard about it. "The rest of the app" is easy to
 * assert and worth counting, because the size of the redesign IS the count:
 * every rule that draws an edge, a plate or a drop shadow is a rule somebody
 * has to make a decision about. Run it again after each pass and the numbers
 * should go down; that is the point of it being a tool rather than a one-off.
 *
 * WHAT IT COUNTS. For every rule in the stylesheet: does it set a radius, a
 * border, a shadow (and how loud is the drop shadow), a gradient. Then groups
 * by the area a selector belongs to, since this file names its classes by
 * area, and separately lists the SHARED rules - which is where most of the
 * grammar turned out to live.
 *
 * NO CSS PARSER, deliberately: rules here are flat, @media and @supports are
 * walked into, and @keyframes / @font-face are skipped because they do not
 * draw a surface.
 *
 * KNOWN LIMIT, stated so nobody over-reads the output: it counts RULES, not
 * USES. A rule applied once and a rule applied on every screen count the same.
 */
import fs from 'fs';

const SRC = process.argv[2] || 'dev/index.html';
const s = fs.readFileSync(SRC, 'utf8');
const css = [...s.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n')
  .replace(/\/\*[\s\S]*?\*\//g, '');

const rules = [];
(function walk(text) {
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf('{', i);
    if (open < 0) break;
    let depth = 1, k = open + 1;
    while (k < text.length && depth) { if (text[k] === '{') depth++; else if (text[k] === '}') depth--; k++; }
    const sel = text.slice(i, open).trim();
    const body = text.slice(open + 1, k - 1);
    if (/^@(media|supports)/.test(sel)) walk(body);
    else if (!/^@/.test(sel) && sel) rules.push({ sel, body });
    i = k;
  }
})(css);

/* the strongest alpha in the NON-inset part of a box-shadow: the drop shadow,
   which is the one that says "separate object with a gap under it" */
const drop = (body) => {
  const d = body.match(/box-shadow\s*:([^;}]*)/i);
  if (!d) return 0;
  const outer = d[1].replace(/inset[^,]*(,|$)/g, '');
  let m = 0;
  for (const g of outer.matchAll(/rgba\([^)]*,\s*([0-9.]+)\s*\)/g)) m = Math.max(m, parseFloat(g[1]));
  return m;
};

const AREAS = [
  ['the home board', /\bh(cards|hero|card|ero)\b|\bhome-|\blay-b\b/],
  ['סיום יום', /\brf-|\bsm2-|\brfd-|\bmood/],
  ['תזונה', /\bnut|\bmeal|\bfood|\bscan|\brec-|\bsay-|\bpic-/],
  ['כושר', /\bfit-|\bex-|\bwo-|\bplate|\bset-/],
  ['תכנון זמן', /\bplan-|\bdp-|\bagenda|\btask/],
  ['הארון', /\bcl-|\bclo-|\bgarm/],
  ['האנשים שלי', /\bppl-|\bperson/],
  ['היומן', /\bjrnl|\bbook|\bbk-|\bquote/],
  ['תובנות', /\bins-|\btrend|\bchart/],
  ['chrome', /\bsheet|\bmodal|\boverlay|\bdlg|\bnav-|\btabs?\b|\btopbar|\bbottom/],
];
const areaOf = (sel) => { for (const [n, re] of AREAS) if (re.test(sel)) return n; return 'shared'; };

const t = {};
const cell = (a) => (t[a] ||= { rules: 0, radius: 0, border: 0, shadow: 0, dropN: 0, loud: 0, grad: 0 });

for (const r of rules) {
  const c = cell(areaOf(r.sel));
  c.rules++;
  if (/border-radius\s*:/i.test(r.body)) c.radius++;
  if (/(^|[;{\s])border\s*:\s*(?!none)[^;}]+/i.test(r.body)) c.border++;
  if (/box-shadow\s*:/i.test(r.body)) {
    c.shadow++;
    const d = drop(r.body);
    if (d > 0) c.dropN++;
    if (d >= 0.25) c.loud++;
  }
  if (/(linear|radial|conic)-gradient/.test(r.body)) c.grad++;
}

console.log(SRC + ': ' + rules.length + ' rules');
console.log('');
console.log('area              rules  radius  border  shadow    drop    loud   grad');
for (const [a, c] of Object.entries(t).sort((x, y) => y[1].rules - x[1].rules))
  console.log(a.padEnd(17) + String(c.rules).padStart(5) + String(c.radius).padStart(8) +
    String(c.border).padStart(8) + String(c.shadow).padStart(8) + String(c.dropN).padStart(8) +
    String(c.loud).padStart(8) + String(c.grad).padStart(7));

/* the radius scale, or the lack of one */
const radii = {};
for (const m of css.matchAll(/border-radius\s*:([^;}]*)/gi)) {
  const v = m[1].trim();
  radii[v] = (radii[v] || 0) + 1;
}
const rs = Object.entries(radii).sort((a, b) => b[1] - a[1]);
console.log('');
console.log('border-radius: ' + rs.reduce((a, r) => a + r[1], 0) + ' declarations, ' +
            rs.length + ' distinct values');
console.log('  ' + rs.slice(0, 10).map(([v, n]) => n + 'x ' + v).join('   '));

/* what is louder than the hub */
const HUB = 0.32;
const loud = rules.filter(r => drop(r.body) > HUB)
  .map(r => ({ sel: r.sel.replace(/\s+/g, ' '), d: drop(r.body) }))
  .sort((a, b) => b.d - a.d);
console.log('');
console.log(loud.length + ' rules cast a drop shadow louder than the hub\'s ' + HUB + ':');
for (const r of loud.slice(0, 20)) console.log('  ' + r.d.toFixed(2) + '  ' + r.sel.slice(0, 54));
