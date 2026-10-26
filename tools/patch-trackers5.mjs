/* trackers round 5 (Asaf, 26 Oct): strength "not interesting"; volume "entry
 * excellent, display great - more colours are fine"; book "excellent".
 *  - strength: a loaded bar per exercise. The weight is drawn as what it is -
 *    plates on a barbell, per side, from the real plate sizes - the plates it
 *    carried eight weeks ago in the material, the ones added since lit in
 *    terracotta; the plates slide on, outermost last. The weight in the
 *    middle, the change beside it, a star on a record.
 *  - volume: the same pie, one soft colour per muscle group. */
import fs from 'fs';
const F = 'review/trackers-2/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
const cut = (a, b, by) => { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) { console.log('CUT ' + a.slice(0, 50)); process.exit(1); } s = s.slice(0, i) + by + s.slice(j); };

cut(`T.strength={name:'כוח בתרגילים',build:function(){`, `T.food=`, `/* plates for one side of a 20 kg bar */
function plates(kg){var side=Math.max(0,(kg-20)/2),out=[],P=[20,10,5,2.5,1.25];
  P.forEach(function(p){while(side>=p-1e-9){out.push(p);side-=p;}});return out;}
var PL={20:[48,9],10:[40,8],5:[31,7],2.5:[24,6],1.25:[19,5]};
function barbell(was,now,i){
  var a=plates(was),b=plates(now),W2=210,cx=W2/2,H2=56,cy=H2/2,c=C.terra;
  /* the plates it had are matched from the inside out; whatever is beyond them is new */
  var keep=0;for(var k=0;k<b.length&&k<a.length&&b[k]===a[k];k++)keep++;
  var s2='<svg viewBox="0 0 '+W2+' '+H2+'" class="bb"><defs><linearGradient id="pn'+i+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c[2]+'"/><stop offset=".5" stop-color="'+c[0]+'"/><stop offset="1" stop-color="'+c[1]+'"/></linearGradient>'+
    '<linearGradient id="po'+i+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f4f1"/><stop offset=".5" stop-color="#e3dfd9"/><stop offset="1" stop-color="#cfc8bf"/></linearGradient>'+
    '<linearGradient id="bar'+i+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9d4cd"/><stop offset=".5" stop-color="#f4f2ee"/><stop offset="1" stop-color="#b9b1a6"/></linearGradient></defs>';
  s2+='<rect x="6" y="'+(cy-2.5)+'" width="'+(W2-12)+'" height="5" rx="2.5" fill="url(#bar'+i+')"/>';
  s2+='<rect x="'+(cx-40)+'" y="'+(cy-6)+'" width="6" height="12" rx="2" fill="#cdc6bc"/><rect x="'+(cx+34)+'" y="'+(cy-6)+'" width="6" height="12" rx="2" fill="#cdc6bc"/>';
  [-1,1].forEach(function(side){var x=side<0?cx-42:cx+42;
    b.forEach(function(p,k){var d=PL[p],nw=k>=keep,w=d[1];x+=side<0?-w-1:0;
      s2+='<rect class="plate'+(nw?' nw':'')+'" style="--d:'+(k*90)+'ms;--from:'+(side*-26)+'px" x="'+x.toFixed(1)+'" y="'+(cy-d[0]/2)+'" width="'+w+'" height="'+d[0]+'" rx="2.5" fill="url(#'+(nw?'pn':'po')+i+')"'+(nw?' filter="drop-shadow(0 0 3px '+c[0]+')"':'')+'/>';
      if(side>0)x+=w+1;});});
  return s2+'</svg>';
}
T.strength={name:'כוח בתרגילים',build:function(){
  var E=[['דדליפט',60,85,1],['סקוואט',40,60,1],['לחיצת חזה',35,45,1],['חתירה',30,40,0],['לחיצת כתפיים',20,27.5,1]],h='<div class="bbs">';
  E.forEach(function(e,i){
    h+='<div class="bbr an" data-x="'+(i*55)+'"><div class="bbh"><span class="ln">'+e[0]+(e[3]?'<span class="star">★</span>':'')+'</span>'+
      '<span class="bbv"><b>'+e[2]+'</b> ק"ג <em><bdi dir="ltr">+'+(e[2]-e[1])+'</bdi></em></span></div>'+barbell(e[1],e[2],i)+'</div>';});
  h+='</div><div class="lb" style="text-align:center;margin:8px 0 2px">המשקלות על המוט, בכל צד · הכתומים: מה שנוסף ב-8 שבועות</div>';
  return frame({t:'כוח בתרגילים',thenL:'שיאים בחודש שעבר',thenV:'2',nowL:'שיאים החודש',nowV:'4',chip:'<bdi dir="ltr">+2</bdi> שיאים',c:C.terra[0],
    chart:h,say:'כל חמשת התרגילים עלו',sub:'דדליפט עלה הכי הרבה: 25 ק"ג'});}};
`);
rep(`/* the book */`, `/* strength: loaded bars */
.bbs{display:grid;gap:6px}
.bbr{padding:3px 2px 0;border-bottom:1px solid rgba(168,160,148,.16)}.bbr:last-child{border-bottom:none}
.bbh{display:flex;justify-content:space-between;align-items:baseline}
.bbv{font-size:12px;color:#6d675e;font-weight:700}.bbv b{font-size:17px;color:#4a453f}
.bbv em{font-style:normal;color:#4f7d4b;font-weight:800;margin-inline-start:6px;padding:2px 7px;border-radius:999px;box-shadow:inset 1px 2px 4px rgba(168,160,148,.3),inset -1px -1px 3px rgba(255,255,255,.95)}
.bb{display:block;width:100%;height:44px;direction:ltr}
.plate{animation:slide .7s cubic-bezier(.22,.61,.36,1) both;animation-delay:calc(var(--d) + 500ms)}
@keyframes slide{from{transform:translateX(var(--from));opacity:0}to{transform:none;opacity:1}}
/* the book */`);
rep(`var G=[['רגליים',16,'#d9724f'],['גב',14,'#e58c66'],['חזה',11,'#eea583'],['כתפיים',8,'#f3bea3'],['ידיים',7,'#f7d4c2']]`,
  `var G=[['רגליים',16,'#e9946f'],['גב',14,'#e8b86d'],['חזה',11,'#d99aa8'],['כתפיים',8,'#9db8d6'],['ידיים',7,'#9cc49a']]`);
fs.writeFileSync(F, s);
console.log('ok');
