/* With six areas one of them turns to the bottom, and its label lands on the
 * ring's "24" (seen on Asaf's phone, 21 Oct). A numeral steps aside - fades -
 * while a label covers it, measured from the screen, so it holds for any
 * number of areas and any turn of the dial. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`html body.mod-home .hdial-n{font-size:10.5px;font-weight:800;fill:#9a928b;font-family:inherit}`,
    `html body.mod-home .hdial-n{font-size:10.5px;font-weight:800;fill:#9a928b;font-family:inherit;transition:opacity .25s}
html body.mod-home .hdial-n.under{opacity:0}`);
rep(`  for(i=0;i<els.length;i++)els[i].classList.toggle('on',i===best);
  return best;
}`, `  for(i=0;i<els.length;i++)els[i].classList.toggle('on',i===best);
  dialNumFree(d);
  return best;
}
/* an hour numeral that a label is lying on steps aside, by measurement */
function dialNumFree(d){
  d=d||document.querySelector('.hdial');if(!d)return;
  var ns=d.querySelectorAll('.hdial-n'),ls=d.querySelectorAll('.hdisc-t'),i,j,a,b,hit;
  for(i=0;i<ns.length;i++){
    a=ns[i].getBoundingClientRect();hit=false;
    for(j=0;j<ls.length&&!hit;j++){
      b=ls[j].getBoundingClientRect();
      hit=b.width>0&&a.left<b.right+3&&a.right>b.left-3&&a.top<b.bottom+2&&a.bottom>b.top-2;
    }
    ns[i].classList.toggle('under',hit);
  }
}`);
/* after a snap the discs have arrived somewhere new; and the rim is redrawn
   every minute, which brings every numeral back */
rep(`  setTimeout(function(){d.classList.remove('snap');if(then)then();},Math.abs(turn)<1?0:340);`,
    `  setTimeout(function(){d.classList.remove('snap');dialNumFree(d);if(then)then();},Math.abs(turn)<1?0:340);`);
rep(`  var r=document.getElementById('hdial-rim');if(r)r.innerHTML=dialRimInner();`,
    `  var r=document.getElementById('hdial-rim');if(r){r.innerHTML=dialRimInner();dialNumFree();}`);
fs.writeFileSync(F, s); console.log('patched');
