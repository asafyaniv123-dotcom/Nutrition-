/* fit-vary for someone who already answered (27 Nov): "same days every week?" is new, and a person
 * whose other training was stored before it existed would never meet it - the setup opens once. So
 * a stored other training with no answer to it opens the setup's other-training questions once,
 * prefilled, and the saved week is placed again around the answers.
 * Run: node tools/patches/fit-vary-old.mjs [file] [--reverse]
 */
import fs from 'node:fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  [String.raw`if(!o.otherDone)out.push('other','oMode','oDays','otherN','days');`,
   String.raw`if(!o.otherDone||fitNeedsMode(o))out.push('other','oMode','oDays','otherN','days');`],
  [String.raw`function asetMaybe(a){
  if(asetSeen(a)){
    if(a==='nutrition'&&nqNeedsUpdate())asetOpen(a,true);`,
   String.raw`/* other training stored before "same days every week?" was asked - asked once, never again */
function fitNeedsMode(o){o=o||fitMe();return !o.oMode&&!o.modeAsked&&(o.other||[]).filter(function(x){return x!=='none';}).length>0;}   // i18n-exempt: a stored key
function asetMaybe(a){
  if(asetSeen(a)){
    if(a==='nutrition'&&nqNeedsUpdate())asetOpen(a,true);
    /* opened first, then marked: the steps are read from the answers as they stand */
    if(a==='fitness'&&fitNeedsMode()){asetOpen(a,true);var _om=fitMe();_om.modeAsked=1;try{localStorage.setItem(FIT_ME_KEY,JSON.stringify(_om));}catch(e){}}`],
  [String.raw`    try{localStorage.setItem(FIT_ME_KEY,JSON.stringify(o));}catch(e){}
    if(o.out&&o.out.length)try{localStorage.setItem(FIT_GOAL_KEY,fitMeStyle());}catch(e){}`,
   String.raw`    try{localStorage.setItem(FIT_ME_KEY,JSON.stringify(o));}catch(e){}
    if(o.out&&o.out.length)try{localStorage.setItem(FIT_GOAL_KEY,fitMeStyle());}catch(e){}
    /* answered again over a saved plan: the week is placed again around the new answers */
    if(_aset.upd&&_aset.steps.indexOf('oMode')>=0){fitWeekRedo();var _fitUpd=1;}`],
  /* ...and she lands on her week, not on "build me a plan" */
  [String.raw`if(a==='fitness'){_fitView=fitMePending().length?'home':'welcome';renderFitness();}else render();`,
   String.raw`if(a==='fitness'){_fitView=fitMePending().length||_fitUpd?'home':'welcome';renderFitness();}else render();`],
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
