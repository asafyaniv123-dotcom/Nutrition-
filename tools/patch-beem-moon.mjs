/* BEEM BECOMES THE MOON WHEN THE DAY IS CLOSED (Asaf, 21 Oct; approved on
 * review/beem-moon). Three moments, all with the kit's own moon:
 *  1. the summary's last page: after the celebration he falls asleep into the
 *     moon and the page goes to night;
 *  2. all night the corner niche holds the moon - the day is closed, at a glance;
 *  3. the first open of the next morning: the moon leaves the niche to the
 *     left and is GONE before he changes; the sun comes in from the right,
 *     and one soft sweep of sand-coloured light crosses the screen. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* CSS: the niche clips what moves in it (Safari needs clip-path for a moving
   canvas), the slide, the light, and the summary page's night */
rep(`.bhelp-b{width:46px;height:46px;pointer-events:none}`,
`.bhelp-b{width:46px;height:46px;pointer-events:none}
.bhelp{overflow:hidden;clip-path:circle(50%);-webkit-clip-path:circle(50%);isolation:isolate}
.bhelp-b.go{transition:transform 1.5s cubic-bezier(.55,0,.75,.4)}
.bhelp-b.come{transition:transform 1.7s cubic-bezier(.2,.8,.3,1)}
/* the morning's light: a wide soft band, no edge, under a third of full
   strength - light passing, not a colour arriving */
.bhelp-flash{position:fixed;inset:0;z-index:112;pointer-events:none;opacity:0;
  background:linear-gradient(118deg,transparent 22%,rgba(240,216,170,.08) 34%,rgba(242,222,182,.2) 44%,rgba(250,240,220,.28) 50%,rgba(242,222,182,.2) 56%,rgba(240,216,170,.08) 66%,transparent 78%);
  background-size:260% 260%;background-position:100% 0;animation:bhSweep 2.8s cubic-bezier(.45,.05,.4,1) forwards}
@keyframes bhSweep{0%{opacity:0;background-position:100% 0}35%{opacity:1}65%{opacity:1}100%{opacity:0;background-position:0 100%}}
/* the summary once the day is closed: the home screen's own night tokens */
html body.mod-endofday.rf-night{--nu-ground:#2a2623;--nu-lit:rgba(255,236,214,.07);
  --nu-shade:rgba(0,0,0,.55);--nu-shade-soft:rgba(0,0,0,.4);--nu-ink:#efe6dc;--nu-muted:#b3a698}
html body.mod-endofday .app{transition:background-color 2.6s ease}
@media (prefers-reduced-motion:reduce){.bhelp-b.go,.bhelp-b.come{transition:none}.bhelp-flash{display:none}}`);

/* the night leaves with the summary screen */
rep(`function enterModule(mod){
  setTimeout(function(){areaIntroMaybe(mod);},450);`, `function enterModule(mod){
  setTimeout(function(){areaIntroMaybe(mod);},450);
  if(mod!=='endofday')document.body.classList.remove('rf-night');`);
rep(`function goHome(){
  jrnlFlush();`, `function goHome(){
  document.body.classList.remove('rf-night');
  jrnlFlush();`);

/* the corner: sun or moon by whether today is closed, checked on mount, on
   every return to the app and once a minute (the 04:00 rollover can happen
   with the app open) */
rep(`  beemKit().then(function(K){
    _bhelp.B=K.mount(document.getElementById('bhelp-b'),{play:{dur:9000,ev:[[0,'face','happy'],[0,'mode',{breathe:[.016,4],idle:0}]]}});
  }).catch(function(){});
}`, `  beemHelpSky();
  setInterval(beemHelpSky,60000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)beemHelpSky();});
}
/* ── THE MOON ── the day is closed when today's summary is finished, and the
   app's day ends at 04:00, so the moon stays until then by itself */
var BEEM_SUN_IDLE={dur:9000,ev:[[0,'face','happy'],[0,'mode',{breathe:[.016,4],idle:0}]]};
var BEEM_MOON_STILL={dur:1e9,ev:[[0,'fx',{t:'fx',v:{beads:1},d:0}],[0,'fx',{t:'body',v:{moon:1},d:0}],[0,'face','closed'],
  [0,'mode',{idle:0,breathe:[.02,5.4],spinMul:.18}]]};
var BEEM_NIGHT={dur:1e9,ev:[[0,'face','sleepy'],[0,'mode',{idle:0,breathe:[.02,5.4],spinMul:.18}],[0,'fx',{t:'fx',v:{beads:1},d:0}],
  [200,'fx',{t:'body',v:{moon:1},d:3200}],[1600,'face','closed']]};
var BEEM_SUN_WAKE={dur:1e9,ev:[[0,'face','sleepy'],[0,'mode',{idle:0,breathe:[.016,4]}],[1500,'face','happy'],[1700,'nod',1,8],[2900,'face','calm']]};
function beemDayClosed(){return rfDone(rfRec(todayStr()));}
function beemHelpSky(){
  var el=document.getElementById('bhelp-b');if(!el)return;
  var want=beemDayClosed()?'moon':'sun',prev=_bhelp.sky||'';   // i18n-exempt: state keys
  if(want===prev)return;
  _bhelp.sky=want;
  beemKit().then(function(K){
    if(!el.isConnected)return;
    /* the morning: the first time today, after a night that was closed -
       either the app opening, or the night ending with it open. Before two in
       the afternoon; a sunrise at eight in the evening is not a morning. */
    var key='beem_morning',seen='';try{seen=localStorage.getItem(key)||'';}catch(e){}
    var morning=want==='sun'&&(prev==='moon'||(!prev&&rfDone(rfRec(dayShift(-1)))))&&seen!==todayStr()&&new Date().getHours()<14;
    var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.className='bhelp-b';el.style.transform='';el.innerHTML='';
    if(!morning||still){
      _bhelp.B=K.mount(el,{play:want==='moon'?'moon':BEEM_SUN_IDLE});   // i18n-exempt: a kit script name
      if(morning)try{localStorage.setItem(key,todayStr());}catch(e){}
      return;
    }
    try{localStorage.setItem(key,todayStr());}catch(e){}
    _bhelp.B=K.mount(el,{play:BEEM_MOON_STILL});
    /* out to the left and a little down, the way the moon sets... */
    setTimeout(function(){el.className='bhelp-b go';el.style.transform='translate(-64px,14px)';},900);
    /* ...and only once it is gone does he change, out of sight, on the right */
    setTimeout(function(){
      el.className='bhelp-b';el.innerHTML='';el.style.transform='translate(64px,14px)';
      _bhelp.B=K.mount(el,{play:BEEM_SUN_WAKE});
    },2600);
    setTimeout(function(){el.className='bhelp-b come';el.style.transform='translate(0,0)';},2750);
    setTimeout(function(){
      var f=document.createElement('div');f.className='bhelp-flash';document.body.appendChild(f);
      setTimeout(function(){f.remove();},3000);
    },3600);
  }).catch(function(){});
}`);

/* 1 - the last page of the summary: the celebration, then the moon */
rep(`  var _rfToday=_rfDate===todayStr();
  beemMount(document.getElementById('rf-beem'),function(K){
    var n=streakNow().n,st=document.getElementById('rf-streak');
    if(st&&n)st.textContent=_t('יום {n} ברצף',{n:n});
    return {play:_rfToday&&BEEM_MILESTONES.indexOf(n)>=0?'golden':'celebrate',glow:n};
  });
}`, `  var _rfToday=_rfDate===todayStr(),_rfEl=document.getElementById('rf-beem');
  beemKit().then(function(K){
    if(!_rfEl||!_rfEl.isConnected||_rfEl.firstChild)return;
    var n=streakNow().n,st=document.getElementById('rf-streak'),gold=_rfToday&&BEEM_MILESTONES.indexOf(n)>=0;
    if(st&&n)st.textContent=_t('יום {n} ברצף',{n:n});
    var b=K.mount(_rfEl,{play:gold?'golden':'celebrate',glow:n});   // i18n-exempt: kit script names
    if(!_rfToday)return;
    /* glad of the day first - then he falls asleep into the moon, and the
       page goes to night around him */
    setTimeout(function(){
      if(!_rfEl.isConnected)return;
      try{K.glow(b,0);b.play(BEEM_NIGHT);}catch(e){}
      document.body.classList.add('rf-night');
      var sub=document.querySelector('.rf-body .rf-sub'),nm=greetName();
      if(sub)sub.textContent=nm?_t('לילה טוב, {name}.',{name:nm}):_t('לילה טוב.');
      beemHelpSky();
    },gold?8600:4600);
  }).catch(function(){});
}`);

/* back on the summary's own home later that night: still the moon, still night */
rep(`  beemMount(document.getElementById('rf-beem'),{play:_bDone?'counted':'invite',glow:_bN});`,
`  var _bNight=_bDone&&_rfDate===todayStr();
  document.body.classList.toggle('rf-night',_bNight);
  beemMount(document.getElementById('rf-beem'),_bNight?{play:'moon'}:{play:_bDone?'counted':'invite',glow:_bN});   // i18n-exempt: kit script names`);

fs.writeFileSync(F, s);
console.log('patched');
