/* the real cause: a planning chip's own rule (html body.mod-planning
 * .mo-chip{position:relative}) beat .lp-lift's position:fixed, so the lifted
 * copy flowed into the page. Undo the measured correction; make the lift
 * fixed whatever it is a copy of. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`
  /* where does "fixed" really put a box? correct everything by the miss */
  var lr=lift.getBoundingClientRect(),offY=lr.top-r.top,offX=lr.left-r.left;
  if(Math.abs(offY)>1||Math.abs(offX)>1){lift.style.top=(r.top-offY)+'px';lift.style.left=(r.left-offX)+'px';}`,``);
rep(`  m.style.top=(Math.min(r.bottom-shift+10,room-mh)-offY)+'px';`,`  m.style.top=Math.min(r.bottom-shift+10,room-mh)+'px';`);
rep(`  m.style.left=(Math.max(10,Math.min(window.innerWidth-mw-10,mid?r.left:r.right-mw))-offX)+'px';`,`  m.style.left=Math.max(10,Math.min(window.innerWidth-mw-10,mid?r.left:r.right-mw))+'px';`);
rep(`.lp-lift{position:fixed;`,`.lp-lift{position:fixed!important;`);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
