/* trackers round 3 (Asaf, 26 Oct):
 *  - weight and calories: "not sure about the green dotted line" - the goal
 *    is now the material's own: a faint neutral line and a small raised label.
 *  - mood: a legend of its colours.
 *  - strength: every exercise at once, no switching - one row each: its
 *    name, its weight now, a small line of its eight weeks, and the change.
 *  - volume: a pie - a donut of satin segments by muscle group, the total in
 *    its middle, each group's sets and share beside it.
 *  - workouts per week and evenings summarised are dropped. */
import fs from 'fs';
const F = 'review/trackers-2/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
const cut = (a, b, by) => { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) { console.log('CUT ' + a.slice(0, 50)); process.exit(1); } s = s.slice(0, i) + by + s.slice(j); };

/* the goal, in the material */
rep(`stroke="rgba(95,159,96,.55)" stroke-width="1.5" stroke-dasharray="6 5"/>'+
    '<text x="'+(W-px)+'" y="'+(gy+16).toFixed(1)+'" text-anchor="end" style="fill:#5f8f5c;font-weight:800">היעד · '+o.goal+'</text>';}`,
  `stroke="rgba(120,100,80,.22)" stroke-width="1.5"/>'+
    goalTag(W-px-26,gy,o.goal);}`);
rep(`function frame(o){`, `/* the goal: a small raised label sitting on a faint line */
function goalTag(x,y,g){var t='יעד '+g,w=t.length*6.6+18;
  return '<rect x="'+(x-w/2).toFixed(1)+'" y="'+(y-11).toFixed(1)+'" width="'+w.toFixed(1)+'" height="22" rx="11" fill="#ece9e5" style="filter:drop-shadow(-2px -2px 3px rgba(255,255,255,.9)) drop-shadow(2px 3px 4px rgba(168,160,148,.35))"/>'+
    '<text x="'+x.toFixed(1)+'" y="'+(y+4.5).toFixed(1)+'" text-anchor="middle" class="n">'+t+'</text>';}
function frame(o){`);
rep(`  h+='</div><div style="position:absolute;left:0;right:0;top:'+(34+H*(1-TG/MX)).toFixed(0)+'px;border-top:1.5px dashed rgba(95,159,96,.55)"></div>'+
     '<div class="lb" style="position:absolute;right:2px;top:'+(16+H*(1-TG/MX)).toFixed(0)+'px;color:#5f8f5c;font-weight:800">היעד · 2,000</div></div>';`,
  `  h+='</div><div style="position:absolute;left:0;right:0;top:'+(34+H*(1-TG/MX)).toFixed(0)+'px;border-top:1.5px solid rgba(120,100,80,.2)"></div>'+
     '<span class="goal" style="top:'+(23+H*(1-TG/MX)).toFixed(0)+'px">יעד 2,000</span></div>';`);
rep(`.lb{font-size:11.5px;font-weight:700;color:#8f877d}`, `.lb{font-size:11.5px;font-weight:700;color:#8f877d}
.goal{position:absolute;left:50%;transform:translateX(-50%);padding:2px 10px;border-radius:999px;background:#ece9e5;font-size:12px;font-weight:800;color:#6d675e;
  box-shadow:-2px -2px 4px rgba(255,255,255,.9),2px 3px 6px rgba(168,160,148,.35)}
/* mood legend */
.mleg{direction:rtl;display:flex;justify-content:center;gap:12px;margin:12px 0 2px;flex-wrap:wrap}
.mleg span{display:flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;color:#6d675e}
.mleg i{width:14px;height:14px;border-radius:50%;box-shadow:inset 1px 1px 2px rgba(255,255,255,.7),0 1px 2px rgba(120,100,80,.2)}
/* strength: one row per exercise */
.ex{display:grid;grid-template-columns:1fr 128px 54px;align-items:center;gap:10px;padding:10px 4px;border-bottom:1px solid rgba(168,160,148,.18)}
.ex:last-child{border-bottom:none}
.ex .nm{font-size:15px;font-weight:800;color:#4a453f}
.ex .nm small{display:block;font-size:12.5px;color:#6d675e;font-weight:700;margin-top:1px}
.ex svg{width:128px;height:38px;direction:ltr;overflow:visible}
.ex em{justify-self:start;font-style:normal;font-size:12.5px;font-weight:800;color:#4f7d4b;padding:3px 8px;border-radius:999px;direction:ltr;
  box-shadow:inset 1px 2px 4px rgba(168,160,148,.3),inset -1px -1px 3px rgba(255,255,255,.95)}
.ex .pr{display:inline-block;width:7px;height:7px;border-radius:50%;background:#e9b44c;box-shadow:0 0 6px #e9b44c;margin-inline-start:6px;vertical-align:2px}
/* volume: the pie */
.pie{direction:rtl;display:flex;align-items:center;gap:14px;padding:6px 4px}
.pie .well{position:relative;flex:none;width:170px;height:170px;border-radius:50%;box-shadow:inset 3px 4px 10px rgba(168,160,148,.5),inset -3px -3px 9px rgba(255,255,255,.95)}
.pie svg{position:absolute;inset:0;width:100%;height:100%}
.pie .ctr{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.pie .ctr b{font-size:30px;font-weight:800;line-height:1}.pie .ctr small{font-size:12px;color:#6d675e;font-weight:700}
.pie ul{list-style:none;margin:0;padding:0;display:grid;gap:9px;flex:1}
.pie li{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:800;color:#4a453f}
.pie li i{flex:none;width:12px;height:12px;border-radius:50%}
.pie li span{margin-inline-start:auto;font-size:12.5px;color:#6d675e;font-weight:700}`);

/* mood: the legend */
rep(`    '<div class="dates">'+R.map(function(r,i){return '<i>'+(i%2?(i===13?'היום':(12+i)+'.10'):'')+'</i>';}).join('')+'</div>';`,
  `    '<div class="dates">'+R.map(function(r,i){return '<i>'+(i%2?(i===13?'היום':(12+i)+'.10'):'')+'</i>';}).join('')+'</div>'+
    '<div class="mleg">'+['כבד','נמוך','בסדר','טוב','מצוין'].map(function(t,i){return '<span><i style="background:'+COL[i]+'"></i>'+t+'</span>';}).join('')+'</div>';`);

/* strength: every exercise at once */
cut(`T.strength={name:'כוח בתרגיל',build:function(){`, `T.food=`, `T.strength={name:'כוח בתרגילים',build:function(){
  var E=[['סקוואט',[40,42.5,45,45,50,52.5,57.5,60]],['דדליפט',[60,65,65,70,75,75,80,85]],['לחיצת חזה',[35,37.5,37.5,40,40,42.5,42.5,45]],
         ['חתירה',[30,30,32.5,35,35,37.5,40,40]],['לחיצת כתפיים',[20,20,22.5,22.5,25,25,25,27.5]]],c=C.terra,h='<div>';
  E.forEach(function(e,i){var v=e[1],n=v.length,lo=Math.min.apply(null,v),hi=Math.max.apply(null,v),pr=v[n-1]>Math.max.apply(null,v.slice(0,-1));
    var X=function(k){return 4+k*120/(n-1);},Y=function(x){return 32-(x-lo)/(hi-lo||1)*26;},P=v.map(function(x,k){return [X(k),Y(x)];}),d=smooth(P);
    h+='<div class="ex an" data-x="'+(i*55)+'"><div class="nm">'+e[0]+(pr?'<span class="pr" title="שיא"></span>':'')+'<small>'+v[n-1]+' ק"ג</small></div>'+
      '<svg viewBox="0 0 128 38"><defs><linearGradient id="x'+i+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c[0]+'" stop-opacity=".25"/><stop offset="1" stop-color="'+c[0]+'" stop-opacity="0"/></linearGradient></defs>'+
      '<path d="'+d+' L'+X(n-1)+' 38 L'+X(0)+' 38Z" fill="url(#x'+i+')"/><path d="'+d+'" fill="none" stroke="'+c[0]+'" stroke-width="2.5" stroke-linecap="round"/>'+
      '<circle cx="'+X(n-1)+'" cy="'+Y(v[n-1])+'" r="4" fill="#fff" stroke="'+c[0]+'" stroke-width="2.5"/></svg>'+
      '<em>+'+(v[n-1]-v[0])+'</em></div>';});
  h+='</div><div class="lb" style="text-align:center;margin:8px 0 2px">8 שבועות · הסט הכבד בכל שבוע · נקודה זהובה = שיא השבוע</div>';
  return frame({t:'כוח בתרגילים',thenL:'שיאים בחודש שעבר',thenV:'2',nowL:'שיאים החודש',nowV:'5',chip:'<bdi dir="ltr">+3</bdi> שיאים',c:c[0],
    chart:h,say:'כל חמשת התרגילים עלו',sub:'דדליפט עלה הכי הרבה: 25 ק"ג'});}};
`);

/* volume: a pie */
cut(`T.volume={name:'נפח אימונים',build:function(){`, `T.workouts=`, `T.volume={name:'נפח אימונים',build:function(){
  var G=[['רגליים',16,'#e9946f'],['גב',14,'#e3b27a'],['חזה',11,'#d79aa6'],['כתפיים',8,'#a9bcd2'],['ידיים',7,'#a9c79f']],tot=56,r=62,Cc=2*Math.PI*r,at=0,arcs='',li='';
  G.forEach(function(g,i){var L=g[1]/tot*Cc;
    arcs+='<circle class="an" data-x="'+(i*60)+'" cx="85" cy="85" r="'+r+'" fill="none" stroke="'+g[2]+'" stroke-width="20" stroke-linecap="round" stroke-dasharray="'+Math.max(L-9,1).toFixed(1)+' '+Cc.toFixed(1)+'" stroke-dashoffset="'+(-at-4.5).toFixed(1)+'" transform="rotate(-90 85 85)"/>';
    at+=L;li+='<li class="an" data-x="'+(i*60)+'"><i style="background:'+g[2]+'"></i>'+g[0]+'<span>'+g[1]+' · '+Math.round(g[1]/tot*100)+'%</span></li>';});
  var h='<div class="pie"><div class="well"><svg viewBox="0 0 170 170"><defs><filter id="pg"><feGaussianBlur stdDeviation="3"/></filter></defs><g filter="url(#pg)" opacity=".35">'+arcs.replace(/class="an"/g,'')+'</g>'+arcs+'</svg>'+
    '<div class="ctr"><b>'+tot+'</b><small>סטים השבוע</small></div></div><ul>'+li+'</ul></div>';
  return frame({t:'נפח אימונים',thenL:'שבוע שעבר',thenV:'50<small>סטים</small>',nowL:'השבוע',nowV:'56<small>סטים</small>',chip:'<bdi dir="ltr">+6</bdi> סטים',c:'#e9946f',
    chart:h,say:'ידיים מקבלות הכי מעט',sub:'13% מהסטים השבוע, מול 29% לרגליים'});}};
`);
rep(`var ORDER=['weight','mood','hobbies','steps','food','water','strength','volume','workouts','moons'],CUR='weight';`,
  `var ORDER=['weight','food','water','strength','volume','steps','hobbies','mood'],CUR='weight';`);
fs.writeFileSync(F, s);
console.log('ok');
