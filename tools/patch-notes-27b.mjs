/* follow-ups to patch-notes-27 after looking at them:
 * - the flow arrows pointed down: a text chevron, which turns with the language
 * - the closet demo's shirt was painted by the tour's own ".tour path" fill
 *   (the overlay colour): the shirt carries its colour inline
 * - the end of a run on the month is the same amber bead as a one-day task */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`.td-flow b{flex:none;align-self:center;width:8px;height:8px;border-top:2.5px solid #b0a08c;border-inline-end:2.5px solid #b0a08c;transform:rotate(45deg)}
[dir=rtl] .td-flow b{transform:rotate(-135deg)}`,
`.td-flow b{flex:none;align-self:center;font-size:20px;font-weight:800;color:#b0a08c;line-height:1}
.td-flow b::before{content:"›"}
[dir=rtl] .td-flow b::before{content:"‹"}`);
rep(`fill="#6f97c8"/></svg>';`,`style="fill:#6f97c8"/></svg>';`);
rep(`html body.mod-planning .mo-grabs{padding-inline-end:16px}`,`html body.mod-planning .mo-grabs{padding-inline-end:16px}
html body.mod-planning .mo-grab-e{background:#f0a92e!important;width:11px;height:11px;box-shadow:0 0 0 2.5px rgba(255,255,255,.95),0 1px 3px rgba(90,70,40,.3)}`);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
