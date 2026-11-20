// node tools/patches/gen-mode.mjs <index.html> [--undo] - Asaf, 20 Nov: "I tap One-tap workout and it goes straight into a logged
//   workout - where is the choice?" The choice was there, but at the END of three questions, worded as two ways to finish. Now it is
//   the FIRST question: logged or on the clock, two big doors, before time, muscles and place - and the last question ends in the one
//   button that builds what was chosen. Back from the first of the three returns to the choice; back from the choice leaves.
import fs from 'node:fs';
const F = process.argv[2], undo = process.argv.includes('--undo');
const E = [
  [`_gen={def:d,on:on,equip:genEquip(),emphasis:'',min:mn,step:0};`,
   `_gen={def:d,on:on,equip:genEquip(),emphasis:'',min:mn,step:0,mode:''};`],
  [`  if(d<0&&_gen.step===0){_gen=null;_fitView='home';renderFitness();return;}`,
   `  if(d<0&&_gen.step===0&&_gen.mode){_gen.mode='';renderFitness();return;}
  if(d<0&&_gen.step===0){_gen=null;_fitView='home';renderFitness();return;}`],
  [`function genSteps(){`,
   `/* THE FIRST QUESTION: logged, or on the clock. 'log' | 'gt' */
function genMode(m){if(!_gen)return;_gen.mode=m;_gen.step=0;renderFitness();}
function genSteps(){`],
  [`  if(g.step>=ns)g.step=ns-1;`,
   `  if(g.step>=ns)g.step=ns-1;
  if(!g.mode){
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">';
    h+='<div class="gn-st">'+_t('שאלה {a} מתוך {b}',{a:1,b:ns+1})+'</div>';
    h+='<button class="fit-back" onclick="genStep(-1)">&#8249; '+_t('חזרה')+'</button></div>';
    h+='<div class="gn-c"><div class="gn-q">'+_t('איך להתאמן הפעם?')+'</div><div class="gn-two">'+
       '<button class="gn-go" onclick="genMode(\\'log\\')"><b>'+_t('אימון מתועד')+'</b>'+
       '<span>'+_t('סטים, משקל וחזרות, כל סט בתורו')+'</span></button>'+
       '<button class="gn-go" onclick="genMode(\\'gt\\')"><b>'+_t('אימון על זמן')+'</b>'+
       '<span>'+_t('עבודה ומנוחה על שעון, עם ההדגמה')+'</span></button></div></div>';
    return void(document.getElementById('content').innerHTML=h+'</div>');
  }`],
  [`  h+='<div class="gn-st">'+_t('שאלה {a} מתוך {b}',{a:g.step+1,b:ns})+'</div>';`,
   `  h+='<div class="gn-st">'+_t('שאלה {a} מתוך {b}',{a:g.step+2,b:ns+1})+'</div>';`],
  [`    h+='<div class="gn-two"><button class="gn-go" onclick="genBuild()"><b>'+_t('אימון מתועד')+'</b>'+
       '<span>'+_t('סטים, משקל וחזרות, כל סט בתורו')+'</span></button>'+
       '<button class="gn-go" onclick="genBuild(1)"><b>'+_t('אימון על זמן')+'</b>'+
       '<span>'+_t('עבודה ומנוחה על שעון, עם ההדגמה')+'</span></button></div>';`,
   `    /* the one button that builds what the first question chose */
    h+='<div class="gn-two">'+(g.mode==='gt'
       ?'<button class="gn-go" onclick="genBuild(1)"><b>'+_t('אימון על זמן')+'</b><span>'+_t('עבודה ומנוחה על שעון, עם ההדגמה')+'</span></button>'
       :'<button class="gn-go" onclick="genBuild()"><b>'+_t('אימון מתועד')+'</b><span>'+_t('סטים, משקל וחזרות, כל סט בתורו')+'</span></button>')+'</div>';`],
];
let s = fs.readFileSync(F, 'utf8');
for (const [o, n] of undo ? E.slice().reverse() : E) {
  const [a, b] = undo ? [n, o] : [o, n], c = s.split(a).length - 1;
  if (c !== 1) throw new Error(`${undo ? 'undo' : 'apply'}: expected 1 of ${JSON.stringify(a.slice(0, 70))}, found ${c}`);
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(undo ? `undone ${E.length}` : `applied ${E.length}`);
