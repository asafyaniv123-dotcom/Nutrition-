/* progress prototype, round 3 (Asaf: "the green number between then and now
 * looks like we found no place for it and pushed it there; the graph is good
 * but could be prettier; and when the user reaches tracking, the graph should
 * enter from the left - beautifully, interestingly").
 *  - the change lives INSIDE today's card, under its number, as a small
 *    pressed chip; the two cards share the width with nothing between them.
 *  - the line: a smooth curve (monotone, so it never overshoots a week), a
 *    soft glow under it, an area fading to nothing, faint guide lines, the
 *    numbers in small raised labels, today's point lit with a halo.
 *  - entering: the card glides in from the left, the curve draws itself from
 *    left to right, and each week's point and number arrive as the line
 *    reaches them. Columns (D) rise one after another from the left. */
import fs from 'fs';
const F = 'review/progress-proto/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`    h+='<div class="mini"><div class="m then"><span>'+(S==='w'?'לפני 8 שבועות':'שבוע 1')+'</span><b>'+(S==='w'?f1(v[0]):v[0])+'</b></div>'+
       '<div class="arrow">'+(S==='w'?'−'+f1(Math.abs(v[7]-v[0])):'+'+(v[7]-v[0]))+'</div>'+
       '<div class="m now"><span>השבוע</span><b>'+(S==='w'?f1(v[7]):v[7])+'</b></div></div>';`,
`    h+='<div class="mini"><div class="m then"><span>'+(S==='w'?'לפני 8 שבועות':'שבוע 1')+'</span><b>'+(S==='w'?f1(v[0]):v[0])+'</b></div>'+
       '<div class="m now"><span>השבוע</span><b>'+(S==='w'?f1(v[7]):v[7])+'</b>'+
       '<em><bdi dir="ltr">'+(S==='w'?'−'+f1(Math.abs(v[7]-v[0])):'+'+(v[7]-v[0]))+'</bdi> ק"ג</em></div></div>';`);
rep(`    h+='<div class="card chartc">'+(V==='D'?colsSVG(v):lineNumSVG(v))+'</div>';`,
  `    h+='<div class="card chartc" id="chartc">'+(V==='D'?colsSVG(v):lineNumSVG(v))+'</div>';`);
rep(`  ph.innerHTML=h;`, `  ph.innerHTML=h;
  if(V==='D'||V==='E')enterChart();`);
/* the prettier line */
const a = s.indexOf('/* E: one line, a dot per week with its number */'), b = s.indexOf('function dot(c){');
s = s.slice(0, a) + `/* E: a smooth line, a point and its number per week */
function smooth(P){   /* monotone cubic: through every point, never overshooting one */
  var n=P.length,d=[],m=[],i;
  for(i=0;i<n-1;i++)d.push((P[i+1][1]-P[i][1])/(P[i+1][0]-P[i][0]));
  m[0]=d[0];m[n-1]=d[n-2];
  for(i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2;
  var p='M'+P[0][0].toFixed(1)+' '+P[0][1].toFixed(1);
  for(i=0;i<n-1;i++){var h=(P[i+1][0]-P[i][0])/3;
    p+=' C'+(P[i][0]+h).toFixed(1)+' '+(P[i][1]+m[i]*h).toFixed(1)+' '+(P[i+1][0]-h).toFixed(1)+' '+(P[i+1][1]-m[i+1]*h).toFixed(1)+' '+P[i+1][0].toFixed(1)+' '+P[i+1][1].toFixed(1);}
  return p;
}
function lineNumSVG(v){
  var Wd=330,Hd=260,pt=46,pb=38,px=24,n=v.length;
  var mn=Math.min.apply(null,v),mx=Math.max.apply(null,v),pad=(mx-mn||1)*0.3;
  var col=S==='w'?'#f08f78':'#e9845f',hi=S==='w'?'#ffc4b4':'#ffcbb2';
  var X=function(k){return px+k*(Wd-2*px)/(n-1);},Y=function(x){return pt+(1-(x-mn+pad)/(mx-mn+2*pad))*(Hd-pt-pb);};
  var P=v.map(function(x,k){return [X(k),Y(x)];}),d=smooth(P);
  var s='<svg viewBox="0 0 '+Wd+' '+Hd+'" width="100%" style="direction:ltr;overflow:visible"><defs>'+
    '<linearGradient id="lf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+col+'" stop-opacity=".28"/><stop offset=".7" stop-color="'+col+'" stop-opacity=".05"/><stop offset="1" stop-color="'+col+'" stop-opacity="0"/></linearGradient>'+
    '<linearGradient id="ls" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="'+hi+'"/><stop offset="1" stop-color="'+col+'"/></linearGradient>'+
    '<filter id="lg" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>'+
    '<clipPath id="reveal"><rect id="revealR" x="0" y="0" width="'+Wd+'" height="'+Hd+'"/></clipPath></defs>';
  /* three faint guides, at the top, middle and bottom of the range */
  [0,.5,1].forEach(function(t){var y=pt+t*(Hd-pt-pb);s+='<line x1="'+px+'" x2="'+(Wd-px)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'" stroke="rgba(168,160,148,.22)" stroke-width="1" stroke-dasharray="2 5"/>';});
  s+='<g clip-path="url(#reveal)"><path d="'+d+' L'+X(n-1).toFixed(1)+' '+(Hd-pb)+' L'+X(0).toFixed(1)+' '+(Hd-pb)+'Z" fill="url(#lf)"/>'+
     '<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="8" stroke-linecap="round" opacity=".35" filter="url(#lg)"/>'+
     '<path id="lineP" d="'+d+'" fill="none" stroke="url(#ls)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g>';
  P.forEach(function(p,k){var lit=k===n-1,t=S==='w'?f1(v[k]):String(v[k]),w=t.length*7.2+14;
    s+='<g class="pt" data-k="'+k+'">'+
      (lit?'<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="14" fill="'+col+'" opacity=".18"/>':'')+
      '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="'+(lit?6.5:4.5)+'" fill="#fff" stroke="'+col+'" stroke-width="'+(lit?3.5:2.5)+'"/>'+
      '<rect x="'+(p[0]-w/2).toFixed(1)+'" y="'+(p[1]-36).toFixed(1)+'" width="'+w.toFixed(1)+'" height="22" rx="11" fill="'+(lit?'#fff':'rgba(255,255,255,.7)')+'" style="filter:drop-shadow(0 2px 4px rgba(120,100,80,.14))"/>'+
      '<text x="'+p[0].toFixed(1)+'" y="'+(p[1]-20.5).toFixed(1)+'" text-anchor="middle" class="num'+(lit?' lit':'')+'">'+t+'</text></g>';
    s+='<text x="'+p[0].toFixed(1)+'" y="'+(Hd-12)+'" text-anchor="middle"'+(lit?' class="num lit"':'')+'>'+(lit?'השבוע':(k+1))+'</text>';});
  return s+'</svg>';
}
/* entering: the card glides in from the left, the line draws itself, the
   points arrive as it reaches them; columns rise one by one */
function enterChart(){
  var c=document.getElementById('chartc');if(!c)return;
  c.style.transition='none';c.style.opacity='0';c.style.transform='translateX(-60px)';
  var r=document.getElementById('revealR'),pts=c.querySelectorAll('.pt'),cols=c.querySelectorAll('.colf'),n=pts.length||cols.length;
  if(r)r.setAttribute('width','0');
  [].forEach.call(pts,function(g){g.style.opacity='0';g.style.transform='translateY(6px)';g.style.transition='none';});
  [].forEach.call(cols,function(b){b.style.transform='scaleY(0)';b.style.transition='none';});
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    c.style.transition='opacity .5s ease,transform .7s cubic-bezier(.22,.61,.36,1)';c.style.opacity='1';c.style.transform='none';
    var t0=null,DUR=1400,W=330;
    if(r)(function step(t){if(t0===null)t0=t;var p=Math.min(1,(t-t0-250)/DUR);if(p<0)p=0;
      var e=1-Math.pow(1-p,3);r.setAttribute('width',(e*W).toFixed(1));if(p<1)requestAnimationFrame(step);})(performance.now());
    [].forEach.call(pts,function(g,k){var at=250+DUR*Math.pow(k/(n-1||1),1)*0.9;
      setTimeout(function(){g.style.transition='opacity .35s ease,transform .45s cubic-bezier(.22,.61,.36,1)';g.style.opacity='1';g.style.transform='none';},at);});
    [].forEach.call(cols,function(b,k){setTimeout(function(){b.style.transition='transform .7s cubic-bezier(.22,.61,.36,1)';b.style.transform='scaleY(1)';},250+k*110);});
  });});
}
` + s.slice(b);
/* columns: mark the fills so they can rise from the base */
rep(`    s+='<rect x="'+X.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+(Hd-pb-y).toFixed(1)+'" rx="'+(bw/2).toFixed(1)+'" fill="url(#cg)" opacity="'+(lit?1:.5)+'"/>';`,
  `    s+='<rect class="colf" style="transform-origin:'+(X+bw/2).toFixed(1)+'px '+(Hd-pb)+'px;transform-box:view-box" x="'+X.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+(Hd-pb-y).toFixed(1)+'" rx="'+(bw/2).toFixed(1)+'" fill="url(#cg)" opacity="'+(lit?1:.5)+'"/>';`);
/* CSS: the change inside today's card */
rep(`.mini .arrow{flex:none;font-size:15px;font-weight:800;color:#5f9a5a;direction:ltr}`,
  `.mini{gap:12px}
.mini .now em{display:inline-block;margin-top:6px;padding:4px 11px;border-radius:999px;font-style:normal;font-size:13px;font-weight:800;color:#4f7d4b;direction:rtl;
  box-shadow:inset 1px 2px 4px var(--sh2),inset -1px -1px 3px var(--lit)}`);
rep(`<p>ההדמיה למטה`, `<p><button onclick="draw()" style="float:left;border:none;border-radius:999px;padding:6px 12px;font:700 13px Assistant;background:#efe6d8;color:#2b2724">הכניסה שוב ↺</button>ההדמיה למטה`);
fs.writeFileSync(F, s);
console.log('ok');
