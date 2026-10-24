/* 'גוף מלא' reads to find-masculine-left as the imperative מלא ("fill");
   'כל הגוף' says the same and is not a verb. */
import fs from 'fs';
let s=fs.readFileSync('dev/index.html','utf8');
const a="_t('גוף מלא')";if(s.split(a).length!==2){console.log('anchor');process.exit(1);}
fs.writeFileSync('dev/index.html',s.replace(a,"_t('כל הגוף')"));
for(const f of fs.readdirSync('data/lang').filter(f=>f.endsWith('.json')&&!f.startsWith('_'))){
  const p='data/lang/'+f,d=JSON.parse(fs.readFileSync(p,'utf8'));
  if('גוף מלא' in d){d['כל הגוף']=d['גוף מלא'];delete d['גוף מלא'];fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');}
}
const hf=JSON.parse(fs.readFileSync('data/he-f.json','utf8'));delete hf['גוף מלא'];fs.writeFileSync('data/he-f.json',JSON.stringify(hf,null,2)+'\n');
console.log('ok');
