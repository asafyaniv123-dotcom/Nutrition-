/* chat prototype, round 5.1 - two found by walking it:
 *  - a range of hours read backwards in Hebrew: "10:00–11:00" painted as
 *    11:00–10:00, in the card and in the sentence. Every number range is now
 *    isolated left-to-right (<bdi dir=ltr>), in answers, cards and chips.
 *  - a question asked in your own words ("כמה חלבון נשאר לי") was still
 *    offered as a suggestion, because "asked" was the literal text. Each
 *    message now remembers the question it matched, and that is what the
 *    row leaves out. */
import fs from 'fs';
const F = 'review/chat-proto/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`function avatar(){`, `/* a range of numbers stays left-to-right inside Hebrew */
function ltr(t){return String(t).replace(/(\\d[\\d:.,]*\\s*[–-]\\s*\\d[\\d:.,]*)/g,'<bdi dir="ltr">$1</bdi>');}
function avatar(){`);
rep(`  var list=cur?area(cur)[3]:GENERAL,asked=(talk.textContent||'');
  if(started)list=list.filter(function(q){return asked.indexOf(q)<0;});`,
  `  var list=cur?area(cur)[3]:GENERAL,asked=[].map.call(talk.querySelectorAll('[data-q]'),function(e){return e.dataset.q;});
  if(started)list=list.filter(function(q){return asked.indexOf(q)<0;});`);
rep(`sug.innerHTML=list.map(function(q){return '<button onclick="say(this.textContent)">'+q+'</button>';}).join('');`,
  `sug.innerHTML=list.map(function(q){return '<button data-say="'+q+'" onclick="say(this.dataset.say)">'+ltr(q)+'</button>';}).join('');`);
rep(`  var m=document.createElement('div');m.className='me';m.textContent=t;talk.appendChild(m);
  drawSug();`, `  var q0=match(t);
  var m=document.createElement('div');m.className='me';m.textContent=t;if(q0)m.dataset.q=q0;talk.appendChild(m);
  drawSug();`);
rep(`    var q=match(t),r=q&&SCRIPT[q];`, `    var q=q0,r=q&&SCRIPT[q];`);
rep(`    w.innerHTML=avatar()+'<div>'+r[1]+'<div class="logged"><span class="ic" style="color:'+COL[k]+'">'+(ICON[k]||'')+'</span><div>'+c[0]+'<small>'+(c[2]?'נשמר ב'+a[1]+' · ':'')+c[1]+'</small></div></div></div>';`,
  `    w.innerHTML=avatar()+'<div>'+ltr(r[1])+'<div class="logged"><span class="ic" style="color:'+COL[k]+'">'+(ICON[k]||'')+'</span><div>'+ltr(c[0])+'<small>'+(c[2]?'נשמר ב'+a[1]+' · ':'')+ltr(c[1])+'</small></div></div></div>';`);
fs.writeFileSync(F, s);
console.log('ok');
