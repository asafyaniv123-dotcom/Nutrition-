/* Asaf on the phone, 28 Nov:
 *  1. "I chose 0 - it should not show me this page": with no strength, the setup still asked how long
 *     a workout is, how experienced, where, and what hurts - four questions about a plan that will not
 *     exist. They are skipped when strength is 0, in the overlay and in the questions card.
 *  2. "build me another one makes exactly the same one": it went back to the summary, and the next
 *     build ran the same deterministic pick. Now it rebuilds on the spot, and every exercise the plans
 *     before it used goes to the back of its queue - still there if nothing else fits.
 * Run: node tools/patches/fit-zero.mjs [file] [--reverse]
 */
import fs from 'node:fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  [String.raw`if(k==='preg')return t.sex!=='f';`,
   String.raw`if(asetNoStrength()&&FIT_STRENGTH_ONLY.indexOf(k)>=0)return true;if(k==='preg')return t.sex!=='f';`],
  [String.raw`function asetCnt(x,c){`,
   String.raw`/* the questions only a strength plan needs, and the answer that means there will be none */
var FIT_STRENGTH_ONLY=['minutes','exp','equip','limits'];   // i18n-exempt: step keys
function asetNoStrength(){var t=_aset&&_aset.t;return !!(t&&_aset.a==='fitness'&&_aset.dSet&&asetOthN()&&t.days===asetOthN());}
function asetCnt(x,c){`],
  [String.raw`  for(i=0;i<FIT_ME_ORDER.length;i++)if(!fitMeHas(FIT_ME_ORDER[i]))out.push(FIT_ME_ORDER[i]);`,
   String.raw`  var none=!fitStrengthDays();
  for(i=0;i<FIT_ME_ORDER.length;i++)if(!fitMeHas(FIT_ME_ORDER[i])&&!(none&&FIT_STRENGTH_ONLY.indexOf(FIT_ME_ORDER[i])>=0))out.push(FIT_ME_ORDER[i]);`],
  // another plan: rebuilt in place, the last plans' exercises to the back of the queue
  [String.raw`function fitWAgain(){if(_fitW){_fitW.built=false;_fitW.plan=null;renderFitness();}}`,
   String.raw`function fitWAgain(){if(!_fitW)return;var A=_fitW.avoid=_fitW.avoid||[];
  ((_fitW.plan&&_fitW.plan.exercises)||[]).forEach(function(x){if(A.indexOf(x.name)<0)A.push(x.name);});
  _fitW.plan=null;_fitW.built=true;renderFitness();window.scrollTo(0,0);}`],
  [String.raw`  var p=genProgram({days:fitStrengthDays(me),exp:me.exp||'new',minutes:+me.minutes||60,`,
   String.raw`  var p=genProgram({avoid:(_fitW&&_fitW.avoid)||[],days:fitStrengthDays(me),exp:me.exp||'new',minutes:+me.minutes||60,`],
  [String.raw`    var rows=genPick({muscles:ms,equip:equip,sets:sets,maxPerMuscle:sp.perMuscle}),day=[];`,
   String.raw`    var rows=genPick({muscles:ms,equip:equip,sets:sets,maxPerMuscle:sp.perMuscle,avoid:opt.avoid}),day=[];`],
  [String.raw`    cands.sort(function(a,b){return pos(a)-pos(b);});`,
   String.raw`    var av=opt.avoid||[];
    cands.sort(function(a,b){return (av.indexOf(a.n)>=0)-(av.indexOf(b.n)>=0)||pos(a)-pos(b);});`],
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
