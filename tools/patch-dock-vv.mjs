/* Asaf's recording (27 Oct): with the keyboard up in Safari, scrolling the
 * hours carried the writing bar away. iOS Safari keeps position:fixed on the
 * LAYOUT viewport while the keyboard shrinks the VISUAL one, so a fixed bar
 * slides under the keyboard as the page moves. While the bar's own field has
 * focus it is placed on the visual viewport's bottom edge, on every resize
 * and scroll of it. Where the page itself is resized (the iPhone shell) the
 * two viewports are one and this changes nothing. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`document.addEventListener('focusout',function(){
  setTimeout(function(){if(!kbIsField(document.activeElement))document.body.classList.remove('kb-open','kb-dock');},60);
});`,
`document.addEventListener('focusout',function(){
  setTimeout(function(){if(!kbIsField(document.activeElement)){document.body.classList.remove('kb-open','kb-dock');dpDockPin();}},60);
});
/* the writing bar rides the keyboard: its top follows the visible area */
function dpDockPin(){
  var d=document.getElementById('dp-rail');if(!d)return;
  var vv=window.visualViewport;
  if(!vv||!document.body.classList.contains('kb-dock')){d.style.top='';d.style.bottom='';return;}
  d.style.bottom='auto';d.style.top=Math.round(vv.offsetTop+vv.height-d.offsetHeight-8)+'px';
}
if(window.visualViewport){visualViewport.addEventListener('resize',dpDockPin);visualViewport.addEventListener('scroll',dpDockPin);}
document.addEventListener('focusin',function(){setTimeout(dpDockPin,0);});`);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
