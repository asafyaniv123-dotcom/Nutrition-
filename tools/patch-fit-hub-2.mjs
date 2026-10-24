/* Three fixes to patch-fit-hub:
 *  - data-t is the app's own "translate this element" attribute (applyI18n
 *    reads it), so the day sheet's chips carried their type id there and would
 *    have been retitled by it. data-wt instead.
 *  - the tab labels and the day names were collections of _t() results
 *    (find-translated-data counted them); each is now asked for by name. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`    h+='<button data-t="'+WORKOUT_TYPES[i].id+'" class="'`, `    h+='<button data-wt="'+WORKOUT_TYPES[i].id+'" class="'`);
rep(`cur.type=b.getAttribute('data-t');`, `cur.type=b.getAttribute('data-wt');`);
rep(`  var L={weights:_t('משקלים'),steps:_t('צעדים'),history:_t('אימונים|מעקב'),stats:_t('התקדמות')},h='<div class="ftt">',i,v;`,
    `  var h='<div class="ftt">',i,v;`);
rep(`onclick="_fitView=\\''+v+'\\';renderFitness()">'+L[v]+'</button>';}`, `onclick="_fitView=\\''+v+'\\';renderFitness()">'+fitTrackLabel(v)+'</button>';}`);
rep(`function fitTrackTabsHTML(){`, `function fitTrackLabel(v){
  if(v==='weights')return _t('משקלים');
  if(v==='steps')return _t('צעדים');
  if(v==='history')return _t('אימונים|מעקב');
  return _t('התקדמות');
}
function fitTrackTabsHTML(){`);
rep(`  var DN=[_t('ראשון'),_t('שני'),_t('שלישי'),_t('רביעי'),_t('חמישי'),_t('שישי'),_t('שבת')];\n`, ``);
rep(`esc(DN[+key.charAt(3)])`, `esc(dfmt(dayShift(+key.charAt(3)-appNow().getDay())+'T12:00:00',{weekday:'long'}))`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
