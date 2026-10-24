/* Journal curl (Asaf, 24 Oct): letting go once the finger has crossed the
   middle of the page turns it - you no longer drag to the far edge. A quick
   flick in the direction of the turn completes it too, wherever it is. */
import fs from 'fs';
const F = 'review/journal-curl/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR', a.slice(0, 60)); process.exit(1); } s = s.replace(a, b); };
rep(`    e.preventDefault();`, `    e.preventDefault();
    var now=performance.now();if(drag.t){drag.v=(p.x-drag.px)/Math.max(1,now-drag.t);}drag.t=now;drag.px=p.x;drag.fx=p.x;`);
rep(`var flat=d.G,turned={x:2*W-d.G.x,y:d.G.y},pr=(d.F.x-d.G.x)/(turned.x-d.G.x||1);`,
    `var flat=d.G,turned={x:2*W-d.G.x,y:d.G.y},v=d.v||0,fx=d.fx==null?d.s.x:d.fx;
    /* past the middle of the page, or flicked that way */
    var go=d.back?(fx<W/2||v<-0.45):(fx>W/2||v>0.45),pr=d.back?(go?0:1):(go?1:0);`);
rep(`if(!d.back)animate(d,pr>.42?turned:flat,pr>.42?`, `if(!d.back)animate(d,go?turned:flat,go?`);
rep(`else animate(d,pr<.58?flat:turned,pr<.58?`, `else animate(d,go?flat:turned,go?`);
fs.writeFileSync(F, s);
console.log('ok');
