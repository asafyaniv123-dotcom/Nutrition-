/* progress prototype, round 2 (Asaf: "I loved then-and-now and the climb, but
 * something is still missing - a graph that shows it easily, not clever, just
 * visually beautiful, with all the numbers").
 * Two more, each = then-and-now on top + a plain chart with every number
 * written on it:
 *  D - columns: a soft column per week with its number above it, the first
 *      and the latest lit, the others quiet.
 *  E - line: one gentle line, a dot per week with its number above it, a faint
 *      fill under the line, the latest dot lit.
 * The weeks run left to right, numbered under the chart. */
import fs from 'fs';
const F = 'review/progress-proto/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR ' + a.slice(0, 60)); process.exit(1); } s = s.replace(a, () => b); };
rep(`<button data-v="C" onclick="pick('C')">ג׳ · אז ועכשיו</button>`, `<button data-v="C" onclick="pick('C')">ג׳ · אז ועכשיו</button><button data-v="D" onclick="pick('D')">ד׳ · עמודות עם מספרים</button><button data-v="E" onclick="pick('E')">ה׳ · קו עם מספרים</button>`);
rep(`  } else {
    h+='<div class="top"><h2>אז ועכשיו</h2></div>';`, `  } else if(V==='D'||V==='E'){
    var v=S==='w'?weekly():SQ;
    h+=head(S==='w'?'המשקל שלי':'סקוואט');
    h+='<div class="mini"><div class="m then"><span>'+(S==='w'?'לפני 8 שבועות':'שבוע 1')+'</span><b>'+(S==='w'?f1(v[0]):v[0])+'</b></div>'+
       '<div class="arrow">'+(S==='w'?'−':'+')+f1(Math.abs(v[7]-v[0]))+'</div>'+
       '<div class="m now"><span>השבוע</span><b>'+(S==='w'?f1(v[7]):v[7])+'</b></div></div>';
    h+='<div class="card chartc">'+(V==='D'?colsSVG(v):lineNumSVG(v))+'</div>';
    h+='<div class="note"><span class="d">'+dot(S==='w'?'#7fb27a':'#e9845f')+'</span><div>'+(S==='w'?downs()+' מתוך 7 שבועות ירדו':'שיא אישי חדש השבוע')+
       '<small>'+(S==='w'?'כל מספר הוא הממוצע של אותו שבוע':'כל מספר הוא הסט הכבד של אותו שבוע')+'</small></div></div>';
  } else {
    h+='<div class="top"><h2>אז ועכשיו</h2></div>';`);
rep(`function dot(c){`, `/* D: a column per week, its number above it */
function colsSVG(v){
  var Wd=330,Hd=250,pt=30,pb=34,px=10,n=v.length,gap=8,bw=(Wd-2*px-gap*(n-1))/n;
  var mn=Math.min.apply(null,v),mx=Math.max.apply(null,v),lo=mn-(mx-mn||1)*0.6,col=S==='w'?'#f08f78':'#e9845f',hi=S==='w'?'#ffcdbf':'#ffd2bd';
  var Y=function(x){return pt+(1-(x-lo)/(mx-lo))*(Hd-pt-pb);};
  var s='<svg viewBox="0 0 '+Wd+' '+Hd+'" width="100%" style="direction:ltr"><defs><linearGradient id="cg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="'+col+'"/><stop offset="1" stop-color="'+hi+'"/></linearGradient></defs>';
  v.forEach(function(x,k){
    var X=px+k*(bw+gap),y=Y(x),lit=k===n-1;
    s+='<rect x="'+X.toFixed(1)+'" y="'+pt+'" width="'+bw.toFixed(1)+'" height="'+(Hd-pt-pb)+'" rx="'+(bw/2).toFixed(1)+'" fill="rgba(168,160,148,.14)"/>';
    s+='<rect x="'+X.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+(Hd-pb-y).toFixed(1)+'" rx="'+(bw/2).toFixed(1)+'" fill="url(#cg)" opacity="'+(lit?1:.5)+'"/>';
    s+='<text x="'+(X+bw/2).toFixed(1)+'" y="'+(y-8).toFixed(1)+'" text-anchor="middle" class="num'+(lit?' lit':'')+'">'+(S==='w'?f1(x):x)+'</text>';
    s+='<text x="'+(X+bw/2).toFixed(1)+'" y="'+(Hd-12)+'" text-anchor="middle">'+(lit?'השבוע':(k+1))+'</text>';
  });
  return s+'</svg>';
}
/* E: one line, a dot per week with its number */
function lineNumSVG(v){
  var Wd=330,Hd=250,pt=36,pb=34,px=22,n=v.length;
  var mn=Math.min.apply(null,v),mx=Math.max.apply(null,v),pad=(mx-mn||1)*0.25,col=S==='w'?'#f08f78':'#e9845f';
  var X=function(k){return px+k*(Wd-2*px)/(n-1);},Y=function(x){return pt+(1-(x-mn+pad)/(mx-mn+2*pad))*(Hd-pt-pb);};
  var d=v.map(function(x,k){return (k?'L':'M')+X(k).toFixed(1)+' '+Y(x).toFixed(1);}).join(' ');
  var s='<svg viewBox="0 0 '+Wd+' '+Hd+'" width="100%" style="direction:ltr"><defs><linearGradient id="lf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+col+'" stop-opacity=".22"/><stop offset="1" stop-color="'+col+'" stop-opacity="0"/></linearGradient></defs>';
  s+='<path d="'+d+' L'+X(n-1).toFixed(1)+' '+(Hd-pb)+' L'+X(0).toFixed(1)+' '+(Hd-pb)+'Z" fill="url(#lf)"/>';
  s+='<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
  v.forEach(function(x,k){var lit=k===n-1;
    s+='<circle cx="'+X(k).toFixed(1)+'" cy="'+Y(x).toFixed(1)+'" r="'+(lit?6:4)+'" fill="'+(lit?'#fff':col)+'" stroke="'+col+'" stroke-width="'+(lit?3:0)+'"/>';
    s+='<text x="'+X(k).toFixed(1)+'" y="'+(Y(x)-12).toFixed(1)+'" text-anchor="middle" class="num'+(lit?' lit':'')+'">'+(S==='w'?f1(x):x)+'</text>';
    s+='<text x="'+X(k).toFixed(1)+'" y="'+(Hd-12)+'" text-anchor="middle">'+(lit?'השבוע':(k+1))+'</text>';});
  return s+'</svg>';
}
function dot(c){`);
rep(`/* C */`, `/* D, E */
.mini{direction:ltr;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:22px}
.mini .m{flex:1;border-radius:20px;padding:12px 10px;text-align:center}
.mini .m span{display:block;font-size:13px;color:var(--mu);font-weight:700}
.mini .m b{display:block;font-size:30px;font-weight:800;margin-top:2px}
.mini .then{box-shadow:inset 3px 4px 9px var(--sh),inset -3px -3px 8px var(--lit)}
.mini .now{box-shadow:-5px -5px 12px var(--lit),6px 7px 15px var(--sh2)}
.mini .arrow{flex:none;font-size:15px;font-weight:800;color:#5f9a5a;direction:ltr}
.chartc{padding:14px 10px 6px}
svg text.num{font:800 12.5px Assistant,sans-serif;fill:#6d675e}
svg text.num.lit{font-size:14px;fill:#4a453f}
/* C */`);
fs.writeFileSync(F, s);
console.log('ok');
