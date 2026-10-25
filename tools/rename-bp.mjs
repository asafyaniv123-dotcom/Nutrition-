// 'לחץ' alone reads to find-masculine-left as the imperative "press"; bound
// with a maqaf the noun phrase is one word and says the same.
import fs from 'fs';
let s=fs.readFileSync('dev/index.html','utf8');
for(const [a,b] of [["_t('יתר לחץ דם')","_t('יתר־לחץ־דם')"],["_t('לחץ דם: נושפים בזמן ההרמה, ולא עוצרים את הנשימה')","_t('לחץ־דם: נושפים בזמן ההרמה, ולא עוצרים את הנשימה')"]]){
  if(s.split(a).length!==2){console.log('anchor',a);process.exit(1);} s=s.replace(a,b);}
fs.writeFileSync('dev/index.html',s);console.log('ok');
