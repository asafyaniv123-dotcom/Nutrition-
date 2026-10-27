/* plan-v2 draft, after looking: font shorthands with "inherit" are invalid
 * (thin buttons); the undo toast covered the title; the step arrows sat on
 * the crumbs; the stretch bead covered the task's own words on the week. */
import fs from 'fs';
const F='review/plan-v2/index.html';let s=fs.readFileSync(F,'utf8');
s=s.replace(/font:(\d+) (\d+(?:\.\d+)?px)(?:\/1)? inherit/g,'font-weight:$1;font-size:$2;line-height:1;font-family:inherit');
const rep=(a,b)=>{if(s.split(a).length!==2){console.log('ANCHOR '+a.slice(0,60));process.exit(1);}s=s.replace(a,b);};
rep('.undo{position:absolute;top:56px;left:50%;transform:translate(-50%,-140%);','.undo{position:absolute;bottom:206px;left:50%;transform:translate(-50%,30px);opacity:0;');
rep('.undo.on{transform:translate(-50%,0)}','.undo.on{transform:translate(-50%,0);opacity:1}');
rep('transition:transform .35s cubic-bezier(.22,.61,.36,1);white-space:nowrap}','transition:transform .35s cubic-bezier(.22,.61,.36,1),opacity .3s;white-space:nowrap}');
rep('.steps{position:absolute;top:96px;inset-inline-end:16px;','.steps{position:absolute;top:52px;inset-inline-end:16px;');
rep('.wtk{margin-bottom:5px;padding:6px 6px;','.wtk{margin-bottom:8px;padding:6px 6px;overflow:visible;');
rep('.bead i{','.wtk .bead,.mlane .bead{top:auto;bottom:-9px;margin-top:0;inset-inline-end:-9px;width:22px;height:22px}\n.mlane{overflow:visible}\n.bead i{');
fs.writeFileSync(F,s);console.log('ok');
