// The closing page, after Asaf saw it on the phone (23 Nov): the date goes to the top, in the middle; the "סיכום יום" seal
// with its tick goes ("it is clear to everyone this was the day's summary"); and what goes into the binder is THAT page,
// not a blank sheet standing in for it - the binder takes the page's own proportions, so it is visibly the same paper.
// usage: node tools/patches/rf-done-page.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [];
const P = (a, b) => pairs.push([a, b]);

P(`/* The SAME page the sheet shows, on glass instead of in a drawer. The seal is
   the only thing the card adds - it is the graphic that says the day is
   closed - and it carries no date, because the page under it opens with one. */
function dayCardHTML(dateStr){
  var body=summaryBodyHTML(dateStr);
  if(!body)return '';
  return '<div class="rfd-stage"><div class="rfd-card" id="rfd-card" tabindex="0" onpointerdown="rfdTilt(event)">'+
    '<div class="rfd-sheen"></div>'+
    '<div class="rfd-seal"><div class="rfd-mark">&#10003;</div>'+
    '<div class="rfd-seal-t">'+_t('סיכום יום')+'</div></div>'+
    body+'</div></div>';
}`,
`/* The SAME page the sheet shows, on glass instead of in a drawer. It used to
   open with a seal - a tick and "סיכום יום" - and Asaf took it off (23 Nov):
   it is plain to everyone what this page is. What leads it instead is the
   date, centred at the top, and the page's own date line steps aside. */
function dayCardHTML(dateStr){
  var body=summaryBodyHTML(dateStr);
  if(!body)return '';
  return '<div class="rfd-stage"><div class="rfd-card" id="rfd-card" tabindex="0" onpointerdown="rfdTilt(event)">'+
    '<div class="rfd-sheen"></div>'+
    '<div class="rfd-date">'+fmtDate(dateStr)+'</div>'+
    body+'</div></div>';
}`);

P(`.rfd-seal{display:flex;align-items:center;gap:11px;margin-bottom:16px}`,
`.rfd-date{text-align:center;font-size:18px;font-weight:800;color:var(--ink);line-height:1.3;margin:2px 0 14px;transform:translateZ(22px)}
.rfd-card .sm2-date{display:none}
.rfd-seal{display:flex;align-items:center;gap:11px;margin-bottom:16px}`);
P(`html body.mod-endofday .rfd-seal-t,html body.mod-endofday .rfd-mark{color:var(--nu-ink)}`,
  `html body.mod-endofday .rfd-seal-t,html body.mod-endofday .rfd-mark,html body.mod-endofday .rfd-date{color:var(--nu-ink)}`);

// the binder is cut to the page: the page keeps its proportions and is simply made smaller
P(`  var W=Math.min(176,Math.round(innerWidth*.46)),H=Math.round(W*1.26),cx=innerWidth/2,cy=innerHeight*.42;
  var x0=cx-W/2,y0=cy-H/2,inset=13;
  var c=card.getBoundingClientRect(),top=Math.max(c.top,8),bot=Math.min(c.bottom,innerHeight-8);
  if(bot-top<60){top=c.top;bot=c.top+Math.max(60,c.height);}`,
`  var inset=12,c=card.getBoundingClientRect();
  var k=Math.min((innerWidth*.62-inset*2)/c.width,(innerHeight*.46-inset*2)/c.height,1);
  var W=Math.round(c.width*k+inset*2),H=Math.round(c.height*k+inset*2),cx=innerWidth/2,cy=innerHeight*.44;
  var x0=cx-W/2,y0=cy-H/2;`);
P(`    '<div class="rff-page" style="width:'+c.width+'px;height:'+(bot-top)+'px;transform:translate('+c.left+'px,'+top+'px)"><i></i><i></i><i></i><i></i><i></i></div>';
  document.body.appendChild(ov);`,
`    '';
  /* the page itself, copied as it stands - photo, words and all */
  var pg=card.cloneNode(true);pg.removeAttribute('id');pg.removeAttribute('tabindex');pg.removeAttribute('onpointerdown');
  pg.classList.remove('live');pg.classList.add('rff-page');
  pg.style.cssText='width:'+c.width+'px;margin:0;transition:none;transform-origin:0 0;transform:translate('+(c.left-x0)+'px,'+(c.top-y0)+'px)';
  var bk0=ov.querySelector('.rff-bk');bk0.insertBefore(pg,bk0.querySelector('.rff-cover'));
  document.body.appendChild(ov);`);
P(`  var bk=ov.querySelector('.rff-bk'),pg=ov.querySelector('.rff-page'),cv=ov.querySelector('.rff-cover'),sp=ov.querySelector('.rff-spine');`,
  `  var bk=ov.querySelector('.rff-bk'),cv=ov.querySelector('.rff-cover'),sp=ov.querySelector('.rff-spine');`);
P(`  var pw=W-inset*2,ph=H-inset*2;
  go(bk,[{opacity:0},{opacity:1}],350);
  go(pg,[{transform:at(c.left,top),width:c.width+'px',height:(bot-top)+'px'},
         {transform:at(x0+inset,y0+inset),width:pw+'px',height:ph+'px'}],750)`,
`  go(ov.querySelector('.rff-bind'),[{opacity:0},{opacity:1}],350);
  go(pg,[{transform:at(c.left-x0,c.top-y0)+' scale(1)'},{transform:at(inset,inset)+' scale('+k+')'}],800)`);
// the copy is a card, not the blank sheet: only position it; it already wears the page's own paper
P(`.rff-page{border-radius:14px;background:var(--nu-ground);padding:16px 14px;box-sizing:border-box;overflow:hidden;
  box-shadow:-3px -3px 8px var(--nu-lit),4px 5px 12px var(--nu-shade)}`,
`.rff-page{box-sizing:border-box;pointer-events:none;position:absolute!important;left:0!important;top:0!important}`);
P(`'<div class="rff-bk" style="width:'+W+'px;height:'+H+'px;transform:translate('+x0+'px,'+y0+'px);opacity:0">'`,`'<div class="rff-bk" style="width:'+W+'px;height:'+H+'px;transform:translate('+x0+'px,'+y0+'px)">'`);

if (rev) {
  for (const [a, b] of pairs.slice().reverse()) { if (s.split(b).length !== 2) throw new Error('reverse: not once: ' + b.slice(0, 80)); s = s.replace(b, () => a); }
} else {
  for (const [a, b] of pairs) { if (s.split(a).length !== 2) throw new Error('not once: ' + a.slice(0, 80)); s = s.replace(a, () => b); }
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied', pairs.length, F);
