/* The fitness hub as approved on review/fit-hub-proto (24 Oct, the combined
 * version):
 *  - the week strip IS the schedule: each day carries its planned workout,
 *    the strip opens the schedule, and the schedule is one compact list with
 *    a day's workout chosen in a sheet;
 *  - "built for you" is a way to start, not an area: the start card opens a
 *    sheet - today's planned workout, built for you, my programs, empty;
 *  - two doors side by side: stopwatch and timers, workouts I liked;
 *  - one tracking card with three numbers at a glance (workouts this week,
 *    steps today, the latest record), opening one tracking screen whose four
 *    tabs are what were four doors: weights, steps, workouts, progress.
 * Steps is no longer a door: it is logged through the nutrition chat and
 * shown under tracking. Nothing was deleted - every view is still there. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* ── the week strip, with the plan in it ── */
rep(`    h+='<span class="fwk-d'+(isPlan?' plan':'')+(isDone?' done':'')+(isNow?' now':'')+'">'+
       '<span class="fwk-l">'+esc(dfmt(d+'T12:00:00',{weekday:'narrow'}))+'</span>'+
       '<span class="fwk-o"></span></span>';
  }
  h+='</div><div class="fwk-n"><span>'+_t('השבוע')+'</span>';
  /* the count only where the plan gives it a denominator - "3 of 4" with no
     plan behind it would be a target the app never asked anybody for */
  if(planned)h+='<span>'+_t('{a} מתוך {b}',{a:done,b:planned})+'</span>';
  return h+'</div>';`,
`    h+='<span class="fwk-d'+(isPlan?' plan':'')+(isDone?' done':'')+(isNow?' now':'')+'">'+
       '<span class="fwk-l">'+esc(dfmt(d+'T12:00:00',{weekday:'narrow'}))+'</span>'+
       /* WHAT THE PLAN SAYS FOR THE DAY (24 Oct): the strip is the schedule
          now, so a planned day names its workout under its letter */
       '<span class="fwk-t">'+(isPlan?esc(fitPlanName(e)):'&middot;')+'</span>'+
       '<span class="fwk-o"></span></span>';
  }
  h+='</div>';
  /* the heading goes above, with the way into the schedule beside it; the
     count only where the plan gives it a denominator - "3 of 4" with no plan
     behind it would be a target the app never asked anybody for */
  var hd='<div class="fwk-h"><span>'+_t('השבוע')+(planned?' &middot; '+_t('{a} מתוך {b}',{a:done,b:planned}):'')+'</span>'+
         '<button onclick="_fitView=\\'weekly-plan\\';renderFitness()">'+_t('לוז האימונים')+' &#8249;</button></div>';
  return hd+'<div class="fwk-tap" onclick="_fitView=\\'weekly-plan\\';renderFitness()">'+h+'</div>';`);
rep(`  var h='<div class="fwk">', done=0, planned=0;`, `  var h='<div class="fwk">', done=0, planned=0;   // the heading is built after the loop, once the counts are known`);

/* ── the doors: the start card, two tiles, the tracking card ── */
rep(`  if(FIT_AREAS.length)h+=fitHeroHTML(FIT_AREAS[0]);
  h+='<div class="fr-list">';
  for(i=1;i<FIT_AREAS.length;i++)h+=fitRowHTML(FIT_AREAS[i]);
  return h+'</div>';`,
`  if(FIT_AREAS.length)h+=fitHeroHTML(FIT_AREAS[0]);
  /* TWO DOORS AND A CARD (24 Oct). The schedule became the week strip,
     "built for you" became a way to start, and weights, the numbers, history
     and steps became the four tabs of one tracking screen - so of the nine
     doors two are left, and the card under them shows what tracking holds. */
  h+='<div class="fr-list">';
  for(i=1;i<FIT_AREAS.length;i++)if(FIT_AREAS[i].id==='timer'||FIT_AREAS[i].id==='videos')h+=fitRowHTML(FIT_AREAS[i]);
  return h+'</div>'+fitTrackCardHTML();`);

/* the hero opens the start sheet, and says what today's plan is */
rep(`  if(last&&last.name)when+=' \\u00b7 '+esc(last.name);
  return '<button class="fh" onclick="_fitView=\\''+a.id+'\\';renderFitness()" style="background:'+gr[0]+'">'+`,
`  if(last&&last.name)when+=' \\u00b7 '+esc(last.name);
  var tp=fitTodayPlan();
  if(tp)when=esc(_t('היום לפי הלוז: {name}',{name:fitPlanName(tp)}));
  return '<button class="fh" onclick="fitStartSheet()" style="background:'+gr[0]+'">'+`);

rep(`function fitAreaGridHTML(){`, `/* ── THE PLAN, READ ── */
function fitPlanName(e){
  if(!e)return '';
  if(e.label)return e.label;
  var t=(WORKOUT_TYPES||[]).filter(function(x){return x.id===e.type;})[0];
  return t?t.label:'';
}
function fitTodayPlan(){
  var e=loadWeekPlan()['w0d'+appNow().getDay()];
  return (e&&e.type&&e.type!=='rest')?e:null;
}
/* ── HOW TO START ──
   One sheet, four ways: what the plan says for today, one built for you,
   one of my programs, or nothing at all and the exercises added as you go. */
function fitStartSheet(){
  var tp=fitTodayPlan(),tpls=loadTemplates(),i,h,ti=-1;
  if(tp&&tp.label)for(i=0;i<tpls.length;i++)if(tpls[i].name===tp.label)ti=i;
  fitSheetClose();
  var ov=document.createElement('div');ov.className='cf-ov fss-ov';ov.id='fss-ov';
  h='<div class="cf-card fss"><div class="cf-q" style="margin-bottom:12px">'+esc(_t('אימון חדש'))+'</div><div class="fss-l">';
  if(tp)h+='<button onclick="fitSheetClose();'+(ti>=0?'startWorkout('+ti+')':'_fitView=\\'start\\';renderFitness()')+'"><b>'+esc(fitPlanName(tp))+'</b><span>'+esc(_t('לפי הלוז של היום'))+'</span></button>';
  h+='<button onclick="fitSheetClose();_fitView=\\'build\\';renderFitness()"><b>'+esc(_t('אימון שנבנה לך'))+'</b><span>'+esc(_t('לפי מה שחסר לך השבוע'))+'</span></button>';
  h+='<button onclick="fitSheetClose();_fitView=\\'start\\';renderFitness()"><b>'+esc(_t('מהתוכניות שלי'))+'</b><span>'+
     (tpls.length?esc(tpls.slice(0,3).map(function(t){return t.name;}).join(' · ')):'')+'</span></button>';
  h+='<button onclick="fitSheetClose();startEmptyWorkout()"><b>'+esc(_t('אימון ריק'))+'</b><span>'+esc(_t('מוסיפים תרגילים תוך כדי'))+'</span></button>';
  h+='</div><button class="cf-no" style="width:100%;margin-top:12px" onclick="fitSheetClose()">'+esc(_t('ביטול'))+'</button></div>';
  ov.innerHTML=h;document.body.appendChild(ov);
  ov.onclick=function(ev){if(ev.target===ov)fitSheetClose();};
}
function fitSheetClose(){var e=document.getElementById('fss-ov');if(e&&e.parentNode)e.parentNode.removeChild(e);}
/* ── WHAT TRACKING HOLDS, AT A GLANCE ──
   Three numbers, one from each kind of tracking: workouts this week, steps
   today, and the newest record - the heaviest set of an exercise that beat
   everything before it. */
function fitLastPR(){
  var log=loadWorkoutLog(),best={},out=null,i,j,k,ex,st;
  for(i=0;i<log.length;i++){
    for(j=0;j<(log[i].exercises||[]).length;j++){
      ex=log[i].exercises[j];
      for(k=0;k<(ex.sets||[]).length;k++){
        st=ex.sets[k];
        if(!(st.weight>0))continue;
        if(best[ex.name]!=null&&st.weight>best[ex.name])out={name:ex.name,weight:st.weight};
        if(best[ex.name]==null||st.weight>best[ex.name])best[ex.name]=st.weight;
      }
    }
  }
  return out;
}
function fitTrackCardHTML(){
  var dow=appNow().getDay(),sun=dayShift(-dow),log=loadWorkoutLog(),n=0,i,pr=fitLastPR(),st=stepsOf(todayStr());
  for(i=0;i<log.length;i++)if(log[i].date&&log[i].date>=sun)n++;
  return '<button class="ftk" onclick="_fitView=\\'weights\\';renderFitness()">'+
    '<span class="ftk-h"><b>'+_t('מעקב')+'</b><em>'+_t('הכול')+' &#8249;</em></span>'+
    '<span class="ftk-g">'+
      '<span><b>'+nfmt(n)+'</b><i>'+_t('אימונים השבוע')+'</i></span>'+
      '<span><b>'+(st?nfmt(st):'&ndash;')+'</b><i>'+_t('צעדים היום')+'</i></span>'+
      '<span><b>'+(pr?esc(fmtWeight(pr.weight)):'&ndash;')+'</b><i>'+(pr?esc(exLabel(pr.name)):_t('שיא אחרון'))+'</i></span>'+
    '</span></button>';
}
/* ── ONE TRACKING SCREEN ──
   The four views stay as they were; what joins them is this strip on top of
   each, so moving between them is one tap instead of back and in again. */
var FIT_TRACK=['weights','steps','history','stats'];
function fitTrackTabsHTML(){
  var L={weights:_t('משקלים'),steps:_t('צעדים'),history:_t('אימונים|מעקב'),stats:_t('התקדמות')},h='<div class="ftt">',i,v;
  for(i=0;i<FIT_TRACK.length;i++){v=FIT_TRACK[i];
    h+='<button class="'+(_fitView===v?'on':'')+'" onclick="_fitView=\\''+v+'\\';renderFitness()">'+L[v]+'</button>';}
  return h+'</div>';
}
function fitAreaGridHTML(){`);

/* the strip goes on top of each of the four */
rep(`  else if(_fitView==='videos')renderFitVideos();
}`, `  else if(_fitView==='videos')renderFitVideos();
  if(FIT_TRACK.indexOf(_fitView)>=0){
    var _c=document.getElementById('content');
    if(_c)_c.insertAdjacentHTML('afterbegin',fitTrackTabsHTML());
    document.getElementById('hdr-title').textContent=''+_t('מעקב')+'';
  }
}`);

/* ── the schedule, compact ── */
{
  const a = s.indexOf(`  for(var w=0;w<2;w++){
    h+='<div style="background:var(--card);border-radius:18px;padding:14px;margin-bottom:12px;`);
  const endMark = `\n  }\n\n  // Copy week 1 to week 2`;
  const b = s.indexOf(endMark, a);
  if (a < 0 || b < 0 || s.indexOf(`  for(var w=0;w<2;w++){
    h+='<div style="background:var(--card);border-radius:18px;padding:14px;margin-bottom:12px;`, a + 1) >= 0) { console.log('plan loop anchor'); process.exit(1); }
  s = s.slice(0, a) + `  /* ONE LINE A DAY (24 Oct). Each day used to be a card with an emoji and a
     coloured word; a week of them was the crowd. The workout is chosen in a
     sheet, so the list itself only has to say what is planned. */
  var dowNow=appNow().getDay();
  for(var w=0;w<2;w++){
    h+='<div class="fwp-h">'+(w===0?_t('שבוע ראשון'):_t('שבוע שני'))+'</div><div class="fwp">';
    for(var dw=0;dw<7;dw++){
      var _k='w'+w+'d'+dw,_e=weekPlan[_k]||{type:'rest'},_rest=!_e.type||_e.type==='rest';
      h+='<button class="fwp-r'+(w===0&&dw===dowNow?' now':'')+'" onclick="fitDaySheet(\\''+_k+'\\')">'+
         '<i></i><b>'+DAY_NAMES[dw]+'</b>'+(_e.note?'<em>'+esc(_e.note)+'</em>':'')+
         '<span class="'+(_rest?'r':'')+'">'+(_rest?_t('מנוחה'):esc(fitPlanName(_e)))+'</span></button>';
    }
    h+='</div>';` + s.slice(b);
}
rep(`function renderEditWeekDay(){`, `/* A DAY'S WORKOUT, IN A SHEET: the kinds as chips (the chosen one pressed),
   the name, and save. The full-page editor below is still reachable and no
   longer linked from the list. */
function fitDaySheet(key){
  var plan=loadWeekPlan(),e=plan[key]||{type:'rest',label:'',note:''},cur={type:e.type||'rest',label:e.label||'',note:e.note||''},h,i;
  var DN=[_t('ראשון'),_t('שני'),_t('שלישי'),_t('רביעי'),_t('חמישי'),_t('שישי'),_t('שבת')];
  fitSheetClose();
  var ov=document.createElement('div');ov.className='cf-ov fss-ov';ov.id='fss-ov';
  h='<div class="cf-card fss"><div class="cf-q" style="margin-bottom:12px">'+esc(DN[+key.charAt(3)])+'</div><div class="fwp-c" id="fwp-c">';
  for(i=0;i<WORKOUT_TYPES.length;i++)
    h+='<button data-t="'+WORKOUT_TYPES[i].id+'" class="'+(cur.type===WORKOUT_TYPES[i].id?'on':'')+'">'+WORKOUT_TYPES[i].label+'</button>';
  h+='</div><input id="fwp-n" class="tm-sv-in" maxlength="40" placeholder="'+esc(_t('תווית / שם האימון (אופציונלי)'))+'" value="'+esc(cur.label)+'">'+
    '<div class="tm-sv-col"><button class="cf-yes" id="fwp-ok">'+esc(_t('שמור'))+'</button>'+
    '<button class="cf-no" onclick="fitSheetClose()">'+esc(_t('ביטול'))+'</button></div></div>';
  ov.innerHTML=h;document.body.appendChild(ov);
  ov.onclick=function(ev){if(ev.target===ov)fitSheetClose();};
  document.getElementById('fwp-c').onclick=function(ev){
    var b=ev.target.closest('button');if(!b)return;cur.type=b.getAttribute('data-t');
    [].forEach.call(this.children,function(x){x.className=(x===b)?'on':'';});
  };
  document.getElementById('fwp-ok').onclick=function(){
    var p=loadWeekPlan();
    cur.label=(document.getElementById('fwp-n').value||'').replace(/^\\s+|\\s+$/g,'');
    p[key]=cur;saveWeekPlan(p);fitSheetClose();renderFitness();
  };
}
function renderEditWeekDay(){`);

/* ── CSS ── */
rep(`.fwk-n{display:flex;justify-content:space-between;font-size:10.5px;font-weight:700;`, `/* the planned workout under the letter, and the heading above the strip */
.fwk-d{height:auto;min-height:66px;padding:8px 2px}
.fwk-t{font-size:10px;font-weight:700;color:var(--nu-muted);max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 2px}
.fwk-d.plan .fwk-t,.fwk-d.now .fwk-t{color:var(--nu-ink)}
.fwk-tap{cursor:pointer}
.fwk-h{display:flex;justify-content:space-between;align-items:center;margin:2px 4px 8px;font-size:12px;font-weight:800;color:var(--nu-muted)}
.fwk-h button{border:none;background:none;padding:0;font-family:inherit;font-size:12px;font-weight:800;color:var(--nu-muted);cursor:pointer}
/* the tracking card */
.ftk{display:block;width:100%;border:none;border-radius:20px;padding:14px 14px 12px;margin:0 0 14px;cursor:pointer;font-family:inherit;text-align:start;
  background:var(--nu-ground);box-shadow:-4px -4px 9px var(--nu-lit),5px 6px 13px var(--nu-shade-soft)}
.ftk-h{display:flex;justify-content:space-between;align-items:center}
.ftk-h b{font-size:15.5px;font-weight:800;color:var(--nu-ink)}
.ftk-h em{font-style:normal;font-size:12.5px;font-weight:700;color:var(--nu-muted)}
.ftk-g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
.ftk-g>span{display:flex;flex-direction:column;align-items:center;gap:2px;border-radius:14px;padding:10px 4px;
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.ftk-g b{font-size:18px;font-weight:800;color:var(--nu-ink);unicode-bidi:plaintext}
.ftk-g i{font-style:normal;font-size:11px;font-weight:700;color:var(--nu-muted);text-align:center;line-height:1.25;
  max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* the four tabs on top of tracking */
.ftt{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;border-radius:16px;padding:4px;margin-bottom:14px;background:var(--nu-ground);
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.ftt button{border:none;background:none;border-radius:12px;padding:10px 0;font-family:inherit;font-size:13px;font-weight:800;color:var(--nu-muted);cursor:pointer}
.ftt button.on{background:var(--nu-ground);color:var(--nu-ink);box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}
/* the start sheet and the day sheet */
.fss-l{display:flex;flex-direction:column;border-radius:18px;padding:2px 12px;box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.fss-l button{display:flex;flex-direction:column;align-items:flex-start;gap:2px;border:none;background:none;padding:12px 2px;border-top:1px solid rgba(176,168,156,.3);
  font-family:inherit;cursor:pointer;text-align:start}
.fss-l button:first-child{border-top:none}
.fss-l b{font-size:15px;font-weight:800;color:var(--nu-ink)}
.fss-l span{font-size:12.5px;font-weight:600;color:var(--nu-muted)}
.fwp-c{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px}
.fwp-c button{border:none;border-radius:999px;padding:8px 12px;font-family:inherit;font-size:13px;font-weight:800;color:var(--nu-muted);cursor:pointer;background:var(--nu-ground);
  box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}
.fwp-c button.on{color:var(--nu-ink);box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
/* the schedule, one line a day */
.fwp-h{font-size:12px;font-weight:800;color:var(--nu-muted);margin:4px 4px 8px}
.fwp{border-radius:20px;padding:2px 14px;margin-bottom:14px;background:var(--nu-ground);box-shadow:-4px -4px 9px var(--nu-lit),5px 6px 13px var(--nu-shade-soft)}
.fwp-r{display:flex;align-items:center;gap:10px;width:100%;border:none;background:none;padding:12px 0;border-top:1px solid rgba(176,168,156,.3);
  font-family:inherit;cursor:pointer;text-align:start;color:var(--nu-ink)}
.fwp-r:first-child{border-top:none}
.fwp-r i{flex:none;width:8px;height:8px;border-radius:50%}
.fwp-r.now i{background:var(--nu-amber);box-shadow:0 0 7px rgba(240,169,46,.75)}
.fwp-r b{font-size:14.5px;font-weight:800;min-width:54px}
.fwp-r em{font-style:normal;font-size:12px;color:var(--nu-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.fwp-r span{margin-inline-start:auto;font-size:14px;font-weight:800;white-space:nowrap}
.fwp-r span.r{color:var(--nu-muted);font-weight:700}
.fwp-r::after{content:"\\2039";color:var(--nu-muted);font-size:17px}
.fwk-n{display:flex;justify-content:space-between;font-size:10.5px;font-weight:700;`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('patched');
