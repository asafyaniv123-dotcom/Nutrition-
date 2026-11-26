/* Usage, items 3-9 Asaf agreed on 26 Nov: how far into סיום יום, for how
 * long, at what hour, from the reminder or not, how many answers (never the
 * answers), a look back at an earlier day, the door's last step, the tours
 * finished or skipped. All of it rides the one daily record, in `x`.
 * And the record now goes out when the app leaves the screen: it used to wait
 * fifteen minutes, so a first session that ended sooner never reached us.
 * Pairs are [anchor, replacement], each applied exactly once.
 *   node tools/patches/usage-depth.mjs [file]            apply
 *   node tools/patches/usage-depth.mjs [file] --reverse  undo */
import fs from 'fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  /* 1. the record: a merge, a minute's wait for a mark, and a flush on leaving */
  [
    `/* ── USAGE, ANONYMOUS ── one small record per app day: opens, which areas
   were entered, and whether the evening was summarised. */
var USAGE_KEY='usage_day',USAGE_FIRST='usage_first';
function usageNote(what,area){
  if(!SYNC_SERVER)return;
  var day=todayStr(),u=null;
  try{u=JSON.parse(localStorage.getItem(USAGE_KEY)||'null');}catch(e){}
  if(!u||u.day!==day)u={day:day,o:0,a:{},s:false,sent:0};
  var urgent=false;
  if(what==='open')u.o++;
  if(what==='area'&&area&&!u.a[area]){u.a[area]=1;}
  if(what==='sum'&&!u.s){u.s=true;urgent=true;}
  var first='';try{first=localStorage.getItem(USAGE_FIRST)||'';if(!first){first=day;localStorage.setItem(USAGE_FIRST,day);}}catch(e){}
  var now=Date.now(),due=urgent||!u.sent||now-u.sent>15*60000;
  if(due)u.sent=now;
  try{localStorage.setItem(USAGE_KEY,JSON.stringify(u));}catch(e){}
  if(!due)return;
  try{
    fetch(SYNC_SERVER+'/ping',{method:'POST',headers:{'Content-Type':'application/json'},keepalive:true,
      body:JSON.stringify({uid:installId(),dev:!!window.__DEV__,day:day,first:first,lang:appLang(),
        o:u.o,s:u.s,a:Object.keys(u.a),p:appPlatform()})}).catch(function(){});
  }catch(e){}
}
document.addEventListener('visibilitychange',function(){if(!document.hidden)try{usageNote('open');}catch(e){}});`,
    `/* ── USAGE, ANONYMOUS ── one small record per app day: opens, which areas
   were entered, and whether the evening was summarised - and in x, numbers
   about how: rs how far into סיום יום (its step; 50 the bridge, 99 closed),
   ra seconds spent in it, rh the hour it was closed, rr opened from the
   evening reminder, rq how many questions were answered (never the answers),
   rp/rg a photo or a song, lb a look back at an earlier day or the week,
   dr the door's last step, td/tx the tours finished or skipped.
   A mark waits at most a minute, and everything still unsent goes the moment
   the app leaves the screen: a first session that ended inside the old
   fifteen-minute wait used to reach nobody. */
var USAGE_KEY='usage_day',USAGE_FIRST='usage_first',_usageLater=0;
/* numbers only grow, lists only gain, a word is the latest; ra+ adds seconds */
function usageMerge(u,m){
  var x=u.x||(u.x={}),k,v;
  for(k in m){v=m[k];
    if(k==='ra+'){x.ra=(x.ra||0)+v;continue;}
    if(Array.isArray(v)){var a=x[k]||[];v.forEach(function(e){if(a.indexOf(e)<0)a.push(e);});x[k]=a;}
    else if(typeof v==='number'&&k!=='rh')x[k]=Math.max(x[k]||0,v);
    else x[k]=v;}
}
function usageNote(what,area){
  if(!SYNC_SERVER)return;
  var day=todayStr(),u=null;
  try{u=JSON.parse(localStorage.getItem(USAGE_KEY)||'null');}catch(e){}
  if(!u||u.day!==day)u={day:day,o:0,a:{},s:false,sent:0};
  var urgent=false;
  if(what==='open'){u.o++;u.dirty=1;}
  if(what==='area'&&area&&!u.a[area]){u.a[area]=1;u.dirty=1;}
  if(what==='sum'&&!u.s){u.s=true;urgent=true;}
  if(what==='mark'&&area){usageMerge(u,area);u.dirty=1;}
  if(what==='flush'&&u.dirty)urgent=true;
  var first='';try{first=localStorage.getItem(USAGE_FIRST)||'';if(!first){first=day;localStorage.setItem(USAGE_FIRST,day);}}catch(e){}
  var now=Date.now(),due=urgent||!u.sent||now-u.sent>(what==='mark'?60000:15*60000);
  if(due){u.sent=now;u.dirty=0;}
  else if(what==='mark'&&!_usageLater)_usageLater=setTimeout(function(){_usageLater=0;try{usageNote('flush');}catch(e){}},61000);
  try{localStorage.setItem(USAGE_KEY,JSON.stringify(u));}catch(e){}
  if(!due)return;
  try{
    fetch(SYNC_SERVER+'/ping',{method:'POST',headers:{'Content-Type':'application/json'},keepalive:true,
      body:JSON.stringify({uid:installId(),dev:!!window.__DEV__,day:day,first:first,lang:appLang(),
        o:u.o,s:u.s,a:Object.keys(u.a),p:appPlatform(),x:u.x||{}})}).catch(function(){});
  }catch(e){}
}
function usageMark(m){try{usageNote('mark',m);}catch(e){}}
/* time in סיום יום: the gaps between its screens, each counted only when
   under two minutes, so a phone left on the table adds nothing */
var _usRfTick=0;
function usageRf(m){
  if(!rfIsToday())return;
  var now=Date.now(),o={},k;for(k in m)o[k]=m[k];
  if(_usRfTick&&now-_usRfTick<120000)o['ra+']=Math.round((now-_usRfTick)/1000);
  _usRfTick=now;usageMark(o);
}
/* at the close: how many of the evening's questions have an answer - a count */
function usageDepth(r){
  var seen={},n=0;
  (RF_STAGE1||[]).concat(RF_STAGE2||[]).forEach(function(q){if(q&&!seen[q.id]){seen[q.id]=1;if(rfAnsweredIn(r,q))n++;}});
  return {rs:99,rq:n,rp:r&&r.photo?1:0,rg:r&&r.song?1:0,rh:new Date().getHours()};
}
document.addEventListener('visibilitychange',function(){try{usageNote(document.hidden?'flush':'open');}catch(e){}});`,
  ],
  /* 3. how far: every step of the evening's own questions */
  [
    `function renderReflectStep(){
  var q=rfSteps()[_rfStep];
  if(!q){rfStageEnd();return;}`,
    `function renderReflectStep(){
  var q=rfSteps()[_rfStep];
  if(!q){rfStageEnd();return;}
  usageRf(_rfStage===1?{rs:_rfStep+1}:{});`,
  ],
  [
    `function renderReflectBoard(){
  var bank=rfBank(),i,done=0;`,
    `function renderReflectBoard(){
  var bank=rfBank(),i,done=0;
  usageRf({});`,
  ],
  [
    `function renderReflectBridge(){
  rfSave({stage1Done:true});`,
    `function renderReflectBridge(){
  rfSave({stage1Done:true});
  usageRf({rs:50});`,
  ],
  /* 4, 6, 7. closed: the hour, and how much was answered */
  [
    `  var r=rfSave({done:true});
  try{if(_rfDate===todayStr())usageNote('sum');}catch(e){}`,
    `  var r=rfSave({done:true});
  try{if(_rfDate===todayStr())usageRf(usageDepth(r));}catch(e){}
  try{if(_rfDate===todayStr())usageNote('sum');}catch(e){}`,
  ],
  /* 5. opened from the evening reminder (the shell's own notification) */
  [
    `  if(k==='eve'||k==='streak'){sumRemGo();return;}`,
    `  if(k==='eve'||k==='streak'){usageMark({rr:1});sumRemGo();return;}`,
  ],
  /* 8. a look back */
  [
    `function rfOpenDay(d){
  if(!d||d>todayStr())return;`,
    `function rfOpenDay(d){
  if(!d||d>todayStr())return;
  if(d<todayStr())usageMark({lb:1});`,
  ],
  [
    `function wkDeckOpen(from){
`,
    `function wkDeckOpen(from){
  usageMark({lb:1});
`,
  ],
  /* 9. the door's last step, and the tours */
  [
    `  var step=_doorSteps[_doorStep];
  w.className='dr2 at-'+step;`,
    `  var step=_doorSteps[_doorStep];
  w.className='dr2 at-'+step;
  usageMark({dr:step});`,
  ],
  [
    `function doorFinish(){
  try{localStorage.setItem(DOOR_KEY,'1');}catch(e){}`,
    `function doorFinish(){
  try{localStorage.setItem(DOOR_KEY,'1');}catch(e){}
  usageMark({dr:'end'});`,
  ],
  [
    `  function end(){areaTourMark(a);document.removeEventListener('click',hold,true);var t=document.getElementById('tour');if(t)t.remove();}
  document.getElementById('tour-n').onclick=function(){k++;if(k>=N)end();else show();};
  document.getElementById('tour-x').onclick=end;`,
    `  function end(skip){usageMark(skip?{tx:[a]}:{td:[a]});areaTourMark(a);document.removeEventListener('click',hold,true);var t=document.getElementById('tour');if(t)t.remove();}
  document.getElementById('tour-n').onclick=function(){k++;if(k>=N)end();else show();};
  document.getElementById('tour-x').onclick=function(){end(true);};`,
  ],
  [
    `  function end(){try{localStorage.setItem(TOUR_KEY,'1');}catch(e){}document.removeEventListener('click',hold,true);
    var t=document.getElementById('tour');if(t)t.remove();}
  document.getElementById('tour-n').onclick=function(){k++;if(k>=N)end();else show();};
  document.getElementById('tour-x').onclick=end;`,
    `  function end(skip){usageMark(skip?{tx:['home']}:{td:['home']});try{localStorage.setItem(TOUR_KEY,'1');}catch(e){}document.removeEventListener('click',hold,true);
    var t=document.getElementById('tour');if(t)t.remove();}
  document.getElementById('tour-n').onclick=function(){k++;if(k>=N)end();else show();};
  document.getElementById('tour-x').onclick=function(){end(true);};`,
  ],
];

let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 160)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
