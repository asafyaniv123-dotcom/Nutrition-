/* Swipe direction follows the reading direction (Asaf, 27 Oct): in Hebrew the
 * next day/week/month is reached by swiping LEFT, in a left-to-right language
 * by swiping RIGHT. The boards' swipe already went left->next for everyone;
 * now it turns with the language, the small slide that answers a swipe moves
 * the way the finger did, and the week strip (a scroller, whose physics
 * revealed the opposite neighbour) holds its weeks in the order that makes
 * the same finger reach the same week. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`  planStep(dx>0?-1:1,s.where);
  daySwipeHint(dx>0?-1:1);`,
`  /* next is the way one reads: left in Hebrew and Arabic, right otherwise */
  var rtl=document.documentElement.dir==='rtl',nx=rtl?(dx<0):(dx>0);
  planStep(nx?1:-1,s.where);
  daySwipeHint(dx<0?-1:1);`);
rep(`  g.style.transform='translateX('+(dir<0?-18:18)+'px)';`,`  /* the page leans the way the finger went */
  g.style.transform='translateX('+(dir<0?-18:18)+'px)';`);
rep(`  for(w=-1;w<=1;w++){
    h+='<div class="plws-d" data-w="'+w+'">';`,
`  /* a scroller reveals the neighbour opposite the finger: the week a swipe
     should reach is placed on the side the finger leaves */
  for(var _k=0;_k<3;_k++){w=1-_k;
    h+='<div class="plws-d" data-w="'+w+'">';`);
rep(`    if(best!==1){armed=false;planWeekStep(best-1);}`,`    var bw=+el.children[best].getAttribute('data-w');
    if(bw){armed=false;planWeekStep(document.documentElement.dir==='rtl'?bw:-bw);}`);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
