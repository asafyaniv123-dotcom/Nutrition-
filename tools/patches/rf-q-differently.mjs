// מה היית משנה (25 Nov), as Asaf approved it on the tenth review page:
//  - a porcelain arc curving back on itself, light along its inner groove (cut from the render into assets/rf-q10.webp, 260x200)
//  - first, optional: "what would change?" - what I said, what I did, how I reacted, what I chose - one, stored raw
//    as differentlyKind and named above the sentence in the summary
//  - then the ruled writing well in the page's serif, as for tomorrow
// usage: node tools/patches/rf-q-differently.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`var RFQ_TAGS={plannedMoved:RF_MOVED,impactOn:RF_IMPACT_ON,proudWhere:RF_PROUD_WHERE,thoughtTone:RF_THOUGHT_TONE};`,
   `var RF_DIFF_KIND=['מה שאמרתי','מה שעשיתי','איך הגבתי','מה שבחרתי'];
var RFQ_TAGS={plannedMoved:RF_MOVED,impactOn:RF_IMPACT_ON,proudWhere:RF_PROUD_WHERE,thoughtTone:RF_THOUGHT_TONE,differentlyKind:RF_DIFF_KIND};`],
  [`q.id==='dayTimeline'?'sundial':'';`,
   `q.id==='dayTimeline'?'sundial':q.id==='differently'?'arc':'';`],
  [`k==='sundial'?'rf-q9':'rf-q';`,
   `k==='sundial'?'rf-q9':k==='arc'?'rf-q10':'rf-q';`],
  [`    else h+='<textarea class="rf-in'+(q.id==='takeawayForTomorrow'?' rfq-lined':'')+'" id="rf-in"`,
   `    else{
      if(q.id==='differently')h+=rfqTagsHTML('differentlyKind',false,_t('מה היה משתנה?'));
      h+='<textarea class="rf-in'+(q.id==='takeawayForTomorrow'||q.id==='differently'?' rfq-lined':'')+'" id="rf-in"`],
  [`oninput="rfGrow(this)" placeholder="'+(q.ph||'')+'">'+(cur?esc(cur):'')+'</textarea>';
    if(q.id==='takeawayForTomorrow')h+=rfqKindHTML();`,
   `oninput="rfGrow(this)" placeholder="'+(q.ph||'')+'">'+(cur?esc(cur):'')+'</textarea>';
    }
    if(q.id==='takeawayForTomorrow')h+=rfqKindHTML();`],
  [`id==='recurringThought'?(sum.thoughtTone?[sum.thoughtTone]:[]):null;`,
   `id==='recurringThought'?(sum.thoughtTone?[sum.thoughtTone]:[]):id==='differently'?(sum.differentlyKind?[sum.differentlyKind]:[]):null;`],
  [`/* the ninth pair (25 Nov): assets/rf-q9.webp is a 320x205 sundial, drawn at half; the dial is code */`,
   `/* the tenth review (25 Nov): assets/rf-q10.webp, a 260x200 arc that curves back, drawn at 0.42 */
html body.mod-endofday .rfq-arc{width:109px;height:84px;background-size:109px 84px;background-position:0 0;
  -webkit-mask:radial-gradient(farthest-side,#000 70%,transparent 100%);mask:radial-gradient(farthest-side,#000 70%,transparent 100%)}
html body.mod-endofday .rfq-tags[data-f="differentlyKind"]{margin:8px 0 18px}
/* the ninth pair (25 Nov): assets/rf-q9.webp is a 320x205 sundial, drawn at half; the dial is code */`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
