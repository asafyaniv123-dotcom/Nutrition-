// TODO.md: first-run screens 3 and 4 - neither attempt worked (25 Oct)
import fs from 'fs';
const F='TODO.md';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const anchor='## ממשק שני: צ׳אט אחד גדול';
if(s.split(anchor).length!==2){console.log('anchor');process.exit(1);}
s=s.replace(anchor,()=>`## הכניסה הראשונה, מסכים 3 ו־4 — אחרי כל השאר (2026-10-25)

המסכים "בסוף כל יום, שתי דקות" ו"היום הראשון שלך נשמר" לא מזמינים. ב־25.10 נבנו
ארבע אפשרויות (\`review/firstday-proto\`: ערימת דפים, הערב קורה, טבעת שמתמלאת, דף
שנוחת). אסף: *״אף אחד מהם. נראה לא טוב. נתעסק בזה כשנסיים עם כל השאר.״*
בפעם הבאה: לשאול קודם מה בדיוק מפריע בכל מסך, ולהביא רפרנס (תיקיית Taste
library), לפני שבונים עוד אפשרויות.

`+anchor);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
