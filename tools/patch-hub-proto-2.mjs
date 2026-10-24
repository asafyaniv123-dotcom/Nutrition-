/* review/fit-hub-proto, round two (Asaf, 24 Oct): steps is not a door of its
 * own - it is logged through the nutrition chat and later the helper - and
 * "weight tracking" becomes one general "tracking": weights, steps, workouts
 * and progress together. So eight doors become five:
 *   אימון שנבנה לך · סטופר וטיימרים · לוז האימונים · אימונים שאהבתי · מעקב
 * (מעקב משקלים, המספרים שלי, היסטוריה and צעדים all live inside מעקב.)
 * Tapping מעקב opens a sketch of that screen with its four tabs. */
import fs from 'fs';
const F = 'review/fit-hub-proto/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };

rep(`<title>מסך הכושר: שלוש דרכים להרגיע אותו</title>`, `<title>מסך הכושר: חמש דלתות, שלוש דרכים</title>`);
rep(`<div class="bar"><h1>מסך הכושר: שלוש דרכים להרגיע אותו</h1>
<p>היום יש שמונה אריחים באותו משקל, ושום דבר לא אומר מה חשוב. בכל אחת מהשלוש כל הדלתות נשארות, רק מסודרות לפי חשיבות.</p>`,
`<div class="bar"><h1>מסך הכושר: חמש דלתות במקום שמונה</h1>
<p>צעדים יצא כאזור נפרד, ו"מעקב" אחד מחליף את מעקב משקלים, המספרים שלי, היסטוריה וצעדים. לחץ על "מעקב" כדי לראות מה יש בפנים.</p>`);
rep(`<div class="sw" id="sw"><button class="on" data-v="a">א׳ · שלוש גדולות ורשימה</button><button data-v="b">ב׳ · שתי קבוצות</button><button data-v="c">ג׳ · שורה אחת ו"הכול"</button></div></div>`,
`<div class="sw" id="sw"><button class="on" data-v="a">א׳ · שלוש גדולות ורשימה</button><button data-v="b">ב׳ · רשימה וכרטיס מעקב</button><button data-v="c">ג׳ · שורה של ארבע</button></div></div>`);

/* B: train as a list, tracking as a card with a glance at each of its four */
rep(`      <div class="lab">לעקוב</div>
      <div class="list" id="bF"></div>`, `      <div class="lab">לעקוב</div>
      <div class="trk raise" onclick="trkOpen('w')"><div class="trk-h"><span>מעקב</span><em>הכול ‹</em></div>
        <div class="trk-g"><div><b>3</b><span>אימונים השבוע</span></div><div><b>6,240</b><span>צעדים היום</span></div><div><b>72.5</b><span>שיא בלחיצת חזה</span></div></div></div>`);
/* C: four small doors, the fifth as a quiet row */
rep(`      <button class="all raise" onclick="sheet()">כל האזורים ‹</button>`, `      <div class="list" id="cL2" style="margin-top:12px"></div>`);

rep(`.goal{display:flex;`, `.trk{border-radius:20px;padding:14px 14px 12px;cursor:pointer}
.trk-h{display:flex;justify-content:space-between;align-items:center;font-size:16px;font-weight:800}
.trk-h em{font-style:normal;font-size:13px;color:var(--mu)}
.trk-g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
.trk-g div{border-radius:14px;padding:10px 6px;text-align:center;box-shadow:inset 2px 3px 6px var(--sh),inset -2px -2px 5px var(--lit)}
.trk-g b{display:block;font-size:19px;font-weight:800}
.trk-g span{font-size:11.5px;font-weight:700;color:var(--mu)}
/* the tracking screen, sketched */
.tp{position:absolute;inset:0;z-index:7;background:var(--g);display:none;padding:0 16px 100px;overflow-y:auto}.tp.on{display:block}
.tp .seg{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;border-radius:16px;padding:4px;margin-top:6px}
.tp .seg button{border:none;background:none;border-radius:12px;padding:10px 0;font-size:13.5px;font-weight:800;color:var(--mu);cursor:pointer}
.tp .seg button.on{background:var(--g);color:var(--ink);box-shadow:-2px -2px 5px var(--lit),2px 3px 7px var(--sh2)}
.tp .card{border-radius:20px;padding:15px;margin-top:12px;box-shadow:-4px -4px 10px var(--lit),5px 6px 14px var(--sh2)}
.tp .card h4{margin:0 0 4px;font-size:15px}.tp .card p{margin:0;font-size:13.5px;color:var(--mu);line-height:1.5}
.bars{display:flex;align-items:flex-end;gap:7px;height:90px;margin-top:12px}
.bars i{flex:1;border-radius:7px 7px 3px 3px;background:color-mix(in srgb,var(--t5) 55%,var(--g))}
.goal{display:flex;`);
rep(`  <div class="toast" id="toast"></div>`, `  <div class="tp" id="tp">
    <div class="hd"><h2>מעקב</h2><span class="home raise" onclick="document.getElementById('tp').classList.remove('on')" style="cursor:pointer">‹ כושר</span></div>
    <div class="seg press" id="tseg"><button data-t="w">משקלים</button><button data-t="s">צעדים</button><button data-t="h">אימונים</button><button data-t="p">התקדמות</button></div>
    <div id="tbody"></div>
  </div>
  <div class="toast" id="toast"></div>`);

/* the doors */
rep(`  wt:['מעקב משקלים','כמה אתה מרים בכל תרגיל'],num:['המספרים שלי','נפח, שרירים, והשיא שלך'],his:['היסטוריה','כל אימון שנרשם'],stp:['צעדים','הדבר שזז כל יום']};`,
    `  trk:['מעקב','משקלים, צעדים, אימונים והתקדמות']};`);
rep(`  wt:'<path d="M5 7h14M5 12h14M5 17h9"/>',`, `  trk:'<path d="M4 19h16M6 15l4-4 3 3 5-6"/>',`);
rep(`function row(k,sub){return '<button onclick="go(\\''+D[k][0]+'\\')">'`, `function row(k,sub){return '<button onclick="'+(k==='trk'?'trkOpen(\\'w\\')':'go(\\''+D[k][0]+'\\')')+'">'`);
rep(`function big(k){return '<button class="raise" onclick="go(\\''+D[k][0]+'\\')"><span`, `function big(k){return '<button class="raise" onclick="'+(k==='trk'?'trkOpen(\\'w\\')':'go(\\''+D[k][0]+'\\')')+'"><span`);
rep(`document.getElementById('aL').innerHTML=['wt','num','his','vid','stp'].map(function(k){return row(k);}).join('');
document.getElementById('bT').innerHTML=['gen','tmr','cal','vid'].map(function(k){return row(k,1);}).join('');
document.getElementById('bF').innerHTML=['wt','num','his','stp'].map(function(k){return row(k,1);}).join('');
document.getElementById('c4').innerHTML=['gen','tmr','cal','wt'].map(big).join('');
document.getElementById('cL').innerHTML=['gen','tmr','cal','wt','num','his','vid','stp'].map(function(k){return row(k,1);}).join('');`,
`document.getElementById('aL').innerHTML=['trk','vid'].map(function(k){return row(k,1);}).join('');
document.getElementById('bT').innerHTML=['gen','tmr','cal','vid'].map(function(k){return row(k,1);}).join('');
document.getElementById('c4').innerHTML=['gen','tmr','cal','trk'].map(big).join('');
document.getElementById('cL2').innerHTML=['vid'].map(function(k){return row(k,1);}).join('');
var TB={w:'<div class="card"><h4>לחיצת חזה במוט</h4><p>72.5 ק״ג × 10 · שיא חדש לפני יומיים</p><div class="bars"><i style="height:40%"></i><i style="height:48%"></i><i style="height:55%"></i><i style="height:60%"></i><i style="height:72%"></i><i style="height:86%"></i></div></div><div class="card"><h4>סקוואט</h4><p>90 ק״ג × 8 · יציב שלושה שבועות</p></div><div class="card"><h4>כל התרגילים ‹</h4><p>מה שהיה "מעקב משקלים"</p></div>',
  s:'<div class="card"><h4>היום: 6,240 צעדים</h4><p>נרשם דרך הצ׳אט של התזונה. בהמשך גם דרך העוזר.</p><div class="bars"><i style="height:50%"></i><i style="height:70%"></i><i style="height:35%"></i><i style="height:80%"></i><i style="height:62%"></i><i style="height:90%"></i><i style="height:58%"></i></div></div>',
  h:'<div class="card"><h4>פלג גוף עליון · אתמול</h4><p>5 תרגילים · 52 דקות</p></div><div class="card"><h4>רגליים · יום ד׳</h4><p>4 תרגילים · 47 דקות</p></div><div class="card"><h4>כל האימונים ‹</h4><p>מה שהיה "היסטוריה"</p></div>',
  p:'<div class="card"><h4>נפח השבוע</h4><p>12,400 ק״ג · 8% יותר מהשבוע שעבר</p><div class="bars"><i style="height:45%"></i><i style="height:52%"></i><i style="height:61%"></i><i style="height:70%"></i></div></div><div class="card"><h4>סטים לכל שריר</h4><p>מה שהיה "המספרים שלי"</p></div>'};
function trkOpen(t){document.getElementById('tp').classList.add('on');trkTab(t);}
function trkTab(t){[].forEach.call(document.getElementById('tseg').children,function(b){b.classList.toggle('on',b.dataset.t===t);});document.getElementById('tbody').innerHTML=TB[t];}
document.getElementById('tseg').onclick=function(e){var t=e.target.dataset.t;if(t)trkTab(t);};`);

rep(`    <li><b>א׳:</b> שלוש הדלתות של מה שעושים בחדר כושר (אימון שנבנה לך, סטופר וטיימרים, לוז האימונים) גדולות. חמש האחרות ברשימה שקטה אחת, בלי ריבועים. המטרה הופכת לשורה אחת.</li>
    <li><b>ב׳:</b> שתי קבוצות עם שם, "להתאמן" ו"לעקוב", כל אחת רשימה. אין אריחים בכלל, רק סדר.</li>
    <li><b>ג׳:</b> הכי שקט. שורה אחת של ארבע דלתות קטנות, וכל השאר מאחורי "כל האזורים".</li>`,
`    <li><b>מעקב:</b> דלת אחת עם ארבע לשוניות: משקלים, צעדים, אימונים, התקדמות. מה שהיה ארבע דלתות (מעקב משקלים, המספרים שלי, היסטוריה, צעדים) נמצא בפנים.</li>
    <li><b>א׳:</b> שלוש הדלתות של מה שעושים בחדר כושר גדולות; מעקב ואימונים שאהבתי בשתי שורות שקטות מתחת.</li>
    <li><b>ב׳:</b> "להתאמן" כרשימה, ו"לעקוב" ככרטיס אחד שמראה במבט שלושה מספרים: אימונים השבוע, צעדים היום, שיא אחרון.</li>
    <li><b>ג׳:</b> שורה אחת של ארבע דלתות קטנות, כולל מעקב, ואימונים שאהבתי כשורה אחת מתחת.</li>`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('patched');
