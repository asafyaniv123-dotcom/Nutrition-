/* The mirror of find-unreadable-tokens, and it exists because that one could
 * not see this.
 *
 * find-unreadable-tokens reads every token used as a `color:` and measures it
 * against the ground. That catches a dark word on the cream. It cannot catch
 * the opposite shape - a PALE FILL with white text on it - because the token
 * being measured there is --white, which is never the problem, and the thing
 * it has to be measured against is a background the check never looked at.
 *
 * Found by accident: the chosen RPE button is `background:var(--terra-500)`
 * with `color:var(--white)`, and that is 2.61:1. Looking for its siblings
 * turned up the app's PRIMARY BUTTON - --cta-fill, a gradient from
 * --terra-200 to --terra-500 - carrying white text at between 1.71 and 2.61.
 *
 *   node tools/find-unreadable-fills.mjs [path]
 *
 * It measures the LIGHTEST stop of a gradient, because that is where the
 * white text is worst and a reader does not get to choose which end of the
 * button to read. Large text is allowed 3:1 by WCAG, so a rule whose own
 * font-size clears 18.66px bold or 24px is held to that instead; everything
 * else needs 4.5.
 *
 * Exits non-zero when it finds anything.
 *
 * ── THE NUMBERS ──
 * Against the revision this was written on: 98 rules, the worst at 1.43:1.
 * Spot-checked in the browser rather than trusted - .rpe-b.on computes to
 * rgb(224,138,114) under rgb(255,255,255) at 12px/700, and the browser's own
 * numbers give the same 2.61:1 this file does.
 *
 * It has NOT been run against a fix, and that is the honest state of it:
 * fixing these changes how the app looks on nearly every screen, which is
 * Asaf's decision and not a tool's. The number is written down here so the
 * day it is made there is something to compare against. Until then this is
 * the one check in tools/ that is expected to exit non-zero.
 *
 * Its own first version had the bug CLAUDE.md warns about at the top: it ran
 * the rule regex over the whole file and read the braces of a JS block as a
 * CSS rule, reporting `var w=_fitWorkout; if(!w.exercises.length)` as a
 * selector. Rules come from <style> only; inline style="…" is a second pass.
 */
import fs from 'fs';

const FILE = process.argv[2] || 'dev/index.html';
let src = fs.readFileSync(FILE, 'utf8');

/* COMMENTS FIRST, ALWAYS. This file's comments are prose ABOUT css and one of
   them contains the literal text `.app{background:var(--nu-ground)}`. Both
   early versions of find-unreadable-tokens read that closing brace as the end
   of a rule and reported 127 uses of a value that never paints. Blanked
   rather than deleted so every offset still points at the right line. */
src = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

/* ── the palette ─────────────────────────────────────────────────────── */
const tokens = {};
for (const m of src.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8}|linear-gradient\([^;]*\)|var\(--[a-z0-9-]+\))/g))
  if (!(m[1] in tokens)) tokens[m[1]] = m[2].trim();

function hex(v, depth) {
  if (depth > 6 || !v) return null;
  v = v.trim();
  if (/^#[0-9a-fA-F]{3}$/.test(v)) return '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
  if (/^#[0-9a-fA-F]{8}$/.test(v)) return v.slice(0, 7).toLowerCase();
  const ref = v.match(/^var\(--([a-z0-9-]+)\)$/);
  if (ref) return hex(tokens[ref[1]], depth + 1);
  return null;
}

/* every colour stop a value can paint, so a gradient is judged at its worst
   end rather than at whichever one happens to be written first */
function stops(v, depth) {
  if (depth > 6 || !v) return [];
  v = v.trim();
  const one = hex(v, 0);
  if (one) return [one];
  const ref = v.match(/^var\(--([a-z0-9-]+)\)$/);
  if (ref) return stops(tokens[ref[1]], depth + 1);
  if (/linear-gradient|radial-gradient/.test(v)) {
    const out = [];
    for (const m of v.matchAll(/var\(--([a-z0-9-]+)\)|#[0-9a-fA-F]{3,8}/g))
      out.push(...stops(m[0], depth + 1));
    return out;
  }
  return [];
}

/* ── contrast ────────────────────────────────────────────────────────── */
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (h) => 0.2126 * lin(parseInt(h.slice(1, 3), 16)) +
                   0.7152 * lin(parseInt(h.slice(3, 5), 16)) +
                   0.0722 * lin(parseInt(h.slice(5, 7), 16));
const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);

/* ── where css actually is ───────────────────────────────────────────────
   NOT the whole file. The first version of this ran `([^{}]+)\{([^{}]*)\}`
   over everything and reported `var w=_fitWorkout; if(!w.exercises.length)`
   as a selector - the braces of a JS block read as a CSS rule, which is the
   trap written at the top of CLAUDE.md. Rules come only from <style>, and
   inline style="…" is a second pass with no braces in it at all. */
const lineOf = (i) => src.slice(0, i).split('\n').length;
const findings = [];
const blocks = [];
for (const m of src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g))
  blocks.push({ css: m[1], at: m.index + m[0].indexOf(m[1]) });

const rules = [];
for (const b of blocks)
  for (const m of b.css.matchAll(/([^{}]+)\{([^{}]*)\}/g))
    rules.push({ sel: m[1], body: m[2], at: b.at + m.index });
/* an inline style paints exactly like a rule and is where most of this app's
   colour actually lives, so it is read too - as a body with no selector */
for (const m of src.matchAll(/\sstyle\s*=\s*"([^"]*)"/g))
  rules.push({ sel: '(inline style)', body: m[1], at: m.index });

for (const m of rules) {
  const sel = m.sel.trim().replace(/\s+/g, ' ');
  const body = m.body;
  if (!/\bcolor\s*:/.test(body) || !/\bbackground(-color)?\s*:/.test(body)) continue;

  const fg = hex((body.match(/(?:^|;)\s*color\s*:\s*([^;]+)/) || [])[1], 0);
  const bgRaw = (body.match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/) || [])[1];
  if (!fg || !bgRaw) continue;
  const bgs = stops(bgRaw, 0);
  if (!bgs.length) continue;

  /* WCAG lets large text clear 3:1. The rule has to say so itself - a size
     inherited from somewhere else is a guess, and a guess that lowers a bar
     is how a check comes to report nothing. */
  const fsz = (body.match(/font-size\s*:\s*([\d.]+)px/) || [])[1];
  const bold = /font-weight\s*:\s*(?:[789]00|bold)/.test(body);
  const large = fsz && (+fsz >= 24 || (+fsz >= 18.66 && bold));
  const need = large ? 3 : 4.5;

  /* the worst stop, because a reader does not choose which end to read */
  let worst = null;
  for (const b of bgs) { const r = ratio(fg, b); if (worst === null || r < worst.r) worst = { r, b }; }
  if (worst.r >= need) continue;

  findings.push({ line: lineOf(m.at), sel, fg, bg: worst.b,
                  r: worst.r, need, size: fsz ? fsz + 'px' + (bold ? ' bold' : '') : 'inherited' });
}

findings.sort((a, b) => a.r - b.r);
for (const f of findings)
  console.log('  line ' + String(f.line).padStart(6) + '  ' + f.r.toFixed(2) + ':1 (needs ' +
    f.need + ')  ' + f.fg + ' on ' + f.bg + '  ' + f.size + '\n' +
    '          ' + (f.sel.length > 92 ? f.sel.slice(0, 92) + '…' : f.sel));

if (!findings.length) { console.log('every fill carries text its own contrast can hold'); process.exit(0); }
console.log('\n' + findings.length + ' rule(s) paint text on a fill it cannot be read on');
process.exit(1);
