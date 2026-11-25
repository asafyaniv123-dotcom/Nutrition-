// מה שמובן מאליו (25 Nov), the last question of the bank, as Asaf approved it on the twelfth review page:
//  - a plain everyday porcelain bowl with a little light resting at its bottom (cut from the render into
//    assets/rf-q12.webp, 380x270) - the bank card's own icon is a bowl
//  - first, optional: "what was it?" - a person, a place, a thing, my body, something in nature - one, stored raw
//    as overlookedKind and named above the sentence in the summary
//  - then the ruled writing well in the page's serif
// usage: node tools/patches/rf-q-overlooked.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`var RFQ_TAGS={plannedMoved:RF_MOVED,impactOn:RF_IMPACT_ON,proudWhere:RF_PROUD_WHERE,thoughtTone:RF_THOUGHT_TONE,differentlyKind:RF_DIFF_KIND};`,
   `var RF_OVERLOOK_KIND=['אדם','מקום','חפץ','הגוף שלי','משהו בטבע'];
var RFQ_TAGS={plannedMoved:RF_MOVED,impactOn:RF_IMPACT_ON,proudWhere:RF_PROUD_WHERE,thoughtTone:RF_THOUGHT_TONE,differentlyKind:RF_DIFF_KIND,overlookedKind:RF_OVERLOOK_KIND};`],
  [`q.id==='steps'?'stones':'';`,
   `q.id==='steps'?'stones':q.id==='gratefulOverlooked'?'bowl':'';`],
  [`k==='stones'?'rf-q11':'rf-q';`,
   `k==='stones'?'rf-q11':k==='bowl'?'rf-q12':'rf-q';`],
  [`      if(q.id==='differently')h+=rfqTagsHTML('differentlyKind',false,_t('מה היה משתנה?'));
      h+='<textarea class="rf-in'+(q.id==='takeawayForTomorrow'||q.id==='differently'?' rfq-lined':'')+'"`,
   `      if(q.id==='differently')h+=rfqTagsHTML('differentlyKind',false,_t('מה היה משתנה?'));
      if(q.id==='gratefulOverlooked')h+=rfqTagsHTML('overlookedKind',false,_t('מה זה היה?'));
      h+='<textarea class="rf-in'+(q.id==='takeawayForTomorrow'||q.id==='differently'||q.id==='gratefulOverlooked'?' rfq-lined':'')+'"`],
  [`id==='differently'?(sum.differentlyKind?[sum.differentlyKind]:[]):null;`,
   `id==='differently'?(sum.differentlyKind?[sum.differentlyKind]:[]):id==='gratefulOverlooked'?(sum.overlookedKind?[sum.overlookedKind]:[]):null;`],
  [`/* the eleventh review (25 Nov):`,
   `/* the twelfth review (25 Nov): assets/rf-q12.webp, a 380x270 bowl, drawn at 0.38 */
html body.mod-endofday .rfq-bowl{width:144px;height:103px;background-size:144px 103px;background-position:0 0;
  -webkit-mask:radial-gradient(farthest-side,#000 76%,transparent 100%);mask:radial-gradient(farthest-side,#000 76%,transparent 100%)}
html body.mod-endofday .rfq-tags[data-f="overlookedKind"]{margin:8px 0 18px}
/* the eleventh review (25 Nov):`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
