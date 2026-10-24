/* Assembles native/www - what the iPhone shell carries - from the STABLE app,
 * never from dev: the root index.html and the stable/ snapshot it reads
 * (liveBase() answers 'stable/' outside /dev/), plus the logo the page links
 * to directly. Run from anywhere: node tools/native-www.mjs
 * native/www is generated and not committed. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'native', 'www');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(OUT, 'index.html'));
fs.copyFileSync(path.join(ROOT, 'manifest.json'), path.join(OUT, 'manifest.json'));
/* every root asset the page names directly (the splash wordmark, the logo):
   read from index.html, so a new one cannot be left behind */
const named = new Set(['logo.png']);
for (const m of fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/["'(]assets\/([\w.-]+\.(?:png|svg|jpg|webp))/g)) named.add(m[1]);
for (const f of named) if (fs.existsSync(path.join(ROOT, 'assets', f))) fs.copyFileSync(path.join(ROOT, 'assets', f), path.join(OUT, 'assets', f));
console.log('root assets:', [...named].join(', '));
for (const d of ['data', 'assets', 'vendor'])
  fs.cpSync(path.join(ROOT, 'stable', d), path.join(OUT, 'stable', d), { recursive: true });
/* the raw ministry tables the app never fetches */
for (const f of fs.readdirSync(path.join(OUT, 'stable', 'data')))
  if (/\.(csv|xlsx)$/i.test(f)) fs.rmSync(path.join(OUT, 'stable', 'data', f));
let n = 0, bytes = 0;
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else { n++; bytes += fs.statSync(p).size; } } })(OUT);
console.log('native/www:', n, 'files,', (bytes / 1048576).toFixed(1), 'MB');
