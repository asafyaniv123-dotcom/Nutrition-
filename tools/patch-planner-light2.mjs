/* three findings on the lighter planner:
 *  - "one hour" reused the bare word "hour" (lower-case in five languages
 *    beside capitalised neighbours): its own key, שעה|משך.
 *  - the stage name chosen by a ternary: a list read by index instead.
 *  - "is the range tomorrow?" compared a translated label: the tomorrow row
 *    says so itself (field horizon1), and a flag remembers it. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`function plLens(){return [_t('חצי שעה'),_t('שעה'),_t('שעתיים'),_t('חצי יום')];}`, `function plLens(){return [_t('חצי שעה'),_t('שעה|משך'),_t('שעתיים'),_t('חצי יום')];}`);
rep(`  h+='</div><span class="pb-stage-t">'+(st===1?_t('המסגרת'):st===2?_t('העוגנים'):_t('מה עוד נכנס'))+'</span></div>';`,
  `  h+='</div><span class="pb-stage-t">'+[_t('המסגרת'),_t('העוגנים'),_t('מה עוד נכנס')][st-1]+'</span></div>';`);
rep(`  var hz=planProfile().horizon||'',one=hz===_t('מחר|אפשרות');`, `  var hz=planProfile().horizon||'',one=_plOne;`);
rep(`    var ii=+kind.slice(4),it=_plItems[ii],one=(planProfile().horizon||'')===_t('מחר|אפשרות');`, `    var ii=+kind.slice(4),it=_plItems[ii],one=_plOne;`);
rep(`var _plAdd=null,_plItems=[];`, `var _plAdd=null,_plItems=[],_plOne=false;   /* _plOne: the range is tomorrow, so nothing repeats */`);
rep(`function plWarmPick(field,value,label){`, `function plWarmPick(field,value,label){
  if(field==='horizon1'){_plOne=true;field='horizon';}else if(field==='horizon')_plOne=false;`);
rep(`    rows=[[_t('מחר|אפשרות'),'horizon'],[_t('השבוע'),'horizon'],`, `    rows=[[_t('מחר|אפשרות'),'horizon1'],[_t('השבוע'),'horizon'],`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
const T = ['One hour', 'Eine Stunde', 'Una hora', 'Une heure', 'Un’ora', 'Uma hora', '1時間', '一小时', '一小時', 'ساعة'];
['en', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar'].forEach((l, i) => { const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8')); d['שעה|משך'] = T[i]; fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); });
console.log('ok');
