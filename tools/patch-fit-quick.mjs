/* Two from the phone (Asaf, 24 Oct):
 *  1. a gym program opened a screen of kg/reps boxes per exercise that he
 *     could not read. A program is started like any saved workout now: a
 *     tap starts it - or, when it has several days, asks which day.
 *  2. "built for you" was half a planner. The planner is "build a workout
 *     ahead"; this is the other thing - "I am at the gym, no time, give me
 *     something": אימון בקליק. Three questions: how much time, what to focus
 *     on (whole body / upper / lower, or muscles), what equipment. Nothing is
 *     preselected and nothing shows set counts. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b, all) => { const n = s.split(a).length - 1; if (all ? n < 1 : n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = all ? s.split(a).join(b) : s.replace(a, () => b); };

/* ── 1. a program starts ── */
rep(`      h+='<div class="fs-row"><button class="fs-go" onclick="_fitView=\\'view-program\\';_fitProgIdx='+pi+';renderFitness()">'+`,
    `      h+='<div class="fs-row"><button class="fs-go" onclick="fitProgStart('+pi+')">'+`);
rep(`/* the one "+": which kind of new */`, `/* A PROGRAM STARTS LIKE A SAVED WORKOUT: one day, straight in; several, a
   sheet of its days. The day's exercises become the workout. */
function fitProgStart(pi,day){
  var p=loadPrograms()[pi];if(!p)return;
  var days=[],i,ex;
  for(i=0;i<p.exercises.length;i++){ex=p.exercises[i];if(days.indexOf(ex.day||'')<0)days.push(ex.day||'');}
  if(day===undefined&&days.length>1){
    fitSheetClose();
    var ov=document.createElement('div'),h='';ov.className='cf-ov fss-ov';ov.id='fss-ov';
    for(i=0;i<days.length;i++)h+='<button onclick="fitSheetClose();fitProgStart('+pi+','+i+')"><b>'+esc(progDayLabel(days[i])||progLabel(p.name))+'</b></button>';
    ov.innerHTML='<div class="cf-card fss"><div class="cf-q" style="margin-bottom:12px">'+esc(progLabel(p.name))+'</div><div class="fss-l">'+h+'</div>'+
      '<button class="cf-no" style="width:100%;margin-top:12px" onclick="fitSheetClose()">'+esc(_t('ביטול'))+'</button></div>';
    document.body.appendChild(ov);ov.onclick=function(e){if(e.target===ov)fitSheetClose();};
    return;
  }
  var d=days[day||0],exs=p.exercises.filter(function(x){return (x.day||'')===d;});
  fitwReplaceAsk(function(){
    _fitWorkout={templateIdx:-1,name:progLabel(p.name)+(d?' · '+progDayLabel(d):''),startTime:Date.now(),
      exercises:exs.map(function(x){return {name:x.name,targetSets:+x.sets||3,targetReps:+x.targetReps||10,plan:[],sets:[],warm:[],ss:null};}),
      currentEx:0};
    _fitView='workout';renderFitness();
  });
}
/* the one "+": which kind of new */`);

/* ── 2. אימון בקליק ── */
rep(`  h+='<button onclick="fitSheetClose();_fitView=\\'build\\';renderFitness()"><b>'+esc(_t('אימון שנבנה לך'))+'</b><span>'+esc(_t('לפי מה שחסר לך השבוע'))+'</span></button>';`,
    `  h+='<button onclick="fitSheetClose();_gen=null;_fitView=\\'build\\';renderFitness()"><b>'+esc(_t('אימון בקליק'))+'</b><span>'+esc(_t('כמה זמן יש לך, במה להתרכז, ואיזה ציוד'))+'</span></button>';`);
rep(`    _fitWorkout={templateIdx:-1,name:''+_t('אימון שנבנה לך')+'',startTime:Date.now(),
                 exercises:exs,currentEx:0};`, `    _fitWorkout={templateIdx:-1,name:''+_t('אימון בקליק')+'',startTime:Date.now(),
                 exercises:exs,currentEx:0};`);
/* nothing preselected */
rep(`  for(i=0;i<d.length&&n<GEN_MAX_MUSCLES;i++)if(d[i].short>0){on[d[i].m]=d[i].short;n++;}`,
    `  /* NOTHING PRESELECTED (24 Oct): the question is what you want to focus on
     now, not what a tally thinks is behind */`);
/* three questions: time, focus, equipment */
rep(`  return n>1?4:3;`, `  return 3;`);
rep(`  if(g.step===1){
    h+='<div class="gn-c"><div class="gn-q">'+_t('איפה אתה מתאמן')+'</div><div class="gn-w">';`,
    `  if(g.step===2){
    h+='<div class="gn-c"><div class="gn-q">'+_t('איפה אתה מתאמן')+'</div><div class="gn-w">';`);
rep(`  if(g.step===2){
  /* ── what is short, already chosen ── */
  h+='<div class="gn-c"><div class="gn-q">'+_t('מה חסר לך השבוע')+'</div>';`,
`  if(g.step===1){
  /* ── what to focus on: three quick answers, then the muscles ── */
  h+='<div class="gn-c"><div class="gn-q">'+_t('במה תרצה להתרכז?')+'</div><div class="gn-w" style="margin-bottom:14px">';
  ['all','up','low'].forEach(function(k){
    h+='<button class="gn-e'+(genGroupOn(k)?' on':'')+'" onclick="genGroup(\\''+k+'\\')">'+
       (k==='all'?_t('גוף מלא'):k==='up'?_t('פלג גוף עליון'):_t('פלג גוף תחתון'))+'</button>';});
  h+='</div>';`);
rep(`    h+='<button class="gn-m'+(on?' on':'')+'" onclick="genToggle(\\''+d.m+'\\')">'+
       esc(_t(d.m))+'<span class="gn-n">'+(d.short>0?_t('{n} סטים',{n:d.short}):'&#10003;')+'</span></button>';`,
    `    h+='<button class="gn-m'+(on?' on':'')+'" onclick="genToggle(\\''+d.m+'\\')">'+esc(_t(d.m))+'</button>';`);
rep(`  var short=g.def.filter(function(x){return x.short>0;});
  h+='<div class="gn-s">'+(short.length
      ? _t('בחרתי את אלה שהכי מאחור. אפשר להוריד ולהוסיף.')
      : _t('הכול בתוך הטווח השבוע. בחר מה בא לך לעבוד.'))+'</div>';
`, ``);
rep(`  if(g.step===3&&chosen.length>1){`, `  if(false){`);
rep(`  } else h+='<button class="gn-go" onclick="genStep(1)">'+_t('המשך')+'</button>';`,
    `  } else h+='<button class="gn-go" onclick="'+(g.step===1?'if(!Object.keys(_gen.on).length){showToast(_t(\\'בחר שריר אחד לפחות\\'));return;}':'')+'genStep(1)">'+_t('המשך')+'</button>';`);
rep(`function genEmph(m){`, `/* the three quick answers to "what to focus on" */
var GEN_UP=['חזה','גב','כתפיים','יד קדמית','יד אחורית','אמה'],GEN_LOW=['ארבע ראשי','ירך אחורית','ישבן','תאומים'];
function genGroupMs(k){
  if(!_gen)return [];
  return _gen.def.map(function(x){return x.m;}).filter(function(m){
    return k==='all'||(k==='up'?GEN_UP:GEN_LOW).indexOf(m)>=0;});
}
function genGroupOn(k){
  var ms=genGroupMs(k),on=Object.keys(_gen.on);
  return ms.length>0&&ms.length===on.length&&ms.every(function(m){return _gen.on[m]!==undefined;});
}
function genGroup(k){
  if(!_gen)return;
  var was=genGroupOn(k);_gen.on={};_gen.emphasis='';
  if(!was)genGroupMs(k).forEach(function(m){_gen.on[m]=GEN_SETS_PER_EX;});
  renderFitness();
}
function genEmph(m){`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
