import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');
const a="var GEN_UP=['חזה','גב','כתפיים','יד קדמית','יד אחורית','אמה'],GEN_LOW=['ארבע ראשי','ירך אחורית','ישבן','תאומים'];";
if(s.split(a).length!==2){console.log('anchor');process.exit(1);}
s=s.replace(a,a+"   // i18n-exempt: muscle keys compared with fitDeficit's, shown through _t at the button");
fs.writeFileSync(F,s);
const K={'אימון בקליק':['One-tap workout','Training per Klick','Entreno en un toque','Séance en un clic','Allenamento in un tocco','Treino em um toque','ワンタップ・ワークアウト','一键训练','一鍵訓練','تمرين بنقرة'],
'במה תרצה להתרכז?':['What do you want to focus on?','Worauf willst du dich konzentrieren?','¿En qué quieres centrarte?','Sur quoi veux-tu te concentrer ?','Su cosa vuoi concentrarti?','No que você quer focar?','何に集中したいですか？','你想重点练什么？','你想重點練什麼？','على ماذا تريد التركيز؟'],
'גוף מלא':['Full body','Ganzkörper','Cuerpo completo','Corps entier','Total body','Corpo inteiro','全身','全身','全身','الجسم كامل'],
'כמה זמן יש לך, במה להתרכז, ואיזה ציוד':['Your time, your focus, your equipment','Deine Zeit, dein Fokus, deine Ausrüstung','Tu tiempo, tu enfoque, tu equipo','Ton temps, ton objectif, ton matériel','Il tuo tempo, il tuo focus, la tua attrezzatura','Seu tempo, seu foco, seu equipamento','時間・重点・器具を選ぶだけ','时间、重点、器械','時間、重點、器材','وقتك وتركيزك ومعداتك']};
const L=['en','de','es','fr','it','pt','ja','zh-Hans','zh-Hant','ar'];
for(const [i,l] of L.entries()){const f='data/lang/'+l+'.json',d=JSON.parse(fs.readFileSync(f,'utf8'));for(const k in K)d[k]=K[k][i];fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n');}
const add=(f,m)=>{const d=JSON.parse(fs.readFileSync(f,'utf8'));Object.assign(d,m);fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n');};
add('data/he-f.json',{'במה תרצה להתרכז?':'במה תרצי להתרכז?','גוף מלא':'גוף מלא'});
add('data/he-x.json',{'במה תרצה להתרכז?':'במה תרצו להתרכז?','כמה זמן יש לך, במה להתרכז, ואיזה ציוד':'כמה זמן יש לכם, במה להתרכז, ואיזה ציוד'});
console.log('ok');
