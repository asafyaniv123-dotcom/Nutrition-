/* review/workout-screen-2, round four (Asaf, 24 Oct): D, four zones, is the
 * one; every effort level gets its own colour; and two more takes on D.
 *  - The colour is a dot beside the number, green at easy through amber to
 *    red at failure, so the word stays ink and readable.
 *  - H: three zones - "how it felt" moves INTO the sets card beside the
 *    entry, because it describes the set just written.
 *  - I: the rest and the wheel dock at the bottom above the tab bar, always
 *    in reach; the exercise and its sets scroll above them. */
import fs from 'fs';
const F = 'review/workout-screen-2/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };

rep(`.ew .col div b{min-width:16px;text-align:center}`,
`.ew .col div b{min-width:16px;text-align:center}
/* a colour per level: a dot beside the number, the word stays ink */
.ew .col div i{width:12px;height:12px;border-radius:50%;align-self:center;background:var(--c);box-shadow:inset 0 -1px 2px rgba(0,0,0,.18)}
.ew .col div:not(.on) i{opacity:.55}
/* H: the wheel beside the entry */
#vH .ent2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
#vH .ent2 .f{border-radius:14px;padding:6px;text-align:center}
#vH .ent2 .f span{display:block;font-size:12px;font-weight:800;color:var(--mu)}
#vH .ent2 .f b{font-size:24px}
#vH .addw{width:100%;border-radius:14px;padding:13px;font-size:16px;font-weight:800;margin-top:10px}
/* I: the dock */
#vI{padding-bottom:300px}
.dock{position:absolute;left:12px;right:12px;bottom:84px;z-index:3;border-radius:22px;padding:12px;background:var(--g);
  box-shadow:-4px -4px 10px var(--lit),0 -6px 18px rgba(120,100,80,.18);display:none}
#ph.atI .dock{display:block}
.dock .two{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start}
.dock .ew{height:108px}.dock .ew .col{height:108px;padding:36px 0}.dock .ew .win{top:36px}`);

rep(`  for(var i=0;i<EW.length;i++)h+='<div><b>'+(i?i:'–')+'</b>'+EW[i]+'</div>';`,
    `  for(var i=0;i<EW.length;i++)h+='<div>'+(i?'<i style="--c:'+EWC[i]+'"></i>':'')+'<b>'+(i?i:'–')+'</b>'+EW[i]+'</div>';`);
rep(`var EW=['לא דורג',`, `/* green at easy, through amber, to red at failure */
var EWC=['', '#6fb283','#7fba76','#9bbf5a','#b9bf4a','#d6b63e','#e5a03a','#e8853a','#e2683d','#d84c40','#c33a3a'];
var EW=['לא דורג',`);

rep(`<button data-v="F">ו׳ · סטים לרוחב</button><button data-v="G">ז׳ · ציר זמן</button>`,
    `<button data-v="H">ח׳ · ד׳ בשלושה אזורים</button><button data-v="I">ט׳ · ד׳ עם מגירה למטה</button><button data-v="F">ו׳ · סטים לרוחב</button><button data-v="G">ז׳ · ציר זמן</button>`);

const top = (id) => `<div class="hd"><h2>כושר</h2><div class="nich"><div id="${id}"></div></div></div>
    <div class="wk"><b>Full body 1</b><span>⏱ 18 דקות</span><span class="ppl">👥 1 / 2</span></div>
    <div class="chips"><button class="raise press on">לחיצת חזה במוט</button><button class="raise">לחיצת חזה במכונה</button><button class="raise">מתח במכונת סיוע</button><button class="raise">+</button></div>
    <div class="card">
      <div class="ex"><div><div class="ex-n">לחיצת חזה במוט</div><div class="ex-m">יעד 3 × 10 · שיא <b>70 ק״ג</b></div></div><button class="raise how">💡 איך מבצעים</button></div>
      <div class="acts"><button class="raise">⇄ החלף</button><button class="raise">⇄ סופרסט</button><button class="raise">⏱ סטופר</button><button class="raise rm">✕ הסר</button></div>
    </div>`;
const setsRows = (p) => `<div class="row h"><span class="lab" style="text-align:center">סט</span><span class="lab" style="text-align:center">לפני שבועיים</span><span class="lab" style="text-align:center">היום</span></div>
      <div class="row"><span class="i">1</span><span class="was">70 × 7</span><span class="now ok press">65 × 8</span></div>
      <div class="row"><span class="i">2</span><span class="was">70 × 7</span><span class="now ok press">65 × 7</span></div>
      <div class="row"><span class="i">3</span><span class="was">70 × 7</span><span class="now next press" id="${p}Next">הבא</span></div>`;
const restCard = (p, lab) => `<div class="lab" style="margin-bottom:8px">${lab}</div>
      <div class="rest" id="${p}RestSet"><div class="seg press"><button>1:30</button><button class="on">2:00</button><button>2:30</button></div><button class="raise seam rgo" onclick="run('${p}')">התחל</button></div>
      <div class="run raise" id="${p}Run"><i class="bar" id="${p}Bar"></i><b id="${p}T2">2:00</b><span>הסט הבא: 65 × 7</span><button onclick="stop('${p}')">דלג</button></div>`;

rep(`  <!-- F: set cards across, entry and wheel side by side -->`, `  <!-- H: D in three zones - the wheel inside the sets card -->
  <div class="v" id="vH">
    ${top('bH')}
    <div class="card sets">
      ${setsRows('h')}
      <div class="ent2">
        <div style="display:grid;gap:8px"><div class="f press"><span>ק״ג</span><b>65</b></div><div class="f press"><span>חזרות</span><b>7</b></div></div>
        <div><div class="lab" style="text-align:center;margin-bottom:4px">איך הרגיש</div><div class="ew press" data-ew></div></div>
      </div>
      <button class="raise seam addw" onclick="hAdd()">רשום סט 3</button>
    </div>
    <div class="card">
      ${restCard('h', 'מנוחה בין סטים')}
      <div class="note press">✎ הערה על התרגיל</div>
    </div>
  </div>

  <!-- I: D with the rest and the wheel docked above the tab bar -->
  <div class="v" id="vI">
    ${top('bI')}
    <div class="card sets">
      ${setsRows('i')}
      <div class="entry"><div class="f press"><span>ק״ג</span><b>65</b></div><div class="f press"><span>חזרות</span><b>7</b></div><button class="raise seam add" onclick="iAdd()">+</button></div>
    </div>
    <div class="note press" style="margin-top:12px">✎ הערה על התרגיל</div>
  </div>
  <div class="dock">
    <div class="two">
      <div>${restCard('i', 'מנוחה').replace('<div class="seg press">', '<div class="seg press" style="flex-wrap:wrap">')}</div>
      <div><div class="lab" style="margin-bottom:6px">איך הרגיש</div><div class="ew press" data-ew></div></div>
    </div>
  </div>

  <!-- F: set cards across, entry and wheel side by side -->`);

rep(`function fAdd(){`, `function hAdd(){var n=document.getElementById('hNext');n.className='now ok press';n.textContent='65 × 7';run('h');}
function iAdd(){var n=document.getElementById('iNext');n.className='now ok press';n.textContent='65 × 7';run('i');}
function fAdd(){`);
rep(`  [].forEach.call(document.querySelectorAll('.v'),function(x){x.classList.toggle('on',x.id==='v'+v);});`,
    `  [].forEach.call(document.querySelectorAll('.v'),function(x){x.classList.toggle('on',x.id==='v'+v);});
  document.getElementById('ph').classList.toggle('atI',v==='I');
  if(v==='I')[].forEach.call(document.querySelectorAll('.dock [data-ew] .col'),function(c){if(!c.scrollTop){c.scrollTop=8*36;c.dispatchEvent(new Event('scroll'));}});`);
rep(`['bD','bE','bF','bG']`, `['bD','bE','bF','bG','bH','bI']`);
rep(`    <li><b>הגלגלת של דרגת הקושי</b>`, `    <li><b>צבע לכל דרגת קושי:</b> נקודה ליד המספר, מירוק בקל, דרך ענבר, עד אדום בכשל. המילה נשארת כהה וקריאה.</li>
    <li><b>ח׳ · ד׳ בשלושה אזורים:</b> אותו ד׳, אבל "איך הרגיש" עובר לתוך כרטיס הסטים, ליד המשקל והחזרות, כי הוא מתאר את הסט שבדיוק נרשם. כפתור אחד "רשום סט 3", ומתחת המנוחה וההערה.</li>
    <li><b>ט׳ · ד׳ עם מגירה למטה:</b> המנוחה והגלגלת יושבות במגירה קבועה מעל הסרגל, תמיד ביד. התרגיל והסטים נגללים מעליה.</li>
    <li><b>הגלגלת של דרגת הקושי</b>`);
fs.writeFileSync(F, s);
console.log('patched');
