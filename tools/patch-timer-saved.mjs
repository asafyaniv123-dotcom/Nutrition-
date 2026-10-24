/* Saved timers (Asaf, 24 Oct, from review/timer-proto): "my saved" on top of
 * the timer screen - tap to load into the form, ▶ to start, ⋯ to rename or
 * delete; "save" beside "start", which offers to update the loaded one or
 * save as new; and at the end of a schedule nobody has saved, an offer to
 * keep it. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* the card and the two buttons */
rep(`  h+='<button class="fw-timerhome" style="margin-bottom:14px" onclick="fitTimerBack()">&#8249; '+_t('חזרה')+'</button>';
`, `  h+='<button class="fw-timerhome" style="margin-bottom:14px" onclick="fitTimerBack()">&#8249; '+_t('חזרה')+'</button>';
  h+=wtSavedHTML();
`);
rep(`  h+='<button class="tm-start" onclick="wtGo()">'+_t('התחל')+'</button>';
  h+='</div>';`, `  h+='<div class="tm-row2"><button class="tm-start" onclick="wtGo()">'+_t('התחל')+'</button>'+
     '<button class="tm-go tm-save" onclick="wtSaveSheet(wtFormPlan(),false)">'+_t('שמור')+'</button></div>';
  h+='</div>';`);

/* changing the shape by hand keeps the link to what was loaded, so "save"
   can still offer to update it */
rep(`function wtGo(){
  var n=wtNums();`, `/* ── SAVED TIMERS ──
   A Tabata for the abs is a thing you come back to, so it gets a name and a
   place at the top of the screen. Each is a whole plan - the shape, its four
   numbers and what runs in each round - and loading one writes it into the
   form, so it can be changed before it starts. _wtSavedId is the one loaded,
   which is what lets "save" offer to update it rather than only add. */
var WT_SAVED_KEY='wt_saved',_wtSavedId=null;
function wtSavedAll(){
  try{var a=JSON.parse(localStorage.getItem(WT_SAVED_KEY)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}
}
function wtSavedPut(a){try{localStorage.setItem(WT_SAVED_KEY,JSON.stringify(a));}catch(e){}}
function wtSavedGet(id){var a=wtSavedAll(),i;for(i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null;}
/* the form as a plan, in the shape wtPlanStart takes */
function wtFormPlan(){
  var n=wtNums();
  return {kind:_wtKind,work:n.work|0,rest:n.rest|0,rounds:n.rounds|0,prep:n.prep|0,names:wtNamesClean()};
}
function wtSameShape(a,b){
  return a.kind===b.kind&&a.work===b.work&&a.rest===b.rest&&a.rounds===b.rounds&&a.prep===b.prep&&
         (a.names||[]).join('\\n')===(b.names||[]).join('\\n');
}
/* the numbers only, no words: a glance at the shape, in the reader's digits */
function wtSavedLine(p){
  var t=p.kind==='amrap'?wtFace(p.work):p.kind==='emom'?nfmt(p.rounds)+' &times; '+wtFace(p.work)
       :nfmt(p.rounds)+' &times; '+nfmt(p.work)+'/'+nfmt(p.rest);
  return esc(wtPlanLabel(p.kind))+' &middot; '+t+((p.names&&p.names.length)?' &middot; '+esc(p.names.join(', ')):'');
}
function wtSavedHTML(){
  var a=wtSavedAll(),h='<div class="tm-card"><div class="tm-h">'+_t('השמורים שלי')+'</div>',i,p;
  if(!a.length)return h+'<div class="tm-sub" style="margin:0">'+esc(_t('עוד אין שעונים שמורים. בנה שעון למטה ולחץ "שמור".'))+'</div></div>';
  for(i=0;i<a.length;i++){
    p=a[i];
    h+='<div class="tm-sv'+(p.id===_wtSavedId?' on':'')+'">'+
       '<button class="tm-sv-l" onclick="wtSavedUse('+p.id+')"><b>'+esc(p.name)+'</b><span>'+wtSavedLine(p)+'</span></button>'+
       '<button class="tm-sv-go" onclick="wtSavedUse('+p.id+');wtGo()" aria-label="'+esc(_t('התחל'))+'">'+
       '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5Z"/></svg></button>'+
       '<button class="tm-sv-m" onclick="wtSavedMenu('+p.id+')" aria-label="'+esc(_t('אפשרויות|שעון'))+'">&#8943;</button>'+
       '</div>';
  }
  return h+'</div>';
}
function wtSavedUse(id){
  var p=wtSavedGet(id);if(!p)return;
  _wtKind=p.kind;
  _wtTmp={work:p.work,rest:p.rest,rounds:p.rounds,prep:p.prep};
  _wtNamesTmp=(p.names&&p.names.length)?p.names.slice(0):['',''];
  _wtHadNames=!!(p.names&&p.names.length);
  _wtSavedId=id;
  renderFitness();
}
/* ONE SHEET FOR SAVING, from the form or from a schedule that just ended.
   On the body, like askConfirm, so nothing - the running clock included - is
   above it. The name it opens with is the loaded one, or the shape and the
   first exercise. */
function wtSaveSheet(plan,after){
  var cur=_wtSavedId!==null?wtSavedGet(_wtSavedId):null,
      name=cur?cur.name:(wtPlanLabel(plan.kind)+(plan.names&&plan.names.length?' · '+plan.names[0]:'')),h;
  wtSheetClose();
  var ov=document.createElement('div');ov.className='cf-ov';ov.id='wt-sv-ov';
  h='<div class="cf-card"><div class="cf-q" style="margin-bottom:6px">'+esc(after?_t('לשמור את השעון הזה?'):_t('שמירת השעון'))+'</div>'+
    '<div class="tm-sv-sum">'+wtSavedLine(plan)+'</div>'+
    '<input id="wt-sv-n" class="tm-sv-in" maxlength="40" placeholder="'+esc(_t('שם'))+'" value="'+esc(name)+'">'+
    '<div class="tm-sv-col">';
  if(cur)h+='<button class="cf-yes" id="wt-sv-up">'+esc(_t('עדכן את "{name}"',{name:cur.name}))+'</button>'+
            '<button class="cf-yes" id="wt-sv-new">'+esc(_t('שמור כחדש'))+'</button>';
  else h+='<button class="cf-yes" id="wt-sv-new">'+esc(_t('שמור'))+'</button>';
  h+='<button class="cf-no" id="wt-sv-x">'+esc(after?_t('לא עכשיו'):_t('ביטול'))+'</button></div></div>';
  ov.innerHTML=h;document.body.appendChild(ov);
  var go=function(update){
    var nm=(document.getElementById('wt-sv-n').value||'').replace(/^\\s+|\\s+$/g,'')||name,a=wtSavedAll(),i,
        p={id:Date.now(),name:nm,kind:plan.kind,work:plan.work,rest:plan.rest,rounds:plan.rounds,prep:plan.prep,
           names:(plan.names||[]).slice(0)};
    if(update&&cur){for(i=0;i<a.length;i++)if(a[i].id===cur.id){p.id=cur.id;a[i]=p;}}
    else a.unshift(p);
    wtSavedPut(a);_wtSavedId=p.id;
    wtSheetClose();
    showToast(_t('נשמר: {name}',{name:nm}));
    if(_fitView==='timer')renderFitness();
  };
  if(cur)document.getElementById('wt-sv-up').onclick=function(){go(true);};
  document.getElementById('wt-sv-new').onclick=function(){go(false);};
  document.getElementById('wt-sv-x').onclick=wtSheetClose;
  ov.onclick=function(ev){if(ev.target===ov)wtSheetClose();};
}
function wtSheetClose(){var e=document.getElementById('wt-sv-ov');if(e&&e.parentNode)e.parentNode.removeChild(e);}
function wtSavedMenu(id){
  var p=wtSavedGet(id);if(!p)return;
  wtSheetClose();
  var ov=document.createElement('div');ov.className='cf-ov';ov.id='wt-sv-ov';
  ov.innerHTML='<div class="cf-card"><div class="cf-q" style="margin-bottom:12px">'+esc(p.name)+'</div>'+
    '<input id="wt-sv-n" class="tm-sv-in" maxlength="40" value="'+esc(p.name)+'">'+
    '<div class="tm-sv-col"><button class="cf-yes" id="wt-sv-rn">'+esc(_t('שנה שם'))+'</button>'+
    '<button class="cf-no tm-sv-del" id="wt-sv-del">'+esc(_t('מחק'))+'</button>'+
    '<button class="cf-no" id="wt-sv-x">'+esc(_t('ביטול'))+'</button></div></div>';
  document.body.appendChild(ov);
  document.getElementById('wt-sv-rn').onclick=function(){
    var v=(document.getElementById('wt-sv-n').value||'').replace(/^\\s+|\\s+$/g,''),a=wtSavedAll(),i;
    if(v)for(i=0;i<a.length;i++)if(a[i].id===id)a[i].name=v;
    wtSavedPut(a);wtSheetClose();renderFitness();
  };
  document.getElementById('wt-sv-del').onclick=function(){
    wtSavedPut(wtSavedAll().filter(function(x){return x.id!==id;}));
    if(_wtSavedId===id)_wtSavedId=null;
    wtSheetClose();showToast(_t('נמחק'));renderFitness();
  };
  document.getElementById('wt-sv-x').onclick=wtSheetClose;
  ov.onclick=function(ev){if(ev.target===ov)wtSheetClose();};
}
/* AT THE END OF A SCHEDULE NOBODY HAS SAVED, the offer to keep it - a good
   workout should not be lost for want of a tap. Asked once per run. */
function wtOfferSave(){
  var p=_wtPlan,a,i;
  if(!p)return;
  a=wtSavedAll();
  for(i=0;i<a.length;i++)if(wtSameShape(a[i],p))return;
  setTimeout(function(){if(_wtPlan===p)wtSaveSheet(p,true);},900);
}
function wtGo(){
  var n=wtNums();`);

/* picking another shape leaves the loaded one */
rep(`function wtKindPick(k){
  _wtKind=k;`, `function wtKindPick(k){
  _wtKind=k;_wtSavedId=null;`);

/* the end of a schedule */
rep(`    if(at.phase==='done'){
      if(_wtIv){clearInterval(_wtIv);_wtIv=null;}
      _wtPaused=0;
      wtLockOff();      /* the clock stopped itself; let the screen sleep */`, `    if(at.phase==='done'){
      if(_wtIv){clearInterval(_wtIv);_wtIv=null;}
      _wtPaused=0;
      wtLockOff();      /* the clock stopped itself; let the screen sleep */
      wtOfferSave();`);

/* CSS */
rep(`.tm-start{width:100%;border:none;border-radius:16px;padding:16px;font-family:inherit;`, `/* saved timers */
.tm-sv,.tm-sv-in,.tm-sv-sum{--nu-ground:#e9e7e3;--nu-lit:rgba(255,255,255,.95);
  --nu-shade:rgba(176,168,156,.44);--nu-shade-soft:rgba(176,168,156,.28);--nu-ink:#4a453f;--nu-muted:#6d675e}
.tm-sv{display:flex;align-items:center;gap:9px;margin-bottom:9px}
.tm-sv:last-child{margin-bottom:0}
.tm-sv-l{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;text-align:start;border:none;border-radius:15px;padding:11px 13px;
  font-family:inherit;cursor:pointer;background:var(--nu-ground);color:var(--nu-ink);
  box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}
.tm-sv.on .tm-sv-l{box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.tm-sv-l b{font-size:15px;font-weight:800}
.tm-sv-l span{font-size:12px;font-weight:700;color:var(--nu-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tm-sv-go{flex:none;width:44px;height:44px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
  background:var(--nu-ground);box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}
.tm-sv-go svg{width:17px;height:17px;fill:var(--terra-700);margin-inline-start:2px}
[dir=rtl] .tm-sv-go svg{transform:scaleX(-1);margin-inline-start:0;margin-inline-end:2px}
.tm-sv-m{flex:none;width:30px;border:none;background:none;font-size:20px;font-weight:800;color:var(--nu-muted);cursor:pointer;padding:6px 0}
.tm-sv-go:active,.tm-sv-l:active{box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.tm-save{flex:0 0 34%}
.tm-row2 .tm-start{flex:1}
.tm-sv-sum{font-size:12.5px;font-weight:700;color:var(--nu-muted);text-align:center;line-height:1.5;margin-bottom:14px}
.tm-sv-in{display:block;width:100%;border:none;border-radius:14px;padding:13px 14px;margin-bottom:14px;font-family:inherit;font-size:15px;font-weight:700;
  color:var(--nu-ink);background:var(--nu-ground);outline:none;text-align:start;
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.tm-sv-col{display:flex;flex-direction:column;gap:10px}
.tm-sv-del{color:var(--terra-700)}
.tm-start{width:100%;border:none;border-radius:16px;padding:16px;font-family:inherit;`);

if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('patched');
