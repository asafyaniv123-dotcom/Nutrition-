/* en: the planning board is "the calendar" everywhere else in English */
import fs from 'fs';
const f='data/lang/en.json',d=JSON.parse(fs.readFileSync(f,'utf8'));let n=0;
for(const k of Object.keys(JSON.parse(fs.readFileSync('tools/notes-26-en.json','utf8'))).concat(['ההיסטוריה של הימים הקודמים, מתכונים, וגם "אישי" עם המטרות.','כל ערב כמה שאלות קצרות על היום. זה הלב של האפליקציה: מכאן מבינים מה טוב בשבילך.'])){
  if(typeof d[k]==='string'&&/board/.test(d[k])){d[k]=d[k].replace(/take it off the board/g,'take it off the calendar').replace(/the board itself/g,'the calendar itself').replace(/leaves the board/g,'leaves the calendar').replace(/a whole board/g,'a whole calendar').replace(/its board/g,'its calendar');n++;}
}
fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n');console.log(n);
