/* Four from the phone (Asaf, 24 Oct):
 *  1, 3. "My programs" and the new-program wizard had no way back - the
 *     same ‹ חזרה pill as the rest of fitness, on both.
 *  2. "+ program" beside "build me a program" beside "build a workout ahead",
 *     and two lists (my workouts / tracked programs) - "a page that became
 *     noise for no reason". One list, and one "+ new" that asks which kind.
 *  4. "built for you" as a questionnaire: one question a screen - how much
 *     time, where, which muscles, an emphasis if more than one - then build.
 *     The time is new: it caps the sets (about three minutes a set with its
 *     rest), trimming the furthest-behind muscles last. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* ── 1. back on My programs ── */
rep(`  var h='<div style="padding-bottom:24px">';
  /* 1. starting a workout - the header already names the screen */
  h+=fitStartCardHTML(templates);`,
`  var h='<div style="padding-bottom:24px">';
  h+='<div style="margin-bottom:12px"><button class="fit-back" onclick="_fitView=\\'home\\';renderFitness()">&#8249; '+_t('חזרה')+'</button></div>';
  h+=fitStartCardHTML(templates);`);

/* ── 2. one list, one + ── */
rep(`  if(templates.length){
    h+='<div class="fs-lab">'+_t('האימונים שלי')+'</div>';
    for(var i=0;i<templates.length;i++){`, `  var progs=loadPrograms();
  /* ONE LIST (24 Oct): the workouts saved here and the programs brought from a
     gym were two cards with three buttons between them. They are all things
     you start, so they are one list, and one "+" asks which kind is new. */
  if(templates.length||progs.length){
    for(var i=0;i<templates.length;i++){`);
rep(`  } else {
    h+='<div class="fs-empty">'+_t('אין עדיין אימונים שמורים.')+'<br>'+_t('סיים אימון חדש ושמור אותו, או בנה אחד מראש.')+'</div>';
  }
  h+='<button class="fs-plan" onclick="startFitEdit(-1)">'+_t('+ בנה אימון מראש')+'</button>';
  return h+'</div>';`, `    for(var pi=0;pi<progs.length;pi++)
      h+='<div class="fs-row"><button class="fs-go" onclick="_fitView=\\'view-program\\';_fitProgIdx='+pi+';renderFitness()">'+
         '<b>'+esc(progLabel(progs[pi].name))+'</b><span>'+_t('{n} תרגילים',{n:progs[pi].exercises.length})+'</span></button>'+
         '<button class="fs-ed" onclick="_fitView=\\'edit-program\\';_fitProgIdx='+pi+';renderFitness()">'+_t('ערוך')+'</button></div>';
  } else {
    h+='<div class="fs-empty">'+_t('אין עדיין אימונים שמורים.')+'<br>'+_t('סיים אימון חדש ושמור אותו, או בנה אחד מראש.')+'</div>';
  }
  h+='<button class="fs-plan" onclick="fitNewProgSheet()">+ '+_t('תוכנית חדשה')+'</button>';
  return h+'</div>';`);
const a = s.indexOf(`  // Programs brought in from a gym\n  var progs=loadPrograms();`);
const endTok = `\n  h+='</div>';\n\n  return h+'</div>';\n}\n\nfunction renderFitWeights(){`;
const b = s.indexOf(endTok, a);
if (a < 0 || b < 0 || b - a > 3000) { console.log('programs card anchor', a, b); process.exit(1); }
s = s.slice(0, a) + `  /* (the programs from a gym are in the one list above now) */` + `\n\n  return h+'</div>';\n}\n\nfunction renderFitWeights(){` + s.slice(b + endTok.length);
rep(`function fitStartCardHTML(templates){`, `/* the one "+": which kind of new */
function fitNewProgSheet(){
  fitSheetClose();
  var ov=document.createElement('div');ov.className='cf-ov fss-ov';ov.id='fss-ov';
  ov.innerHTML='<div class="cf-card fss"><div class="cf-q" style="margin-bottom:12px">'+esc(_t('תוכנית חדשה'))+'</div><div class="fss-l">'+
    '<button onclick="fitSheetClose();startFitEdit(-1)"><b>'+esc(_t('+ בנה אימון מראש').replace(/^\\+\\s*/,''))+'</b></button>'+
    '<button onclick="fitSheetClose();genProgOpen()"><b>'+esc(_t('בנה לי תוכנית'))+'</b></button>'+
    '<button onclick="fitSheetClose();startProgramWizard()"><b>'+esc(_t('הוסף תוכנית מחדר כושר'))+'</b></button>'+
    '</div><button class="cf-no" style="width:100%;margin-top:12px" onclick="fitSheetClose()">'+esc(_t('ביטול'))+'</button></div>';
  document.body.appendChild(ov);
  ov.onclick=function(ev){if(ev.target===ov)fitSheetClose();};
}
function fitStartCardHTML(templates){`);

/* ── 1. back on the program wizard ── */
rep(`  var h='<div style="padding-bottom:30px">';
  // Progress bar
  h+='<div style="height:3px;background:var(--line);border-radius:2px;margin-bottom:24px"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,var(--violet-300),var(--violet-500));`,
`  var h='<div style="padding-bottom:30px">';
  h+='<div style="margin-bottom:14px"><button class="fit-back" onclick="_fitView=\\'start\\';renderFitness()">&#8249; '+_t('חזרה')+'</button></div>';
  // Progress bar
  h+='<div style="height:3px;background:var(--line);border-radius:2px;margin-bottom:24px"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,var(--violet-300),var(--violet-500));`);

/* ── 4. the questionnaire ── */
rep(`  _gen={def:d,on:on,equip:genEquip(),emphasis:''};`, `  var mn=30;try{mn=+localStorage.getItem('gen_min')||30;}catch(e){}
  _gen={def:d,on:on,equip:genEquip(),emphasis:'',min:mn,step:0};`);
rep(`  if(!ms.length){showToast(''+_t('בחר שריר אחד לפחות')+'');return;}
  var rows=genPick({muscles:ms,equip:GEN_EQUIP[_gen.equip]||GEN_EQUIP.gym,
                    sets:_gen.on,emphasis:_gen.emphasis});`,
`  if(!ms.length){showToast(''+_t('בחר שריר אחד לפחות')+'');return;}
  /* THE TIME CAPS THE SETS: about three minutes a set with its rest. Shared
     out in proportion, two at least each, and if that is still too many the
     muscles chosen last are the ones that wait for next time. */
  var cap=Math.max(4,Math.floor((_gen.min||30)/3)),tot=0,sets={},m2;
  for(k=0;k<ms.length;k++)tot+=_gen.on[ms[k]];
  for(k=0;k<ms.length;k++)sets[ms[k]]=tot>cap?Math.max(2,Math.round(_gen.on[ms[k]]*cap/tot)):_gen.on[ms[k]];
  for(tot=0,k=0;k<ms.length;k++)tot+=sets[ms[k]];
  while(tot>cap&&ms.length>1){m2=ms.pop();tot-=sets[m2];delete sets[m2];}
  var rows=genPick({muscles:ms,equip:GEN_EQUIP[_gen.equip]||GEN_EQUIP.gym,
                    sets:sets,emphasis:(sets[_gen.emphasis]?_gen.emphasis:'')});`);
rep(`function genEquipSet(v){
  if(_gen)_gen.equip=v;`, `function genMinSet(v){
  if(_gen)_gen.min=v;
  try{localStorage.setItem('gen_min',String(v));}catch(e){}
  renderFitness();
}
function genStep(d){
  if(!_gen)return;
  var last=genSteps()-1;
  if(d<0&&_gen.step===0){_gen=null;_fitView='home';renderFitness();return;}
  _gen.step=Math.max(0,Math.min(last,_gen.step+d));
  renderFitness();
}
/* the emphasis is asked only when there is more than one muscle to lean on */
function genSteps(){
  var n=0,k;for(k in _gen.on)if(_gen.on.hasOwnProperty(k))n++;
  return n>1?4:3;
}
function genEquipSet(v){
  if(_gen)_gen.equip=v;`);

/* the render: one question at a time */
rep(`  var g=_gen,h='<div style="padding-bottom:24px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">';
  h+='<div style="font-size:15px;font-weight:800;color:var(--ink)">'+_t('אימון שנבנה לך')+'</div>';
  h+='<button class="fit-back" onclick="_gen=null;_fitView=\\'home\\';renderFitness()">&#8249; '+_t('חזרה')+'</button>';
  h+='</div>';

  /* ── what is short, already chosen ── */
  h+='<div class="gn-c"><div class="gn-h">'+_t('מה חסר לך השבוע')+'</div>';`,
`  var g=_gen,h='<div style="padding-bottom:24px">',ns=genSteps();
  if(g.step>=ns)g.step=ns-1;
  /* A QUESTIONNAIRE (24 Oct): one question a screen, as the door to כושר
     already asks its own - time, place, muscles, and an emphasis when there
     is more than one. The back pill steps back; on the first it leaves. */
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">';
  h+='<div class="gn-st">'+_t('שאלה {a} מתוך {b}',{a:g.step+1,b:ns})+'</div>';
  h+='<button class="fit-back" onclick="genStep(-1)">&#8249; '+_t('חזרה')+'</button>';
  h+='</div>';

  if(g.step===0){
    h+='<div class="gn-c"><div class="gn-q">'+_t('כמה זמן יש לך?')+'</div><div class="gn-w">';
    [20,30,45,60].forEach(function(m){
      h+='<button class="gn-e'+(g.min===m?' on':'')+'" onclick="genMinSet('+m+')">'+_t('{n} דקות',{n:m})+'</button>';});
    h+='</div></div>';
  }
  if(g.step===1){
    h+='<div class="gn-c"><div class="gn-q">'+_t('איפה אתה מתאמן')+'</div><div class="gn-w">';
    for(var e=0;e<GEN_EQUIP_ORDER.length;e++)
      h+='<button class="gn-e'+(g.equip===GEN_EQUIP_ORDER[e]?' on':'')+'" onclick="genEquipSet(\\''+GEN_EQUIP_ORDER[e]+'\\')">'+genEquipLabel(GEN_EQUIP_ORDER[e])+'</button>';
    h+='</div></div>';
  }
  if(g.step===2){
  /* ── what is short, already chosen ── */
  h+='<div class="gn-c"><div class="gn-q">'+_t('מה חסר לך השבוע')+'</div>';`);
rep(`  h+='</div></div>';

  /* ── where, remembered ── */
  h+='<div class="gn-c"><div class="gn-h">'+_t('איפה אתה מתאמן')+'</div>';
  h+='<div class="gn-w">';
  for(var e=0;e<GEN_EQUIP_ORDER.length;e++)
    h+='<button class="gn-e'+(g.equip===GEN_EQUIP_ORDER[e]?' on':'')+'" onclick="genEquipSet(\\''+GEN_EQUIP_ORDER[e]+'\\')">'+genEquipLabel(GEN_EQUIP_ORDER[e])+'</button>';
  h+='</div></div>';

  /* ── one muscle to lean on, optional ── */
  var chosen=[];
  for(var k in g.on)if(g.on.hasOwnProperty(k))chosen.push(k);
  if(chosen.length>1){
    h+='<div class="gn-c"><div class="gn-h">'+_t('דגש')+'</div>';`,
`  h+='</div></div>';
  }

  /* ── one muscle to lean on, optional ── */
  var chosen=[];
  for(var k in g.on)if(g.on.hasOwnProperty(k))chosen.push(k);
  if(g.step===3&&chosen.length>1){
    h+='<div class="gn-c"><div class="gn-q">'+_t('דגש')+'</div>';`);
rep(`  h+='<div class="gn-g">'+_t('לפי המטרה שלך: {g}',{g:fitGoal().t})+'</div>';
  h+='<button class="gn-go" onclick="genBuild()">'+_t('בנה לי אימון')+'</button>';`,
`  if(g.step===ns-1){
    h+='<div class="gn-g">'+_t('לפי המטרה שלך: {g}',{g:fitGoal().t})+'</div>';
    h+='<button class="gn-go" onclick="genBuild()">'+_t('בנה לי אימון')+'</button>';
  } else h+='<button class="gn-go" onclick="genStep(1)">'+_t('המשך')+'</button>';`);
rep(`.fss-l{display:flex;`, `.gn-st{font-size:12.5px;font-weight:800;color:var(--nu-muted)}
.gn-q{font-size:20px;font-weight:800;color:var(--nu-ink,#4a453f);margin-bottom:14px;line-height:1.3}
.fss-l{display:flex;`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
