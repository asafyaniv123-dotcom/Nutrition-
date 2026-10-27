/* Planning, calmer (Asaf, 27 Oct, from review/plan-calm): one switch, יום |
 * חודש, instead of three doors stacked one under another. "יום" is the day
 * board exactly as it is, with that day's week as a strip of seven days above
 * it (a dot where a day holds something; a tap opens that day). "חודש" is the
 * month as it is. The doors and the separate week board are not drawn; the
 * shortcuts that used to open a door now choose the view. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

rep(`  h+=planSecHeadHTML('month',''+_t('החודש')+'',''+_t('מה החודש צריך להחזיק, ומתי')+'',o.month);
  if(o.month)h+='<div id="plan-sec-month">'+planMonthHTML()+'</div>';

  h+=planSecHeadHTML('week',''+_t('השבוע')+'',''+_t('לראות אותו כולו לפני שהוא מתחיל')+'',o.week);
  if(o.week)h+='<div id="plan-sec-week">'+planWeekHTML()+'</div>';

  h+=planSecHeadHTML('day',''+_t('היום')+'',fmtDate(_dpDate),o.day);
  if(o.day)h+='<div id="plan-sec-day">'+planDayHTML()+'</div>';`,
`  /* ONE SWITCH, TWO VIEWS (27.10): the day, with its week above it, or the
     month. What the doors used to open is now the view. */
  var _pv=planView();
  o={month:_pv==='month',week:false,day:_pv==='day'};
  h+='<div class="plv press-t" role="tablist">'+
     '<button role="tab" class="'+(_pv==='day'?'on':'')+'" onclick="planViewSet(\\'day\\')">'+_t('יום')+'</button>'+
     '<button role="tab" class="'+(_pv==='month'?'on':'')+'" onclick="planViewSet(\\'month\\')">'+_t('חודש')+'</button></div>';
  if(o.month)h+='<div id="plan-sec-month">'+planMonthHTML()+'</div>';
  if(o.day)h+=planWeekStripHTML()+'<div id="plan-sec-day">'+planDayHTML()+'</div>';`);

rep(`function planSecToggle(k){`, `var PLAN_VIEW_KEY='plan_view';
function planView(){var v='';try{v=localStorage.getItem(PLAN_VIEW_KEY)||'';}catch(e){}return v==='month'?'month':'day';}
function planViewSet(v){try{localStorage.setItem(PLAN_VIEW_KEY,v==='month'?'month':'day');}catch(e){}renderPlanning();}
/* the day's week, seven days in a row: the chosen one pressed, today with
   its amber dot, a quiet dot under any day that holds something */
function planWeekStripHTML(){
  var sun=weekSunday(new Date(_dpDate+'T12:00:00')),i,h='<div class="plws">',today=todayStr();
  h+='<button class="plws-n" onclick="planWeekStep(-1)" aria-label="'+esc(_t('השבוע הקודם'))+'">&#8250;</button><div class="plws-d">';
  for(i=0;i<7;i++){
    var d=wkStamp(wkDateOf(sun,i)),dt=new Date(d+'T12:00:00'),has=false;
    try{has=dpAll(d).length>0;}catch(e){}
    h+='<button class="'+(d===_dpDate?'on':'')+(d===today?' t':'')+'" onclick="planOpenDayHere(\\''+d+'\\')">'+
       '<span>'+esc(dfmt(dt,{weekday:'narrow'}))+'</span><b>'+nfmt(dt.getDate())+'</b><i'+(has?' class="has"':'')+'></i></button>';
  }
  return h+'</div><button class="plws-n" onclick="planWeekStep(1)" aria-label="'+esc(_t('השבוע הבא'))+'">&#8249;</button></div>';
}
function planOpenDayHere(d){_dpDate=d;_dpRailOpen=false;renderPlanning();}
function planWeekStep(n){_dpDate=wkStamp(wkDateOf(new Date(_dpDate+'T12:00:00'),n*7));renderPlanning();}
function planSecToggle(k){`);
/* the shortcuts choose the view */
rep(`  var o=planSecsGet();
  o[mode==='weekly'?'week':mode==='monthly'?'month':'day']=true;
  planSecsSave();
  _planStep=0;`, `  var o=planSecsGet();
  o[mode==='weekly'?'week':mode==='monthly'?'month':'day']=true;
  planSecsSave();
  try{localStorage.setItem(PLAN_VIEW_KEY,mode==='monthly'?'month':'day');}catch(e){}
  _planStep=0;`);
rep(`  _dpDate=date;_dpRailOpen=false;
  planSecsGet().day=true;planSecsSave();`, `  _dpDate=date;_dpRailOpen=false;
  planSecsGet().day=true;planSecsSave();
  try{localStorage.setItem(PLAN_VIEW_KEY,'day');}catch(e){}`);

rep(`html body.mod-planning .mo-chip-sel{`, `/* the switch and the week strip (27.10) */
html body.mod-planning .plv{display:flex;padding:5px;margin:14px 0 14px;border-radius:999px;background:var(--nu-ground);
  box-shadow:inset 3px 4px 8px var(--nu-shade),inset -3px -3px 7px var(--nu-lit)}
html body.mod-planning .plv button{flex:1;border:none;border-radius:999px;padding:11px 0;font-family:inherit;font-size:15px;font-weight:800;color:var(--nu-muted);background:none;cursor:pointer}
html body.mod-planning .plv button.on{color:var(--nu-ink);background:var(--nu-ground);box-shadow:-2px -2px 5px var(--nu-lit),3px 3px 8px var(--nu-shade-soft)}
.plws{display:flex;align-items:center;gap:4px;margin:0 0 12px}
.plws-d{flex:1;display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.plws-d button{border:none;border-radius:14px;padding:7px 0 6px;font-family:inherit;background:none;cursor:pointer;color:var(--nu-muted,#6d675e);text-align:center}
.plws-d span{display:block;font-size:11.5px;font-weight:800}
.plws-d b{display:block;font-size:16px;font-weight:800;color:var(--nu-ink,#4a453f);line-height:1.3}
.plws-d i{display:block;width:5px;height:5px;border-radius:50%;margin:3px auto 0;background:transparent}
.plws-d i.has{background:#b0a08c}
.plws-d button.t i{background:#f0a92e}
.plws-d button.on{background:var(--nu-ground,#e9e7e3);box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.plws-n{flex:none;width:30px;height:44px;border:none;background:none;font-size:22px;font-weight:800;color:var(--nu-muted,#6d675e);cursor:pointer;font-family:inherit}
html body.mod-planning .mo-chip-sel{`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
