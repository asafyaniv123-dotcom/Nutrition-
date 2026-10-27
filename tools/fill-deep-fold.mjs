/* the folded card under the day, in every language */
import fs from 'fs';
const K=['{n} מתוך 4 נענו','למקד את היום','מה חשוב, איך להרגיש, מה עלול להפריע'];
const A={
 en:[{one:'{n} of 4 answered',other:'{n} of 4 answered'},'Focus the day','What matters, how to feel, what might get in the way'],
 de:[{one:'{n} von 4 beantwortet',other:'{n} von 4 beantwortet'},'Den Tag fokussieren','Was zählt, wie du dich fühlen willst, was stören könnte'],
 fr:[{one:'{n} sur 4 répondue',other:'{n} sur 4 répondues'},'Recentrer la journée','Ce qui compte, comment te sentir, ce qui pourrait gêner'],
 it:[{one:'{n} su 4 risposte',other:'{n} su 4 risposte'},'Mettere a fuoco la giornata','Cosa conta, come sentirti, cosa potrebbe intralciare'],
 es:[{one:'{n} de 4 respondida',other:'{n} de 4 respondidas'},'Enfocar el día','Qué importa, cómo sentirte, qué podría estorbar'],
 pt:[{one:'{n} de 4 respondida',other:'{n} de 4 respondidas'},'Focar o dia','O que importa, como se sentir, o que pode atrapalhar'],
 ar:[{zero:'{n} من 4 أُجيبت',one:'{n} من 4 أُجيبت',two:'{n} من 4 أُجيبتا',few:'{n} من 4 أُجيبت',many:'{n} من 4 أُجيبت',other:'{n} من 4 أُجيبت'},'تركيز اليوم','ما المهم، وما الشعور المرجو، وما قد يعيق'],
 ja:[{other:'4問中{n}問に回答'},'今日をととのえる','大切なこと、なりたい気分、じゃまになりそうなこと'],
 'zh-Hans':[{other:'已回答 {n}/4'},'聚焦这一天','什么重要、想要的感受、可能的干扰'],
 'zh-Hant':[{other:'已回答 {n}/4'},'聚焦這一天','什麼重要、想要的感受、可能的干擾']};
for(const [l,v] of Object.entries(A)){const f=`data/lang/${l}.json`,d=JSON.parse(fs.readFileSync(f,'utf8'));K.forEach((k,i)=>d[k]=v[i]);fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n');}
const X='data/he-x.json',x=JSON.parse(fs.readFileSync(X,'utf8'));fs.writeFileSync(X,JSON.stringify(x,null,2)+'\n');
console.log('ok');
