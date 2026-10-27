/* Undo leaves the top of the screen (Asaf, 27 Oct: "it looks stuck there")
 * and joins the writing bar, beside the star, as one more of its round
 * buttons: an arrow turning back. It shows only while there is something to
 * undo. Where there is no writing bar the old pill stays. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`     '<button class="dpk-lib'+(_dpLibShow?' on':'')+'" onclick="_dpColShow=false;_dpLibShow=!_dpLibShow;dpRail()"`,
`     '<button class="dpk-undo" id="dpk-undo" onclick="planUndo()" aria-label="'+esc(_t('בטל'))+'"'+((typeof _planUndo!=='undefined'&&_planUndo.length)?'':' hidden')+'>'+
       '<svg viewBox="0 0 24 24"><path d="M9 7 4.5 11.5 9 16"/><path d="M5 11.5h9.5a5 5 0 0 1 0 10H12"/></svg></button>'+
     '<button class="dpk-lib'+(_dpLibShow?' on':'')+'" onclick="_dpColShow=false;_dpLibShow=!_dpLibShow;dpRail()"`);
rep(`function renderPlanUndo(){
  var el=document.getElementById('plan-undo');
  var want=currentModule==='planning'&&_planUndo.length>0;`,
`function renderPlanUndo(){
  var el=document.getElementById('plan-undo');
  var want=currentModule==='planning'&&_planUndo.length>0;
  /* with the writing bar on screen, undo is its button, not a pill */
  var du=document.getElementById('dpk-undo');
  if(du){du.hidden=!want;if(el)el.remove();return;}`);
rep(`.dpk-cols{padding:8px 10px 12px}`,`.dpk-cols{padding:8px 10px 12px}
.dpk-undo{flex:none;width:44px;height:44px;border:none;border-radius:16px;cursor:pointer;display:grid;place-items:center;background:#e9e7e3;
  box-shadow:-3px -3px 7px rgba(255,255,255,.95),4px 5px 10px rgba(168,160,148,.3);animation:dpkTray .3s cubic-bezier(.22,.61,.36,1) both}
.dpk-undo[hidden]{display:none}
.dpk-undo svg{width:20px;height:20px;fill:none;stroke:#4a453f;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
html[dir=rtl] .dpk-undo svg{transform:scaleX(-1)}
body.dpk-on #plan-undo{display:none!important}`);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
