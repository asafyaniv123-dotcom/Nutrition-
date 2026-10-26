/* Notifications in Mip's voice (Asaf approved review/notifications, 26 Oct).
 * - the words: the evening, planning, birthdays
 * - the in-app banner: Mip from the engine instead of a moon emoji, a title and
 *   a sentence, one action; the planning reminder uses it too
 * - in the phone shells: action buttons (summarise now / in an hour, done /
 *   ten more minutes, we talked / tomorrow) and three new kinds - a person
 *   overdue (at most once a week, 18:00), a weigh-in morning (07:30 on her
 *   weigh days), and a streak at risk (90 min after the evening reminder)
 * - the phone is re-synced when the app is hidden too, so a summary finished
 *   at 20:00 takes the 21:00 reminder off the phone. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

/* ── plural answers in Hebrew ── */
rep(`    other:'עוד {n} ימים ואפשר יהיה לומר לאן זה הולך. עד אז זה בעיקר מים.'}
};`, `    other:'עוד {n} ימים ואפשר יהיה לומר לאן זה הולך. עד אז זה בעיקר מים.'},
  'בעוד {n} דקות · {when}':{one:'בעוד דקה · {when}',two:'בעוד שתי דקות · {when}',other:'בעוד {n} דקות · {when}'},
  'עוד {n} דקות':{one:'עוד דקה',two:'עוד שתי דקות',other:'עוד {n} דקות'},
  '{n} ימים מאז שדיברתם. אולי היום?':{one:'יום מאז שדיברתם. אולי היום?',two:'יומיים מאז שדיברתם. אולי היום?',other:'{n} ימים מאז שדיברתם. אולי היום?'},
  '{n} שבועות מאז שדיברתם. אולי היום?':{one:'שבוע מאז שדיברתם. אולי היום?',two:'שבועיים מאז שדיברתם. אולי היום?',other:'{n} שבועות מאז שדיברתם. אולי היום?'}
};`);

/* ── the banner's look ── */
rep(`.srb-moon{font-size:20px;flex-shrink:0;filter:grayscale(.35)}
.srb-t{flex:1;font-size:13px;font-weight:700;line-height:1.5;color:var(--nu-ink)}`,
`.srb.in{animation:srbIn .55s cubic-bezier(.22,.61,.36,1) both}
@keyframes srbIn{from{transform:translateY(-130%)}}
.srb-mip{flex:none;width:54px;height:54px;margin:-8px -4px -8px -6px;position:relative}
.srb-t{flex:1;min-width:0;line-height:1.4;color:var(--nu-ink)}
.srb-t b{display:block;font-size:14px;font-weight:800}
.srb-t span{display:block;font-size:12.5px;font-weight:600;color:var(--nu-muted);margin-top:1px}`);

/* ── the words ── */
rep(`function sumRemTitle(){return _t('תזכורת לסיכום יום');}
function sumRemMsg(){return _t('עוד לא עצרת לסכם את היום.');}`,
`function sumRemTitle(){return _t('סיום יום');}
function sumRemMsg(){return _t('שתי דקות לפני שהיום נגמר? אני כאן.');}`);

/* ── the banner: Mip, a title, a sentence, one action ── */
rep(`  sndPlay(SND_OPEN,0.45).catch(function(){});
  sumRemBannerDraw(msg);
}
function sumRemBannerDraw(msg){
  var old=document.getElementById('sumrem-banner');if(old)old.remove();
  var d=document.createElement('div');
  d.id='sumrem-banner';
  d.style.cssText='position:fixed;top:0;left:0;right:0;z-index:900;display:flex;justify-content:center;padding:10px 12px;pointer-events:none';
  d.innerHTML='<div class="srb">'+
    '<span class="srb-moon">&#x1F319;</span>'+
    '<div class="srb-t">'+esc(msg)+'</div>'+
    '<button class="srb-go" onclick="sumRemGo()">'+_t('סיכום')+'</button>'+
    '<button class="srb-x" onclick="sumRemDismiss()">&times;</button>'+
  '</div>';
  document.body.appendChild(d);
}`,
`  remBanner(SUMREM_BAN);
}
/* The evening's banner. Its words are a FUNCTION, asked at every draw, so a
   redraw for a language change says the new language. */
var SUMREM_BAN={f:function(){return {t:sumRemTitle(),b:sumRemMsg(),btn:_t('לסכם עכשיו')};},
  go:function(){enterModule('endofday');window.scrollTo(0,0);}};
/* Any reminder that arrives while the app is open: Mip from the engine, a
   title, a sentence, one action. o = {f:()=>({t,b,btn}), go, ttl} */
var _remBan=null,_remBanT=null;
function remBanner(o){sndPlay(SND_OPEN,0.45).catch(function(){});remBannerDraw(o,true);}
function remBannerDraw(o,arrive){
  _remBan=o;
  var old=document.getElementById('sumrem-banner');if(old)old.remove();
  var d=document.createElement('div'),f=o.f();
  d.id='sumrem-banner';
  d.style.cssText='position:fixed;top:0;left:0;right:0;z-index:900;display:flex;justify-content:center;padding:10px 12px;pointer-events:none';
  d.innerHTML='<div class="srb'+(arrive?' in':'')+'">'+
    '<span class="srb-mip"></span>'+
    '<div class="srb-t"><b>'+esc(f.t)+'</b><span>'+esc(f.b)+'</span></div>'+
    (f.btn?'<button class="srb-go">'+esc(f.btn)+'</button>':'')+
    '<button class="srb-x" onclick="sumRemDismiss()">&times;</button>'+
  '</div>';
  var g=d.querySelector('.srb-go');if(g)g.onclick=function(){sumRemDismiss();if(o.go)o.go();};
  document.body.appendChild(d);
  beemKit().then(function(K){var m=d.querySelector('.srb-mip');if(m&&m.isConnected)K.mount(m,arrive?{play:'react'}:{});}).catch(function(){});
  clearTimeout(_remBanT);
  if(o.ttl)_remBanT=setTimeout(function(){if(_remBan===o)sumRemDismiss();},o.ttl);
}`);
rep(`  try{if(document.getElementById('sumrem-banner'))sumRemBannerDraw(sumRemMsg());}catch(e){}`,
  `  try{if(document.getElementById('sumrem-banner')&&_remBan)remBannerDraw(_remBan,false);}catch(e){}`);
rep(`function sumRemDismiss(){var b=document.getElementById('sumrem-banner');if(b)b.remove();}`,
  `function sumRemDismiss(){_remBan=null;var b=document.getElementById('sumrem-banner');if(b)b.remove();}`);

/* ── planning: the same words on the phone and in the banner ── */
rep(`function dpRemFire(t,off){
  var when=dpHM(t.hour,t.min||0);
  var body=off?(t.w+' &mdash; '+_t('בעוד {n} דק׳ ({when})',{n:off,when:when})):(t.w+' &mdash; '+_t('עכשיו ({when})',{when:when}));
  var plain=body.replace(/&mdash;/g,'—');
  /* in the phone shells the phone itself rings it (dpRemNative) */
  if(!remNative())sumRemShowOS(''+_t('תכנון זמן')+'',plain);
  if(!document.hidden)showToast('⏰ '+t.w);
}`,
`/* "in a quarter of an hour · 10:00": the four choices the sheet offers are
   said the way a person says them, anything else counts minutes */
function dpRemBody(off,when){
  if(!off)return _t('עכשיו · {when}',{when:when});
  if(off===15)return _t('בעוד רבע שעה · {when}',{when:when});
  if(off===30)return _t('בעוד חצי שעה · {when}',{when:when});
  if(off===60)return _t('בעוד שעה · {when}',{when:when});
  return _t('בעוד {n} דקות · {when}',{n:off,when:when});
}
function dpRemFire(t,off){
  var when=dpHM(t.hour,t.min||0);
  /* in the phone shells the phone itself rings it (dpRemNative) */
  if(!remNative())sumRemShowOS(t.w,dpRemBody(off,when));
  if(!document.hidden)remBanner({f:function(){return {t:t.w,b:dpRemBody(off,when),btn:_t('בוצע')};},ttl:15000});
}`);
rep(`      out.push({id:1000+k*100+(i%100),title:t.w,
        body:off?_t('בעוד {n} דק׳ ({when})',{n:off,when:when}):_t('עכשיו ({when})',{when:when}),
        schedule:{at:at,allowWhileIdle:true}});`,
`      out.push({id:1000+k*100+(i%100),title:t.w,body:dpRemBody(off,when),
        schedule:{at:at,allowWhileIdle:true},actionTypeId:'olm-plan',extra:{k:'plan'}});`);

/* ── the evening on the phone, with its buttons ── */
rep(`      out.push({id:100+i,title:sumRemTitle(),body:sumRemMsg(),schedule:{at:d,allowWhileIdle:true}});`,
  `      out.push({id:100+i,title:sumRemTitle(),body:sumRemMsg(),schedule:{at:d,allowWhileIdle:true},actionTypeId:'olm-eve',extra:{k:'eve'}});`);
rep(`    var out=pplBdayNative().concat(dpRemNative());`,
  `    var out=pplBdayNative().concat(dpRemNative(),pplNudgeNative(),weighNative(),streakNative(),remSnoozeNative());`);

/* ── birthdays ── */
rep(`      out.push({id:300+i*20+(j%20),title:_t('יום הולדת היום'),body:_t('היום יום ההולדת של {name}. אולי להתקשר?',{name:L[j].name}),schedule:{at:d,allowWhileIdle:true}});`,
  `      out.push({id:300+i*20+(j%20),title:_t('יום הולדת ל{name}',{name:L[j].name}),body:_t('מילה קטנה ממך יכולה לעשות את היום.'),
        schedule:{at:d,allowWhileIdle:true},actionTypeId:'olm-bday',extra:{k:'bday',name:L[j].name}});`);
rep(`  pplBdayList().forEach(function(b){(by[b.md]=by[b.md]||[]).push(_t('היום יום ההולדת של {name}. אולי להתקשר?',{name:b.name}));});`,
  `  pplBdayList().forEach(function(b){(by[b.md]=by[b.md]||[]).push(_t('היום יום ההולדת של {name}. מילה קטנה ממך יכולה לעשות את היום.',{name:b.name}));});`);

/* ── the new kinds, the snoozes and the buttons ── */
rep(`/* the phone holds at most 64 pending: keep the soonest */`,
`/* SOMEONE YOU HAVE NOT SPOKEN TO. The longest wait among the people past
   their rhythm, at 18:00, and never more than once a week: the time it was
   set for is kept, and the next one waits seven days after it. */
var PPL_NUDGE_KEY='ppl_nudge_at';
function pplNudgeNative(){
  var over=pplOverdue(loadPeople());if(!over.length)return [];
  var o=over[0],now=Date.now(),last=0,at;
  try{last=+localStorage.getItem(PPL_NUDGE_KEY)||0;}catch(e){}
  if(last>now+30000)at=new Date(last);
  else{
    at=new Date();at.setHours(18,0,0,0);if(at.getTime()<=now+30000)at.setDate(at.getDate()+1);
    if(last){var min=new Date(last+7*86400000);min.setHours(18,0,0,0);if(at<min)at=min;}
    try{localStorage.setItem(PPL_NUDGE_KEY,String(at.getTime()));}catch(e){}
  }
  var nm=o.p.name||'',body;
  if(o.days===null)body=_t('עוד לא רשמת שיחה עם {name}. אולי היום?',{name:nm});
  else{
    var days=o.days+Math.round((at.getTime()-now)/86400000);
    if(days>=14)body=_t('{n} שבועות מאז שדיברתם. אולי היום?',{n:Math.floor(days/7)});
    else body=_t('{n} ימים מאז שדיברתם. אולי היום?',{n:days});
  }
  return [{id:200,title:_t('עבר זמן מ{name}',{name:nm}),body:body,
    schedule:{at:at,allowWhileIdle:true},actionTypeId:'olm-ppl',extra:{k:'ppl',name:nm}}];
}
/* A WEIGH-IN MORNING: 07:30 on the days she chose to weigh, unless that
   day already has a weight. */
function weighNative(){
  var c=weighCfg();if(!c.on)return [];
  var w=loadWeights(),out=[],k,date,at,now=Date.now();
  for(k=0;k<7;k++){
    date=dayShift(k);if(!weighIsDay(date)||typeof w[date]==='number')continue;
    at=new Date(date+'T07:30:00');if(at.getTime()<=now+30000)continue;
    out.push({id:210+k,title:_t('בוקר טוב'),body:_t('היום יום שקילה. לפני הקפה, אם אפשר.'),
      schedule:{at:at,allowWhileIdle:true},extra:{k:'weigh'}});
  }
  return out;
}
/* A STREAK AT RISK: tonight only, an hour and a half after the evening
   reminder, when there are three days or more to lose and today is open. A
   finished summary re-syncs and takes it off the phone. */
function streakNative(){
  var o=loadSumRem();if(!o.on)return [];
  var st=streakNow();if(st.today||st.n<3)return [];
  var hm=String(o.time||'21:00').split(':'),at=new Date(todayStr()+'T00:00:00');
  at.setHours(+hm[0]||0,(+hm[1]||0)+90,0,0);
  if(at.getTime()<=Date.now()+30000)return [];
  return [{id:220,title:_t('{n} ימים ברצף',{n:st.n}),body:_t('עוד שתי דקות הערב והרצף ממשיך.'),
    schedule:{at:at,allowWhileIdle:true},actionTypeId:'olm-streak',extra:{k:'streak'}}];
}
/* "in an hour", "ten more minutes", "tomorrow": kept here, because every
   sync clears the phone and writes it again */
var REM_SNOOZE_KEY='rem_snooze';
function remSnoozes(){
  var a=[];try{a=JSON.parse(localStorage.getItem(REM_SNOOZE_KEY)||'[]')||[];}catch(e){}
  var now=Date.now();return a.filter(function(n){return n&&n.at>now+30000;});
}
function remSnooze(n,mins){
  var a=remSnoozes();
  a.push({id:900+a.length%90,at:Date.now()+mins*60000,title:n.title||'',body:n.body||'',t:n.actionTypeId||'',extra:n.extra||{}});
  try{localStorage.setItem(REM_SNOOZE_KEY,JSON.stringify(a));}catch(e){}
  remNativeSync();
}
function remSnoozeNative(){
  var done=rfDone(rfRec(todayStr()));
  return remSnoozes().filter(function(n){var k=n.extra&&n.extra.k;return !(done&&(k==='eve'||k==='streak'));})
    .map(function(n,i){var o={id:900+i,title:n.title,body:n.body,schedule:{at:new Date(n.at),allowWhileIdle:true},extra:n.extra};
      if(n.t)o.actionTypeId=n.t;return o;});
}
/* The buttons under a long press. Every one opens the app: an action that
   runs in the background may find no page to run in, and a button that
   silently does nothing is worse than one more tap. */
function remNativeTypes(){
  var LN=remNative();if(!LN||!LN.registerActionTypes)return;
  function a(id,t){return {id:id,title:t,foreground:true};}
  LN.registerActionTypes({types:[
    {id:'olm-eve',actions:[a('go',_t('לסכם עכשיו')),a('later',_t('בעוד שעה'))]},
    {id:'olm-plan',actions:[a('done',_t('בוצע')),a('snooze',_t('עוד {n} דקות',{n:10}))]},
    {id:'olm-bday',actions:[a('talked',_t('רשמתי שדיברנו'))]},
    {id:'olm-ppl',actions:[a('talked',_t('רשמתי שדיברנו')),a('tomorrow',_t('מחר|כפתור'))]},
    {id:'olm-streak',actions:[a('go',_t('לסכם עכשיו'))]}
  ]}).catch(function(){});
}
langOn(function(){try{remNativeTypes();}catch(e){}});
function pplIdxByName(nm){
  var P=loadPeople(),i;for(i=0;i<P.length;i++)if(P[i]&&P[i].name===nm)return i;return -1;
}
function remNativeAct(id,n){
  var x=(n&&n.extra)||{},k=x.k;
  if(id==='later'){remSnooze(n,60);return;}
  if(id==='snooze'){remSnooze(n,10);return;}
  if(id==='tomorrow'){remSnooze(n,24*60);return;}
  if(id==='done')return;
  if(id==='talked'){
    var P=loadPeople(),pi=pplIdxByName(x.name);if(pi<0)return;
    P[pi].lastContact=Date.now();if(!P[pi].memories)P[pi].memories=[];
    P[pi].memories.push({id:Date.now()+'',content:'',via:1,type:'conversation',date:Date.now(),pinned:false});
    savePeople(P);showToast(_t('נרשם')+' ✓');remNativeSync();return;
  }
  /* a tap on the notification itself, or "summarise now" */
  if(k==='eve'||k==='streak'){sumRemGo();return;}
  if(k==='plan'){GO_ROUTES.day();return;}
  if(k==='weigh'){GO_ROUTES.nutrition();return;}
  if(k==='bday'||k==='ppl'){
    var j=pplIdxByName(x.name);enterModule('people');
    if(j>=0){_personIdx=j;_peopleView='person';renderPeople();}
  }
}
window.addEventListener('load',function(){
  var LN=remNative();if(!LN||!LN.addListener)return;
  LN.addListener('localNotificationActionPerformed',function(a){
    setTimeout(function(){try{remNativeAct(a.actionId,a.notification||{});}catch(e){}},600);
  });
});
/* the phone holds at most 64 pending: keep the soonest */`);

/* ── sync when hidden too: a summary finished before the hour clears it ── */
rep(`document.addEventListener('visibilitychange',function(){if(!document.hidden)try{remNativeSync();}catch(e){}});`,
  `document.addEventListener('visibilitychange',function(){try{remNativeSync();}catch(e){}});`);

if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
