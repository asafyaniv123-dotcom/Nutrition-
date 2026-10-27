/* Completing an earlier day: the 30px title "משלים את יום שישי, 23 באו…" was
 * cut off. The title stays "סיום יום"; the day being completed is a line
 * under it, whole. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`  document.getElementById('hdr-title').textContent=
    rfIsToday()?''+_t('סיום יום')+'':_t('משלים את {d}',{d:fmtDate(_rfDate)});`,
`  document.getElementById('hdr-title').innerHTML=esc(_t('סיום יום'))+
    (rfIsToday()?'':'<small class="hdr-sub">'+esc(_t('משלים את {d}',{d:fmtDate(_rfDate)}))+'</small>');`);
rep(`.hdr-title{text-align:center;`,`.hdr-title .hdr-sub{display:block;margin-top:4px;font-size:15px;font-weight:700;letter-spacing:0;color:var(--nu-muted,#6d675e);white-space:normal}
.hdr-title{text-align:center;`);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
