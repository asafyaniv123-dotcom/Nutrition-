// Approved on the fifth review page (25 Nov, "הכל מאושר"):
//  - מתוכנן מול בפועל, part two: an answer of 1-3 no longer moves on. Under the pressed row a porcelain path with a
//    pebble moved off it; "what moved the day?" as nine pebbles (several allowed, stored raw as plannedMoved); and
//    "what will you do differently tomorrow?", optional, as plannedDifferently. The summary names the pebbles
//    beside the answer and prints the sentence with the other thoughts.
//  - הרגע שהשפיע: a porcelain pebble dropped into still water; under the well "what did it change?" - how I felt,
//    what I thought, the rest of the day (several allowed, impactOn).
//  - גאווה: a porcelain medal; under the well "where was it?" - five pebbles, one allowed (proudWhere).
// Tag pebbles never re-render, so a sentence being written stays where it is. All three lists are data: stored as
// picked, drawn through labelOf. 'בבית' already means "Home" elsewhere, so the pride one carries a context.
// Path, ripple and medal are cut from the three approved renders into assets/rf-q5.webp (400x220 path, 640x260
// ripple, 320x290 medal, stacked), colour-matched to the ground.
// usage: node tools/patches/rf-q-moved-moment-pride.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`var RF_TAKE_KIND=['מחשבה','כוונה','צעד קטן'];
`,
   `var RF_TAKE_KIND=['מחשבה','כוונה','צעד קטן'];
// what moved a day off its plan; what a moment changed; where a pride was
var RF_MOVED=['משהו לא צפוי','עייפות','תכננתי יותר מדי','עבודה','אנשים אחרים','בריאות','מצב רוח','דחיתי','משהו אחר'];
var RF_IMPACT_ON=['את ההרגשה','את המחשבות','את המשך היום'];
var RF_PROUD_WHERE=['בעבודה','בבית','בגוף','עם אנשים','עם עצמי'];
var RFQ_TAGS={plannedMoved:RF_MOVED,impactOn:RF_IMPACT_ON,proudWhere:RF_PROUD_WHERE};
`],
  [`'שקט':'שקט|רגש','מעורב':'מעורב|רגש'};`,
   `'שקט':'שקט|רגש','מעורב':'מעורב|רגש','בבית':'בבית|גאווה'};`],
  [`q.id==='takeawayForTomorrow'?'sunrise':q.id==='grateful'?'hands':'';
  var pic=k==='star'||k==='wave'?'rf-q2':k==='target'?'rf-q3':k==='sunrise'||k==='hands'?'rf-q4':'rf-q';`,
   `q.id==='takeawayForTomorrow'?'sunrise':q.id==='grateful'?'hands':q.id==='impactfulMoment'?'ripple':q.id==='proudOf'?'medal':'';
  var pic=k==='star'||k==='wave'?'rf-q2':k==='target'?'rf-q3':k==='sunrise'||k==='hands'?'rf-q4':k==='ripple'||k==='medal'?'rf-q5':'rf-q';`],
  [`<span>'+_t(q.opts[i])+'</span></button>';
    h+='</div>';
  }`,
   `<span>'+_t(q.opts[i])+'</span></button>';
    h+='</div>';
    /* the second part, only for a day that did not go to plan */
    if(cur&&cur<=3){
      h+='<div class="rfq-hero rfq-path" style="background-image:url('+liveBase()+'assets/rf-q5.webp)"></div>';
      h+=rfqTagsHTML('plannedMoved',true,_t('מה הזיז את היום?'));
      h+='<div class="rfq-tl rfq-tl2">'+_t('ומה תעשה אחרת מחר?')+'</div>';
      h+='<textarea class="rf-in rfq-short" id="rf-note" placeholder="'+_t('לא חובה. משפט אחד.')+'">'+esc(rfVal('plannedDifferently')||'')+'</textarea>';
      h+='<button onclick="rfNext()" class="rf-next">'+_t('המשך')+'</button>';
    }
  }`],
  [`    if(q.id==='takeawayForTomorrow')h+=rfqKindHTML();`,
   `    if(q.id==='takeawayForTomorrow')h+=rfqKindHTML();
    if(q.id==='impactfulMoment')h+=rfqTagsHTML('impactOn',true,_t('מה הוא שינה?'));
    if(q.id==='proudOf')h+=rfqTagsHTML('proudWhere',false,_t('איפה זה היה?'));`],
  [`/* no re-render: the sentence being written stays where it is */
function rfqKind(i){`,
   `/* pebbles under a question, from RFQ_TAGS; several or one */
function rfqTagsHTML(field,multi,title){
  var o=RFQ_TAGS[field],v=rfVal(field),i,on,h='<div class="rfq-tags" data-f="'+field+'"><div class="rfq-tl">'+title+'</div>';
  if(multi)h+='<div class="rfq-ts">'+_t('אפשר לבחור יותר מאחד.')+'</div>';
  h+='<div class="rfq-kinds">';
  for(i=0;i<o.length;i++){
    on=multi?(Array.isArray(v)&&v.indexOf(o[i])>=0):v===o[i];
    h+='<button class="rfq-kind'+(on?' on':'')+'" onclick="rfqTag(&quot;'+field+'&quot;,'+i+','+(multi?1:0)+')">'+labelOf(o[i])+'</button>';
  }
  return h+'</div></div>';
}
function rfqTag(field,i,multi){
  var o=RFQ_TAGS[field],x=o[i],v=rfVal(field),p={},j,on;
  if(multi){v=Array.isArray(v)?v.slice():[];j=v.indexOf(x);if(j>=0)v.splice(j,1);else v.push(x);p[field]=v;}
  else p[field]=v===x?'':x;
  rfSave(p);
  var b=document.querySelectorAll('.rfq-tags[data-f="'+field+'"] .rfq-kind');
  for(j=0;j<b.length;j++){on=multi?p[field].indexOf(o[j])>=0:p[field]===o[j];b[j].className='rfq-kind'+(on?' on':'');}
}
/* no re-render: the sentence being written stays where it is */
function rfqKind(i){`],
  [`function rfPickLadder(n){
  rfSave({plannedVsActual:n});
  var b=document.querySelectorAll('.rf-rung');
  for(var i=0;i<b.length;i++)b[i].className='rf-rung'+(i===n-1?' on':'');
  rfAutoAdvance();`,
   `function rfPickLadder(n){
  rfCommitText();
  rfSave({plannedVsActual:n});
  /* a day that did not go to plan is asked what moved it, on the same screen */
  if(n<=3){renderReflectStep();return;}
  var b=document.querySelectorAll('.rf-rung');
  for(var i=0;i<b.length;i++)b[i].className='rf-rung'+(i===n-1?' on':'');
  rfAutoAdvance();`],
  [`  } else if(q.kind==='chipsNote'||q.kind==='branch'){
    el=document.getElementById('rf-note');`,
   `  } else if(q.kind==='ladder'){
    el=document.getElementById('rf-note');
    if(el)rfSave({plannedDifferently:el.value.trim()});
  } else if(q.kind==='chipsNote'||q.kind==='branch'){
    el=document.getElementById('rf-note');`],
  [`  if(id==='plannedVsActual')return RF_PLANNED[v-1]?_t(RF_PLANNED[v-1]):'';`,
   `  if(id==='plannedVsActual'){
    if(!RF_PLANNED[v-1])return '';
    var mv=v<=3&&Array.isArray(sum.plannedMoved)?sum.plannedMoved:[];
    return _t(RF_PLANNED[v-1])+(mv.length?'<i> · '+mv.map(function(x){return labelOf(x);}).join(' · ')+'</i>':'');
  }`],
  [`  {k:'think',   ids:['quote','recurringThought','differently','takeawayForTomorrow']},`,
   `  {k:'think',   ids:['quote','recurringThought','differently','plannedDifferently','takeawayForTomorrow']},`],
  [`  if(id==='workoutDone')return ''+_t('אימון')+'';`,
   `  if(id==='workoutDone')return ''+_t('אימון')+'';
  if(id==='plannedDifferently')return ''+_t('מה לעשות אחרת מחר')+'';`],
  [`  if(id==='takeawayForTomorrow'&&sum.takeawayKind)h='<i class="sm-kind">'+labelOf(sum.takeawayKind)+'</i>'+h;`,
   `  if(id==='takeawayForTomorrow'&&sum.takeawayKind)h='<i class="sm-kind">'+labelOf(sum.takeawayKind)+'</i>'+h;
  var tg=id==='impactfulMoment'?sum.impactOn:id==='proudOf'?(sum.proudWhere?[sum.proudWhere]:[]):null;
  if(Array.isArray(tg)&&tg.length)h='<i class="sm-kind">'+tg.map(function(x){return labelOf(x);}).join(' · ')+'</i>'+h;`],
  [`.sm2-pz-b,.sm4-mem p{white-space:pre-line}
`,
   `.sm2-pz-b,.sm4-mem p{white-space:pre-line}
/* the fifth review (25 Nov): assets/rf-q5.webp, 640x770 - path, ripple, medal - drawn at 0.4 */
html body.mod-endofday .rfq-path{width:160px;height:88px;margin:26px auto 4px;background-size:256px 308px;background-position:0 0;
  -webkit-mask:radial-gradient(farthest-side,#000 60%,transparent 100%);mask:radial-gradient(farthest-side,#000 60%,transparent 100%)}
html body.mod-endofday .rfq-ripple{width:256px;height:104px;background-size:256px 308px;background-position:0 -88px;
  -webkit-mask:radial-gradient(farthest-side,#000 62%,transparent 100%);mask:radial-gradient(farthest-side,#000 62%,transparent 100%)}
html body.mod-endofday .rfq-medal{width:128px;height:116px;background-size:256px 308px;background-position:0 -192px;
  -webkit-mask:radial-gradient(closest-side,#000 72%,transparent 100%);mask:radial-gradient(closest-side,#000 72%,transparent 100%)}
html body.mod-endofday .rfq-tags{margin-top:14px;text-align:center}
html body.mod-endofday .rfq-tl{font-family:"Frank Ruhl Libre",Georgia,serif;font-size:18px;font-weight:700;color:var(--nu-ink);margin:4px 0 2px}
html body.mod-endofday .rfq-ts{font-size:13px;color:var(--nu-muted)}
html body.mod-endofday .rfq-tl2{margin:24px 0 10px;text-align:center}
html body.mod-endofday .rf-in.rfq-short{min-height:76px;font-family:"Frank Ruhl Libre",Georgia,serif;padding:12px 16px}
`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
