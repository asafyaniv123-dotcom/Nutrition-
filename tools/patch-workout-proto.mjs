/* The workout screen as the approved prototype (review/workout-proto, round
 * four, 24 Oct), applied on top of option F:
 *  - a finished exercise is marked by a small green check only (marker A),
 *    the chip itself unchanged - no sage wash;
 *  - the sets as rows: set / last time / today, the next one outlined;
 *  - weight typed by hand, reps with − and +, stacked beside the effort wheel;
 *  - the rest as a vertical wheel with every stop, beside the note, which is
 *    an open box saved as it is typed;
 *  - the stopwatch joins swap / superset / remove in the action row. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* 1. marker A */
rep(`/* finished: pressed in, a sage light inside, a deep green check */
.fx-tab.dn{color:var(--nu-ink,#4a453f);background:radial-gradient(120% 140% at 50% 120%,rgba(143,199,158,.42),rgba(143,199,158,.12) 55%,var(--nu-ground,#e9e7e3) 85%);
  box-shadow:inset 2px 3px 6px var(--nu-shade,rgba(176,168,156,.44)),inset -2px -2px 5px var(--nu-lit,rgba(255,255,255,.95)),inset 0 0 0 1px rgba(111,178,131,.18)}
.fx-tab.dn::before{`, `/* finished: the chip as it was, and a small deep-green check beside the name
   (marker A, 24 Oct - the sage wash read as a bright green fill) */
.fx-tab.dn::before{`);
rep(`center/11px no-repeat}
.fx-howb{`, `center/11px no-repeat}
.ex-chip.dn{display:inline-flex;align-items:center}
.fx-howb{`);

/* 2. the sets as rows */
rep(`.fx-sets{display:grid;grid-template-columns:repeat(var(--n),1fr);gap:8px}
.fx-sc{display:flex;flex-direction:column;align-items:center;gap:2px;border:none;border-radius:16px;padding:9px 4px;font-family:inherit;color:var(--nu-ink);
  background:var(--nu-ground);box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.fx-sc-n{font-size:12px;font-weight:800;color:var(--nu-muted)}
.fx-sc-w{font-size:13px;font-weight:700;color:var(--nu-muted)}
.fx-sc-t{font-size:15.5px;font-weight:800}
.fx-sc.ok{cursor:pointer;background:radial-gradient(120% 160% at 50% 120%,rgba(143,199,158,.36),rgba(143,199,158,.1) 55%,var(--nu-ground) 85%)}
.fx-sc.ok .fx-sc-t::before{content:"✓ ";color:#3f7a52}
.fx-sc.cur{outline:2px solid color-mix(in srgb,var(--terra-500) 65%,transparent);outline-offset:-2px}
.fx-sc.sel{outline:2px solid #6fb283;outline-offset:-2px}`,
`/* THE SETS AS ROWS: the set, what it was last time, and today beside it */
.fx-rows{display:grid;grid-template-columns:28px 1fr 1fr;gap:6px 8px;align-items:center}
.fx-rows.one{grid-template-columns:28px 1fr}
.fx-rh{font-size:12px;font-weight:800;color:var(--nu-muted);text-align:center}
.fx-ri{font-size:15px;font-weight:800;color:var(--nu-muted);text-align:center}
.fx-rw{font-size:14.5px;font-weight:700;color:var(--nu-muted);text-align:center}
.fx-sc{display:flex;align-items:center;justify-content:center;gap:6px;min-height:38px;border:none;border-radius:12px;padding:8px 6px;font-family:inherit;
  font-size:15px;font-weight:800;color:var(--nu-ink);background:var(--nu-ground);box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.fx-sc.ok{cursor:pointer}
.fx-sc.ok::before{content:"";flex:none;width:15px;height:15px;border-radius:50%;
  background:#3f7a52 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 12.5 4 4 8-9'/%3E%3C/svg%3E") center/10px no-repeat}
.fx-sc.cur{color:var(--nu-muted);font-weight:700;outline:2px solid color-mix(in srgb,var(--terra-500) 55%,transparent);outline-offset:-2px}
.fx-sc.sel{outline:2px solid #3f7a52;outline-offset:-2px}
.fx-sc .fx-e{flex:none;width:7px;height:7px;border-radius:50%;background:var(--c)}`);
rep(`/* THE SETS AS CARDS ACROSS: last time above, today below, the one you are
   on outlined. A logged set is pressed and lit sage, tapped to edit. */
function exSetCardsHTML(ex,curPR){
  var prev=exLastTime(ex.name),mine=ex.sets||[],ps=(prev&&prev.sets)||[],i,h,
      n=Math.max(+ex.targetSets||0,mine.length+1,ps.length,1),cardio=isCardioEx(ex.name);
  var num=function(st){return (st.weight?nfmt(edWeightVal(st.weight))+'&times;':'')+nfmt(st.reps);};
  h='<div class="fx-sets" style="--n:'+Math.min(n,4)+'">';
  for(i=0;i<n;i++){
    var m=mine[i],p=ps[i],cur=(i===mine.length);
    h+='<'+(m?'button onclick="setSelOpen('+i+')"':'div')+' class="fx-sc'+(m?' ok':'')+(cur?' cur':'')+(_setSel===i?' sel':'')+'">'+
       '<span class="fx-sc-n">'+_t('סט {n}',{n:i+1})+'</span>'+
       (prev?'<span class="fx-sc-w">'+(p&&!cardio?num(p):'&ndash;')+'</span>':'')+
       '<span class="fx-sc-t">'+(m?(cardio?cardioRowHTML(m):num(m))+((curPR&&m.weight>curPR)?' &#9733;':''):(cur?_t('עכשיו'):'&nbsp;'))+'</span>'+
       '</'+(m?'button':'div')+'>';
  }
  h+='</div>';
  if(prev)h+='<div class="fx-sets-l">'+_t('בפעם הקודמת')+' &middot; '+agoText(prev.date)+'</div>';
  else if(!mine.length)h+='<div class="fw-prev none">'+_t('הפעם הראשונה שאתה עושה את זה')+' &mdash; '+_t('מה שתרשום היום יהיה מה שתנסה לעבור בפעם הבאה.')+'</div>';
  return h;
}`, `/* THE SETS AS ROWS (24 Oct, the approved prototype): the set, what it was
   last time, and today beside it - the two numbers that are compared sit on
   one line. The next one is outlined; a logged one carries a small check and
   is tapped to edit. */
function exSetCardsHTML(ex,curPR){
  var prev=exLastTime(ex.name),mine=ex.sets||[],ps=(prev&&prev.sets)||[],i,h,
      n=Math.max(+ex.targetSets||0,mine.length+1,ps.length,1),cardio=isCardioEx(ex.name);
  var num=function(st){return (st.weight?nfmt(edWeightVal(st.weight))+'&times;':'')+nfmt(st.reps);};
  h='<div class="fx-rows'+(prev?'':' one')+'"><span class="fx-rh">'+_t('סט')+'</span>'+
    (prev?'<span class="fx-rh">'+agoText(prev.date)+'</span>':'')+
    '<span class="fx-rh">'+_t('היום')+'</span>';
  for(i=0;i<n;i++){
    var m=mine[i],p=ps[i],cur=(i===mine.length),eff=m?effortFromRPE(m.rpe):'';
    h+='<span class="fx-ri">'+nfmt(i+1)+'</span>';
    if(prev)h+='<span class="fx-rw">'+(p&&!cardio?num(p):'&ndash;')+'</span>';
    h+='<'+(m?'button onclick="setSelOpen('+i+')"':'div')+' class="fx-sc'+(m?' ok':'')+(cur?' cur':'')+(_setSel===i?' sel':'')+'">'+
       (m?(cardio?cardioRowHTML(m):num(m))+((curPR&&m.weight>curPR)?' &#9733;':'')+
          (eff===''?'':'<i class="fx-e" style="--c:'+effortDot(m.rpe)+'"></i>'):(cur?_t('עכשיו'):''))+
       '</'+(m?'button':'div')+'>';
  }
  h+='</div>';
  if(!prev&&!mine.length)h+='<div class="fw-prev none">'+_t('הפעם הראשונה שאתה עושה את זה')+' &mdash; '+_t('מה שתרשום היום יהיה מה שתנסה לעבור בפעם הבאה.')+'</div>';
  return h;
}`);

/* 3. weight typed, big; reps with − and + */
rep(`  h+='<div><div class="fw-fl">'+_t('משקל')+' ('+weightUnit()+')'+'</div><input id="fit-w" class="mtnm" type="number" step="0.5" placeholder="&ndash;" value="'+esc(_boxW)+'" oninput="fitTyped();plateHint()" style="width:100%;min-height:46px;padding:12px 10px;border-radius:12px;font-size:16px;font-weight:700"></div>';
  h+='<div><div class="fw-fl">'+_t('חזרות')+'</div><input id="fit-r" class="mtnm" type="number" placeholder="'+nfmt(ex.targetReps)+'" value="'+esc(_boxR)+'" oninput="fitTyped()" style="width:100%;min-height:46px;padding:12px 10px;border-radius:12px;font-size:16px;font-weight:700"></div>';`,
`  /* THE WEIGHT IS TYPED (24 Oct): no steps, because nobody knows a gym's
     plates. The reps keep − and +, which is the ordinary change between sets. */
  h+='<label class="fx-in"><span class="fw-fl">'+_t('משקל')+' ('+weightUnit()+')'+'</span><input id="fit-w" class="fx-inn" type="number" inputmode="decimal" step="0.5" placeholder="&ndash;" value="'+esc(_boxW)+'" oninput="fitTyped();plateHint()"></label>';
  h+='<div class="fx-in"><span class="fw-fl">'+_t('חזרות')+'</span><input id="fit-r" class="fx-inn" type="number" inputmode="numeric" placeholder="'+nfmt(ex.targetReps)+'" value="'+esc(_boxR)+'" oninput="fitTyped()">'+
     '<div class="fx-pm"><button onclick="fxRepStep(-1)" aria-label="&minus;">&minus;</button><button onclick="fxRepStep(1)" aria-label="+">+</button></div></div>';`);
rep(`.fw-fields2{grid-template-columns:1fr;margin-bottom:0}`, `.fw-fields2{grid-template-columns:1fr;margin-bottom:0;gap:8px}
.fx-in{display:block;border-radius:14px;padding:7px 6px 9px;text-align:center;cursor:text;background:var(--nu-ground);
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.fx-in .fw-fl{display:block;margin-bottom:0}
.fx-inn{width:100%;border:none;background:none;text-align:center;font-family:inherit;font-size:28px;font-weight:800;color:var(--nu-ink);outline:none;padding:4px 0 2px;
  font-variant-numeric:tabular-nums;-moz-appearance:textfield}
.fx-inn::-webkit-outer-spin-button,.fx-inn::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.fx-pm{display:flex;justify-content:center;gap:12px;margin-top:2px}
.fx-pm button{width:34px;height:34px;border-radius:50%;border:none;font-family:inherit;font-size:18px;font-weight:700;line-height:1;color:var(--nu-ink);cursor:pointer;background:var(--nu-ground);
  box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}
.fx-pm button:active{box-shadow:inset 1px 2px 4px var(--nu-shade),inset -1px -1px 3px var(--nu-lit)}`);
rep(`function fitTypedClear(){_fitTyped=null;}`, `function fitTypedClear(){_fitTyped=null;}
/* − and + beside the reps: from what is in the box, or the target if empty */
function fxRepStep(d){
  var r=document.getElementById('fit-r');if(!r)return;
  var v=parseInt(r.value,10);if(isNaN(v))v=parseInt(r.placeholder,10)||0;
  r.value=Math.max(0,v+d);fitTyped();
}`);

/* 4. the stopwatch joins the action row */
rep(`  h+='<button class="wx-b wx-del" onclick="wxRemove('+w.currentEx+')" aria-label="'+_t('הסר תרגיל')+'">'+`,
`  h+='<button class="wx-b" onclick="wtToggle()"><i class="wx-i">&#9201;</i>'+_t('סטופר')+'</button>';
  h+='<button class="wx-b wx-del" onclick="wxRemove('+w.currentEx+')" aria-label="'+_t('הסר תרגיל')+'">'+`);

/* 5. the rest wheel and the note, side by side */
rep(`  h+='<div class="fw-now fx-restcard">'+restRowHTML()+exNoteHTML(ex,w.currentEx)+'</div>';`,
`  /* THE REST BESIDE THE NOTE (24 Oct): the rest is a wheel with every stop,
     the same wheel the effort uses; the note is an open box, saved as it is
     typed - it is read between sets, so it should not need opening. */
  h+='<div class="fw-now fx-restcard"><div class="fx-two">'+
     '<div><div class="fw-fl">'+_t('מנוחה|טיימר')+'</div>'+restWheelVHTML()+
     '<button class="fw-rb go fx-go" onclick="restGo()">'+_t('התחל')+'</button></div>'+
     '<div><div class="fw-fl">'+_t('הערה על התרגיל')+'</div>'+
     '<textarea class="fx-note" maxlength="200" placeholder="'+_t('מושב 4, רגליים על הקו השלישי…')+'" '+
     'oninput="exNoteSet(_fitWorkout.exercises[_fitWorkout.currentEx].name,this.value)">'+esc(exNoteGet(ex.name))+'</textarea></div>'+
     '</div></div>';`);
rep(`.fx-restcard .fw-restset{margin-bottom:10px}`, `.fx-two{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start}
.fx-go{width:100%;margin-top:8px;min-height:40px}
.fx-note{display:block;width:100%;height:226px;border:none;border-radius:14px;padding:11px 12px;resize:none;outline:none;
  font-family:inherit;font-size:14px;font-weight:600;line-height:1.45;color:var(--nu-ink);text-align:start;background:var(--nu-ground);
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.fx-note::placeholder{color:var(--nu-muted)}`);

/* the vertical rest wheel: the effort wheel's rows, its paint and its sync */
rep(`var REST_STOPS=[0,30,45,60,75,90,120,150,180];`, `var REST_STOPS=[0,30,45,60,75,90,120,150,180];
/* THE REST AS AN UPRIGHT WHEEL (24 Oct), built from the effort wheel's own
   parts so it scrolls, snaps and taps the same way. data-for="rest" is what
   effortWheelPaint and effortWheelSync branch on. */
function restWheelVHTML(){
  var h='<div class="ew" data-for="rest"><div class="ew-slot"></div><div class="ew-sc" onscroll="effortWheelPaint(this)"><div class="ew-pad"></div>',i,n;
  for(i=0;i<REST_STOPS.length;i++){
    n=REST_STOPS[i];
    h+='<div class="ew-n" data-v="'+n+'"><span class="ew-num">'+
       (n?nfmt(Math.floor(n/60))+':'+nfmt(n%60,{minimumIntegerDigits:2}):_t('כבוי'))+'</span></div>';
  }
  return h+'<div class="ew-pad"></div></div></div>';
}`);
rep(`  if(!best)return;
  var raw=best.getAttribute('data-v'),v=(raw==='')?null:+raw;`, `  if(!best)return;
  if(box.getAttribute('data-for')==='rest'){   // i18n-exempt: a stored key
    try{localStorage.setItem(REST_KEY,best.getAttribute('data-v'));}catch(e){}
    return;
  }
  var raw=best.getAttribute('data-v'),v=(raw==='')?null:+raw;`);
rep(`    want=(box.getAttribute('data-for')==='ed')?_edRpe:_fitRpe;   // i18n-exempt: a stored key`,
`    want=(box.getAttribute('data-for')==='rest')?restLen():(box.getAttribute('data-for')==='ed')?_edRpe:_fitRpe;   // i18n-exempt: a stored key`);

/* a stored length that is not a stop (an older build allowed others) opens on
   the nearest stop, never on "off" - opening on off would turn the rest off */
rep(`      if(rows[j].getAttribute('data-v')===(want===null||want===undefined?'':String(want)))hit=rows[j];`,
`      if(rows[j].getAttribute('data-v')===(want===null||want===undefined?'':String(want)))hit=rows[j];
    if(box.getAttribute('data-for')==='rest'&&hit.getAttribute('data-v')!==String(want))   // i18n-exempt: a stored key
      for(j=0;j<rows.length;j++)if(+rows[j].getAttribute('data-v')<=want&&+rows[j].getAttribute('data-v')>0)hit=rows[j];`);

if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('patched');
