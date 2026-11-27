/* כושר as a week (Asaf approved the review page, 27 Nov): the other training is asked, the plan
 * is seven days that say what happens on each, saving puts it in the schedule, the top of כושר
 * starts today's plan day in one tap, and the plan screen is read and started rather than logged
 * in, with no red objections to itself. Run: node tools/patches/fit-week.mjs [file] [--reverse]
 */
import fs from 'node:fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  // the other training is asked right after how many times a week, which is now the total
  [String.raw`    if(!(+o.days>0))out.push('days');if(!(+o.minutes>0))out.push('minutes');`,
   String.raw`    if(!(+o.days>0))out.push('days');if(!o.otherDone)out.push('other','otherN');if(!(+o.minutes>0))out.push('minutes');`],
  [String.raw`function asetSkip(k){var t=_aset.t;if(k==='hack'`,
   String.raw`function asetSkip(k){var t=_aset.t;if(k==='otherN')return !t.other.length||t.other.indexOf('none')>=0||t.days<2;if(k==='hack'`],
  [String.raw`equip:genEquip(),limits:(o.limits||[]).slice()}};`,
   String.raw`equip:genEquip(),limits:(o.limits||[]).slice(),other:(o.other||[]).slice(),otherN:+o.otherN||0}};`],
  [String.raw`if(multi){var l=t[f],j=l.indexOf(v);if(f==='limits'&&v==='none')l.splice(0,l.length);else if(f==='limits')l=t[f]=l.filter(function(x){return x!=='none';});`,
   String.raw`if(multi){var l=t[f],j=l.indexOf(v),ex=f==='limits'||f==='other';if(ex&&v==='none')l.splice(0,l.length);else if(ex)l=t[f]=l.filter(function(x){return x!=='none';});`],
  [String.raw`if(k==='exp')return !!t.exp;if(k==='equip')`,
   String.raw`if(k==='other')return t.other.length>0;if(k==='otherN')return t.otherN>0&&t.otherN<t.days;if(k==='exp')return !!t.exp;if(k==='equip')`],
  [String.raw`  if(k==='minutes'){q=fitMeQuestion('minutes');`,
   String.raw`  if(k==='other'){q=_t('אתה עושה כבר אימונים אחרים?');why=_t('חוץ מאימוני כוח. נשמור להם ימים בשבוע, והתוכנית תיבנה סביבם.');
    body='<div class="as-grid">';for(i=0;i<FIT_OTHER.length;i++)body+=asetChoice('other',FIT_OTHER[i],esc(wtLabel(FIT_OTHER[i])),'',1);
    body+=asetChoice('other','none',_t('לא'),'',1)+'</div>';}
  if(k==='otherN'){q=_t('כמה מהם בשבוע?');why=_t('השאר יהיו אימוני כוח.');
    body='<div class="as-grid">';for(i=1;i<t.days;i++)body+=asetChoice('otherN',i,nfmt(i));body+='</div>';}
  if(k==='minutes'){q=fitMeQuestion('minutes');`],
  [String.raw`    if(t.days)o.days=t.days;if(t.minutes)o.minutes=t.minutes;`,
   String.raw`    if(t.days)o.days=t.days;if(t.minutes)o.minutes=t.minutes;
    if(_aset.steps.indexOf('other')>=0){o.other=t.other.filter(function(x){return x!=='none';});   // i18n-exempt: a stored key
      o.otherN=o.other.length&&t.days>1?Math.max(1,Math.min(t.otherN||1,t.days-1)):0;o.otherDone=1;}`],
  [String.raw`/* ── THE DOOR TO כושר ──`,
   String.raw`/* ── THE WEEK, NOT A DAY (Asaf, 27 Nov) ──
   A tester trains Pilates and answered "five a week": the app built five strength sessions and
   ignored the Pilates, then showed one day of exercises with nothing saying which days. Now the
   other training is asked, strength takes the days it leaves, and the plan is a week - seven days,
   each saying what happens on it, spread so strength days touch as little as they can. The ids are
   WORKOUT_TYPES', so every label is already in every language. Saved, the week goes into the same
   schedule לוז האימונים shows, and today's plan day starts from the top of כושר in one tap. */
var FIT_OTHER=['pilates','yoga','cardio','swim','cycle','sport','other'];   // i18n-exempt: WORKOUT_TYPES ids, drawn through wtLabel
function wtLabel(id){var t=(WORKOUT_TYPES||[]).filter(function(x){return x.id===id;})[0];return t?t.label:'';}
function fitStrengthDays(me){me=me||fitMe();var d=+me.days||3,o=(me.other||[]).length?(+me.otherN||0):0;return Math.max(1,d-o);}
/* the weekdays (0 = Sunday) a week of n sessions lands on */
var fitWeekSlots=[[],[1],[1,4],[0,2,4],[0,1,3,4],[0,1,2,4,5],[0,1,2,3,4,5]];
function fitWeekFor(p,me){
  me=me||fitMe();
  var d=Math.max(1,Math.min(6,+me.days||3)),S=Math.min(d,fitStrengthDays(me)),oth=me.other||[],slots=fitWeekSlots[d],
      wk=[],isS={},days=[],i,si=0,oi=0;
  for(i=0;i<p.exercises.length;i++)if(days.indexOf(p.exercises[i].day||'')<0)days.push(p.exercises[i].day||'');
  for(i=0;i<7;i++)wk.push({type:'rest'});
  for(i=0;i<S;i++)isS[Math.floor(i*d/S)]=1;
  for(i=0;i<slots.length;i++){
    if(isS[i]){wk[slots[i]]={type:'strength',label:'',prog:p.id,pday:days[si%days.length]};si++;}
    else if(oth.length){wk[slots[i]]={type:oth[oi%oth.length],label:''};oi++;}
  }
  return wk;
}
function fitWeekName(e){return !e||e.type==='rest'?_t('מנוחה'):e.type==='strength'?fitPlanName(e):wtLabel(e.type);}
/* a day's name fits its seventh of the width: the longest word shrinks a little rather than break
   in the middle (Ganzkörper did) - and below that, hyphens:auto breaks it where the language does */
function fitWkPx(label){
  var w=0;String(label).split(/s+/).forEach(function(x){w=Math.max(w,homeTextW(x,10,700));});
  return w>40?Math.max(8,Math.floor(400/w*10)/10):10;
}
function fitWeekRowHTML(wk,edit){
  var h='<div class="fwk">',i,e,tag=edit?'button':'div';
  for(i=0;i<7;i++){
    e=wk[i]||{type:'rest'};
    h+='<'+tag+(edit?' onclick="fitWeekPick('+i+')"':'')+' class="fwk-d '+(e.type==='strength'?'s':e.type==='rest'?'r':'o')+'">'+
       '<b>'+esc(dfmt(dayShift(i-appNow().getDay())+'T12:00:00',{weekday:'narrow'}))+'</b><span style="font-size:'+fitWkPx(fitWeekName(e))+'px">'+esc(fitWeekName(e))+'</span></'+tag+'>';
  }
  return h+'</div>'+(edit?'<div class="gn-s fwk-h">'+_t('לחיצה על יום מחליפה מה עושים בו.')+'</div>':'');
}
/* a day of the week being drawn, changed: the plan's own days, her other training, or rest */
function fitWeekPick(i){
  if(!_fitW||!_fitW.week)return;
  var P=fitWPlan(),days=[],opts=[],j,h;
  for(j=0;j<P.exercises.length;j++)if(days.indexOf(P.exercises[j].day||'')<0)days.push(P.exercises[j].day||'');
  days.forEach(function(dk){opts.push({type:'strength',label:'',prog:P.id,pday:dk});});
  (fitMe().other||[]).forEach(function(t){opts.push({type:t,label:''});});
  opts.push({type:'rest'});
  _fitW.pick=opts;fitSheetClose();
  var ov=document.createElement('div');ov.className='cf-ov fss-ov';ov.id='fss-ov';
  h='<div class="cf-card fss"><div class="cf-q" style="margin-bottom:12px">'+esc(dfmt(dayShift(i-appNow().getDay())+'T12:00:00',{weekday:'long'}))+'</div><div class="fss-l">';
  for(j=0;j<opts.length;j++)h+='<button onclick="fitWeekSet('+i+','+j+')"><b>'+esc(fitWeekName(opts[j]))+'</b></button>';
  h+='</div><button class="cf-no" style="width:100%;margin-top:12px" onclick="fitSheetClose()">'+esc(_t('ביטול'))+'</button></div>';
  ov.innerHTML=h;document.body.appendChild(ov);
  ov.onclick=function(ev){if(ev.target===ov)fitSheetClose();};
}
function fitWeekSet(i,j){if(!_fitW||!_fitW.pick||!_fitW.week)return;_fitW.week[i]=_fitW.pick[j];fitSheetClose();renderFitness();}
function fitWeekWrite(wk){
  var p=loadWeekPlan(),i;
  for(i=0;i<7;i++)p['w0d'+i]=(wk[i]&&wk[i].type!=='rest')?wk[i]:{type:'rest',label:'',note:''};
  saveWeekPlan(p);
}
/* today's plan day, if the schedule names one of a saved plan's days */
function fitTodayProg(){
  var tp=fitTodayPlan();if(!tp||!tp.prog)return null;
  var ps=loadPrograms(),pi,j,days,d=tp.pday||'';
  for(pi=0;pi<ps.length;pi++)if(ps[pi].id===tp.prog){
    days=[];for(j=0;j<ps[pi].exercises.length;j++)if(days.indexOf(ps[pi].exercises[j].day||'')<0)days.push(ps[pi].exercises[j].day||'');
    return {pi:pi,di:Math.max(0,days.indexOf(d)),n:ps[pi].exercises.filter(function(x){return (x.day||'')===d;}).length};
  }
  return null;
}

/* ── THE DOOR TO כושר ──`],
  // strength gets the days the other training leaves
  [String.raw`  var me=fitMe();
  var p=genProgram({days:+me.days||3,exp:me.exp||'new',minutes:+me.minutes||60,
                    goal:fitGoal().v,equip:GEN_EQUIP[genEquip()]||GEN_EQUIP.gym});
  if(_fitW)_fitW.plan=p;`,
   String.raw`  var me=fitMe();
  var p=genProgram({days:fitStrengthDays(me),exp:me.exp||'new',minutes:+me.minutes||60,
                    goal:fitGoal().v,equip:GEN_EQUIP[genEquip()]||GEN_EQUIP.gym});
  if(_fitW){_fitW.plan=p;_fitW.week=fitWeekFor(p,me);}`],
  [String.raw`  if(!p){var me=fitMe();p=genProgram({days:+me.days||3,exp:me.exp||'new',`,
   String.raw`  if(!p){var me=fitMe();p=genProgram({days:fitStrengthDays(me),exp:me.exp||'new',`],
  // saved, the week goes into the schedule and she lands where today's workout starts
  [String.raw`  var progs=loadPrograms();progs.push(p);savePrograms(progs);
  _fitProgIdx=progs.length-1;_fitW=null;
  showToast('&#10003; '+_t('התוכנית נבנתה'));
  _fitView='view-program';renderFitness();`,
   String.raw`  var progs=loadPrograms();progs.push(p);savePrograms(progs);
  fitWeekWrite((_fitW&&_fitW.week)||fitWeekFor(p));
  _fitProgIdx=progs.length-1;_fitW=null;
  showToast('&#10003; '+_t('התוכנית נבנתה'));
  _fitView='home';renderFitness();`],
  [String.raw`  var per=dn?Math.round(tot*((+me.days||3)/dn)/6):0;`,
   String.raw`  var per=dn?Math.round(tot*(fitStrengthDays(me)/dn)/6):0;`],
  [String.raw`  h+='<div class="fw-tiles">'+
    tile(nfmt(+me.days||3),_t('אימונים בשבוע'))+
    tile(nfmt(fitWPerSession(fitWPlan())),_t('סטים באימון'))+
    tile(nfmt(g.lo)+'–'+nfmt(g.hi),_t('טווח חזרות'))+
    tile(_t('{n} שניות',{n:g.rest}),_t('מנוחה בין סטים'))+
    tile('RPE '+(GENPROG_RPE[me.exp]||'6–8'),_t('קושי'))+
    (loadable?tile(fmtWeight(g.step),_t('קפיצת משקל')):tile(_t('חזרות וקושי'),_t('איך עולים')))+
    '</div>';
  h+='<div class="gn-s" style="margin:12px 0 0;font-size:13px">'+_t('כל שריר חוזר כל {lo}–{hi} שעות',{lo:I.lo,hi:I.hi})+'</div>';`,
   String.raw`  /* THREE NUMBERS SHE CAN USE (27 Nov): RPE, a weight step and "every 96-120 hours" were the
     notebook talking to itself. How often, how long, how many. */
  var P=fitWPlan(),per={},mx=0,k;
  for(k=0;k<P.exercises.length;k++)per[P.exercises[k].day||'']=(per[P.exercises[k].day||'']||0)+1;
  for(k in per)if(per.hasOwnProperty(k)&&per[k]>mx)mx=per[k];
  h+='<div class="fw-tiles fw-3">'+
    tile(nfmt(+me.days||3),_t('אימונים בשבוע'))+
    tile(_t('{n} דקות',{n:+me.minutes||60}),_t('לכל אימון'))+
    tile(nfmt(mx),_t('תרגילים באימון'))+
    '</div>';`],
  [String.raw`  var sp=progSplitFor(+me.days||3,me.exp||'new'),I=PROG_SPLITS[sp],names=[];`,
   String.raw`  var sp=progSplitFor(fitStrengthDays(me),me.exp||'new'),I=PROG_SPLITS[sp],names=[];`],
  // the summary opens on the week itself
  [String.raw`    h+='<div class="fw-sum-s">'+esc(names.join(' \u00b7 '))+'</div>';
    /* why THIS split, in the one case where it is not obvious from the chips */
    if(progSplitFor(+me.days||3,'adv')!==sp)`,
   String.raw`    fitWPlan();
    h+=fitWeekRowHTML(_fitW.week,1);
    /* why THIS split, in the one case where it is not obvious from the chips */
    if(progSplitFor(fitStrengthDays(me),'adv')!==sp)`],
  [String.raw`  h+='<div class="gn-s">'+_t('{n} חזרות',{n:(P.exercises[0]||{}).targetReps||0})+' \u00b7 '+
     _t('{n} שניות',{n:(P.exercises[0]||{}).rest||0})+'</div>';
  h+='</div>';`,
   String.raw`  h+=fitWeekRowHTML(_fitW.week||fitWeekFor(P),1);
  h+='</div>';`],
  [String.raw`function fitPlanName(e){
  if(!e)return '';
  if(e.label)return e.label;`,
   String.raw`function fitPlanName(e){
  if(!e)return '';
  if(e.label)return e.label;
  /* a plan's day is named from the plan, in the reader's language, never stored as words */
  if(e.prog){var P0=loadPrograms().filter(function(x){return x.id===e.prog;})[0];
    return progDayLabel(e.pday||'')||(P0?progLabel(P0.name):'')||wtLabel('strength');}`],
  // the top of כושר says what today is and starts it
  [String.raw`  var tp=fitTodayPlan();
  if(tp)when=esc(_t('היום לפי הלוז: {name}',{name:fitPlanName(tp)}));
  return '<button class="fh" onclick="fitStartSheet()" style="background:'+gr[0]+'">'+
    '<div class="fh-ic"><svg viewBox="0 0 24 24" style="stroke:'+gr[1]+'">'+a.ic+'</svg></div>'+
    '<div class="fh-t">'+a.t+'</div>'+`,
   String.raw`  var tp=fitTodayPlan(),tg=fitTodayProg(),go='fitStartSheet()',title=a.t;
  if(tp)when=esc(_t('היום לפי הלוז: {name}',{name:fitPlanName(tp)}));
  /* a plan day starts in one tap: its exercises, straight into the guided workout */
  if(tg){title=_t('האימון של היום');when=esc(fitPlanName(tp))+' \u00b7 '+_t('{n} תרגילים',{n:tg.n});go='fitProgStart('+tg.pi+','+tg.di+',1)';}
  return '<button class="fh" onclick="'+go+'" style="background:'+gr[0]+'">'+
    '<div class="fh-ic"><svg viewBox="0 0 24 24" style="stroke:'+gr[1]+'">'+a.ic+'</svg></div>'+
    '<div class="fh-t">'+title+'</div>'+`],
  // the plan screen: read it, start a day
  [String.raw`function renderViewProgram(){
  var progs=loadPrograms();
  var prog=progs[_fitProgIdx];if(!prog){_fitView='home';renderFitness();return;}

  var h='<div style="padding-bottom:20px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">';
  h+='<div style="font-size:16px;font-weight:800;color:var(--ink)">'+esc(progLabel(prog.name))+'</div>';
  h+='<button class="fit-back" onclick="_fitView=\'home\';renderFitness()">&#8249; '+_t('חזרה')+'</button>';
  h+='</div>';

  /* "בדוק את האימון שלי" - the same notebook reading, asked of a plan that
     already exists rather than of one being typed. PER DAY, because a
     programme is a week and summing the week into one session would quote a
     ceiling against a number that was never a session's. */
  var advDays={},advOrder=[],aek,aex;
  for(aek=0;aek<prog.exercises.length;aek++){
    aex=prog.exercises[aek];
    var ad=aex.day||'';
    if(!advDays.hasOwnProperty(ad)){advDays[ad]=[];advOrder.push(ad);}
    advDays[ad].push({name:aex.name,sets:aex.sets,reps:aex.targetReps});
  }
  /* HOW OFTEN THIS DAY COMES ROUND. The cycle repeats to fill the week, so a
     two-day cycle trained four times a week is each day twice - which is what
     turns a session's sets into the week's, and the week is the number the
     notebook's 10-20 is about. */
  var advPer=advOrder.length?((+prog.daysPerWeek||advOrder.length)/advOrder.length):0;
  var advWeeks=(typeof progWeekNum==='function')?progWeekNum(prog):0;
  for(aek=0;aek<advOrder.length;aek++)
    h+=progAdviceHTML(advDays[advOrder[aek]],
                      advOrder[aek]?progDayLabel(advOrder[aek]):'',
                      {perWeek:advPer,weeks:advWeeks});

  for(var ei=0;ei<prog.exercises.length;ei++){
    var ex=prog.exercises[ei];
    var exLog=loadProgLog(prog.id,ex.name);
    var lastEntry=exLog.length>0?exLog[exLog.length-1]:null;
    var pr=exLog.length>0?Math.max.apply(null,exLog.map(function(e){return e.weight;})):0;

    h+='<div style="background:var(--card);border-radius:18px;padding:14px;margin-bottom:12px;box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)">';
    // Exercise header
    h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">';
    h+='<div><div style="font-size:14px;font-weight:800;color:var(--ink)">'+esc(exLabel(ex.name))+'</div>';
    h+='<div style="font-size:10px;color:var(--muted);margin-top:2px">'+_t('{n} סטים',{n:ex.sets})+' &times; '+_t('{n} חזר',{n:ex.targetReps})+'</div></div>';
    if(pr>0)h+='<div style="background:linear-gradient(135deg,#fef9e7,#fef3c7);border-radius:10px;padding:6px 10px;text-align:center"><div style="font-size:14px;font-weight:800;color:#b45309">'+fmtWeight(pr)+'</div><div style="font-size:8px;color:#b45309;font-weight:700">PR</div></div>';
    h+='</div>';

    // Last entry
    if(lastEntry){
      var dd=new Date(lastEntry.date);
      h+='<div style="background:var(--surface);border-radius:10px;padding:8px 12px;margin-bottom:10px;font-size:11px;color:var(--ink-soft)">';
      h+=''+_t('אחרון:')+' '+fmtWeight(lastEntry.weight)+' &times; '+_t('{n} חזר',{n:lastEntry.reps})+' &mdash; '+fmtDayShort(dd);
      h+='</div>';
    }

    // Log new entry
    h+='<div style="display:flex;gap:6px;align-items:center">';
    h+='<div style="flex:1"><div class="fw-fl">'+weightUnit()+'</div>';
    h+='<input id="prog-w-'+ei+'" class="mtnm" type="number" step="0.5" placeholder="'+nfmt(edWeightVal(lastEntry?lastEntry.weight:ex.baseWeight||0))+'" style="width:100%"></div>';
    h+='<div style="flex:1"><div class="fw-fl">'+_t('חזרות')+'</div>';
    h+='<input id="prog-r-'+ei+'" class="mtnm" type="number" placeholder="'+nfmt(ex.targetReps)+'" style="width:100%"></div>';
    h+='<button onclick="logProgEntry('+_fitProgIdx+','+ei+')" style="background:var(--cta-fill);border:none;border-radius:10px;padding:9px 14px;font-size:13px;font-weight:700;cursor:pointer;color:var(--white);align-self:flex-end">'+_t('רשום')+'</button>';
    h+='</div>';

    // Mini history chart
    if(exLog.length>1){
      var recent=exLog.slice(-8);
      var maxW=Math.max.apply(null,recent.map(function(e){return e.weight;}));
      var minW=Math.max(0,Math.min.apply(null,recent.map(function(e){return e.weight;}))-5);
      var W=280,H=50,PL=0,PT=4,PB=14,cW=W,cH=H-PT-PB;
      var n=Math.max(recent.length-1,1);
      function xp(i){return PL+i*(cW/n);}
      function yp(v){return PT+cH*(1-(v-minW)/(maxW-minW||1));}
      var svg='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;display:block;margin-top:10px">';
      if(recent.length>1){
        var lp='M'+xp(0)+','+yp(recent[0].weight);
        for(var ri=1;ri<recent.length;ri++)lp+=' L'+xp(ri)+','+yp(recent[ri].weight);
        svg+='<path d="'+lp+'" fill="none" stroke="'+PAL.violet500+'" stroke-width="2" stroke-linecap="round"/>';
      }
      recent.forEach(function(e,ri){
        var isPR=e.weight>=pr;
        svg+='<circle cx="'+xp(ri)+'" cy="'+yp(e.weight)+'" r="'+(isPR?5:3)+'" fill="'+(isPR?PAL.amber500:PAL.violet500)+'" stroke="#fff" stroke-width="1.5"/>';
        svg+='<text x="'+xp(ri)+'" y="'+(H-1)+'" text-anchor="middle" font-size="8" fill="'+PAL.mutedSoft+'">'+e.weight+'</text>';
      });
      svg+='</svg>';
      h+=svg;
    }

    h+='</div>';
  }
  h+='</div>';
  document.getElementById('hdr-title').textContent=progLabel(prog.name);
  document.getElementById('content').innerHTML=h;
}

`,
   String.raw`function renderViewProgram(){
  var progs=loadPrograms();
  var prog=progs[_fitProgIdx];if(!prog){_fitView='home';renderFitness();return;}
  /* THE PLAN, TO READ AND TO START (Asaf, 27 Nov). It was a logging sheet: a weight box and a
     rep box under every exercise of every day, "0" and "9" in them, a "log" button, and above
     them in red the app's objections to the plan it had just built. A tester saved her plan and
     asked "what do I do now?". Each day is a card now - which weekdays it falls on, its
     exercises, and one button that starts it. The sets are logged in the workout. */
  var h='<div style="padding-bottom:20px">',order=[],by={},i,j,ex,d,k,e;
  h+='<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button class="fit-back" onclick="_fitView=\'home\';renderFitness()">&#8249; '+_t('חזרה')+'</button></div>';
  for(i=0;i<prog.exercises.length;i++){ex=prog.exercises[i];d=ex.day||'';if(!by.hasOwnProperty(d)){by[d]=[];order.push(d);}by[d].push(ex);}
  var wk=loadWeekPlan(),when={};
  for(k=0;k<7;k++){e=wk['w0d'+k];if(e&&e.prog===prog.id)(when[e.pday||'']=when[e.pday||'']||[]).push(k);}
  for(i=0;i<order.length;i++){
    d=order[i];
    h+='<div class="gn-c"><div class="gn-h">'+esc(progDayLabel(d)||progLabel(prog.name))+'</div>';
    if(when[d])h+='<div class="gn-s">'+esc(when[d].map(function(k){return dfmt(dayShift(k-appNow().getDay())+'T12:00:00',{weekday:'long'});}).join(' \u00b7 '))+'</div>';
    for(j=0;j<by[d].length;j++)
      h+='<div class="gn-s">'+esc(exLabel(by[d][j].name))+' \u00b7 '+_t('{n} סטים',{n:by[d][j].sets})+' &times; '+_t('{n} חזר',{n:by[d][j].targetReps})+'</div>';
    h+='<button class="gn-go" style="margin-top:12px" onclick="fitProgStart('+_fitProgIdx+','+i+',1)">'+_t('להתחיל')+'</button></div>';
  }
  document.getElementById('content').innerHTML=h+'</div>';
}

`],
  [String.raw`  _genProg={days:+me.days||3,minutes:+me.minutes||60,exp:me.exp||'new'};`,
   String.raw`  _genProg={days:+me.days||3,minutes:+me.minutes||60,exp:me.exp||'new',other:(me.other||[]).slice(),otherN:+me.otherN||0};`],
  [String.raw`function genProgSet(k,v){`,
   String.raw`function genProgOther(v){
  if(!_genProg)return;var l=_genProg.other,j=l.indexOf(v);
  if(j>=0)l.splice(j,1);else l.push(v);
  renderFitness();
}
function genProgSet(k,v){`],
  [String.raw`  h+='<div class="gn-c"><div class="gn-h">'+_t('כמה זמן יש לך לאימון')+'</div>';`,
   String.raw`  h+='<div class="gn-c"><div class="gn-h">'+_t('אתה עושה כבר אימונים אחרים?')+'</div>';
  h+='<div class="gn-s">'+_t('חוץ מאימוני כוח. נשמור להם ימים בשבוע, והתוכנית תיבנה סביבם.')+'</div><div class="gn-w">';
  for(i=0;i<FIT_OTHER.length;i++)
    h+='<button class="gn-e'+(g.other.indexOf(FIT_OTHER[i])>=0?' on':'')+'" onclick="genProgOther(\''+FIT_OTHER[i]+'\')">'+esc(wtLabel(FIT_OTHER[i]))+'</button>';
  h+='</div>';
  if(g.other.length&&g.days>1){
    h+='<div class="gn-h" style="margin-top:14px">'+_t('כמה מהם בשבוע?')+'</div><div class="gn-s">'+_t('השאר יהיו אימוני כוח.')+'</div><div class="gn-w">';
    for(i=1;i<g.days;i++)h+='<button class="gn-e'+((g.otherN||1)===i?' on':'')+'" onclick="genProgSet(\'otherN\','+i+')">'+nfmt(i)+'</button>';
    h+='</div>';
  }
  h+='</div>';
  h+='<div class="gn-c"><div class="gn-h">'+_t('כמה זמן יש לך לאימון')+'</div>';`],
  [String.raw`  var key=progSplitFor(g.days,g.exp),sp=PROG_SPLITS[key],names=[];`,
   String.raw`  var gS=g.days-(g.other.length&&g.days>1?Math.min(g.otherN||1,g.days-1):0);
  var key=progSplitFor(gS,g.exp),sp=PROG_SPLITS[key],names=[];`],
  [String.raw`  if(progSplitFor(g.days,'adv')!==key)`,
   String.raw`  if(progSplitFor(gS,'adv')!==key)`],
  [String.raw`  var p=genProgram({days:_genProg.days,exp:_genProg.exp,minutes:_genProg.minutes,`,
   String.raw`  var me0=fitMe(),g0=_genProg;
  me0.days=g0.days;me0.other=g0.other.slice();me0.otherN=g0.other.length&&g0.days>1?Math.max(1,Math.min(g0.otherN||1,g0.days-1)):0;me0.otherDone=1;
  var p=genProgram({days:fitStrengthDays(me0),exp:_genProg.exp,minutes:_genProg.minutes,`],
  [String.raw`  _genProg=null;
  showToast('&#10003; '+_t('התוכנית נבנתה'));
  _fitView='view-program';renderFitness();`,
   String.raw`  try{localStorage.setItem(FIT_ME_KEY,JSON.stringify(me0));}catch(e){}
  fitWeekWrite(fitWeekFor(p,me0));
  _genProg=null;
  showToast('&#10003; '+_t('התוכנית נבנתה'));
  _fitView='home';renderFitness();`],
  [String.raw`.fw-tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px}`,
   String.raw`.fw-tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fw-tiles.fw-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.fw-3 .fw-tile{padding:11px 10px}
.fw-3 .fw-tile b{font-size:17px;white-space:nowrap}
/* the week: seven days, each saying what happens on it */
.fwk{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px;margin:14px 0 4px}
.fwk-d{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 0 9px;border:0;border-radius:13px;font:inherit;
  color:var(--nu-ink,#4a453f);background:transparent;min-width:0;
  box-shadow:inset 2px 3px 6px var(--nu-shade-soft,rgba(168,160,148,.3)),inset -2px -2px 5px var(--nu-lit,rgba(255,255,255,.95))}
button.fwk-d{cursor:pointer}
.fwk-d b{font-size:12px;font-weight:800;color:var(--nu-muted,#6d675e)}
.fwk-d span{font-size:10px;font-weight:700;line-height:1.15;text-align:center;-webkit-hyphens:auto;hyphens:auto;overflow-wrap:break-word;max-width:100%}
.fwk-d.s{box-shadow:-3px -3px 7px var(--nu-lit,rgba(255,255,255,.95)),3px 4px 9px var(--nu-shade-soft,rgba(168,160,148,.3))}
.fwk-d.s span{color:var(--nu-ink,#4a453f)}
.fwk-d.r span{color:var(--nu-muted,#6d675e);font-weight:600}
.fwk-h{font-size:12.5px;margin-top:6px}`]
];

let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 200)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
