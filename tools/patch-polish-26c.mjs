/* the delete demo: the task's word upright, the bin icon centred */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`.td-bin svg{width:22px;height:22px;`,`.td-chip{font-style:normal}
.td-bin svg{position:static;display:block;margin:0;transform:none;width:22px;height:22px;`);
fs.writeFileSync(F,s);console.log('ok');
