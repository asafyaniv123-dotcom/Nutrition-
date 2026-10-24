/* review/fit-hub-proto, round three (Asaf, 24 Oct): the schedule is not a
 * door - it is the week strip at the top. Each day shows the workout planned
 * for it, lit by the light (today amber as now, done with its check), and
 * tapping the strip opens the schedule, where a day's workout is changed.
 * Four doors are left: built for you, stopwatch and timers, liked, tracking. */
import fs from 'fs';
const F = 'review/fit-hub-proto/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };

rep(`.wk{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:10px}
.wk div{border-radius:13px;padding:8px 0 7px;text-align:center;font-size:12.5px;font-weight:800;color:var(--mu)}
.wk i{display:block;width:7px;height:7px;border-radius:50%;margin:5px auto 0;background:#cfc7bc}
.wk .t{color:var(--ink)}.wk .t i{background:var(--am);box-shadow:0 0 7px rgba(240,169,46,.7)}
.wk .d i{background:#3f7a52}`,
`/* THE WEEK IS THE SCHEDULE: each day carries the workout planned for it */
.wkh{display:flex;justify-content:space-between;align-items:center;margin:12px 4px 7px;font-size:12.5px;font-weight:800;color:var(--mu)}
.wkh button{border:none;background:none;font-size:12.5px;font-weight:800;color:var(--mu);cursor:pointer;padding:0}
.wk{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;cursor:pointer}
.wk div{border-radius:14px;padding:8px 0 7px;text-align:center;font-size:12.5px;font-weight:800;color:var(--mu);min-height:66px}
.wk em{display:block;font-style:normal;font-size:10.5px;font-weight:700;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 2px}
.wk i{display:block;width:16px;height:4px;border-radius:3px;margin:6px auto 0;box-shadow:inset 1px 1px 2px var(--sh),inset -1px -1px 2px var(--lit)}
.wk .p i{background:linear-gradient(90deg,rgba(255,244,214,.9),rgba(255,226,170,.9));box-shadow:0 0 6px rgba(255,214,140,.55)}
.wk .p em{color:var(--ink)}
.wk .t{color:var(--ink)}.wk .t i{background:var(--am);box-shadow:0 0 8px rgba(240,169,46,.75)}
.wk .d i{width:13px;height:13px;border-radius:50%;margin-top:4px;
  background:#3f7a52 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 12.5 4 4 8-9'/%3E%3C/svg%3E") center/9px no-repeat;box-shadow:none}
/* the schedule, behind the strip */
.sd{position:absolute;inset:0;z-index:7;background:var(--g);display:none;padding:0 16px 100px;overflow-y:auto}.sd.on{display:block}
.sdr{border-radius:18px;padding:12px 13px;margin-top:10px;box-shadow:-3px -3px 8px var(--lit),4px 5px 12px var(--sh2)}
.sdr.t{box-shadow:inset 2px 3px 6px var(--sh),inset -2px -2px 5px var(--lit)}
.sdr b{font-size:15px}.sdr b span{font-size:12.5px;color:var(--mu);font-weight:700;margin-inline-start:6px}
.sdc{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.sdc button{border:none;border-radius:999px;padding:7px 11px;font-size:12.5px;font-weight:800;color:var(--mu);background:var(--g);cursor:pointer;box-shadow:-2px -2px 5px var(--lit),2px 3px 7px var(--sh2)}
.sdc button.on{color:var(--ink);box-shadow:inset 2px 3px 6px var(--sh),inset -2px -2px 5px var(--lit)}`);

rep(`    <div class="wk"><div class="raise d">א׳<i></i></div><div class="raise">ב׳<i></i></div><div class="raise d">ג׳<i></i></div><div class="raise">ד׳<i></i></div><div class="raise">ה׳<i></i></div><div class="raise">ו׳<i></i></div><div class="press t">ש׳<i></i></div></div>`,
`    <div class="wkh"><span>השבוע</span><button onclick="sdOpen()">לוז האימונים ‹</button></div>
    <div class="wk" id="wk" onclick="sdOpen()"></div>`);
rep(`  <div class="toast" id="toast"></div>`, `  <div class="sd" id="sd">
    <div class="hd"><h2>לוז האימונים</h2><span class="home raise" onclick="sdClose()" style="cursor:pointer">‹ כושר</span></div>
    <div id="sdl"></div>
  </div>
  <div class="toast" id="toast"></div>`);

/* four doors */
rep(`document.getElementById('a3').innerHTML=['gen','tmr','cal'].map(big).join('');
document.getElementById('aL').innerHTML=['trk','vid'].map(function(k){return row(k,1);}).join('');`,
`document.getElementById('a3').innerHTML=['gen','tmr','trk'].map(big).join('');
document.getElementById('aL').innerHTML=['vid'].map(function(k){return row(k,1);}).join('');`);
rep(`document.getElementById('bT').innerHTML=['gen','tmr','cal','vid'].map(function(k){return row(k,1);}).join('');
document.getElementById('c4').innerHTML=['gen','tmr','cal','trk'].map(big).join('');
document.getElementById('cL2').innerHTML=['vid'].map(function(k){return row(k,1);}).join('');`,
`document.getElementById('bT').innerHTML=['gen','tmr','vid'].map(function(k){return row(k,1);}).join('');
document.getElementById('c4').innerHTML=['gen','tmr','vid','trk'].map(big).join('');
document.getElementById('cL2').style.display='none';
/* the week: what is planned each day, what was done, where today is */
var DAYS=['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'],DL=['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'],
    TYPES=['עליון','תחתון','גוף מלא','אירובי','מנוחה'],
    PLAN=JSON.parse(localStorage.getItem('hub_plan_proto')||'["עליון","מנוחה","תחתון","מנוחה","עליון","מנוחה","גוף מלא"]'),
    DONE={0:1,2:1},TODAY=6;
function wkPaint(){var h='',i;for(i=0;i<7;i++){var p=PLAN[i]!=='מנוחה';
  h+='<div class="'+(i===TODAY?'press t':'raise')+(DONE[i]?' d':'')+(p&&!DONE[i]?' p':'')+'">'+DL[i]+'<em>'+(p?PLAN[i]:'·')+'</em><i></i></div>';}
  document.getElementById('wk').innerHTML=h;
  var st=document.querySelector('.start');st.querySelector('small').textContent='היום לפי הלוז';st.querySelector('b').textContent=PLAN[TODAY]==='מנוחה'?'יום מנוחה':'אימון '+PLAN[TODAY];}
function sdPaint(){var h='',i;for(i=0;i<7;i++){h+='<div class="sdr'+(i===TODAY?' t':'')+'"><b>יום '+DAYS[i]+(i===TODAY?'<span>היום</span>':'')+(DONE[i]?'<span>✓ בוצע</span>':'')+'</b><div class="sdc">';
  TYPES.forEach(function(t){h+='<button class="'+(PLAN[i]===t?'on':'')+'" onclick="PLAN['+i+']=\\''+t+'\\';localStorage.setItem(\\'hub_plan_proto\\',JSON.stringify(PLAN));sdPaint();wkPaint()">'+t+'</button>';});h+='</div></div>';}
  document.getElementById('sdl').innerHTML=h;}
function sdOpen(){sdPaint();document.getElementById('sd').classList.add('on');}
function sdClose(){document.getElementById('sd').classList.remove('on');}
wkPaint();`);
rep(`<h1>מסך הכושר: חמש דלתות במקום שמונה</h1>`, `<h1>מסך הכושר: השבוע הוא הלוז, וארבע דלתות</h1>`);
rep(`<p>צעדים יצא כאזור נפרד, ו"מעקב" אחד מחליף את מעקב משקלים, המספרים שלי, היסטוריה וצעדים. לחץ על "מעקב" כדי לראות מה יש בפנים.</p>`,
    `<p>לוז האימונים עבר לשורת השבוע: כל יום מראה את האימון שמתוכנן לו, ולחיצה על השורה פותחת את הלוז לשינוי. נשארו ארבע דלתות. לחץ על השבוע ועל "מעקב".</p>`);
rep(`    <li><b>א׳:</b> שלוש הדלתות של מה שעושים בחדר כושר גדולות; מעקב ואימונים שאהבתי בשתי שורות שקטות מתחת.</li>
    <li><b>ב׳:</b> "להתאמן" כרשימה, ו"לעקוב" ככרטיס אחד שמראה במבט שלושה מספרים: אימונים השבוע, צעדים היום, שיא אחרון.</li>
    <li><b>ג׳:</b> שורה אחת של ארבע דלתות קטנות, כולל מעקב, ואימונים שאהבתי כשורה אחת מתחת.</li>`,
`    <li><b>השבוע:</b> מתחת לכל יום כתוב האימון המתוכנן. יום מתוכנן מואר באור רך, היום באור הכתום (כמו עכשיו), ויום שבוצע מקבל וי ירוק. לחיצה על השורה, או על "לוז האימונים", פותחת את הלוז, ושם בוחרים לכל יום אימון או מנוחה. כרטיס "אימון חדש" אומר מה מתוכנן היום.</li>
    <li><b>א׳:</b> שלוש דלתות גדולות (אימון שנבנה לך, סטופר וטיימרים, מעקב), ואימונים שאהבתי בשורה שקטה מתחת.</li>
    <li><b>ב׳:</b> "להתאמן" כרשימה של שלוש, ו"לעקוב" ככרטיס אחד עם שלושה מספרים במבט.</li>
    <li><b>ג׳:</b> שורה אחת של ארבע דלתות קטנות, וזהו.</li>`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('patched');
