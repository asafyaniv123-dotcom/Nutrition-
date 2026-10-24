/* finishWorkout stores date as Date.now() - a number - and the week strip
 * keyed its "done" days on that number while asking for day strings, so no
 * day was ever lit as done. The tracking card's "this week" count had the
 * same comparison. Both go through appDayOf, which is what workoutsOn uses. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`  for(i=0;i<log.length;i++)if(log[i].date)on[log[i].date]=1;
  var h='<div class="fwk">'`, `  for(i=0;i<log.length;i++)if(log[i].date)on[appDayOf(log[i].date)]=1;
  var h='<div class="fwk">'`);
rep(`  for(i=0;i<log.length;i++)if(log[i].date&&log[i].date>=sun)n++;`, `  for(i=0;i<log.length;i++)if(log[i].date&&appDayOf(log[i].date)>=sun)n++;`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
