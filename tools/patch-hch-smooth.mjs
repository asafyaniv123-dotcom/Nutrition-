/* The home's chat/dial switch, smooth (Asaf, 27 Oct: "still jumps"). The
 * switch was rewritten on every change, so its lit half could only appear,
 * never travel. Now the two buttons are built once and only change class, and
 * the lit half is the switch's own thumb, sliding under them. The screens
 * change as a real transition: what is showing slides out the way the thumb
 * goes and fades, then the other comes in from the opposite side. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`  var m=document.getElementById('hch-mode');
  if(m)m.innerHTML='<button class="'+(on?'':'on')+'" onclick="hchSetMode(\\'dial\\')" aria-pressed="'+(!on)+'" aria-label="'+esc(_t('חוגה'))+'">'+HCH_DIAL+'</button>'+
    '<button class="'+(on?'on':'')+'" onclick="hchSetMode(\\'chat\\')" aria-pressed="'+on+'" aria-label="'+esc(_t('צ׳אט'))+'">'+HCH_CHAT+'</button>';`,
`  var m=document.getElementById('hch-mode');
  /* built once; afterwards only the classes move, so the thumb can travel */
  if(m&&m.children.length!==2)m.innerHTML='<button onclick="hchSetMode(\\'dial\\')">'+HCH_DIAL+'</button><button onclick="hchSetMode(\\'chat\\')">'+HCH_CHAT+'</button>';
  if(m){var b=m.children;b[0].className=on?'':'on';b[1].className=on?'on':'';
    b[0].setAttribute('aria-pressed',String(!on));b[1].setAttribute('aria-pressed',String(on));
    b[0].setAttribute('aria-label',_t('חוגה'));b[1].setAttribute('aria-label',_t('צ׳אט'));
    m.classList.toggle('c',on);}`);
rep(`function hchSetMode(m){
  try{localStorage.setItem(HCH_MODE_KEY,m);}catch(e){}
  /* the two views cross over rather than cut */
  var hs=document.getElementById('home-screen');
  if(hs){hs.classList.remove('hch-swap');void hs.offsetWidth;hs.classList.add('hch-swap');setTimeout(function(){hs.classList.remove('hch-swap');},520);}
  hchSync();
  if(m==='dial'){try{renderHomeGrid();}catch(e){}}
}`,
`var _hchT=0;
function hchSetMode(m){
  if(m===hchMode())return;
  try{localStorage.setItem(HCH_MODE_KEY,m);}catch(e){}
  var hs=document.getElementById('home-screen'),sw=document.getElementById('hch-mode');
  /* the thumb goes first */
  if(sw){sw.classList.toggle('c',m==='chat');var b=sw.children;if(b.length===2){b[0].className=m==='chat'?'':'on';b[1].className=m==='chat'?'on':'';}}
  if(!hs||matchMedia('(prefers-reduced-motion: reduce)').matches){hchSync();if(m==='dial'){try{renderHomeGrid();}catch(e){}}return;}
  /* what shows leaves the way the thumb went, then the other arrives */
  clearTimeout(_hchT);
  hs.classList.remove('hch-in','to-chat','to-dial');void hs.offsetWidth;
  hs.classList.add('hch-out','to-'+m);
  _hchT=setTimeout(function(){
    hchSync();if(m==='dial'){try{renderHomeGrid();}catch(e){}}
    hs.classList.remove('hch-out');void hs.offsetWidth;hs.classList.add('hch-in');
    _hchT=setTimeout(function(){hs.classList.remove('hch-in','to-chat','to-dial');},420);
  },200);
}`);
/* the generic glide stays off this one: it has its own thumb */
rep(`  ['#hch-mode','button','.on'],['.tabbar','.tb','.on']`,`  ['.tabbar','.tb','.on']`);
rep(`#home-screen.hch-swap>*:not(.home-menu):not(.hch-mode){animation:hchSwap .45s cubic-bezier(.22,.61,.36,1) both}
@keyframes hchSwap{from{opacity:0;transform:translateY(10px) scale(.99)}}`,
`/* the home's switch: its own thumb, and the screens pass each other (27.10) */
.hch-mode{isolation:isolate}
.hch-mode::before{content:"";position:absolute;top:3px;bottom:3px;inset-inline-start:3px;width:38px;border-radius:999px;z-index:-1;
  background:rgba(255,255,255,.62);box-shadow:inset 0 0 0 .5px rgba(255,255,255,.75),inset 0 1px 0 rgba(255,255,255,.95),0 6px 14px -5px rgba(110,92,72,.2);
  transition:transform .38s cubic-bezier(.3,.7,.2,1)}
html[dir=rtl] .hch-mode.c::before{transform:translateX(-40px)}
html[dir=ltr] .hch-mode.c::before{transform:translateX(40px)}
html body .hch-mode button.on{background:transparent!important;box-shadow:none!important}
.hch-mode button{transition:color .3s}
#home-screen.hch-out>*:not(.home-menu):not(.hch-mode):not(.hch),#home-screen.hch-out.hch-on .hch{transition:opacity .2s ease,transform .2s ease;opacity:0}
html[dir=rtl] #home-screen.hch-out.to-chat>*:not(.home-menu):not(.hch-mode):not(.hch),html[dir=ltr] #home-screen.hch-out.to-dial.hch-on .hch{transform:translateX(-36px)}
html[dir=rtl] #home-screen.hch-out.to-dial.hch-on .hch,html[dir=ltr] #home-screen.hch-out.to-chat>*:not(.home-menu):not(.hch-mode):not(.hch){transform:translateX(36px)}
#home-screen.hch-in>*:not(.home-menu):not(.hch-mode):not(.hch),#home-screen.hch-in.hch-on .hch{animation:hchIn .4s cubic-bezier(.22,.61,.36,1) both}
html[dir=rtl] #home-screen.hch-in.to-chat,html[dir=ltr] #home-screen.hch-in.to-dial{--hch-from:36px}
html[dir=rtl] #home-screen.hch-in.to-dial,html[dir=ltr] #home-screen.hch-in.to-chat{--hch-from:-36px}
@keyframes hchIn{from{opacity:0;transform:translateX(var(--hch-from,0))}}`);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
