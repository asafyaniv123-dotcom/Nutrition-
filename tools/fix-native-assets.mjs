/* The iPhone build showed a broken image on the splash (Asaf, 25 Oct): the
   page links assets/brand-name-olimei.png directly, and native-www copied one
   named file (logo.png) from the root assets. It now copies every root asset
   the page names - found in index.html itself - so a new one cannot be
   forgotten again. */
import fs from 'fs';
const F = 'tools/native-www.mjs';
let s = fs.readFileSync(F, 'utf8');
const a = `fs.copyFileSync(path.join(ROOT, 'assets', 'logo.png'), path.join(OUT, 'assets', 'logo.png'));`;
if (s.split(a).length !== 2) { console.log('anchor'); process.exit(1); }
s = s.replace(a, `/* every root asset the page names directly (the splash wordmark, the logo):
   read from index.html, so a new one cannot be left behind */
const named = new Set(['logo.png']);
for (const m of fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/["'(]assets\\/([\\w.-]+\\.(?:png|svg|jpg|webp))/g)) named.add(m[1]);
for (const f of named) if (fs.existsSync(path.join(ROOT, 'assets', f))) fs.copyFileSync(path.join(ROOT, 'assets', f), path.join(OUT, 'assets', f));
console.log('root assets:', [...named].join(', '));`);
fs.writeFileSync(F, s);
console.log('ok');
