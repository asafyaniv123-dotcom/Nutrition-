/* Merge the 26 Oct answers (tools/notes-26-<lang>.json, written from the
 * English) into data/lang. Two Hebrew keys were reworded after translation
 * began (the checks flagged them); they are mapped here. Two keys the change
 * retired are dropped. */
import fs from 'fs';
const MAP={
 'ההיסטוריה של הימים הקודמים, מתכונים, ו"אישי" עם המטרות.':'ההיסטוריה של הימים הקודמים, מתכונים, וגם "אישי" עם המטרות.',
 'כל ערב כמה שאלות קצרות על היום. זה הלב של האפליקציה: מכאן אני לומד מה עובד בשבילך.':'כל ערב כמה שאלות קצרות על היום. זה הלב של האפליקציה: מכאן מבינים מה טוב בשבילך.'};
const DROP=['לברכה בבית','מי אתה?'];
const T=JSON.parse(fs.readFileSync('data/lang/_template.json','utf8'));
for(const l of ['en','de','fr','it','es','pt','ar','ja','zh-Hans','zh-Hant']){
  const src=JSON.parse(fs.readFileSync(`tools/notes-26-${l}.json`,'utf8'));
  const f=`data/lang/${l}.json`,d=JSON.parse(fs.readFileSync(f,'utf8'));let n=0;
  for(const [k,v] of Object.entries(src)){const kk=MAP[k]||k;if(!(kk in T)){console.log(l+': not asked: '+kk);continue;}d[kk]=v;n++;}
  DROP.forEach(k=>delete d[k]);
  fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n');console.log(l+' '+n);
}
/* the reworded "heart of the app" line, for the six written from the earlier
   English; and in ja/zh the planning boards are the calendar, as elsewhere */
const HEART='כל ערב כמה שאלות קצרות על היום. זה הלב של האפליקציה: מכאן מבינים מה טוב בשבילך.';
const FIX={
 de:'Jeden Abend ein paar kurze Fragen zum Tag. Das ist das Herz der App: Hier findest du heraus, was dir guttut.',
 fr:'Chaque soir, quelques questions courtes sur la journée. C’est le cœur de l’app : c’est ici que tu découvres ce qui te fait du bien.',
 it:'Ogni sera qualche breve domanda sulla giornata. È il cuore dell’app: qui scopri cosa ti fa bene.',
 ja:'毎晩、その日について短い質問をいくつか。ここがアプリの中心だよ。何が自分に合っているか、ここで見えてくる。',
 'zh-Hans':'每天晚上，几个关于这一天的简短问题。这是应用的核心：在这里，你会发现什么对你好。',
 'zh-Hant':'每天晚上，幾個關於這一天的簡短問題。這是應用程式的核心：在這裡，你會發現什麼對你好。'};
const BOARD='לחיצה על כל אחד פותחת או סוגרת את הלוח שלו.';
for(const [l,v] of Object.entries(FIX)){
  const f=`data/lang/${l}.json`,d=JSON.parse(fs.readFileSync(f,'utf8'));d[HEART]=v;
  if(l==='ja')d[BOARD]=String(d[BOARD]).replace(/パネル/g,'カレンダー');
  if(l==='zh-Hans')d[BOARD]=String(d[BOARD]).replace(/面板/g,'日历');
  if(l==='zh-Hant')d[BOARD]=String(d[BOARD]).replace(/面板/g,'行事曆');
  fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n');
}
console.log('fixed');
