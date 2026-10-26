/* area tours: where the corner Mip is hidden (סיום יום), the page's own Mip
 * (#rf-beem) is the speaker - one Mip on screen, never two. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`  function corner(){var c=document.getElementById('bhelp');if(!c)return null;var r=c.getBoundingClientRect();
    return (r.width&&getComputedStyle(c).opacity!=='0')?r:null;}`,
`  function corner(){var c=document.getElementById('bhelp'),r=c&&c.getBoundingClientRect();
    if(r&&r.width&&getComputedStyle(c).opacity!=='0')return r;
    c=document.getElementById('rf-beem');r=c&&c.getBoundingClientRect();
    return (r&&r.width&&r.bottom>0&&r.top<innerHeight)?r:null;}`);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
