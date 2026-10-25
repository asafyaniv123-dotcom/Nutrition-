/* chat prototype, round 4 (Asaf: "when you go back to the general chat, the
 * chat sort of resets and Mip comes back").
 * Each area keeps its own conversation, and so does the general chat. Going
 * into an area hands the screen to that area's thread (its sign, if nothing
 * has been said there yet); going back hands it to the general one - Mip
 * and the greeting if nothing has been said there - and the area's talk
 * waits in the area for the next time. Nothing is lost; nothing from one
 * place shows in another. The threads cross-fade instead of cutting. */
import fs from 'fs';
const F = 'review/chat-proto/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`.talk{position:absolute;`, `.talk{transition:opacity .3s ease}
.talk.out{opacity:0}
.talk{position:absolute;`);
rep(`  if(started)note('מעכשיו מדברים על '+a[1]+'.');`, `  thread(k);`);
rep(`  if(started&&!silent)note('חזרנו לשיחה הכללית.');drawSug();`, `  if(!silent)thread('');drawSug();`);
rep(`function note(t){`, `/* one conversation per place: '' is the general chat */
var THREADS={};
function thread(k){
  var from=talk.dataset.k||'';
  THREADS[from]=talk.innerHTML;
  talk.classList.add('out');
  setTimeout(function(){
    talk.innerHTML=THREADS[k]||'';talk.dataset.k=k;
    started=!!THREADS[k];empty.classList.toggle('gone',started);drawSug();
    talk.classList.remove('out');talk.scrollTop=1e5;
  },started||THREADS[k]?300:0);
}
function note(t){`);
rep(`function reset(){talk.innerHTML='';started=false;`, `function reset(){THREADS={};talk.dataset.k='';talk.innerHTML='';started=false;`);
fs.writeFileSync(F, s);
console.log('ok');
