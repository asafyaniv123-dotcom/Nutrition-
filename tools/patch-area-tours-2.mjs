/* area tours: a tall target (the week board) lit only along its top, so the
 * card fits under it; and the card never covers the corner Mip who speaks. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`      var b=e.getBoundingClientRect(),bt=Math.max(b.top,6),bb=Math.min(b.bottom,H-6);`,
`      var b=e.getBoundingClientRect(),bt=Math.max(b.top,6),bb=Math.min(b.bottom,H-6);
      if(bb-bt>H*.42){try{window.scrollBy(0,b.top-(cr?cr.bottom+16:90));}catch(er){}b=e.getBoundingClientRect();bt=Math.max(b.top,6);bb=Math.min(bt+240,H-6);}`);
rep(`    document.getElementById('tour-c').style.top=Math.min(top,H-230)+'px';
    document.getElementById('tour-t').textContent=st.t;document.getElementById('tour-d').textContent=st.d;
    var h='',i;for(i=0;i<N;i++)`,
`    top=Math.min(top,H-230);if(cr&&top<cr.bottom+10)top=cr.bottom+10;
    document.getElementById('tour-c').style.top=top+'px';
    document.getElementById('tour-t').textContent=st.t;document.getElementById('tour-d').textContent=st.d;
    var h='',i;for(i=0;i<N;i++)`);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
