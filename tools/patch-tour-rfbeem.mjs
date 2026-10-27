/* סיום יום's first-visit tour drew a big lit circle over its own button
 * (Asaf, 27 Oct). The page's Mip (#rf-beem) was taken as the speaker and cut
 * out as a circle; it is large, the circle overlapped the button's hole, and
 * with even-odd filling two overlapping holes darken each other again. The
 * page's Mip is no longer cut out: where the corner Mip is hidden, the card's
 * own Mip speaks, as everywhere else the corner one is missing. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`    if(r&&r.width&&getComputedStyle(c).opacity!=='0')return r;
    c=document.getElementById('rf-beem');r=c&&c.getBoundingClientRect();
    return (r&&r.width&&r.bottom>0&&r.top<innerHeight)?r:null;}`,
`    return (r&&r.width&&getComputedStyle(c).opacity!=='0')?r:null;}`);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
