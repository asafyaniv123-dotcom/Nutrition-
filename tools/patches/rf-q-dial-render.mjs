// The dial, again (25 Nov). The first build drew it in SVG and Asaf rejected it beside the render he had approved:
// flat grey wedges against glazed porcelain. A render is not rebuilt by hand - so now the dial IS the render.
//  - assets/rf-dial.webp: the approved dial (hf/q19) with every hour empty, its "24 h" and printed numbers removed.
//  - assets/rf-dial-glaze.webp: the same ring four times, in rose, sage, lavender and sand - each hour cut from the
//    nearest real tile of the render and widened from its ~13.9 degrees to 15, each glaze a recolouring that keeps
//    the render's own light (scratchpad dial-build.mjs). A painted hour is that glaze clipped to its wedge; the
//    wedge edges fall in the gaps, which are identical in all five pictures, so there is no seam.
//  - the centre is the render's lit well with the hours written in it; the four numbers are the reader's digits.
//  - pebbles and bars take the render's serif and the glazes' own colours; the fill of a bar is a glossy capsule.
// usage: node tools/patches/rf-q-dial-render.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`/* the day as a porcelain dial: 24 cells, 0 at the top, clockwise - hour h is timeclock[h] */
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
  if(d<62||d>128)return -1;`,
   `/* the day as the approved porcelain dial: the picture is the render with every hour empty, and a painted hour
   is the same ring in its glaze, clipped to its 15 degrees - 0 at the top, clockwise, hour h is timeclock[h] */
function rfqDialHTML(clk){
  clk=Array.isArray(clk)?clk:new Array(25).fill('none');
  var b=liveBase()+'assets/',h='<div class="rfq-dial" style="background-image:url('+b+'rf-dial.webp);--ring:url('+b+'rf-dial-glaze.webp)" onpointerdown="rfqDialDown(event)" onpointermove="rfqDialMove(event)" onpointerup="rfqDialUp()" onpointercancel="rfqDialUp()">',i,tot=0;
  function px(a){return (50+53*Math.sin(a*Math.PI/180)).toFixed(2);}
  function py(a){return (50-53*Math.cos(a*Math.PI/180)).toFixed(2);}
  for(i=0;i<24;i++){
    var c=clk[i]&&clk[i]!=='none'?clk[i]:'';
    if(c)tot++;
    h+='<i class="rfq-cell'+(c?' g-'+c:'')+'" data-h="'+i+'" style="clip-path:polygon(50% 50%,'+px(i*15)+'% '+py(i*15)+'%,'+px(i*15+7.5)+'% '+py(i*15+7.5)+'%,'+px(i*15+15)+'% '+py(i*15+15)+'%)"></i>';
  }
  for(i=0;i<4;i++)h+='<span class="rfq-dl" style="left:'+(50+45*Math.sin(i*Math.PI/2)).toFixed(1)+'%;top:'+(50-45*Math.cos(i*Math.PI/2)).toFixed(1)+'%">'+nfmt(i*6)+'</span>';
  h+='<b class="rfq-dial-c" id="rfq-dial-n">'+_t('{n} שעות',{n:tot})+'</b></div>';
  return h;
}
var _rfqDial=null;
function rfqDialAt(e){
  var el=e.currentTarget,r=el.getBoundingClientRect();
  var x=(e.clientX-r.left)/r.width-0.5,y=(e.clientY-r.top)/r.height-0.5,d=Math.sqrt(x*x+y*y);
  if(d<0.24||d>0.47)return -1;`],
  [`function rfqDialPaint(svg,hr){
  var clk=interviewAnswers.timeclock;if(!Array.isArray(clk)||hr<0||clk[hr]===_rfqDial)return;
  clk[hr]=_rfqDial;
  var seg=svg.querySelector('[data-h="'+hr+'"]');
  if(seg)seg.setAttribute('class','rfq-seg'+(_rfqDial!=='none'?' g-'+_rfqDial:''));
  var n=0,i;for(i=0;i<24;i++)if(clk[i]&&clk[i]!=='none')n++;
  var nb=document.getElementById('rfq-dial-n');if(nb)nb.textContent=nfmt(n);`,
   `function rfqDialPaint(el,hr){
  var clk=interviewAnswers.timeclock;if(!Array.isArray(clk)||hr<0||clk[hr]===_rfqDial)return;
  clk[hr]=_rfqDial;
  var seg=el.querySelector('[data-h="'+hr+'"]');
  if(seg)seg.className='rfq-cell'+(_rfqDial!=='none'?' g-'+_rfqDial:'');
  var n=0,i;for(i=0;i<24;i++)if(clk[i]&&clk[i]!=='none')n++;
  var nb=document.getElementById('rfq-dial-n');if(nb)nb.textContent=_t('{n} שעות',{n:n});`],
  [`html body.mod-endofday .g-sleep{--gz:#d9a9a4}
html body.mod-endofday .g-work{--gz:#a9c3a0}
html body.mod-endofday .g-social{--gz:#c3b6dc}
html body.mod-endofday .g-other{--gz:#dcc49a}
html body.mod-endofday .rfq-cats{margin:4px 0 16px}
html body.mod-endofday .rfq-cats .rfq-kind{display:inline-flex;align-items:center;gap:7px;padding:8px 14px}`,
   `html body.mod-endofday .g-sleep{--gz:#cca69e;--gx:0%}
html body.mod-endofday .g-work{--gz:#b9c097;--gx:33.333%}
html body.mod-endofday .g-social{--gz:#c4bbd5;--gx:66.667%}
html body.mod-endofday .g-other{--gz:#cfb484;--gx:100%}
html body.mod-endofday .rfq-cats{margin:4px 0 18px;gap:7px}
html body.mod-endofday .rfq-cats .rfq-kind{display:inline-flex;align-items:center;gap:5px;padding:7px 10px;font-size:14px}`],
  [`html body.mod-endofday .rfq-dial{position:relative;width:min(290px,100%);aspect-ratio:1;margin:0 auto;border-radius:50%;background:var(--nu-ground);
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
html body.mod-endofday .rfq-bar em{flex:none;font-style:normal;font-size:13.5px;font-weight:700;color:var(--nu-ink)}`,
   `/* the dial is the render (assets/rf-dial.webp, 528 square, the disc edge at its edge); a painted hour is the
   glaze sprite (four 432 squares, centred on the same point) clipped to its wedge */
html body.mod-endofday .rfq-dial{position:relative;width:min(310px,100%);aspect-ratio:1;margin:0 auto;border-radius:50%;overflow:hidden;background-size:100% 100%;
  touch-action:none;cursor:pointer;user-select:none;-webkit-user-select:none;box-shadow:-6px -6px 14px var(--nu-lit),7px 9px 20px var(--nu-shade-soft)}
html body.mod-endofday .rfq-cell{position:absolute;left:9.091%;top:9.091%;width:81.818%;height:81.818%;visibility:hidden;pointer-events:none;
  background-image:var(--ring);background-size:400% 100%;background-position:var(--gx) 0}
html body.mod-endofday .rfq-cell[class*="g-"]{visibility:visible}
html body.mod-endofday .rfq-dl{position:absolute;transform:translate(-50%,-50%);font-family:"Frank Ruhl Libre",Georgia,serif;font-size:14px;font-weight:700;color:var(--nu-ink);pointer-events:none}
html body.mod-endofday .rfq-dial-c{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-width:27%;text-align:center;pointer-events:none;
  font-family:"Frank Ruhl Libre",Georgia,serif;font-size:21px;font-weight:700;line-height:1.1;color:var(--nu-ink)}
html body.mod-endofday .rfq-bars{display:flex;flex-direction:column;gap:10px;margin-top:24px}
html body.mod-endofday .rfq-bar{display:flex;align-items:center;gap:12px;padding:9px 16px;border-radius:99px;background:var(--nu-ground);
  box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft),inset 0 0 0 1.5px rgba(255,255,255,.55)}
html body.mod-endofday .rfq-bar span{flex:none;width:66px;font-family:"Frank Ruhl Libre",Georgia,serif;font-size:16px;font-weight:600;color:var(--nu-ink)}
html body.mod-endofday .rfq-bar i{flex:1;height:18px;padding:2px;border-radius:99px;box-shadow:inset 2px 2px 4px var(--nu-shade),inset -2px -2px 3px var(--nu-lit)}
html body.mod-endofday .rfq-bar i b{display:block;height:100%;min-width:14px;border-radius:99px;
  background:linear-gradient(rgba(255,255,255,.5),rgba(255,255,255,0) 55%),var(--gz);box-shadow:0 1px 2px rgba(120,100,90,.3),inset 0 -1px 1px rgba(120,100,90,.12)}
html body.mod-endofday .rfq-bar em{flex:none;font-style:normal;font-family:"Frank Ruhl Libre",Georgia,serif;font-size:15px;font-weight:700;color:var(--nu-ink)}`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
