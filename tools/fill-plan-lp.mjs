/* the planning long-press menu, in every language */
import fs from 'fs';
const K=['גוררים ליום, או לוחצים עליו','גרירת משימה','הועבר ל{d}','הסיום לפני ההתחלה','סיום','עד {n} ימים','תאריך התחלה וסיום'];
const A={
 en:['Drag to a day, or tap it','Move task','Moved to {d}','The end is before the start','End',{one:'Up to {n} day',other:'Up to {n} days'},'Start and end date'],
 de:['Auf einen Tag ziehen oder antippen','Aufgabe verschieben','Verschoben auf {d}','Das Ende liegt vor dem Anfang','Ende',{one:'Bis zu {n} Tag',other:'Bis zu {n} Tage'},'Start- und Enddatum'],
 fr:['Glisse vers un jour, ou touche-le','Déplacer la tâche','Déplacée au {d}','La fin est avant le début','Fin',{one:'Jusqu’à {n} jour',other:'Jusqu’à {n} jours'},'Date de début et de fin'],
 it:['Trascina su un giorno, o toccalo','Sposta attività','Spostata a {d}','La fine è prima dell’inizio','Fine',{one:'Fino a {n} giorno',other:'Fino a {n} giorni'},'Data di inizio e fine'],
 es:['Arrastra a un día, o tócalo','Mover tarea','Movida al {d}','El final es antes del inicio','Fin',{one:'Hasta {n} día',other:'Hasta {n} días'},'Fecha de inicio y fin'],
 pt:['Arraste para um dia, ou toque nele','Mover tarefa','Movida para {d}','O fim é antes do início','Fim',{one:'Até {n} dia',other:'Até {n} dias'},'Data de início e fim'],
 ar:['اسحبها إلى يوم أو اضغط عليه','نقل المهمة','نُقلت إلى {d}','النهاية قبل البداية','النهاية',{zero:'حتى {n} يوم',one:'حتى يوم واحد',two:'حتى يومين',few:'حتى {n} أيام',many:'حتى {n} يومًا',other:'حتى {n} يوم'},'تاريخ البداية والنهاية'],
 ja:['日にドラッグするか、タップしてね','タスクを移動','{d}に移動しました','終了が開始より前です','終了',{other:'最大{n}日'},'開始日と終了日'],
 'zh-Hans':['拖到某一天，或点一下那天','移动任务','已移到{d}','结束早于开始','结束',{other:'最多{n}天'},'开始和结束日期'],
 'zh-Hant':['拖到某一天，或點一下那天','移動任務','已移到{d}','結束早於開始','結束',{other:'最多{n}天'},'開始和結束日期']};
for(const [l,v] of Object.entries(A)){const f=`data/lang/${l}.json`,d=JSON.parse(fs.readFileSync(f,'utf8'));K.forEach((k,i)=>d[k]=v[i]);fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n');}
console.log('ok');
