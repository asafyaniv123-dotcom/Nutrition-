import fs from 'fs';
const K='מה להכניס לחודש?';
const A={en:'What goes into this month?',de:'Was kommt in diesen Monat?',fr:'Qu’est-ce qu’on met dans ce mois ?',it:'Cosa mettiamo in questo mese?',es:'¿Qué ponemos en este mes?',pt:'O que entra neste mês?',ar:'ماذا نضيف إلى هذا الشهر؟',ja:'今月に何を入れる？','zh-Hans':'这个月要放进什么？','zh-Hant':'這個月要放進什麼？'};
for(const [l,v] of Object.entries(A)){const f=`data/lang/${l}.json`,d=JSON.parse(fs.readFileSync(f,'utf8'));d[K]=v;fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n');}
console.log('ok');
