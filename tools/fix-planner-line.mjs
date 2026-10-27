/* the planner's opening line, in words people use (Asaf, 27 Oct), and the
 * day's "all day" row label - in every language */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');
const A="ספר לי מה יש לך בשבוע, ואבנה לוח שמחזיק את הכול.",B="ספר לי מה יש לך השבוע, ואעזור לך להכניס הכול ללו״ז.";
if(s.split(A).length!==2){console.log('anchor');process.exit(1);}s=s.replace(A,B);fs.writeFileSync(F,s);
const T={en:["Tell me what's on this week, and I'll help you fit it all into your schedule.",'All day'],
 de:['Erzähl mir, was diese Woche ansteht, und ich helfe dir, alles in deinen Plan zu bringen.','Ganztägig'],
 fr:['Dis-moi ce que tu as cette semaine, et je t’aide à tout caser dans ton agenda.','Toute la journée'],
 it:['Dimmi cosa hai questa settimana e ti aiuto a far entrare tutto in agenda.','Tutto il giorno'],
 es:['Cuéntame qué tienes esta semana y te ayudo a meterlo todo en tu agenda.','Todo el día'],
 pt:['Me conta o que você tem nesta semana, e eu te ajudo a encaixar tudo na agenda.','O dia todo'],
 ar:['أخبرني بما لديك هذا الأسبوع، وسأساعدك على إدخال كل شيء في جدولك.','طوال اليوم'],
 ja:['今週の予定を教えてね。全部スケジュールに入れるのを手伝うよ。','終日'],
 'zh-Hans':['告诉我这周有什么安排，我帮你把所有事都排进日程。','全天'],
 'zh-Hant':['告訴我這週有什麼安排，我幫你把所有事都排進行程。','全天']};
for(const [l,v] of Object.entries(T)){const f=`data/lang/${l}.json`,d=JSON.parse(fs.readFileSync(f,'utf8'));delete d[A];d[B]=v[0];if(!d['כל היום'])d['כל היום']=v[1];fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n');}
const X='data/he-x.json',x=JSON.parse(fs.readFileSync(X,'utf8'));x[B]='ספרו לי מה יש לכם השבוע, ואעזור לכם להכניס הכול ללו״ז.';fs.writeFileSync(X,JSON.stringify(x,null,2)+'\n');
console.log('ok');
