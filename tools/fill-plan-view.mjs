/* the planning switch and the week strip's arrows, in every language */
import fs from 'fs';
const K=['השבוע הבא','השבוע הקודם','חודש','יום'];
const A={en:['Next week','Previous week','Month','Day'],de:['Nächste Woche','Vorige Woche','Monat','Tag'],fr:['Semaine suivante','Semaine précédente','Mois','Jour'],
 it:['Settimana successiva','Settimana precedente','Mese','Giorno'],es:['Semana siguiente','Semana anterior','Mes','Día'],pt:['Próxima semana','Semana anterior','Mês','Dia'],
 ar:['الأسبوع القادم','الأسبوع السابق','الشهر','اليوم'],ja:['来週','先週','月','日'],'zh-Hans':['下一周','上一周','月','日'],'zh-Hant':['下一週','上一週','月','日']};
for(const [l,v] of Object.entries(A)){const f=`data/lang/${l}.json`,d=JSON.parse(fs.readFileSync(f,'utf8'));K.forEach((k,i)=>d[k]=v[i]);
  delete d['לראות אותו כולו לפני שהוא מתחיל'];delete d['מה החודש צריך להחזיק, ומתי'];fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n');}
console.log('ok');
