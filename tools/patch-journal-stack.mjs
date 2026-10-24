/* The journal as approved (review/journal-curl, 24 Oct): a stack of pages
 * that turn the way paper does, in notebooks of your own, on the paper you
 * choose.
 *  - NOTEBOOKS: the journal is the first and keeps its keys (jrnl_<day>), so
 *    every page already written is still there; others are jrnl_<id>_<day>.
 *    Each has a name, a colour, a paper and its own prompts (gratitude,
 *    dreams, ideas, letters to yourself). ⋯ edits; long press is not needed.
 *  - THE FOLD: the page folds along the bisector of the point grabbed and the
 *    finger, so the paper under the finger stays under it; its back shows,
 *    shaded, and throws a shadow on the page beneath. The spine is the
 *    inline-start edge - right in Hebrew and Arabic, left in English - and
 *    the fold may not cross it. Let go past the middle, or flick, and it
 *    turns; short of it, it falls back. Arrows play the same fold.
 *  - PAPER: lines, dots, squares or plain; one line of writing per rule, the
 *    rules scrolling with the words.
 *  - a quiet prompt "if you need somewhere to start", the week's written days
 *    as lit dots, and search behind a magnifier. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* storage, per notebook */
rep(`var _jrnlDate='',_jrnlQ='',_jrnlSaveT=null;
function jrnlKey(d){return JRNL_PRE+d;}`, `var _jrnlDate='',_jrnlQ='',_jrnlSaveT=null,_jrnlNb='main';
/* the journal itself is 'main' and keeps the keys it always had */
function jrnlKey(d){return JRNL_PRE+(_jrnlNb==='main'?'':_jrnlNb+'_')+d;}`);
rep(`      if(k&&k.indexOf(JRNL_PRE)===0){
        var d=k.slice(JRNL_PRE.length);`, `      var pre=JRNL_PRE+(_jrnlNb==='main'?'':_jrnlNb+'_');
      if(k&&k.indexOf(pre)===0){
        var d=k.slice(pre.length);`);

/* the screen */
const a = s.indexOf(`function renderJournal(){`);
const b = s.indexOf(`\n}\n`, a);
if (a < 0 || b < 0) { console.log('renderJournal'); process.exit(1); }
s = s.slice(0, a) + `/* ── THE NOTEBOOKS ── */
var JRNL_BOOKS='journal_books',JB_TINTS=['#c9b9a6','#a9bfa9','#c3b0c9','#b7c3d3','#d6b9a8','#c9c19d'],
    JB_PAPERS=['lines','dots','grid','plain'],JB_KINDS=['grat','dream','idea','letter'];
function jbBooks(){
  var a=null;try{a=JSON.parse(localStorage.getItem(JRNL_BOOKS)||'null');}catch(e){}
  if(!Array.isArray(a)||!a.length)a=[{id:'main',name:'',c:JB_TINTS[0],paper:'lines',kind:''}];
  return a;
}
function jbSave(a){try{localStorage.setItem(JRNL_BOOKS,JSON.stringify(a));}catch(e){}}
function jbCur(){var a=jbBooks(),i;for(i=0;i<a.length;i++)if(a[i].id===_jrnlNb)return a[i];_jrnlNb=a[0].id;return a[0];}
function jbKindName(k){
  if(k==='grat')return _t('הכרת תודה');if(k==='dream')return _t('חלומות');
  if(k==='idea')return _t('רעיונות');if(k==='letter')return _t('מכתבים לעצמי');return '';
}
function jbName(b){return b.name||(b.id==='main'?_t('יומן'):jbKindName(b.kind));}
function jbPaperName(p){
  if(p==='lines')return _t('שורות|נייר');if(p==='dots')return _t('נקודות|נייר');
  if(p==='grid')return _t('משבצות|נייר');return _t('חלק|נייר');
}
/* what to start from, per kind; the first is also the empty page's line */
function jbSparks(){
  var k=jbCur().kind;
  if(k==='grat')return [_t('על מה אתה מודה היום?'),_t('מי עשה לך טוב השבוע?'),_t('איזה דבר קטן שימח אותך היום?')];
  if(k==='dream')return [_t('מה חלמת הלילה?')];
  if(k==='idea')return [_t('איזה רעיון לא עוזב אותך?')];
  if(k==='letter')return [_t('מה היית רוצה להגיד לעצמך בעוד שנה?')];
  return [_t('מה עובר לך בראש היום?'),_t('מה הצחיק אותך היום?'),_t('מה היה הרגע הכי טוב היום?'),_t('מה היית רוצה לזכור מהיום הזה?')];
}
var _jbSi=0,_jbSearch=false;
function jbDay(d,n){var x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return dayStr(x);}
function jbLabel(d){
  var t=todayStr();
  if(d===t)return _t('היום');if(d===jbDay(t,-1))return _t('אתמול');
  return WK_DAYS[new Date(d+'T12:00:00').getDay()];
}
function jbPageHTML(k,d){
  var b=jbCur(),p='jb-'+(b.paper||'lines'),t=loadJournal(d),dt=new Date(d+'T12:00:00');
  return '<div class="jb-card'+(k===1?' jb-c1':k===2?' jb-c2':'')+'" id="jb'+k+'" style="--c:'+b.c+';z-index:'+(10-k)+'"><i class="jb-edge"></i>'+
    '<div class="jb-dt"><span>'+esc(jbLabel(d))+'</span><small>'+esc(dfmt(dt,{day:'numeric',month:'long'}))+'</small></div>'+
    (k===0?'<textarea id="jrnl-text" class="jb-wr '+p+'" placeholder="'+esc(d===todayStr()?jbSparks()[0]:_t('מה היה ביום הזה?'))+'" oninput="jrnlType(this)">'+esc(t)+'</textarea>'
          :'<div class="jb-wr '+p+(t?'':' jb-empty')+'">'+(t?esc(t):esc(_t('לא נכתב ביום הזה')))+'</div>')+'</div>';
}
function renderJournal(){
  if(!_jrnlDate)_jrnlDate=todayStr();
  var b=jbCur(),books=jbBooks(),t=todayStr(),isToday=_jrnlDate===t,h='',i,dow=appNow().getDay(),n=0,w;
  /* the notebooks, the magnifier and ⋯ */
  h+='<div class="jb-top"><div class="jb-nbs">';
  for(i=0;i<books.length;i++)
    h+='<button class="jb-nb'+(books[i].id===_jrnlNb?' on':'')+'" style="--c:'+books[i].c+'" onclick="jbOpen(\\''+books[i].id+'\\')"><i></i>'+esc(jbName(books[i]))+'</button>';
  h+='<button class="jb-nb" onclick="jbNew()">'+_t('+ מחברת')+'</button></div>';
  h+='<button class="jb-ic" onclick="_jbSearch=!_jbSearch;renderJournal()" aria-label="'+esc(_t('חיפוש'))+'"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg></button>';
  h+='<button class="jb-ic" onclick="jbMenu()" aria-label="'+esc(_t('אפשרויות|שעון'))+'"><svg viewBox="0 0 24 24"><circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/></svg></button></div>';
  if(_jbSearch){
    h+='<div class="jrnl-srch"><input class="jrnl-in" id="jrnl-q" type="search" placeholder="'+_t("חפש מילה בכל מה שכתבת…")+'" value="'+esc(_jrnlQ)+'" oninput="jrnlSearch(this.value)"></div>';
    h+='<div id="jrnl-results">'+jrnlResultsHTML()+'</div>';
    document.getElementById('content').innerHTML=h;
    var q=document.getElementById('jrnl-q');if(q)q.focus();
    return;
  }
  /* the week */
  h+='<div class="jb-wk"><span class="jb-dots">';
  for(i=0;i<7;i++){var dd=jbDay(t,i-dow);w=!!loadJournal(dd);if(w&&i<=dow)n++;h+='<i class="'+(w?'on':'')+(i===dow?' now':'')+'"></i>';}
  h+='</span><span>'+(n?_t('השבוע: {n} מתוך 7',{n:n}):_t('השבוע עוד לא כתבת'))+'</span></div>';
  if(isToday){var sp=jbSparks();
    h+='<div class="jb-spark"><span>'+esc(_t('אם צריך מאיפה להתחיל: {q}',{q:sp[_jbSi%sp.length]}))+'</span>'+
       '<button onclick="_jbSi++;renderJournal()" aria-label="'+esc(_t('שאלה אחרת'))+'">&#8635;</button>'+
       '<button class="jb-use" onclick="jbUseSpark()">'+_t('לדף')+'</button></div>';}
  /* the stack: two pages under, the page, and the newer one waiting turned */
  h+='<div class="jb-stack" id="jb-stack">'+jbPageHTML(2,jbDay(_jrnlDate,-2))+jbPageHTML(1,jbDay(_jrnlDate,-1))+jbPageHTML(0,_jrnlDate)+
     (isToday?'':jbPageHTML(-1,jbDay(_jrnlDate,1)))+'<svg id="jb-fold"></svg></div>';
  h+='<div class="jb-row"><button class="jb-btn" onclick="jbAuto(1)">&#8249; '+(isToday?_t('אתמול'):_t('יום קודם'))+'</button><span class="jb-papers">';
  for(i=0;i<JB_PAPERS.length;i++)
    h+='<button class="jb-'+JB_PAPERS[i]+((b.paper||'lines')===JB_PAPERS[i]?' on':'')+'" aria-label="'+esc(jbPaperName(JB_PAPERS[i]))+'" onclick="jbPaper(\\''+JB_PAPERS[i]+'\\')"></button>';
  h+='</span><button class="jb-btn" onclick="jbAuto(-1)"'+(isToday?' disabled':'')+'>'+_t('הבא')+' &#8250;</button></div>';
  document.getElementById('content').innerHTML=h;
  var n1=document.getElementById('jb-1');if(n1){n1.style.zIndex=12;jbHide(n1);}
  jbSize();jbBind();
}
function jbOpen(id){jrnlFlush();_jrnlNb=id;_jrnlDate=todayStr();_jrnlQ='';_jbSi=0;renderJournal();}
function jbUseSpark(){
  var el=document.getElementById('jrnl-text');if(!el)return;
  var sp=jbSparks(),q=sp[_jbSi%sp.length];
  el.value=el.value.replace(/\\s+$/,'')?el.value.replace(/\\s+$/,'')+'\\n'+q+'\\n':q+'\\n';
  saveJournal(_jrnlDate,el.value);el.focus();
}
function jbPaper(p){var a=jbBooks(),i;for(i=0;i<a.length;i++)if(a[i].id===_jrnlNb)a[i].paper=p;jbSave(a);jrnlFlush();renderJournal();}
function jbGo(n){jrnlFlush();_jrnlDate=jbDay(_jrnlDate,n);_jbSi=0;renderJournal();}
/* ── a notebook, new or edited, in one sheet ── */
var _jbEd=null;
function jbSheet(h){
  jbSheetClose();
  var ov=document.createElement('div');ov.className='cf-ov fss-ov';ov.id='jb-ov';
  ov.innerHTML='<div class="cf-card fss">'+h+'</div>';document.body.appendChild(ov);
  ov.onclick=function(e){if(e.target===ov)jbSheetClose();};
}
function jbSheetClose(){var e=document.getElementById('jb-ov');if(e&&e.parentNode)e.parentNode.removeChild(e);}
function jbFormHTML(){
  var h='<input id="jb-n" class="tm-sv-in" maxlength="30" placeholder="'+esc(_t('שם המחברת'))+'" value="'+esc(_jbEd.name)+'">',i;
  h+='<div class="jb-tints">';
  for(i=0;i<JB_TINTS.length;i++)h+='<button style="--c:'+JB_TINTS[i]+'" class="'+(_jbEd.c===JB_TINTS[i]?'on':'')+'" onclick="_jbEd.c=\\''+JB_TINTS[i]+'\\';jbFormPaint()"></button>';
  h+='</div><div class="fss-g">'+_t('נייר')+'</div><div class="jb-papers" style="margin-bottom:14px">';
  for(i=0;i<JB_PAPERS.length;i++)h+='<button class="jb-'+JB_PAPERS[i]+(_jbEd.paper===JB_PAPERS[i]?' on':'')+'" aria-label="'+esc(jbPaperName(JB_PAPERS[i]))+'" onclick="_jbEd.paper=\\''+JB_PAPERS[i]+'\\';jbFormPaint()"></button>';
  return h+'</div>';
}
function jbFormPaint(){var n=document.getElementById('jb-n');if(n)_jbEd.name=n.value;var f=document.getElementById('jb-form');if(f)f.innerHTML=jbFormHTML();}
function jbNew(){
  _jbEd={id:'',name:'',c:JB_TINTS[2],paper:'lines',kind:''};
  var h='<div class="cf-q" style="margin-bottom:12px">'+esc(_t('מחברת חדשה'))+'</div><div class="jb-kinds">',i;
  for(i=0;i<JB_KINDS.length;i++)h+='<button onclick="_jbEd.kind=\\''+JB_KINDS[i]+'\\';document.getElementById(\\'jb-n\\').value=\\'\\';document.getElementById(\\'jb-n\\').placeholder=jbKindName(\\''+JB_KINDS[i]+'\\')">'+esc(jbKindName(JB_KINDS[i]))+'</button>';
  h+='</div><div id="jb-form">'+jbFormHTML()+'</div><div class="tm-sv-col"><button class="cf-yes" onclick="jbKeep()">'+esc(_t('צור מחברת'))+'</button>'+
     '<button class="cf-no" onclick="jbSheetClose()">'+esc(_t('ביטול'))+'</button></div>';
  jbSheet(h);
}
function jbMenu(){
  var b=jbCur();_jbEd={id:b.id,name:b.name||'',c:b.c,paper:b.paper||'lines',kind:b.kind||''};
  var h='<div class="cf-q" style="margin-bottom:12px">'+esc(jbName(b))+'</div><div id="jb-form">'+jbFormHTML()+'</div><div class="tm-sv-col">'+
    '<button class="cf-yes" onclick="jbKeep()">'+esc(_t('שמור'))+'</button>'+
    (b.id!=='main'?'<button class="cf-no tm-sv-del" onclick="jbDrop()">'+esc(_t('מחק את המחברת'))+'</button>':'')+
    '<button class="cf-no" onclick="jbSheetClose()">'+esc(_t('ביטול'))+'</button></div>';
  jbSheet(h);
  var n=document.getElementById('jb-n');if(n&&!_jbEd.name)n.placeholder=jbName(b);
}
function jbKeep(){
  var n=document.getElementById('jb-n'),a=jbBooks(),i;_jbEd.name=n?(n.value||'').replace(/^\\s+|\\s+$/g,''):'';
  if(!_jbEd.id){
    if(!_jbEd.name&&!_jbEd.kind){if(n)n.focus();return;}
    _jbEd.id='n'+Date.now().toString(36);a.push(_jbEd);_jrnlNb=_jbEd.id;
  } else for(i=0;i<a.length;i++)if(a[i].id===_jbEd.id){a[i].name=_jbEd.name;a[i].c=_jbEd.c;a[i].paper=_jbEd.paper;}
  jbSave(a);jbSheetClose();_jrnlDate=todayStr();renderJournal();
}
function jbDrop(){
  var b=jbCur();jbSheetClose();
  askConfirm(_t('למחוק את המחברת {name} וכל הדפים בה?',{name:jbName(b)}),_t('מחק'),function(){
    var pre=JRNL_PRE+b.id+'_',ks=[],i,k;
    try{for(i=0;i<localStorage.length;i++){k=localStorage.key(i);if(k&&k.indexOf(pre)===0)ks.push(k);}}catch(e){}
    ks.forEach(function(k){try{localStorage.removeItem(k);}catch(e){}});
    jbSave(jbBooks().filter(function(x){return x.id!==b.id;}));_jrnlNb='main';_jrnlDate=todayStr();renderJournal();
  });
}
/* ── THE FOLD ──
   G is the point of paper grabbed, F where the finger is. The page folds
   along the perpendicular bisector of GF: what lies on G's side turns over
   and lies reflected. Worked in BOOK coordinates, where the spine is at x=W
   whatever the language; bx() maps them to the screen and back. */
var _jbW=0,_jbH=0,_jbDrag=null;
function jbRtl(){return document.documentElement.dir==='rtl';}
function jbX(x){return jbRtl()?x:_jbW-x;}
function jbSize(){var c=document.getElementById('jb0'),s=document.getElementById('jb-fold');if(!c||!s)return;
  _jbW=c.offsetWidth;_jbH=c.offsetHeight;s.setAttribute('width',_jbW);s.setAttribute('height',_jbH);s.setAttribute('viewBox','0 0 '+_jbW+' '+_jbH);}
function jbHide(el){el.style.clipPath='polygon(0 0,0 0,0 0)';}
function jbClip(poly,keep){var out=[],i,a,b,fa,fb,t;for(i=0;i<poly.length;i++){a=poly[i];b=poly[(i+1)%poly.length];fa=keep(a);fb=keep(b);
  if(fa>=0)out.push(a);if((fa>=0)!==(fb>=0)){t=fa/(fa-fb);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});}}return out;}
function jbPts(p){return p.map(function(q){return jbX(q.x).toFixed(1)+','+q.y.toFixed(1);}).join(' ');}
function jbFold(el,G,F){
  var s=document.getElementById('jb-fold');if(!s||!el)return;
  var D={x:F.x-G.x,y:F.y-G.y},L=Math.sqrt(D.x*D.x+D.y*D.y),W=_jbW,H=_jbH;
  if(L<0.5){el.style.clipPath='';el.classList.remove('jb-turning');s.innerHTML='';return;}
  el.classList.add('jb-turning');
  var M={x:(G.x+F.x)/2,y:(G.y+F.y)/2},u={x:D.x/L,y:D.y/L},f=function(X){return (X.x-M.x)*D.x+(X.y-M.y)*D.y;};
  var R=[{x:0,y:0},{x:W,y:0},{x:W,y:H},{x:0,y:H}],front=jbClip(R,f),near=jbClip(R,function(X){return -f(X);});
  var refl=near.map(function(X){var k=2*f(X)/(L*L);return {x:X.x-k*D.x,y:X.y-k*D.y};});
  el.style.clipPath=front.length>2?'polygon('+front.map(function(q){return jbX(q.x).toFixed(1)+'px '+q.y.toFixed(1)+'px';}).join(',')+')':'polygon(0 0,0 0,0 0)';
  if(near.length<3){s.innerHTML='';return;}
  var far=1,i,dd;for(i=0;i<refl.length;i++){dd=(refl[i].x-M.x)*u.x+(refl[i].y-M.y)*u.y;if(dd>far)far=dd;}
  var x1=jbX(M.x),y1=M.y,x2=jbX(M.x+u.x*far),y2=M.y+u.y*far,sx=jbX(M.x-u.x*44),sy=M.y-u.y*44,ox=(jbRtl()?1:-1)*u.x*5;
  s.innerHTML='<defs><linearGradient id="jb-bk" gradientUnits="userSpaceOnUse" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'">'+
    '<stop offset="0" stop-color="#cfc5b7"/><stop offset=".08" stop-color="#e9e2d7"/><stop offset=".35" stop-color="#faf7f2"/><stop offset=".8" stop-color="#f1ebe2"/><stop offset="1" stop-color="#e2d9cc"/></linearGradient>'+
    '<linearGradient id="jb-un" gradientUnits="userSpaceOnUse" x1="'+x1+'" y1="'+y1+'" x2="'+sx+'" y2="'+sy+'"><stop offset="0" stop-color="#3a2d20" stop-opacity=".3"/><stop offset="1" stop-color="#3a2d20" stop-opacity="0"/></linearGradient>'+
    '<filter id="jb-bl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter></defs>'+
    '<polygon points="'+jbPts(near)+'" fill="url(#jb-un)"/>'+
    '<polygon points="'+jbPts(refl)+'" fill="#3a2d20" opacity=".22" filter="url(#jb-bl)" transform="translate('+ox.toFixed(1)+','+(u.y*5+3).toFixed(1)+')"/>'+
    '<polygon points="'+jbPts(refl)+'" fill="url(#jb-bk)"/>';
}
function jbUnder(p){var a=document.getElementById('jb1'),b=document.getElementById('jb2');p=Math.max(0,Math.min(1,p));
  if(a)a.style.transform='translateY('+(10-10*p)+'px) scale('+(.975+.025*p)+')';if(b)b.style.transform='translateY('+(20-10*p)+'px) scale('+(.95+.025*p)+')';}
function jbTop(q){var z=document.getElementById('jb0');if(z)z.style.transform=q>0?'translateY('+(10*q)+'px) scale('+(1-.025*q)+')':'';}
function jbLegal(G,F){var D={x:F.x-G.x,y:F.y-G.y},M={x:(G.x+F.x)/2,y:(G.y+F.y)/2};if(D.x*D.x+D.y*D.y<1)return true;
  return ((_jbW-M.x)*D.x+(0-M.y)*D.y)>=-0.5&&((_jbW-M.x)*D.x+(_jbH-M.y)*D.y)>=-0.5;}
function jbLocal(e){var st=document.getElementById('jb-stack'),r=st.getBoundingClientRect();return {x:jbX(e.clientX-r.left),y:e.clientY-r.top};}
function jbBind(){var st=document.getElementById('jb-stack');if(!st)return;
  st.onpointerdown=function(e){var t=e.target;if(t.tagName==='TEXTAREA'&&document.activeElement===t)return;_jbDrag={s:jbLocal(e),live:false};};
  st.onpointermove=function(e){var d=_jbDrag;if(!d)return;var p=jbLocal(e),dx=p.x-d.s.x,dy=p.y-d.s.y;
    if(!d.live){if(Math.abs(dx)<7)return;if(Math.abs(dy)>Math.abs(dx)){_jbDrag=null;return;}
      if(dx>0){d.el=document.getElementById('jb0');d.G={x:Math.min(d.s.x,_jbW*.85),y:d.s.y};d.back=false;}
      else{d.el=document.getElementById('jb-1');if(!d.el){_jbDrag=null;return;}d.G={x:0,y:d.s.y};d.back=true;}
      d.live=true;try{st.setPointerCapture(e.pointerId);}catch(_){}if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();}
    e.preventDefault();
    var now=performance.now();if(d.t)d.v=(p.x-d.px)/Math.max(1,now-d.t);d.t=now;d.px=p.x;d.fx=p.x;
    var Fp=d.back?{x:2*_jbW+dx,y:d.s.y+dy}:{x:d.G.x+dx,y:d.G.y+dy};
    if(!jbLegal(d.G,Fp))return;d.F=Fp;jbFold(d.el,d.G,Fp);
    var pr=(Fp.x-d.G.x)/(2*_jbW-2*d.G.x||1);if(d.back)jbTop(1-pr);else jbUnder(pr);};
  st.onpointerup=st.onpointercancel=function(){var d=_jbDrag;_jbDrag=null;if(!d||!d.live||!d.F)return;
    var turned={x:2*_jbW-d.G.x,y:d.G.y},v=d.v||0,fx=d.fx==null?d.s.x:d.fx;
    /* past the middle of the page, or flicked that way */
    var go=d.back?(fx<_jbW/2||v<-0.45):(fx>_jbW/2||v>0.45);
    if(!d.back)jbAnim(d,go?turned:d.G,go?function(){jbGo(-1);}:function(){d.el.style.clipPath='';d.el.classList.remove('jb-turning');document.getElementById('jb-fold').innerHTML='';jbUnder(0);});
    else jbAnim(d,go?d.G:turned,go?function(){jbGo(1);}:function(){jbHide(d.el);document.getElementById('jb-fold').innerHTML='';jbTop(0);});};
}
function jbAnim(d,to,done){var from=d.F,t0=performance.now();
  (function step(t){var k=Math.min(1,(t-t0)/320),e=1-Math.pow(1-k,3);
    var Fp={x:from.x+(to.x-from.x)*e,y:from.y+(to.y-from.y)*e-Math.sin(e*Math.PI)*10};
    jbFold(d.el,d.G,Fp);var pr=(Fp.x-d.G.x)/(2*_jbW-2*d.G.x||1);if(d.back)jbTop(1-pr);else jbUnder(pr);
    if(k<1)requestAnimationFrame(step);else done();})(t0);}
/* the arrows play the same fold, grabbed at the edge low on the page */
function jbAuto(dir){if(_jbDrag)return;jrnlFlush();
  if(dir>0){var d={el:document.getElementById('jb0'),G:{x:6,y:_jbH*.72},back:false};d.F={x:7,y:d.G.y};jbAnim(d,{x:2*_jbW-6,y:d.G.y},function(){jbGo(-1);});}
  else{var b={el:document.getElementById('jb-1'),G:{x:0,y:_jbH*.72},back:true};if(!b.el)return;b.F={x:2*_jbW,y:b.G.y};jbAnim(b,b.G,function(){jbGo(1);});}}` + s.slice(b + 2);

/* CSS */
rep(`.jrnl-head{display:flex;align-items:center;gap:8px;margin-bottom:12px}`, `.jrnl-head{display:flex;align-items:center;gap:8px;margin-bottom:12px}
/* ── the journal: notebooks, a stack of pages, paper ── */
#content{--jb-lh:32px;--jb-rule:rgba(130,150,180,.30);--jb-paper:#f6f2ec}
.jb-top{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.jb-nbs{flex:1;min-width:0;display:flex;gap:8px;overflow-x:auto;padding:4px 2px 6px;scrollbar-width:none}.jb-nbs::-webkit-scrollbar{display:none}
.jb-nb{flex:none;display:flex;align-items:center;gap:7px;border:none;border-radius:999px;padding:8px 13px;font-family:inherit;font-size:13.5px;font-weight:800;color:var(--nu-muted);cursor:pointer;
  background:var(--nu-ground);box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}
.jb-nb i{width:10px;height:14px;border-radius:2px 3px 3px 2px;background:var(--c)}
.jb-nb.on{color:var(--nu-ink);box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.jb-ic{flex:none;width:40px;height:40px;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;background:var(--nu-ground);
  box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}
.jb-ic svg{width:18px;height:18px;fill:none;stroke:var(--nu-ink);stroke-width:1.8;stroke-linecap:round}
.jb-wk{display:flex;align-items:center;gap:10px;margin:2px 2px 0;font-size:12.5px;font-weight:700;color:var(--nu-muted)}
.jb-dots{display:flex;gap:7px}
.jb-dots i{width:9px;height:9px;border-radius:50%;background:#d8d2ca;box-shadow:inset 1px 1px 2px var(--nu-shade)}
.jb-dots i.on{background:var(--nu-amber);box-shadow:0 0 7px rgba(240,169,46,.7)}
.jb-dots i.now{outline:2px solid rgba(74,69,63,.35);outline-offset:2px}
.jb-spark{display:flex;align-items:center;gap:6px;margin:10px 2px 0;font-size:13.5px;font-weight:600;color:var(--nu-muted);min-height:28px}
.jb-spark span{flex:1;min-width:0}
.jb-spark button{border:none;background:none;color:var(--nu-muted);font-family:inherit;font-size:16px;cursor:pointer;padding:2px 4px}
.jb-spark .jb-use{font-size:12.5px;font-weight:800;border-radius:999px;padding:5px 11px;color:var(--nu-ink);background:var(--nu-ground);box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}
.jb-stack{position:relative;margin-top:12px;height:490px;touch-action:pan-y}
.jb-card{position:absolute;left:0;top:0;width:100%;height:458px;border-radius:18px;background:var(--jb-paper);padding:16px 18px 0;overflow:hidden;
  box-shadow:-3px -3px 9px var(--nu-lit),5px 7px 16px rgba(120,100,80,.18)}
.jb-c1{transform:translateY(10px) scale(.975);transform-origin:50% 100%}
.jb-c2{transform:translateY(20px) scale(.95);transform-origin:50% 100%}
.jb-turning{border-radius:0;box-shadow:none}
.jb-edge{position:absolute;top:12px;bottom:12px;inset-inline-start:0;width:4px;border-radius:0 3px 3px 0;background:var(--c)}
[dir=rtl] .jb-edge{border-radius:3px 0 0 3px}
.jb-dt{font-family:"Frank Ruhl Libre",serif;font-size:19px;font-weight:700;display:flex;gap:12px;align-items:baseline;height:38px;color:var(--nu-ink)}
.jb-dt small{font-family:Assistant,sans-serif;font-size:12.5px;color:var(--nu-muted);font-weight:700}
/* the writing: one line of text per rule, the rules scroll with it */
.jb-wr{display:block;width:100%;height:calc(var(--jb-lh)*12);border:none;outline:none;resize:none;padding:0;margin:0;
  font-family:"Frank Ruhl Libre",serif;font-size:18px;line-height:var(--jb-lh);color:var(--nu-ink);white-space:pre-wrap;overflow-y:auto;
  background-color:transparent;background-attachment:local;background-position:0 0;scrollbar-width:none}
.jb-wr::-webkit-scrollbar{display:none}
.jb-wr::placeholder{color:#a59c90}
.jb-empty{color:#a59c90}
.jb-lines{background-image:repeating-linear-gradient(180deg,transparent 0 calc(var(--jb-lh) - 1px),var(--jb-rule) calc(var(--jb-lh) - 1px) var(--jb-lh))}
.jb-grid{background-image:repeating-linear-gradient(180deg,transparent 0 calc(var(--jb-lh) - 1px),var(--jb-rule) calc(var(--jb-lh) - 1px) var(--jb-lh)),
  repeating-linear-gradient(90deg,transparent 0 calc(var(--jb-lh) - 1px),var(--jb-rule) calc(var(--jb-lh) - 1px) var(--jb-lh))}
.jb-dots-p,.jb-wr.jb-dots,.jb-papers .jb-dots{background-image:radial-gradient(circle,rgba(120,110,100,.42) 1.3px,transparent 1.6px);background-size:var(--jb-lh) var(--jb-lh);
  background-position:right calc(var(--jb-lh)/-2) bottom calc(var(--jb-lh)/-2)}
#jb-fold{position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:20}
.jb-row{display:flex;justify-content:space-between;align-items:center;margin-top:2px;gap:8px}
.jb-btn{border:none;border-radius:999px;padding:9px 14px;font-family:inherit;font-size:13.5px;font-weight:800;color:var(--nu-ink);cursor:pointer;background:var(--nu-ground);
  box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}
.jb-btn[disabled]{opacity:.4;cursor:default}
.jb-papers{display:flex;gap:7px}
.jb-papers button{--jb-lh:7px;width:34px;height:34px;border-radius:11px;border:none;cursor:pointer;background-color:var(--jb-paper);box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}
.jb-papers button.on{box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.jb-tints{display:flex;gap:10px;margin-bottom:12px}
.jb-tints button{width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;background:var(--c);box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}
.jb-tints button.on{box-shadow:inset 2px 3px 6px rgba(0,0,0,.18),0 0 0 3px rgba(74,69,63,.25)}
.jb-kinds{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px}
.jb-kinds button{border:none;border-radius:999px;padding:7px 12px;font-family:inherit;font-size:13px;font-weight:800;color:var(--nu-muted);cursor:pointer;background:var(--nu-ground);
  box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}`);
/* the en answer for "that day" said "today" */
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
