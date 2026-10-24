/* review/fit-hub-proto, round four (Asaf, 24 Oct):
 *  - "built for you" is not an area, it is a way to START - so it moves into
 *    the start card, whose tap now offers: today's planned workout, one built
 *    for you, one of my programs, or an empty one;
 *  - the schedule was crowded and gave every day too much room: it is one
 *    compact list now, a line per day, and the type is picked in a sheet.
 * Three doors are left, so the options are two: a row of three, or a list
 * with the tracking card. */
import fs from 'fs';
const F = 'review/fit-hub-proto/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };

rep(`<div class="bar"><h1>מסך הכושר: השבוע הוא הלוז, וארבע דלתות</h1>
<p>לוז האימונים עבר לשורת השבוע: כל יום מראה את האימון שמתוכנן לו, ולחיצה על השורה פותחת את הלוז לשינוי. נשארו ארבע דלתות. לחץ על השבוע ועל "מעקב".</p>
<div class="sw" id="sw"><button class="on" data-v="a">א׳ · שלוש גדולות ורשימה</button><button data-v="b">ב׳ · רשימה וכרטיס מעקב</button><button data-v="c">ג׳ · שורה של ארבע</button></div></div>`,
`<div class="bar"><h1>מסך הכושר: שלוש דלתות</h1>
<p>"אימון שנבנה לך" נכנס לתוך "התחל אימון", והלוז קומפקטי: שורה לכל יום. לחץ על כרטיס האימון, על השבוע ועל "מעקב".</p>
<div class="sw" id="sw"><button class="on" data-v="a">א׳ · שלוש דלתות בשורה</button><button data-v="b">ב׳ · רשימה וכרטיס מעקב</button></div></div>`);
rep(`    <div class="start raise" onclick="go('אימון חדש')" style="cursor:pointer">`, `    <div class="start raise" onclick="startOpen()" style="cursor:pointer">`);
rep(`      <div class="lab">עוד</div>
      <div class="list" id="aL"></div>`, ``);

/* the schedule, compact */
rep(`.sdr{border-radius:18px;padding:12px 13px;margin-top:10px;box-shadow:-3px -3px 8px var(--lit),4px 5px 12px var(--sh2)}
.sdr.t{box-shadow:inset 2px 3px 6px var(--sh),inset -2px -2px 5px var(--lit)}
.sdr b{font-size:15px}.sdr b span{font-size:12.5px;color:var(--mu);font-weight:700;margin-inline-start:6px}
.sdc{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}`,
`.sdl{border-radius:20px;padding:4px 14px;margin-top:8px;box-shadow:-4px -4px 10px var(--lit),5px 6px 14px var(--sh2)}
.sdr{display:flex;align-items:center;gap:10px;width:100%;border:none;background:none;padding:12px 0;border-top:1px solid rgba(176,168,156,.3);cursor:pointer;text-align:start;color:var(--ink)}
.sdr:first-child{border-top:none}
.sdr b{font-size:15px;font-weight:800;min-width:52px}
.sdr .st{width:9px;height:9px;border-radius:50%;flex:none;background:transparent}
.sdr.t .st{background:var(--am);box-shadow:0 0 7px rgba(240,169,46,.75)}
.sdr.d .st{background:#3f7a52}
.sdr em{font-style:normal;font-size:12px;font-weight:700;color:var(--mu)}
.sdr .ty{margin-inline-start:auto;font-size:14px;font-weight:800;color:var(--ink)}
.sdr .ty.r{color:var(--mu);font-weight:700}
.sdr::after{content:"‹";color:var(--mu);font-size:17px}
.sdhint{font-size:13px;color:var(--mu);font-weight:600;margin:4px 4px 0}
.sdc{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}`);
rep(`    <div id="sdl"></div>`, `    <div class="sdhint">לחץ על יום כדי לשנות את האימון שלו.</div>
    <div class="sdl" id="sdl"></div>`);
rep(`function sdPaint(){var h='',i;for(i=0;i<7;i++){h+='<div class="sdr'+(i===TODAY?' t':'')+'"><b>יום '+DAYS[i]+(i===TODAY?'<span>היום</span>':'')+(DONE[i]?'<span>✓ בוצע</span>':'')+'</b><div class="sdc">';
  TYPES.forEach(function(t){h+='<button class="'+(PLAN[i]===t?'on':'')+'" onclick="PLAN['+i+']=\\''+t+'\\';localStorage.setItem(\\'hub_plan_proto\\',JSON.stringify(PLAN));sdPaint();wkPaint()">'+t+'</button>';});h+='</div></div>';}
  document.getElementById('sdl').innerHTML=h;}`,
`function sdPaint(){var h='',i;for(i=0;i<7;i++){
  h+='<button class="sdr'+(i===TODAY?' t':'')+(DONE[i]?' d':'')+'" onclick="dayPick('+i+')"><i class="st"></i><b>'+DAYS[i]+'</b>'+
     (i===TODAY?'<em>היום</em>':DONE[i]?'<em>בוצע</em>':'')+'<span class="ty'+(PLAN[i]==='מנוחה'?' r':'')+'">'+PLAN[i]+'</span></button>';}
  document.getElementById('sdl').innerHTML=h;}
/* one day's workout, chosen in a sheet rather than five chips on every row */
function dayPick(i){var h='<h3>יום '+DAYS[i]+'</h3><div class="sdc">';
  TYPES.forEach(function(t){h+='<button class="'+(PLAN[i]===t?'on':'')+'" onclick="PLAN['+i+']=\\''+t+'\\';localStorage.setItem(\\'hub_plan_proto\\',JSON.stringify(PLAN));sdPaint();wkPaint();shClose()">'+t+'</button>';});
  sheetWith(h+'</div>');}
/* the start card's choices: what the schedule says, one built for you, a program, or nothing */
function startOpen(){var p=PLAN[TODAY],h='<h3>אימון חדש</h3><div class="list">';
  if(p!=='מנוחה')h+='<button onclick="shClose();go(\\'אימון '+p+'\\')">אימון '+p+'<em>לפי הלוז של היום</em></button>';
  h+='<button onclick="shClose();go(\\'אימון שנבנה לך\\')">אימון שנבנה לך<em>לפי מה שחסר לך השבוע</em></button>'+
     '<button onclick="shClose();go(\\'מהתוכניות שלי\\')">מהתוכניות שלי<em>A · B · C</em></button>'+
     '<button onclick="shClose();go(\\'אימון ריק\\')">אימון ריק<em>מוסיפים תרגילים תוך כדי</em></button></div>';
  sheetWith(h);}
function sheetWith(h){var sh=document.getElementById('sh');sh.querySelector('.in').innerHTML=h;sh.classList.add('on');}
function shClose(){document.getElementById('sh').classList.remove('on');}`);

/* three doors */
rep(`document.getElementById('a3').innerHTML=['gen','tmr','trk'].map(big).join('');
document.getElementById('aL').innerHTML=['vid'].map(function(k){return row(k,1);}).join('');
document.getElementById('bT').innerHTML=['gen','tmr','vid'].map(function(k){return row(k,1);}).join('');`,
`document.getElementById('a3').innerHTML=['tmr','vid','trk'].map(big).join('');
document.getElementById('bT').innerHTML=['tmr','vid'].map(function(k){return row(k,1);}).join('');`);
rep(`document.getElementById('c4').innerHTML=['gen','tmr','vid','trk'].map(big).join('');
document.getElementById('cL2').style.display='none';`, ``);
rep(`  ['a','b','c'].forEach(function(x){`, `  ['a','b'].forEach(function(x){`);
/* the "how to start" line on the card */
rep(`  var st=document.querySelector('.start');st.querySelector('small').textContent='היום לפי הלוז';st.querySelector('b').textContent=PLAN[TODAY]==='מנוחה'?'יום מנוחה':'אימון '+PLAN[TODAY];}`,
    `  var st=document.querySelector('.start');st.querySelector('small').textContent='היום לפי הלוז';st.querySelector('b').textContent=PLAN[TODAY]==='מנוחה'?'יום מנוחה':'אימון '+PLAN[TODAY];
  st.querySelector('span').textContent='או אימון שנבנה לך, מתוכנית, או ריק';}`);

rep(`    <li><b>א׳:</b> שלוש דלתות גדולות (אימון שנבנה לך, סטופר וטיימרים, מעקב), ואימונים שאהבתי בשורה שקטה מתחת.</li>
    <li><b>ב׳:</b> "להתאמן" כרשימה של שלוש, ו"לעקוב" ככרטיס אחד עם שלושה מספרים במבט.</li>
    <li><b>ג׳:</b> שורה אחת של ארבע דלתות קטנות, וזהו.</li>`,
`    <li><b>התחל אימון:</b> לחיצה על הכרטיס פותחת בחירה: האימון של היום לפי הלוז, אימון שנבנה לך, מהתוכניות שלי, או אימון ריק. "אימון שנבנה לך" כבר לא אזור.</li>
    <li><b>הלוז:</b> רשימה אחת, שורה לכל יום, עם האימון בצד. לחיצה על יום פותחת בחירה קטנה מלמטה.</li>
    <li><b>א׳:</b> שלוש דלתות בשורה: סטופר וטיימרים, אימונים שאהבתי, מעקב.</li>
    <li><b>ב׳:</b> "להתאמן" כרשימה של שתיים, ו"לעקוב" ככרטיס אחד עם שלושה מספרים במבט.</li>`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('patched');
