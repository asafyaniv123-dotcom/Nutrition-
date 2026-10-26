/* "My progress" as cards after the first visit (Asaf, 26 Oct: "after he sees
 * this page the first time, the whole progress page becomes squares, in our
 * design, with the tracker's name on top and its visual in the card; tapping
 * a card opens it with the lovely animation").
 * The first visit is the long page (that is the tour); closing it remembers
 * that it was seen. From then on the page is a grid of raised cards, two to a
 * row, each its own chart in miniature and at rest; a card opens that tracker
 * alone, with its entrance; back returns to the cards. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`var PRG_W=330,_prg={list:[],cur:''};`, `var PRG_W=330,_prg={list:[],cur:'',one:null},PRG_GRID='prg_grid';`);
rep(`function prgClose(){var o=document.getElementById('prg');if(o)o.parentNode.removeChild(o);var f=_prg.after;_prg.after=null;if(f)setTimeout(f,250);}`,
  `function prgClose(){
  /* from one tracker, back to the cards */
  if(_prg.one){_prg.one=null;prgDraw();return;}
  /* the long page is the first visit; after it, the cards */
  try{localStorage.setItem(PRG_GRID,'1');}catch(e){}
  var o=document.getElementById('prg');if(o)o.parentNode.removeChild(o);var f=_prg.after;_prg.after=null;if(f)setTimeout(f,250);}
function prgOne(k){_prg.one=k;prgDraw();}
/* the cards: each tracker's chart in miniature, at rest */
function prgGrid(o){
  var h='<div class="prg-in"><div class="prg-top"><button class="fit-back" onclick="prgClose()">&#8249; '+_t('חזרה')+'</button>'+
    '<span class="prg-ttl">'+_t('ההתקדמות שלי')+'</span></div><div class="prg-grid">',n=0,tmp=document.createElement('div');
  _prg.list.forEach(function(k){
    var b=PRG_B[k],body='';try{body=b?b():'';}catch(e){body='';}
    if(!body)return;n++;
    tmp.innerHTML=body.replace(/(id="|url\\(#)((?:prg-|pl)[\\w-]*)/g,'$1$2-t'+k);
    var card=tmp.querySelector('.card');if(!card)return;
    /* at rest: every fill at its height, nothing waiting to enter */
    [].forEach.call(card.querySelectorAll('.grow'),function(g){var v=g.getAttribute('data-v')+'%';if(g.getAttribute('data-dim')==='w')g.style.width=v;else g.style.height=v;});
    [].forEach.call(card.querySelectorAll('[id^="prg-pmc"]'),function(c){c.setAttribute('stroke-dasharray','400 400');});
    [].forEach.call(card.querySelectorAll('.plate'),function(p){p.style.animation='none';});
    h+='<button class="prg-tile" onclick="prgOne(\\''+k+'\\')"><b>'+esc(prgName(k))+'</b><div class="prg-th"><div class="prg-thi">'+card.innerHTML+'</div></div></button>';});
  if(!n)h+='<div class="card"><div class="empty">'+_t('עוד אין כאן מספיק כדי להראות התקדמות. אחרי עוד כמה ימים של רישום, זה יופיע כאן.')+'</div></div>';
  o.innerHTML=h+'</div></div>';o.scrollTop=0;
  [].forEach.call(o.querySelectorAll('.prg-th'),function(th,i){
    var in2=th.firstChild,sc=Math.min(th.clientWidth/358,150/Math.max(1,in2.offsetHeight));in2.style.transform='scale('+sc.toFixed(3)+')';in2.style.right=((th.clientWidth-358*sc)/2).toFixed(1)+'px';in2.style.top=Math.max(0,(150-in2.offsetHeight*sc)/2).toFixed(1)+'px';
    var t=th.parentNode;t.style.opacity='0';t.style.transform='translateX(-40px)';
    setTimeout(function(){t.style.transition='opacity .45s ease,transform .6s cubic-bezier(.22,.61,.36,1)';t.style.opacity='1';t.style.transform='none';},80+i*70);});
}`);
rep(`function prgDraw(){
  var o=document.getElementById('prg');if(!o)return;
  var h='<div class="prg-in">`, `function prgDraw(){
  var o=document.getElementById('prg');if(!o)return;
  if(!_prg.one&&prgFlag(PRG_GRID)&&_prg.list.length>1){prgGrid(o);return;}
  var list=_prg.one?[_prg.one]:_prg.list;
  var h='<div class="prg-in">`);
rep(`  _prg.list.forEach(function(k){
    var b=PRG_B[k],body='';try{body=b?b():'';}catch(e){body='';}
    if(!body)return;n++;
    /* several trackers share the page now`, `  list.forEach(function(k){
    var b=PRG_B[k],body='';try{body=b?b():'';}catch(e){body='';}
    if(!body)return;n++;
    /* several trackers share the page now`);
rep(`function prgOpen(group,start){
  _prg.list=`, `function prgOpen(group,start){
  _prg.one=null;
  _prg.list=`);
rep(`.prg-sec{margin-bottom:34px}`, `.prg-sec{margin-bottom:34px}
/* the cards */
.prg-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}
.prg-tile{display:flex;flex-direction:column;gap:8px;padding:12px 10px 10px;border:none;border-radius:22px;background:#e9e7e3;cursor:pointer;font-family:inherit;text-align:start;overflow:hidden;
  box-shadow:-5px -5px 12px var(--lit),6px 7px 15px var(--sh2)}
.prg-tile:active{box-shadow:inset 3px 4px 8px var(--sh),inset -3px -3px 7px var(--lit)}
.prg-tile b{font-size:15px;font-weight:800;color:#4a453f;padding:0 4px}
.prg-th{position:relative;height:150px;overflow:hidden;border-radius:14px;pointer-events:none}
.prg-thi{position:absolute;top:0;right:0;width:358px;padding:0 14px;transform-origin:top right}
[dir=ltr] .prg-thi{right:auto;left:0;transform-origin:top left}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
