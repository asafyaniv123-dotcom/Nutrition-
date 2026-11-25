// The ninth pair (25 Nov), as Asaf approved it on the review page, glazes included:
//  - ציר היום: a porcelain sundial with one ray of light over a lit thread; each moment a raised card on a bead
//    (small time, the moment in the page's serif, a quiet x). The parts of the day are pebbles that fill the time;
//    the exact time can still be typed. "What happened?" is one pressed slot with a round + button.
//  - לאן הלך הזמן: the canvas spiral becomes a porcelain dial of 24 cells, 0 at the top and clockwise, painted
//    by tap or drag in four soft glazes - dusty rose, sage, lavender, sand. The glazes are the one exception to
//    "only light" he approved, because four categories have to be told apart at a glance. Touching a cell that
//    already wears the chosen glaze starts an erasing stroke. The centre holds the hours marked; under the dial
//    a pressed bar per category. What is stored is unchanged: timeclock (25 entries, the 25th untouched) and
//    timeDistribution. The welded 'h' of the old totals is gone - the hours come from the plural key.
// The sundial is cut from the approved render into assets/rf-q9.webp (320x205); the dial is code.
// usage: node tools/patches/rf-q-timeline-clock.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`q.id==='recurringThought'?'loop':q.id==='selfCare'?'cup':'';`,
   `q.id==='recurringThought'?'loop':q.id==='selfCare'?'cup':q.id==='dayTimeline'?'sundial':'';`],
  [`k==='loop'||k==='cup'?'rf-q8':'rf-q';`,
   `k==='loop'||k==='cup'?'rf-q8':k==='sundial'?'rf-q9':'rf-q';`],
  [`    var tl=rfArr('dayTimeline');
    h+='<div style="display:flex;flex-direction:column;gap:0">';
    for(i=0;i<tl.length;i++){
      h+='<div style="display:flex;gap:12px;align-items:flex-start">';
      h+='<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:14px">';
      h+='<div class="rf-tl-dot"></div>';
      if(i<tl.length-1)h+='<div class="rf-tl-line"></div>';
      h+='</div>';
      h+='<div style="flex:1;padding-bottom:16px;min-width:0">';
      h+='<div style="font-size:10.5px;color:var(--muted);font-weight:700">'+esc(tl[i].t||'')+'</div>';
      h+='<div style="font-size:14px;color:var(--ink);line-height:1.5;margin-top:2px">'+esc(tl[i].w||'')+'</div></div>';
      h+='<button class="rf-tl-x" onclick="rfTlDel('+i+')">&times;</button>';
      h+='</div>';
    }
    h+='</div>';
    h+='<div style="display:flex;gap:7px;margin-top:'+(tl.length?'8px':'0')+'">';
    h+='<input id="rf-tl-t" class="mtin" style="width:96px;margin-bottom:0;font-size:12px" placeholder="'+_t("שעה")+'" list="rf-parts">';
    h+='<datalist id="rf-parts">';
    for(i=0;i<RF_PARTS.length;i++)h+='<option value="'+RF_PARTS[i]+'">';
    h+='</datalist>';
    h+='<input id="rf-tl-w" class="mtin" style="flex:1;margin-bottom:0;font-size:12px" placeholder="'+_t("מה קרה?")+'" onkeydown="if(event.key===\\'Enter\\')rfTlAdd()">';
    h+='<button class="rf-tl-add" onclick="rfTlAdd()">+</button>';
    h+='</div>';`,
   `    var tl=rfArr('dayTimeline');
    if(tl.length){
      h+='<div class="rfq-tline">';
      for(i=0;i<tl.length;i++){
        h+='<div class="rfq-tlr"><i class="rfq-bead"></i><div class="rfq-tlc">';
        if(tl[i].t)h+='<span>'+esc(tl[i].t)+'</span>';
        h+='<b>'+esc(tl[i].w||'')+'</b><button class="rfq-tlx" onclick="rfTlDel('+i+')" aria-label="'+_t('מחק')+'">&times;</button></div></div>';
      }
      h+='</div>';
    }
    h+='<div class="rfq-kinds rfq-parts">';
    for(i=0;i<RF_PARTS.length;i++)h+='<button class="rfq-kind" onclick="rfqPart(this)">'+RF_PARTS[i]+'</button>';
    h+='</div>';
    h+='<div class="rfq-slot rfq-tlslot">';
    h+='<input id="rf-tl-t" class="rfq-thx-in rfq-tl-t" placeholder="'+_t("שעה")+'" oninput="rfqPartIn()">';
    h+='<input id="rf-tl-w" class="rfq-thx-in" placeholder="'+_t("מה קרה?")+'" onkeydown="if(event.key===\\'Enter\\')rfTlAdd()">';
    h+='<button class="rfq-tladd" onclick="rfTlAdd()" aria-label="'+_t('הוסף')+'">+</button>';
    h+='</div>';`],
  [`    var CLKC={sleep:PAL.terra200,work:PAL.green500,social:'#c9b8f0',other:PAL.amber500,none:''};
    var cats=[['sleep',_t('שינה')],['work',_t('עבודה')],['social',_t('חברתי')],['other',_t('אחר')],['none',_t('נקה')]];
    var selCat=window._clockSelCat||'sleep';
    h+='<div style="display:flex;gap:7px;justify-content:center;margin-bottom:14px;flex-wrap:wrap">';
    for(i=0;i<cats.length;i++){
      var isSel=selCat===cats[i][0],dotC=CLKC[cats[i][0]]||PAL.violet300;
      h+='<button onclick="rfClockCat(\\''+cats[i][0]+'\\')" style="border:2px solid '+(isSel?dotC:'var(--line)')+';border-radius:12px;padding:7px 10px;cursor:pointer;background:'+(isSel?'var(--card)':'var(--surface)')+';display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:var(--ink);font-family:inherit">';
      h+='<span style="width:10px;height:10px;border-radius:50%;background:'+dotC+';display:inline-block;flex-shrink:0"></span>'+cats[i][1]+'</button>';
    }
    h+='</div>';
    h+='<canvas id="clock-canvas" width="280" height="310" style="display:block;margin:0 auto;touch-action:none;cursor:pointer"></canvas>';
    h+='<div id="rf-clock-sum" style="margin-top:12px">'+rfClockTotalsHTML()+'</div>';
    h+='<button onclick="rfNext()" class="rf-next">'+_t('המשך')+'</button>';
    window._clockNeedsInit=true;`,
   `    var cats=[['sleep',_t('שינה')],['work',_t('עבודה')],['social',_t('חברתי')],['other',_t('אחר')],['none',_t('נקה')]];
    var selCat=window._clockSelCat||'sleep';
    h+='<div class="rfq-kinds rfq-cats">';
    for(i=0;i<cats.length;i++)
      h+='<button class="rfq-kind'+(selCat===cats[i][0]?' on':'')+'" onclick="rfClockCat(\\''+cats[i][0]+'\\')">'+(cats[i][0]!=='none'?'<i class="rfq-gz g-'+cats[i][0]+'"></i>':'')+cats[i][1]+'</button>';
    h+='</div>';
    h+=rfqDialHTML(interviewAnswers.timeclock);
    h+='<div id="rf-clock-sum">'+rfClockTotalsHTML()+'</div>';
    h+='<button onclick="rfNext()" class="rf-next">'+_t('המשך')+'</button>';`],
  [`function rfClockTotalsHTML(){
  var clk=interviewAnswers.timeclock||new Array(25).fill('none');
  var t=rfClockTotals(clk),C={sleep:PAL.terra200,work:PAL.green500,social:'#c9b8f0',other:PAL.amber500};
  var LABELS={sleep:''+_t('שינה')+'',work:''+_t('עבודה')+'',social:''+_t('חברתי')+'',other:''+_t('אחר')+''},k,tot=0;
  var h='<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">';
  for(k in t)if(t[k]>0){tot+=t[k];h+='<div style="text-align:center"><div style="font-size:16px;font-weight:800;color:'+C[k]+'">'+t[k]+'h</div><div style="font-size:9px;color:var(--muted)">'+LABELS[k]+'</div></div>';}
  h+='</div><div style="text-align:center;font-size:10.5px;color:var(--muted-soft);margin-top:8px">'+tot+' '+_t('מתוך 24 שעות')+'</div>';
  return h;
}`,
   `/* the totals under the dial: a pressed bar per category, the width a machine reads and the hours a person does */
function rfClockTotalsHTML(){
  var clk=interviewAnswers.timeclock||new Array(25).fill('none');
  var t=rfClockTotals(clk),k,h='<div class="rfq-bars">';
  var LABELS={sleep:_t('שינה'),work:_t('עבודה'),social:_t('חברתי'),other:_t('אחר')};
  for(k in t)if(t[k]>0)h+='<div class="rfq-bar"><span>'+LABELS[k]+'</span><i><b class="g-'+k+'" style="width:'+Math.min(100,Math.round(t[k]/24*100))+'%"></b></i><em>'+_t('{n} שעות',{n:t[k]})+'</em></div>';
  return h+'</div>';
}
/* the day as a porcelain dial: 24 cells, 0 at the top, clockwise - hour h is timeclock[h] */
function rfqDialHTML(clk){
  clk=Array.isArray(clk)?clk:new Array(25).fill('none');
  var C=130,R1=78,R2=106,h='<div class="rfq-dial"><svg viewBox="0 0 260 260" onpointerdown="rfqDialDown(event)" onpointermove="rfqDialMove(event)" onpointerup="rfqDialUp()" onpointercancel="rfqDialUp()">',i,tot=0;
  function p(r,a){a=a*Math.PI/180;return (C+r*Math.sin(a)).toFixed(1)+' '+(C-r*Math.cos(a)).toFixed(1);}
  h+='<circle class="rfq-groove" cx="130" cy="130" r="92"/>';
  for(i=0;i<24;i++){
    var a0=i*15+1,a1=i*15+14,c=clk[i]&&clk[i]!=='none'?clk[i]:'';
    if(c)tot++;
    h+='<path class="rfq-seg'+(c?' g-'+c:'')+'" data-h="'+i+'" d="M'+p(R2,a0)+'A'+R2+' '+R2+' 0 0 1 '+p(R2,a1)+'L'+p(R1,a1)+'A'+R1+' '+R1+' 0 0 0 '+p(R1,a0)+'Z"/>';
  }
  var L=[[0,130,15],[6,248,134],[12,130,253],[18,12,134]];
  for(i=0;i<L.length;i++)h+='<text x="'+L[i][1]+'" y="'+L[i][2]+'">'+nfmt(L[i][0])+'</text>';
  h+='</svg><div class="rfq-dial-c"><b id="rfq-dial-n">'+nfmt(tot)+'</b><span>'+_t('שעות, מתוך {n}',{n:24})+'</span></div></div>';
  return h;
}
var _rfqDial=null;
function rfqDialAt(e){
  var svg=e.currentTarget,r=svg.getBoundingClientRect(),k=260/r.width;
  var x=(e.clientX-r.left)*k-130,y=(e.clientY-r.top)*k-130,d=Math.sqrt(x*x+y*y);
  if(d<62||d>128)return -1;
  var a=Math.atan2(x,-y)*180/Math.PI;if(a<0)a+=360;
  return Math.min(23,Math.floor(a/15));
}
function rfqDialPaint(svg,hr){
  var clk=interviewAnswers.timeclock;if(!Array.isArray(clk)||hr<0||clk[hr]===_rfqDial)return;
  clk[hr]=_rfqDial;
  var seg=svg.querySelector('[data-h="'+hr+'"]');
  if(seg)seg.setAttribute('class','rfq-seg'+(_rfqDial!=='none'?' g-'+_rfqDial:''));
  var n=0,i;for(i=0;i<24;i++)if(clk[i]&&clk[i]!=='none')n++;
  var nb=document.getElementById('rfq-dial-n');if(nb)nb.textContent=nfmt(n);
  var sm=document.getElementById('rf-clock-sum');if(sm)sm.innerHTML=rfClockTotalsHTML();
}
function rfqDialDown(e){
  var hr=rfqDialAt(e);if(hr<0)return;
  var clk=interviewAnswers.timeclock,cat=window._clockSelCat||'sleep';
  _rfqDial=cat!=='none'&&clk[hr]===cat?'none':cat;
  try{e.currentTarget.setPointerCapture(e.pointerId);}catch(x){}
  e.preventDefault();rfqDialPaint(e.currentTarget,hr);
}
function rfqDialMove(e){if(_rfqDial!==null)rfqDialPaint(e.currentTarget,rfqDialAt(e));}
function rfqDialUp(){
  if(_rfqDial===null)return;
  _rfqDial=null;
  var clk=interviewAnswers.timeclock;
  if(Array.isArray(clk)&&clk.length===25)rfSave({timeclock:clk.slice(),timeDistribution:rfClockTotals(clk)});
}`],
  [`function rfTlAdd(){`,
   `/* a part of the day is a pebble that fills the time; typing an exact time lets the pebbles go */
function rfqPart(b){
  var t=document.getElementById('rf-tl-t'),on=!b.classList.contains('on');
  Array.prototype.forEach.call(document.querySelectorAll('.rfq-parts .rfq-kind'),function(x){x.classList.remove('on');});
  if(on)b.classList.add('on');
  if(t)t.value=on?b.textContent:'';
}
function rfqPartIn(){
  Array.prototype.forEach.call(document.querySelectorAll('.rfq-parts .rfq-kind'),function(x){x.classList.remove('on');});
}
function rfTlAdd(){`],
  [`.sm-kind{display:block;font-style:normal;`,
   `/* the ninth pair (25 Nov): assets/rf-q9.webp is a 320x205 sundial, drawn at half; the dial is code */
html body.mod-endofday .rfq-sundial{width:160px;height:103px;background-size:160px 103px;background-position:0 0;
  -webkit-mask:radial-gradient(farthest-side,#000 70%,transparent 100%);mask:radial-gradient(farthest-side,#000 70%,transparent 100%)}
html body.mod-endofday .rfq-tline{position:relative;display:flex;flex-direction:column;gap:14px;padding-inline-start:30px;margin:6px 0 4px}
html body.mod-endofday .rfq-tline::before{content:"";position:absolute;inset-inline-start:9px;top:8px;bottom:8px;width:3px;border-radius:3px;
  background:linear-gradient(rgba(240,169,46,.3),rgba(240,169,46,.85) 20%,rgba(240,169,46,.85) 80%,rgba(240,169,46,.3));box-shadow:0 0 9px 1px rgba(240,169,46,.45)}
html body.mod-endofday .rfq-tlr{position:relative}
html body.mod-endofday .rfq-bead{position:absolute;inset-inline-start:-29px;top:50%;width:18px;height:18px;margin-top:-9px;border-radius:50%;
  background:radial-gradient(circle at 38% 32%,#fffdfa,var(--nu-ground) 58%,#d9d2c8);box-shadow:1px 2px 4px var(--nu-shade-soft)}
html body.mod-endofday .rfq-tlc{position:relative;display:flex;flex-direction:column;gap:3px;padding:12px 18px;padding-inline-end:42px;border-radius:20px;
  background:var(--nu-ground);box-shadow:-4px -4px 10px var(--nu-lit),4px 5px 12px var(--nu-shade-soft)}
html body.mod-endofday .rfq-tlc span{font-size:12.5px;color:var(--nu-muted);unicode-bidi:isolate}
html body.mod-endofday .rfq-tlc b{font-family:"Frank Ruhl Libre",Georgia,serif;font-size:17px;font-weight:500;color:var(--nu-ink);line-height:1.4;unicode-bidi:isolate;overflow-wrap:anywhere}
html body.mod-endofday .rfq-tlx{position:absolute;top:8px;inset-inline-end:10px;border:none;background:none;padding:2px 4px;font:inherit;font-size:18px;line-height:1;color:var(--nu-muted);cursor:pointer}
html body.mod-endofday .rfq-parts{margin:18px 0 14px}
html body.mod-endofday .rfq-tlslot{padding:5px;padding-inline-start:16px}
html body.mod-endofday .rfq-tl-t{flex:none;width:68px;padding-inline-end:10px;border-inline-end:1px solid rgba(176,168,156,.4)!important;font-size:14px}
html body.mod-endofday .rfq-tladd{flex:none;width:42px;height:42px;padding:0;border:none;border-radius:50%;background:var(--nu-ground);color:var(--nu-ink);font-size:22px;font-weight:300;
  box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}
html body.mod-endofday .rfq-tladd:active{box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
/* the glazes (25 Nov) - the one place colour is allowed, because four categories must be told apart */
html body.mod-endofday .g-sleep{--gz:#d9a9a4}
html body.mod-endofday .g-work{--gz:#a9c3a0}
html body.mod-endofday .g-social{--gz:#c3b6dc}
html body.mod-endofday .g-other{--gz:#dcc49a}
html body.mod-endofday .rfq-cats{margin:4px 0 16px}
html body.mod-endofday .rfq-cats .rfq-kind{display:inline-flex;align-items:center;gap:7px;padding:8px 14px}
html body.mod-endofday .rfq-gz{flex:none;width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.7),var(--gz) 60%);
  box-shadow:0 1px 2px rgba(120,100,90,.3)}
html body.mod-endofday .rfq-dial{position:relative;width:min(290px,100%);aspect-ratio:1;margin:0 auto;border-radius:50%;background:var(--nu-ground);
  box-shadow:-6px -6px 14px var(--nu-lit),6px 8px 18px var(--nu-shade-soft)}
html body.mod-endofday .rfq-dial svg{display:block;width:100%;height:100%;touch-action:none;cursor:pointer;user-select:none;-webkit-user-select:none}
html body.mod-endofday .rfq-groove{fill:none;stroke:rgba(176,168,156,.16);stroke-width:38}
html body.mod-endofday .rfq-seg{fill:rgba(176,168,156,.13);stroke:rgba(255,255,255,.75);stroke-width:1;transition:fill .15s}
html body.mod-endofday .rfq-seg[class*="g-"]{fill:var(--gz);filter:drop-shadow(0 1px 1px rgba(120,100,90,.28))}
html body.mod-endofday .rfq-dial text{font-family:"Frank Ruhl Libre",Georgia,serif;font-size:13px;font-weight:600;fill:var(--nu-ink);text-anchor:middle;dominant-baseline:middle;pointer-events:none}
html body.mod-endofday .rfq-dial-c{position:absolute;left:50%;top:50%;width:35%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:var(--nu-ground);
  box-shadow:-3px -3px 8px var(--nu-lit),4px 5px 10px var(--nu-shade-soft),0 0 0 2px rgba(240,169,46,.22),0 0 14px 2px rgba(240,169,46,.18)}
html body.mod-endofday .rfq-dial-c b{font-family:"Frank Ruhl Libre",Georgia,serif;font-size:30px;font-weight:600;line-height:1;color:var(--nu-ink)}
html body.mod-endofday .rfq-dial-c span{max-width:88%;font-size:10.5px;line-height:1.2;text-align:center;color:var(--nu-muted)}
html body.mod-endofday .rfq-bars{display:flex;flex-direction:column;gap:10px;margin-top:22px}
html body.mod-endofday .rfq-bar{display:flex;align-items:center;gap:12px;padding:8px 16px;border-radius:99px;background:var(--nu-ground);
  box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}
html body.mod-endofday .rfq-bar span{flex:none;width:64px;font-family:"Frank Ruhl Libre",Georgia,serif;font-size:15px;color:var(--nu-ink)}
html body.mod-endofday .rfq-bar i{flex:1;height:14px;border-radius:99px;box-shadow:inset 2px 2px 4px var(--nu-shade),inset -2px -2px 3px var(--nu-lit);overflow:hidden}
html body.mod-endofday .rfq-bar i b{display:block;height:100%;border-radius:99px;background:var(--gz);box-shadow:inset 0 1px 1px rgba(255,255,255,.55)}
html body.mod-endofday .rfq-bar em{flex:none;font-style:normal;font-size:13.5px;font-weight:700;color:var(--nu-ink)}
.sm-kind{display:block;font-style:normal;`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
