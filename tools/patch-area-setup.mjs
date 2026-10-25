/* A one-time setup screen for nutrition and fitness (Asaf, 25 Oct): "not part
 * of the page as if it is going to stay there - the first time a person opens
 * the area, a screen that is shown once and never again. The columns where
 * food will go are not needed there. Answer the health questions and whether
 * there is a goal there. And everything moved on the moment you touched it -
 * the date, the height, the weight: do these screens in a more controlled way."
 *
 * So: a full-screen sheet over the area, one question at a time, and NOTHING
 * advances on its own - a choice is pressed, a box is filled, and "continue"
 * goes on; "back" returns; "later" closes it for good. Answers already given
 * are skipped. It ends with your health, unless that was already set.
 * Nutrition: goal? (yes / no -> would you like one?) -> goal -> sex -> birth ->
 *            height -> weight -> activity -> health
 * Fitness:   goal? -> outcomes -> days -> minutes -> experience -> where ->
 *            limits -> health
 * The in-page question card is gone from both areas. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* the in-page cards go */
rep(`function fqCardHTML(){
  var p=loadProfile(),left=fqPending(p);`, `function fqCardHTML(){
  return '';   /* the questions are asked once, in the setup screen (asetOpen) */
  var p=loadProfile(),left=fqPending(p);`);
rep(`  if(_fitView==='home'&&fitMePending().length&&!fqOffToday('fitness')&&!fitCardMet())_fitView='welcome';`,
    `  /* (the questions are asked once, in the setup screen - asetOpen) */`);
/* opened on the first visit */
rep(`  /* (the first-visit card is gone: each area explains itself) */\n`, `  /* (the first-visit card is gone: each area explains itself) */
  if(mod==='nutrition'||mod==='fitness')setTimeout(function(){asetMaybe(mod);},350);\n`);

/* the module */
rep(`/* ── DO YOU HAVE A GOAL? ── the door in front of the goal question */`, `/* ── THE ONE-TIME SETUP SCREEN ── */
var ASET_KEY='area_setup_seen',_aset=null;
function asetSeen(a){try{return !!(JSON.parse(localStorage.getItem(ASET_KEY)||'{}')||{})[a];}catch(e){return false;}}
function asetMark(a){var o={};try{o=JSON.parse(localStorage.getItem(ASET_KEY)||'{}')||{};}catch(e){}o[a]=1;try{localStorage.setItem(ASET_KEY,JSON.stringify(o));}catch(e){}}
function asetSteps(a){
  var p=loadProfile(),o=fitMe(),out=[];
  if(a==='nutrition'){
    if(!fqHas(p,'goal'))out.push('gate','add','goal');
    ['sex','birth','height','weight','activity'].forEach(function(k){if(!fqHas(p,k))out.push(k);});
  } else {
    if(!o.outDone)out.push('gate','add','out');
    if(!(+o.days>0))out.push('days');if(!(+o.minutes>0))out.push('minutes');
    if(!o.exp)out.push('exp');if(!o.equipDone)out.push('equip');if(!o.limitsDone)out.push('limits');
  }
  if(!hlLoad().ack)out.push('health');
  return out;
}
function asetMaybe(a){
  if(asetSeen(a))return;
  var st=asetSteps(a);
  if(!st.length){asetMark(a);return;}
  asetOpen(a);
}
function asetOpen(a){
  asetMark(a);   /* once: closing it, by any button, is an answer too */
  var p=loadProfile(),o=fitMe();
  _aset={a:a,steps:asetSteps(a),i:0,t:{goal:p.goal||'',sex:p.sex||'',birth:p.birth||'',height:p.height||'',weight:p.weight?edWeightVal(p.weight):'',
    activity:p.activity||0,out:(o.out||[]).slice(),days:+o.days||0,minutes:+o.minutes||0,exp:o.exp||'',equip:genEquip(),limits:(o.limits||[]).slice()}};
  var ov=document.getElementById('as-ov');if(!ov){ov=document.createElement('div');ov.id='as-ov';ov.className='as-ov';document.body.appendChild(ov);}
  asetPaint();
}
function asetClose(){var e=document.getElementById('as-ov');if(e&&e.parentNode)e.parentNode.removeChild(e);_aset=null;}
function asetKey(){return _aset.steps[_aset.i];}
/* which steps actually show: "add" only after a no, the goal only after a yes */
function asetSkip(k){var t=_aset.t;if(k==='add')return t.gate!=='no';if(k==='goal'||k==='out')return t.gate==='no'&&t.add!=='yes';return false;}
function asetMove(d){
  var i=_aset.i+d;
  while(i>=0&&i<_aset.steps.length&&asetSkip(_aset.steps[i]))i+=d;
  if(i<0)return;
  if(i>=_aset.steps.length){asetFinish();return;}
  _aset.i=i;asetPaint();
}
function asetSet(f,v,multi){
  var t=_aset.t;
  if(multi){var l=t[f],j=l.indexOf(v);if(f==='limits'&&v==='none')l.splice(0,l.length);else if(f==='limits')l=t[f]=l.filter(function(x){return x!=='none';});   // i18n-exempt: a stored key
    j=t[f].indexOf(v);if(j>=0)t[f].splice(j,1);else t[f].push(v);}
  else t[f]=v;
  asetPaint();
}
/* the box values are read when continuing, never on change */
function asetRead(){
  var k=asetKey(),t=_aset.t,e;
  if(k==='birth'){e=document.getElementById('as-birth');t.birth=e?e.value:'';}
  if(k==='height'){
    if(APP_UNITS==='imperial'){var ft=+((document.getElementById('as-ft')||{}).value||0),inch=+((document.getElementById('as-in')||{}).value||0);t.height=(ft||inch)?Math.round((ft*12+inch)*2.54):'';}
    else{e=document.getElementById('as-h');t.height=e&&e.value?+e.value:'';}
  }
  if(k==='weight'){e=document.getElementById('as-w');t.weight=e&&e.value?+e.value:'';}
}
function asetReady(){
  var k=asetKey(),t=_aset.t;
  if(k==='gate')return !!t.gate;if(k==='add')return !!t.add;if(k==='goal')return !!t.goal;if(k==='sex')return !!t.sex;
  if(k==='birth')return profileAge(t.birth)!==null;if(k==='height')return +t.height>0;if(k==='weight')return +t.weight>0;
  if(k==='activity')return +t.activity>0;if(k==='out')return t.out.length>0;if(k==='days')return t.days>0;if(k==='minutes')return t.minutes>0;
  if(k==='exp')return !!t.exp;if(k==='equip')return !!t.equip;if(k==='limits')return t.limits.length>0;if(k==='health')return !!t.health;
  return true;
}
function asetNext(){asetRead();if(!asetReady()){asetPaint(true);return;}asetMove(1);}
function asetFinish(){
  var a=_aset.a,t=_aset.t,p=loadProfile();
  if(a==='nutrition'){
    p.goal=t.goal||(t.gate==='no'&&t.add!=='yes'?'keep':p.goal);
    if(t.sex)p.sex=t.sex;if(profileAge(t.birth)!==null)p.birth=t.birth;
    if(+t.height>0)p.height=+t.height;if(+t.weight>0)p.weight=fromDisplayWeight(+t.weight);
    if(+t.activity>0)p.activity=+t.activity;
    p.updatedAt=new Date().toISOString();saveProfile(p);targetsAutoApply();
  } else {
    var o=fitMe();o.started=1;
    if(_aset.steps.indexOf('out')>=0){o.out=t.out.slice();o.outDone=1;}
    if(t.days)o.days=t.days;if(t.minutes)o.minutes=t.minutes;if(t.exp)o.exp=t.exp;
    if(_aset.steps.indexOf('equip')>=0){o.equipDone=1;try{localStorage.setItem(GEN_EQUIP_KEY,t.equip);}catch(e){}}
    if(_aset.steps.indexOf('limits')>=0){o.limits=t.limits.slice();o.limitsDone=1;}
    o.noteDone=1;
    try{localStorage.setItem(FIT_ME_KEY,JSON.stringify(o));}catch(e){}
    if(o.out&&o.out.length)try{localStorage.setItem(FIT_GOAL_KEY,fitMeStyle());}catch(e){}
  }
  var health=t.health==='yes';
  asetClose();
  if(a==='fitness'){_fitView=fitMePending().length?'home':'welcome';renderFitness();}else render();
  if(health)setTimeout(hlOpen,250);
}
function asetChoice(f,v,label,sub,multi){
  var t=_aset.t,on=multi?t[f].indexOf(v)>=0:t[f]===v;
  return '<button class="as-o'+(on?' on':'')+'" onclick="asetSet(\\''+f+'\\','+(typeof v==='number'?v:'\\''+v+'\\'')+(multi?',1':'')+')"><b>'+label+'</b>'+(sub?'<span>'+sub+'</span>':'')+'</button>';
}
function asetPaint(nudge){
  var ov=document.getElementById('as-ov');if(!ov||!_aset)return;
  var a=_aset.a,k=asetKey(),t=_aset.t,fit=a==='fitness',q='',why='',body='',i;
  var shown=_aset.steps.filter(function(x){return !asetSkip(x);}),pos=shown.indexOf(k);
  if(k==='gate'){q=fit?_t('יש לך מטרה בכושר?'):_t('יש לך מטרה בתזונה?');body=asetChoice('gate','yes',_t('כן, יש לי מטרה'))+asetChoice('gate','no',_t('לא'));}
  if(k==='add'){q=_t('תרצה להוסיף מטרה?');why=fit?_t('מטרה עוזרת לבנות לך אימון שמתאים לך: כמה חזרות, כמה מנוחה, ומתי להעלות משקל.'):_t('מטרה קובעת את יעד הקלוריות והחלבון שלך. בלי מטרה נשמור על המשקל הנוכחי.');
    body=asetChoice('add','yes',_t('כן, בוא נבחר'))+asetChoice('add','no',_t('לא עכשיו'));}
  if(k==='goal'){q=fqQuestion('goal');for(i=0;i<GOALS.length;i++)body+=asetChoice('goal',GOALS[i].v,GOALS[i].t,GOALS[i].n);}
  if(k==='out'){q=fitMeQuestion('out');why=_t('אפשר לבחור יותר מאחת.');for(i=0;i<FIT_OUT.length;i++)body+=asetChoice('out',FIT_OUT[i][0],esc(_t(FIT_OUT[i][1])),esc(_t(FIT_OUT[i][2])),1);}
  if(k==='sex'){q=fqQuestion('sex');body=asetChoice('sex','m',_t('זכר'))+asetChoice('sex','f',_t('נקבה'));}
  if(k==='birth'){q=fqQuestion('birth');body='<label class="pf-row fq-date as-box"><input class="pf-in" id="as-birth" type="date" required value="'+esc(t.birth||'')+'"><span>'+_t('בחירת תאריך')+'</span></label>';}
  if(k==='height'){q=fqQuestion('height');
    body=APP_UNITS==='imperial'
      ?'<div class="as-row"><input class="pf-in" id="as-ft" type="number" inputmode="numeric" placeholder="&ndash;"><span class="pf-note">ft</span><input class="pf-in" id="as-in" type="number" inputmode="numeric" placeholder="&ndash;"><span class="pf-note">in</span></div>'
      :'<div class="as-row"><input class="pf-in" id="as-h" type="number" inputmode="decimal" placeholder="&ndash;" value="'+esc(String(t.height||''))+'"><span class="pf-note">'+_t('ס"מ')+'</span></div>';}
  if(k==='weight'){q=fqQuestion('weight');body='<div class="as-row"><input class="pf-in" id="as-w" type="number" inputmode="decimal" step="0.1" placeholder="&ndash;" value="'+esc(String(t.weight||''))+'"><span class="pf-note">'+weightUnit()+'</span></div>';}
  if(k==='activity'){q=fqQuestion('activity');for(i=0;i<ACT_LEVELS.length;i++)body+=asetChoice('activity',ACT_LEVELS[i].v,ACT_LEVELS[i].t,ACT_LEVELS[i].s);}
  if(k==='days'){q=fitMeQuestion('days');why=fitMeWhy('days');body='<div class="as-grid">';for(i=0;i<GENPROG_DAYS.length;i++)body+=asetChoice('days',GENPROG_DAYS[i],nfmt(GENPROG_DAYS[i]));body+='</div>';}
  if(k==='minutes'){q=fitMeQuestion('minutes');body='<div class="as-grid">';[20,30,45,60,75,90].forEach(function(m){body+=asetChoice('minutes',m,_t('{n} דקות',{n:m}));});body+='</div>';}
  if(k==='exp'){q=fitMeQuestion('exp');for(i=0;i<GENPROG_EXP.length;i++)body+=asetChoice('exp',GENPROG_EXP[i][0],esc(_t(GENPROG_EXP[i][1])),genExpSub(GENPROG_EXP[i][0]));}
  if(k==='equip'){q=fitMeQuestion('equip');for(i=0;i<GEN_EQUIP_ORDER.length;i++)body+=asetChoice('equip',GEN_EQUIP_ORDER[i],genEquipLabel(GEN_EQUIP_ORDER[i]),genEquipSub(GEN_EQUIP_ORDER[i]));}
  if(k==='limits'){q=fitMeQuestion('limits');why=_t('אפשר לבחור יותר מאחת.');body='<div class="as-grid">';for(i=0;i<FIT_ME_LIMITS.length;i++)body+=asetChoice('limits',FIT_ME_LIMITS[i][0],esc(_t(FIT_ME_LIMITS[i][1])),'',1);body+='</div>';}
  if(k==='health'){q=_t('הבריאות שלך');why=_t('יש משהו בבריאות שלך שהאפליקציה צריכה לקחת בחשבון? זה לא חובה, ואפשר לשנות בכל רגע.');body=asetChoice('health','yes',_t('כן'))+asetChoice('health','no',_t('לא'));}
  var h='<div class="as-in"><div class="as-top">'+(pos>0?'<button class="fit-back" onclick="asetMove(-1)">&#8249; '+_t('חזרה')+'</button>':'<span></span>')+
    '<button class="as-later" onclick="asetClose();'+(fit?'renderFitness()':'render()')+'">'+_t('אחר כך')+'</button></div>';
  h+='<div class="as-dots">';for(i=0;i<shown.length;i++)h+='<i class="'+(i<=pos?'on':'')+'"></i>';h+='</div>';
  h+='<div class="as-q">'+q+'</div>'+(why?'<div class="as-why">'+why+'</div>':'')+'<div class="as-body">'+body+'</div>';
  h+='<button class="as-go'+(nudge?' nudge':'')+'" onclick="asetNext()">'+_t('המשך')+'</button></div>';
  ov.innerHTML=h;
}
/* ── DO YOU HAVE A GOAL? ── the door in front of the goal question */`);
rep(`.gate{margin-top:14px}`, `/* the one-time setup screen */
.as-ov{position:fixed;inset:0;z-index:955;overflow-y:auto;background:var(--nu-ground,#e9e7e3);
  --nu-ground:#e9e7e3;--nu-lit:rgba(255,255,255,.95);--nu-shade:rgba(176,168,156,.44);--nu-shade-soft:rgba(176,168,156,.28);--nu-ink:#4a453f;--nu-muted:#6d675e}
.as-in{min-height:100%;max-width:480px;margin:0 auto;padding:calc(env(safe-area-inset-top) + 16px) 22px calc(env(safe-area-inset-bottom) + 22px);display:flex;flex-direction:column;color:var(--nu-ink)}
.as-top{display:flex;justify-content:space-between;align-items:center;min-height:36px}
.as-later{border:none;background:none;font-family:inherit;font-size:14px;font-weight:700;color:var(--nu-muted);cursor:pointer}
.as-dots{display:flex;gap:6px;margin:18px 0 26px}
.as-dots i{flex:1;height:4px;border-radius:3px;background:rgba(176,168,156,.35)}
.as-dots i.on{background:var(--nu-amber,#f0a92e)}
.as-q{font-size:28px;font-weight:800;line-height:1.25}
.as-why{font-size:15px;line-height:1.6;color:var(--nu-muted);margin-top:8px}
.as-body{display:grid;gap:10px;margin:22px 0 18px}
.as-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.as-o{display:flex;flex-direction:column;align-items:flex-start;gap:2px;border:none;border-radius:18px;padding:15px 16px;font-family:inherit;text-align:start;cursor:pointer;
  color:var(--nu-ink);background:var(--nu-ground);box-shadow:-3px -3px 8px var(--nu-lit),4px 5px 12px var(--nu-shade-soft)}
.as-grid .as-o{align-items:center;text-align:center;padding:14px 6px}
.as-o b{font-size:16.5px;font-weight:800}.as-o span{font-size:13px;font-weight:600;color:var(--nu-muted)}
.as-o.on{box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.as-o.on b::before{content:"\\2713  ";color:#336843}
.as-row{display:flex;align-items:center;gap:10px}
.as-row .pf-in,.as-box input{min-height:56px;font-size:22px}
.as-go{margin-top:auto;border:none;border-radius:20px;padding:17px;font-family:inherit;font-size:17px;font-weight:800;color:var(--nu-ink);cursor:pointer;background:var(--nu-ground);
  box-shadow:-4px -4px 10px var(--nu-lit),5px 6px 14px var(--nu-shade-soft)}
.as-go:active{box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.as-go.nudge{animation:as-nudge .35s}
@keyframes as-nudge{25%{transform:translateX(6px)}75%{transform:translateX(-6px)}}
.gate{margin-top:14px}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
const A = { en: 'You can choose more than one.', de: 'Du kannst mehrere wählen.', es: 'Puedes elegir más de una.', fr: 'Tu peux en choisir plusieurs.', it: 'Puoi sceglierne più di una.', pt: 'Você pode escolher mais de uma.', ja: '複数選べます。', 'zh-Hans': '可以多选。', 'zh-Hant': '可以多選。', ar: 'يمكنك اختيار أكثر من واحد.' };
for (const [l, v] of Object.entries(A)) { const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8')); if (!d['אפשר לבחור יותר מאחת.']) d['אפשר לבחור יותר מאחת.'] = v; fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); }
console.log('ok');
