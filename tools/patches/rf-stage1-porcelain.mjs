// סיום יום, the way in and the first stage (25 Nov), as Asaf approved them on the thirteenth and fourteenth review
// pages. Every piece is cut from its render (tools: scratchpad cut13.mjs), none redrawn:
//  - the way in: Mip sits in a pressed porcelain dish (assets/rf-dish.webp) as the sheet draws him, the words
//    centred under him; the two doors below carry a porcelain star and camera in a well (assets/rf-tiles.webp)
//  - the best moment: an open shell holding a lit pearl (rf-q13), and the ruled writing well
//  - the photo: a porcelain camera in the pressed frame (rf-cam), light at the bottom of the well; the day's
//    colour is eight glazed pebbles (rf-glaze8, in DAY_COLORS order) - the chosen one sinks into a lit well
//  - the song: a porcelain record (rf-q14); the search is a pill-shaped well, each result a raised capsule with
//    its cover in a round well
//  - the sentence: two porcelain quotation marks (rf-q15), and the ruled writing well
//  - "more…": three fanned porcelain cards, the top one lifted on light (rf-q16)
// No string changes. usage: node tools/patches/rf-stage1-porcelain.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  // heroes over the first stage's questions
  [`q.id==='gratefulOverlooked'?'bowl':'';`,
   `q.id==='gratefulOverlooked'?'bowl':q.id==='moment'?'shell':q.id==='song'?'record':q.id==='quote'?'quotes':'';`],
  [`k==='bowl'?'rf-q12':'rf-q';`,
   `k==='bowl'?'rf-q12':k==='shell'?'rf-q13':k==='record'?'rf-q14':k==='quotes'?'rf-q15':'rf-q';`],
  // the moment and the sentence are written into the ruled well
  [`h+='<textarea class="rf-in'+(q.id==='takeawayForTomorrow'||q.id==='differently'||q.id==='gratefulOverlooked'?' rfq-lined':'')+'"`,
   `h+='<textarea class="rf-in'+(q.id==='takeawayForTomorrow'||q.id==='differently'||q.id==='gratefulOverlooked'||q.id==='moment'||q.id==='quote'?' rfq-lined':'')+'"`],
  // the photo well holds a porcelain camera
  [`    '<svg viewBox="0 0 24 24"><path d="M3.5 8.5a2 2 0 0 1 2-2h2l1.4-2h6.2l1.4 2h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z"/><circle cx="12" cy="12.8" r="3.6"/></svg>'+
    '<div style="font-size:13px;color:var(--muted);margin-top:12px;font-weight:700">'+_t('לצלם או לבחור מהגלריה')+'</div></button>';`,
   `    '<i class="rfq-cam" style="background-image:url('+liveBase()+'assets/rf-cam.webp)"></i>'+
    '<div class="rfq-camt">'+_t('לצלם או לבחור מהגלריה')+'</div></button>';`],
  // the day's colour: glazed pebbles cut from the render, in DAY_COLORS order
  [`  var h='<div class="rf-or">'+_t('או')+'</div><div class="rf-cq">'+_t('בלי תמונה היום? בחר צבע ליום')+'</div><div class="rf-sw">';
  DAY_COLORS.forEach(function(d,i){
    h+='<button class="'+(cur===d.k?'on':'')+'" style="--c:'+d.c+'" aria-pressed="'+(cur===d.k)+'" aria-label="'+esc(_t('צבע {n}',{n:i+1}))+
       '" onclick="rfPickDayColor(\\''+d.k+'\\')"><i></i></button>';`,
   `  var h='<div class="rf-or">'+_t('או')+'</div><div class="rf-cq">'+_t('בלי תמונה היום? בחר צבע ליום')+'</div><div class="rf-sw rfq-glaze" style="--gz:url('+liveBase()+'assets/rf-glaze8.webp)">';
  DAY_COLORS.forEach(function(d,i){
    h+='<button class="'+(cur===d.k?'on':'')+'" style="--c:'+d.c+'" aria-pressed="'+(cur===d.k)+'" aria-label="'+esc(_t('צבע {n}',{n:i+1}))+
       '" onclick="rfPickDayColor(\\''+d.k+'\\')"><i style="background-position:'+(i*-50)+'px 0"></i></button>';`],
  // "more…": the fanned cards over it
  [`  h+='<div class="rf-q">'+_t('נוסף…')+'</div>';`,
   `  h+='<div class="rfq-hero rfq-cards" style="background-image:url('+liveBase()+'assets/rf-q16.webp)"></div>';
  h+='<div class="rf-q">'+_t('נוסף…')+'</div>';`],
  // the way in: Mip in his dish, the words under him; the doors carry porcelain
  [`  h+='<div class="rf-hero'+(rfDone(r)?' done':'')+'">';`,
   `  h+='<div class="rf-hero'+(rfDone(r)?' done':' open')+'">';`],
  [`  h+='<div class="rf-beem sm" id="rf-beem"></div>';
  if(_bDone&&_bN)`,
   `  if(_bDone)h+='<div class="rf-beem sm" id="rf-beem"></div>';
  else h+='<div class="rf-dish" style="--dish:url('+liveBase()+'assets/rf-dish.webp)"><div class="rf-beem sm" id="rf-beem"></div></div>';
  if(_bDone&&_bN)`],
  [`  h+='<div class="rf-tiles">'+rfVlogHTML()+`,
   `  h+='<div class="rf-tiles" style="--tl:url('+liveBase()+'assets/rf-tiles.webp)">'+rfVlogHTML()+`],
  [`/* the twelfth review (25 Nov): assets/rf-q12.webp, a 380x270 bowl, drawn at 0.38 */`,
   `/* the thirteenth and fourteenth reviews (25 Nov): the way in and the first stage, every piece cut from its render */
html body.mod-endofday .rfq-shell{width:151px;height:126px;background-size:151px 126px;background-position:0 0;
  -webkit-mask:radial-gradient(closest-side,#000 74%,transparent 100%);mask:radial-gradient(closest-side,#000 74%,transparent 100%)}
html body.mod-endofday .rfq-record{width:192px;height:116px;background-size:192px 116px;background-position:0 0;
  -webkit-mask:radial-gradient(farthest-side,#000 70%,transparent 100%);mask:radial-gradient(farthest-side,#000 70%,transparent 100%)}
html body.mod-endofday .rfq-quotes{width:148px;height:96px;background-size:148px 96px;background-position:0 0;
  -webkit-mask:radial-gradient(farthest-side,#000 72%,transparent 100%);mask:radial-gradient(farthest-side,#000 72%,transparent 100%)}
html body.mod-endofday .rfq-cards{width:167px;height:133px;margin-top:28px;background-size:167px 133px;background-position:0 0;
  -webkit-mask:radial-gradient(closest-side,#000 76%,transparent 100%);mask:radial-gradient(closest-side,#000 76%,transparent 100%)}
html body.mod-endofday .rf-photo-drop{padding:26px 20px 24px;
  box-shadow:inset 3px 4px 8px var(--nu-shade),inset -3px -3px 7px var(--nu-lit),inset 0 -16px 18px -14px rgba(240,169,46,.45)}
html body.mod-endofday .rfq-cam{display:block;width:108px;height:86px;margin:0 auto;background-size:108px 86px;background-repeat:no-repeat;
  -webkit-mask:radial-gradient(closest-side,#000 78%,transparent 100%);mask:radial-gradient(closest-side,#000 78%,transparent 100%)}
html body.mod-endofday .rfq-camt{margin-top:10px;font-family:"Frank Ruhl Libre",Georgia,serif;font-size:16px;color:var(--nu-ink)}
html body.mod-endofday .rfq-glaze button{width:60px;height:60px;background:none;box-shadow:none;transition:box-shadow .2s}
html body.mod-endofday .rfq-glaze i{width:50px;height:50px;background:var(--gz) no-repeat;background-size:400px 50px;box-shadow:none;
  -webkit-mask:radial-gradient(closest-side,#000 86%,transparent 92%);mask:radial-gradient(closest-side,#000 86%,transparent 92%)}
html body.mod-endofday .rfq-glaze .on{background:var(--nu-ground);
  box-shadow:inset 3px 4px 8px var(--nu-shade),inset -3px -3px 7px var(--nu-lit),0 0 0 2px rgba(240,169,46,.5),0 0 16px 3px rgba(240,169,46,.35)}
html body.mod-endofday .rfq-glaze .on i{transform:scale(.86);box-shadow:none}
html body.mod-endofday .rf-sg-q{border-radius:99px;padding:0 20px}
html body.mod-endofday .rf-sg-q input{font-family:"Frank Ruhl Libre",Georgia,serif;font-size:17px;color:var(--nu-ink)}
html body.mod-endofday .rf-sg-r,html body.mod-endofday .rf-sg-r+.rf-sg-r{margin-top:12px;padding:8px;padding-inline-end:18px;border-radius:99px;
  background:var(--nu-ground);box-shadow:-3px -3px 8px var(--nu-lit),4px 5px 11px var(--nu-shade-soft)}
html body.mod-endofday .rf-sg-r:active{box-shadow:inset 3px 4px 8px var(--nu-shade),inset -3px -3px 7px var(--nu-lit)}
html body.mod-endofday .rf-sg-r img,html body.mod-endofday .rf-sg-ph{width:48px;height:48px;border-radius:50%;
  box-shadow:0 0 0 3px var(--nu-ground),0 0 0 4px rgba(176,168,156,.35),inset 2px 3px 6px var(--nu-shade)}
html body.mod-endofday .rf-sg-t b{font-family:"Frank Ruhl Libre",Georgia,serif;font-size:16px;font-weight:600;color:var(--nu-ink)}
html body.mod-endofday .rf-sg-t span{color:var(--nu-muted)}
html body.mod-endofday .rf-sg-link{font-family:"Frank Ruhl Libre",Georgia,serif;font-size:15px;font-weight:500;text-decoration:none;color:var(--nu-muted)}
html body.mod-endofday .rf-hero.open{text-align:center}
html body.mod-endofday .rf-dish{position:relative;display:grid;place-items:center;width:200px;height:191px;margin:0 auto 10px}
html body.mod-endofday .rf-dish::before{content:"";position:absolute;inset:0;background:var(--dish) 0 0/200px 191px no-repeat;
  -webkit-mask:radial-gradient(closest-side,#000 88%,transparent 100%);mask:radial-gradient(closest-side,#000 88%,transparent 100%)}
html body.mod-endofday .rf-dish .rf-beem{position:relative}
html body.mod-endofday .rf-dish .rf-beem{width:136px;height:136px;margin:0}
html body.mod-endofday .rf-tiles .rf-vlog{align-items:center;text-align:center}
html body.mod-endofday .rf-tiles .rf-vlog-t{align-items:center}
html body.mod-endofday .rf-tiles .rf-vlog .vlog-dot{width:64px;height:64px;border-radius:50%;background:var(--tl) no-repeat;background-size:128px 64px;
  background-position:-64px 0;box-shadow:none;-webkit-mask:radial-gradient(closest-side,#000 90%,transparent 100%);mask:radial-gradient(closest-side,#000 90%,transparent 100%)}
html body.mod-endofday .rf-tiles .rf-mem.rf-vlog .vlog-dot{background-position:0 0;box-shadow:none}
html body.mod-endofday .rf-tiles .vlog-dot svg{display:none}
html body.mod-endofday .rf-tiles .rf-vlog-t b{font-family:"Frank Ruhl Libre",Georgia,serif;font-size:16px;font-weight:600}
/* the twelfth review (25 Nov): assets/rf-q12.webp, a 380x270 bowl, drawn at 0.38 */`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
