/* Asaf, 27 Oct:
 * 1. the week strip above the day is a wheel: swipe it sideways to the week
 *    before or after (three weeks laid side by side, snapping; it re-centres)
 * 2. the bottom of the day board was a pile - "from above", "only for this
 *    day", twelve colour dots, recurring tasks, an input and a +, plus a +
 *    floating at the edge. In their place: one writing bar that stays at the
 *    bottom of the screen while you scroll the hours. What you write sits in a
 *    row just above it, with whatever the week put on this day without an
 *    hour, and is dragged from there onto an hour. ☆ shows the saved
 *    recurring tasks in that row instead. Colour is chosen in the task's sheet.
 *    The title's arrows go too: the strip moves between days. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

/* 1 - the strip as a wheel of three weeks */
rep(`function planWeekStripHTML(){
  var sun=weekSunday(new Date(_dpDate+'T12:00:00')),i,h='<div class="plws">',today=todayStr();
  h+='<button class="plws-n" onclick="planWeekStep(-1)" aria-label="'+esc(_t('השבוע הקודם'))+'">&#8250;</button><div class="plws-d">';
  for(i=0;i<7;i++){
    var d=wkStamp(wkDateOf(sun,i)),dt=new Date(d+'T12:00:00'),has=false;
    try{has=dpAll(d).length>0;}catch(e){}
    h+='<button class="'+(d===_dpDate?'on':'')+(d===today?' t':'')+'" onclick="planOpenDayHere(\\''+d+'\\')">'+
       '<span>'+esc(dfmt(dt,{weekday:'narrow'}))+'</span><b>'+nfmt(dt.getDate())+'</b><i'+(has?' class="has"':'')+'></i></button>';
  }
  return h+'</div><button class="plws-n" onclick="planWeekStep(1)" aria-label="'+esc(_t('השבוע הבא'))+'">&#8249;</button></div>';
}`,
`function planWeekStripHTML(){
  var sun=weekSunday(new Date(_dpDate+'T12:00:00')),w,i,h='<div class="plws" id="plws">',today=todayStr();
  for(w=-1;w<=1;w++){
    h+='<div class="plws-d" data-w="'+w+'">';
    for(i=0;i<7;i++){
      var d=wkStamp(wkDateOf(sun,w*7+i)),dt=new Date(d+'T12:00:00'),has=false;
      try{has=dpAll(d).length>0;}catch(e){}
      h+='<button class="'+(d===_dpDate?'on':'')+(d===today?' t':'')+'" onclick="planOpenDayHere(\\''+d+'\\')">'+
         '<span>'+esc(dfmt(dt,{weekday:'narrow'}))+'</span><b>'+nfmt(dt.getDate())+'</b><i'+(has?' class="has"':'')+'></i></button>';
    }
    h+='</div>';
  }
  return h+'</div>';
}
/* the strip starts on the middle week; a swipe that settles on a side week
   moves the day by seven and the strip re-centres on the new middle */
function planWeekStripInit(){
  var el=document.getElementById('plws');if(!el)return;
  var mid=el.children[1];el.scrollLeft=mid.offsetLeft-(el.clientWidth-mid.offsetWidth)/2;
  var t=null;
  el.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(function(){
    var c=el.getBoundingClientRect(),cx=c.left+c.width/2,k,best=1,bd=1e9;
    for(k=0;k<3;k++){var r=el.children[k].getBoundingClientRect(),dd=Math.abs(r.left+r.width/2-cx);if(dd<bd){bd=dd;best=k;}}
    if(best!==1)planWeekStep(best-1);
  },140);},{passive:true});
}`);
rep(`  if(o.day){dpRail();dpNowLine();dpNowStart();dpLayout();}`, `  if(o.day){planWeekStripInit();dpRail();dpNowLine();dpNowStart();dpLayout();}`);

/* the strip is not the board: a swipe on it is not a day swipe */
rep(`  if(t.closest&&(t.closest('[data-task]')||t.closest('[data-lib]')||t.closest('[data-stretch]')||`,
  `  if(t.closest&&(t.closest('[data-task]')||t.closest('[data-lib]')||t.closest('#plws')||t.closest('[data-stretch]')||`);

/* 2 - the title without arrows */
rep(`  out+='<div style="font-size:11px;color:var(--muted);margin-top:2px">'+wkShort(d)+' &middot; <span style="font-size:9.5px;color:var(--muted-soft)">'+_t('החלק להחלפת יום')+'</span></div></div>';
  out+='<div style="display:flex;gap:6px">';
  out+='<button onclick="dpShift(-1)" style="background:var(--card);border:none;border-radius:10px;width:28px;height:28px;font-size:14px;color:var(--muted);cursor:pointer;box-shadow:0 2px 7px rgba(200,180,160,.16);font-family:inherit">&#8249;</button>';
  out+='<button onclick="dpShift(1)" style="background:var(--card);border:none;border-radius:10px;width:28px;height:28px;font-size:14px;color:var(--muted);cursor:pointer;box-shadow:0 2px 7px rgba(200,180,160,.16);font-family:inherit">&#8250;</button>';
  out+='</div></div>';`,
`  out+='<div style="font-size:13px;color:var(--nu-muted);margin-top:2px">'+wkShort(d)+'</div></div>';
  out+='</div>';`);

/* 2 - the pile at the bottom of the day goes; the dock replaces it */
const a = s.indexOf(`  // what the week put here, still without an hour\n  var fromWeek=[],mine=[];`);
const b = s.indexOf(`  /* The deeper questions, open in place under the hours rather than behind a`);
if (a < 0 || b < 0 || b < a) { console.log('pile anchors'); process.exit(1); }
s = s.slice(0, a) + `  /* what has no hour waits in the writing bar at the foot of the screen
     (dpRail) - not in a pile down here */
` + s.slice(b);

/* the dock */
const r0 = s.indexOf('function dpRail(){');
const r1 = s.indexOf('_dpRailWasOpen=_dpRailOpen;\n}', r0);
if (r0 < 0 || r1 < 0) { console.log('rail anchors'); process.exit(1); }
s = s.slice(0, r0) + `/* THE WRITING BAR (27.10): at the foot of the screen while the day is open,
   staying there as the hours scroll. Above it, the day's tasks with no hour
   - written here, or put on this day by the week - to drag onto an hour; or,
   with ☆, the saved recurring ones. Kept the rail's ids so the drag that
   already knows the rail knows this. */
var _dpLibShow=false;
function dpRail(){
  dpRailClear();
  if(typeof planView==='function'?planView()!=='day':!planSecsGet().day)return;
  var loose=[],all=dpAll(_dpDate),i,lib=loadTaskLib();
  for(i=0;i<all.length;i++)if(all[i].hour===null)loose.push(all[i]);
  var h='<div id="dp-rail" class="dpk">';
  var row=_dpLibShow?lib:loose;
  if(row.length){
    h+='<div class="dpk-row">';
    for(i=0;i<row.length;i++){var c=wkColor(row[i].c);
      h+='<div class="dpk-chip" '+(_dpLibShow?'data-lib':'data-task')+'="'+row[i].id+'" style="background:'+c.soft+';color:'+c.ink+'">'+esc(row[i].w)+'</div>';}
    h+='</div>';
  }else if(_dpLibShow)h+='<div class="dpk-hint">'+_t('שמור כאן משימה שחוזרת אצלך, וגרור אותה מכאן במקום לכתוב אותה שוב.')+'</div>';
  h+='<div class="dpk-bar">'+
     '<button class="dpk-lib'+(_dpLibShow?' on':'')+'" onclick="_dpLibShow=!_dpLibShow;dpRail()" aria-label="'+esc(_t('משימות חוזרות'))+'">&#9734;</button>'+
     '<input id="dp-rail-in" placeholder="'+esc(_t('מה להכניס ליום הזה?'))+'" value="'+esc(_dpRailText)+'" oninput="_dpRailText=this.value" onkeydown="if(event.key===\\'Enter\\')dpRailAdd()">'+
     '<button class="dpk-add" onclick="dpRailAdd()">+</button></div>';
  h+='</div>';
  document.body.insertAdjacentHTML('beforeend',h);
  document.body.classList.add('dpk-on');
  var rail=document.getElementById('dp-rail');
  rail.removeEventListener('pointerdown',dpDown);
  rail.addEventListener('pointerdown',dpDown);
}
` + s.slice(r1 + '_dpRailWasOpen=_dpRailOpen;\n}'.length);
rep(`function dpRailClear(){
  var r=document.getElementById('dp-rail');if(r)r.remove();`, `function dpRailClear(){
  document.body.classList.remove('dpk-on');
  var r=document.getElementById('dp-rail');if(r)r.remove();`);

rep(`html body.mod-planning .mo-chip-sel{`, `/* the week strip as a wheel, and the writing bar (27.10) */
.plws{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;margin:0 0 12px;-webkit-overflow-scrolling:touch}
.plws::-webkit-scrollbar{display:none}
.plws .plws-d{flex:0 0 100%;scroll-snap-align:center}
.dpk{position:fixed;left:12px;right:12px;bottom:calc(108px + env(safe-area-inset-bottom));z-index:120;max-width:480px;margin:0 auto}
body.sheet-open .dpk{display:none}
.dpk-row{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:4px 4px 10px}
.dpk-row::-webkit-scrollbar{display:none}
.dpk-chip{flex:none;padding:9px 14px;border-radius:12px;font-size:14px;font-weight:800;cursor:grab;touch-action:none;white-space:nowrap;
  box-shadow:-2px -2px 5px rgba(255,255,255,.9),3px 5px 12px rgba(120,104,88,.22)}
.dpk-hint{font-size:13px;color:#6d675e;padding:4px 8px 10px;line-height:1.5}
.dpk-bar{display:flex;align-items:center;gap:8px;padding:6px;border-radius:22px;background:#e9e7e3;
  box-shadow:-4px -4px 10px rgba(255,255,255,.95),6px 8px 20px rgba(120,104,88,.22)}
.dpk-bar input{flex:1;min-width:0;height:44px;border:none;border-radius:16px;padding:0 14px;font-family:inherit;font-size:15px;color:#4a453f;background:#e9e7e3;outline:none;
  box-shadow:inset 2px 3px 6px rgba(168,160,148,.45),inset -2px -2px 5px rgba(255,255,255,.95)}
.dpk-bar input::placeholder{color:#6d675e}
.dpk-add,.dpk-lib{flex:none;width:44px;height:44px;border:none;border-radius:16px;font-family:inherit;font-size:22px;font-weight:800;color:#4a453f;cursor:pointer;
  background:#e9e7e3;box-shadow:-3px -3px 7px rgba(255,255,255,.95),4px 5px 10px rgba(168,160,148,.3)}
.dpk-lib{font-size:19px;color:#b0782e}
.dpk-lib.on{box-shadow:inset 2px 3px 6px rgba(168,160,148,.45),inset -2px -2px 5px rgba(255,255,255,.95)}
body.dpk-on #content{padding-bottom:150px}
html body.mod-planning .mo-chip-sel{`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
