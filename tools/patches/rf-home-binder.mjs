// סיום יום's home once the day is written, and the day's sheet from the calendar (Asaf, 23 Nov, two screenshots):
// 1. the finished card looked empty - a title, one word and a link, set to the right under a Mip who stands in the
//    middle. It now holds the day itself: the closed binder the day was just filed into, its date on the cover, the
//    day's colour or photograph in a channel beside it, the spine lit. A tap opens the page. All of it centred.
// 2. the sheet's "ערוך את הסיכום" was the one black button in a soft-white app; it is the raised paper button now.
// usage: node tools/patches/rf-home-binder.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [];
const P = (a, b) => pairs.push([a, b]);

P(`  } else {
    h+='<div class="rf-hero-t">'+_t('סיכמת את היום שלך.')+'</div>';
    h+='<div class="rf-hero-s">'+rfRecap(r)+'</div>';
    if(r.photo)h+=photoImg(r.photo,'style="width:100%;border-radius:18px;margin-top:16px;display:block"');
    h+='<button onclick="rfResume()" class="rf-ghost" style="margin-top:12px">'+_t('פתח שוב')+'</button>';
  }`,
`  } else {
    h+=rfBinderHTML(today,r);
    h+='<div class="rf-hero-t">'+_t('סיכמת את היום שלך.')+'</div>';
    h+='<div class="rf-hero-s">'+rfRecap(r)+'</div>';
    h+='<button onclick="rfResume()" class="rf-ghost" style="margin-top:8px">'+_t('פתח שוב')+'</button>';
  }`);
P(`  h+='<div class="rf-hero">';
  /* BEEM LIVES HERE.`,
`  h+='<div class="rf-hero'+(rfDone(r)?' done':'')+'">';
  /* BEEM LIVES HERE.`);
P(`function rfRecap(r){`,
`/* THE DAY, FILED. The same binder the closing page drops into: its date on the
   cover, the spine lit, and in a channel beside the date the day's photograph
   or its colour - whichever it was given. Tapping it opens the page inside. */
function rfBinderHTML(ds,r){
  var day=new Date(ds+'T12:00:00'),col=r&&r.dayColor?dayColorOf(r.dayColor):'';
  var dot=r&&r.photo?'<span class="rfb-dot ph">'+photoImg(r.photo,'alt=""')+'</span>'
    :'<span class="rfb-dot"'+(col?' style="--dc:'+col+'"':'')+'></span>';
  return '<button class="rf-bind" onclick="openDayCard(\\''+ds+'\\')" aria-label="'+esc(fmtDate(ds))+'">'+
    '<span class="rfb-plate"><small>'+esc(dfmt(day,{weekday:'long'}))+'</small><b>'+esc(dfmt(day,{day:'numeric',month:'long'}))+'</b></span>'+
    dot+'<span class="rfb-spine"></span></button>';
}
function rfRecap(r){`);
P(`html body.mod-endofday .rf-hero-t{color:var(--nu-ink);font-size:17px;font-weight:800}`,
`html body.mod-endofday .rf-hero-t{color:var(--nu-ink);font-size:17px;font-weight:800}
/* a finished day stands in the middle, under Mip, like the binder it is filed in */
html body.mod-endofday .rf-hero.done{text-align:center}
html body.mod-endofday .rf-hero.done .rf-streak{text-align:center}
.rf-bind{position:relative;display:flex;align-items:center;gap:14px;width:min(240px,78%);height:118px;margin:8px auto 18px;
  padding:0 28px 0 18px;border:none;border-radius:16px;cursor:pointer;font-family:inherit;direction:rtl;
  background:var(--nu-ground);box-shadow:-4px -4px 10px var(--nu-lit),5px 6px 14px var(--nu-shade)}
.rfb-plate{flex:1;border-radius:12px;padding:12px 8px;text-align:center;
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.rfb-plate small{display:block;font-size:12px;font-weight:600;color:var(--nu-muted)}
.rfb-plate b{display:block;font-size:17px;font-weight:800;line-height:1.25;color:var(--nu-ink)}
.rfb-dot{flex:0 0 auto;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.rfb-dot[style]::after{content:"";width:24px;height:24px;border-radius:50%;background:var(--dc);box-shadow:0 0 12px var(--dc)}
.rfb-dot.ph img{width:34px;height:34px;border-radius:50%;object-fit:cover;display:block}
.rfb-spine{position:absolute;right:11px;top:16px;bottom:16px;width:4px;border-radius:2px;
  background:linear-gradient(90deg,rgba(240,169,46,.35),rgba(255,214,140,.95),rgba(240,169,46,.35));box-shadow:0 0 10px rgba(240,169,46,.5)}`);
// the sheet's button: paper, like every other button in the app
P(`/* ── the composed summary page ──`,
`html body .summary-edit{background:var(--nu-ground,var(--panel));color:var(--nu-ink,var(--ink));
  box-shadow:-3px -3px 8px var(--nu-lit,rgba(255,255,255,.9)),4px 5px 11px var(--nu-shade-soft,rgba(176,168,156,.3))}
/* ── the composed summary page ──`);

if (rev) {
  for (const [a, b] of pairs.slice().reverse()) { if (s.split(b).length !== 2) throw new Error('reverse: not once: ' + b.slice(0, 80)); s = s.replace(b, () => a); }
} else {
  for (const [a, b] of pairs) { if (s.split(a).length !== 2) throw new Error('not once: ' + a.slice(0, 80)); s = s.replace(a, () => b); }
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied', pairs.length, F);
