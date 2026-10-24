/* review/workout-proto, round two (Asaf, 24 Oct):
 *  - marker A ("only the check") is the one - the switcher goes;
 *  - "swap" opens the whole exercise library, like choosing at the start:
 *    the app's own picker - search in any language, by muscle / by
 *    equipment, the real 235 exercises from stable/data/exercises.json;
 *  - the rest is a wheel with all the app's stops (off, 0:30 ... 3:00). */
import fs from 'fs';
const F = 'review/workout-proto/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };

rep(`  <div class="sw" id="mk"><span>סימון תרגיל שהסתיים:</span><button data-m="A" class="on">א׳ · רק וי</button><button data-m="B">ב׳ · שקוע עם וי</button><button data-m="C">ג׳ · פס ירוק דק</button></div>`, ``);
rep(`document.getElementById('mk').onclick=function(e){var m=e.target.dataset.m;if(!m)return;[].forEach.call(this.querySelectorAll('button'),function(b){b.classList.toggle('on',b.dataset.m===m);});
  var p=document.getElementById('ph');p.classList.remove('mA','mB','mC');p.classList.add('m'+m);};`, ``);
rep(`    <li>הסימון של תרגיל שהסתיים: שלוש אפשרויות בשורה למעלה. אין יותר מילוי ירוק בוהק.</li>`,
    `    <li>תרגיל שהסתיים: וי ירוק קטן ליד השם (א׳, כמו שבחרת).</li>
    <li>"החלף" פותח את כל ספריית התרגילים, כמו בבחירה בתחילת האימון: חיפוש בכל שפה, לפי שריר או לפי ציוד.</li>
    <li>המנוחה: גלגלת עם כל האפשרויות, מכבוי ועד 3 דקות.</li>`);

/* the rest wheel */
rep(`        <div id="restSet"><div class="lab" style="margin-bottom:6px">מנוחה</div><div class="seg press" id="seg"><button>1:30</button><button class="on">2:00</button><button>2:30</button></div><button class="raise seam go" onclick="restGo()">התחל</button></div>`,
    `        <div id="restSet"><div class="lab" style="margin-bottom:6px">מנוחה</div><div class="ew press" id="rw"></div><button class="raise seam go" onclick="restGo()">התחל</button></div>`);
rep(`function secs(){var t=document.querySelector('#seg .on').textContent.split(':');return +t[0]*60+ +t[1];}`,
    `var RS=[0,30,45,60,75,90,120,150,180],restLen=120;
function secs(){return restLen;}
(function(){var h='<div class="win"></div><div class="col" id="rwc">';for(var i=0;i<RS.length;i++)h+='<div><b>'+(RS[i]?mmss(RS[i]):'כבוי')+'</b></div>';
  document.getElementById('rw').innerHTML=h+'</div>';var c=document.getElementById('rwc');
  c.addEventListener('scroll',function(){var k=Math.max(0,Math.min(RS.length-1,Math.round(c.scrollTop/36)));restLen=RS[k];[].forEach.call(c.children,function(r,j){r.classList.toggle('on',j===k);});});
  setTimeout(function(){c.scrollTop=RS.indexOf(120)*36;c.dispatchEvent(new Event('scroll'));},60);})();`);
rep(`document.getElementById('seg').onclick=function(e){if(e.target.tagName!=='BUTTON')return;[].forEach.call(this.children,function(b){b.classList.remove('on');});e.target.classList.add('on');};`, ``);
rep(`function restGo(){clearInterval(T);var tot=secs(),left=tot,`, `function restGo(){clearInterval(T);if(!secs())return;var tot=secs(),left=tot,`);
/* mmss is used by the wheel above it; hoist it */
rep(`function mmss(s){return Math.floor(s/60)+':'+('0'+s%60).slice(-2);}`, ``);
rep(`var EW=['לא דורג',`, `function mmss(s){return Math.floor(s/60)+':'+('0'+s%60).slice(-2);}
var EW=['לא דורג',`);

/* the picker */
rep(`.toast{position:absolute;`, `/* the exercise picker - the app's own, over the screen */
.pk{position:absolute;inset:0;z-index:8;background:rgba(42,34,27,.38);display:none;align-items:flex-end}.pk.on{display:flex}
.pk .in{width:100%;height:84%;background:var(--g);border-radius:28px 28px 0 0;padding:18px 16px 0;display:flex;flex-direction:column}
.pk-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.pk-h b{font-size:21px}
.pk-h button{border:none;background:none;font-size:26px;color:var(--mu);cursor:pointer}
.pk-s{width:100%;border:none;border-radius:16px;padding:13px 14px;font:600 16px Assistant,sans-serif;color:var(--ink);background:var(--g);outline:none;box-shadow:inset 2px 3px 6px var(--sh),inset -2px -2px 5px var(--lit)}
.pk-t{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}
.pk-t button{border-radius:14px;padding:10px;font-size:15px;font-weight:800;color:var(--mu)}
.pk-t button.on{color:var(--ink);box-shadow:inset 2px 3px 6px var(--sh),inset -2px -2px 5px var(--lit)}
.pk-b{flex:1;overflow-y:auto;padding:2px 2px 12px;scrollbar-width:none}.pk-b::-webkit-scrollbar{display:none}
.pk-g{font-size:13px;font-weight:800;color:var(--mu);margin:10px 4px 6px}
.pk-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pk-grid button{display:flex;justify-content:space-between;align-items:center;border-radius:14px;padding:13px 14px;font-size:15.5px;font-weight:800;text-align:start}
.pk-grid button i{font-style:normal;font-size:12px;color:var(--mu)}
.pk-l button{display:block;width:100%;text-align:start;border-radius:14px;padding:12px 14px;margin-bottom:8px;font-size:15.5px;font-weight:800}
.pk-l button span{display:block;font-size:12.5px;color:var(--mu);font-weight:700;margin-top:2px}
.pk-back{border:none;background:none;font:800 14px Assistant,sans-serif;color:var(--t7);cursor:pointer;padding:4px 0 8px}
.toast{position:absolute;`);
rep(`  <div class="toast" id="toast"></div>`, `  <div class="pk" id="pk" onclick="if(event.target===this)pkClose()"><div class="in">
    <div class="pk-h"><b id="pkt">בחר תרגיל</b><button onclick="pkClose()">×</button></div>
    <input class="pk-s" id="pks" placeholder="חפש בכל שפה" oninput="pkPaint()">
    <div class="pk-t" id="pktabs"><button class="raise on" data-k="m">לפי שריר</button><button class="raise" data-k="q">לפי ציוד</button></div>
    <div class="pk-b" id="pkb"></div>
  </div></div>
  <div class="toast" id="toast"></div>`);
rep(`  if(k==='swap'){h='<h3>להחליף את '+e.n+' ב…</h3><div class="li">';LIB.forEach(function(n){h+='<button class="raise" onclick="swapTo(\\''+n+'\\')">'+n+'</button>';});h+='</div>';}
  if(k==='add'){h='<h3>להוסיף תרגיל</h3><div class="li">';LIB.forEach(function(n){h+='<button class="raise" onclick="addEx(\\''+n+'\\')">'+n+'</button>';});h+='</div>';}`, ``);
rep(`function sheet(k){var e=ex(),h='';`, `/* the library, read from the app's own data */
var XL=[],pkMode='m',pkGroup='',pkThen=null;
fetch('../../stable/data/exercises.json').then(function(r){return r.json();}).then(function(j){XL=Array.isArray(j)?j:(j.exercises||Object.values(j));});
var MG=[['פלג גוף עליון',['חזה','גב','גב רחב','טרפז','כתפיים','יד קדמית','יד אחורית','אמה']],['פלג גוף תחתון',['ארבע ראשי','ירך אחורית','ישבן','מקרבים','מרחיקים','תאומים']],['מרכז הגוף ואחר',['בטן','אלכסונים','גב תחתון','אירובי']]];
function pkOpen(title,then){pkThen=then;pkGroup='';document.getElementById('pkt').textContent=title;document.getElementById('pks').value='';document.getElementById('pk').classList.add('on');pkPaint();}
function pkClose(){document.getElementById('pk').classList.remove('on');}
document.getElementById('pktabs').onclick=function(e){var k=e.target.dataset.k;if(!k)return;pkMode=k;pkGroup='';[].forEach.call(this.children,function(b){b.classList.toggle('on',b.dataset.k===k);});pkPaint();};
function pkList(arr){var h='<div class="pk-l">';arr.slice(0,120).forEach(function(x){h+='<button class="raise" onclick="pkPick(\\''+x.n.replace(/'/g,"\\\\'")+'\\')">'+x.n+'<span>'+(x.m||[]).join(' · ')+(x.q&&x.q.length?' · '+x.q.join(', '):'')+'</span></button>';});return h+'</div>';}
function pkPaint(){var b=document.getElementById('pkb'),q=document.getElementById('pks').value.trim().toLowerCase(),h='';
  if(!XL.length){b.innerHTML='<div class="pk-g">טוען…</div>';setTimeout(pkPaint,300);return;}
  if(q){var r=XL.filter(function(x){return (x.n+' '+(x.en||'')+' '+(x.aka||[]).join(' ')+' '+JSON.stringify(x.t||{})).toLowerCase().indexOf(q)>=0;});b.innerHTML='<div class="pk-g">'+r.length+' תוצאות</div>'+pkList(r);return;}
  if(pkGroup){var r2=XL.filter(function(x){return (x[pkMode]||[]).indexOf(pkGroup)>=0;});b.innerHTML='<button class="pk-back" onclick="pkGroup=\\'\\';pkPaint()">‹ חזרה</button><div class="pk-g">'+pkGroup+' · '+r2.length+'</div>'+pkList(r2);return;}
  var cnt={};XL.forEach(function(x){(x[pkMode]||[]).forEach(function(v){cnt[v]=(cnt[v]||0)+1;});});
  var cell=function(v){return '<button class="raise" onclick="pkGroup=\\''+v+'\\';pkPaint()">'+v+'<i>'+cnt[v]+'</i></button>';};
  if(pkMode==='m'){var seen={};MG.forEach(function(g){var ks=g[1].filter(function(v){return cnt[v];});ks.forEach(function(v){seen[v]=1;});if(ks.length)h+='<div class="pk-g">'+g[0]+'</div><div class="pk-grid">'+ks.map(cell).join('')+'</div>';});
    var rest=Object.keys(cnt).filter(function(v){return !seen[v];});if(rest.length)h+='<div class="pk-g">עוד</div><div class="pk-grid">'+rest.map(cell).join('')+'</div>';}
  else h='<div class="pk-grid" style="margin-top:6px">'+Object.keys(cnt).sort(function(a,b){return cnt[b]-cnt[a];}).map(cell).join('')+'</div>';
  b.innerHTML=h;}
function pkPick(n){pkClose();if(pkThen)pkThen(n);}
function sheet(k){var e=ex(),h='';
  if(k==='swap'){if(e.sets.length){toast('כבר נרשמו סטים בתרגיל הזה');return;}pkOpen('להחליף את '+e.n,swapTo);return;}
  if(k==='add'){pkOpen('להוסיף תרגיל',addEx);return;}`);
fs.writeFileSync(F, s);
console.log('patched');
