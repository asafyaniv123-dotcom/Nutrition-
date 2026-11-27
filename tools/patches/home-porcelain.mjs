/* The home dial IS the approved comp (Asaf, 27 Nov 2026). Five rounds tried to
 * rebuild the comp around the app's own CSS plate - first in CSS, then with
 * pieces cut from it and recoloured to sit on that plate - and every one came
 * out "not like the comp": the recolouring is what distorted the objects.
 * So nothing is translated any more:
 *   assets/home-plate.webp  the comp's own plate, rim and well with its moon,
 *                           with the seats, the coloured light between them,
 *                           its time arc and its ticks taken out (filled from
 *                           the plate's own lighting); drawn behind the dial.
 *   assets/home-seats.webp  the seven seats, the comp's original pixels, in the
 *                           order bowl, dumbbell, palette / bulb, pair,
 *                           calendar / shirt; they move round over that plate.
 *   assets/home-moon.webp   the moon and the well floor round it, shown a
 *                           quarter larger than the comp (asked for 27 Nov).
 * Scale: the comp's time-arc channel (radius 451 of 1024) is the app's rim
 * (DIAL_RIM 170), so the plate is 1000px * 170/451 = 377px, the seat ring is
 * 296 * .377 = 112, a seat cell 192 * .377 = 72px, the well 102px. What the comp
 * cannot do the app still draws: the live time arc, the ticks (which step aside
 * for a name), the names, in the serif the questions are set in.
 *   node tools/patches/home-porcelain.mjs [file]            apply
 *   node tools/patches/home-porcelain.mjs [file] --reverse  undo */
import fs from 'fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  [String.raw`/* under the dial, what comes next is one raised line, not a headline */`,
   String.raw`/* THE DIAL IS THE COMP (27 Nov): its plate behind, its seats moving over it, nothing recoloured */
html body.mod-home .hdial.hplate{background:none}
html body.mod-home .hdial.hplate::before{content:"";position:absolute;left:50%;top:50%;width:377px;height:377px;
  margin:-188.5px 0 0 -188.5px;background:var(--plate) center/100% 100% no-repeat;pointer-events:none}
html body.mod-home .hdial.hplate .rim-sh,html body.mod-home .hdial.hplate .rim-ch,html body.mod-home .hdial.hplate .rim-lip,
html body.mod-home .hdial.hplate .hdial-n{display:none}
html body.mod-home .hdial.hplate .rim-tk{stroke:rgba(150,138,128,.6)}
html body.mod-home .hdial.hplate .hdisc-ic.hseat{width:72.4px;height:72.4px;margin-top:-15.2px;margin-bottom:-8px;
  background:var(--art) no-repeat;background-size:300% 300%;background-position:calc(var(--hc) * 50%) calc(var(--hr) * 50%);
  box-shadow:none}
html body.mod-home .hdial.hplate .hdisc.on .hdisc-ic.hseat{box-shadow:none}
html body.mod-home .hdial.hplate .hdisc.heard .hdisc-ic.hseat{
  box-shadow:0 0 0 2.5px color-mix(in srgb,var(--area,#a49a8e) 75%,transparent),0 0 26px 10px color-mix(in srgb,var(--area,#a49a8e) 55%,transparent)}
/* the well is the plate's own: no button drawn over it, only the moon and its name */
html body.mod-home .hdial.hplate .chub{width:102px;height:102px;margin:-51px 0 0 -51px;background:none;box-shadow:none}
html body.mod-home .hdial.hplate .chub:active{box-shadow:none;opacity:.85}
html body.mod-home .hdial.hplate .chub::before,html body.mod-home .hdial.hplate .chub::after{display:none}
html body.mod-home .hdial.hplate .chub-ic.hart{position:absolute;left:9.4px;top:-.8px;width:90px;height:90px;
  background:var(--art) center/100% 100% no-repeat;box-shadow:none}
html body.mod-home .hdial.hplate .chub-t{position:absolute;left:0;right:0;bottom:3px;text-align:center;
  font-size:13.5px;font-weight:700}
/* the names in the caption's own face above the dial (Asaf, 27 Nov: "like this"), not a serif of their own */
html body.mod-home .hdial.hplate .hdisc-t{font-size:12px;font-weight:600;white-space:nowrap;max-width:none;
  letter-spacing:.01em;color:var(--nu-ink);opacity:.78}
/* under the dial, what comes next is one raised line, not a headline */`],
  [String.raw`var DIAL_S=360,DIAL_RING=118,DIAL_RIM=170;`,
   String.raw`var DIAL_S=360,DIAL_RING=112,DIAL_RIM=170;`],
  // a bottom name reaches the rim: a tick it lies on steps aside the way an hour numeral already did
  [String.raw`  var ns=d.querySelectorAll('.hdial-n'),ls=d.querySelectorAll('.hdisc-t'),i,j,a,b,hit;`,
   String.raw`  var ns=d.querySelectorAll('.hdial-n,.rim-tk'),ls=d.querySelectorAll('.hdisc-t'),i,j,a,b,hit;`],
  [String.raw`html body.mod-home .hdial-n.under{opacity:0}`,
   String.raw`html body.mod-home .hdial-n.under,html body.mod-home .rim-tk.under{opacity:0}`],
  // the seat under the notch grew by a third; at the seats' size that put the bowl on its own name
  [String.raw`    els[i].querySelector('.hdisc-ic').style.transform='scale('+(1+near/3).toFixed(3)+')';`,
   String.raw`    els[i].querySelector('.hdisc-ic').style.transform='scale('+(1+near/5).toFixed(3)+')';`],
  // the comp's ticks: all 24 (no numerals), where its own stood (149-156 of 170)
  [String.raw`    if(i%6===0)continue;
    var a=dialHourAng(i*60),q0=pt(a,R-11),q1=pt(a,R-(i%3===0?16:14));`,
   String.raw`    var a=dialHourAng(i*60),q0=pt(a,R-14),q1=pt(a,R-21);`],
  [String.raw`    '<div class="hdial" style="width:'+DIAL_S+'px;height:'+DIAL_S+'px">'+`,
   String.raw`    '<div class="hdial hplate" style="width:'+DIAL_S+'px;height:'+DIAL_S+'px;--plate:url('+liveBase()+'assets/home-plate.webp)">'+`],
  [String.raw`function homeDialHTML(hub,rest){`,
   String.raw`var HOME_SEAT={nutrition:0,fitness:1,hobbies:2,insights:3,people:4,planning:5,closet:6};
function homeArtIc(a,cls){
  var n=HOME_SEAT[a.id],sheet='home-seats',k='hseat';
  if(a.id==='endofday'){n=0;sheet='home-moon';k='hart';}
  if(n==null)return '<span class="'+cls+'" style="color:'+a.color+'">'+a.svg+'</span>';
  return '<span class="'+cls+' '+k+'" style="color:'+a.color+';--hc:'+(n%3)+';--hr:'+Math.floor(n/3)+';--art:url('+liveBase()+'assets/'+sheet+'.webp)"></span>';
}
var _hArcCtx=null;
function homeTextW(txt,px,wt){
  try{_hArcCtx=_hArcCtx||document.createElement('canvas').getContext('2d');
    _hArcCtx.font=[wt,px+'px',getComputedStyle(document.body).fontFamily].join(' ');return _hArcCtx.measureText(txt).width;}catch(e){return 0;}
}
/* a name stays on one line and inside its place: a long one (自分のクローゼット, Tagesabschluss) shrinks a little
   rather than break into the well or past its rim */
function homeFitPx(title,px,wt,max){
  var tmp=document.createElement('div');tmp.innerHTML=title;var w=homeTextW(tmp.textContent,px,wt);
  return w>max?Math.max(9,Math.floor(px*max/w*10)/10):px;
}
function homeDialHTML(hub,rest){`],
  [String.raw`    h+='<button class="hdisc" data-area="'+a.id+'" data-i="'+i+'" style="--area:'+a.color+'">'+
       '<span class="hdisc-ic" style="color:'+a.color+'">'+a.svg+'</span>'+
       '<span class="hdisc-t">'+a.title+'</span>'+`,
   String.raw`    h+='<button class="hdisc" data-area="'+a.id+'" data-i="'+i+'" style="--area:'+a.color+'">'+
       homeArtIc(a,'hdisc-ic')+
       '<span class="hdisc-t" style="font-size:'+homeFitPx(a.title,12,600,80)+'px">'+a.title+'</span>'+`],
  [String.raw`  if(hub)h+='<button class="chub" data-area="'+hub.id+'" style="--area:'+hub.color+';--fill:'+hubFill().toFixed(2)+'">'+
       '<span class="chub-ic" style="color:'+hub.color+'">'+hub.svg+'</span>'+
       '<span class="chub-t">'+hub.title+'</span></button>';
  return h+'</div>';`,
   String.raw`  if(hub)h+='<button class="chub" data-area="'+hub.id+'" style="--area:'+hub.color+';--fill:'+hubFill().toFixed(2)+'">'+
       homeArtIc(hub,'chub-ic')+
       '<span class="chub-t" style="font-size:'+homeFitPx(hub.title,13.5,700,58)+'px">'+hub.title+'</span></button>';
  return h+'</div>';`],
];

let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 200)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
