/* two wordings the checks flagged: ו"אישי" reads as a lone quote to the glued
 * check, and "אני לומד ... בשבילך" as a masculine verb said to her. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`_t('ההיסטוריה של הימים הקודמים, מתכונים, ו"אישי" עם המטרות.')`,`_t('ההיסטוריה של הימים הקודמים, מתכונים, וגם "אישי" עם המטרות.')`);
rep(`_t('כל ערב כמה שאלות קצרות על היום. זה הלב של האפליקציה: מכאן אני לומד מה עובד בשבילך.')`,`_t('כל ערב כמה שאלות קצרות על היום. זה הלב של האפליקציה: מכאן לומדים מה עובד בשבילך.')`);
fs.writeFileSync(F,s);console.log('ok');
