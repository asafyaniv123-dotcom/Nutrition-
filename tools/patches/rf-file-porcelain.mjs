// Filing the day, second round: Asaf found the flat CSS binder "still not good" (24 Nov) and approved a porcelain
// ring binder from Higgsfield (review page, storyboard of four). The binder is the render itself, never redrawn:
// assets/rf-binder.webp is its closed form, cut out and colour-matched to the ground. The page settles where the
// cover's face is, the cover - the same picture - swings down onto it on its rings, toward the reader, and the
// app writes the day's date into the debossed plate, in the reader's own month and digits. Then it flies to Me
// as before.
// usage: node tools/patches/rf-file-porcelain.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`  var inset=12,c=card.getBoundingClientRect();
  /* a binder is a binder, 3 by 4, whatever the page's length: the page goes in at its width and its foot is tucked */
  var W=Math.round(Math.min(innerWidth*.62,innerHeight*.46*.75)),H=Math.round(W/.75);
  var k=Math.min((W-inset*2)/c.width,1),tuck=Math.max(0,Math.round(c.height-(H-inset*2)/k)),cx=innerWidth/2,cy=innerHeight*.44;
  var x0=cx-W/2,y0=cy-H/2;
  var day=new Date(ds+'T12:00:00');
  var ov=document.createElement('div');ov.className='rff';
  ov.innerHTML='<div class="rff-bk" style="width:'+W+'px;height:'+H+'px;transform:translate('+x0+'px,'+y0+'px)">'+
    '<div class="rff-bind"></div><div class="rff-cover"><div class="rff-plate"><small>'+esc(dfmt(day,{weekday:'long'}))+'</small>'+
    '<b>'+esc(dfmt(day,{day:'numeric',month:'long'}))+'</b></div><div class="rff-spine"></div></div></div>'+
    '';`,
   `  var c=card.getBoundingClientRect();
  /* The picture is 270 by 320; its cover's face runs from (36,16) to (256,264) and it hinges on the rings at
     x 36. Everything below is that picture's geometry, scaled by s. */
  var W=Math.round(Math.min(innerWidth*.62,innerHeight*.46*270/320)),H=Math.round(W*320/270),s=W/270;
  var fx=36*s,fy=16*s,fw=220*s,fh=248*s;
  var k=Math.min(fw/c.width,1),tuck=Math.max(0,Math.round(c.height-fh/k)),cx=innerWidth/2,cy=innerHeight*.44;
  var x0=cx-W/2,y0=cy-H/2;
  var day=new Date(ds+'T12:00:00');
  var ov=document.createElement('div');ov.className='rff';
  ov.innerHTML='<div class="rff-bk" style="width:'+W+'px;height:'+H+'px;transform:translate('+x0+'px,'+y0+'px)">'+
    '<div class="rff-cover rff-cv" style="background-image:url('+liveBase()+'assets/rf-binder.webp);transform-origin:'+fx+'px 50%;--s:'+s+'">'+
    '<div class="rff-dt"><small>'+esc(dfmt(day,{month:'short'}))+'</small><b>'+esc(dfmt(day,{day:'numeric'}))+'</b></div></div></div>';`],
  [`  var bk=ov.querySelector('.rff-bk'),cv=ov.querySelector('.rff-cover'),sp=ov.querySelector('.rff-spine');`,
   `  var bk=ov.querySelector('.rff-bk'),cv=ov.querySelector('.rff-cover');`],
  [`  go(ov.querySelector('.rff-bind'),[{opacity:0},{opacity:1}],350);
  go(pg,[{transform:at(c.left-x0,c.top-y0)+' scale(1)',clipPath:'inset(0 0 0)'},
    {transform:at(inset,inset)+' scale('+k+')',clipPath:'inset(0 0 '+tuck+'px)'}],800)
  .then(function(){return go(cv,[{opacity:0,transform:'rotateY(176deg)'},{opacity:0,transform:'rotateY(92deg)',offset:.3},
    {opacity:1,transform:'rotateY(86deg)',offset:.36},{opacity:1,transform:'rotateY(0)'}],900,'cubic-bezier(.45,0,.3,1)');})
  .then(function(){pg.style.opacity='0';
    return go(sp,[{background:'var(--nu-shade-soft)',boxShadow:'none'},
      {background:'linear-gradient(90deg,rgba(240,169,46,.35),rgba(255,214,140,.95),rgba(240,169,46,.35))',boxShadow:'0 0 12px rgba(240,169,46,.6)'}],550,'ease-out');})`,
   `  go(pg,[{transform:at(c.left-x0,c.top-y0)+' scale(1)',clipPath:'inset(0 0 0)'},
    {transform:at(fx,fy)+' scale('+k+')',clipPath:'inset(0 0 '+tuck+'px)'}],800)
  /* the hinge is on the left, so a NEGATIVE turn lifts the free edge toward the reader: it comes down onto the page */
  .then(function(){return go(cv,[{opacity:0,transform:'rotateY(-96deg)'},{opacity:1,transform:'rotateY(-84deg)',offset:.18},
    {opacity:1,transform:'rotateY(0)'}],900,'cubic-bezier(.45,0,.3,1)');})
  .then(function(){pg.style.opacity='0';
    return go(bk,[{filter:'drop-shadow(0 0 0 rgba(240,169,46,0))'},{filter:'drop-shadow(0 8px 18px rgba(240,169,46,.45))'}],550,'ease-out');})`],
  [`.tb.rff-glow{`,
   `/* the porcelain binder (24 Nov): the render, and the date the app writes into its plate */
.rff-cv{opacity:0;background-size:100% 100%;background-color:transparent;box-shadow:none;border-radius:0;
  -webkit-mask:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent),linear-gradient(transparent,#000 4%,#000 92%,transparent);
  -webkit-mask-composite:source-in;mask:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent),linear-gradient(transparent,#000 4%,#000 92%,transparent);
  mask-composite:intersect}
.rff-dt{position:absolute;left:calc(98px * var(--s));top:calc(72px * var(--s));width:calc(104px * var(--s));height:calc(100px * var(--s));
  border-radius:calc(12px * var(--s));background:#e8e4de;display:flex;flex-direction:column;align-items:center;justify-content:center;
  box-shadow:inset 2px 3px 5px rgba(150,138,124,.45),inset -2px -2px 4px rgba(255,255,255,.85);
  font-family:"Frank Ruhl Libre",Georgia,serif;color:#857c71;text-shadow:0 1px 0 rgba(255,255,255,.8),0 -1px 0 rgba(90,80,70,.22)}
.rff-dt small{font-size:calc(16px * var(--s));letter-spacing:.08em;font-weight:500;line-height:1.2}
.rff-dt b{font-size:calc(46px * var(--s));line-height:1;font-weight:500}
.tb.rff-glow{`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
