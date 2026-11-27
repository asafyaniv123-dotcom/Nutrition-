/* The goal is asked once (Asaf approved the review page, 27 Nov). The setup asks what she wants to
 * happen - seven outcomes in her words - and then the bottom of כושר asked again, with four
 * technical chips (כוח / מסת שריר / סיבולת שריר / בריאות כללית) that did not obviously answer
 * the same question. Once she has answered, the card says her answer in one line, with the rep
 * range it leads to, and "לשנות" opens her own seven outcomes again, not the four.
 * Someone who has not answered still gets the four chips, unchanged.
 * Run: node tools/patches/fit-goal-once.mjs [file] [--reverse]
 */
import fs from 'node:fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  [String.raw`  var fg=fitGoal();
  h+='<div class="fg"><div class="fg-hd"><span class="fg-k">'+_t('המטרה שלי')+'</span>'+`,
   String.raw`  var fg=fitGoal(),fo=fitMe().out||[];
  if(fo.length&&!_fitGoalOpen){
    h+='<div class="fg"><div class="fg-hd"><span class="fg-k">'+_t('המטרה שלי')+'</span>'+
       '<span class="fg-r">'+nfmt(fg.lo)+'&ndash;'+nfmt(fg.hi)+' '+_t('חזרות',{n:fg.hi})+'</span></div>';
    h+='<div class="fg-one"><b>'+esc(FIT_OUT.filter(function(x){return fo.indexOf(x[0])>=0;}).map(function(x){return _t(x[1]);}).join(' · '))+'</b>'+
       '<button class="dr-later" onclick="_fitGoalOpen=true;renderFitness()">'+_t('לשנות')+'</button></div></div>';
  }else if(fo.length){
    h+='<div class="fg"><div class="fg-hd"><span class="fg-k">'+_t('המטרה שלי')+'</span></div>';
    h+='<div class="fq-opts">';
    for(var oi=0;oi<FIT_OUT.length;oi++)
      h+='<button class="fg-b fq-o'+(fo.indexOf(FIT_OUT[oi][0])>=0?' on':'')+'" onclick="fitMeOut(&quot;'+FIT_OUT[oi][0]+'&quot;)">'+esc(_t(FIT_OUT[oi][1]))+
         '<span class="fq-os">'+esc(_t(FIT_OUT[oi][2]))+'</span></button>';
    h+='</div><button class="gn-go" style="margin-top:12px" onclick="_fitGoalOpen=false;renderFitness()">'+_t('המשך')+'</button></div>';
  }else{
  h+='<div class="fg"><div class="fg-hd"><span class="fg-k">'+_t('המטרה שלי')+'</span>'+`],
  [String.raw`  h+='</div><div class="fg-n">'+esc(fg.n)+'</div></div>';

  h+='</div>';
  document.getElementById('content').innerHTML=h;`,
   String.raw`  h+='</div><div class="fg-n">'+esc(fg.n)+'</div></div>';
  }

  h+='</div>';
  document.getElementById('content').innerHTML=h;`],
  [String.raw`function fitGoal(){`,
   String.raw`/* the goal card on the hub, folded to her answer until she asks to change it */
var _fitGoalOpen=false;
function fitGoal(){`],
  [String.raw`.fg-n{font-size:10.5px;color:var(--muted);line-height:1.6;margin-top:9px}`,
   String.raw`.fg-n{font-size:10.5px;color:var(--muted);line-height:1.6;margin-top:9px}
.fg-one{display:flex;align-items:center;justify-content:space-between;gap:10px}
.fg-one b{font-size:14px;font-weight:700;color:var(--nu-ink,#4a453f);min-width:0}
.fg-one .dr-later{flex:none}`],
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
