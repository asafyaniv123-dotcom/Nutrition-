// LIFT A FUNCTION OUT OF THE SHIPPED FILE, EXACTLY AS WRITTEN.
//
// Two tests now run the app's own code against a fake world rather than a
// rewrite of it, which is the only way a test can fail when the app changes.
// This is the one reader they share - a second reader of this file is the one
// that ends up wrong.
//
// Two things it must get right, both learned here:
//   - The braces in a COMMENT are not structure. This file's comments are
//     prose about CSS and one of them literally contains
//     ".app{background:var(--nu-ground)}". Two earlier scans counted those and
//     reported confident nonsense.
//   - A helper written on one line is not a special case. Reading those with a
//     regex anchored on the closing paren took dayStr's SIGNATURE - it happens
//     to be written over four lines - and built a harness that did not parse.
import fs from 'fs';

export function reader(file) {
  const src = fs.readFileSync(file, 'utf8');

  function lift(name) {
    const at = src.indexOf('\nfunction ' + name + '(');
    if (at < 0) throw new Error('cannot find function ' + name + ' in ' + file);
    let i = src.indexOf('{', at), depth = 0, q = null;
    for (; i < src.length; i++) {
      const c = src[i], p = src[i - 1], n = src[i + 1];
      if (q) { if (c === q && p !== '\\') q = null; continue; }
      if (c === '/' && n === '*') { i = src.indexOf('*/', i + 2) + 1; continue; }
      if (c === '/' && n === '/') { i = src.indexOf('\n', i); continue; }
      if (c === '"' || c === "'") { q = c; continue; }
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (!depth) return src.slice(at + 1, i + 1); }
    }
    throw new Error('unbalanced braces reading ' + name);
  }

  /* a top-level `var NAME=...;` on its own line, taken whole */
  function liftVar(name) {
    const m = new RegExp('^var ' + name + '=.*$', 'm').exec(src);
    if (!m) throw new Error('cannot find var ' + name + ' in ' + file);
    return m[0];
  }

  return { src, lift, liftVar };
}
