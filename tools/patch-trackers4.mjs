/* trackers round 4 (Asaf, 26 Oct):
 *  - mood: no then/now cards - "perfect otherwise".
 *  - the goal, neither green dots nor a grey line: in the line charts it is a
 *    soft glow of the chart's own colour at the goal's height and a small lit
 *    target at the end of it; in the calorie tubes, a small notch of light in
 *    each channel at the goal's height.
 *  - strength: no small lines ("orange snakes that say nothing"). Each
 *    exercise is one satin channel holding where it was and where it is: the
 *    part lifted in eight weeks lit, the starting weight quiet below it, the
 *    two numbers at the ends; a gold star on a new record.
 *  - volume: the pie stays, but one hue (terracotta, five steps of it), flat
 *    ends with gaps instead of round caps over each other, and it draws itself
 *    round from the top instead of fading in segment by segment.
 *  - a book: how far through, the pace, and the sentences kept from it; and
 *    when it is finished, the book itself, with its sentences on its pages. */
import fs from 'fs';
const F = 'review/trackers-2/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
const cut = (a, b, by) => { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) { console.log('CUT ' + a.slice(0, 50)); process.exit(1); } s = s.slice(0, i) + by + s.slice(j); };

rep(`  return '<h2>'+o.t+'</h2><div class="mini">`, `  return '<h2>'+o.t+'</h2>'+(o.noMini?'':'<div class="mini">`);
rep(`<em>'+o.chip+'</em></div></div>'+
    '<div class="card" id="cc">'`, `<em>'+o.chip+'</em></div></div>')+
    '<div class="card" id="cc">'`);
rep(`  return frame({t:'מצב רוח',`, `  return frame({noMini:1,t:'מצב רוח',`);

/* the goal as light */
rep(`  if(o.goal!=null){var gy=Y(o.goal);s+='<line x1="'+px+'" x2="'+(W-px)+'" y1="'+gy.toFixed(1)+'" y2="'+gy.toFixed(1)+'" stroke="rgba(120,100,80,.22)" stroke-width="1.5"/>'+
    goalTag(W-px-26,gy,o.goal);}`,
`  if(o.goal!=null){var gy=Y(o.goal);
    s+='<defs><linearGradient id="'+id+'gl" x1="0" x2="1"><stop offset="0" stop-color="'+c+'" stop-opacity="0"/><stop offset=".55" stop-color="'+c+'" stop-opacity=".16"/><stop offset="1" stop-color="'+c+'" stop-opacity=".32"/></linearGradient>'+
      '<filter id="'+id+'gb" x="-5%" y="-100%" width="110%" height="300%"><feGaussianBlur stdDeviation="5"/></filter></defs>'+
      '<rect x="'+px+'" y="'+(gy-9).toFixed(1)+'" width="'+(W-2*px)+'" height="18" rx="9" fill="url(#'+id+'gl)" filter="url(#'+id+'gb)"/>'+
      '<circle cx="'+(W-px+4)+'" cy="'+gy.toFixed(1)+'" r="9" fill="none" stroke="'+c+'" stroke-width="1.5" opacity=".55"/><circle cx="'+(W-px+4)+'" cy="'+gy.toFixed(1)+'" r="3.5" fill="'+c+'"/>'+
      '<text x="'+(W-px-12)+'" y="'+(gy+22).toFixed(1)+'" text-anchor="end" class="n" style="fill:'+col[1]+'">יעד '+o.goal+'</text>';}`);
rep(`;--hi:'+c[2]+';height:0"></div></div>'+`, `;--hi:'+c[2]+';height:0"></div><i class="gm" style="bottom:'+(TG/MX*100).toFixed(1)+'%"></i></div>'+`);
rep(`  h+='</div><div style="position:absolute;left:0;right:0;top:'+(34+H*(1-TG/MX)).toFixed(0)+'px;border-top:1.5px solid rgba(120,100,80,.2)"></div>'+
     '<span class="goal" style="top:'+(23+H*(1-TG/MX)).toFixed(0)+'px">יעד 2,000</span></div>';`,
  `  h+='</div><div class="gleg"><i class="gm"></i>הנקודה המאירה בכל עמודה: היעד, 2,000</div></div>';`);

/* strength: where it was, where it is */
cut(`T.strength={name:'כוח בתרגילים',build:function(){`, `T.food=`, `T.strength={name:'כוח בתרגילים',build:function(){
  var E=[['דדליפט',60,85,1],['סקוואט',40,60,1],['לחיצת חזה',35,45,1],['חתירה',30,40,0],['לחיצת כתפיים',20,27.5,1]],MX=100,c=C.terra,h='<div class="lift">';
  E.forEach(function(e,i){var a=e[1]/MX*100,b=e[2]/MX*100;
    h+='<div class="lr an" data-x="'+(i*55)+'"><div class="ln">'+e[0]+(e[3]?'<span class="star">★</span>':'')+'</div>'+
      '<div class="lch"><div class="lbase grow" data-dim="w" data-v="'+a.toFixed(1)+'" style="width:0"></div>'+
      '<div class="lgain grow" data-dim="w" data-v="'+(b-a).toFixed(1)+'" style="right:'+a.toFixed(1)+'%;width:0;--c:'+c[0]+';--dp:'+c[1]+';--hi:'+c[2]+'"></div></div>'+
      '<div class="lv"><span>'+e[1]+'</span><b>'+e[2]+'</b><em>+'+(e[2]-e[1])+'</em></div></div>';});
  h+='</div><div class="lb" style="text-align:center;margin:10px 0 2px">ק"ג · הבהיר: מה שנוסף ב-8 שבועות · ★ שיא השבוע</div>';
  return frame({t:'כוח בתרגילים',thenL:'שיאים בחודש שעבר',thenV:'2',nowL:'שיאים החודש',nowV:'4',chip:'<bdi dir="ltr">+2</bdi> שיאים',c:c[0],
    chart:h,say:'כל חמשת התרגילים עלו',sub:'דדליפט עלה הכי הרבה: 25 ק"ג'});}};
`);

/* volume: one hue, gaps, drawn round */
cut(`T.volume={name:'נפח אימונים',build:function(){`, `T.workouts=`, `T.volume={name:'נפח אימונים',build:function(){
  var G=[['רגליים',16,'#d9724f'],['גב',14,'#e58c66'],['חזה',11,'#eea583'],['כתפיים',8,'#f3bea3'],['ידיים',7,'#f7d4c2']],tot=56,r=62,Cc=2*Math.PI*r,at=0,arcs='',li='';
  G.forEach(function(g,i){var L=g[1]/tot*Cc-4;
    arcs+='<circle cx="85" cy="85" r="'+r+'" fill="none" stroke="'+g[2]+'" stroke-width="22" stroke-dasharray="'+L.toFixed(1)+' '+Cc.toFixed(1)+'" stroke-dashoffset="'+(-at).toFixed(1)+'" transform="rotate(-90 85 85)"/>';
    at+=L+4;li+='<li class="an" data-x="'+(60+i*50)+'"><i style="background:'+g[2]+'"></i>'+g[0]+'<span>'+g[1]+' · '+Math.round(g[1]/tot*100)+'%</span></li>';});
  var h='<div class="pie"><div class="well"><svg viewBox="0 0 170 170"><defs><mask id="pm"><circle id="pmc" cx="85" cy="85" r="'+r+'" fill="none" stroke="#fff" stroke-width="26" stroke-dasharray="0 '+Cc.toFixed(1)+'" transform="rotate(-90 85 85)"/></mask></defs>'+
    '<g mask="url(#pm)">'+arcs+'</g></svg><div class="ctr"><b>'+tot+'</b><small>סטים השבוע</small></div></div><ul>'+li+'</ul></div>';
  setTimeout(function(){var m=document.getElementById('pmc');if(!m)return;var t0=performance.now();
    (function st(t){var p=Math.min(1,(t-t0-300)/1300);if(p<0)p=0;var e=1-Math.pow(1-p,3);m.setAttribute('stroke-dasharray',(e*Cc).toFixed(1)+' '+Cc.toFixed(1));if(p<1)requestAnimationFrame(st);})(t0);},0);
  return frame({t:'נפח אימונים',thenL:'שבוע שעבר',thenV:'50<small>סטים</small>',nowL:'השבוע',nowV:'56<small>סטים</small>',chip:'<bdi dir="ltr">+6</bdi> סטים',c:'#e58c66',
    chart:h,say:'ידיים מקבלות הכי מעט',sub:'13% מהסטים השבוע, מול 29% לרגליים'});}};
/* a book: how far, the pace, and what was kept from it */
var BK={t:'האיש שחיפש משמעות',a:'ויקטור פרנקל',pages:180,at:124,started:'2.10',
  q:[['למי שיש "למה" לחיות, יוכל לשאת כמעט כל "איך".',41],['אפשר לקחת מאדם הכול מלבד דבר אחד: את החירות לבחור את יחסו.',86],['האדם אינו שואל מה משמעות חייו - הוא הנשאל.',112]]};
function bkCover(w,done){return '<div class="bcov'+(done?' done':'')+'" style="width:'+w+'px"><i></i><b>'+BK.t+'</b><span>'+BK.a+'</span></div>';}
T.book={name:'ספר',build:function(){
  var p=BK.at/BK.pages*100,c=C.amber,h='<div class="bk">'+bkCover(92)+'<div class="bki"><div class="bkp"><b>'+Math.round(p)+'%</b><span>עמוד '+BK.at+' מתוך '+BK.pages+'</span></div>'+
    '<div class="bch"><div class="fl h grow" data-dim="w" data-v="'+p.toFixed(1)+'" style="width:0;--c:'+c[0]+';--dp:'+c[1]+';--hi:'+c[2]+'"></div></div>'+
    '<div class="lb">כ-5 עמודים ביום · עוד 11 ימים</div></div></div>'+
    '<div class="qh">משפטים ששמרת</div>'+BK.q.map(function(q,i){return '<div class="qt an" data-x="'+(80+i*80)+'">'+q[0]+'<small>עמ׳ '+q[1]+'</small></div>';}).join('');
  return frame({noMini:1,t:'הספר שלי',c:c[0],chart:h,say:'עוד 56 עמודים',sub:'התחלת ב-'+BK.started+' · 3 משפטים שמורים'});}};
T.bookdone={name:'סיימתי ספר',build:function(){
  var h='<div class="fin"><div class="glow"></div>'+bkCover(120,1)+'<div class="fint">סיימת לקרוא</div><div class="finb">'+BK.t+'</div>'+
    '<div class="fins"><span><b>24</b>ימים</span><span><b>180</b>עמודים</span><span><b>3</b>משפטים</span></div></div>'+
    '<div class="pages">'+BK.q.map(function(q,i){return '<div class="pg an" data-x="'+(60+i*90)+'"><p>'+q[0]+'</p><small>עמ׳ '+q[1]+'</small></div>';}).join('')+'</div>';
  return frame({noMini:1,t:'ספר שהסתיים',c:C.amber[0],chart:h,say:'הספר השלישי השנה',sub:'הוא עובר למדף "קראתי", עם המשפטים שלו'});}};
`);
rep(`var ORDER=['weight','food','water','strength','volume','steps','hobbies','mood'],CUR='weight';`,
  `var ORDER=['weight','food','water','strength','volume','steps','hobbies','mood','book','bookdone'],CUR='weight';`);

/* CSS */
rep(`/* mood legend */`, `/* the goal in the tubes: a notch of light */
.ch .gm,.gleg .gm{position:absolute;left:3px;right:3px;height:3px;border-radius:2px;background:#fff;box-shadow:0 0 6px rgba(255,255,255,.95),0 0 10px rgba(166,144,207,.7);z-index:2}
.gleg{direction:rtl;display:flex;align-items:center;justify-content:center;gap:8px;margin:4px 0 2px;font-size:12px;font-weight:700;color:#6d675e}
.gleg .gm{position:relative;display:inline-block;width:22px;left:auto;right:auto;background:#fff}
/* strength: lift channels */
.lift{display:grid;gap:16px;padding:4px 2px}
.lr{display:grid;grid-template-columns:96px 1fr 70px;align-items:center;gap:10px}
.ln{font-size:14.5px;font-weight:800;color:#4a453f;white-space:nowrap}
.ln .star{color:#e2a93f;margin-inline-start:4px;font-size:12px;text-shadow:0 0 6px rgba(233,180,76,.7)}
.lch{position:relative;height:18px;border-radius:9px;background:#e6e3de;box-shadow:inset 2px 3px 6px rgba(168,160,148,.45),inset -2px -2px 5px rgba(255,255,255,.95);overflow:hidden}
.lbase{position:absolute;top:0;bottom:0;right:0;background:rgba(168,150,135,.28);border-radius:9px 0 0 9px}
.lgain{position:absolute;top:0;bottom:0;border-radius:9px;background:linear-gradient(270deg,var(--dp) -10%,var(--c) 70%,var(--hi) 115%);
  box-shadow:inset 0 3px 4px -2px rgba(255,255,255,.7),inset 0 -3px 5px -3px rgba(0,0,0,.12)}
.lv{direction:ltr;display:flex;align-items:baseline;gap:5px;justify-content:flex-end}
.lv span{font-size:12px;color:#8f877d;font-weight:700}.lv span::after{content:" →";}
.lv b{font-size:16px;font-weight:800;color:#4a453f}
.lv em{display:none}
/* the book */
.bcov{position:relative;flex:none;aspect-ratio:2/3;border-radius:4px 10px 10px 4px;padding:12px 10px 10px 16px;display:flex;flex-direction:column;justify-content:space-between;
  background:linear-gradient(135deg,#e9c88a,#d9a441);color:#4a3418;box-shadow:-3px -3px 8px rgba(255,255,255,.9),5px 7px 14px rgba(140,110,70,.35);direction:rtl}
.bcov i{position:absolute;left:5px;top:0;bottom:0;width:3px;background:rgba(90,60,20,.18);border-radius:2px}
.bcov b{font-family:"Frank Ruhl Libre",Georgia,serif;font-size:14px;line-height:1.25}
.bcov span{font-size:10.5px;font-weight:700;opacity:.75}
.bcov.done b{font-size:17px}.bcov.done span{font-size:12px}
.bk{direction:rtl;display:flex;gap:16px;align-items:center}
.bki{flex:1;display:grid;gap:10px}
.bkp b{font-size:30px;font-weight:800;line-height:1}.bkp span{display:block;font-size:13px;color:#6d675e;font-weight:700;margin-top:2px}
.bch{position:relative;height:16px;border-radius:8px;overflow:hidden;background:#e6e3de;box-shadow:inset 2px 3px 6px rgba(168,160,148,.45),inset -2px -2px 5px rgba(255,255,255,.95)}
.qh{font-size:13px;font-weight:800;color:#6d675e;margin:18px 2px 8px}
.qt{position:relative;margin-bottom:9px;padding:11px 14px 9px 14px;border-radius:16px;font-family:"Frank Ruhl Libre",Georgia,serif;font-size:15px;line-height:1.5;color:#4a453f;
  box-shadow:inset 2px 3px 6px rgba(168,160,148,.35),inset -2px -2px 5px rgba(255,255,255,.95)}
.qt small{display:block;font-family:Assistant,sans-serif;font-size:11px;color:#8f877d;font-weight:700;margin-top:3px}
.fin{position:relative;display:flex;flex-direction:column;align-items:center;padding:10px 0 4px;text-align:center}
.fin .glow{position:absolute;top:0;left:50%;width:220px;height:220px;margin-left:-110px;border-radius:50%;background:radial-gradient(circle,rgba(241,196,112,.45),transparent 65%)}
.fint{margin-top:16px;font-size:13px;font-weight:800;color:#b07a1e}
.finb{font-family:"Frank Ruhl Libre",Georgia,serif;font-size:22px;font-weight:700;color:#4a453f;margin-top:2px}
.fins{direction:rtl;display:flex;gap:10px;margin-top:12px}
.fins span{border-radius:14px;padding:7px 12px;font-size:11.5px;color:#6d675e;font-weight:700;box-shadow:-3px -3px 7px rgba(255,255,255,.95),3px 4px 9px rgba(168,160,148,.3)}
.fins b{display:block;font-size:17px;color:#4a453f}
.pages{display:grid;gap:10px;margin-top:16px}
.pg{padding:12px 16px 10px;border-radius:6px 14px 14px 6px;background:#f5f1e8;box-shadow:-2px -2px 6px rgba(255,255,255,.9),3px 4px 10px rgba(168,160,148,.3);
  background-image:repeating-linear-gradient(transparent 0 23px,rgba(180,160,130,.18) 23px 24px)}
.pg p{margin:0;font-family:"Frank Ruhl Libre",Georgia,serif;font-size:15px;line-height:24px;color:#4a453f}
.pg small{display:block;font-size:11px;color:#8f877d;font-weight:700;margin-top:4px}
/* mood legend */`);
rep(`<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&display=swap" rel="stylesheet">`,
  `<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&family=Frank+Ruhl+Libre:wght@500;700&display=swap" rel="stylesheet">`);
fs.writeFileSync(F, s);
console.log('ok');
