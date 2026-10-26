/* Planning is the tricky area (Asaf, 26 Oct): its tour grows from six steps
 * to eight, and four of them show the gesture in a small loop in the card -
 * a task leaving the + and dragged onto a day, a task swiped into the red bin,
 * a task stretched across days the way the month shows it, a task starred and
 * then dragged from the saved list. And one step says how the three boards
 * relate - truthfully: what is put on the month or the week arrives on its
 * day; a task written on the day alone stays on the day. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

rep(`    ['#plan-sec-week .pl-add',_t('ה־+ מחזיק משימות בצד.'),_t('כותבים משימה ב־+, והיא מחכה בשורה. משם גוררים אותה ליום ולשעה.')],
    ['#plan-sec-week',_t('ולמחוק? מחליקים.'),_t('גוררים משימה לפח, או מחליקים אותה הצידה, והיא יורדת מהלוח. החלקה על הלוח עצמו מעבירה שבוע.'),'swipe'],
    ['.pl-door',_t('חודש, שבוע ויום.'),_t('לחיצה על כל אחד פותחת או סוגרת את הלוח שלו.')]];`,
`    ['#plan-sec-week .pl-add',_t('ה־+ מחזיק משימות בצד.'),_t('כותבים משימה ב־+, והיא מחכה בשורה. משם גוררים אותה ליום ולשעה.'),'add'],
    ['#plan-sec-week',_t('ולמחוק? מחליקים.'),_t('גוררים משימה לפח, או מחליקים אותה הצידה, והיא יורדת מהלוח. החלקה על הלוח עצמו מעבירה שבוע.'),'swipe'],
    ['#plan-sec-week',_t('משימה של כמה ימים? מותחים.'),_t('תופסים את הנקודה בקצה של משימה ומושכים אותה על פני כמה ימים. כך היא מופיעה על כולם, וגם בתצוגת החודש.'),'stretch'],
    ['.pl-door',_t('חודש, שבוע ויום.'),_t('מה ששמים בחודש או בשבוע מגיע גם ליום שלו, ושם נותנים לו שעה. לחיצה על כל אחד פותחת או סוגרת את הלוח שלו.'),'flow'],
    [null,_t('ומשימה שחוזרת, שומרים.'),_t('לוחצים על משימה ובוחרים "שמור כמשימה חוזרת". בפעם הבאה גוררים אותה מהרשימה, במקום לכתוב אותה שוב.'),'lib']];`);

rep(`      if(st.demo==='swipe'){dm.hidden=false;dm.innerHTML='<i class="td-chip">'+esc(_t('משימה'))+'</i><span class="td-bin"><svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M10 4.2h4"/><path d="M6.2 7l.9 12.1A1.9 1.9 0 0 0 9 21h6a1.9 1.9 0 0 0 1.9-1.9L17.8 7"/><path d="M10 10.8v6.2"/><path d="M14 10.8v6.2"/></svg></span>';}
      else{dm.hidden=true;dm.innerHTML='';}`,
`      var dh=areaTourDemo(st.demo);dm.hidden=!dh;dm.innerHTML=dh;`);

rep(`function areaTourSeen(a){`, `/* the gesture, shown: a few elements on a loop inside the card */
function areaTourDemo(k){
  var chip='<i class="td-chip">'+esc(_t('משימה'))+'</i>',i,c='';
  if(k==='swipe')return chip+'<span class="td-bin"><svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M10 4.2h4"/><path d="M6.2 7l.9 12.1A1.9 1.9 0 0 0 9 21h6a1.9 1.9 0 0 0 1.9-1.9L17.8 7"/><path d="M10 10.8v6.2"/><path d="M14 10.8v6.2"/></svg></span>';
  if(k==='add')return '<span class="td-plus">+</span><i class="td-chip td-add">'+esc(_t('משימה'))+'</i><span class="td-day"></span>';
  if(k==='stretch'){for(i=0;i<5;i++)c+='<span></span>';return '<div class="td-cells">'+c+'</div><i class="td-chip td-st">'+esc(_t('משימה'))+'<b></b></i>';}
  if(k==='flow')return '<div class="td-flow"><span>'+esc(_t('החודש'))+'</span><span>'+esc(_t('השבוע'))+'</span><span>'+esc(_t('היום'))+'</span></div><i class="td-dot"></i>';
  if(k==='lib')return '<span class="td-row"><em>&#9733;</em>'+esc(_t('משימה'))+'</span><i class="td-chip td-copy">'+esc(_t('משימה'))+'</i><span class="td-day"></span>';
  return '';
}
function areaTourSeen(a){`);

rep(`[dir=rtl] .tour-demo{--td-dir:-1}`, `[dir=rtl] .tour-demo{--td-dir:-1}
/* add: out of the +, across, into the day */
.td-plus{position:absolute;top:12px;inset-inline-start:12px;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-size:22px;font-weight:700;color:#4a453f;
  background:#efe7da;box-shadow:-2px -2px 5px rgba(255,255,255,.9),3px 3px 8px rgba(160,140,120,.3);animation:tdPlus 3.2s ease infinite}
.td-day{position:absolute;top:8px;bottom:8px;inset-inline-end:12px;width:96px;border-radius:12px;border:2px dashed rgba(160,140,120,.45)}
.td-chip.td-add{inset-inline-start:62px;animation:tdAdd 3.2s cubic-bezier(.4,0,.2,1) infinite}
@keyframes tdPlus{0%,4%{transform:none}8%{transform:scale(.88)}14%,100%{transform:none}}
@keyframes tdAdd{0%,8%{transform:scale(0);opacity:0}18%,30%{transform:none;opacity:1}62%,84%{transform:translateX(calc(var(--td-dir,1) * 150px));opacity:1}96%,100%{transform:translateX(calc(var(--td-dir,1) * 150px));opacity:0}}
/* stretch: a task drawn out across days */
.td-cells{position:absolute;inset:8px 10px;display:flex;gap:6px}
.td-cells span{flex:1;border-radius:10px;background:rgba(255,251,243,.6)}
.td-chip.td-st{top:16px;inset-inline-start:14px;width:52px;padding:0 10px;overflow:visible;white-space:nowrap;animation:tdSt 3.4s cubic-bezier(.4,0,.2,1) infinite}
.td-st b{position:absolute;inset-inline-end:-7px;top:50%;margin-top:-8px;width:16px;height:16px;border-radius:50%;background:#f0a92e;box-shadow:0 0 0 3px rgba(255,255,255,.9)}
@keyframes tdSt{0%,18%{width:52px}62%,86%{width:178px}100%{width:52px}}
/* flow: the month and the week arrive on the day */
.td-flow{position:absolute;inset:10px 12px;display:flex;gap:8px}
.td-flow span{flex:1;border-radius:12px;display:grid;place-items:center;font-size:12.5px;font-weight:800;color:#6d675e;background:rgba(255,251,243,.6);animation:tdBox 3.6s ease infinite}
.td-flow span:nth-child(2){animation-delay:.9s}.td-flow span:nth-child(3){animation-delay:1.8s}
@keyframes tdBox{0%,30%,100%{background:rgba(255,251,243,.6)}8%,22%{background:#dfe8f3}}
.td-dot{position:absolute;top:50%;margin-top:-6px;inset-inline-start:40px;width:12px;height:12px;border-radius:50%;background:#6f97c8;animation:tdDot 3.6s ease-in-out infinite}
@keyframes tdDot{0%{transform:none;opacity:0}6%{opacity:1}50%{transform:translateX(calc(var(--td-dir,1) * 105px))}82%{transform:translateX(calc(var(--td-dir,1) * 210px));opacity:1}100%{transform:translateX(calc(var(--td-dir,1) * 210px));opacity:0}}
/* lib: starred, then dragged from the list */
.td-row{position:absolute;top:14px;inset-inline-start:12px;height:36px;padding:0 12px;border-radius:12px;display:flex;align-items:center;gap:6px;font-weight:800;font-size:14px;color:#4a453f;background:rgba(255,251,243,.75)}
.td-row em{font-style:normal;color:#cdbfac;animation:tdStar 3.4s ease infinite}
@keyframes tdStar{0%,10%{color:#cdbfac;transform:none}18%{color:#f0a92e;transform:scale(1.35)}26%,100%{color:#f0a92e;transform:none}}
.td-chip.td-copy{inset-inline-start:12px;opacity:0;animation:tdCopy 3.4s cubic-bezier(.4,0,.2,1) infinite}
@keyframes tdCopy{0%,30%{transform:none;opacity:0}36%{transform:none;opacity:1}70%,86%{transform:translateX(calc(var(--td-dir,1) * 170px));opacity:1}100%{transform:translateX(calc(var(--td-dir,1) * 170px));opacity:0}}
@media (prefers-reduced-motion:reduce){.td-plus,.td-add,.td-st,.td-flow span,.td-dot,.td-row em,.td-copy{animation:none}.td-copy{opacity:1}}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
