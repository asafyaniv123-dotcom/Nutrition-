/* Every area card's buttons do what they say (Asaf, 23 Oct), and fitness
 * stops greeting twice.
 *  - The action runs INSIDE the tap, not after a delay: iOS opens the
 *    keyboard for focus() and the photo picker for a file input's click()
 *    only from within the user's own gesture.
 *  - nutrition: write a meal (the coach box) / the four questions (their card)
 *  - hobbies: the add-a-hobby row; planning: the box that takes a sentence;
 *    closet: the photo picker of the first row. Insights' topics are already
 *    the whole screen, so its card simply opens onto them.
 *  - fitness: someone who has met the area card has already been asked
 *    whether they want a plan; the "welcome to fitness" greeting behind it
 *    said the same thing again. Questions start from the card's own button. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

rep(`  w.querySelector('.aint-go').onclick=function(){close();if(I.go2)setTimeout(I.go2,250);};
  w.querySelector('.aint-later').onclick=function(){close();if(I.later2)setTimeout(I.later2,250);};`,
`  w.querySelector('.aint-go').onclick=function(){close();if(I.go2)I.go2();};
  w.querySelector('.aint-later').onclick=function(){close();if(I.later2)I.later2();};`);

rep(`    go:_t('לרשום ארוחה ראשונה'),later:_t('רוצה יעדים אישיים? 4 שאלות קצרות')};`,
`    go:_t('לרשום ארוחה ראשונה'),later:_t('רוצה יעדים אישיים? 4 שאלות קצרות'),
    go2:function(){var e=document.getElementById('co-in');if(e){e.scrollIntoView({block:'center'});e.focus();}},
    later2:function(){var e=document.querySelector('#content .fq');if(e)e.scrollIntoView({behavior:'smooth',block:'start'});}};`);
rep(`    go:_t('להוסיף תחביב ראשון'),later:_t('אחר כך')};`,
`    go:_t('להוסיף תחביב ראשון'),later:_t('אחר כך'),
    go2:function(){if(!_hbAdding)hbAddOpen();}};`);
rep(`    go:_t('לתכנן את מחר'),later:_t('אחר כך')};`,
`    go:_t('לתכנן את מחר'),later:_t('אחר כך'),
    go2:function(){var e=document.getElementById('psay-in');if(e){e.scrollIntoView({block:'center'});e.focus();}}};`);
rep(`    go:_t('לצלם בגד ראשון'),later:_t('אחר כך')};`,
`    go:_t('לצלם בגד ראשון'),later:_t('אחר כך'),
    go2:function(){var e=document.querySelector('#content input[type=file][onchange*="closetAdd"]');if(e)e.click();}};`);

/* fitness: the greeting is for someone who never saw the card */
rep(`  if(_fitView==='home'&&fitMePending().length&&!fqOffToday('fitness'))_fitView='welcome';`,
`  if(_fitView==='home'&&fitMePending().length&&!fqOffToday('fitness')&&!fitCardMet())_fitView='welcome';`);
rep(`function fitWNext(){`, `/* met the area card and has not started the questions: the card already
   asked about a plan, so the area opens as itself and the questions wait
   for its button (or the hub's "build me a plan") */
function fitCardMet(){
  if(fitMe().started)return false;
  try{return localStorage.getItem(FIRST_RUN_KEY)==='1'&&!!(JSON.parse(localStorage.getItem(AREA_INTRO_KEY)||'{}')||{}).fitness;}
  catch(e){return false;}
}
function fitWNext(){`);
fs.writeFileSync(F, s);
console.log('patched');
/* second pass, measured: the greeting was drawn BEFORE the card appeared, so
   closing the card by its backdrop uncovered it. A card closed without an
   answer now hands the area back to itself. */
{ let t = fs.readFileSync(F, 'utf8');
  const r2 = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
    if (t.split(a).length !== 2) { console.log('ANCHOR2: ' + a.slice(0, 70)); process.exit(1); } t = t.replace(a, () => b); };
  r2(`  w.addEventListener('click',function(e){if(e.target===w)close();});`,
     `  w.addEventListener('click',function(e){if(e.target===w){close();if(I.dismiss)I.dismiss();}});`);
  r2(`    later2:function(){_fitView='welcome';fitWNext();}};`,
     `    later2:function(){_fitView='welcome';fitWNext();},
    dismiss:function(){if(_fitView==='welcome'&&fitCardMet()){_fitView='home';renderFitness();}}};`);
  fs.writeFileSync(F, t); console.log('patched dismiss'); }
