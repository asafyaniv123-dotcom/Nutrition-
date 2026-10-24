/* The pull's mirror (Asaf, 24 Oct: "do the same in reverse"): pushing the
   page up past its end fills the gap at the bottom with the same warm light,
   growing with the push. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,70));process.exit(1);}s=s.replace(a,()=>b);};
rep(`  el.style.height=(y<0?Math.round(-y):0)+'px';
}`,`  el.style.height=(y<0?Math.round(-y):0)+'px';
  /* and past the END, from the bottom edge */
  var eb=document.getElementById('pull-glow-b'),over=y-(document.documentElement.scrollHeight-window.innerHeight);
  if(!eb){eb=document.createElement('div');eb.id='pull-glow-b';document.body.insertBefore(eb,document.body.firstChild);}
  eb.style.height=(over>0?Math.round(over):0)+'px';
}`);
rep(`#pull-glow{position:fixed;`,`#pull-glow-b{position:fixed;bottom:0;left:0;right:0;height:0;z-index:-1;pointer-events:none;
  background:radial-gradient(120% 100% at 50% 100%,rgba(240,169,46,.42),rgba(240,169,46,.16) 45%,rgba(245,240,235,0) 100%),#f5f0eb}
#pull-glow{position:fixed;`);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
