/* The chat/dial change as a blur (Asaf, 27 Oct), and the patchy screen it
 * replaced. Sliding moved the home's children with a transform, and a
 * transform makes a box the frame for anything fixed inside it - the chat's
 * glass and the command bar jumped into the moving box (a pale slab at the
 * top, the bar over the switch). Nothing on the home moves now: a veil of the
 * page's own blur rises over the screen, the views change under it at its
 * thickest, and it clears. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`  /* what shows leaves the way the thumb went, then the other arrives */
  clearTimeout(_hchT);
  hs.classList.remove('hch-in','to-chat','to-dial');void hs.offsetWidth;
  hs.classList.add('hch-out','to-'+m);
  _hchT=setTimeout(function(){
    hchSync();if(m==='dial'){try{renderHomeGrid();}catch(e){}}
    hs.classList.remove('hch-out');void hs.offsetWidth;hs.classList.add('hch-in');
    _hchT=setTimeout(function(){hs.classList.remove('hch-in','to-chat','to-dial');},420);
  },200);`,
`  /* a veil of blur rises, the views change beneath it, and it clears */
  clearTimeout(_hchT);
  var v=document.getElementById('hch-veil');
  if(!v){v=document.createElement('div');v.id='hch-veil';document.body.appendChild(v);}
  v.classList.remove('off');void v.offsetWidth;v.classList.add('on');
  _hchT=setTimeout(function(){
    hchSync();if(m==='dial'){try{renderHomeGrid();}catch(e){}}
    requestAnimationFrame(function(){v.classList.remove('on');v.classList.add('off');});
  },240);`);
const a=s.indexOf('#home-screen.hch-out>*'),b=s.indexOf('@keyframes hchIn{');
if(a<0||b<0){console.log('css anchors');process.exit(1);}
const e=s.indexOf('\n',b);
s=s.slice(0,a)+`/* the veil the two views change under */
#hch-veil{position:fixed;inset:0;z-index:6;pointer-events:none;opacity:0;
  -webkit-backdrop-filter:blur(0);backdrop-filter:blur(0);background:rgba(245,240,233,0);
  transition:opacity .24s ease,backdrop-filter .24s ease,-webkit-backdrop-filter .24s ease,background .24s ease}
#hch-veil.on{opacity:1;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);background:rgba(245,240,233,.35)}
#hch-veil.off{transition-duration:.42s}`+s.slice(e);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
