// סיום יום, after the day is closed (25 Nov), as Asaf approved it on the fifteenth review page:
//  - Mip sits in the same pressed dish as on the way in, as the sheet draws him (night or not)
//  - the streak is a thin lit thread with a porcelain bead for every day of it, at most seven (one bead cut from
//    the render into assets/rf-bead.webp), and the count in the page's serif under it
//  - the day filed away: the binder is a porcelain folio, the date on a pressed plate in the serif, and the day's
//    colour as its glazed pebble (assets/rf-glaze8.webp) in a round well; a photograph still takes the well
// The two doors stay as they were approved and built. No string changes.
// usage: node tools/patches/rf-done-porcelain.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`  if(_bDone)h+='<div class="rf-beem sm" id="rf-beem"></div>';
  else h+='<div class="rf-dish" style="--dish:url('+liveBase()+'assets/rf-dish.webp)"><div class="rf-beem sm" id="rf-beem"></div></div>';`,
   `  h+='<div class="rf-dish" style="--dish:url('+liveBase()+'assets/rf-dish.webp)"><div class="rf-beem sm" id="rf-beem"></div></div>';`],
  [`  if(_bDone&&_bN)h+='<div class="rf-streak">'+esc(_t('יום {n} ברצף',{n:_bN}))+'</div>';`,
   `  if(_bDone&&_bN)h+=rfStreakArcHTML(_bN)+'<div class="rf-streak">'+esc(_t('יום {n} ברצף',{n:_bN}))+'</div>';`],
  [`    :'<span class="rfb-dot"'+(col?' style="--dc:'+col+'"':'')+'></span>';`,
   `    :'<span class="rfb-dot"'+(col?' style="--dc:'+col+'"':'')+'>'+(col?'<i style="--gz:url('+liveBase()+'assets/rf-glaze8.webp);background-position:'+(rfGlazeIx(r.dayColor)*-36)+'px 0"></i>':'')+'</span>';`],
  [`function rfBinderHTML(ds,r){`,
   `/* the streak as a lit thread, a bead for each day of it - seven at most, the number says the rest */
function rfStreakArcHTML(n){
  var k=Math.min(7,n),h='<div class="rf-sarc" aria-hidden="true" style="--bd:url('+liveBase()+'assets/rf-bead.webp)"><svg viewBox="0 0 240 40"><path d="M10 8Q120 36 230 8"/></svg>',i,t,x,y;
  for(i=0;i<k;i++){
    t=.5+(i-(k-1)/2)*.13;
    x=Math.round((1-t)*(1-t)*10+2*(1-t)*t*120+t*t*230);
    y=Math.round((1-t)*(1-t)*8+2*(1-t)*t*36+t*t*8);
    h+='<i style="left:'+x+'px;top:'+y+'px"></i>';
  }
  return h+'</div>';
}
function rfGlazeIx(k){for(var i=0;i<DAY_COLORS.length;i++)if(DAY_COLORS[i].k===k)return i;return 0;}
function rfBinderHTML(ds,r){`],
  [`/* the thirteenth and fourteenth reviews (25 Nov): the way in and the first stage, every piece cut from its render */`,
   `/* the fifteenth review (25 Nov): after the day is closed - the streak's thread and beads, the folio */
html body.mod-endofday .rf-sarc{position:relative;width:240px;height:40px;margin:-2px auto 4px}
html body.mod-endofday .rf-sarc svg{position:absolute;inset:0;width:240px;height:40px;overflow:visible}
html body.mod-endofday .rf-sarc path{fill:none;stroke:rgba(240,169,46,.7);stroke-width:1.6;stroke-linecap:round;filter:drop-shadow(0 0 3px rgba(240,169,46,.6))}
html body.mod-endofday .rf-sarc i{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;background:var(--bd) 0 0/22px 22px no-repeat;
  -webkit-mask:radial-gradient(closest-side,#000 70%,transparent 100%);mask:radial-gradient(closest-side,#000 70%,transparent 100%)}
html body.mod-endofday .rf-hero.done .rf-streak{font-family:"Frank Ruhl Libre",Georgia,serif;font-size:18px;font-weight:600;color:var(--nu-ink)}
html body.mod-endofday .rf-bind{width:min(300px,92%);height:104px;gap:16px;padding:0 30px 0 16px;border-radius:14px;
  box-shadow:-4px -4px 10px var(--nu-lit),5px 6px 14px var(--nu-shade),0 3px 0 -1px var(--nu-ground),0 4px 0 -1px rgba(176,168,156,.5)}
html body.mod-endofday .rfb-plate{border-radius:10px;padding:10px 14px;text-align:start}
html body.mod-endofday .rfb-plate small{font-family:"Frank Ruhl Libre",Georgia,serif;font-size:13.5px;font-weight:500}
html body.mod-endofday .rfb-plate b{font-family:"Frank Ruhl Libre",Georgia,serif;font-size:22px;font-weight:500}
html body.mod-endofday .rfb-dot{width:54px;height:54px}
html body.mod-endofday .rfb-dot[style]::after{display:none}
html body.mod-endofday .rfb-dot i{display:block;width:36px;height:36px;background:var(--gz) no-repeat;background-size:288px 36px;
  -webkit-mask:radial-gradient(closest-side,#000 86%,transparent 92%);mask:radial-gradient(closest-side,#000 86%,transparent 92%)}
html body.mod-endofday .rfb-dot.ph img{width:44px;height:44px}
html body.mod-endofday .rfb-spine{right:0;top:12px;bottom:12px;width:3px;border-radius:2px 0 0 2px}
/* the thirteenth and fourteenth reviews (25 Nov): the way in and the first stage, every piece cut from its render */`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
