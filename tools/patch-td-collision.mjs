/* The tour demos' classes shared a prefix with the home card's ".td-" (the
 * day under the dial): .td-dot and .td-row already existed there, so the
 * demo's moving-dot animation also ran on the home card's "now" dot. The
 * demo's row is renamed, and the unused dot rule and its keyframes removed. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`'<span class="td-row"><em>`,`'<span class="tdm-row"><em>`);
rep(`.td-row{position:absolute;top:14px;`,`.tdm-row{position:absolute;top:14px;`);
rep(`.td-row em{`,`.tdm-row em{`);
s=s.replace(/\.td-dot-unused\{[^\n]*\n/,'').replace(/@keyframes tdDot\{[^\n]*\n/,'');
s=s.replace('.td-flow span,.td-dot,.td-row em,.td-copy{animation:none}','.td-flow span,.tdm-row em,.td-copy{animation:none}');
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
