/* The chat that DOES - the phone's half of /act.
 * Reads answer from the phone's own storage (the same load* the screens use).
 * Writes are proposals: each becomes a card in the talk, and only "add"
 * writes - through the same functions and record shapes the screens write
 * (fit_log + fit_prs, habits_log, people_v2 memories and lastContact,
 * insights_data, sum_<day>, weights, and hcmdWrite for tasks, water, steps,
 * notes, moments and the journal). Food goes to the coach.
 * The suggested lines are things to DO or to look up, not how-to questions;
 * a line ending in an ellipsis puts its words in the box to be finished. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
const cut = (a, b, by) => { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0 || s.indexOf(a, i + 1) >= 0) { console.log('CUT ' + a.slice(0, 60)); process.exit(1); } s = s.slice(0, i) + by + s.slice(j); };

/* suggestions: things to do */
cut(`/* what each place can really answer: Mip's own questions for that screen`, `function hchSugPaint(){`, `/* what each place can do: lines that look something up and send at once,
   and lines ending in "…" that put their start in the box to be finished */
function hchSug(k){
  if(k==='nutrition')return [_t('כמה חלבון נשאר לי היום?'),_t('כמה חלבון אכלתי היום?')];
  if(k==='fitness')return [_t('מה האימון של היום?'),_t('לרשום סט…')];
  if(k==='planning')return [_t('מה יש לי היום?'),_t('מה יש לי מחר?'),_t('להזכיר לי…')];
  if(k==='people')return [_t('למי כדאי שאתקשר?'),_t('דיברתי עם…')];
  if(k==='hobbies')return [_t('כמה הקדשתי לתחביבים השבוע?'),_t('להוסיף זמן ל…')];
  if(k==='closet')return [_t('מה לא לבשתי בחודש האחרון?')];
  if(k==='insights')return [_t('שאלה לכתוב עליה'),_t('למדתי היום ש…')];
  if(k==='endofday')return [_t('מה נשאר לי לענות הערב?'),_t('הרגע הכי טוב היום…')];
  return [_t('מה יש לי היום?'),_t('כמה חלבון נשאר לי היום?'),_t('להזכיר לי…')];
}
`);
rep(`  [].forEach.call(el.querySelectorAll('button'),function(b){b.onclick=function(){hchSend(b.getAttribute('data-q'));};});`,
  `  [].forEach.call(el.querySelectorAll('button'),function(b){b.onclick=function(){
    var q=b.getAttribute('data-q');
    if(/…$/.test(q)){var i=document.getElementById(_hch.area==='nutrition'?'co-in':'hch-in');if(i){i.value=q.replace(/…$/,'').replace(/\\s*$/,' ');i.focus();try{i.setSelectionRange(i.value.length,i.value.length);}catch(e){}rfmGrow&&rfmGrow(i);}return;}
    hchSend(q);};});`);
rep(`  for(i=0;i<t.length;i++)if(t[i].w==='u'||t[i].role==='user')said.push(t[i].x||t[i].text||'');`,
  `  for(i=0;i<t.length;i++)if(t[i].w==='u'||t[i].role==='user')said.push(t[i].x||t[i].text||'');
  list=list.filter(function(q){return !(started&&/…$/.test(q))||true;});`);

/* sending: everything but nutrition goes to /act */
rep(`  hchPush(k,{w:'u',x:q});
  if(/[?？؟]\\s*$/.test(q)){hchMip(k);return;}
  hchRoute(k,q);
}`, `  hchPush(k,{w:'u',x:q});
  hchAct(k);
}`);
cut(`function hchRoute(k,q){`, `/* entering an area: its tile lifts to the top as one piece, the others leave`, `/* ── the chat that does: /act ──
   The model reads through the phone and proposes writes; every write is a
   card here, and nothing is written until the person presses add. */
function hchToday(d){
  var t=todayStr();
  if(!d||d==='today')return t;
  if(d==='tomorrow')return dayShift(1);
  if(d==='yesterday')return dayShift(-1);
  return /^\\d{4}-\\d{2}-\\d{2}$/.test(d)?d:t;
}
function hchKg(v,u){var w=parseFloat(v);if(!(w>=0))return null;return Math.round((u==='lb'?w*0.45359237:w)*100)/100;}
function hchFind(list,name){
  var n=String(name||'').trim().toLowerCase(),i;
  for(i=0;i<list.length;i++)if(String(list[i]).toLowerCase()===n)return list[i];
  return null;
}
var HCH_EVE_TEXT=['moment','quote','takeawayForTomorrow','grateful','impactfulMoment','proudOf','recurringThought'];
var HCH_READ={
  get_plan:function(a){
    var d=hchToday(a.date),dp=loadDPlan(d);
    return {date:d,items:(dp.items||[]).map(function(it){
      var h=it.h!=null?it.h:dp.hours&&dp.hours[it.id],m=it.mn!=null?it.mn:(dp.mins&&dp.mins[it.id])||0;
      return {text:it.w,time:h!=null?hcmdTwo(h)+':'+hcmdTwo(m||0):null};})};
  },
  get_fitness:function(){
    var t=todayStr(),wp=loadWeekPlan(),week=[],i,pl=plannedWorkoutFor(t);
    for(i=0;i<7;i++){var e=wp['w0d'+i];week.push(e&&e.type&&e.type!=='rest'?(e.label||e.type):null);}
    var log=loadWorkoutLog().slice(-8).map(function(w){return {date:appDayOf(w.date),name:w.name,
      exercises:(w.exercises||[]).map(function(x){return {name:x.name,sets:(x.sets||[]).map(function(s){return {weight_kg:s.weight,reps:s.reps};})};})};});
    return {today:t,planned_today:pl?pl.label:null,week_plan_sun_to_sat:week,
      programs:loadTemplates().map(function(p){return {name:p.name,exercises:(p.exercises||[]).map(function(x){return x.name;})};}),
      recent_workouts:log,personal_records_kg:loadPRs(),working_weights_kg:loadExWeights(),units:APP_UNITS};
  },
  get_hobbies:function(){
    var L=loadHabitLog(),K=loadHabitKinds(),t=todayStr();
    return {hobbies:loadHabits().map(function(n){
      var wk=0,i;for(i=0;i<7;i++)wk+=hbMin(L[n+'__'+dayShift(-i)]);
      var k=K[n]||{};
      return {name:n,tracked_as:hbKind(n),today:hbMin(L[n+'__'+t]),last_7_days:wk,target:k.tg||k.goal||null,target_per:k.per||null,unit:k.unit||null};})};
  },
  get_people:function(){
    var P=loadPeople(),od=pplOverdue(P).map(function(o){return o.i;}),t=todayStr();
    return {people:P.map(function(p,i){
      var soon=(p.importantDates||[]).filter(function(x){if(!x.date)return false;var d=x.date;if(x.yearly)d=t.slice(0,4)+d.slice(4);if(d<t&&x.yearly)d=(+t.slice(0,4)+1)+x.date.slice(4);
        var n=Math.round((new Date(d+'T12:00:00')-new Date(t+'T12:00:00'))/864e5);return n>=0&&n<=14;}).map(function(x){return {title:x.title,date:x.date};});
      return {name:p.name,relationship:p.relationship||'',contact_every:p.contactFreq||'none',days_since_contact:daysSince(p.lastContact),
        overdue:od.indexOf(i)>=0,dates_next_14_days:soon,
        recent_notes:(p.memories||[]).filter(function(m){return m.content;}).slice(-3).map(function(m){return m.content;})};})};
  },
  get_closet:function(){
    var C=loadCloset(),W=closetWearCounts(),per={},un=0,i;
    for(i=0;i<C.length;i++){per[C[i].cat]=(per[C[i].cat]||0)+1;if(!W[C[i].id])un++;}
    return {garments_per_category:per,saved_looks:loadOutfits().length,worn_marked_today:!!closetWornOn(todayStr()),not_worn_30_days:un};
  },
  get_insights:function(){
    var D=loadInsights();
    return {topics:INSIGHTS_CATS.map(function(c){var n=0,k;for(k in D)if(k.indexOf(c.id+'__')===0)n+=(D[k]||[]).length;
      return {id:c.id,title:c.title,questions:c.questions,answers_written:n};})};
  },
  get_evening:function(){
    var t=todayStr(),r=loadSummary(t)||{},on=rfNightly().on,all=RF_STAGE1.concat(RF_STAGE2);
    return {questions:on.map(function(id){var q=null,i;for(i=0;i<all.length;i++)if(all[i].id===id)q=all[i];
      return {id:id,question:q?(q.q||((q.t||'')+(q.s?' - '+q.s:''))):id,kind:q?q.kind:'',answered:r[id]!=null&&r[id]!==''};}),
      finished:sumDone(t)};
  }
};
/* a write the model proposed, as the card's words: [question, detail] */
function hchActCard(a){
  var x=a.input||{},ar=function(id){var d=areaDef(id);return d?d.title:'';};
  var q=function(id){return _t('לשמור ב{area}?',{area:ar(id)});};
  if(a.name==='add_task')return [hcmdQuestion({intent:'task',date:hchToday(x.date),time:x.time}).q,esc(x.text||'')+(x.time?' &middot; '+esc(x.time):'')];
  if(a.name==='add_water')return [hcmdQuestion({intent:'water',amount:x.ml}).q,''];
  if(a.name==='add_steps')return [hcmdQuestion({intent:'steps',amount:x.steps}).q,''];
  if(a.name==='person_note')return [hcmdQuestion({intent:'person_note',person:x.person}).q,esc(x.text||'')];
  if(a.name==='add_moment')return [hcmdQuestion({intent:'moment'}).q,esc(x.text||'')];
  if(a.name==='add_journal')return [hcmdQuestion({intent:'journal'}).q,esc(x.text||'')];
  if(a.name==='log_set'){var kg=hchKg(x.weight,x.unit);
    return [q('fitness'),esc(x.exercise||'')+' &middot; '+_t('{n} סטים',{n:+x.sets||0})+' &middot; '+_t('{n} חזרות',{n:+x.reps||0})+(kg?' &middot; '+fmtWeight(kg):'')];}
  if(a.name==='weigh_in')return [q('nutrition'),fmtWeight(hchKg(x.weight,x.unit))];
  if(a.name==='hobby_log'){var k=hbKind(x.hobby);
    return [q('hobbies'),esc(x.hobby||'')+(k==='done'?'':' &middot; '+(k==='time'?_t('{n} דקות',{n:+x.amount||0}):nfmt(+x.amount||0)))];}
  if(a.name==='log_contact')return [q('people'),esc(x.person||'')+' &middot; '+esc(contactLabel({message:0,call:1,meeting:2,video:3,other:4}[x.via]||0)||'')];
  if(a.name==='save_insight'){var c=null,i;for(i=0;i<INSIGHTS_CATS.length;i++)if(INSIGHTS_CATS[i].id===x.topic)c=INSIGHTS_CATS[i];
    return [q('insights'),(c?esc(c.title)+(c.questions[x.question]?' &middot; '+esc(c.questions[x.question]):''):'')+'<br>'+esc(x.text||'')];}
  if(a.name==='evening_answer')return [q('endofday'),esc(x.text||'')+(x.artist?' &middot; '+esc(x.artist):'')];
  return ['',''];
}
/* writes it, the way the screen would. Returns {area, person?, wh} or null. */
function hchActWrite(a){
  var x=a.input||{},t=todayStr(),i,w;
  if(a.name==='add_task'){w=hcmdWrite('task',{date:hchToday(x.date),time:/^\\d{1,2}:\\d{2}$/.test(x.time||'')?x.time:''},String(x.text||'').trim());return w&&{area:w.area,wh:''};}
  if(a.name==='add_water'){w=hcmdWrite('water',{amount:Math.round(+x.ml)},'');return w&&{area:w.area};}
  if(a.name==='add_steps'){w=hcmdWrite('steps',{amount:Math.round(+x.steps)},'');return w&&{area:w.area};}
  if(a.name==='person_note'){w=hcmdWrite('person_note',{person:x.person},String(x.text||'').trim());return w&&{area:w.area,person:w.person};}
  if(a.name==='add_moment'){w=hcmdWrite('moment',{},String(x.text||'').trim());return w&&{area:w.area};}
  if(a.name==='add_journal'){w=hcmdWrite('journal',{},String(x.text||'').trim());return w&&{area:w.area};}
  if(a.name==='weigh_in'){return logWeight(hchKg(x.weight,x.unit),t)?{area:'nutrition'}:null;}
  if(a.name==='log_set'){
    var kg=hchKg(x.weight,x.unit),sets=Math.round(+x.sets),reps=Math.round(+x.reps),name=String(x.exercise||'').trim();
    if(!name||!(sets>0&&sets<=50)||!(reps>0&&reps<=200)||kg===null)return null;
    /* one workout per day for what is logged here, in fit_log like any other */
    var L=loadWorkoutLog(),e=null;
    for(i=L.length-1;i>=0;i--)if(L[i].chat&&appDayOf(L[i].date)===t){e=L[i];break;}
    if(!e){var pl=plannedWorkoutFor(t);e={date:Date.now(),name:pl?pl.label:_t('אימון'),duration:0,exercises:[],chat:true};L.push(e);}
    var ex=null;for(i=0;i<e.exercises.length;i++)if(e.exercises[i].name===name)ex=e.exercises[i];
    if(!ex){ex={name:name,targetSets:sets,targetReps:reps,sets:[],warm:[]};e.exercises.push(ex);}
    for(i=0;i<sets;i++)ex.sets.push({weight:kg,reps:reps,rpe:null});
    saveWorkoutLog(L);
    var P=loadPRs();if(kg>0&&!(P[name]>=kg)){P[name]=kg;savePRs(P);}
    return {area:'fitness'};
  }
  if(a.name==='hobby_log'){
    var h=hchFind(loadHabits(),x.hobby);if(!h)return null;
    var k=hbKind(h),Lg=loadHabitLog(),key=h+'__'+t,v=+x.amount;
    if(k==='done')Lg[key]=1;
    else if(k==='count'){if(!(v>0))return null;Lg[key]=hbMin(Lg[key])+Math.round(v);}
    else{if(!(v>0))return null;Lg[key]=Math.min(1440,hbMin(Lg[key])+Math.round(v));}
    saveHabitLog(Lg);return {area:'hobbies'};
  }
  if(a.name==='log_contact'){
    var Pp=loadPeople(),pi=-1;for(i=0;i<Pp.length;i++)if(Pp[i]&&String(Pp[i].name).toLowerCase()===String(x.person||'').trim().toLowerCase()){pi=i;break;}
    if(pi<0)return null;
    var via={message:0,call:1,meeting:2,video:3,other:4}[x.via];if(via==null)via=4;
    Pp[pi].lastContact=Date.now();if(!Pp[pi].memories)Pp[pi].memories=[];
    Pp[pi].memories.push({id:Date.now()+'',content:'',via:via,type:'conversation',date:Date.now(),pinned:false});
    savePeople(Pp);return {area:'people',person:pi};
  }
  if(a.name==='save_insight'){
    var c=null;for(i=0;i<INSIGHTS_CATS.length;i++)if(INSIGHTS_CATS[i].id===x.topic)c=INSIGHTS_CATS[i];
    var qi=Math.round(+x.question),txt=String(x.text||'').trim();
    if(!c||!(qi>=0&&qi<c.questions.length)||!txt)return null;
    var D=loadInsights(),ik=c.id+'__'+qi;(D[ik]=D[ik]||[]).push({text:txt,date:Date.now(),changedFrom:null,changedWhy:null});saveInsights(D);
    return {area:'insights'};
  }
  if(a.name==='evening_answer'){
    var id=String(x.question||''),tx=String(x.text||'').trim(),r=loadSummary(t)||{date:t,createdAt:new Date().toISOString()};
    if(!tx)return null;
    if(id==='song'){r.song=tx;r.songArtist=String(x.artist||'').trim();}
    else if(HCH_EVE_TEXT.indexOf(id)>=0)r[id]=tx;
    else return null;
    r.date=t;r.updatedAt=new Date().toISOString();saveSummary(t,r);
    return {area:'endofday'};
  }
  return null;
}
function hchAct(k){
  if(!SYNC_SERVER){hchPush(k,{w:'b',x:_t('אין חיבור כרגע.')});hchFill();return;}
  var t=hchThread(k),msgs=[],i;
  for(i=0;i<t.length;i++){if(t[i].w==='u')msgs.push({role:'user',content:t[i].x});else if(t[i].x)msgs.push({role:'assistant',content:t[i].x});}
  msgs=msgs.slice(-16);while(msgs.length&&msgs[0].role!=='user')msgs.shift();
  hchWait(true);
  foodsLoad(function(){hchActTurn(k,msgs,0,null);});
}
function hchActTurn(k,messages,depth,food){
  var done=function(text){
    _hch.busy=false;
    if(text)hchPush(k,{w:'b',x:text});
    if(food){hchPush(k,{w:'b',go:'nutrition'});if(_hch.area===k)hchFill();hchChoose('nutrition');setTimeout(function(){hchCoach(food);},500);return;}
    if(_hch.area===k)hchFill();
  };
  if(depth>=7){done(_t('לא הצלחתי לענות כרגע.'));return;}
  var now=new Date();
  fetch(SYNC_SERVER+'/act'+meterQ(),{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({messages:messages,lang:appLang(),place:k||'',name:greetName(),form:appGender(),today:todayStr(),
      now:hcmdTwo(now.getHours())+':'+hcmdTwo(now.getMinutes()),weekday:dfmt(new Date(todayStr()+'T12:00:00'),{weekday:'long'}),units:APP_UNITS})})
  .then(function(r){return r.json().then(function(j){return {s:r.status,j:j};},function(){return {s:r.status,j:null};});})
  .then(function(x){
    var j=x.j;
    if(x.s===429||(j&&j.error==='too many for today')){done(_t('הגעת למגבלה של היום.'));return;}
    if(!j||!j.ok){done(_t('לא הצלחתי לענות כרגע.'));return;}
    var content=j.content||[],uses=[],text='',i;
    for(i=0;i<content.length;i++){if(content[i].type==='text')text+=content[i].text;else if(content[i].type==='tool_use')uses.push(content[i]);}
    if(!uses.length){done(text.trim());return;}
    var results=[];
    for(i=0;i<uses.length;i++){
      var u=uses[i],val;
      try{
        if(HCH_READ[u.name])val=HCH_READ[u.name](u.input||{});
        else if(ASK_TOOLS[u.name])val=ASK_TOOLS[u.name](u.input||{});
        else if(u.name==='log_food'){food=String((u.input||{}).text||'').trim()||food;val={status:'handed to the nutrition coach, who will log it and may ask a question'};}
        else if(hchActCard({name:u.name,input:u.input||{}})[0]){hchPush(k,{w:'b',act:{name:u.name,input:u.input||{}}});val={status:'shown to the person as a card to confirm'};}
        else val={error:'unknown tool'};
      }catch(e){val={error:'could not read that'};}
      results.push({type:'tool_result',tool_use_id:u.id,content:JSON.stringify(val)});
    }
    if(_hch.area===k){var tk=document.getElementById('hch-talk');if(tk){tk.innerHTML=hchThreadHTML(k);tk.scrollTop=tk.scrollHeight;}}
    hchActTurn(k,messages.concat([{role:'assistant',content:content},{role:'user',content:results}]),depth+1,food);
  })
  .catch(function(){done(_t('אין חיבור כרגע.'));});
}
`);

/* the act card in the talk, and its add */
rep(`  if(!m.r)return '';
  var Q=hcmdQuestion(m.r);`, `  if(m.act){
    var C=hchActCard(m.act);
    return '<div class="hch-card"><div>'+C[0]+'</div>'+(C[1]?'<small>'+C[1]+'</small>':'')+
      '<div class="btns"><button onclick="hchActApply('+i+')">'+_t('הוסף')+'</button><button class="ghost" onclick="hchDrop('+i+')">'+_t('ביטול')+'</button></div></div>';
  }
  if(!m.r)return '';
  var Q=hcmdQuestion(m.r);`);
rep(`function hchDrop(i){`, `function hchActApply(i){
  var k=_hch.area,m=hchThread(k)[i];if(!m||!m.act)return;
  var C=hchActCard(m.act),w=hchActWrite(m.act);
  if(!w){showToast(_t('משהו השתבש. אפשר לנסות שוב.'));return;}
  hchPut(k,i,{w:'b',done:w,wh:C[1]});
  try{renderHomeToday();}catch(err){}
  hchFill();
}
function hchDrop(i){`);
/* the general chat's greeting line was Mip's; Mip's own lines stay his */
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
