/* The stopwatch and the countdown, after the phone's own Clock app
 * (review/clock-proto, approved 24 Oct): one screen with two tabs.
 *  - stopwatch: hundredths, lap / reset, start / stop, laps with the fastest
 *    and slowest marked;
 *  - countdown: hour / minute / second wheels, a ring that empties, the time
 *    it ends, pause / resume / cancel, recent lengths to start in one tap.
 * Every digit sits in a box of its own width, so the numbers do not shake
 * while they run (Asaf: "I don't like the numbers trembling"). */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

rep(`  h+='<button class="tm-go" onclick="wtMode(\\'up\\');_wtOpen=true;_wtFull=true;wtStart()">'+_t('שעון עצר')+'</button>';
  h+='<button class="tm-go" onclick="wtMode(\\'down\\');_wtOpen=true;_wtFull=true;wtPaint()">'+_t('ספירה לאחור')+'</button>';`,
`  h+='<button class="tm-go" onclick="ckOpen(\\'sw\\')">'+_t('שעון עצר')+'</button>';
  h+='<button class="tm-go" onclick="ckOpen(\\'cd\\')">'+_t('ספירה לאחור')+'</button>';`);

rep(`  else if(_fitView==='timer')renderFitTimer();`, `  else if(_fitView==='timer')renderFitTimer();
  else if(_fitView==='clock')renderFitClock();`);

rep(`function wtKindWhat(k){`, `/* ── THE STOPWATCH AND THE COUNTDOWN ──
   After the phone's own Clock app, which already has all of it: two tabs,
   two round buttons, laps under a stopwatch and recent lengths under a
   countdown. Both run off timestamps, so leaving the screen costs nothing -
   the interval keeps the countdown's bell and paints only what is there. */
var _ckTab='sw',_ckIv=null,
    _ckSw={run:false,from:0,acc:0,laps:[]},
    _ckCd={tot:0,end:0,rem:0,paused:false},
    CK_RECENT_KEY='ck_recent';
function ckOpen(tab){_ckTab=tab;_fitView='clock';renderFitness();}
function ckTabPick(tab){_ckTab=tab;renderFitness();}
/* EVERY CHARACTER IN A BOX OF ITS OWN. Even with tabular figures the face
   shook while it ran - a 1 is narrower than a 0 in this font - so each digit
   gets the same width and only the separators are narrow. */
function ckDigits(str){
  var h='',i,c;
  for(i=0;i<str.length;i++){c=str.charAt(i);
    h+=/[0-9\\u0660-\\u0669\\u06f0-\\u06f9]/.test(c)?'<i class="ck-d">'+c+'</i>':'<i class="ck-p">'+esc(c)+'</i>';}
  return h;
}
function ckDec(){return nfmt(1.5,{minimumFractionDigits:1}).replace(/[0-9\\u0660-\\u0669\\u06f0-\\u06f9]/g,'')||'.';}
function ckSwText(ms){
  var cs=Math.floor(ms/10)%100,sec=Math.floor(ms/1000)%60,m=Math.floor(ms/60000),hr=Math.floor(m/60),
      two={minimumIntegerDigits:2};
  return (hr?nfmt(hr)+':'+nfmt(m%60,two):nfmt(m,two))+':'+nfmt(sec,two)+ckDec()+nfmt(cs,two);
}
function ckCdText(sec){
  var hr=Math.floor(sec/3600),m=Math.floor(sec/60)%60,ss=sec%60,two={minimumIntegerDigits:2};
  return (hr?nfmt(hr)+':'+nfmt(m,two):nfmt(m))+':'+nfmt(ss,two);
}
function ckSwNow(){return _ckSw.acc+(_ckSw.run?Date.now()-_ckSw.from:0);}
function ckLapsSum(){var t=0,i;for(i=0;i<_ckSw.laps.length;i++)t+=_ckSw.laps[i];return t;}
function ckRecent(){try{var a=JSON.parse(localStorage.getItem(CK_RECENT_KEY)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}}
function ckWheelHTML(id,n){
  var h='<div class="ck-wl"><div class="ck-win"></div><div class="ck-col" id="'+id+'" onscroll="ckWheelPaint(this)"><div class="ck-pad"></div>',i;
  for(i=0;i<n;i++)h+='<div class="ck-r">'+nfmt(i)+'</div>';
  return h+'<div class="ck-pad"></div></div></div>';
}
function ckWheelPaint(c){
  var k=Math.round(c.scrollTop/36),rows=c.getElementsByClassName('ck-r'),i;
  for(i=0;i<rows.length;i++)rows[i].className=(i===k)?'ck-r on':'ck-r';
}
function ckWheelVal(id){var c=document.getElementById(id);return c?Math.round(c.scrollTop/36):0;}
function ckWheelsTo(t){
  [['ck-wh',Math.floor(t/3600)],['ck-wm',Math.floor(t/60)%60],['ck-ws',t%60]].forEach(function(x){
    var c=document.getElementById(x[0]);if(c){c.scrollTop=x[1]*36;ckWheelPaint(c);}});
}
function renderFitClock(){
  var h='<div style="padding-bottom:20px">';
  h+='<button class="fw-timerhome" style="margin-bottom:14px" onclick="_fitView=\\'timer\\';renderFitness()">&#8249; '+_t('חזרה')+'</button>';
  h+='<div class="ck-seg"><button class="'+(_ckTab==='sw'?'on':'')+'" onclick="ckTabPick(\\'sw\\')">'+_t('שעון עצר')+'</button>'+
     '<button class="'+(_ckTab==='cd'?'on':'')+'" onclick="ckTabPick(\\'cd\\')">'+_t('ספירה לאחור')+'</button></div>';
  if(_ckTab==='sw'){
    var t=ckSwNow(),run=_ckSw.run;
    h+='<div class="ck-face"><div class="ck-in"></div><div class="ck-dig" id="ck-dig"></div><div class="ck-sub" id="ck-sub"></div></div>';
    h+='<div class="ck-ctrl">'+
       '<button class="ck-rb" onclick="ckLap()"'+(!run&&!t?' disabled':'')+'>'+(run||!t?_t('הקפה'):_t('אפס'))+'</button>'+
       '<button class="ck-rb '+(run?'st':'go')+'" onclick="ckSwGo()">'+(run?_t('עצור'):(t?_t('המשך'):_t('התחל')))+'</button></div>';
    h+='<div class="ck-laps" id="ck-laps"></div>';
  } else {
    var on=!!(_ckCd.end||_ckCd.paused);
    if(!on){
      h+='<div class="ck-wheels">'+ckWheelHTML('ck-wh',24)+ckWheelHTML('ck-wm',60)+ckWheelHTML('ck-ws',60)+'</div>';
      h+='<div class="ck-wlab"><span>'+_t('שעות|גלגלת')+'</span><span>'+_t('דקות|גלגלת')+'</span><span>'+_t('שניות|גלגלת')+'</span></div>';
    } else {
      h+='<div class="ck-face"><svg class="ck-ring" viewBox="0 0 248 248"><circle id="ck-arc" cx="124" cy="124" r="112"/></svg>'+
         '<div class="ck-in"></div><div class="ck-dig" id="ck-dig"></div><div class="ck-sub" id="ck-sub"></div></div>';
    }
    var runC=!!_ckCd.end&&!_ckCd.paused;
    h+='<div class="ck-ctrl">'+
       '<button class="ck-rb" onclick="ckCdCancel()"'+(on?'':' disabled')+'>'+_t('ביטול')+'</button>'+
       '<button class="ck-rb '+(runC?'st':'go')+'" onclick="ckCdGo()">'+(runC?_t('השהה'):(_ckCd.paused?_t('המשך'):_t('התחל')))+'</button></div>';
    var rec=ckRecent(),i;
    if(rec.length){
      h+='<div class="tm-h" style="margin:22px 2px 9px">'+_t('אחרונים|טיימר')+'</div>';
      for(i=0;i<rec.length;i++)
        h+='<div class="ck-rc"><b>'+ckDigits(ckCdText(rec[i]))+'</b>'+
           '<button onclick="ckCdStart('+rec[i]+')" aria-label="'+esc(_t('התחל'))+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5Z"/></svg></button></div>';
    }
  }
  h+='</div>';
  document.getElementById('content').innerHTML=h;
  if(_ckTab==='cd'&&!(_ckCd.end||_ckCd.paused))ckWheelsTo(_ckCd.tot||(rec&&rec[0])||60);
  ckPaint();
}
/* five-and-twenty times a second while something runs; it writes three
   strings and does nothing else, so the buttons keep their :active */
function ckPaint(){
  var dig=document.getElementById('ck-dig'),sub=document.getElementById('ck-sub');
  if(_fitView!=='clock'||!dig)return;
  if(_ckTab==='sw'){
    var t=ckSwNow(),cur=t-ckLapsSum(),laps=_ckSw.laps,i,c,h='',mn,mx;
    dig.innerHTML=ckDigits(ckSwText(t));
    sub.innerHTML=(_ckSw.run||laps.length)?esc(_t('הקפה {n}',{n:laps.length+1}))+' &middot; '+ckDigits(ckSwText(cur)):'';
    mn=Math.min.apply(null,laps);mx=Math.max.apply(null,laps);
    if(_ckSw.run||t)h+='<div class="ck-lap cur"><span>'+esc(_t('הקפה {n}',{n:laps.length+1}))+'</span><span>'+ckDigits(ckSwText(cur))+'</span></div>';
    for(i=laps.length-1;i>=0;i--){
      c=(laps.length>1&&laps[i]===mn)?' best':(laps.length>1&&laps[i]===mx)?' worst':'';
      h+='<div class="ck-lap'+c+'"><span>'+esc(_t('הקפה {n}',{n:i+1}))+'</span><span>'+ckDigits(ckSwText(laps[i]))+'</span></div>';
    }
    var L=document.getElementById('ck-laps');if(L)L.innerHTML=h;
  } else {
    var ms=_ckCd.paused?_ckCd.rem:(_ckCd.end-Date.now()),left=Math.max(0,Math.ceil(ms/1000)),
        arc=document.getElementById('ck-arc'),C=2*Math.PI*112,endAt;
    dig.innerHTML=ckDigits(ckCdText(left));
    if(arc){arc.style.strokeDasharray=C.toFixed(1);arc.style.strokeDashoffset=(C*(1-Math.max(0,ms)/(_ckCd.tot*1000))).toFixed(1);}
    endAt=new Date(Date.now()+Math.max(0,ms));
    sub.innerHTML=_ckCd.paused?'':'&#128276; '+esc(fmtClock(endAt.getHours()+':'+endAt.getMinutes()));
  }
}
function ckTick(){
  if(_ckCd.end&&!_ckCd.paused&&Date.now()>=_ckCd.end){
    _ckCd.end=0;
    wtSound('done');
    if(!_ckSw.run){clearInterval(_ckIv);_ckIv=null;wtLockOff();}
    if(_fitView==='clock')renderFitness();
    return;
  }
  ckPaint();
}
function ckRun(){if(!_ckIv)_ckIv=setInterval(ckTick,40);wtLockOn();}
function ckIdle(){if(!_ckSw.run&&!(_ckCd.end&&!_ckCd.paused)){if(_ckIv){clearInterval(_ckIv);_ckIv=null;}wtLockOff();}}
function ckSwGo(){
  if(_ckSw.run){_ckSw.acc=ckSwNow();_ckSw.run=false;ckIdle();}
  else{_ckSw.from=Date.now();_ckSw.run=true;ckRun();}
  renderFitness();
}
function ckLap(){
  if(_ckSw.run){_ckSw.laps.push(ckSwNow()-ckLapsSum());ckPaint();return;}
  _ckSw={run:false,from:0,acc:0,laps:[]};renderFitness();
}
function ckCdStart(sec){
  if(!sec)return;
  sndPrime();
  _ckCd={tot:sec,end:Date.now()+sec*1000,rem:0,paused:false};
  var r=[sec].concat(ckRecent().filter(function(x){return x!==sec;})).slice(0,4);
  try{localStorage.setItem(CK_RECENT_KEY,JSON.stringify(r));}catch(e){}
  ckRun();renderFitness();
}
function ckCdGo(){
  if(_ckCd.paused){_ckCd.end=Date.now()+_ckCd.rem;_ckCd.paused=false;ckRun();renderFitness();return;}
  if(_ckCd.end){_ckCd.rem=_ckCd.end-Date.now();_ckCd.paused=true;ckIdle();renderFitness();return;}
  ckCdStart(ckWheelVal('ck-wh')*3600+ckWheelVal('ck-wm')*60+ckWheelVal('ck-ws'));
}
function ckCdCancel(){_ckCd={tot:_ckCd.tot,end:0,rem:0,paused:false};ckIdle();renderFitness();}
document.addEventListener('click',function(e){
  var r=e.target&&e.target.closest?e.target.closest('.ck-r'):null;if(!r)return;
  var c=r.parentNode,i=[].indexOf.call(c.getElementsByClassName('ck-r'),r);
  c.scrollTo({top:i*36,behavior:'smooth'});
});
function wtKindWhat(k){`);

rep(`.fw-timerhome{width:100%;background:#e9e7e3;`, `/* the stopwatch and the countdown */
.ck-seg,.ck-face,.ck-rb,.ck-lap,.ck-wl,.ck-wlab,.ck-rc{--nu-ground:#e9e7e3;--nu-lit:rgba(255,255,255,.95);
  --nu-shade:rgba(176,168,156,.44);--nu-shade-soft:rgba(176,168,156,.28);--nu-ink:#4a453f;--nu-muted:#6d675e}
.ck-seg{display:grid;grid-template-columns:1fr 1fr;gap:4px;border-radius:16px;padding:4px;background:var(--nu-ground);
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.ck-seg button{border:none;background:none;border-radius:12px;padding:11px 0;font-family:inherit;font-size:14.5px;font-weight:800;color:var(--nu-muted);cursor:pointer}
.ck-seg button.on{background:var(--nu-ground);color:var(--nu-ink);box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}
.ck-face{position:relative;margin:24px auto 0;width:272px;height:272px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:var(--nu-ground);box-shadow:-6px -6px 14px var(--nu-lit),7px 8px 18px var(--nu-shade-soft)}
.ck-in{position:absolute;inset:16px;border-radius:50%;box-shadow:inset 3px 4px 9px var(--nu-shade),inset -3px -3px 8px var(--nu-lit)}
.ck-ring{position:absolute;inset:16px;width:240px;height:240px;transform:rotate(-90deg)}
.ck-ring circle{fill:none;stroke:var(--terra-500);stroke-width:7;stroke-linecap:round}
.ck-dig{position:relative;display:flex;direction:ltr;font-size:52px;font-weight:800;color:var(--nu-ink);line-height:1}
.ck-d{display:inline-block;width:.6em;text-align:center;font-style:normal}
.ck-p{display:inline-block;font-style:normal;padding:0 .02em}
.ck-sub{position:relative;display:flex;align-items:center;gap:4px;font-size:13.5px;font-weight:700;color:var(--nu-muted);margin-top:8px;min-height:18px}
.ck-sub .ck-d{width:.6em}
.ck-ctrl{display:flex;justify-content:space-between;align-items:center;margin:24px 14px 0}
.ck-rb{width:84px;height:84px;border-radius:50%;border:none;font-family:inherit;font-size:15.5px;font-weight:800;cursor:pointer;
  background:var(--nu-ground);color:var(--nu-ink);box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 10px var(--nu-shade-soft)}
.ck-rb:active{box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.ck-rb.go{color:#3f7a52}.ck-rb.st{color:var(--terra-700)}
.ck-rb[disabled]{color:var(--nu-muted);opacity:.6;cursor:default}
.ck-laps{margin-top:20px}
.ck-lap{display:flex;justify-content:space-between;align-items:center;padding:11px 6px;border-top:1px solid rgba(176,168,156,.35);font-size:15.5px;font-weight:700;color:var(--nu-ink)}
.ck-lap:first-child{border-top:none}
.ck-lap span:last-child{display:flex;direction:ltr}
.ck-lap.cur{color:var(--nu-muted)}.ck-lap.best{color:#3f7a52}.ck-lap.worst{color:var(--terra-700)}
.ck-wheels{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:20px;direction:ltr}
.ck-wl{position:relative;height:180px;border-radius:18px;overflow:hidden;background:var(--nu-ground);
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.ck-win{position:absolute;left:6px;right:6px;top:72px;height:36px;border-radius:11px;pointer-events:none;
  box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}
.ck-col{position:relative;height:180px;overflow-y:auto;scroll-snap-type:y mandatory;scrollbar-width:none;overscroll-behavior:contain}
.ck-col::-webkit-scrollbar{display:none}
.ck-pad{height:72px}
.ck-r{height:36px;line-height:36px;scroll-snap-align:center;text-align:center;font-size:17px;font-weight:700;color:var(--nu-muted);cursor:pointer}
.ck-r.on{color:var(--nu-ink);font-weight:800;font-size:21px}
.ck-wlab{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center;font-size:12.5px;font-weight:800;color:var(--nu-muted);margin-top:6px;direction:ltr}
.ck-rc{display:flex;align-items:center;justify-content:space-between;border-radius:15px;padding:9px 12px;margin-bottom:8px;background:var(--nu-ground);
  box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}
.ck-rc b{display:flex;direction:ltr;font-size:21px;font-weight:800;color:var(--nu-ink)}
.ck-rc button{width:42px;height:42px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:var(--nu-ground);
  box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}
.ck-rc button:active{box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.ck-rc svg{width:16px;height:16px;fill:#3f7a52}
.fw-timerhome{width:100%;background:#e9e7e3;`);

if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('patched');
