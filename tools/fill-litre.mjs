/* '{n} ליטר' - the goals screen's water in whole words */
import fs from 'fs';
const K='{n} ליטר',A={
 en:{one:'{n} litre',other:'{n} litres'},de:{one:'{n} Liter',other:'{n} Liter'},fr:{one:'{n} litre',other:'{n} litres'},
 it:{one:'{n} litro',other:'{n} litri'},es:{one:'{n} litro',other:'{n} litros'},pt:{one:'{n} litro',other:'{n} litros'},
 ar:{zero:'{n} لتر',one:'لتر واحد',two:'لتران',few:'{n} لترات',many:'{n} لترًا',other:'{n} لتر'},
 ja:{other:'{n}リットル'},'zh-Hans':{other:'{n}升'},'zh-Hant':{other:'{n}公升'}};
for(const [l,v] of Object.entries(A)){const f=`data/lang/${l}.json`,d=JSON.parse(fs.readFileSync(f,'utf8'));d[K]=v;fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n');}
console.log('ok');
