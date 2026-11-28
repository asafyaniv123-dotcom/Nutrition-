/* One way to build a plan (Asaf approved the flow map, 28 Nov, point 3).
 * "Build me a plan" in the start sheet and in "my programs" opened the old one-page builder: every
 * question again, no fixed or changing days, and saving it overwrote her answers. Both now open the
 * same plan the setup built - straight to what fits her, "build me another", save - with a way back
 * and a "change my answers" that asks the same questions again, her answers already chosen, and
 * lands on a fresh plan. A stray route to the old view lands there too.
 * Run: node tools/patches/fit-onebuilder.mjs [file] [--reverse]
 */
import fs from 'node:fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const ANS = String.raw`    h+='<button class="fq-later" onclick="fitWAnswers()">'+_t('לשנות את התשובות')+'</button>';
`;
const PAIRS = [
  [String.raw`'<button onclick="fitSheetClose();genProgOpen()"><b>'+esc(_t('בנה לי תוכנית'))+'</b><span>'+esc(_t('האפליקציה בונה אותה בשבילך'))+'</span></button>';`,
   String.raw`'<button onclick="fitSheetClose();fitWOpen(1)"><b>'+esc(_t('בנה לי תוכנית'))+'</b><span>'+esc(_t('האפליקציה בונה אותה בשבילך'))+'</span></button>';`],
  [String.raw`'<button onclick="fitSheetClose();genProgOpen()"><b>'+esc(_t('בנה לי תוכנית'))+'</b><span>'+esc(_t('האפליקציה בונה אותה בשבילך'))+'</span></button>'+`,
   String.raw`'<button onclick="fitSheetClose();fitWOpen(1)"><b>'+esc(_t('בנה לי תוכנית'))+'</b><span>'+esc(_t('האפליקציה בונה אותה בשבילך'))+'</span></button>'+`],
  [String.raw`  else if(_fitView==='genprog')renderFitGenProg();`,
   String.raw`  else if(_fitView==='genprog'){_fitView='welcome';_fitW=_fitW||{built:false,back:1};renderFitWelcome();}   /* one builder (28 Nov) */`],
  [String.raw`function fitWOpen(){
  _fitW={built:false};`,
   String.raw`function fitWOpen(back){
  _fitW={built:false,back:!!back};`],
  [String.raw`function fitWSkip(){_fitW=null;_fitView='start';renderFitness();}`,
   String.raw`function fitWSkip(){_fitW=null;_fitView='start';renderFitness();}
/* every answer the plan stands on, asked again with what she said already chosen, and then a fresh plan (28 Nov) */
function fitWAnswers(){asetOpen('fitness',{steps:['other','oMode','oDays','otherN','days','minutes','exp','equip','limits']});   // i18n-exempt: step keys
  if(_aset){_aset.dSet=1;_aset.toPlan=1;}}`],
  [String.raw`  /* NO STRENGTH AT ALL (27 Nov): the other training is the week, and there is no plan to build */`,
   String.raw`  /* came here on purpose, from a button: the way back is a button too */
  if(_fitW.back)h+='<div style="margin-bottom:12px"><button class="fit-back" onclick="_fitW=null;_fitView=\'home\';renderFitness()">&#8249; '+_t('חזרה')+'</button></div>';
  /* NO STRENGTH AT ALL (27 Nov): the other training is the week, and there is no plan to build */`],
  [String.raw`    h+='<button class="fq-later" onclick="fitWSkip()">'+_t('אימון בלי תוכנית')+'</button>';
    return void(document.getElementById('content').innerHTML=h+'</div>');
  }
  /* ── THE PART THAT WAS MISSING`,
   String.raw`    h+='<button class="fq-later" onclick="fitWSkip()">'+_t('אימון בלי תוכנית')+'</button>';
` + ANS + String.raw`    return void(document.getElementById('content').innerHTML=h+'</div>');
  }
  /* ── THE PART THAT WAS MISSING`],
  [String.raw`    h+='<button class="fq-later" onclick="fitWSkip()">'+_t('אימון בלי תוכנית')+'</button>';
    return void(document.getElementById('content').innerHTML=h+'</div>');
  }

  /* ── and the week ──`,
   String.raw`    h+='<button class="fq-later" onclick="fitWSkip()">'+_t('אימון בלי תוכנית')+'</button>';
` + ANS + String.raw`    return void(document.getElementById('content').innerHTML=h+'</div>');
  }

  /* ── and the week ──`],
  [String.raw`_aset={a:a,upd:!!upd,steps:asetSteps(a,upd),i:0,`,
   String.raw`_aset={a:a,upd:!!upd,steps:(upd&&upd.steps)||asetSteps(a,upd),i:0,`],
  [String.raw`  asetClose();
  if(a==='fitness'){_fitView=fitMePending().length||_fitUpd?'home':'welcome';renderFitness();}else render();`,
   String.raw`  var _toPlan=_aset.toPlan;asetClose();
  if(a==='fitness'&&_toPlan){_fitW={built:true,back:1};_fitView='welcome';renderFitness();window.scrollTo(0,0);}
  else if(a==='fitness'){_fitView=fitMePending().length||_fitUpd?'home':'welcome';renderFitness();}else render();`],
];

let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 200)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
