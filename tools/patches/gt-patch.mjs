// node gt-patch.mjs <index.html> [--undo] - ON THE CLOCK (follow-along), 20 Nov: the stretch routine's engine (wtPlanStart / .wtr)
//   given to every exercise, with three doors (generator, saved workouts and programs, the exercise card) and a page
//   before it that sets the pace. Every edit is an exact [old,new] pair whose old text must occur once; --undo puts
//   each old back, so applying and undoing must return the file byte for byte.
import fs from 'node:fs';
const F = process.argv[2], undo = process.argv.includes('--undo');
if (!F) throw new Error('usage: gt-patch.mjs <index.html> [--undo]');

const CSS = `/* ── ON THE CLOCK (20 Nov) ──
   A workout followed rather than logged: the timer's own screen, with the
   movement large in the middle, the step it is on written under it, and the
   one coming next in a small window - the stretch routine, given to every
   exercise. Same material, same ring; only the proportions change, because
   here the picture is the thing being read. */
.wtr.gt .wtr-demo{width:min(290px,70vw,33dvh);margin-top:10px;background:#140f0c}
.gt-hd{text-align:center;margin-top:8px;min-width:0}
.gt-lb{font-size:11.5px;font-weight:800;color:var(--nu-muted);min-height:1.3em}
.gt-nm{font-size:20px;font-weight:800;color:var(--nu-ink);line-height:1.2;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gt-of{font-size:12.5px;font-weight:700;color:var(--nu-muted);margin-top:2px;min-height:1.3em}
/* three lines are kept whether or not they are used, so a short step and a
   long one do not move the ring up and down between them */
.gt-cue{min-height:5.7em;max-width:360px;margin:10px auto 0;text-align:center;
  font-size:14.5px;font-weight:700;line-height:1.4;color:var(--nu-ink)}
.gt-cue em{display:block;font-style:normal;font-size:11px;font-weight:800;color:var(--nu-muted);margin-bottom:3px}
.gt-cue span{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.wtr.gt .wtr-mid{padding-top:6px}
.wtr.gt .wtr-ringw{width:min(168px,21dvh)}
.wtr.gt .wtr-ringin{padding:0 14%}
.wtr.gt .wtr-ringin .wtr-phase{font-size:12.5px}
.wtr.gt .wtr-ringin .wtr-face{font-size:min(15vw,50px);margin-top:2px}
.wtr.gt .wtr-ringin .wtr-face.w5{font-size:min(12vw,40px)}
.wtr.gt .wtr-ringin .wtr-cue{font-size:14px}
.gt-nx{display:flex;align-items:center;gap:11px;margin-top:12px;border-radius:15px;padding:8px 11px;
  background:var(--nu-ground);box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}
.gt-nx .st-th{width:42px;height:42px;border-radius:11px;background:#140f0c}
.gt-rr{display:flex;gap:10px;margin-top:12px}
.gt-rr .wtr-s{flex:1;padding:14px 8px;font-size:13.5px;direction:inherit;color:var(--nu-ink)}
.wtr.gt .wtr-ctrl{padding-top:12px}
.wtr.gt .wtr-b{padding:15px 10px}
/* and the page before it: what is in it, how long, and the pace */
.gts .gts-l{flex:1 1 auto;min-height:60px;overflow:auto;margin-top:12px;border-radius:15px;padding:4px 10px;
  box-shadow:inset 1px 2px 4px var(--nu-shade),inset -1px -1px 3px var(--nu-lit)}
.gts .st-list{margin:2px 0}
.gts .st-th{background:#140f0c}
.gts-h{font-size:12px;font-weight:800;color:var(--nu-muted);margin:16px 2px 8px}
.gts .wtr-len{justify-content:flex-start;margin-top:0}
.gts-c{display:flex;gap:10px;margin-top:10px}
.gts-st{flex:1;display:flex;align-items:center;justify-content:space-between;gap:6px;border-radius:14px;padding:5px;
  box-shadow:inset 1px 2px 4px var(--nu-shade),inset -1px -1px 3px var(--nu-lit)}
.gts-st span{text-align:center;font-size:12px;font-weight:700;color:var(--nu-muted);line-height:1.25}
.gts-st b{display:block;font-size:16px;color:var(--nu-ink);direction:ltr;font-variant-numeric:tabular-nums}
.gts-st .wtr-s{padding:8px 13px;font-size:15px}
/* the generator's last question: two ways to run what it built */
.gn-two{display:flex;flex-direction:column;gap:10px}
.gn-two .gn-go{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:9px 12px}
.gn-two .gn-go span{font-size:11.5px;font-weight:600;opacity:.92}
.fs-gt svg{width:21px;height:21px;margin:0}
`;

const JS = `/* ── ON THE CLOCK (20 Nov) ──
   A workout FOLLOWED rather than logged: a fixed pace of work and rest, the
   movement playing large, the step it is on written under it, and the next
   one already showing. It is the stretch routine's engine - wtPlanStart with
   a list of names - given to every exercise, so the clock, the sounds, the
   locked-screen arithmetic and the wake lock are the ones already proven.
   Each exercise runs its sets back to back (A A A B B B), the way the logged
   workout runs; and the rest after the very last set is cut to nothing,
   because a rest that leads nowhere is only waiting for "done". */
var GT_PACES=[[30,15],[40,20],[45,15],[60,30]],GT_PREP=5,GT_KEY='fit_gtpace',_gt=null;
function gtIcon(){return '<svg viewBox="0 0 24 24"><path d="M9 1.5h6v2H9zM12 5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zm0 2.2a6.3 6.3 0 1 1 0 12.6 6.3 6.3 0 0 1 0-12.6zM11 9v5.3l3.9 2.3.9-1.5-2.8-1.7V9z"/></svg>';}
function gtPaceLoad(){
  try{
    var j=JSON.parse(localStorage.getItem(GT_KEY)||'null');
    if(j&&j.work>=10&&j.work<=300&&j.rest>=0&&j.rest<=180)return {work:j.work|0,rest:j.rest|0};
  }catch(e){}
  return {work:40,rest:20};
}
function gtPreset(w,r){
  for(var i=0;i<GT_PACES.length;i++)if(GT_PACES[i][0]===w&&GT_PACES[i][1]===r)return i;
  return -1;
}
/* list: [{name, sets}], by the stored name, as a workout keeps it. Sets are
   two or three, from the workout's own: four sets of forty seconds of one
   movement is a lot to follow, and one is not a workout. */
function gtOpen(title,list){
  exLoad(function(){
    var names=[],s=0,i,e,p=gtPaceLoad();
    for(i=0;i<list.length;i++){e=exByName(list[i].name);if(!e)continue;names.push(e.n);s+=(+list[i].sets||3);}
    if(!names.length)return;
    _gt={title:title,names:names,work:p.work,rest:p.rest,custom:gtPreset(p.work,p.rest)<0,
         sets:Math.max(2,Math.min(3,Math.round(s/names.length)))};
    gtPaint();
  });
}
function gtOne(id){exLoad(function(){var e=stRow(id);if(e)gtOpen(exTitle(e),[{name:e.n,sets:3}]);});}
function gtFromTpl(i){
  var t=loadTemplates()[i];if(!t)return;
  gtOpen(t.name,t.exercises.map(function(x){return {name:x.name,sets:tplRows(x).length};}));
}
function gtSecs(g){return GT_PREP+g.names.length*g.sets*(g.work+g.rest)-g.rest;}
function gtPace(i){var p=GT_PACES[i];if(!_gt||!p)return;_gt.work=p[0];_gt.rest=p[1];_gt.custom=false;gtPaint();}
function gtCustom(){if(!_gt)return;_gt.custom=true;gtPaint();}
function gtStep(f,d){
  if(!_gt)return;
  if(f==='w')_gt.work=Math.max(10,Math.min(300,_gt.work+d));
  else _gt.rest=Math.max(0,Math.min(180,_gt.rest+d));
  gtPaint();
}
function gtSetN(n){if(_gt){_gt.sets=n;gtPaint();}}
function gtClose(){_gt=null;var el=document.getElementById('gts');if(el)el.remove();}
function gtStepHTML(f,label,v){
  return '<div class="gts-st"><button class="wtr-s" onclick="gtStep(\\''+f+'\\',-5)" aria-label="'+esc(_t('פחות'))+'">&minus;</button>'+
    '<span>'+esc(label)+'<b>'+wtFace(v)+'</b></span>'+
    '<button class="wtr-s" onclick="gtStep(\\''+f+'\\',5)" aria-label="'+esc(_t('יותר'))+'">+</button></div>';
}
/* THE PAGE BEFORE: what is in it, how long it takes, and the pace - drawn on
   the body in the clock's own material, so starting is one more tap on the
   same surface rather than a sheet and then a screen */
function gtPaint(){
  var g=_gt,el=document.getElementById('gts'),h,i,e,on,sc;
  if(!g){if(el)el.remove();return;}
  if(!el){document.body.insertAdjacentHTML('beforeend','<div id="gts" class="wtr gts"></div>');el=document.getElementById('gts');}
  sc=el.querySelector('.gts-l');sc=sc?sc.scrollTop:0;
  h='<div class="wtr-top"><button class="wtr-min" onclick="gtClose()">&#8249; '+_t('חזרה')+'</button>'+
    '<span class="wtr-ttl">'+esc(_t('אימון על זמן'))+'</span></div>';
  h+='<div class="gt-hd"><div class="gt-nm">'+esc(g.title)+'</div><div class="gt-of">'+
     esc(_t('{n} תרגילים',{n:g.names.length})+' · '+_t('{n} דקות',{n:Math.max(1,Math.round(gtSecs(g)/60))}))+'</div></div>';
  h+='<div class="gts-l"><div class="st-list">';
  for(i=0;i<g.names.length;i++){
    e=exByName(g.names[i]);if(!e)continue;
    h+='<div class="st-li"><span class="st-th">'+
       (EX_DEMO[exDemoId(e)]?'<video src="'+stVidSrc(e)+'" muted loop playsinline autoplay preload="metadata" aria-hidden="true"></video>':'')+
       '</span><span class="st-x"><b>'+esc(exTitle(e))+'</b><span>'+esc(e.m.map(_t).join(' · ')+' · '+_t('{n} סטים',{n:g.sets}))+'</span></span></div>';
  }
  h+='</div></div>';
  h+='<div class="gts-h">'+_t('עבודה ומנוחה')+'</div><div class="wtr-len">';
  on=g.custom?-1:gtPreset(g.work,g.rest);
  for(i=0;i<GT_PACES.length;i++)
    h+='<button class="wtr-s'+(on===i?' on':'')+'" onclick="gtPace('+i+')">'+wtFace(GT_PACES[i][0])+' / '+wtFace(GT_PACES[i][1])+'</button>';
  h+='<button class="wtr-s'+(g.custom?' on':'')+'" onclick="gtCustom()">'+_t('מותאם אישית')+'</button></div>';
  if(g.custom)h+='<div class="gts-c">'+gtStepHTML('w',_t('עבודה|טיימר'),g.work)+gtStepHTML('r',_t('מנוחה|טיימר'),g.rest)+'</div>';
  h+='<div class="gts-h">'+_t('סטים לכל תרגיל')+'</div><div class="wtr-len">';
  for(i=1;i<=4;i++)h+='<button class="wtr-s'+(g.sets===i?' on':'')+'" onclick="gtSetN('+i+')">'+nfmt(i)+'</button>';
  h+='</div><div class="wtr-ctrl"><button class="wtr-b" onclick="gtGo()">'+_t('להתחיל')+'</button></div>';
  el.innerHTML=h;
  if(sc)el.querySelector('.gts-l').scrollTop=sc;
}
function gtGo(){
  var g=_gt;if(!g)return;
  var names=[],setn=[],exi=[],adj={},i,j;
  for(i=0;i<g.names.length;i++)for(j=1;j<=g.sets;j++){names.push(g.names[i]);setn.push(j);exi.push(i);}
  /* nothing follows the last set, so its rest is taken away */
  adj[names.length-1]=-g.rest*1000;
  try{localStorage.setItem(GT_KEY,JSON.stringify({work:g.work,rest:g.rest}));}catch(e){}
  var gt={title:g.title,setn:setn,exi:exi,sets:g.sets,exn:g.names.length,adj:adj};
  gtClose();
  _wtFull=true;
  wtPlanStart('follow',g.work,g.rest,1,GT_PREP,names,[],gt);
}
/* THE REST SHE IS IN, cut to now or made ten seconds longer. Both change the
   length of THIS interval, which wtAt walks - so everything after it is still
   derived from elapsed time, and a locked phone still comes back to the right
   second. Moving _wtFrom instead would have been simpler and wrong: ten
   seconds added three seconds into a rest walks the clock back into work. */
function gtRestNow(){
  var p=_wtPlan;if(!p||p.kind!=='follow'||!p.adj)return null;
  var el=(_wtPaused||Date.now())-_wtFrom,at=wtAt(el),end=(p.prep||0)*1000,i;
  if(!at||at.phase!=='rest')return null;
  for(i=0;i<=at.idx;i++)end+=(p.work+p.rest)*1000+(p.adj[i]||0);
  return {idx:at.idx,left:end-el};
}
function gtSkip(){var r=gtRestNow();if(!r)return;_wtPlan.adj[r.idx]=(_wtPlan.adj[r.idx]||0)-r.left;wtTick();}
function gtMore(){var r=gtRestNow();if(!r)return;_wtPlan.adj[r.idx]=(_wtPlan.adj[r.idx]||0)+10000;_wtCued={};wtTick();}
function gtTx(id,s){var el=document.getElementById(id);if(el&&el.textContent!==s)el.textContent=s;}
/* WHAT CHANGES on the follow screen, with the clock's own five-a-second
   write. In WORK it is the exercise running: its name, its set, the step the
   movement is on - the steps share the work interval out evenly - and a
   small window onto what comes next. In REST and in the countdown the whole
   screen is already the one coming, and the line under the movement is a
   mistake people make in it, a different one each set. */
function gtWrite(at){
  var p=_wtPlan,g=p.gt,K=p.names.length,ph=at.phase,i,e,how,el,h='',k,n2,v,src,pr;
  i=ph==='work'?at.ex:ph==='prep'?0:Math.min(K-1,at.ex+1);
  e=exByName(p.names[i]);
  gtTx('gt-lb',ph==='done'?'':ph==='work'?(g.exn>1?_t('תרגיל {n} מתוך {total}',{n:g.exi[i]+1,total:g.exn}):''):_t('בהמשך'));
  gtTx('gt-nm',ph==='done'?g.title:(e?exTitle(e):exLabel(p.names[i])));
  gtTx('gt-of',ph==='done'?'':_t('סט {n} מתוך {total}',{n:g.setn[i],total:g.sets}));
  if(e&&ph!=='done'){
    how=exHow(e);
    if(ph==='work'&&how.s&&how.s.length){
      k=Math.max(0,Math.min(how.s.length-1,Math.floor((p.work-at.left)/p.work*how.s.length)));
      h='<em>'+esc(_t('שלב {n} מתוך {total}',{n:k+1,total:how.s.length}))+'</em><span dir="auto">'+esc(how.s[k])+'</span>';
    } else if(ph!=='work'&&how.k&&how.k.length){
      h='<em>'+esc(_t('טעות נפוצה'))+'</em><span dir="auto">'+esc(how.k[(g.setn[i]-1)%how.k.length])+'</span>';
    }
  }
  el=document.getElementById('gt-cue');
  if(el&&el.getAttribute('data-h')!==h){el.innerHTML=h;el.setAttribute('data-h',h);}
  el=document.getElementById('gt-nx');
  if(el)el.style.display=ph==='work'?'':'none';
  if(ph==='work'){
    n2=at.idx+1<K?exByName(p.names[at.idx+1]):null;
    gtTx('gt-nn',at.idx+1>=K?_t('סוף האימון'):
      (n2?exTitle(n2):exLabel(p.names[at.idx+1]))+' · '+_t('סט {n} מתוך {total}',{n:g.setn[at.idx+1],total:g.sets}));
    v=document.getElementById('gt-nv');
    src=(n2&&EX_DEMO[exDemoId(n2)])?stVidSrc(n2):'';
    if(v&&v.getAttribute('data-s')!==src){
      v.setAttribute('data-s',src);
      if(src){v.src=src;pr=v.play();if(pr&&pr.catch)pr.catch(function(){});}else v.removeAttribute('src');
    }
  }
  el=document.getElementById('gt-rr');
  if(el)el.style.display=ph==='rest'?'':'none';
}
`;

const E = [
  // CSS
  ['.xd-say.st{background:rgba(111,190,180,.14);color:#2f6f66}', CSS + '.xd-say.st{background:rgba(111,190,180,.14);color:#2f6f66}'],
  // the JS block, before the stretch door
  ['/* ── THE DOOR ── four routines, and the way into the stretches themselves */', JS + '/* ── THE DOOR ── four routines, and the way into the stretches themselves */'],
  // the engine
  ['function wtPlanStart(kind,work,rest,rounds,prep,names,sides){\n  _wtPlan={kind:kind,',
   'function wtPlanStart(kind,work,rest,rounds,prep,names,sides,gt){\n  _wtPlan={kind:kind,gt:gt||null,adj:(gt&&gt.adj)?JSON.parse(JSON.stringify(gt.adj)):null,'],
  ["  if(kind!=='stretch')wtPlanSave(_wtPlan);", "  if(kind!=='stretch'&&kind!=='follow')wtPlanSave(_wtPlan);"],
  ['  wtPlanStart(p.kind,p.work,p.rest,p.rounds,p.prep,p.names,p.sides);', '  wtPlanStart(p.kind,p.work,p.rest,p.rounds,p.prep,p.names,p.sides,p.gt);'],
  ["  if(!p||p.kind==='stretch')return;\n  a=wtSavedAll();", "  if(!p||p.kind==='stretch'||p.kind==='follow')return;\n  a=wtSavedAll();"],
  ["kind==='tabata'?'Tabata':kind==='stretch'?_t('מתיחות'):",
   "kind==='tabata'?'Tabata':kind==='stretch'?_t('מתיחות'):kind==='follow'?((_wtPlan&&_wtPlan.gt&&_wtPlan.gt.title)||_t('אימון על זמן')):"],
  [`  var idx=Math.floor(t/cyc);
  if(idx>=total)return at('done',0,total-1);
  var inCyc=t%cyc;
  if(inCyc<p.work*1000)return at('work',Math.ceil((p.work*1000-inCyc)/1000),idx);
  return at('rest',Math.ceil((cyc-inCyc)/1000),idx);`,
   `  var idx,inCyc,len=cyc,a=p.adj;
  if(!a){idx=Math.floor(t/cyc);inCyc=t%cyc;}
  else{
    /* ON THE CLOCK a rest can be cut short or lengthened, so the intervals
       are no longer one length: walk them. Sixty at most, five times a second. */
    for(idx=0;idx<total;idx++){len=cyc+(a[idx]||0);if(t<len)break;t-=len;}
    inCyc=t;
  }
  if(idx>=total)return at('done',0,total-1);
  if(inCyc<p.work*1000)return at('work',Math.ceil((p.work*1000-inCyc)/1000),idx);
  return at('rest',Math.ceil((len-inCyc)/1000),idx);`],
  ["    el.className=_wtFull?'wtr'+(_wtMode==='plan'&&_wtPlan&&_wtPlan.kind==='stretch'?' st':''):'wtp';",
   "    el.className=_wtFull?'wtr'+(_wtMode==='plan'&&_wtPlan&&_wtPlan.kind==='stretch'?' st':\n      _wtMode==='plan'&&_wtPlan&&_wtPlan.kind==='follow'?' gt':''):'wtp';"],
  [`  if(plan&&_wtPlan.kind==='stretch')
    h+='<div class="wtr-demo"><video id="wt-vid" muted loop playsinline autoplay aria-hidden="true"></video></div>';`,
   `  var gt=plan&&_wtPlan.kind==='follow';
  if(gt)h+='<div class="gt-hd"><div class="gt-lb" id="gt-lb"></div><div class="gt-nm" id="gt-nm"></div>'+
           '<div class="gt-of" id="gt-of"></div></div>';
  if(plan&&(_wtPlan.kind==='stretch'||gt))
    h+='<div class="wtr-demo"><video id="wt-vid" muted loop playsinline autoplay aria-hidden="true"></video></div>';
  if(gt)h+='<div class="gt-cue" id="gt-cue"></div>';`],
  [`  if(plan&&_wtPlan.names&&_wtPlan.names.length)
    h+='<div class="wtr-list" id="wt-list"></div>';`,
   `  if(plan&&!gt&&_wtPlan.names&&_wtPlan.names.length)
    h+='<div class="wtr-list" id="wt-list"></div>';
  /* on the clock the list gives way to what comes next, and in the rest to
     the two things a rest is changed by */
  if(gt)h+='<div class="gt-nx" id="gt-nx"><span class="st-th"><video id="gt-nv" muted loop playsinline autoplay aria-hidden="true"></video></span>'+
           '<span class="st-x"><span>'+_t('בהמשך')+'</span><b id="gt-nn"></b></span></div>'+
           '<div class="gt-rr" id="gt-rr" style="display:none"><button class="wtr-s" onclick="gtSkip()">'+_t('לדלג על המנוחה')+'</button>'+
           '<button class="wtr-s" onclick="gtMore()">'+_t('עוד {n} שניות',{n:10})+'</button></div>';`],
  ["  nm=(at&&at.phase==='work')?wtNameAt(at.ex):'';", "  nm=(at&&at.phase==='work'&&_wtPlan.kind!=='follow')?wtNameAt(at.ex):'';"],
  ["      :at.phase==='rest'?_wtPlan.rest:1;", "      :at.phase==='rest'?_wtPlan.rest+((_wtPlan.adj&&_wtPlan.adj[at.idx])||0)/1000:1;"],
  ["  if(plan&&at&&_wtPlan.kind==='stretch')stVidSet(at);\n}",
   "  if(plan&&at&&(_wtPlan.kind==='stretch'||_wtPlan.kind==='follow'))stVidSet(at);\n  if(plan&&at&&_wtPlan.kind==='follow'&&_wtFull)gtWrite(at);\n}"],
  // door 1: the generator
  ['function genBuild(){\n  if(!_gen)return;', 'function genBuild(gt){\n  if(!_gen)return;'],
  ['  fitwReplaceAsk(function(){\n    /* An ordinary workout from here on.',
   `  /* ON THE CLOCK: the same workout, followed rather than logged. _gen stays,
     so going back from the page before it returns to these answers. */
  if(gt){gtOpen(_t('אימון בקליק'),exs.map(function(x){return {name:x.name,sets:x.targetSets};}));return;}
  fitwReplaceAsk(function(){
    /* An ordinary workout from here on.`],
  [`    h+='<button class="gn-go" onclick="genBuild()">'+_t('בנה לי אימון')+'</button>';`,
   `    h+='<div class="gn-two"><button class="gn-go" onclick="genBuild()"><b>'+_t('אימון מתועד')+'</b>'+
       '<span>'+_t('סטים, משקל וחזרות, כל סט בתורו')+'</span></button>'+
       '<button class="gn-go" onclick="genBuild(1)"><b>'+_t('אימון על זמן')+'</b>'+
       '<span>'+_t('עבודה ומנוחה על שעון, עם ההדגמה')+'</span></button></div>';`],
  // door 2: saved workouts and programs
  [`         '<button class="fs-play" onclick="startWorkout('+i+')"`,
   `         '<button class="fs-play fs-gt" onclick="gtFromTpl('+i+')" aria-label="'+esc(_t('אימון על זמן'))+'">'+gtIcon()+'</button>'+
         '<button class="fs-play" onclick="startWorkout('+i+')"`],
  [`         '<button class="fs-play" onclick="fitProgStart('+pi+')"`,
   `         '<button class="fs-play fs-gt" onclick="fitProgStart('+pi+',undefined,1)" aria-label="'+esc(_t('אימון על זמן'))+'">'+gtIcon()+'</button>'+
         '<button class="fs-play" onclick="fitProgStart('+pi+')"`],
  ['function fitProgStart(pi,day){', 'function fitProgStart(pi,day,gt){'],
  [`h+='<button onclick="fitSheetClose();fitProgStart('+pi+','+i+')"><b>'`, `h+='<button onclick="fitSheetClose();fitProgStart('+pi+','+i+(gt?',1':'')+')"><b>'`],
  [`  var d=days[day||0],exs=p.exercises.filter(function(x){return (x.day||'')===d;});\n  fitwReplaceAsk(function(){`,
   `  var d=days[day||0],exs=p.exercises.filter(function(x){return (x.day||'')===d;});
  if(gt){gtOpen(progLabel(p.name)+(d?' · '+progDayLabel(d):''),exs.map(function(x){return {name:x.name,sets:+x.sets||3};}));return;}
  fitwReplaceAsk(function(){`],
  // door 3: the exercise card, beside "how it is done"
  [`  if(how.s&&how.s.length)h+=exHowBoxHTML('exDetailHow()');`,
   `  if(how.s&&how.s.length)h+=exHowBoxHTML('exDetailHow()');
  /* and beside it, the same exercise on the clock - as a stretch has its hold */
  if(!e.st&&exHasDemo(e))h+='<button class="tm-go xd-hold" onclick="gtOne(\\''+e.id+'\\')">'+_t('תרגול על זמן')+'</button>';`],
];

let s = fs.readFileSync(F, 'utf8');
const count = (h, n) => h.split(n).length - 1;
for (const [o, n] of undo ? E.slice().reverse() : E) {
  const [from, to] = undo ? [n, o] : [o, n];
  const c = count(s, from);
  if (c !== 1) throw new Error(`${undo ? 'undo' : 'apply'}: expected 1 of ${JSON.stringify(from.slice(0, 70))}, found ${c}`);
  s = s.replace(from, () => to);
}
fs.writeFileSync(F, s);
console.log(undo ? `undone ${E.length} edits` : `applied ${E.length} edits`);
