/* trackers round 7 (Asaf: "I didn't like the small numbers over the plates -
 * numbers that feel just thrown there; give me another option").
 * The plates carry no numbers. Each exercise is a small card: its name, the
 * loaded bar, and beneath the bar the two ends in the same pair the page
 * opens with - "then" pressed in, "today" raised and lit - each under the side
 * of the bar it belongs to. The numbers have a place, and it is always the same. */
import fs from 'fs';
const F = 'review/trackers-2/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`      if(side>0){s2+='<text class="pt'`, `      if(side>0&&!window.__noPT){s2+='<text class="pt'`);
rep(`T.food={name:'קלוריות',build:function(){`, `T.strength2={name:'כוח ב׳',build:function(){
  var E=[['דדליפט',60,85,1],['סקוואט',40,60,1],['לחיצת חזה',35,45,1],['חתירה',30,40,0],['לחיצת כתפיים',20,27.5,1]],h='<div class="bk2">';
  window.__noPT=1;
  E.forEach(function(e,i){
    h+='<div class="b2 an" data-x="'+(i*55)+'"><div class="b2n">'+e[0]+(e[3]?'<span class="star">★</span>':'')+'</div>'+barbell(e[1],e[2],i)+
      '<div class="b2p"><span class="was"><small>התחלה</small>'+e[1]+'</span><span class="now"><small>היום</small>'+e[2]+'</span></div></div>';});
  window.__noPT=0;
  h+='</div><div class="lb" style="text-align:center;margin:8px 0 2px">ק"ג · המשקולות הכתומות נוספו ב-8 שבועות</div>';
  return frame({t:'כוח בתרגילים',thenL:'שיאים בחודש שעבר',thenV:'2',nowL:'שיאים החודש',nowV:'4',chip:'<bdi dir="ltr">+2</bdi> שיאים',c:C.terra[0],
    chart:h,say:'כל חמשת התרגילים עלו',sub:'דדליפט עלה הכי הרבה: 25 ק"ג'});}};
T.food={name:'קלוריות',build:function(){`);
rep(`var ORDER=['weight','food','water','strength',`, `var ORDER=['weight','food','water','strength2','strength',`);
rep(`/* the book */`, `/* strength, option B: the pair beneath each bar */
.bk2{display:grid;gap:12px}
.b2{padding:10px 12px 12px;border-radius:20px;box-shadow:inset 2px 3px 7px rgba(168,160,148,.32),inset -2px -2px 6px rgba(255,255,255,.95)}
.b2n{font-size:15px;font-weight:800;color:#4a453f}
.b2n .star{color:#e2a93f;margin-inline-start:5px;font-size:12px;text-shadow:0 0 6px rgba(233,180,76,.7)}
.b2 .bb{height:46px}
.b2p{direction:ltr;display:flex;justify-content:space-between;margin:2px 18% 0}
.b2p span{min-width:64px;text-align:center;border-radius:12px;padding:3px 10px 4px;font-size:16px;font-weight:800;color:#6d675e}
.b2p small{display:block;font-size:10.5px;font-weight:700;color:#8f877d;line-height:1.2}
.b2p .was{box-shadow:inset 2px 2px 5px rgba(168,160,148,.4),inset -2px -2px 4px rgba(255,255,255,.95)}
.b2p .now{color:#c0603f;background:#efece8;box-shadow:-2px -2px 5px rgba(255,255,255,.95),3px 3px 7px rgba(168,160,148,.35)}
/* the book */`);
fs.writeFileSync(F, s);
console.log('ok');
