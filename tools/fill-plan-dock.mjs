/* the day's writing bar, in every language; the retired keys dropped */
import fs from 'fs';
const K='מה להכניס ליום הזה?';
const A={en:'What goes into this day?',de:'Was kommt in diesen Tag?',fr:'Qu’est-ce qu’on met dans cette journée ?',it:'Cosa mettiamo in questa giornata?',
 es:'¿Qué ponemos en este día?',pt:'O que entra neste dia?',ar:'ماذا نضيف إلى هذا اليوم؟',ja:'この日に何を入れる？','zh-Hans':'这一天要放进什么？','zh-Hant':'這一天要放進什麼？'};
const DROP=['גרור אחת מהן ישר לשעה','החלק להחלפת יום','כתוב למטה, ואז גרור לשעה. מה שנכתב כאן נשאר כאן ולא עולה לטבלה השבועית.','מהתכנון שמעל','משהו ליום הזה','משימה חדשה','רק ליום הזה','השבוע הבא','השבוע הקודם'];
const T=JSON.parse(fs.readFileSync('data/lang/_template.json','utf8'));
for(const [l,v] of Object.entries(A)){const f=`data/lang/${l}.json`,d=JSON.parse(fs.readFileSync(f,'utf8'));d[K]=v;DROP.forEach(k=>{if(!(k in T))delete d[k];});fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n');}
console.log('ok');
