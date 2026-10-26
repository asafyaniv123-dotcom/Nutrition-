/* Asaf's notes from his phone, 26 Oct (second round):
 * 1. the area tour popped in too fast: it now fades in, the card rises
 *    gently, and between steps the words cross-fade while the card glides
 * 2. the planning delete step shows it: a small task slides aside and the
 *    red bin lights, on a loop, inside the card
 * 3. the hobby wizard: no dark "המשך" and no blue focus ring - the soft
 *    raised button with the amber lamp, like the evening banner's
 * 4. the toast: a soft raised pill in the material, rising gently, instead of
 *    the dark grey slab
 * 5. "Me" sat under the clock on the iPhone: the page clears the status bar */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

rep(`html body[class] .home-menu{top:calc(18px + env(safe-area-inset-top))}`, `html body[class] .home-menu{top:calc(18px + env(safe-area-inset-top))}
html body #me-screen.me-screen{padding-top:calc(34px + env(safe-area-inset-top))}
/* the area tour arrives, it does not pop (26.10) */
.tour.at{animation:tourIn .5s ease both}
@keyframes tourIn{from{opacity:0}}
.tour.at .tour-c{transition:top .5s cubic-bezier(.22,.61,.36,1);animation:tourCard .6s .12s cubic-bezier(.22,.61,.36,1) both}
@keyframes tourCard{from{opacity:0;transform:translateY(18px) scale(.98)}}
.tour.at .tour-t,.tour.at .tour-d,.tour.at .tour-demo{transition:opacity .2s}
.tour.at .tour-c.sw .tour-t,.tour.at .tour-c.sw .tour-d,.tour.at .tour-c.sw .tour-demo{opacity:0}
/* the delete step, shown: a task slides aside and the bin lights */
.tour-demo{position:relative;height:64px;margin:0 0 12px;border-radius:18px;overflow:hidden;
  box-shadow:inset 2px 3px 7px rgba(186,160,124,.4),inset -2px -2px 6px rgba(255,251,243,.9)}
.td-chip{position:absolute;top:14px;inset-inline-start:16px;height:36px;padding:0 16px;border-radius:12px;display:flex;align-items:center;
  font-weight:800;font-size:14px;color:#4a453f;background:#dfe8f3;box-shadow:-2px -2px 5px rgba(255,255,255,.9),3px 3px 8px rgba(160,140,120,.3);
  animation:tdChip 2.8s cubic-bezier(.4,0,.2,1) infinite}
.td-bin{position:absolute;top:8px;inset-inline-end:12px;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;
  background:rgba(176,80,58,.25);animation:tdBin 2.8s ease infinite}
.td-bin svg{width:22px;height:22px;fill:none;stroke:#fff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
@keyframes tdChip{0%,12%{transform:none;opacity:1}55%{transform:translateX(calc(var(--td-dir,1) * 190px)) scale(.7);opacity:0}100%{transform:translateX(calc(var(--td-dir,1) * 190px)) scale(.7);opacity:0}}
@keyframes tdBin{0%,20%{transform:scale(.8);background:rgba(176,80,58,.25)}40%,58%{transform:scale(1.12);background:#b0503a}80%,100%{transform:scale(.8);background:rgba(176,80,58,.25)}}
[dir=rtl] .tour-demo{--td-dir:-1}
@media (prefers-reduced-motion:reduce){.td-chip,.td-bin,.tour.at,.tour.at .tour-c{animation:none}}
/* the hobby wizard in the material: no dark slab, no blue ring */
.hbw-in:focus{outline:none;box-shadow:inset 3px 3px 7px var(--nu-shade),inset -3px -3px 7px var(--nu-lit),0 0 0 2px rgba(240,169,46,.35)}
html body .hbw-next{position:relative;background:var(--nu-ground);color:var(--nu-ink);
  box-shadow:-4px -4px 10px var(--nu-lit),6px 8px 18px var(--nu-shade)}
html body .hbw-next::after{content:"";position:absolute;left:50%;transform:translateX(-50%);width:54px;bottom:-5px;height:2px;border-radius:2px;background:var(--nu-amber,#f0a92e)}
/* the toast in the material (26.10) */
html body .toast{inset-inline-end:auto;left:50%;transform:translateX(-50%);bottom:calc(118px + env(safe-area-inset-bottom));
  max-width:calc(100% - 48px);text-align:center;background:#f3f0eb;color:#4a453f;font-size:14px;font-weight:700;padding:12px 22px;border-radius:999px;
  box-shadow:-3px -3px 9px rgba(255,255,255,.85),6px 10px 26px rgba(90,74,60,.22);animation:toastIn .45s cubic-bezier(.22,.61,.36,1) both}
@keyframes toastIn{from{opacity:0;transform:translate(-50%,12px)}}`);

/* 1 + 2 in the tour itself */
rep(`  w.className='tour';w.id='tour';
  w.innerHTML='<svg><path id="tour-hole" fill-rule="evenodd"/></svg><div class="tour-c" id="tour-c"><div class="tour-r"><div class="tour-b" id="tour-b"></div>'+`,
`  w.className='tour at';w.id='tour';
  w.innerHTML='<svg><path id="tour-hole" fill-rule="evenodd"/></svg><div class="tour-c" id="tour-c"><div class="tour-demo" id="tour-demo" hidden></div><div class="tour-r"><div class="tour-b" id="tour-b"></div>'+`);
rep(`    ['#plan-sec-week',_t('ולמחוק? מחליקים.'),_t('גוררים משימה לפח, או מחליקים אותה הצידה, והיא יורדת מהלוח. החלקה על הלוח עצמו מעבירה שבוע.')],`,
  `    ['#plan-sec-week',_t('ולמחוק? מחליקים.'),_t('גוררים משימה לפח, או מחליקים אותה הצידה, והיא יורדת מהלוח. החלקה על הלוח עצמו מעבירה שבוע.'),'swipe'],`);
rep(`  return S[i]?{el:S[i][0],t:S[i][1],d:S[i][2]}:null;`, `  return S[i]?{el:S[i][0],t:S[i][1],d:S[i][2],demo:S[i][3]||''}:null;`);
rep(`    document.getElementById('tour-t').textContent=st.t;document.getElementById('tour-d').textContent=st.d;
    var h='',i;for(i=0;i<N;i++)h+='<i'+(i===k?' class="on"':'')+'></i>';document.getElementById('tour-dots').innerHTML=h;
    var last=!areaTourNext(k);`,
`    var cc=document.getElementById('tour-c'),first=!cc.dataset.shown;cc.dataset.shown='1';
    function words(){
      document.getElementById('tour-t').textContent=st.t;document.getElementById('tour-d').textContent=st.d;
      var dm=document.getElementById('tour-demo');
      if(st.demo==='swipe'){dm.hidden=false;dm.innerHTML='<i class="td-chip">'+esc(_t('משימה'))+'</i><span class="td-bin"><svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M10 4.2h4"/><path d="M6.2 7l.9 12.1A1.9 1.9 0 0 0 9 21h6a1.9 1.9 0 0 0 1.9-1.9L17.8 7"/><path d="M10 10.8v6.2"/><path d="M14 10.8v6.2"/></svg></span>';}
      else{dm.hidden=true;dm.innerHTML='';}
    }
    if(first)words();else{cc.classList.add('sw');setTimeout(function(){words();cc.classList.remove('sw');},200);}
    var h='',i;for(i=0;i<N;i++)h+='<i'+(i===k?' class="on"':'')+'></i>';document.getElementById('tour-dots').innerHTML=h;
    var last=!areaTourNext(k);`);
/* a moment longer before he speaks, so the area is seen first */
rep(`  setTimeout(function(){areaTourMaybe(mod);},1100);`, `  setTimeout(function(){areaTourMaybe(mod);},1600);`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
