// The third pair of evening questions (24 Nov), as Asaf decided on the review page:
//  - מתוכנן מול בפועל: approved. A porcelain target over the question (cut from the approved Higgsfield render
//    into assets/rf-q3.webp, colour-matched to the ground); the five answers become raised porcelain rows, each
//    with a small round gauge filled with amber light by a quarter per step - empty, a quarter, half, three
//    quarters, full. The chosen row is pressed in with light round its rim. The words are unchanged.
//  - האימון: leaves the evening. "Did you train?" belongs to the day, not to its summary; how it is asked during
//    the day is his call on the proposals. The days that answered it keep the answer - sumFactValue and the
//    fit section still read workoutDone - and the rfFilter branch that only existed for it goes with it.
// usage: node tools/patches/rf-q-planned.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`  var k=q.kind==='mood'?'face':q.id==='bodyFeelings'?'body':q.id==='dayRating'?'star':q.kind==='flow'?'wave':'';
  var pic=k==='star'||k==='wave'?'rf-q2':'rf-q';`,
   `  var k=q.kind==='mood'?'face':q.id==='bodyFeelings'?'body':q.id==='dayRating'?'star':q.kind==='flow'?'wave':q.id==='plannedVsActual'?'target':'';
  var pic=k==='star'||k==='wave'?'rf-q2':k==='target'?'rf-q3':'rf-q';`],
  [`    h+='<div class="rf-ladder">';
    for(i=0;i<q.opts.length;i++)h+='<button class="rf-rung'+(cur===i+1?' on':'')+'" onclick="rfPickLadder('+(i+1)+')">'+_t(q.opts[i])+'</button>';`,
   `    h+='<div class="rf-ladder rfq-plan">';
    for(i=0;i<q.opts.length;i++)h+='<button class="rf-rung'+(cur===i+1?' on':'')+'" onclick="rfPickLadder('+(i+1)+')"><i class="rfq-g" style="--p:'+(i/(q.opts.length-1))+'"></i><span>'+_t(q.opts[i])+'</span></button>';`],
  [`  {id:'plannedVsActual',kind:'ladder',t:''+_t('מתוכנן מול בפועל')+'',s:''+_t('כמה זה דומה לתוכנית')+'',ic:'target',g:'gry',q:''+_t('עד כמה היום שלך היה כמו שתכננת?')+'',opts:RF_PLANNED},
  /* Only ever reaches the board on a day the schedule planned something and
     nothing was recorded - see rfSteps. The text names the type, so it is a
     yes/no about one specific thing rather than a general audit. */
  {id:'workoutDone',kind:'branch',t:''+_t('האימון')+'',s:''+_t('יצא לך?')+'',ic:'dumbbell',g:'grn',q:''+_t('היום היה מתוכנן אימון. יצא לך?')+''},
`,
   `  {id:'plannedVsActual',kind:'ladder',t:''+_t('מתוכנן מול בפועל')+'',s:''+_t('כמה זה דומה לתוכנית')+'',ic:'target',g:'gry',q:''+_t('עד כמה היום שלך היה כמו שתכננת?')+'',opts:RF_PLANNED},
  /* workoutDone is no longer asked in the evening (24 Nov): whether you trained
     is a question for the day. Days that answered it still show it. */
`],
  [`  var hide=sumHiddenIds(),out=[],i;
  /* The workout question is the one step that is not always worth asking. On a
     rest day there is nothing to ask, and when a session is already recorded
     the answer is known - asking anyway would be the app pretending not to
     know something it does. */
  var planned=null,logged=null;
  try{planned=plannedWorkoutFor(todayStr());logged=workoutLoggedOn(todayStr());}catch(e){}
  for(i=0;i<all.length;i++){
    if(hide[all[i].id])continue;
    if(all[i].id==='workoutDone'){
      if(!planned||logged)continue;
      var w={},k;for(k in all[i])w[k]=all[i][k];
      w.q=''+_t('היום היה מתוכנן {what}. יצא לך?',{what:planned.label||_t('אימון')});
      out.push(w);
      continue;
    }
    out.push(all[i]);
  }`,
   `  var hide=sumHiddenIds(),out=[],i;
  for(i=0;i<all.length;i++){
    if(hide[all[i].id])continue;
    out.push(all[i]);
  }`],
  [`  /* no longer asked (24 Nov), but the days that answered it still show it */`,
   `  /* no longer asked (24 Nov), but the days that answered it still show it */
  if(id==='workoutDone')return ''+_t('אימון')+'';`],
  [`html body.mod-endofday .rf-ladder{background:none}
`,
   `html body.mod-endofday .rf-ladder{background:none}
/* the third pair (24 Nov): the target is assets/rf-q3.webp, 300px, drawn at half */
html body.mod-endofday .rfq-target{background-size:150px 150px;background-position:0 0}
html body.mod-endofday .rfq-plan{gap:12px}
html body.mod-endofday .rfq-plan .rf-rung{display:flex;align-items:center;gap:14px;border:none;border-radius:20px;padding:12px 16px;
  background:var(--nu-ground);color:var(--nu-ink);font-weight:600;
  box-shadow:-4px -4px 10px var(--nu-lit),4px 5px 12px var(--nu-shade-soft)}
html body.mod-endofday .rfq-plan .rf-rung.on{color:#8a5a1c;
  box-shadow:inset 3px 4px 8px var(--nu-shade),inset -3px -3px 7px var(--nu-lit),0 0 0 2px rgba(240,169,46,.5),0 0 14px 2px rgba(240,169,46,.25)}
html body.mod-endofday .rfq-g{flex:none;width:30px;height:30px;border-radius:50%;
  background:radial-gradient(circle,var(--nu-ground) 42%,transparent 45%),conic-gradient(rgba(240,169,46,.85) calc(var(--p) * 1turn),rgba(176,168,156,.22) 0);
  box-shadow:inset 1px 2px 3px var(--nu-shade),inset -1px -1px 2px var(--nu-lit)}
html body.mod-endofday .rfq-plan .rf-rung.on .rfq-g{filter:drop-shadow(0 0 4px rgba(240,169,46,.6))}
`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
