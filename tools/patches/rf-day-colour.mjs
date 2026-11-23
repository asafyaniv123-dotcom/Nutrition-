// סיום יום, approved on the review page (23 Nov): a day with no photograph can have a COLOUR instead, chosen at the photo
// question; the calendar in Me shows the day's photo, else its colour; and "סיימתי להיום" files the day - the card drops
// into a binder, the cover closes with the day's date on it, the spine lights, the binder flies to Me and lands in its day.
// usage: node tools/patches/rf-day-colour.mjs [--reverse]
import fs from 'node:fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [];
const P = (a, b) => pairs.push([a, b]);

/* ── CSS ── */
P(`/* ── AND THE END ── the one moment the day is allowed to be an object ── */`,
`/* ── THE DAY'S COLOUR ── a day with no photograph can still be told apart in the
   calendar: it keeps the colour it was given. Eight soft lights, far enough apart
   that no two read as the same one; a COLOUR is shown in a pressed channel, never
   painted on as a seam. Stored as its key, so the palette can be retuned later. */
html body.mod-endofday .rf-or{display:flex;align-items:center;gap:10px;color:var(--nu-muted);font-size:12px;margin:22px 0 10px}
html body.mod-endofday .rf-or::before,html body.mod-endofday .rf-or::after{content:"";flex:1;height:1px;background:var(--nu-shade-soft)}
html body.mod-endofday .rf-cq{text-align:center;font-weight:700;font-size:14px;margin-bottom:14px;color:var(--nu-ink)}
.rf-sw{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;justify-items:center}
.rf-sw button{width:46px;height:46px;padding:0;border:none;border-radius:50%;background:var(--nu-ground);cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.rf-sw i{display:block;width:26px;height:26px;border-radius:50%;background:var(--c);box-shadow:0 0 10px var(--c);transition:transform .2s,box-shadow .2s}
.rf-sw .on i{transform:scale(1.28);box-shadow:0 0 0 3px var(--nu-ground),0 0 16px var(--c)}
.cal-d.has-color{background:var(--dc)!important;color:#3b352f!important;
  box-shadow:inset 1px 2px 4px rgba(0,0,0,.12),0 0 9px var(--dc)!important}
.cal-d.has-color.today{box-shadow:0 0 0 2px var(--nu-ground),0 0 0 4px rgba(240,169,46,.6),0 0 12px var(--dc)!important}
.cal-d.rff-wait{opacity:.2}
.cal-d.rff-landed{animation:rffLand 1.1s ease-out}
@keyframes rffLand{0%{transform:scale(1.3);filter:drop-shadow(0 0 10px rgba(240,169,46,.9))}100%{transform:none;filter:none}}
/* ── FILING THE DAY ── on body, outside every screen, so no stacking context
   flattens it under the tab bar it flies to */
.rff{position:fixed;inset:0;z-index:9000;pointer-events:none;perspective:900px}
.rff-page,.rff-bk,.rff-mini{position:fixed;left:0;top:0}
.rff-page{border-radius:14px;background:var(--nu-ground);padding:16px 14px;box-sizing:border-box;overflow:hidden;
  box-shadow:-3px -3px 8px var(--nu-lit),4px 5px 12px var(--nu-shade)}
.rff-page i{display:block;height:6px;border-radius:3px;background:var(--nu-shade-soft);margin:0 0 9px}
.rff-page i:first-child{width:62%;height:8px;margin-bottom:13px}.rff-page i:nth-child(3){width:82%}.rff-page i:nth-child(4){width:58%}
.rff-bk{transform-style:preserve-3d}
.rff-bind,.rff-cover{position:absolute;inset:0;border-radius:14px;background:var(--nu-ground)}
.rff-bind{box-shadow:inset 3px 4px 9px var(--nu-shade),inset -3px -3px 8px var(--nu-lit)}
.rff-cover{transform-origin:right center;opacity:0;backface-visibility:visible;
  box-shadow:-3px -3px 8px var(--nu-lit),4px 5px 12px var(--nu-shade)}
.rff-plate{position:absolute;left:16px;right:28px;top:22%;border-radius:11px;padding:11px 8px;text-align:center;
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.rff-plate small{display:block;font-size:12px;font-weight:600;color:var(--nu-muted)}
.rff-plate b{display:block;font-size:18px;font-weight:800;line-height:1.25;color:var(--nu-ink)}
.rff-spine{position:absolute;right:11px;top:16px;bottom:16px;width:4px;border-radius:2px;background:var(--nu-shade-soft)}
.rff-mini{width:30px;height:37px;border-radius:6px;background:var(--nu-ground);
  box-shadow:-1px -1px 3px var(--nu-lit),2px 2px 5px var(--nu-shade)}
.rff-mini::after{content:"";position:absolute;right:5px;top:7px;bottom:7px;width:2px;border-radius:1px;
  background:rgba(240,169,46,.95);box-shadow:0 0 5px rgba(240,169,46,.7)}
.tb.rff-glow{box-shadow:0 0 0 2px rgba(240,169,46,.5),0 0 18px rgba(240,169,46,.6)!important}

/* ── AND THE END ── the one moment the day is allowed to be an object ── */`);

/* ── the photo question: the colour way out, offered while there is no photo ── */
P(`    h+='<input type="file" id="rf-file" accept="image/*" style="display:none" onchange="rfPhotoPick(this)">';
    h+='<button onclick="rfNext()" class="rf-next">'+_t('המשך')+'</button>';
  }`,
`    if(!cur)h+=rfDayColorHTML(rfVal('dayColor'));
    h+='<input type="file" id="rf-file" accept="image/*" style="display:none" onchange="rfPhotoPick(this)">';
    h+='<button onclick="rfNext()" class="rf-next">'+_t('המשך')+'</button>';
  }`);

P(`function rfPhotoClear(){photoDel(rfVal('photo'));`,
`/* THE DAY'S COLOUR. A key, not a hex, because what is stored is a choice and
   the paint is how it is shown. Tapping the chosen one again takes it back. */
var DAY_COLORS=[{k:'sun',c:'#f6c56b'},{k:'peach',c:'#f2a07e'},{k:'rose',c:'#ee8fa6'},{k:'lilac',c:'#c3a3e6'},
  {k:'sky',c:'#93b6ee'},{k:'sea',c:'#86cfd0'},{k:'leaf',c:'#9fd39b'},{k:'sand',c:'#d8c7a8'}];
function dayColorOf(k){for(var i=0;i<DAY_COLORS.length;i++)if(DAY_COLORS[i].k===k)return DAY_COLORS[i].c;return '';}
function rfDayColorHTML(cur){
  var h='<div class="rf-or">'+_t('או')+'</div><div class="rf-cq">'+_t('בלי תמונה היום? בחר צבע ליום')+'</div><div class="rf-sw">';
  DAY_COLORS.forEach(function(d,i){
    h+='<button class="'+(cur===d.k?'on':'')+'" style="--c:'+d.c+'" aria-pressed="'+(cur===d.k)+'" aria-label="'+esc(_t('צבע {n}',{n:i+1}))+
       '" onclick="rfPickDayColor(\\''+d.k+'\\')"><i></i></button>';
  });
  return h+'</div>';
}
function rfPickDayColor(k){rfSave({dayColor:rfVal('dayColor')===k?'':k});renderReflectStep();}
function rfPhotoClear(){photoDel(rfVal('photo'));`);

/* ── the calendar: the photo, else the colour ── */
P(`    } else if(canOpen){
      h+='<button class="cal-d'+(sum?' has':'')+(isT?' today':'')+'" onclick="openSummary(\\''+ds+'\\')">'+label+dotRow+'</button>';`,
`    } else if(canOpen){
      var dcol=sum&&sum.dayColor?dayColorOf(sum.dayColor):'';
      h+='<button class="cal-d'+(sum?' has':'')+(dcol?' has-color':'')+(isT?' today':'')+'"'+(dcol?' style="--dc:'+dcol+'"':'')+
         ' onclick="openSummary(\\''+ds+'\\')">'+label+(dcol?'':dotRow)+'</button>';`);

/* ── the closing button files the day ── */
P(`  h+='<button onclick="_rfView=\\'home\\';renderReflect()" class="rf-next" style="margin-top:30px">'+_t('סיימתי להיום')+'</button>';
  h+='</div></div>';
  document.getElementById('content').innerHTML=h;
  var _rfToday=_rfDate===todayStr(),_rfEl=document.getElementById('rf-beem');`,
`  h+='<button onclick="rfFileDay()" class="rf-next" style="margin-top:30px">'+_t('סיימתי להיום')+'</button>';
  h+='</div></div>';
  document.getElementById('content').innerHTML=h;
  var _rfToday=_rfDate===todayStr(),_rfEl=document.getElementById('rf-beem');`);

P(`/* The SAME page the sheet shows, on glass instead of in a drawer.`,
`/* FILING THE DAY (approved 23 Nov on the review page). The card drops into a
   binder, the cover closes with the day's date pressed into it, the spine
   lights, and the binder flies to Me - where it lands in the day's own square,
   which by then shows the day's photo or its colour. Only tonight is filed
   this way: an older day closes back to the list it was opened from. Anything
   missing - no card, no Me button, no Web Animations, reduced motion - and it
   goes straight to the landing, so the button can never do nothing. */
var _rffBusy=false;
function rfFileDay(){
  if(_rffBusy)return;
  var ds=_rfDate,card=document.getElementById('rfd-card'),me=document.getElementById('tb-me');
  if(ds!==todayStr()){_rfView='home';renderReflect();return;}
  var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!card||!me||!me.offsetParent||!card.animate||still){rfFileLand(ds,null);return;}
  _rffBusy=true;
  var W=Math.min(176,Math.round(innerWidth*.46)),H=Math.round(W*1.26),cx=innerWidth/2,cy=innerHeight*.42;
  var x0=cx-W/2,y0=cy-H/2,inset=13;
  var c=card.getBoundingClientRect(),top=Math.max(c.top,8),bot=Math.min(c.bottom,innerHeight-8);
  if(bot-top<60){top=c.top;bot=c.top+Math.max(60,c.height);}
  var day=new Date(ds+'T12:00:00');
  var ov=document.createElement('div');ov.className='rff';
  ov.innerHTML='<div class="rff-bk" style="width:'+W+'px;height:'+H+'px;transform:translate('+x0+'px,'+y0+'px);opacity:0">'+
    '<div class="rff-bind"></div><div class="rff-cover"><div class="rff-plate"><small>'+esc(dfmt(day,{weekday:'long'}))+'</small>'+
    '<b>'+esc(dfmt(day,{day:'numeric',month:'long'}))+'</b></div><div class="rff-spine"></div></div></div>'+
    '<div class="rff-page" style="width:'+c.width+'px;height:'+(bot-top)+'px;transform:translate('+c.left+'px,'+top+'px)"><i></i><i></i><i></i><i></i><i></i></div>';
  document.body.appendChild(ov);
  card.style.visibility='hidden';
  var bk=ov.querySelector('.rff-bk'),pg=ov.querySelector('.rff-page'),cv=ov.querySelector('.rff-cover'),sp=ov.querySelector('.rff-spine');
  var go=function(el,kf,ms,ease){return el.animate(kf,{duration:ms,easing:ease||'ease-in-out',fill:'forwards'}).finished;};
  var pause=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var at=function(x,y){return 'translate('+x+'px,'+y+'px)';};
  var pw=W-inset*2,ph=H-inset*2;
  go(bk,[{opacity:0},{opacity:1}],350);
  go(pg,[{transform:at(c.left,top),width:c.width+'px',height:(bot-top)+'px'},
         {transform:at(x0+inset,y0+inset),width:pw+'px',height:ph+'px'}],750)
  .then(function(){return go(cv,[{opacity:0,transform:'rotateY(-165deg)'},{opacity:1,transform:'rotateY(-150deg)',offset:.1},{opacity:1,transform:'rotateY(0)'}],850);})
  .then(function(){pg.style.opacity='0';
    return go(sp,[{background:'var(--nu-shade-soft)',boxShadow:'none'},
      {background:'linear-gradient(90deg,rgba(240,169,46,.35),rgba(255,214,140,.95),rgba(240,169,46,.35))',boxShadow:'0 0 12px rgba(240,169,46,.6)'}],550,'ease-out');})
  .then(function(){return pause(450);})
  .then(function(){
    var m=me.getBoundingClientRect(),tx=m.left+m.width/2-W/2,ty=m.top+m.height/2-H/2;
    return go(bk,[{transform:at(x0,y0)+' scale(1)',opacity:1},
      {transform:at(x0+(tx-x0)*.55,y0+(ty-y0)*.35)+' scale(.55)',opacity:1,offset:.5},
      {transform:at(tx,ty)+' scale(.14)',opacity:.15}],850,'cubic-bezier(.5,0,.75,0)');})
  .then(function(){me.classList.add('rff-glow');bk.remove();return pause(380);})
  .then(function(){me.classList.remove('rff-glow');rfFileLand(ds,ov);})
  .catch(function(){rfFileLand(ds,ov);});
}
/* Me opens on the month, and the day's binder comes out of the Me button and
   lands in its square. */
function rfFileLand(ds,ov){
  _rffBusy=false;
  _rfView='home';
  document.body.classList.remove('rf-night');
  if(_rfDate===ds&&currentModule==='endofday'){try{renderReflect();}catch(e){}}
  showMain('me');
  var cal=document.getElementById('home-cal'),cell=null;
  if(cal)[].forEach.call(cal.querySelectorAll('.cal-d'),function(b){if((b.getAttribute('onclick')||'').indexOf("'"+ds+"'")>=0)cell=b;});
  var me=document.getElementById('tb-me');
  if(!cell||!ov||!me||!me.offsetParent||!cell.animate){if(ov)ov.remove();if(cell){cell.classList.add('rff-landed');}return;}
  cell.scrollIntoView({block:'center'});
  cell.classList.add('rff-wait');
  var m=me.getBoundingClientRect(),d=cell.getBoundingClientRect();
  var mini=document.createElement('div');mini.className='rff-mini';ov.appendChild(mini);
  var x0=m.left+m.width/2-15,y0=m.top+m.height/2-18,x1=d.left+d.width/2-15,y1=d.top+d.height/2-18;
  var at=function(x,y){return 'translate('+x+'px,'+y+'px)';};
  mini.animate([{transform:at(x0,y0)+' scale(.6)',opacity:0},{transform:at(x0,y0-34)+' scale(1)',opacity:1,offset:.25},
    {transform:at(x1,y1-6)+' scale(.8)',opacity:1,offset:.85},{transform:at(x1,y1)+' scale(.4)',opacity:0}],
    {duration:1150,easing:'ease-in-out',fill:'forwards'}).finished.catch(function(){}).then(function(){
    ov.remove();cell.classList.remove('rff-wait');cell.classList.add('rff-landed');
  });
}
/* The SAME page the sheet shows, on glass instead of in a drawer.`);

if (rev) {
  for (const [a, b] of pairs.slice().reverse()) { if (s.split(b).length !== 2) throw new Error('reverse: not once: ' + b.slice(0, 80)); s = s.replace(b, () => a); }
} else {
  for (const [a, b] of pairs) { if (s.split(a).length !== 2) throw new Error('not once: ' + a.slice(0, 80)); s = s.replace(a, () => b); }
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied', pairs.length);
