/* Two paces that are the same pace (a tester, 26 Nov 2026, on her first
 * evening): "in nutrition, losing weight has three pace options, and both
 * fast and regular say 0.3 kg a week". Two causes, both a choice between two
 * identical answers - the bug CLAUDE.md names rule 5 for:
 *  - ROUNDING, which is what she hit: the paces lose in the ratio 2:3:4, and
 *    a tenth of a kilo cannot tell 0.26 from 0.35. The list now says the
 *    hundredths (fmtWeight already allows two decimals).
 *  - THE SAFE FLOOR (1,200 kcal for a woman, 1,500 for a man): for a small
 *    body two cuts are raised to the same calories and really do lose the
 *    same. A pace that equals a gentler one is not offered, one line says
 *    why, and a choice made before is shown as the pace it equals.
 * Pairs are [anchor, replacement], each applied exactly once.
 *   node tools/patches/pace-floor.mjs [file]            apply
 *   node tools/patches/pace-floor.mjs [file] --reverse  undo */
import fs from 'fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  [
    String.raw`function nqPaceText(v){return v==='gentle'?_t('קצב עדין'):v==='fast'?_t('קצב מהיר'):_t('קצב רגיל');}
`,
    String.raw`function nqPaceText(v){return v==='gentle'?_t('קצב עדין'):v==='fast'?_t('קצב מהיר'):_t('קצב רגיל');}
/* The paces this body can actually tell apart. Below the safe floor every
   cut is raised to the same calories, so a faster pace that loses no more
   than a gentler one is not offered: rep maps each pace to the one it
   equals, and cut says one was dropped. Two paces are "the same" when the
   reader would see the same number, which is the question rule 5 asks. */
function nqPaceSet(inp){
  var show=[],rep={},cut=false,prev=null;
  PACES.forEach(function(pv){
    var r=inp?nutriCalc(Object.assign({},inp,{goal:'lose',pace:pv})):null,k=r&&r.kgWeek>0?nqPaceKg(r.kgWeek):null;
    if(prev&&k!==null&&k===prev.k){rep[pv]=prev.pv;cut=true;}
    else{show.push(pv);rep[pv]=pv;prev={pv:pv,k:k,r:r};}
  });
  return {show:show,rep:rep,cut:cut,floor:FLOOR_KCAL[inp&&inp.sex]||FLOOR_KCAL.f};
}
function nqPaceKg(kg){return fmtWeight(APP_UNITS==='imperial'?kg:Math.round(kg*100)/100);}
function nqPaceCutText(ps){return _t('קצב מהיר יותר היה דורש פחות מ־{k} קלוריות ביום, מתחת למינימום הבטוח, ולכן הוא לא מוצע.',{k:ps.floor});}
`,
  ],
  [
    String.raw`    PACES.forEach(function(pv){var pr=nutriCalc(Object.assign(nqInputT(t),{goal:'lose',pace:pv}));
      body+=asetChoice('pace',pv,nqPaceText(pv),pr&&pr.kgWeek>0?esc(_t('בערך {w} בשבוע',{w:nqKgTxt(pr.kgWeek)})):'');});}`,
    String.raw`    var ps=nqPaceSet(nqInputT(t));
    if(t.pace&&ps.rep[t.pace]&&ps.rep[t.pace]!==t.pace)t.pace=ps.rep[t.pace];
    if(ps.cut)why=esc(nqPaceCutText(ps));
    ps.show.forEach(function(pv){var pr=nutriCalc(Object.assign(nqInputT(t),{goal:'lose',pace:pv}));
      body+=asetChoice('pace',pv,nqPaceText(pv),pr&&pr.kgWeek>0?esc(_t('בערך {w} בשבוע',{w:nqPaceKg(pr.kgWeek)})):'');});}`,
  ],
  [
    String.raw`    PACES.forEach(function(pv){
      h+='<button class="wg-chip'+(nqPaceOf(p)===pv?' on':'')+'" onclick="profSet(\u0027pace\u0027,\u0027'+pv+'\u0027)">'+nqPaceText(pv)+'</button>';});
    h+='</div>';`,
    String.raw`    var ps=nqPaceSet(nutriInput(p)),pon=ps.rep[nqPaceOf(p)]||nqPaceOf(p);
    ps.show.forEach(function(pv){
      h+='<button class="wg-chip'+(pon===pv?' on':'')+'" onclick="profSet(\u0027pace\u0027,\u0027'+pv+'\u0027)">'+nqPaceText(pv)+'</button>';});
    h+='</div>';
    if(ps.cut)h+='<div class="pf-goaln">'+esc(nqPaceCutText(ps))+'</div>';`,
  ],
];

let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 120)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
