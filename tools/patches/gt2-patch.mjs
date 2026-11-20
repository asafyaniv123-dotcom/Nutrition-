// node tools/patches/gt2-patch.mjs <index.html> [--undo] - ON THE CLOCK, part two (Asaf, 20 Nov): the end of it (a summary, "save to
//   the log", the cooldown), the next exercise named aloud at every rest in the reader's own language, and a sound switch in the
//   screen's corner. Applies on top of gt-patch.mjs. Exact [old,new] pairs, each old present once; --undo restores byte for byte.
import fs from 'node:fs';
const F = process.argv[2], undo = process.argv.includes('--undo');
if (!F) throw new Error('usage: gt2-patch.mjs <index.html> [--undo]');

const CSS = `/* the end of a follow-along: what was done, and the two things to do next */
.gtd-h{font-size:30px;font-weight:800;color:var(--nu-ink);line-height:1.15;margin-top:4px}
.gtd-st{display:flex;gap:10px;margin-top:16px}
.gtd-st div{flex:1;min-width:0;border-radius:15px;padding:12px 6px;text-align:center;background:var(--nu-ground);
  box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft);display:flex;flex-direction:column;justify-content:center;gap:3px}
.gtd-st b{font-size:17px;font-weight:800;color:var(--nu-ink);font-variant-numeric:tabular-nums}
.gtd-st span{font-size:11.5px;font-weight:700;color:var(--nu-muted)}
.gtd .gts-l{flex:0 1 auto}
.gtd .wtr-ctrl{flex-direction:column;gap:10px}
.gtd .wtr-b{flex:none;padding:15px 10px}
.gtd .wtr-b.on{color:var(--nu-muted);box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.wtr.gt .wtr-ttl{flex:1;min-width:0}
.gt-snd{margin-inline-start:auto}
.wh-gt{font-size:11px;font-weight:700;color:var(--nu-muted)}
`;

const JS = `/* ── THE SOUND, THREE WAYS (20 Nov) ──
   A switch in the corner of the follow screen: sound and voice, sounds only,
   or nothing. It belongs to ON THE CLOCK alone - every other timer keeps the
   sound it always had, and the app's own sound setting still silences all
   of it. */
var GT_AUD_KEY='fit_gtaudio',GT_AUDS=['all','tones','off'];
function gtAudMode(){try{var v=localStorage.getItem(GT_AUD_KEY);if(GT_AUDS.indexOf(v)>=0)return v;}catch(e){}return 'all';}
function gtAud(){return (_wtPlan&&_wtPlan.kind==='follow')?gtAudMode():'all';}
function gtAudLabel(m){return m==='off'?_t('מושתק'):m==='tones'?_t('צלילים בלבד'):_t('צליל וקול');}
function gtAudNext(){
  var m=GT_AUDS[(GT_AUDS.indexOf(gtAudMode())+1)%GT_AUDS.length];
  try{localStorage.setItem(GT_AUD_KEY,m);}catch(e){}
  if(m!=='all')try{if(window.speechSynthesis)window.speechSynthesis.cancel();}catch(e){}
  gtTx('gt-snd',gtAudLabel(m));
}
/* ── THE NEXT ONE, ALOUD ──
   At every rest: "Rest. Next exercise: Barbell Bench Press", in the reader's
   own language. The coach's four words stay English by decision (see THE
   VOICE); this sentence carries a NAME, and a name read in the wrong language
   is not a name - so it is read by a voice for her language or not at all.
   A phone with no such voice stays quiet, and the screen still says it. */
var GT_TTS_LANG={he:'he-IL',en:'en-US',de:'de-DE',es:'es-ES',fr:'fr-FR',it:'it-IT',pt:'pt-BR',ja:'ja-JP','zh-Hans':'zh-CN','zh-Hant':'zh-TW',ar:'ar-SA'};
function gtVoiceFor(tag){
  try{
    var v=window.speechSynthesis.getVoices()||[],pre=tag.split('-')[0].toLowerCase(),best=null,bs=-1e9,i,s,l,n;
    for(i=0;i<v.length;i++){
      l=String(v[i].lang||'').replace('_','-').toLowerCase();
      if(l.split('-')[0]!==pre)continue;
      n=v[i].name||'';s=0;
      if(l===tag.toLowerCase())s+=20;
      /* Traditional Chinese is read from Taiwan or Hong Kong, not the mainland */
      if(tag==='zh-TW'&&/-(tw|hk)/.test(l))s+=15;
      if(/natural|online|google|premium|enhanced|neural/i.test(n))s+=30;
      if(WT_VOICE_BAD.test(n))s-=50;
      if(v[i]['default'])s+=3;
      if(s>bs){bs=s;best=v[i];}
    }
    return best;
  }catch(e){return null;}
}
function gtSpeak(line){
  if(!line||gtAud()!=='all')return;
  if(typeof sndOn==='function'&&!sndOn())return;
  try{
    var S=window.speechSynthesis;
    if(!S||!window.SpeechSynthesisUtterance)return;
    var tag=GT_TTS_LANG[appLang()]||'en-US',v=gtVoiceFor(tag);
    if(!v)return;
    if(S.speaking||S.pending)S.cancel();
    var u=new SpeechSynthesisUtterance(line);
    u.lang=v.lang||tag;u.voice=v;u.rate=1;u.pitch=1;
    S.speak(u);
  }catch(e){}
}
function gtSayNext(){
  var p=_wtPlan,at,i,e;
  if(!p)return;
  at=wtAt((_wtPaused||Date.now())-_wtFrom);
  if(!at)return;
  i=at.idx+1;
  if(i>=p.names.length)return;
  e=exByName(p.names[i]);
  gtSpeak(_t('מנוחה. התרגיל הבא: {name}',{name:e?exTitle(e):exLabel(p.names[i])}));
}
/* ── THE END OF IT ──
   The clock closes onto a summary: how long, how many exercises and sets,
   what they were - and the two things that come next, writing it into the
   log and stretching what worked. "סיים" in the middle lands here too, with
   what was done so far; with nothing done yet it is only leaving. */
var _gtSum=null;
function gtDoneCount(){
  var p=_wtPlan,at;
  if(!p)return 0;
  at=wtAt((_wtPaused||Date.now())-_wtFrom);
  if(!at||at.phase==='prep')return 0;
  if(at.phase==='done')return p.names.length;
  return at.idx+(at.phase==='rest'?1:0);
}
function gtFinish(natural){
  var p=_wtPlan,n,by=[],seen={},i,nm;
  if(!p||p.kind!=='follow'||!p.gt||p.fin)return;
  p.fin=1;
  n=gtDoneCount();
  for(i=0;i<n;i++){
    nm=p.names[i];
    if(!seen.hasOwnProperty(nm)){seen[nm]=by.length;by.push({name:nm,n:0});}
    by[seen[nm]].n++;
  }
  _gtSum={title:p.gt.title,work:p.work,rest:p.rest,sets:p.gt.sets,
          secs:Math.max(0,Math.round(((_wtPaused||Date.now())-_wtFrom)/1000)),ex:by,saved:false};
  /* a natural end lets the last chord and "סיימת" in the ring land first */
  setTimeout(function(){wtDone();gtSumPaint();},natural?1400:0);
}
function gtStop(){
  if(gtDoneCount()<1){wtDone();return;}
  if(_wtIv)wtPause();
  gtFinish(false);
}
function gtSumPaint(){
  var s=_gtSum,el=document.getElementById('gts'),h,i,e,sets=0;
  if(!s){if(el)el.remove();return;}
  if(!el){document.body.insertAdjacentHTML('beforeend','<div id="gts" class="wtr gts gtd"></div>');el=document.getElementById('gts');}
  for(i=0;i<s.ex.length;i++)sets+=s.ex[i].n;
  h='<div class="wtr-top"><span class="wtr-ttl">'+esc(_t('אימון על זמן'))+'</span></div>';
  h+='<div class="gt-hd"><div class="gtd-h">'+esc(_t('סיימת'))+'</div><div class="gt-of">'+esc(s.title)+'</div></div>';
  h+='<div class="gtd-st"><div><b>'+wtFace(s.secs)+'</b><span>'+esc(_t('זמן כולל'))+'</span></div>'+
     '<div><b>'+esc(_t('{n} תרגילים',{n:s.ex.length}))+'</b></div>'+
     '<div><b>'+esc(_t('{n} סטים',{n:sets}))+'</b></div></div>';
  h+='<div class="gts-l"><div class="st-list">';
  for(i=0;i<s.ex.length;i++){
    e=exByName(s.ex[i].name);
    h+='<div class="st-li"><span class="st-th">'+
       (e&&EX_DEMO[exDemoId(e)]?'<video src="'+stVidSrc(e)+'" muted loop playsinline autoplay preload="metadata" aria-hidden="true"></video>':'')+
       '</span><span class="st-x"><b>'+esc(e?exTitle(e):exLabel(s.ex[i].name))+'</b><span>'+esc(_t('{n} סטים',{n:s.ex[i].n}))+'</span></span></div>';
  }
  h+='</div></div><div class="wtr-ctrl">';
  h+=s.saved?'<button class="wtr-b on" disabled>'+esc(_t('נשמר ביומן'))+'</button>'
            :'<button class="wtr-b" onclick="gtSave()">'+esc(_t('לשמור ביומן'))+'</button>';
  h+='<button class="wtr-b" onclick="gtCool()">'+esc(_t('שחרור ומתיחות לשרירים שעבדו היום'))+'</button>';
  h+='<button class="wtr-b stop" onclick="gtSumClose()">'+esc(_t('סגור'))+'</button></div>';
  el.innerHTML=h;
}
/* INTO THE LOG, as a workout like any other - its date, its name, its length,
   its exercises - so the history, the week and the streak all count it. The
   timed sets go in their OWN field, never in .sets: a set there with no
   weight and no reps would become "best: 0" on the exercise's card and the
   "last time" the next logged workout fills its boxes from. */
function gtSave(){
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
function gtCool(){
  var s=_gtSum,ids;
  if(!s)return;
  ids=stCooldown(s.ex.map(function(x){return {name:x.name,sets:new Array(x.n)};}));
  gtSumClose();
  if(ids.length)stStart(ids.join(','));
}
function gtSumClose(){
  _gtSum=null;
  var el=document.getElementById('gts');if(el)el.remove();
  if(currentModule==='fitness')renderFitness();
}
`;

const E = [
  ['.xd-say.st{background:rgba(111,190,180,.14);color:#2f6f66}', CSS + '.xd-say.st{background:rgba(111,190,180,.14);color:#2f6f66}'],
  ['/* ── THE DOOR ── four routines, and the way into the stretches themselves */', JS + '/* ── THE DOOR ── four routines, and the way into the stretches themselves */'],
  ["function wtSound(kind){\n  var a=sndCtx();", "function wtSound(kind){\n  if(gtAud()==='off')return;\n  var a=sndCtx();"],
  ["function wtSay(key){\n  if(typeof sndOn==='function'&&!sndOn())return;", "function wtSay(key){\n  if(typeof sndOn==='function'&&!sndOn())return;\n  if(gtAud()!=='all')return;"],
  ["  if(phase==='rest'){wtSound('rest');wtCue('rest');return;}",
   `  if(phase==='rest'){
    wtSound('rest');
    /* ON THE CLOCK the rest names what comes next, in her own language: the
       word stays on the screen, and the sentence takes the English clip's place */
    if(_wtPlan&&_wtPlan.kind==='follow'){_wtCueWord=WT_SAY.rest;_wtCueUntil=Date.now()+1800;gtSayNext();}
    else wtCue('rest');
    return;
  }`],
  ["      wtOfferSave();\n    }\n    wtPaint();\n    return;", "      wtOfferSave();\n      if(_wtPlan&&_wtPlan.kind==='follow')gtFinish(true);\n    }\n    wtPaint();\n    return;"],
  [`      wtFace(_wtPlan.work)+(_wtPlan.rest>0?' / '+wtFace(_wtPlan.rest):'')+'</span>':'')+
    '</div>';`,
   `      wtFace(_wtPlan.work)+(_wtPlan.rest>0?' / '+wtFace(_wtPlan.rest):'')+'</span>':'')+
    (plan&&_wtPlan.kind==='follow'?'<button class="wtr-min gt-snd" id="gt-snd" onclick="gtAudNext()">'+gtAudLabel(gtAudMode())+'</button>':'')+
    '</div>';`],
  [`  h+='<button class="wtr-b stop" onclick="wtDone()">'+_t('סיים')+'</button>';`,
   `  h+='<button class="wtr-b stop" onclick="'+(plan&&_wtPlan.kind==='follow'?'gtStop()':'wtDone()')+'">'+_t('סיים')+'</button>';`],
  [`    h+='<div class="wh-n">'+esc(entry.name)+'</div>';`,
   `    h+='<div class="wh-n">'+esc(entry.name)+(entry.follow?' <span class="wh-gt">'+esc(_t('אימון על זמן'))+'</span>':'')+'</div>';`],
  /* a workout on the clock lifted nothing anyone weighed: its card says how many sets, not "0 kg volume" */
  [`    h+='<span class="wh-v">'+nfmt(volDisp(vol))+' '+_t('{u} נפח',{u:weightUnit()})+'</span>';`,
   `    if(entry.follow)h+='<span class="wh-v">'+_t('{n} סטים',{n:entry.exercises.reduce(function(a,ex){return a+((ex.timed||[]).length);},0)})+'</span>';
    else h+='<span class="wh-v">'+nfmt(volDisp(vol))+' '+_t('{u} נפח',{u:weightUnit()})+'</span>';`],
  /* the week counts a set on the clock as a set, and gives it to its muscle - it weighs nothing, so volume and reps stay as they are */
  [`      var g=muscleGroupOf(exs[j].name),st=exs[j].sets||[];`,
   `      var g=muscleGroupOf(exs[j].name),st=exs[j].sets||[];
      if((exs[j].timed||[]).length){out.sets+=exs[j].timed.length;out.byMuscle[g]=(out.byMuscle[g]||0)+exs[j].timed.length;}`],
];

let s = fs.readFileSync(F, 'utf8');
for (const [o, n] of undo ? E.slice().reverse() : E) {
  const [a, b] = undo ? [n, o] : [o, n], c = s.split(a).length - 1;
  if (c !== 1) throw new Error(`${undo ? 'undo' : 'apply'}: expected 1 of ${JSON.stringify(a.slice(0, 70))}, found ${c}`);
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(undo ? `undone ${E.length} edits` : `applied ${E.length} edits`);
