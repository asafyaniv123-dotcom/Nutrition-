// Every exercise in data/exercises.json under each muscle the picker files it under (e.m), primary = e.m[0].
// node tools/sheets/muscle-list.mjs [out=exercise-sheets/muscle-list.html]
import fs from 'fs';
const out = process.argv[2] || 'exercise-sheets/muscle-list.html';
const ex = JSON.parse(fs.readFileSync('data/exercises.json', 'utf8')).exercises;
const html = fs.readFileSync('dev/index.html', 'utf8');
const demo = new Set((html.match(/var EX_DEMO=\{([^}]*)\}/)[1].match(/x\d+/g)) || []);
const ORDER = ['חזה', 'גב', 'גב רחב', 'טרפז', 'כתפיים', 'יד קדמית', 'יד אחורית', 'אמה', 'ארבע ראשי', 'ירך אחורית', 'ישבן', 'מקרבים', 'מרחיקים', 'תאומים', 'בטן', 'אלכסונים', 'גב תחתון', 'אירובי'];
const ART = { 'חזה': 'chest', 'גב': 'back', 'גב רחב': 'lats', 'טרפז': 'traps', 'כתפיים': 'shoulders', 'יד קדמית': 'biceps', 'יד אחורית': 'triceps', 'אמה': 'forearm', 'ארבע ראשי': 'quads', 'ירך אחורית': 'hamstrings', 'ישבן': 'glutes', 'מקרבים': 'adductors', 'מרחיקים': 'abductors', 'תאומים': 'calves', 'בטן': 'abs', 'אלכסונים': 'obliques', 'גב תחתון': 'lowerback', 'אירובי': 'cardio' };
const other = [...new Set(ex.flatMap(e => e.m))].filter(m => !ORDER.includes(m));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const row = (e, k) => `<li class="${e.m[0] === k ? 'p' : 's'}"><span class="id">${e.id}</span><span class="nm">${esc(e.n)}<small>${esc(e.en || '')}</small></span>${demo.has(e.id) ? '<span class="d">הדגמה</span>' : ''}${e.m[0] === k ? '' : `<span class="w">ראשי: ${esc(e.m[0])}</span>`}</li>`;
let body = '', toc = '';
for (const k of [...ORDER, ...other]) {
  const list = ex.filter(e => e.m.includes(k)); if (!list.length && !ORDER.includes(k)) continue;
  const prim = list.filter(e => e.m[0] === k), sec = list.filter(e => e.m[0] !== k);
  const nd = list.filter(e => demo.has(e.id)).length;
  toc += `<a href="#${ART[k] || k}">${esc(k)} <b>${list.length}</b></a>`;
  body += `<section id="${ART[k] || k}"><h2>${ART[k] ? `<img src="../assets/muscles/${ART[k]}.jpg" alt="">` : ''}${esc(k)}<span class="c">${list.length} · ${prim.length} ראשי · ${sec.length} משני · ${nd} עם הדגמה</span></h2><ul>${prim.map(e => row(e, k)).join('')}${sec.map(e => row(e, k)).join('')}</ul></section>`;
}
const none = ex.filter(e => !e.m.length);
fs.writeFileSync(out, `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>התרגילים לפי שריר</title>
<style>:root{--page:#ebe9e5;--tile:#f3f1ed;--ink:#3b3632;--mut:#615b55;--line:#d9d5ce;--amb:#8a5a12}
*{box-sizing:border-box}body{margin:0;padding:16px;background:var(--page);color:var(--ink);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;overflow-x:hidden}
.wrap{max-width:760px;margin:0 auto}h1{font-size:26px;margin:4px 0 6px}p{color:var(--mut);margin:0 0 12px}
.toc{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 18px}.toc a{background:var(--tile);border-radius:999px;padding:4px 12px;color:var(--ink);text-decoration:none;font-size:14px}.toc b{color:var(--mut);font-weight:600}
section{background:var(--tile);border-radius:22px;padding:12px 14px;margin:0 0 14px}
h2{font-size:19px;margin:0 0 8px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}h2 img{width:52px;height:52px;border-radius:12px;object-fit:cover}
h2 .c{font-size:13px;color:var(--mut);font-weight:500;flex-basis:100%}
ul{list-style:none;margin:0;padding:0}li{display:flex;align-items:baseline;gap:8px;padding:6px 0;border-top:1px solid var(--line);flex-wrap:wrap}
li.s{color:var(--mut)}.id{font:12px ui-monospace,monospace;color:var(--mut);min-width:3.4em}.nm{flex:1;min-width:0}.nm small{display:block;font-size:12px;color:var(--mut)}
.d{font-size:12px;color:var(--amb);font-weight:700}.w{font-size:12px;color:var(--mut)}</style></head><body><div class="wrap">
<h1>התרגילים לפי שריר</h1><p>${ex.length} תרגילים במאגר. תרגיל מופיע תחת כל שריר שרשום לו, כמו במסך "בחר תרגיל". קודם התרגילים שהשריר הוא הראשי שלהם, אחריהם (באפור) אלה שהוא משני בהם. ${demo.size} תרגילים עם הדגמה.${none.length ? ` ${none.length} בלי שריר בכלל: ${none.map(e => e.id).join(', ')}.` : ''}</p>
<div class="toc">${toc}</div>${body}</div></body></html>`);
console.log(ORDER.concat(other).map(k => `${k}: ${ex.filter(e => e.m.includes(k)).length} (${ex.filter(e => e.m[0] === k).length})`).join('\n'));
console.log('other muscles:', other.join(', ') || 'none', '| no muscle:', none.length, '| demos:', demo.size);
