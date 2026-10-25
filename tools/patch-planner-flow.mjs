/* The planner, re-planned (Asaf, 25 Oct): "the first question stays as it is.
 * The second: bring in the anchors that already exist in the schedule, and
 * from there go on - what else needs to go into the schedule? how long does
 * it take? how long does it take to get ready and get there?"
 *
 * App side: the local cards are now the range (unchanged) and the anchors -
 * read from the app's own plan for the coming week (anything with an hour,
 * grouped by title and time, its days named), each a row that can be kept or
 * dropped, plus a line to add one. Their answer opens the conversation.
 * Server side: the gathering is three stages - frame, anchors, then a loop
 * of exactly his three questions per item until the person says that is
 * everything; the waking hours only if still unknown, once, at the end. */
import fs from 'fs';
const CRLF = (f, fn) => { let s = fs.readFileSync(f, 'utf8'); const CR = s.includes('\r\n'); if (CR) s = s.replace(/\r\n/g, '\n'); s = fn(s); if (CR) s = s.replace(/\n/g, '\r\n'); fs.writeFileSync(f, s); };
const mk = (s) => ({ s, rep(a, b) { const n = this.s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } this.s = this.s.replace(a, () => b); return this; },
  cut(a, b, by) { const i = this.s.indexOf(a), j = this.s.indexOf(b, i); if (i < 0 || j < 0) { console.log('CUT ' + a.slice(0, 60)); process.exit(1); } this.s = this.s.slice(0, i) + by + this.s.slice(j); return this; } });

/* ── the app ── */
CRLF('dev/index.html', (s0) => {
  const m = mk(s0);
  m.rep(`var PLAN_PROF='plan_profile',PLAN_PROF_MAX=6000,PLAN_STAGES=5;`, `var PLAN_PROF='plan_profile',PLAN_PROF_MAX=6000,PLAN_STAGES=3;`);
  m.rep(`function plWarmCards(){
  var p=planProfile(),c=['horizon'];
  if(!p.wake)c.push('waking');
  if(!p.routines)c.push('routines');
  return c;
}`, `/* 25.10: the range, then the anchors already in the plan - the waking hours
   moved to the end of the conversation, asked only while unknown */
function plWarmCards(){return ['horizon','anchors'];}
var _plAnch=null;
/* what is already fixed: the coming week's items that have an hour, the same
   title at the same time on several days folded into one row */
function plAnchors(){
  var out={},list=[],k,i,d=appNow();
  for(k=0;k<7;k++){
    var dt=new Date(d.getFullYear(),d.getMonth(),d.getDate()+k),date=wkStamp(dt),all=dpAll(date);
    for(i=0;i<all.length;i++){
      var it=all[i];if(it.hour===null||!it.w)continue;
      var key=it.w+'|'+it.hour+':'+(it.min||0)+'|'+(it.end||0);
      if(!out[key]){out[key]={w:it.w,h:it.hour,m:it.min||0,e:it.end||0,days:[]};list.push(out[key]);}
      if(out[key].days.indexOf(dt.getDay())<0)out[key].days.push(dt.getDay());
    }
  }
  list.sort(function(a,b){return (a.h*60+a.m)-(b.h*60+b.m);});
  return list.slice(0,14).map(function(a){
    var days=a.days.sort().map(function(x){return dfmt(new Date(2023,0,1+x,12),{weekday:'short'});}).join(', ');
    var t=dpHM(a.h,a.m)+(a.e?'–'+dpHM(Math.floor(a.e/60),a.e%60):'');
    return {label:a.w+' · '+days+' · \u2066'+t+'\u2069',on:true};   /* the range stays left-to-right inside Hebrew */
  });
}
function plAnchorToggle(i){if(_plAnch&&_plAnch[i]){_plAnch[i].on=!_plAnch[i].on;planBotPaint();}}
function plAnchorsGo(){
  var kept=(_plAnch||[]).filter(function(a){return a.on;}).map(function(a){return a.label;});
  var el=document.getElementById('pl-anch-more'),more=el?String(el.value).trim():'';
  if(more)kept.push(more);
  var hz=planProfile().horizon||'';
  _plWarm=-1;_plAnch=null;
  planBotSend(kept.length?_t('טווח: {h}. העוגנים הקבועים, כמו שהם וכולל הדרך: {list}.',{h:hz,list:kept.join('; ')})
                         :_t('טווח: {h}. אין עוגנים קבועים.',{h:hz}));
}`);
  m.rep(`  _plWarm++;
  if(_plWarm>=_plCards.length){
    _plWarm=-1;
    /* the horizon is her first sentence; everything else is already in the
       profile, so the model opens at stage two */
    planBotSend(planProfile().horizon||value);
    return;
  }
  planBotPaint();`, `  _plWarm++;
  if(_plWarm>=_plCards.length){_plWarm=-1;planBotSend(planProfile().horizon||value);return;}
  planBotPaint();`);
  m.rep(`  var h='<div class="pb-stage"><div class="pb-dots">';
  for(var i=1;i<=PLAN_STAGES;i++)h+='<span class="pb-dot'+(i===1?' on':'')+'"></span>';
  h+='</div><span class="pb-stage-t">'+_t('המסגרת')+'</span></div>';
  var rows=[],q='',kind=_plCards[_plWarm]||'horizon';`, `  var kind=_plCards[_plWarm]||'horizon',st=kind==='anchors'?2:1;
  var h='<div class="pb-stage"><div class="pb-dots">';
  for(var i=1;i<=PLAN_STAGES;i++)h+='<span class="pb-dot'+(i===st?' on':(i<st?' done':''))+'"></span>';
  h+='</div><span class="pb-stage-t">'+(st===2?_t('העוגנים'):_t('המסגרת'))+'</span></div>';
  var rows=[],q='';
  if(kind==='anchors'){
    if(!_plAnch)_plAnch=plAnchors();
    h+='<div class="pb-q">'+(_plAnch.length?_t('אלה הדברים הקבועים שכבר בלו״ז. להשאיר אותם?'):_t('מה קבוע אצלך השבוע, ביום ובשעה?'))+'</div><div class="pb-ans-l">';
    for(var a=0;a<_plAnch.length;a++)
      h+='<button class="pb-ans pb-anch'+(_plAnch[a].on?' on':'')+'" onclick="plAnchorToggle('+a+')">'+esc(_plAnch[a].label)+'</button>';
    h+='</div><textarea id="pl-anch-more" class="pb-in" rows="2" placeholder="'+esc(_t('עוד משהו קבוע? למשל: עבודה א׳–ה׳ מ-9:00 עד 17:00'))+'"></textarea>'+
       '<button class="pb-go" onclick="plAnchorsGo()">'+_t('המשך')+'</button>';
    return h;
  }`);
  m.rep(`html body.mod-planning .pb-go{border-radius:15px;margin-bottom:10px}`, `html body.mod-planning .pb-go{border-radius:15px;margin-bottom:10px}
/* an anchor row: kept is pressed in with a lit mark, dropped is raised and quiet */
html body.mod-planning .pb-anch{display:flex;align-items:center;gap:10px;text-align:start;color:var(--nu-muted)}
html body.mod-planning .pb-anch::before{content:"";flex:none;width:9px;height:9px;border-radius:50%;box-shadow:inset 1px 1px 2px var(--nu-shade),inset -1px -1px 2px var(--nu-lit)}
html body.mod-planning .pb-anch.on{color:var(--nu-ink);box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
html body.mod-planning .pb-anch.on::before{background:#f0a92e;box-shadow:0 0 6px rgba(240,169,46,.6)}
html body.mod-planning #pl-anch-more{width:100%;margin:12px 0;resize:none;font-family:inherit}`);
  return m.s;
});

/* ── the server ── */
CRLF('push-server/src/worker.js', (s0) => {
  const m = mk(s0);
  m.cut(`        'GATHERING, IN FIVE STAGES. Work through them in order.`, `        'THEN BUILD IT, IN THREE PHASES:\\n' +`,
`        'GATHERING, IN THREE STAGES. Say which stage you are in with the stage and stageName\\n' +
        'fields on every question.\\n' +
        '\\n' +
        'STAGE 1 - THE FRAME, and STAGE 2 - THE ANCHORS, are asked by the app before you speak.\\n' +
        '   The person\\'s first message gives the range to plan and the fixed anchors they kept from\\n' +
        '   their own schedule - things with a day and an hour that cannot move - or says there are\\n' +
        '   none. Take them as true and frozen. Do not ask about them again, with one exception: an\\n' +
        '   anchor that is plainly away from home (work, studies, a class) needs its travel; if it is\\n' +
        '   not known, ask it ONCE for all of them together, as stage 2, before stage 3.\\n' +
        '\\n' +
        'STAGE 3 - WHAT ELSE GOES IN. A loop, with exactly these three questions per thing, in order:\\n' +
        '   a. "What else needs to go into the schedule?" Options are the common kinds, written as a\\n' +
        '      person would answer: a workout, meeting someone, a task or project, errands and\\n' +
        '      shopping - and always, as an option, that this is everything. Their answer may name\\n' +
        '      how often ("three times a week") and when ("Tuesday evening"); keep what it names.\\n' +
        '   b. "How long does it take?" - the thing itself. Offer lengths that fit what it is.\\n' +
        '   c. "How long to get ready and get there?" - the time around it: getting ready, travel\\n' +
        '      there and back, a shower after. Options such as: nothing, it is at home; a quarter of\\n' +
        '      an hour each way; half an hour each way; an hour all together.\\n' +
        '   Then back to (a), naming in the question that it is for the next thing. When they say\\n' +
        '   that is everything, gathering is over. Never ask (b) or (c) for something whose answer\\n' +
        '   already said it.\\n' +
        '   A thing given a day or an hour is PINNED, and goes exactly there. A thing given none is\\n' +
        '   FLOATING, and where it lands is your call - never press for a time.\\n' +
        '   Only if the profile does not already hold when their day starts and ends: ask that\\n' +
        '   once, as the last question of stage 3, with rows like "06:30 - 23:00".\\n' +
        '\\n' +
`);
  m.rep(`        'stage is 1-5, the stage above that this question belongs to,`, `        'stage is 1-3, the stage above that this question belongs to,`);
  return m.s;
});
console.log('ok');
