// Journal prototype: the margin rule goes on the right, where a Hebrew page
// has it, the writing starts past it, and the ribbon moves to the far edge so
// it never sits on the date or the first line.
import fs from 'fs';
const F='review/journal-proto/index.html';let s=fs.readFileSync(F,'utf8');
const rep=(a,b)=>{if(s.split(a).length!==2){console.log('ANCHOR',a.slice(0,50));process.exit(1);}s=s.replace(a,b);};
rep('.page::after{content:"";position:absolute;inset-block:0;inset-inline-end:34px;','.page::after{content:"";position:absolute;inset-block:0;inset-inline-start:34px;');
rep('.page{position:relative;border-radius:6px 18px 18px 6px;background:var(--paper);min-height:470px;padding:18px 18px 18px 22px;','.page{position:relative;border-radius:6px 18px 18px 6px;background:var(--paper);min-height:470px;padding:18px 46px 18px 22px;');
rep('.rib{position:absolute;top:-4px;inset-inline-start:30px;','.rib{position:absolute;top:-4px;inset-inline-end:26px;');
rep('.ph-date{font-family:"Frank Ruhl Libre",serif;font-size:19px;font-weight:700;margin-bottom:6px;display:flex;justify-content:space-between;align-items:baseline}','.ph-date{font-family:"Frank Ruhl Libre",serif;font-size:19px;font-weight:700;margin-bottom:6px;display:flex;justify-content:flex-start;gap:12px;align-items:baseline}');
fs.writeFileSync(F,s);console.log('ok');
