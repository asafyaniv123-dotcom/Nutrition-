/* EVERY SWITCH SLIDES (Asaf, 27 Oct: "no button should jump"). One small
 * engine instead of fifteen: for each known switch, a glide - a copy of the
 * chosen button's own surface (its background, its shadow, its corners) -
 * sits under the buttons and travels to the newly chosen one, and the chosen
 * button's own surface is switched off so there is one of it. Most of these
 * switches repaint their whole container on a tap; the glide remembers where
 * it last stood for each switch and starts the new one there, so even a
 * repainted switch slides. The home's dial/chat switch also crossfades the
 * two views. Nutrition's tabs and planning's switch already slid and are left
 * as they are. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

/* the history chart's tabs get a class, so the engine can find them */
rep(`  var tabHTML='<div style="display:flex;gap:5px;background:rgba(255,255,255,.5);border-radius:12px;padding:4px;margin-bottom:12px">';`,
  `  var tabHTML='<div class="hist-tabs" style="display:flex;gap:5px;background:rgba(255,255,255,.5);border-radius:12px;padding:4px;margin-bottom:12px">';`);

rep(`function hchSetMode(m){
  try{localStorage.setItem(HCH_MODE_KEY,m);}catch(e){}
  hchSync();`, `function hchSetMode(m){
  try{localStorage.setItem(HCH_MODE_KEY,m);}catch(e){}
  /* the two views cross over rather than cut */
  var hs=document.getElementById('home-screen');
  if(hs){hs.classList.remove('hch-swap');void hs.offsetWidth;hs.classList.add('hch-swap');setTimeout(function(){hs.classList.remove('hch-swap');},520);}
  hchSync();`);

rep(`function tbSync(){`, `/* ── THE GLIDE ── see the patch note (tools/patch-glide-all.mjs) */
var SG_SWITCHES=[
  ['#hch-mode','button','.on'],['.tabbar','.tb','.on'],['.hist-tabs','button',function(b){return /cta-fill/.test(b.getAttribute('style')||'');}],
  ['.ftt','button','.on'],['.ck-seg','button','.on'],['.wtr-sw','.wtr-k','.on'],['.tm-kinds','.tm-k','.on'],['.ex-tabs','.ex-tab','.on'],
  ['.tpl-days','.tpl-day','.on'],['.fx-tabs','.fx-tab','.on'],['.prg-rng','button','.on'],['.ppl-sorts','.ppl-sort','.on'],
  ['.cl-seasons','.cl-season','.on'],['.crop-modes','.crop-m','.on'],['.hbw-per','button','.on'],['.set-langs','.set-lang','.on'],
  ['.pf-sexes','.pf-sex','.on'],['.fu-row','.fu-b','.on'],['#add-kinds','.kind-chip','.on'],['.co-kinds','.co-kind','.on'],
  ['.fwp-c','button','.on'],['.jb-papers','button','.on'],['.dpk-cols .wk-sw','.wk-swatch','.on']];
var _sgMem={},_sgRaf=0;
function sgRun(){
  _sgRaf=0;
  SG_SWITCHES.forEach(function(sw,si){
    var boxes=document.querySelectorAll(sw[0]);
    for(var bi=0;bi<boxes.length;bi++)sgOne(boxes[bi],sw,si+':'+bi);
  });
}
function sgOne(box,sw,key){
  if(!box.isConnected||!box.offsetWidth)return;
  var items=[].filter.call(box.querySelectorAll(sw[1]),function(x){return x.parentNode===box||x.parentNode.parentNode===box;});
  var on=null,i;
  for(i=0;i<items.length;i++){var it=items[i];if(typeof sw[2]==='function'?sw[2](it):it.matches(sw[2]))on=it;}
  var g=box.querySelector(':scope > .sg-glide');
  if(!on){if(g)g.style.opacity='0';return;}
  if(getComputedStyle(box).position==='static')box.style.position='relative';
  var mem=_sgMem[key];
  /* the chosen surface, read once from the button itself before it is hidden */
  if(!on.classList.contains('sg-was')){
    var cs=getComputedStyle(on);
    var look={bg:cs.backgroundColor==='rgba(0, 0, 0, 0)'&&cs.backgroundImage==='none'?'':cs.background,sh:cs.boxShadow,r:cs.borderRadius};
    if(!look.bg&&(!look.sh||look.sh==='none'))return;   // nothing painted: nothing to slide
    box._sgLook=look;
  }
  var look2=box._sgLook||(mem&&mem.look);if(!look2)return;
  var fresh=!g;
  if(!g){g=document.createElement('i');g.className='sg-glide';box.insertBefore(g,box.firstChild);}
  g.style.background=look2.bg||'transparent';g.style.boxShadow=look2.sh;g.style.borderRadius=look2.r;g.style.opacity='1';
  var x=on.offsetLeft,y=on.offsetTop,w=on.offsetWidth,h=on.offsetHeight;
  if(fresh&&mem&&(mem.x!==x||mem.y!==y||mem.w!==w)){
    /* a repainted switch: start from where the last one stood */
    g.style.transition='none';g.style.transform='translate('+mem.x+'px,'+mem.y+'px)';g.style.width=mem.w+'px';g.style.height=mem.h+'px';
    void g.offsetWidth;g.style.transition='';
  }else if(fresh){g.style.transition='none';}
  g.style.transform='translate('+x+'px,'+y+'px)';g.style.width=w+'px';g.style.height=h+'px';
  if(fresh&&!(mem&&(mem.x!==x||mem.y!==y||mem.w!==w))){void g.offsetWidth;g.style.transition='';}
  items.forEach(function(it){it.classList.toggle('sg-was',it===on);});
  _sgMem[key]={x:x,y:y,w:w,h:h,look:look2};
}
function sgSoon(){if(!_sgRaf)_sgRaf=requestAnimationFrame(sgRun);}
new MutationObserver(sgSoon).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
window.addEventListener('resize',sgSoon);
function tbSync(){`);

rep(`html body.mod-planning .mo-chip-sel{`, `/* the glide under every switch (27.10) */
.sg-glide{position:absolute;left:0;top:0;z-index:0;pointer-events:none;
  transition:transform .34s cubic-bezier(.22,.61,.36,1),width .34s cubic-bezier(.22,.61,.36,1),height .34s,opacity .25s}
html body .sg-was{background:transparent!important;box-shadow:none!important}
.sg-glide~*{position:relative;z-index:1}
#home-screen.hch-swap>*:not(.home-menu):not(.hch-mode){animation:hchSwap .45s cubic-bezier(.22,.61,.36,1) both}
@keyframes hchSwap{from{opacity:0;transform:translateY(10px) scale(.99)}}
@media (prefers-reduced-motion:reduce){.sg-glide{transition:none}#home-screen.hch-swap>*{animation:none}}
html body.mod-planning .mo-chip-sel{`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
