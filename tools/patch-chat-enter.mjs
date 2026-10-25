/* chat prototype, round 3 (Asaf: "when an area is chosen, its slide up
 * should be gentler, and Mip and the other areas should disappear softly, so
 * you know you entered an area - Mip himself is not inside the areas").
 *  - the slide: longer and eased out, no overshoot, the tile lifting as one
 *    piece (a uniform scale, so the glass never stretches on the way).
 *  - the other areas: fade, sink a little and blur, one after another from
 *    the chosen one outwards; only then does the row fold away, so nothing
 *    jumps. Going back plays it in reverse.
 *  - Mip: fades and recedes as the area arrives; where he stood, the area's
 *    own sign settles in, a glass disc with its icon. Inside an area the
 *    answers come from the area (its disc beside them), not from Mip. */
import fs from 'fs';
const F = 'review/chat-proto/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };

/* CSS */
rep(`.mip{width:150px;height:150px;margin:0 auto}`, `.sign{position:relative;width:150px;height:150px;margin:0 auto}
.mip{position:absolute;inset:0;transition:opacity .55s ease,transform .7s cubic-bezier(.22,.61,.36,1),filter .55s ease}
.picked .mip{opacity:0;transform:scale(.86) translateY(-6px);filter:blur(6px)}
.adisc{position:absolute;left:50%;top:50%;width:96px;height:96px;margin:-48px 0 0 -48px;border-radius:50%;display:grid;place-items:center;
  opacity:0;transform:scale(.9);filter:blur(4px);transition:opacity .6s ease .25s,transform .8s cubic-bezier(.22,.61,.36,1) .2s,filter .6s ease .25s;
  background:rgba(255,255,255,.46);backdrop-filter:blur(22px) saturate(1.25);-webkit-backdrop-filter:blur(22px) saturate(1.25);
  box-shadow:inset 0 0 0 .5px rgba(255,255,255,.75),inset 0 1px 0 rgba(255,255,255,.95),0 1px 2px rgba(110,92,72,.05),0 14px 34px -8px rgba(110,92,72,.16)}
.adisc::before{content:"";position:absolute;inset:14px;z-index:-1;border-radius:50%;filter:blur(18px);background:color-mix(in srgb,var(--c) 34%,transparent)}
.adisc svg{width:40px;height:40px;fill:none;stroke:var(--c);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.picked .adisc{opacity:1;transform:none;filter:none}
.hello,.hello2{transition:opacity .35s ease}
.swap .hello,.swap .hello2{opacity:0}
.it .av.area{border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.46);
  box-shadow:inset 0 0 0 .5px rgba(255,255,255,.75),inset 0 1px 0 rgba(255,255,255,.95),0 4px 10px -3px rgba(110,92,72,.14)}
.it .av.area svg{width:18px;height:18px;fill:none;stroke:var(--c);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}`);
rep(`.ar.hide{opacity:0;pointer-events:none}`, `.ar.hide{opacity:0;pointer-events:none}
/* the others leave softly, one after another, then the row folds away */
.areas{transition:max-height .55s cubic-bezier(.4,0,.2,1),padding .55s cubic-bezier(.4,0,.2,1);max-height:240px;overflow:hidden}
.ph .ar.leave{opacity:0;transform:translateY(8px) scale(.94);filter:blur(4px);pointer-events:none;
  transition:opacity .42s ease var(--d,0s),transform .5s cubic-bezier(.4,0,.2,1) var(--d,0s),filter .42s ease var(--d,0s)}
.areas.folded{max-height:0;padding-top:0;padding-bottom:0}`);
rep(`<div class="mip" id="mip"></div>`, `<div class="sign"><div class="mip" id="mip"></div><div class="adisc" id="adisc"></div></div>`);

/* JS: choose and back */
rep(`  requestAnimationFrame(function(){requestAnimationFrame(function(){top.style.transition='';top.style.transform='';});});
  cur=k;var a=area(k);ph.classList.add('picked');
  hello.textContent=a[2];hello2.textContent='מדבר עם '+a[1];
  [].forEach.call(areas.children,function(b){if(b!==el)b.classList.add('hide');});
  areas.style.display='none';`,
`  /* one uniform scale on the way up: the glass never stretches */
  var k0=r0.height/r1.height;
  top.style.transform='translate('+((r0.left+(r0.width-r1.width*k0)/2-r1.left)/sc)+'px,'+((r0.top-r1.top)/sc)+'px) scale('+k0+')';
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    top.style.transition='transform .85s cubic-bezier(.22,.61,.36,1),opacity .5s ease';top.style.transform='';});});
  cur=k;var a=area(k);
  adisc.style.setProperty('--c',COL[k]);adisc.innerHTML=ICON[k]||'';
  /* the words change while they are out of sight */
  empty.classList.add('swap');
  setTimeout(function(){hello.textContent=a[2];hello2.textContent='מדבר עם '+a[1];empty.classList.remove('swap');},380);
  ph.classList.add('picked');
  /* the others leave from the chosen one outwards */
  var list=[].slice.call(areas.children),at=list.indexOf(el);
  list.forEach(function(b,i){if(b===el)return;b.style.setProperty('--d',(Math.abs(i-at)*0.045)+'s');b.classList.add('leave');});
  clearTimeout(window._fold);window._fold=setTimeout(function(){if(cur)areas.classList.add('folded');sizeDock();},430);
  setTimeout(sizeDock,1000);`);
rep(`  head.innerHTML='';areas.style.display='';[].forEach.call(areas.children,function(b){b.classList.remove('hide');});
  ph.classList.remove('picked');cur=null;hello.textContent=greet()+', אסף';hello2.textContent='על מה נדבר?';`,
`  var top=head.firstChild;
  if(top&&!silent){top.style.transition='opacity .4s ease,transform .5s ease';top.style.opacity='0';top.style.transform='translateY(-6px) scale(.96)';
    setTimeout(function(){if(!cur)head.innerHTML='';},420);}
  else head.innerHTML='';
  clearTimeout(window._fold);areas.classList.remove('folded');
  /* the row opens first, then they return, in reverse order */
  var list=[].slice.call(areas.children),n=list.length;
  setTimeout(function(){list.forEach(function(b,i){b.classList.remove('hide');b.style.setProperty('--d',((n-1-i)*0.035)+'s');b.classList.remove('leave');});},silent?0:220);
  empty.classList.add('swap');
  setTimeout(function(){hello.textContent=greet()+', אסף';hello2.textContent='על מה נדבר?';empty.classList.remove('swap');},silent?0:300);
  ph.classList.remove('picked');cur=null;setTimeout(sizeDock,700);`);
/* inside an area the answer comes from the area */
const av = `'<i class="av"></i><div>'+r[0]`;
rep(av, `(cur?'<i class="av area" style="--c:'+COL[cur]+'">'+(ICON[cur]||'')+'</i>':'<i class="av"></i>')+'<div>'+r[0]`);
rep(`w.innerHTML='<i class="av"></i><div class="dots">`, `w.innerHTML=(cur?'<i class="av area" style="--c:'+COL[cur]+'">'+(ICON[cur]||'')+'</i>':'<i class="av"></i>')+'<div class="dots">`);
fs.writeFileSync(F, s);
console.log('ok');
