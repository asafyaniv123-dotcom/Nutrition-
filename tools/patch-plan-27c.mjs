/* Asaf's planning notes from the phone (27 Oct, round 3):
 * 1. the amber bead with a white ring did not belong - the stretch handle is
 *    now a small raised knob of the ground itself, with a dot of the task's ink
 * 2. "save as recurring" seemed dead: it worked, but its toast sat under the
 *    sheet. The button answers in place now - pressed and "✓ saved" - and a
 *    second tap takes it off the shelf
 * 3. the task sheet shows when it starts and when it ends, with steppers,
 *    even when the task was only dragged (an end it never had reads as half
 *    an hour, as the board draws it)
 * 4. the top of the page: the intro sentence, the planner's own row with its
 *    caption, and the day's title (the strip already says it) are gone; the
 *    planner is a small lit button beside the switch
 * 5. undo is a pill beside "⌂ בית", the same pill
 * 6. the switch slides: its pressed half travels, and the view comes in
 *    from the side it lives on */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

/* 4 - the top */
rep(`  h+='<div class="pl-intro">'+_t('תכנון הוא לא רשימה. זו החלטה מה חשוב, לפני שהזמן מחליט במקומך.')+'</div>';
  h+=psayHTML();

  /* not a fourth board: a small lit control, with its explanation beside it
     rather than inside it */
  h+='<div class="pb-lamp-row">'+
       '<button class="pb-lamp" onclick="planBotOpen()">'+`,
`  h+=psayHTML();

  /* the planner: a small lit button beside the switch (27.10) */
  var _lamp='<button class="pb-lamp plv-lamp" onclick="planBotOpen()" aria-label="'+esc(_t('מתכנן'))+'">'+`);
rep(`         '<span class="pb-lamp-t">'+_t('מתכנן')+'</span>'+
       '</button>'+
       '<span class="pb-lamp-s">'+_t('לספר מה יש בשבוע, ולקבל לוח')+'</span>'+
     '</div>';`, `       '</button>';`);
rep(`  h+='<div class="plv press-t" role="tablist">'+
     '<button role="tab" class="'+(_pv==='day'?'on':'')+'" onclick="planViewSet(\\'day\\')">'+_t('יום')+'</button>'+
     '<button role="tab" class="'+(_pv==='month'?'on':'')+'" onclick="planViewSet(\\'month\\')">'+_t('חודש')+'</button></div>';
  if(o.month)h+='<div id="plan-sec-month">'+planMonthHTML()+'</div>';
  if(o.day)h+=planWeekStripHTML()+'<div id="plan-sec-day">'+planDayHTML()+'</div>';`,
`  h+='<div class="plv-row"><div class="plv'+(_pv==='month'?' m':'')+'" role="tablist">'+
     '<button role="tab" class="'+(_pv==='day'?'on':'')+'" onclick="planViewSet(\\'day\\')">'+_t('יום')+'</button>'+
     '<button role="tab" class="'+(_pv==='month'?'on':'')+'" onclick="planViewSet(\\'month\\')">'+_t('חודש')+'</button></div>'+_lamp+'</div>';
  var _in=_planSlide?' class="plv-in '+_planSlide+'"':'';_planSlide='';
  if(o.month)h+='<div'+_in+'><div id="plan-sec-month">'+planMonthHTML()+'</div></div>';
  if(o.day)h+='<div'+_in+'>'+planWeekStripHTML()+'<div id="plan-sec-day">'+planDayHTML()+'</div></div>';`);
/* 6 - the slide */
rep(`function planViewSet(v){try{localStorage.setItem(PLAN_VIEW_KEY,v==='month'?'month':'day');}catch(e){}renderPlanning();}`,
`var _planSlide='';
function planViewSet(v){
  v=v==='month'?'month':'day';if(v===planView())return;
  try{localStorage.setItem(PLAN_VIEW_KEY,v);}catch(e){}
  /* the pressed half travels first, then the view comes in from its side:
     the month lives at the inline end, the day at the start */
  var sw=document.querySelector('.plv');if(sw){sw.classList.toggle('m',v==='month');[].forEach.call(sw.children,function(b,i){b.classList.toggle('on',(i===1)===(v==='month'));});}
  _planSlide=v==='month'?'from-end':'from-start';
  setTimeout(renderPlanning,170);
}`);
/* 4 - the day without its title */
rep(`  out+='<div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:14px">';
  out+='<div><div style="font-size:17px;font-weight:800;color:var(--ink)">'+WK_DAYS[d.getDay()]+(isToday?' &middot; '+_t('היום')+'':'')+'</div>';
  out+='<div style="font-size:13px;color:var(--nu-muted);margin-top:2px">'+wkShort(d)+'</div></div>';
  out+='</div>';`, `  /* the day's name is the strip's pressed day above (27.10) */`);

/* 3 - start and end in the sheet */
rep(`  h+='<div class="dps-meta"><span style="background:'+c.dot+'"></span>'+(t.hour!==null?dpHH(t.hour):''+_t('ללא שעה')+'')+(t.src!=='day'?' &middot; '+(t.src==='month'?''+_t('מהחודש')+'':''+_t('מהשבוע')+''):'')+'</div>';`,
`  h+='<div class="dps-meta"><span style="background:'+c.dot+'"></span>'+(t.hour!==null?'':''+_t('ללא שעה')+'')+(t.src!=='day'?(t.hour!==null?'':' &middot; ')+(t.src==='month'?''+_t('מהחודש')+'':''+_t('מהשבוע')+''):'')+'</div>';
  if(t.hour!==null){
    var _s0=t.hour*60+(t.min||0),_e0=(t.end&&t.end>_s0)?t.end:_s0+30;
    h+='<div class="dps-times">'+
       '<div><span>'+_t('התחלה')+'</span><div class="dps-step"><button onclick="dpSheetTime(-15,0)">&minus;</button><b>'+dpFmt(_s0)+'</b><button onclick="dpSheetTime(15,0)">+</button></div></div>'+
       '<div><span>'+_t('סיום')+'</span><div class="dps-step"><button onclick="dpSheetTime(0,-15)">&minus;</button><b>'+dpFmt(_e0)+'</b><button onclick="dpSheetTime(0,15)">+</button></div></div></div>';
  }`);
rep(`function dpAssign(id,hour,min){`, `/* the sheet's steppers: move the start (the end moves with it) or the end */
function dpSheetTime(ds,de){
  var t=dpFind(_dpDetail);if(!t||t.hour===null)return;
  var s0=t.hour*60+(t.min||0),e0=(t.end&&t.end>s0)?t.end:s0+30;
  var s1=Math.max(0,Math.min(23*60+45,s0+ds)),e1=e0+ds+de;
  if(e1<=s1)e1=s1+15;if(e1>24*60)e1=24*60;
  var dp=loadDPlan(_dpDate),i,mine=false;
  for(i=0;i<dp.items.length;i++)if(dp.items[i].id===t.id){dp.items[i].h=Math.floor(s1/60);dp.items[i].mn=s1%60;dp.items[i].e=e1;mine=true;}
  if(!mine){dp.hours=dp.hours||{};dp.mins=dp.mins||{};dp.ends=dp.ends||{};
    dp.hours[t.id]=Math.floor(s1/60);if(s1%60)dp.mins[t.id]=s1%60;else delete dp.mins[t.id];dp.ends[t.id]=e1;}
  /* the note being typed survives the redraw */
  var n=document.getElementById('dp-d-note'),nv=n?n.value:null;
  saveDPlan(_dpDate,dp);renderPlanDay();renderDpSheet();
  if(nv!==null){var n2=document.getElementById('dp-d-note');if(n2)n2.value=nv;}
}
function dpAssign(id,hour,min){`);

/* 2 - recurring, answered in place */
rep(`  h+='<button class="dps-lib" onclick="taskLibSave(\\''+esc(t.w).replace(/'/g,"\\\\'")+'\\',\\''+(t.c||'lav')+'\\')">&#9734; '+_t('שמור כמשימה חוזרת')+'</button>';`,
`  var _inLib=loadTaskLib().some(function(x){return x.w===t.w;});
  h+='<button class="dps-lib'+(_inLib?' on':'')+'" onclick="dpSheetLib()">'+(_inLib?'&#10003; '+_t('נשמר כמשימה חוזרת'):'&#9734; '+_t('שמור כמשימה חוזרת'))+'</button>';`);
rep(`function taskLibSave(text,color){`, `function dpSheetLib(){
  var t=dpFind(_dpDetail);if(!t)return;
  var l=loadTaskLib(),i,had=false;
  for(i=0;i<l.length;i++)if(l[i].w===t.w){l.splice(i,1);had=true;break;}
  if(had)saveTaskLib(l);else taskLibAdd(t.w,t.c||'lav');
  var n=document.getElementById('dp-d-note'),nv=n?n.value:null;
  renderDpSheet();dpRail();
  if(nv!==null){var n2=document.getElementById('dp-d-note');if(n2)n2.value=nv;}
}
function taskLibSave(text,color){`);

/* CSS: 1, 2, 3, 4, 5, 6 */
rep(`html body.mod-planning .mo-grip{width:11px;height:11px;border-radius:50%;background:#f0a92e;opacity:1;box-shadow:0 0 0 2.5px rgba(255,255,255,.95),0 1px 3px rgba(90,70,40,.3)}`,
`html body.mod-planning .mo-grip{width:13px;height:13px;border-radius:50%;opacity:1;background:radial-gradient(circle,currentColor 0 2px,transparent 2.5px),#f1eee9;
  box-shadow:-1px -1px 2px rgba(255,255,255,.95),1px 2px 4px rgba(120,104,88,.35)}`);
rep(`html body.mod-planning .mo-grab-e{background:#f0a92e!important;width:11px;height:11px;box-shadow:0 0 0 2.5px rgba(255,255,255,.95),0 1px 3px rgba(90,70,40,.3)}`,
`html body.mod-planning .mo-grab-e{background:radial-gradient(circle,var(--ink,#4a453f) 0 2px,transparent 2.5px),#f1eee9!important;width:13px;height:13px;
  box-shadow:-1px -1px 2px rgba(255,255,255,.95),1px 2px 4px rgba(120,104,88,.35)}`);
rep(`html body.mod-planning .mo-chip-sel{`, `/* the switch slides, the planner beside it (27.10) */
html body.mod-planning .plv-row{display:flex;align-items:center;gap:10px;margin:14px 0}
html body.mod-planning .plv-row .plv{flex:1;margin:0;position:relative}
html body.mod-planning .plv::before{content:"";position:absolute;top:5px;bottom:5px;inset-inline-start:5px;width:calc(50% - 5px);border-radius:999px;
  background:var(--nu-ground);box-shadow:-2px -2px 5px var(--nu-lit),3px 3px 8px var(--nu-shade-soft);transition:transform .32s cubic-bezier(.22,.61,.36,1)}
html body.mod-planning .plv.m::before{transform:translateX(-100%)}
html[dir=ltr] body.mod-planning .plv.m::before{transform:translateX(100%)}
html body.mod-planning .plv button,html body.mod-planning .plv button.on{position:relative;background:none!important;box-shadow:none!important;transition:color .25s}
html body.mod-planning .plv-lamp{flex:none;width:52px;height:52px;padding:0;justify-content:center;border-radius:50%}
html body.mod-planning .plv-lamp svg{margin:0}
.plv-in{animation:plvIn .38s cubic-bezier(.22,.61,.36,1) both}
.plv-in.from-end{--plv-from:-36px}.plv-in.from-start{--plv-from:36px}
html[dir=ltr] .plv-in.from-end{--plv-from:36px}html[dir=ltr] .plv-in.from-start{--plv-from:-36px}
@keyframes plvIn{from{opacity:0;transform:translateX(var(--plv-from,0))}}
@media (prefers-reduced-motion:reduce){.plv-in{animation:none}}
/* undo, the same pill as "בית", beside it */
html body.mod-planning .plan-undo,html body.dpk-on.mod-planning .plan-undo{top:calc(16px + env(safe-area-inset-top));bottom:auto;left:auto;transform:none;
  inset-inline-start:84px;inset-inline-end:auto;border-radius:20px;padding:5px 12px;font-size:11px;font-weight:700;color:var(--nu-muted);background:var(--nu-ground);
  box-shadow:-3px -3px 6px rgba(255,255,255,.95),3px 4px 8px rgba(176,168,156,.28);z-index:130}
/* start and end in the task sheet */
.dps-times{display:flex;gap:10px;margin:10px 0 4px}
.dps-times>div{flex:1;border-radius:18px;padding:10px 8px 8px;text-align:center;box-shadow:inset 2px 3px 6px var(--d2),inset -2px -2px 5px var(--l)}
.dps-times span{display:block;font-size:12.5px;font-weight:800;color:#6d675e;margin-bottom:4px}
.dps-step{display:flex;align-items:center;justify-content:space-between;gap:4px}
.dps-step b{font-size:19px;font-weight:800;color:#4a453f;font-variant-numeric:tabular-nums}
.dps-step button{width:32px;height:32px;border:none;border-radius:50%;font-family:inherit;font-size:18px;font-weight:800;color:#4a453f;cursor:pointer;
  background:var(--g);box-shadow:-2px -2px 5px var(--l),3px 3px 7px var(--d2)}
.dps-lib.on{color:#3d6047;box-shadow:inset 2px 3px 6px var(--d),inset -2px -2px 5px var(--l)}
html body.mod-planning .mo-chip-sel{`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
