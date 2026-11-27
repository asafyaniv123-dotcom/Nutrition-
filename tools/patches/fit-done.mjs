/* The end of a workout, and the evening it lands in (Asaf approved the direction, 27 Nov - no
 * emoji: the faces are the ones סיום יום draws). The end-of-workout screen opens on well done,
 * three numbers, the good thing and how it felt, with the old tables behind "the full detail";
 * a guided workout saves itself when it ends; the day's page shows how it felt; and a workout
 * that was planned and not logged is asked about once in סיום יום, with "moved to tomorrow".
 * Run: node tools/patches/fit-done.mjs [file] [--reverse]
 */
import fs from 'node:fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  // the top of the screen: well done, three numbers, the good thing, how it felt
  [String.raw`  // Header
  h+='<div style="font-size:11px;color:#9A9184;margin-bottom:4px;font-weight:500">'+esc(entry.name)+' &middot; '+dateStr+'</div>';
  h+='<div style="font-size:20px;font-weight:800;color:var(--ink-strong);margin-bottom:16px">'+_t('איך הלך האימון?')+'</div>';

  // 4.1 Hero stats
  h+='<div style="display:flex;gap:10px;margin-bottom:16px">';
  [{num:nfmt(totalSets),lbl:''+_t('סטים',{n:totalSets})+''},{num:avgRPE!==null?nfmt(effortFromRPE(avgRPE)):''+_t('לא דורג')+'',lbl:(effortScale()==='rir'?_t('RIR ממוצע'):_t('RPE ממוצע'))},{num:nfmt(volDisp(totalVol)),lbl:''+_t('{u} נפח',{u:weightUnit()})+''}].forEach(function(s){
    h+='<div style="flex:1;background:var(--card);border-radius:20px;padding:14px 8px;text-align:center;box-shadow:0 2px 10px rgba(58,53,48,.06)">';
    h+='<div style="font-size:20px;font-weight:800;color:var(--ink-strong)">'+s.num+'</div>';
    h+='<div style="font-size:10px;color:#9A9184;margin-top:3px">'+s.lbl+'</div></div>';
  });
  h+='</div>';

  // 4.1b What it cost, approximately. It is an estimate and it says so.
  h+=fitBurnBandHTML(entry);

`,
   String.raw`  /* THE END OF A WORKOUT (Asaf approved the review page, 27 Nov). It opened on "how did the
     workout go?" over a table, RPE averages, a volume chart with zeros and "focus on technique"
     beside all six exercises - a coach's notebook, and nothing a person was glad to see. Now: well
     done, three numbers anyone reads, the one good thing that happened, how it felt, what goes up
     next time. Everything that was here still is, behind "the full detail". */
  var _fresh=Date.now()-entry.date<3*3600000,_nm=greetName(),_ns=0;
  entry.exercises.forEach(function(ex){_ns+=(ex.sets||[]).length||(ex.timed||[]).length;});
  h+='<div class="fdn">';
  h+='<div class="fdn-h">'+(_fresh?(_nm?esc(_t('כל הכבוד, {name}',{name:_nm})):_t('כל הכבוד')):esc(entry.name))+'</div>';
  h+='<div class="fdn-s">'+(_fresh?esc(entry.name)+' &middot; ':'')+dateStr+(_fresh?' &middot; '+_t('נשמר ביומן'):'')+'</div>';
  h+='<div class="fdn-3"><div><b>'+_t('{n} דקות',{n:entry.duration||0})+'</b></div><div><b>'+_t('{n} סטים',{n:_ns})+'</b></div>'+
     (totalVol>0?'<div><b>'+nfmt(volDisp(totalVol))+'</b><span>'+_t('{u} שהורמו',{u:weightUnit()})+'</span></div>'
                :'<div><b>'+_t('{n} תרגילים',{n:entry.exercises.length})+'</b></div>')+'</div>';
  var _hi=fitHi(entry);
  if(_hi)h+='<div class="fdn-hi">'+_hi+'</div>';
  h+=fitFeelHTML(entry.date);
  /* what goes up next time - not when it felt too hard */
  var _nx=[];
  if(entry.feel!==1)(entry.exercises||[]).forEach(function(e){var a=nextAdvice(e.name,e.sets);
    if(a&&a.dir==='up'&&a.w>0&&_nx.length<2)_nx.push('<div class="fdn-nx"><b>'+esc(exLabel(e.name))+'</b><span>'+esc(a.t)+'</span></div>');});
  if(_nx.length)h+='<div class="fdn-nxh">'+_t('בפעם הבאה')+'</div>'+_nx.join('');
  if(_fresh)h+='<button class="gn-go" onclick="_fitView=\'home\';renderFitness()">'+_t('סיימתי')+'</button>';
  h+='<button class="fdn-more" onclick="_fitSumMore=!_fitSumMore;renderFitness()">'+(_fitSumMore?_t('להסתיר את הפירוט'):_t('הפירוט המלא'))+'</button></div>';
  if(_fitSumMore){
`],
  // volume bars, per-exercise "goals", the closing card and the advice list give way; the tables stay behind "the full detail"
  [String.raw`  // 4.5 Volume bars — horizontal
  h+='<div style="background:var(--card);border-radius:20px;padding:16px;margin-bottom:14px;box-shadow:0 2px 10px rgba(58,53,48,.06)">';
  h+='<div style="font-size:13px;font-weight:700;color:var(--ink-strong);margin-bottom:12px">'+_t('נפח עבודה')+'</div>';
  entry.exercises.forEach(function(ex){
    var vol=ex.sets.reduce(function(a,s){return a+(s.weight>0?(s.weight||0)*(s.reps||0):0);},0);
    var pct=maxVol>0?Math.round(vol/maxVol*100):0;
    h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">';
    h+='<div style="width:90px;font-size:10px;flex-shrink:0;color:var(--ink-strong);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(exLabel(ex.name))+'</div>';
    h+='<div style="flex:1;background:#EFE9DD;border-radius:6px;height:10px;overflow:hidden">';
    h+='<div style="height:100%;width:'+pct+'%;background:#2E6B62;border-radius:6px;transition:width .8s"></div></div>';
    h+='<div style="width:44px;text-align:start;font-size:10px;color:#9A9184;flex-shrink:0">'+nfmt(volDisp(vol))+'</div>';
    h+='</div>';
  });
  h+='</div>';

  // 4.4 Goals for next
  h+='<div style="background:var(--card);border-radius:20px;padding:16px;margin-bottom:14px;box-shadow:0 2px 10px rgba(58,53,48,.06)">';
  h+='<div style="font-size:13px;font-weight:700;color:var(--ink-strong);margin-bottom:10px">'+_t('מטרות לאימון הבא')+'</div>';
  entry.exercises.forEach(function(ex){
    var curMax=ex.sets.length?Math.max.apply(null,ex.sets.map(function(s){return s.weight||0;})):0;
    var allGood=ex.sets.length&&ex.sets.every(function(s){return s.reps>=(ex.targetReps||10);});
    var nextW=Math.round((curMax+2.5)*2)/2;
    var suggestion=curMax===0?''+_t('התמקד בטכניקה')+'':allGood?''+_t('נסה')+' '+fmtWeight(nextW)+'':''+_t('הישאר על {w}, ושים דגש על טכניקה',{w:fmtWeight(curMax)})+'';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--line-strong);gap:10px">';
    h+='<span style="font-size:12px;font-weight:700;flex-shrink:0;overflow:hidden;text-overflow:ellipsis">'+esc(exLabel(ex.name))+'</span>';
    h+='<span style="font-size:11px;color:#9A9184;text-align:start">'+suggestion+'</span></div>';
  });
  h+='</div>';

  // 4.6 Closing card
  var bestEx=entry.exercises.reduce(function(best,ex){
    var v=ex.sets.reduce(function(a,s){return a+(s.weight>0?(s.weight||0)*(s.reps||0):0);},0);
    return v>best.vol?{name:ex.name,vol:v}:best;
  },{name:'',vol:0});
  h+='<div style="background:#D6ECE8;color:#2E6B62;border-radius:16px;padding:16px;font-size:13px;line-height:1.7;margin-bottom:16px">';
  if(bestEx.name)h+='<div style="margin-bottom:6px"><b style="font-weight:800">'+_t('הבולט ביותר:')+'</b> '+_t('{name} עם {v} {u} נפח.',{name:esc(exLabel(bestEx.name)),v:nfmt(volDisp(bestEx.vol)),u:weightUnit()})+'</div>';
  h+='<div><b style="font-weight:800">'+_t('סה"כ:')+'</b> '+(avgRPE!==null?_t('{n} סטים, RPE ממוצע {rpe}.',{n:totalSets,rpe:avgRPE})+' '+(avgRPE>=9?''+_t('עומס כבד — שים לב להתאוששות.')+'':avgRPE>=7.5?''+_t('אימון טוב — באזור העלייה.')+'':''+_t('אימון נוח. אפשר להעלות במשקל.')+''):_t('{n} סטים.',{n:totalSets}))+' '+_t('אין דיווח כאב.')+'</div>';
  h+='</div>';

  /* The part a summary is for. Every other line says what happened; these
     say what to do about it, per exercise, read against the goal. */
  var _g=fitGoal(),_adv=[];
  for(var _i=0;_i<(entry.exercises||[]).length;_i++){
    var _e=entry.exercises[_i],_a=nextAdvice(_e.name,_e.sets);
    if(_a)_adv.push({n:_e.name,a:_a});
  }
  h+=stCooldownHTML(entry);
  if(_adv.length){
    h+='<div class="nx"><div class="nx-h">'+_t('בפעם הבאה')+'</div>';
    /* The THIRD copy of this line. One was fixed a pass ago, one this pass,
       and this one is on a different screen again - which is the argument for
       a helper rather than a fourth grep. */
    h+='<div class="nx-goal">'+_t('לפי המטרה:')+' '+esc(_g.t)+' &middot; '+nfmt(_g.lo)+'&ndash;'+nfmt(_g.hi)+' '+_t('חזרות',{n:_g.hi})+'</div>';
    for(var _j=0;_j<_adv.length;_j++){
      var _x=_adv[_j];
      h+='<div class="nx-row '+_x.a.dir+'">'+
         '<div class="nx-n">'+esc(_x.n)+'</div>'+
         '<div class="nx-t">'+esc(_x.a.t)+'</div>'+
         '<div class="nx-w">'+esc(_x.a.why)+'</div></div>';
    }
    h+='</div>';
  }
`,
   String.raw`  }
  h+=stCooldownHTML(entry);
`],
  [String.raw`  _fitView='summary';
  _fitSummaryEntry=entry;`,
   String.raw`  _fitView='summary';_fitSumMore=false;
  _fitSummaryEntry=entry;`],
  [String.raw`  setTimeout(function(){wtDone();gtSumPaint();},natural?1400:0);`,
   String.raw`  /* saved the moment it ends (27 Nov): closing the screen used to lose the whole workout */
  gtSave(1);
  setTimeout(function(){wtDone();gtSumPaint();},natural?1400:0);`],
  [String.raw`function gtSave(){
  var s=_gtSum,log;
  if(!s||s.saved)return;
  log=loadWorkoutLog();
  log.push({date:Date.now(),name:s.title,duration:Math.max(1,Math.round(s.secs/60)),
    follow:{work:s.work,rest:s.rest,sets:s.sets},
    exercises:s.ex.map(function(x){
      var t=[],i;for(i=0;i<x.n;i++)t.push(s.work);
      return {name:x.name,targetSets:s.sets,targetReps:0,sets:[],warm:[],timed:t};
    })});
  saveWorkoutLog(log);
  s.saved=true;
  gtSumPaint();
}
`,
   String.raw`function gtSave(q){
  var s=_gtSum,log,ent;
  if(!s||s.saved)return;
  log=loadWorkoutLog();
  log.push(ent={date:Date.now(),name:s.title,duration:Math.max(1,Math.round(s.secs/60)),
    follow:{work:s.work,rest:s.rest,sets:s.sets},
    exercises:s.ex.map(function(x){
      var t=[],i;for(i=0;i<x.n;i++)t.push(s.work);
      return {name:x.name,targetSets:s.sets,targetReps:0,sets:[],warm:[],timed:t};
    })});
  saveWorkoutLog(log);
  s.saved=true;s.at=ent.date;
  if(!q)gtSumPaint();
}
`],
  [String.raw`     '<div><b>'+esc(_t('{n} סטים',{n:sets}))+'</b></div></div>';`,
   String.raw`     '<div><b>'+esc(_t('{n} סטים',{n:sets}))+'</b></div></div>';
  if(s.at){var _ge=fitLogAt(s.at),_gh=_ge?fitHi(_ge):'';if(_gh)h+='<div class="fdn-hi">'+_gh+'</div>';h+=fitFeelHTML(s.at);}`],
  [String.raw`  h+=s.saved?'<button class="wtr-b on" disabled>'+esc(_t('נשמר ביומן'))+'</button>'
            :'<button class="wtr-b" onclick="gtSave()">'+esc(_t('לשמור ביומן'))+'</button>';`,
   String.raw`  if(!s.saved)h+='<button class="wtr-b" onclick="gtSave()">'+esc(_t('לשמור ביומן'))+'</button>';`],
  [String.raw`function nextAdvice(exName,sets){`,
   String.raw`/* ── HOW IT FELT, AND THE GOOD THING ──
   One tap on five faces, stored on the workout itself (feel: 1 too hard .. 5 great), shown at
   the end of the workout and again on the day's page in the evening. The faces are the ones
   סיום יום draws for the mood, so the two read as one language. */
var _fitSumMore=false;
function fitFeelWord(v){return [_t('קשה מדי'),_t('קשה'),_t('בסדר'),_t('טוב'),_t('מעולה')][v-1]||'';}
function fitLogAt(date){var l=loadWorkoutLog(),i;for(i=l.length-1;i>=0;i--)if(l[i].date===date)return l[i];return null;}
function fitFeelHTML(date){
  var e=fitLogAt(date),v=e?(+e.feel||0):0,i,h='<div class="fdn-feel"><div class="fdn-q">'+_t('איך זה הרגיש?')+'</div><div class="fdn-fs">';
  for(i=1;i<=5;i++)h+='<button class="fdn-f'+(v===i?' on':'')+'" onclick="fitFeelSet('+date+','+i+')">'+
    rfFace(i-1,RF_MOODS[i-1].c,!v||v===i)+'<span>'+esc(fitFeelWord(i))+'</span></button>';
  return h+'</div></div>';
}
function fitFeelSet(date,v){
  var l=loadWorkoutLog(),i;
  for(i=l.length-1;i>=0;i--)if(l[i].date===date){l[i].feel=v;break;}
  saveWorkoutLog(l);
  if(_fitSummaryEntry&&_fitSummaryEntry.date===date)_fitSummaryEntry.feel=v;
  if(document.getElementById('gts')&&_gtSum)gtSumPaint();else renderFitness();
}
/* the one good thing: a record, or more than the same workout last time, or that it is the first */
function fitHi(entry){
  var l=loadWorkoutLog(),prior=l.filter(function(x){return x.date<entry.date;}),best=null,i,j,k,ex,w,pw;
  if(!prior.length)return esc(_t('האימון הראשון שלך כאן'));
  var top=function(e){var m=0;(e.sets||[]).forEach(function(s){if((s.weight||0)>m)m=s.weight;});return m;};
  for(i=0;i<(entry.exercises||[]).length;i++){
    ex=entry.exercises[i];w=top(ex);pw=0;if(!w)continue;
    for(j=0;j<prior.length;j++)for(k=0;k<(prior[j].exercises||[]).length;k++)
      if(prior[j].exercises[k].name===ex.name)pw=Math.max(pw,top(prior[j].exercises[k]));
    if(pw>0&&w>pw&&(!best||w-pw>best.d))best={n:ex.name,w:w,d:w-pw};
  }
  if(best)return esc(_t('שיא חדש: {name} {w}',{name:exLabel(best.n),w:fmtWeight(best.w)}));
  var vol=function(e){var t=0;(e.exercises||[]).forEach(function(x){(x.sets||[]).forEach(function(s){if(s.weight>0)t+=s.weight*(s.reps||0);});});return t;};
  for(j=prior.length-1;j>=0;j--)if(prior[j].name===entry.name){
    var a=vol(entry),b=vol(prior[j]);
    if(b>0&&a>b)return esc(_t('הרמת {p} יותר מבפעם הקודמת',{p:pfmt(Math.round((a-b)/b*100))}));
    break;
  }
  return '';
}
function nextAdvice(exName,sets){`],
  // the day's page: how it felt, and the good thing
  [String.raw`'<span>'+_bits.join(' · ')+'</span></div>';`,
   String.raw`'<span>'+_bits.join(' · ')+'</span>'+
         (_wo.feel>0&&_wo.feel<6?'<span class="sm2-wo-feel">'+rfFace(_wo.feel-1,RF_MOODS[_wo.feel-1].c,1)+esc(fitFeelWord(_wo.feel))+'</span>':'')+
         (function(x){return x?'<span class="sm2-wo-hi">'+x+'</span>':'';})(fitHi(_wo))+'</div>';`],
  [String.raw`  h+=ppnEveHTML();`,
   String.raw`  h+=rfWoHTML();
  h+=ppnEveHTML();`],
  [String.raw`function rfRec(d){return loadSummary(d)||null;}`,
   String.raw`/* THE WORKOUT THAT WAS PLANNED AND NOT LOGGED, asked once in the evening (27 Nov). Home asks
   the same after six; whichever is answered first, the other stays quiet. "Moved" puts the day's
   plan on tomorrow, so the next day opens on it rather than on a plan that has moved on. */
function fitMoved(d){try{var x=localStorage.getItem('fit_day_'+d);return x?JSON.parse(x):null;}catch(e){return null;}}
function rfWoHTML(){
  var d=todayStr(),s=loadSummary(d),pl=null,raw;
  try{pl=plannedWorkoutFor(d);}catch(e){}
  if(!pl||workoutLoggedOn(d)||woSaid(d)!==null||(s&&(s.workoutDone===true||s.workoutDone===false)))return '';
  raw=fitMoved(d)||loadWeekPlan()['w0d'+new Date(d+'T12:00:00').getDay()];
  return '<div class="rfwo"><b>'+_t('היום היה בתוכנית אימון')+'</b><span>'+esc(fitPlanName(raw)||pl.label)+' &middot; '+_t('עוד לא נרשם. מה קרה?')+'</span>'+
    '<div class="rfwo-b"><button onclick="rfWoSay(1)">'+_t('התאמנתי')+'</button><button onclick="rfWoSay(0)">'+_t('לא היום')+'</button>'+
    '<button onclick="rfWoSay(2)">'+_t('הזזתי למחר')+'</button></div></div>';
}
function rfWoSay(v){
  var d=todayStr(),s=loadSummary(d);
  if(v===2){var e=fitMoved(d)||loadWeekPlan()['w0d'+new Date(d+'T12:00:00').getDay()];
    try{if(e)localStorage.setItem('fit_day_'+dayShift(1),JSON.stringify(e));}catch(x){}}
  try{localStorage.setItem('wo_said_'+d,v===1?'1':'0');}catch(x){}
  if(s){s.workoutDone=v===1;saveSummary(d,s);}
  showToast(v===1?_t('נרשם. כל הכבוד.'):v===2?_t('הועבר למחר'):_t('נרשם. מחר יום חדש.'));
  renderReflectHome();
}
function rfRec(d){return loadSummary(d)||null;}`],
  [String.raw`var plan=loadWeekPlan(),entry=plan["w0d"+dt.getDay()];`,
   String.raw`var plan=loadWeekPlan(),entry=fitMoved(dateStr)||plan["w0d"+dt.getDay()];`],
  [String.raw`  var e=loadWeekPlan()['w0d'+appNow().getDay()];`,
   String.raw`  var e=fitMoved(todayStr())||loadWeekPlan()['w0d'+appNow().getDay()];`],
  [String.raw`.sm2-wo-r>span{color:var(--muted);font-size:11.5px}`,
   String.raw`.sm2-wo-r>span{color:var(--muted);font-size:11.5px}
.sm2-wo-r>.sm2-wo-feel{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:var(--ink)}
.sm2-wo-feel svg{width:20px;height:20px;fill:none;stroke-width:1.8;stroke-linecap:round}
.sm2-wo-r>.sm2-wo-hi{flex-basis:100%;font-size:12.5px;font-weight:700;color:var(--ink)}
/* the end of a workout */
.fdn{display:flex;flex-direction:column;gap:12px;margin-bottom:16px}
.fdn-h{font-size:24px;font-weight:800;line-height:1.2;color:var(--nu-ink,#4a453f)}
.fdn-s{font-size:12.5px;color:var(--nu-muted,#6d675e);margin-top:-6px}
.fdn-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.fdn-3>div{border-radius:16px;padding:12px 6px;text-align:center;min-width:0;
  box-shadow:-3px -3px 7px var(--nu-lit,rgba(255,255,255,.95)),3px 4px 9px var(--nu-shade-soft,rgba(168,160,148,.3))}
.fdn-3 b{display:block;font-size:16px;font-weight:800;color:var(--nu-ink,#4a453f)}
.fdn-3 span{display:block;font-size:11px;color:var(--nu-muted,#6d675e);margin-top:2px}
.fdn-hi{border-radius:14px;padding:10px 12px;font-size:13.5px;font-weight:700;color:var(--nu-ink,#4a453f);
  box-shadow:inset 2px 3px 6px var(--nu-shade-soft,rgba(168,160,148,.3)),inset -2px -2px 5px var(--nu-lit,rgba(255,255,255,.95))}
.fdn-q{font-size:15px;font-weight:800;color:var(--nu-ink,#4a453f);margin-bottom:8px}
.fdn-fs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px}
.fdn-f{display:flex;flex-direction:column;align-items:center;gap:4px;border:0;background:transparent;font:inherit;padding:8px 2px;
  border-radius:14px;color:var(--nu-muted,#6d675e);cursor:pointer;min-width:0}
.fdn-f svg{width:30px;height:30px;fill:none;stroke-width:1.7;stroke-linecap:round}
.fdn-f span{font-size:11px;font-weight:700;line-height:1.15;text-align:center;overflow-wrap:anywhere}
.fdn-f.on{color:var(--nu-ink,#4a453f);box-shadow:inset 2px 3px 6px var(--nu-shade-soft,rgba(168,160,148,.3)),inset -2px -2px 5px var(--nu-lit,rgba(255,255,255,.95))}
.fdn-nxh{font-size:12px;font-weight:800;color:var(--nu-muted,#6d675e);margin-bottom:-6px}
.fdn-nx{display:flex;justify-content:space-between;gap:10px;font-size:13.5px;color:var(--nu-ink,#4a453f)}
.fdn-nx b{font-weight:700;min-width:0}
.fdn-nx span{font-weight:800;flex:none}
.fdn-more{border:0;background:transparent;font:inherit;font-size:13px;font-weight:700;color:var(--nu-muted,#6d675e);
  text-decoration:underline;text-underline-offset:3px;padding:6px;cursor:pointer;align-self:center}
.gts .fdn-hi{margin:12px 16px 0}
.gts .fdn-feel{margin:14px 16px 0}
/* the planned workout, asked in the evening */
.rfwo{margin:16px 0;border-radius:20px;padding:14px 16px;display:flex;flex-direction:column;gap:3px;
  box-shadow:-4px -4px 9px var(--nu-lit,rgba(255,255,255,.95)),4px 5px 11px var(--nu-shade-soft,rgba(168,160,148,.3))}
.rfwo b{font-size:15px;font-weight:800;color:var(--nu-ink,#4a453f)}
.rfwo span{font-size:13px;color:var(--nu-muted,#6d675e)}
.rfwo-b{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}
.rfwo-b button{border:0;font:inherit;font-size:13px;font-weight:700;color:var(--nu-ink,#4a453f);padding:10px 4px;border-radius:14px;background:transparent;cursor:pointer;
  box-shadow:-3px -3px 7px var(--nu-lit,rgba(255,255,255,.95)),3px 4px 9px var(--nu-shade-soft,rgba(168,160,148,.3))}`]
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
