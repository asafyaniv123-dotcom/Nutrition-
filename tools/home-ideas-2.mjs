/* Round 3 (19 Oct 2026): the well that fills with light (without the
 * "questions left" line) + the day's clock, moved to the LOWER half of the
 * hub so the seven shafts above it stay whole. Three ways to join them.
 * Drawn over dev by tools/shoot-home.mjs --ideas2; dev/index.html untouched.
 *
 *   hug     - a thin arc hugging the underside of the well
 *   inside  - the day as a channel pressed into the well's own lower rim
 *   smile   - a wide arc under the fan, with the four quarter hours marked
 */
const P = 'html body.mod-home ';

/* the well: pressed in, light rising from its floor - from round 2, minus the
   line of text */
const WELL = String.raw`
${P}.chub{background:var(--nu-ground)!important;overflow:visible;
  box-shadow:inset 7px 9px 16px var(--nu-shade),inset -7px -7px 15px var(--nu-lit),
    0 0 0 1px rgba(255,255,255,.35)!important}
${P}.chub::before{content:"";position:absolute;inset:0;border-radius:50%;pointer-events:none;
  background:radial-gradient(85% 62% at 50% 104%,rgba(77,127,190,.5) 0%,rgba(120,168,226,.34) 38%,rgba(178,205,237,.14) 62%,transparent 78%)}
${P}.chub::after{content:"";position:absolute;inset:4px;border-radius:50%;pointer-events:none;
  box-shadow:inset 0 -14px 26px -10px rgba(110,160,224,.55)}
${P}.chub-ic{position:relative;z-index:1;box-shadow:-4px -4px 10px var(--nu-lit),5px 6px 12px var(--nu-shade)!important}
${P}.chub-t{position:relative;z-index:1}
${P}.chub .hub-dot{display:none}
${P}.td-wrap{display:none!important}
${P}.v-clock{position:absolute;left:0;top:0;pointer-events:none;overflow:visible;z-index:2}
${P}.v-next{width:100%;text-align:center;margin:10px 0 22px}
${P}.v-next .k{display:block;font-size:11px;font-weight:700;color:var(--nu-muted);letter-spacing:.04em;margin-bottom:4px}
${P}.v-next .t{display:block;font-size:34px;font-weight:800;color:var(--nu-ink);letter-spacing:-.5px;line-height:1.05;direction:ltr}
${P}.v-next .w{display:block;font-size:18px;font-weight:800;color:var(--nu-ink);margin-top:2px}
${P}.v-next .r{display:inline-block;margin-top:8px;font-size:12.5px;font-weight:700;color:var(--nu-muted)}
`;

/* the clock, parameterised: dR is the radius relative to the hub's own edge
   (negative = inside the well), ticks marks 06/12/18/24 */
function clock({ dR, width, ticks }) {
  return `(function(){
  var f=document.querySelector('.cfan'),hub=document.querySelector('.chub');if(!f||!hub||f.querySelector('.v-clock'))return;
  var fr=f.getBoundingClientRect(),hr=hub.getBoundingClientRect();
  var cx=hr.left-fr.left+hr.width/2,cy=hr.top-fr.top+hr.height/2,R=hr.width/2+(${dR});
  var from=DP_FROM*60,to=24*60,d=new Date(),mins=d.getHours()*60+d.getMinutes();
  var rtl=getComputedStyle(document.body).direction==='rtl';
  /* lower half only: the day runs under the hub, from the reading edge */
  function ang(m){var p=Math.max(0,Math.min(1,(m-from)/(to-from)));return rtl?-p*Math.PI:-Math.PI+p*Math.PI;}
  function pt(a,r){r=r||R;return [cx+r*Math.cos(a),cy-r*Math.sin(a)];}
  function arc(a0,a1){var p0=pt(a0),p1=pt(a1),sw=a1>a0?0:1;
    return 'M'+p0[0].toFixed(1)+' '+p0[1].toFixed(1)+' A'+R+' '+R+' 0 0 '+sw+' '+p1[0].toFixed(1)+' '+p1[1].toFixed(1);}
  var a0=ang(from),a1=ang(to),an=ang(mins),W=${width};
  var NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');
  svg.setAttribute('class','v-clock');svg.setAttribute('width',fr.width);svg.setAttribute('height',fr.height+80);
  var h='<defs><filter id="vglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2"/></filter></defs>';
  /* a channel pressed into the ground: shade above, light below */
  h+='<path d="'+arc(a0,a1)+'" fill="none" stroke="rgba(168,160,148,.45)" stroke-width="'+(W+1)+'" stroke-linecap="round" transform="translate(1.2,1.6)"/>';
  h+='<path d="'+arc(a0,a1)+'" fill="none" stroke="#e5e2dd" stroke-width="'+W+'" stroke-linecap="round"/>';
  h+='<path d="'+arc(a0,a1)+'" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="1.6" stroke-linecap="round" transform="translate(-.8,-1.2)"/>';
  h+='<path d="'+arc(a0,an)+'" fill="none" stroke="rgba(249,206,147,.9)" stroke-width="'+(W-1)+'" stroke-linecap="round" filter="url(#vglow)"/>';
  h+='<path d="'+arc(a0,an)+'" fill="none" stroke="rgba(240,169,46,.85)" stroke-width="'+Math.max(2.5,W-4)+'" stroke-linecap="round"/>';
  if(${ticks}){[6,12,18,24].forEach(function(H){var a=ang(H*60),p=pt(a,R-W/2-10);
    h+='<text x="'+p[0].toFixed(1)+'" y="'+(p[1]+3.5).toFixed(1)+'" text-anchor="middle" font-size="9.5" font-weight="700" fill="#9a928b" font-family="Assistant,Arial">'+dpHM(H%24,0)+'</text>';});}
  var all=dpAll(todayStr()),i,next=null;
  for(i=0;i<all.length;i++){var t=all[i];if(t.hour===null)continue;var m=t.hour*60+(t.min||0),c=wkColor(t.c),p=pt(ang(m));
    var past=m<mins;if(!past&&(!next||m<next.m))next={m:m,t:t};
    h+='<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="'+(W/2+0.6).toFixed(1)+'" fill="'+c.dot+'" stroke="#fff" stroke-width="1.5" opacity="'+(past?.45:1)+'"/>';}
  var pn=pt(an);
  h+='<circle cx="'+pn[0].toFixed(1)+'" cy="'+pn[1].toFixed(1)+'" r="'+(W/2+4)+'" fill="rgba(249,206,147,.95)" filter="url(#vglow)"/>';
  h+='<circle cx="'+pn[0].toFixed(1)+'" cy="'+pn[1].toFixed(1)+'" r="'+(W/2+1.6)+'" fill="#f0a92e" stroke="#fff" stroke-width="1.8"/>';
  svg.innerHTML=h;f.appendChild(svg);
  var sk=document.getElementById('home-stk');if(sk&&next){var n=document.createElement('div');n.className='v-next';
    var notes=todayNotes(todayStr()).length;
    n.innerHTML='<span class="k">הבא</span><span class="t">'+dpHM(next.t.hour,next.t.min||0)+'</span><span class="w">'+esc(next.t.w)+'</span>'+
      '<span class="r">'+notes+' לזכור · כל הלו״ז ›</span>';sk.parentNode.insertBefore(n,sk.nextSibling);}
})();`;
}

export const IDEAS2 = {
  hug: {
    css: WELL + String.raw`
${P}.cfan{margin-top:30px!important}
${P}.home-board:has(.cfan)+.home-stk{margin-top:-26px!important}
`,
    js: clock({ dR: 12, width: 7, ticks: false }),
  },
  inside: {
    css: WELL + String.raw`
${P}.cfan{margin-top:30px!important}
`,
    js: clock({ dR: -10, width: 6, ticks: false }),
  },
  smile: {
    css: WELL + String.raw`
${P}.cfan{margin-top:24px!important}
${P}.home-board:has(.cfan)+.home-stk{margin-top:4px!important}
`,
    js: clock({ dR: 30, width: 8, ticks: true }),
  },
};
