/* "I meant ט׳" (Asaf, 24 Oct). Option I of review/workout-screen-2 is D -
 * four orderly zones - with the rest and the effort wheel in a DOCK fixed
 * above the tab bar, always in reach mid-set. Built over the F version
 * (69523e0), which keeps what he asked for along the way: the green of a
 * finished exercise in the tabs and in the superset chooser, a colour per
 * effort level, "how it is done" as a small button by the name.
 *  - the sets: one row per set - last time, today - the current one outlined;
 *  - the entry: weight, reps and + in one row, as before;
 *  - the note under the sets;
 *  - the dock: rest (its wheel, start, stopwatch) beside the effort wheel.
 *    Appended to <body>, not inside #content: a fixed element inside a
 *    transformed ancestor is fixed to that ancestor, not to the screen. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

/* the sets as rows */
rep(`  h='<div class="fx-sets" style="--n:'+Math.min(n,4)+'">';
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
  else if(!mine.length)`, `  /* ONE ROW PER SET: last time beside today, set against set */
  h='<div class="fx-rows'+(prev?'':' nop')+'">';
  h+='<div class="fx-rh"><span>'+_t('סט')+'</span>'+(prev?'<span>'+esc(agoText(prev.date))+'</span>':'')+'<span>'+_t('היום')+'</span></div>';
  for(i=0;i<n;i++){
    var m=mine[i],p=ps[i],cur=(i===mine.length);
    h+='<div class="fx-sr"><span class="fx-sr-i">'+nfmt(i+1)+'</span>'+
       (prev?'<span class="fx-sr-w">'+(p&&!cardio?num(p):'&ndash;')+'</span>':'')+
       '<'+(m?'button onclick="setSelOpen('+i+')"':'span')+' class="fx-sc'+(m?' ok':'')+(cur?' cur':'')+(_setSel===i?' sel':'')+'">'+
       (m?(cardio?cardioRowHTML(m):num(m))+((curPR&&m.weight>curPR)?' &#9733;':''):(cur?_t('הבא|סט'):'&nbsp;'))+
       '</'+(m?'button':'span')+'></div>';
  }
  h+='</div>';
  if(!prev&&!mine.length)`);

/* the entry back to one row, the wheel out to the dock */
rep(`  h+='<div style="margin-top:12px"><div class="fw-duo"><div class="fw-fields fw-fields2">';`,
    `  h+='<div style="margin-top:12px"><div class="fw-fields">';`);
rep(`  h+='</div>';
  var _sc=effortScale();`, `  h+='<div class="fw-addcell"><button class="fw-add'+(_fitWarm?' warm':'')+'" onclick="logSet()" '+
     'aria-label="'+esc(_fitWarm?_t('הוסף חימום'):_t('רשום סט {n}',{n:(ex.sets||[]).length+1}))+'">+</button></div>';
  h+='</div>';
  var _sc=effortScale();`);
rep(`  h+='<div class="fw-effort"><button onclick="toggleEffort()" class="fw-fl fw-fl-b">'+(_sc==='rir'?'RIR':'RPE')+'</button>';
  h+=effortWheelHTML('fit');   // i18n-exempt: a stored key
  h+='</div></div>';
  /* one button, saying which set it writes */
  h+='<button class="fw-add fw-logset'+(_fitWarm?' warm':'')+'" onclick="logSet()">'+
     (_fitWarm?_t('הוסף חימום'):_t('רשום סט {n}',{n:(ex.sets||[]).length+1}))+'</button>';`,
`  /* the wheel goes to the dock, beside the rest - see fxDockPaint */
  _fxDockEw='<div class="fw-effort"><button onclick="toggleEffort()" class="fw-fl fw-fl-b">'+(_sc==='rir'?'RIR':'RPE')+'</button>'+
    effortWheelHTML('fit')+'</div>';   // i18n-exempt: a stored key`);
rep(`  h+='<div class="fw-now fx-restcard">'+restRowHTML()+exNoteHTML(ex,w.currentEx)+'</div>';`,
    `  h+='<div class="fx-notecard">'+exNoteHTML(ex,w.currentEx)+'</div>';
  _fxDockRest=restRowHTML();`);
rep(`  effortWheelSync();restWheelSync();   // offsetTop is nothing until the node is in the document`,
    `  fxDockPaint();
  effortWheelSync();restWheelSync();   // offsetTop is nothing until the node is in the document`);
rep(`  var ex=w.exercises[w.currentEx];
  var prs=loadPRs();`, `  var ex=w.exercises[w.currentEx];
  _fxDockEw='';_fxDockRest='';
  var prs=loadPRs();`);

/* the dock itself, and its cleanup everywhere the workout view is left */
rep(`function exSetCardsHTML(ex,curPR){`, `/* ── THE DOCK ── the rest and the effort, fixed above the tab bar while a
   workout is on screen. Lives on <body>; every way off this view clears it. */
var _fxDockEw='',_fxDockRest='';
function fxDockClear(){var d=document.getElementById('fx-dock');if(d)d.remove();var p=document.getElementById('fx-dock-pad');if(p)p.remove();}
function fxDockPaint(){
  fxDockClear();
  if(_fitView!=='workout'||!_fitWorkout||!(_fxDockRest||_fxDockEw))return;
  var d=document.createElement('div');d.id='fx-dock';d.className='fx-dock'+(_fxDockEw?'':' one');
  d.innerHTML='<div class="fx-dock-r">'+_fxDockRest+'</div>'+(_fxDockEw?'<div class="fx-dock-e">'+_fxDockEw+'</div>':'');
  document.body.appendChild(d);
  var tb=document.querySelector('.tabbar'),tbh=tb?tb.getBoundingClientRect().height:84;
  d.style.bottom=(tbh+8)+'px';
  /* room under the page for what the dock covers */
  var pad=document.createElement('div');pad.id='fx-dock-pad';pad.style.height=(d.getBoundingClientRect().height+12)+'px';
  var c=document.getElementById('content');if(c)c.appendChild(pad);
}
function exSetCardsHTML(ex,curPR){`);
rep(`function renderFitness(){
  fitwSave();`, `function renderFitness(){
  fxDockClear();
  fitwSave();`);
rep(`function goHome(){
  document.body.classList.remove('rf-night');`, `function goHome(){
  try{fxDockClear();}catch(e){}
  document.body.classList.remove('rf-night');`);
rep(`function enterModule(mod){
  setTimeout(function(){areaIntroMaybe(mod);},450);`, `function enterModule(mod){
  try{fxDockClear();}catch(e){}
  setTimeout(function(){areaIntroMaybe(mod);},450);`);

/* the look */
rep(`.fx-sets{display:grid;`, `/* ── option I: rows, and the dock ── */
.fx-rows{display:grid;gap:6px}
.fx-rh,.fx-sr{display:grid;grid-template-columns:30px 1fr 1fr;gap:8px;align-items:center}
.fx-rows.nop .fx-rh,.fx-rows.nop .fx-sr{grid-template-columns:30px 1fr}
.fx-rh span{font-size:12px;font-weight:800;color:var(--nu-muted);text-align:center}
.fx-sr-i{text-align:center;font-weight:800;color:var(--nu-muted)}
.fx-sr-w{text-align:center;font-size:14.5px;font-weight:700;color:var(--nu-muted)}
.fx-sr .fx-sc{flex-direction:row;justify-content:center;padding:9px 6px;font-size:15.5px;font-weight:800}
.fx-sr .fx-sc.ok::before{content:"✓ ";color:#3f7a52;margin-inline-end:4px}
.fx-sr .fx-sc.cur{color:var(--nu-muted);font-weight:700}
.fx-notecard{margin:-2px 0 12px}
.fx-dock{position:fixed;left:12px;right:12px;z-index:130;max-width:520px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start;
  --nu-ground:#e9e7e3;--nu-lit:rgba(255,255,255,.95);--nu-shade:rgba(176,168,156,.44);--nu-shade-soft:rgba(176,168,156,.28);--nu-ink:#4a453f;--nu-muted:#6d675e;
  background:var(--nu-ground);border-radius:22px;padding:10px 12px;box-shadow:-4px -4px 10px var(--nu-lit),0 -6px 18px rgba(120,100,80,.18)}
.fx-dock.one{grid-template-columns:1fr}
.fx-dock .fw-restset{flex-direction:column;align-items:stretch;gap:8px;margin:0}
.fx-dock .rw-wrap{flex-wrap:wrap}
.fx-dock .fw-effort{margin:0}
.fx-dock .ew-n.on .ew-sub{display:none}
.fx-sets{display:grid;`);
fs.writeFileSync(F, s);
console.log('patched');
/* second pass, from the photo: the dock was tall (a 184px wheel), and the
   old dark rest pill floated over it. The dock's wheel shows three rows;
   the running rest sits just above the dock, in the material. */
{ let t = fs.readFileSync(F, 'utf8');
  const r2 = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL); if (t.split(a).length !== 2) { console.log('anchor p2: ' + a.slice(0, 60)); process.exit(1); } t = t.replace(a, () => b); };
  r2(`.fx-dock .ew-n.on .ew-sub{display:none}`, `.fx-dock .ew-n.on .ew-sub{display:none}
.fx-dock .ew{height:108px}.fx-dock .ew-pad{height:36px}.fx-dock .ew-slot{top:36px}
body.fx-docked .fw-rest{bottom:var(--fx-dock-top,200px);background:var(--nu-ground,#e9e7e3);color:var(--nu-ink,#4a453f);
  box-shadow:-3px -3px 8px rgba(255,255,255,.95),4px 6px 16px rgba(120,100,80,.22),inset 0 -3px 0 color-mix(in srgb,var(--terra-500) 60%,transparent)}
body.fx-docked .fw-rest-x{background:none;color:var(--terra-700)}`);
  r2(`function fxDockClear(){var d=document.getElementById('fx-dock');if(d)d.remove();`,
     `function fxDockClear(){document.body.classList.remove('fx-docked');var d=document.getElementById('fx-dock');if(d)d.remove();`);
  r2(`  d.style.bottom=(tbh+8)+'px';`, `  d.style.bottom=(tbh+8)+'px';
  document.body.classList.add('fx-docked');
  document.body.style.setProperty('--fx-dock-top',(tbh+16+d.getBoundingClientRect().height)+'px');`);
  fs.writeFileSync(F, t); console.log('patched pass 2'); }
