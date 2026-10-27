/* the week strip ran away on the phone (Asaf's recording, 27 Oct: it landed
 * on 3 January). Centring set scrollLeft from offsetLeft, which in a
 * right-to-left box is the wrong sign on iOS: the strip sat on a side week,
 * its own scroll event read that as a swipe, the day stepped, the strip was
 * rebuilt off-centre again - week after week. Now: centred by scrollIntoView,
 * which knows the direction; and only a finger on the strip can step it,
 * once per touch. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`  var mid=el.children[1];el.scrollLeft=mid.offsetLeft-(el.clientWidth-mid.offsetWidth)/2;
  var t=null;
  el.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(function(){`,
`  var mid=el.children[1],y=window.scrollY;
  /* centre without trusting scrollLeft's sign, and without moving the page */
  var r0=el.getBoundingClientRect(),rm=mid.getBoundingClientRect();
  el.style.scrollSnapType='none';el.scrollLeft+=(rm.left+rm.width/2)-(r0.left+r0.width/2);el.style.scrollSnapType='';
  if(window.scrollY!==y)window.scrollTo(0,y);
  var t=null,armed=false;
  /* only a finger moves the week - a scroll the code made is not a swipe */
  el.addEventListener('touchstart',function(){armed=true;},{passive:true});
  el.addEventListener('pointerdown',function(){armed=true;});
  el.addEventListener('wheel',function(){armed=true;},{passive:true});
  el.addEventListener('scroll',function(){if(!armed)return;clearTimeout(t);t=setTimeout(function(){`);
rep(`    if(best!==1)planWeekStep(best-1);
  },140);},{passive:true});`,`    if(best!==1){armed=false;planWeekStep(best-1);}
  },160);},{passive:true});`);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
