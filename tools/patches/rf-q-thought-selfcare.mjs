// The eighth pair (25 Nov), as Asaf approved it on the review page, inner parts included:
//  - המחשבה שחזרה: a porcelain loop that returns to itself with light along its groove; under the well a new
//    "what kind of thought was it?" - kept me busy, moved me, worried me, just stuck - one, optional, stored as
//    thoughtTone and named above the thought in the summary.
//  - משהו בשבילך: a porcelain cup with steam of amber light. The tiles were already built; after yes, "what did you
//    do?" in the page's serif, the nine answers as pebbles with icons (an open door is new), and one pressed slot
//    "or in your own words" under them - the same order as the other yes/no question.
// Loop and cup are cut from the two approved renders into assets/rf-q8.webp (500 + 240 wide, 200 high).
// usage: node tools/patches/rf-q-thought-selfcare.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`var RFQ_TAGS={plannedMoved:RF_MOVED,impactOn:RF_IMPACT_ON,proudWhere:RF_PROUD_WHERE};`,
   `var RF_THOUGHT_TONE=['העסיקה אותי','ריגשה אותי','הדאיגה אותי','פשוט נתקעה'];
var RFQ_TAGS={plannedMoved:RF_MOVED,impactOn:RF_IMPACT_ON,proudWhere:RF_PROUD_WHERE,thoughtTone:RF_THOUGHT_TONE};`],
  [`  suncloud:'`,
   `  door:'<path d="M5.6 20.4V4.6a1 1 0 0 1 1-1h8.2a1 1 0 0 1 1 1v15.8"/><path d="M3.6 20.4h16.8"/><path d="M15.8 5.4 19 4v14.8l-3.2 1.6"/><circle cx="12.6" cy="12.4" r=".9" fill="currentColor" stroke="none"/>',
  suncloud:'`],
  [`'רעש':'sound','דאגות':'cloud'};`,
   `'רעש':'sound','דאגות':'cloud','לצאת החוצה':'door','לדבר עם מישהו':'bubble','לישון מספיק':'moon','לאכול משהו טוב':'bowl','כלום מיוחד':'dot'};`],
  [`q.id==='procrastinated'?'hourglass':q.id==='influentialPerson'?'pair':'';`,
   `q.id==='procrastinated'?'hourglass':q.id==='influentialPerson'?'pair':q.id==='recurringThought'?'loop':q.id==='selfCare'?'cup':'';`],
  [`k==='hourglass'||k==='pair'?'rf-q7':'rf-q';`,
   `k==='hourglass'||k==='pair'?'rf-q7':k==='loop'||k==='cup'?'rf-q8':'rf-q';`],
  [`    if(q.id==='proudOf')h+=rfqTagsHTML('proudWhere',false,_t('איפה זה היה?'));`,
   `    if(q.id==='proudOf')h+=rfqTagsHTML('proudWhere',false,_t('איפה זה היה?'));
    if(q.id==='recurringThought')h+=rfqTagsHTML('thoughtTone',false,_t('איזו מחשבה זו הייתה?'));`],
  [`    } else if(cur===true&&q.follow){
      h+='<div class="rf-sub" style="margin-top:26px;font-weight:700;color:var(--ink);font-size:15px">'+q.follow+'</div>';
      h+='<div style="margin-top:14px">'+rfChipsHTML(q.listId,q.opts,rfArr(q.listId))+'</div>';
      h+='<textarea class="rf-in" id="rf-note" style="min-height:64px;margin-top:16px" placeholder="'+(q.ph||'')+'">'+(rfVal(q.note)?esc(rfVal(q.note)):'')+'</textarea>';
    }`,
   `    } else if(cur===true&&q.follow){
      h+='<div class="rfq-tl rfq-tl2">'+q.follow+'</div>';
      h+=rfChipsHTML(q.listId,q.opts,rfArr(q.listId),true);
      h+='<textarea class="rf-in rfq-short rfq-one" id="rf-note" placeholder="'+(q.ph||'')+'">'+(rfVal(q.note)?esc(rfVal(q.note)):'')+'</textarea>';
    }`],
  [`  var tg=id==='impactfulMoment'?sum.impactOn:id==='proudOf'?(sum.proudWhere?[sum.proudWhere]:[]):null;`,
   `  var tg=id==='impactfulMoment'?sum.impactOn:id==='proudOf'?(sum.proudWhere?[sum.proudWhere]:[]):id==='recurringThought'?(sum.thoughtTone?[sum.thoughtTone]:[]):null;`],
  [`html body.mod-endofday .rf-in.rfq-one{`,
   `/* the eighth pair (25 Nov): assets/rf-q8.webp, a 500px loop and a 240px cup, 200 high, drawn at 0.42 */
html body.mod-endofday .rfq-loop,html body.mod-endofday .rfq-cup{height:84px;background-size:311px 84px;
  -webkit-mask:radial-gradient(farthest-side,#000 64%,transparent 100%);mask:radial-gradient(farthest-side,#000 64%,transparent 100%)}
html body.mod-endofday .rfq-loop{width:210px;background-position:0 0}
html body.mod-endofday .rfq-cup{width:101px;background-position:-210px 0}
html body.mod-endofday .rfq-pebbles+.rf-in.rfq-one{margin-top:18px}
html body.mod-endofday .rf-in.rfq-one{`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
