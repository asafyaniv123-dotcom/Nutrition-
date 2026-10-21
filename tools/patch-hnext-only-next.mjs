/* "אין עדיין שעות ליום הזה · כל הלו"ז" felt like a button for nothing (Asaf,
 * 21 Oct): with nothing coming up it only says so, and takes the space. The
 * card now exists only when there IS a next thing - which is when it helps. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR: ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`  var notes=todayNotes(date).length;
  var h='<button class="hnext" onclick="enterModule(&quot;planning&quot;)">';
  if(pick){
    h+='<span class="hnext-k">'+(pick.m<=mins?_t('עכשיו|בלו"ז'):_t('הבא|בלו"ז'))+'</span>'+
       '<span class="hnext-t">'+dpHM(pick.t.hour,pick.t.min||0)+'</span>'+
       '<span class="hnext-w">'+esc(pick.t.w)+'</span>';
  } else {
    h+='<span class="hnext-w quiet">'+(any?_t('זה הכול להיום בלו"ז'):_t('אין עדיין שעות ליום הזה'))+'</span>';
  }`, `  /* nothing coming up: no card. Saying "nothing yet" or "that's all" under
     the dial every day was a button for nothing. */
  if(!pick)return '';
  var notes=todayNotes(date).length;
  var h='<button class="hnext" onclick="enterModule(&quot;planning&quot;)">';
  h+='<span class="hnext-k">'+(pick.m<=mins?_t('עכשיו|בלו"ז'):_t('הבא|בלו"ז'))+'</span>'+
     '<span class="hnext-t">'+dpHM(pick.t.hour,pick.t.min||0)+'</span>'+
     '<span class="hnext-w">'+esc(pick.t.w)+'</span>';`);
fs.writeFileSync(F, s); console.log('patched');
