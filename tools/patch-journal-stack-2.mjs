/* Three the checks found in the journal build:
 *  - the clip-path builds "x px y px" - CSS, not words: marked exempt;
 *  - two sentences still masculine to her, and plural for them;
 *  - the placeholder and "nothing written" grey at 2.19:1 -> the muted ink. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`  el.style.clipPath=front.length>2?'polygon('+front.map(function(q){return jbX(q.x).toFixed(1)+'px '+q.y.toFixed(1)+'px';}).join(',')+')':'polygon(0 0,0 0,0 0)';`,
    `  el.style.clipPath=front.length>2?'polygon('+front.map(function(q){return jbX(q.x).toFixed(1)+'px '+q.y.toFixed(1)+'px';}).join(',')+')':'polygon(0 0,0 0,0 0)';   // i18n-exempt: a CSS polygon, read by the browser`);
rep(`.jb-wr::placeholder{color:#a59c90}
.jb-empty{color:#a59c90}`, `.jb-wr::placeholder{color:var(--nu-muted)}
.jb-empty{color:var(--nu-muted)}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
const add = (f, m) => { const d = JSON.parse(fs.readFileSync(f, 'utf8')); Object.assign(d, m); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); };
add('data/he-f.json', { 'אם צריך מאיפה להתחיל: {q}': 'אם צריכה מאיפה להתחיל: {q}', 'מחק את המחברת': 'מחקי את המחברת' });
add('data/he-x.json', { 'אם צריך מאיפה להתחיל: {q}': 'אם צריכים מאיפה להתחיל: {q}', 'מחק את המחברת': 'מחקו את המחברת' });
console.log('ok');
