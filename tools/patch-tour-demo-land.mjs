/* the demos' task landed half across the dashed day (Asaf's phone, 26 Oct):
 * the distance was a fixed 150/170px, and the card's width is the phone's.
 * The demo is now a size container, the moving chip has a fixed width, and
 * it travels exactly to the middle of the day: 100cqw - end gap - box. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`.td-chip.td-add{inset-inline-start:62px;`,`.tour-demo{container-type:inline-size}
.td-chip.td-add,.td-chip.td-copy{width:84px;padding:0;justify-content:center}
.td-chip.td-add{inset-inline-start:62px;`);
rep(`62%,84%{transform:translateX(calc(var(--td-dir,1) * 150px));opacity:1}96%,100%{transform:translateX(calc(var(--td-dir,1) * 150px));opacity:0}}`,
`62%,84%{transform:translateX(calc(var(--td-dir,1) * (100cqw - 164px)));opacity:1}96%,100%{transform:translateX(calc(var(--td-dir,1) * (100cqw - 164px)));opacity:0}}`);
rep(`70%,86%{transform:translateX(calc(var(--td-dir,1) * 170px));opacity:1}100%{transform:translateX(calc(var(--td-dir,1) * 170px));opacity:0}}`,
`70%,86%{transform:translateX(calc(var(--td-dir,1) * (100cqw - 114px)));opacity:1}100%{transform:translateX(calc(var(--td-dir,1) * (100cqw - 114px)));opacity:0}}`);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
