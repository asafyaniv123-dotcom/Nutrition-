// The second pair of evening questions, inside, as Asaf approved them on the review page (24 Nov):
//  - ציון היום: a porcelain star over the question; the ten numbers become porcelain pebbles on a gentle arc,
//    the chosen one pressed with light round it and the ones before it faintly lit, like a track filled. The
//    numbers are now drawn in the reader's digits (they were a raw i, so Arabic saw 1..10 among ٨).
//  - איך עבר היום: a porcelain wave; each anchor is a pressed channel with a numbered pebble at its start, and a
//    thread of amber light runs through the pebbles in order - the numbered list of the day's page. The arrow
//    between anchors gives way to that thread; the anchor text is set in the page's serif.
// Star and wave are cut from the two approved Higgsfield renders into assets/rf-q2.webp (the 300px star over
// the 540x190 wave), colour-matched to the ground.
// usage: node tools/patches/rf-q-rating-flow.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`  var k=q.kind==='mood'?'face':q.id==='bodyFeelings'?'body':'';
  return k?'<div class="rfq-hero rfq-'+k+'" style="background-image:url('+liveBase()+'assets/rf-q.webp)"></div>':'';`,
   `  var k=q.kind==='mood'?'face':q.id==='bodyFeelings'?'body':q.id==='dayRating'?'star':q.kind==='flow'?'wave':'';
  var pic=k==='star'||k==='wave'?'rf-q2':'rf-q';
  return k?'<div class="rfq-hero rfq-'+k+'" style="background-image:url('+liveBase()+'assets/'+pic+'.webp)"></div>':'';`],
  [`    h+='<div class="rf-scale">';
    for(i=1;i<=10;i++)h+='<button class="rf-num'+(cur===i?' on':'')+'" onclick="rfPickScale('+i+')">'+i+'</button>';`,
   `    h+='<div class="rf-scale rfq-arc">';
    for(i=1;i<=10;i++)h+='<button class="rf-num'+(cur===i?' on':cur>i?' lit':'')+'" style="--a:'+Math.round(Math.sin(Math.PI*(i-.5)/10)*100)/100+'" onclick="rfPickScale('+i+')"><span>'+nfmt(i)+'</span></button>';`],
  [`  var b=document.querySelectorAll('.rf-num');
  for(var i=0;i<b.length;i++)b[i].className='rf-num'+(i===n-1?' on':'');`,
   `  var b=document.querySelectorAll('.rf-num');
  for(var i=0;i<b.length;i++)b[i].className='rf-num'+(i===n-1?' on':i<n-1?' lit':'');`],
  [`      h+='<div class="rf-flow-row"><div class="rf-flow-box">';`,
   `      h+='<div class="rf-flow-row"><span class="rfq-n">'+nfmt(i+1)+'</span><div class="rf-flow-box">';`],
  [`html body.mod-endofday .rfq-body{background-position:-150px 0}
`,
   `html body.mod-endofday .rfq-body{background-position:-150px 0}
/* the second pair (24 Nov): assets/rf-q2.webp is a 300px star over a 540x190 wave, drawn at 0.4333 */
html body.mod-endofday .rfq-star{width:130px;height:130px;background-size:234px 212px;background-position:0 0}
html body.mod-endofday .rfq-wave{width:234px;height:82px;background-size:234px 212px;background-position:0 -130px;
  -webkit-mask:radial-gradient(farthest-side,#000 62%,transparent 100%);mask:radial-gradient(farthest-side,#000 62%,transparent 100%)}
html body.mod-endofday .rfq-arc{gap:2px;align-items:flex-end;height:96px;margin-top:4px}
html body.mod-endofday .rfq-arc .rf-num{flex:1;aspect-ratio:auto;height:52px;padding:0;background:none;border:none;box-shadow:none;
  display:grid;place-items:center;transform:translateY(calc(var(--a) * -40px));transition:transform .2s}
html body.mod-endofday .rfq-arc .rf-num span{display:grid;place-items:center;width:min(34px,100%);aspect-ratio:1;border-radius:50%;
  background:var(--nu-ground);color:var(--nu-ink);font-size:13px;font-weight:700;
  box-shadow:-2px -2px 6px var(--nu-lit),3px 4px 8px var(--nu-shade-soft);transition:box-shadow .2s,color .2s}
html body.mod-endofday .rfq-arc .rf-num.lit span{box-shadow:-2px -2px 6px var(--nu-lit),3px 4px 8px var(--nu-shade-soft),0 0 10px 1px rgba(240,169,46,.28)}
html body.mod-endofday .rfq-arc .rf-num.on span{color:#8a5a1c;
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit),0 0 0 2px rgba(240,169,46,.55),0 0 14px 3px rgba(240,169,46,.35)}
html body.mod-endofday .rfq-arc+.rf-echo{margin-top:6px;font-size:15px;font-weight:600}
html body.mod-endofday .rf-flow{position:relative;gap:14px}
html body.mod-endofday .rf-flow:before{content:"";position:absolute;inset-inline-start:15px;top:22px;bottom:22px;width:4px;border-radius:2px;
  background:linear-gradient(rgba(240,169,46,.75),rgba(240,169,46,.75)) center/2px 100% no-repeat,var(--nu-ground);
  box-shadow:inset 1px 2px 3px var(--nu-shade),inset -1px -1px 2px var(--nu-lit),0 0 8px rgba(240,169,46,.3)}
html body.mod-endofday .rf-flow-ar{display:none}
html body.mod-endofday .rfq-n{position:relative;flex:none;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;
  background:var(--nu-ground);color:var(--nu-ink);font-family:"Frank Ruhl Libre",Georgia,serif;font-size:16px;font-weight:700;
  box-shadow:-2px -2px 6px var(--nu-lit),3px 4px 8px var(--nu-shade-soft)}
html body.mod-endofday .rf-flow .rf-flow-box{background:var(--nu-ground);box-shadow:inset 3px 4px 8px var(--nu-shade),inset -3px -3px 7px var(--nu-lit)}
html body.mod-endofday .rf-flow .rf-flow-line{background:none}
html body.mod-endofday .rf-flow .rf-flow-in{background:none;box-shadow:none;font-family:"Frank Ruhl Libre",Georgia,serif;font-size:16px}
html body.mod-endofday .rf-flow .rf-flow-cam{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;padding:0;
  background:var(--nu-ground);box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 6px var(--nu-shade-soft)}
html body.mod-endofday .rf-flow .rf-flow-x{font-size:14px;opacity:.7}
html body.mod-endofday button.rf-flow-add{border:none;width:auto;display:block;margin:16px auto 0;padding:11px 20px;border-radius:99px;
  font-size:14px;color:var(--nu-ink);background:var(--nu-ground);box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}
`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
