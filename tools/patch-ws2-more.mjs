/* review/workout-screen-2, round three (Asaf, 24 Oct): "I liked the effort
 * wheel we built - keep it. Make two more designs." The app's own wheel
 * (EFFORT_WORD: not rated, 1 really easy ... 10 failure, a scroll-snap
 * column with the centre row lit) replaces the 1-10 row in D and E, and two
 * new directions are added with it: F - the sets as cards across, entry and
 * wheel side by side; G - the sets as a timeline, the rest between them. */
import fs from 'fs';
const F = 'review/workout-screen-2/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };

/* the wheel's look */
rep(`.notes{max-width:430px;`, `/* THE EFFORT WHEEL - the app's own: three rows showing, the centre lit */
.ew{position:relative;height:126px;border-radius:16px;overflow:hidden}
.ew .win{position:absolute;left:8px;right:8px;top:45px;height:36px;border-radius:11px;pointer-events:none;
  box-shadow:-2px -2px 5px var(--lit),2px 3px 7px var(--sh2)}
.ew .col{position:relative;height:126px;overflow-y:scroll;scroll-snap-type:y mandatory;padding:45px 0;scrollbar-width:none;
  -webkit-mask-image:linear-gradient(transparent,#000 30%,#000 70%,transparent);mask-image:linear-gradient(transparent,#000 30%,#000 70%,transparent)}
.ew .col::-webkit-scrollbar{display:none}
.ew .col div{height:36px;line-height:36px;scroll-snap-align:center;display:flex;justify-content:center;gap:10px;font-size:15px;font-weight:700;color:#a1978b}
.ew .col div b{min-width:16px;text-align:center}
.ew .col div.on{color:var(--ink);font-weight:800}
/* F - set cards across */
#vF .sc{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
#vF .sc div{border-radius:16px;padding:9px 4px;text-align:center}
#vF .sc .n{font-size:11.5px;font-weight:800;color:var(--mu)}
#vF .sc .w{font-size:13px;color:var(--mu);font-weight:700;margin-top:3px}
#vF .sc .t{font-size:16px;font-weight:800;margin-top:2px}
#vF .sc .t.ok::before{content:"✓ ";color:var(--t7)}
#vF .sc .cur{outline:2px solid color-mix(in srgb,var(--t5) 65%,transparent);outline-offset:-2px}
#vF .duo{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
#vF .stp{border-radius:16px;padding:8px;text-align:center}
#vF .stp span{display:block;font-size:12px;font-weight:800;color:var(--mu)}
#vF .stp b{font-size:26px;font-variant-numeric:tabular-nums}
#vF .stp .pm{display:flex;justify-content:center;gap:10px;margin-top:4px}
#vF .stp .pm button{width:34px;height:34px;border-radius:50%;font-size:18px;font-weight:700}
#vF .logb{width:100%;border-radius:16px;padding:14px;font-size:16px;font-weight:800;margin-top:12px}
/* G - a timeline */
#vG .tl{position:relative;margin-top:12px;padding-inline-start:26px}
#vG .tl::before{content:"";position:absolute;inset-inline-start:9px;top:8px;bottom:8px;width:3px;border-radius:2px;background:rgba(176,168,156,.4)}
#vG .st{position:relative;margin-bottom:10px}
#vG .st::before{content:"";position:absolute;inset-inline-start:-23px;top:13px;width:13px;height:13px;border-radius:50%;background:var(--g);box-shadow:inset 1px 2px 3px var(--sh),inset -1px -1px 2px var(--lit)}
#vG .st.ok::before{background:var(--t5);box-shadow:none}
#vG .line{display:flex;align-items:center;justify-content:space-between;border-radius:14px;padding:10px 12px}
#vG .line b{font-size:15.5px}#vG .line span{font-size:13px;color:var(--mu);font-weight:700}
#vG .gap{font-size:12.5px;color:var(--mu);font-weight:700;margin:-4px 0 10px;display:flex;gap:6px;align-items:center}
#vG .open{border-radius:20px;padding:12px}
#vG .open .hd2{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
#vG .open .row3{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#vG .open .f{border-radius:14px;padding:6px;text-align:center}
#vG .open .f span{display:block;font-size:12px;font-weight:800;color:var(--mu)}
#vG .open .f b{font-size:24px}
.notes{max-width:430px;`);

/* D and E: the wheel instead of the 1-10 row */
rep(`      <div class="lab">איך הרגיש הסט האחרון (RPE)</div>
      <div class="rpe" id="dRpe"></div>
      <div class="rpe-l"><span>קל מאוד</span><span>מקסימום</span></div>`,
`      <div class="lab" style="margin-bottom:8px">איך הרגיש הסט האחרון (RPE)</div>
      <div class="ew press" data-ew></div>`);
rep(`        <div class="phead"><span class="lab">RPE</span><span class="lab" style="font-weight:700">1 קל מאוד · 10 מקסימום</span></div>
        <div class="rpe" id="eRpe"></div>`,
`        <div class="phead"><span class="lab">איך הרגיש (RPE)</span></div>
        <div class="ew press" data-ew></div>`);
rep(`['dRpe','eRpe'].forEach(function(id){`, `[].forEach(function(id){`);

/* the two new directions */
rep(`<button data-v="E">ה׳ · כרטיס אחד</button></div>`,
    `<button data-v="E">ה׳ · כרטיס אחד</button><button data-v="F">ו׳ · סטים לרוחב</button><button data-v="G">ז׳ · ציר זמן</button></div>`);
const head = (id) => `<div class="hd"><h2>כושר</h2><div class="nich"><div id="${id}"></div></div></div>
    <div class="wk"><b>Full body 1</b><span>⏱ 18 דקות</span><span class="ppl">👥 1 / 2</span></div>
    <div class="chips"><button class="raise press on">לחיצת חזה במוט</button><button class="raise">לחיצת חזה במכונה</button><button class="raise">מתח במכונת סיוע</button><button class="raise">+</button></div>
    <div class="card">
      <div class="ex"><div><div class="ex-n">לחיצת חזה במוט</div><div class="ex-m">יעד 3 × 10 · שיא <b>70 ק״ג</b></div></div><button class="raise how">💡 איך מבצעים</button></div>
      <div class="acts"><button class="raise">⇄ החלף</button><button class="raise">⇄ סופרסט</button><button class="raise">⏱ סטופר</button><button class="raise rm">✕ הסר</button></div>
    </div>`;
rep(`  <div class="tabs">`, `  <!-- F: set cards across, entry and wheel side by side -->
  <div class="v" id="vF">
    ${head('bF')}
    <div class="card">
      <div class="sc">
        <div class="press"><div class="n">סט 1</div><div class="w">70×7</div><div class="t ok">65×8</div></div>
        <div class="press"><div class="n">סט 2</div><div class="w">70×7</div><div class="t ok">65×7</div></div>
        <div class="press cur" id="fCur"><div class="n">סט 3</div><div class="w">70×7</div><div class="t" id="fT">עכשיו</div></div>
      </div>
      <div class="duo">
        <div><div class="row3" style="display:grid;gap:8px">
          <div class="stp press"><span>ק״ג</span><b>65</b><div class="pm"><button class="raise">−</button><button class="raise">+</button></div></div>
          <div class="stp press"><span>חזרות</span><b>7</b><div class="pm"><button class="raise">−</button><button class="raise">+</button></div></div>
        </div></div>
        <div><div class="lab" style="margin-bottom:6px;text-align:center">איך הרגיש</div><div class="ew press" data-ew></div></div>
      </div>
      <button class="raise seam logb" onclick="fAdd()">רשום סט 3</button>
    </div>
    <div class="card">
      <div class="rest" id="fRestSet"><span class="lab" style="flex:none">מנוחה</span><div class="seg press"><button>1:30</button><button class="on">2:00</button><button>2:30</button></div><button class="raise seam rgo" onclick="run('f')">התחל</button></div>
      <div class="run raise" id="fRun"><i class="bar" id="fBar"></i><b id="fT2">2:00</b><span>הסט הבא: 65 × 7</span><button onclick="stop('f')">דלג</button></div>
      <div class="note press">✎ הערה על התרגיל</div>
    </div>
  </div>

  <!-- G: a timeline, rest between the sets -->
  <div class="v" id="vG">
    ${head('bG')}
    <div class="tl">
      <div class="st ok"><div class="line raise"><b>סט 1 · 65 × 8</b><span>לפני שבועיים 70 × 7 · RPE 7</span></div></div>
      <div class="gap">⏱ מנוחה 2:04</div>
      <div class="st ok"><div class="line raise"><b>סט 2 · 65 × 7</b><span>לפני שבועיים 70 × 7 · RPE 8</span></div></div>
      <div class="gap" id="gGap"><div class="rest" style="flex:1" id="gRestSet"><div class="seg press"><button>1:30</button><button class="on">2:00</button><button>2:30</button></div><button class="raise seam rgo" onclick="run('g')">התחל מנוחה</button></div>
        <div class="run raise" id="gRun" style="flex:1"><i class="bar" id="gBar"></i><b id="gT2">2:00</b><span>מנוחה</span><button onclick="stop('g')">דלג</button></div></div>
      <div class="st" id="gSt"><div class="open press">
        <div class="hd2"><b>סט 3</b><span class="lab">לפני שבועיים 70 × 7</span></div>
        <div class="row3"><div class="f raise"><span>ק״ג</span><b>65</b></div><div class="f raise"><span>חזרות</span><b>7</b></div></div>
        <div class="lab" style="margin:10px 0 6px">איך הרגיש</div><div class="ew press" data-ew></div>
        <button class="raise seam logb" style="width:100%;border-radius:16px;padding:13px;font-size:16px;font-weight:800;margin-top:10px">רשום סט 3</button>
      </div></div>
    </div>
    <div class="note press">✎ הערה על התרגיל</div>
  </div>

  <div class="tabs">`);

/* the wheel's behaviour, and the timers of F and G */
rep(`function dRest(){run('d');}`, `var EW=['לא דורג','ממש קל','קל מאוד','קל','נוח','בינוני','מאתגר','קשה','קשה מאוד','על הגבול','כשל'];
[].forEach.call(document.querySelectorAll('[data-ew]'),function(w){
  var h='<div class="win"></div><div class="col">';
  for(var i=0;i<EW.length;i++)h+='<div><b>'+(i?i:'–')+'</b>'+EW[i]+'</div>';
  w.innerHTML=h+'</div>';var c=w.querySelector('.col');
  function mark(){var k=Math.round(c.scrollTop/36);[].forEach.call(c.children,function(r,j){r.classList.toggle('on',j===k);});}
  c.addEventListener('scroll',mark);setTimeout(function(){c.scrollTop=8*36;mark();},50);});
function fAdd(){document.getElementById('fT').textContent='65×7';document.getElementById('fT').className='t ok';run('f');}
function dRest(){run('d');}`);
/* run()/stop() read <p>T for the clock; F and G name theirs <p>T2 */
rep(`document.getElementById(p+'T').textContent=mmss(left);if(left<=0)stop(p);},1000);}`,
    `(document.getElementById(p+'T2')||document.getElementById(p+'T')).textContent=mmss(left);if(left<=0)stop(p);},1000);}`);
rep(`document.getElementById(p+'RestSet').style.display='flex';document.getElementById(p+'T').textContent='2:00';}`,
    `document.getElementById(p+'RestSet').style.display='flex';(document.getElementById(p+'T2')||document.getElementById(p+'T')).textContent='2:00';}`);
rep(`sc.onload=function(){BeemKit.ready.then(function(){['bD','bE']`, `sc.onload=function(){BeemKit.ready.then(function(){['bD','bE','bF','bG']`);
rep(`    <li><b>ד׳:</b>`, `    <li><b>הגלגלת של דרגת הקושי</b> נשמרה בכל הכיוונים, כמו באפליקציה: שלוש שורות נראות, והאמצעית מודגשת.</li>
    <li><b>ו׳ · סטים לרוחב:</b> כל סט הוא כרטיס קטן, עם הפעם הקודמת מעל והיום מתחת. הסט הנוכחי מסומן. ק״ג וחזרות מצד אחד והגלגלת מהצד השני, ומתחתם כפתור אחד "רשום סט 3".</li>
    <li><b>ז׳ · ציר זמן:</b> הסטים כקו אחד מלמעלה למטה, והמנוחה ביניהם. הסט הנוכחי פתוח, עם המשקל, החזרות והגלגלת. רואים את כל הסיפור של התרגיל.</li>
    <li><b>ד׳:</b>`);
fs.writeFileSync(F, s);
console.log('patched');
