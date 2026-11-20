// node tools/patches/kind-to-chat.mjs <index.html> [--undo] - found by the 20 Nov crawl: tapping an EMPTY meal on the nutrition
//   screen (breakfast with nothing logged yet) did nothing a person could see. It opened the food-table panel, and that panel
//   has not been drawn on this screen since the six ways in gave way to the one chat box - so the tap set a mode no screen
//   showed, and a second tap on another meal toggled it off again. An empty meal now opens the chat box for that meal:
//   the meal's name is written in, the cursor waits after it, and what the chat logs from that message is filed under the
//   meal that was tapped unless the model names one itself. --undo restores the file byte for byte.
import fs from 'node:fs';
const F = process.argv[2], undo = process.argv.includes('--undo');
const E = [
  [`  if(!any){_addKind=k;addSetMode('find');return;}`,
   `  if(!any){kindToChat(k);return;}`],
  [`/* One meal, drawn the same way wherever it is asked for. */
function logItemHTML(m){`,
   `/* An empty meal opens the chat for it: the box says which meal, the cursor
   waits after the name, and the next thing the chat logs is filed there. */
var _coachKind='';
function kindToChat(k){
  var b=document.getElementById('co-in');if(!b)return;
  _coachKind=k;
  var l=mealKindLabel(k)+' ',v=b.value;
  for(var i=0;i<MEAL_KINDS.length;i++){var o=mealKindLabel(MEAL_KINDS[i].k)+' ';if(v.indexOf(o)===0){v=v.slice(o.length);break;}}
  b.value=l+v;coachGrow(b);
  b.scrollIntoView({block:'center',behavior:'smooth'});
  b.focus();try{b.setSelectionRange(b.value.length,b.value.length);}catch(e){}
}
/* One meal, drawn the same way wherever it is asked for. */
function logItemHTML(m){`],
  [`        kind:coachMealOk(q.meal),time:fmtTime(),at:Date.now()});
      added.push(q.id);}`,
   `        kind:coachMealOk(q.meal)||_coachKind,time:fmtTime(),at:Date.now()});
      added.push(q.id);}
    _coachKind='';`],
];
let s = fs.readFileSync(F, 'utf8');
for (const [o, n] of undo ? E.slice().reverse() : E) {
  const [a, b] = undo ? [n, o] : [o, n], c = s.split(a).length - 1;
  if (c !== 1) throw new Error(`${undo ? 'undo' : 'apply'}: expected 1 of ${JSON.stringify(a.slice(0, 60))}, found ${c}`);
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(undo ? 'undone' : 'applied');
