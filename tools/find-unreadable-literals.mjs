// A COLOUR WRITTEN AS HEX IS INVISIBLE TO THE TOKEN CHECK.
//
// find-unreadable-tokens reads every TOKEN used as a `color:` and answers 0.
// It cannot see `color:#c8bfb6`, because there is no token to look up - and
// that is where the worst ones were hiding:
//
//   .xd-en    #c8bfb6 on the card   1.47:1   the English name beside the Hebrew
//   .stk-d i  #c8bfb6 on the card   1.47:1   the DATE in the streak sheet
//
// So this reads the hex ones. The hard part is what each sits ON, and the
// answer is DERIVED rather than listed - a list of exceptions is the thing
// that rots. For a rule with `color:#hex` and no background of its own, the
// selector is walked outward one compound at a time until a rule with a
// background is found; failing that, the app has essentially one ground.
//
// Two shapes it has to resolve, because both were real:
//   - a GRADIENT. `.stk.on` is linear-gradient(#fde4cf,#fbd0ae), and the
//     honest number is the darker stop, not the lighter one.
//   - an rgba WASH. `.stk-today` sits on rgba(232,193,98,.14), which is not a
//     colour until it is composited over what is behind it.
//
//   node tools/find-unreadable-literals.mjs [file]
//
// Calibration, recorded because a detector that has never caught anything has
// not been tested: against the revision before the seven were fixed it finds
// 74; after them, 68.
//
// READ THAT 68 THE RIGHT WAY. It is not 68 things a person can see. A rule is
// only a defect when it PAINTS, and most of these are states that were not on
// screen: `.on`, `.reach`, `.swipe-del`, a ghost mid-drag. A live check that
// walks the real DOM across eight areas - planted with a known 1.47:1 case
// first, so it was shown to detect - found ZERO on what was actually
// rendered. The seven that were fixed were the ones that paint.
//
// So this is a list to WORK THROUGH by driving each state, not a number to
// report. Its own live counterpart got one thing wrong that is worth knowing:
// it read a background's rgb and ignored its alpha, so it called .stk-today
// 2.72:1 where the composite is 3.62:1. Both fail; only one is the truth.
import fs from 'fs';

const FILE = process.argv[2] || 'dev/index.html';
/* COMMENTS FIRST. This file's comments are prose about CSS and one of them
   contains the literal text ".app{background:var(--nu-ground)}". Two earlier
   scans in this repo counted those braces and reported confident nonsense. */
const whole = fs.readFileSync(FILE, 'utf8').replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
/* ONLY THE STYLESHEET. Its first version scanned the whole file and reported
   `document.addEventListener('DOMContentLoaded',function()` as a selector
   painted #ffffff - JavaScript has braces too. Everything outside <style> is
   blanked, keeping the newlines so line numbers still point at the file. */
/* THE STYLE BLOCKS, EACH WITH WHERE IT STARTS.
   An earlier version blanked everything outside <style> to spaces and then ran
   the rule regex over the whole 1.8MB. That never finished, and not because of
   the work: `[^{}@;]+` happily swallowed 1.4MB of blanked JavaScript, found no
   `{`, and backtracked one character at a time. The regex only ever needs to
   see the stylesheet, so it only ever gets the stylesheet. */
const blocks = [];
for (const m of whole.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g))
  blocks.push({ text: m[1], at: m.index + m[0].indexOf(m[1]) });
const src = whole;   /* kept for the token scan, which is a plain global match */
/* one pass for the line of any offset, instead of splitting the file per find */
const NL = [];
for (let i = 0; i < whole.length; i++) if (whole[i] === '\n') NL.push(i);
const lineAt = at => { let lo = 0, hi = NL.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (NL[mid] < at) lo = mid + 1; else hi = mid; }
  return lo + 1; };

const lum = c => {
  const v = [0,1,2].map(i => parseInt(c.slice(1+i*2, 3+i*2), 16) / 255)
    .map(x => x <= 0.03928 ? x/12.92 : Math.pow((x+0.055)/1.055, 2.4));
  return 0.2126*v[0] + 0.7152*v[1] + 0.0722*v[2];
};
const ratio = (a,b) => { const x=lum(a), y=lum(b), hi=Math.max(x,y), lo=Math.min(x,y);
  return (hi+0.05)/(lo+0.05); };
const norm = h => h.length === 4 ? '#' + [1,2,3].map(i => h[i]+h[i]).join('') : h.toLowerCase();
const composite = (hex, a, bg) => '#' + [0,1,2].map(i => {
  const f = parseInt(hex.slice(1+i*2,3+i*2),16), b = parseInt(bg.slice(1+i*2,3+i*2),16);
  return Math.round(f*a + b*(1-a)).toString(16).padStart(2,'0');
}).join('');

/* the one ground the twelve module blocks all resolve to */
const GROUND = (/--nu-ground:\s*(#[0-9a-fA-F]{3,6})/.exec(src) || [,'#e9e7e3'])[1].toLowerCase();
const TOKENS = {};
for (const m of src.matchAll(/(--[a-z0-9-]+):\s*(#[0-9a-fA-F]{3,6})\s*[;}]/g))
  if (!(m[1] in TOKENS)) TOKENS[m[1]] = norm(m[2]);

/* every rule, as { selector, body } - braces inside strings are not structure */
const rules = [];
for (const b of blocks)
  for (const m of b.text.matchAll(/([^{}@;]+)\{([^{}]*)\}/g)) {
    const sel = m[1].trim().replace(/\s+/g, ' ');
    if (!sel || sel.startsWith('@')) continue;
    rules.push({ sel, body: m[2], at: b.at + m.index });
  }
/* selector -> its background, built ONCE. Scanning every rule for every
   candidate selector was O(rules squared) and did not finish on this file. */
const BG = new Map();
for (const r of rules) {
  const b = /(?:^|;)\s*background(?:-color)?:\s*([^;]+)/.exec(r.body);
  if (!b) continue;
  for (const one of r.sel.split(',').map(x => x.trim()))
    if (one && !BG.has(one)) BG.set(one, b[1].trim());
}
const bgOf = sel => BG.get(sel) || null;
/* resolve a background value to the hex a reader actually sees */
function solve(value, behind) {
  if (!value) return null;
  const grad = [...value.matchAll(/#[0-9a-fA-F]{3,6}/g)].map(x => norm(x[0]));
  if (/gradient/.test(value) && grad.length) {
    /* the darker stop: the honest one for dark text */
    return grad.reduce((a,b) => lum(a) < lum(b) ? a : b);
  }
  const rgba = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/.exec(value);
  if (rgba) {
    const hex = '#' + [1,2,3].map(i => (+rgba[i]).toString(16).padStart(2,'0')).join('');
    const a = rgba[4] === undefined ? 1 : parseFloat(rgba[4]);
    return a >= 1 ? hex : composite(hex, a, behind);
  }
  if (grad.length) return grad[0];
  const tok = /var\(\s*(--[a-z0-9-]+)/.exec(value);
  if (tok && TOKENS[tok[1]]) return TOKENS[tok[1]];
  if (tok) return GROUND;           /* --card/--panel/--page all resolve here */
  return null;
}
/* walk outward: ".stk.on .stk-w" -> ".stk.on" -> ".stk" */
function backgroundFor(sel) {
  const parts = sel.split(' ');
  for (let i = parts.length - 1; i >= 0; i--) {
    const tail = parts.slice(0, i + 1).join(' ');
    const candidates = [tail];
    /* ".stk.on" also inherits whatever ".stk" paints */
    const dot = tail.lastIndexOf('.');
    if (dot > 0) candidates.push(tail.slice(0, dot));
    for (const c of candidates) {
      const v = bgOf(c);
      if (v) {
        const solved = solve(v, GROUND);
        if (solved) return { bg: solved, from: c };
      }
    }
  }
  return { bg: GROUND, from: '(the ground)' };
}

const found = [], unknown = [];
for (const r of rules) {
  const m = /(?:^|;)\s*color:\s*(#[0-9a-fA-F]{3,6})/.exec(r.body);
  if (!m) continue;
  /* body.night paints nothing - the rules that were only chrome were removed
     and the ones left never match. Measuring them is measuring a ghost. */
  if (/\bbody\.night\b/.test(r.sel)) continue;
  const fg = norm(m[1]);
  const { bg, from } = backgroundFor(r.sel);
  const rr = ratio(fg, bg);
  if (rr >= 4.5) continue;
  const line = lineAt(r.at);
  /* A LIGHT FOREGROUND WITH NO BACKGROUND FOUND IS A FAILURE OF THIS TOOL,
     not of the app: white text does not get written onto the page by
     accident, it gets written onto a dark fill that the selector walk could
     not reach - a parent that is not a prefix of this selector. Reported
     separately rather than counted, because a number that includes guesses
     is a number nobody can act on. */
  if (lum(fg) > lum(bg) && from === '(the ground)') { unknown.push({ line, sel: r.sel, fg }); continue; }
  found.push({ line, sel: r.sel, fg, bg, from, r: rr });
}

found.sort((a,b) => a.r - b.r);
for (const f of found)
  console.log('  line ' + String(f.line).padStart(6) + '  ' + f.sel.padEnd(22) +
    f.fg + ' on ' + f.bg + '  ' + f.r.toFixed(2) + ':1   (background from ' + f.from + ')');
if (unknown.length) {
  console.log('\n  ' + unknown.length + ' more are lighter than the ground with no background found — ' +
    'this tool could not reach their fill, so they are NOT counted:');
  for (const u of unknown.slice(0, 6))
    console.log('    line ' + String(u.line).padStart(6) + '  ' + u.sel.slice(0, 40) + '  ' + u.fg);
  if (unknown.length > 6) console.log('    …and ' + (unknown.length - 6) + ' more');
}
console.log(found.length
  ? '\n' + found.length + ' literal colour(s) read as text under 4.5:1'
  : '  none — every colour written as hex and read as text clears 4.5:1');
process.exit(found.length ? 1 : 0);
