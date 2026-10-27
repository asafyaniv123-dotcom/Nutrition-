import fs from 'fs';
const K='לחיצה מוסיפה, או גרירה לשעה';
const A={en:'Tap to add, or drag to an hour',de:'Tippen fügt hinzu, oder auf eine Uhrzeit ziehen',fr:'Touche pour ajouter, ou glisse vers une heure',it:'Tocca per aggiungere, o trascina su un’ora',es:'Toca para añadir, o arrastra a una hora',pt:'Toque para adicionar, ou arraste para um horário',ar:'الضغط يضيف، أو السحب إلى ساعة',ja:'タップで追加、または時間へドラッグ','zh-Hans':'点一下添加，或拖到某个时间','zh-Hant':'點一下新增，或拖到某個時間'};
for(const [l,v] of Object.entries(A)){const f=`data/lang/${l}.json`,d=JSON.parse(fs.readFileSync(f,'utf8'));d[K]=v;fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n');}
console.log('ok');
