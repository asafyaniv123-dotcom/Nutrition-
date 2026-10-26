/* trackers prototype, fixes from the photographs: the dot board's Sunday
 * column ran into the week labels; the hobby rings overlapped; one hobby
 * sentence claimed a goal not reached; the drops were small in a tall empty
 * card and ran right-to-left while every other time axis runs left-to-right;
 * the ring captions mixed a day and a number on one line; the road zig-zagged
 * hard enough to read as data. */
import fs from 'fs';
const F = 'review/trackers-proto/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`var H=300,top=30,row=30,cw=34,x0=W-30-6*cw,b='',c='#e9845f';`, `var H=290,top=30,row=30,cw=36,x0=W-62-6*cw,b='',c='#e9845f';`);
rep(`var cx=W-sp*(i+.5),cy=86,r=52,C=2*Math.PI*r,at=0,sum=0;`, `var cx=W-sp*(i+.5),cy=78,r=42,C=2*Math.PI*r,at=0,sum=0;`);
s = s.split(`stroke-width="12"`).join(`stroke-width="10"`);
rep(`say:'קריאה עברה את היעד השבוע'`, `say:'קריאה הכי קרובה ליעד - עוד 10 דקות'`);
rep(`var V=[1500,2200,2500,1800,2600,2000,1200],TG=2500,b='',c='#7fa8d8',H=230,sp=W/7;`, `var V=[1500,2200,2500,1800,2600,2000,1200],TG=2500,b='',c='#7fa8d8',H=200,sp=W/7;`);
rep(`  for(var i=0;i<7;i++){var cx=W-sp*(i+.5),y0=48,s=34,`, `  for(var i=0;i<7;i++){var cx=sp*(i+.5),y0=34,s=58,`);
rep(`    b+='<g class="an" data-x="'+(W-cx).toFixed(0)+'"><path d="'+D+'" fill="rgba(168,160,148,.16)"/>'+`, `    b+='<g class="an" data-x="'+cx.toFixed(0)+'"><path d="'+D+'" fill="rgba(168,160,148,.16)"/>'+`);
rep(`'<g clip-path="url(#d'+i+')"><rect x="'+(cx-20)+'"`, `'<g clip-path="url(#d'+i+')"><rect x="'+(cx-30)+'"`);
rep(`width="40" height="80" fill="'+c+'"`, `width="60" height="120" fill="'+c+'"`);
rep(`      '<text x="'+p[0]+'" y="'+(p[1]+58)+'" text-anchor="middle" class="n">'+DAYS[i]+' · '+P[i]+'ג׳ חלבון</text></g>';}`,
  `      '<text x="'+p[0]+'" y="'+(p[1]+56)+'" text-anchor="middle" class="b" style="font-size:13px">'+DAYS[i]+'</text>'+
      '<text x="'+p[0]+'" y="'+(p[1]+72)+'" text-anchor="middle" class="n" style="fill:#c0654c">'+P[i]+' ג׳ חלבון</text></g>';}`);
rep(`chart:svg(270,b)+lg`, `chart:svg(290,b)+lg`);
rep(`var P=V.map(function(v,i){return [26+i*(W-52)/6, i%2?70:170];}),d=smooth(P);`, `var P=V.map(function(v,i){return [26+i*(W-52)/6, 120+[30,-25,20,-30,25,-20,10][i]];}),d=smooth(P);`);
rep(`    b+=tag(p[0],p[1]+(i%2?-30:32),nf(V[i]),i===6);`, `    b+=tag(p[0],p[1]+([30,-25,20,-30,25,-20,10][i]>0?34:-32),nf(V[i]),i===6);`);
fs.writeFileSync(F, s);
console.log('ok');
