import fs from 'fs';
const K='נשמר כמשימה חוזרת';
const A={en:'Saved as a repeating task',de:'Als wiederkehrende Aufgabe gespeichert',fr:'Enregistrée comme tâche récurrente',it:'Salvata come attività ricorrente',es:'Guardada como tarea que se repite',pt:'Salva como tarefa que se repete',ar:'حُفظت كمهمة متكرّرة',ja:'くり返すタスクとして保存しました','zh-Hans':'已存为重复任务','zh-Hant':'已存成重複任務'};
const DROP=['{done} מתוך {n} משובצים','לספר מה יש בשבוע, ולקבל לוח','תכנון הוא לא רשימה. זו החלטה מה חשוב, לפני שהזמן מחליט במקומך.'];
for(const [l,v] of Object.entries(A)){const f=`data/lang/${l}.json`,d=JSON.parse(fs.readFileSync(f,'utf8'));d[K]=v;DROP.forEach(k=>delete d[k]);fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n');}
console.log('ok');
