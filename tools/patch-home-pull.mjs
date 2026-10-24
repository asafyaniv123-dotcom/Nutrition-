/* Home, two things Asaf asked for on 24 Oct:
 *  1. the command line sat 14px under the dial - too close. More room.
 *  2. pulling the page down showed nothing above it ("it looks a bit naked").
 *     Now the gap fills with the app's own warm light, and it grows with the
 *     pull: a fixed layer at the top whose height follows how far past the
 *     top the page has been pulled. iOS reports that as a negative scrollY
 *     while it bounces; fixed elements stay put, so the layer fills exactly
 *     the space the pull uncovers. Nowhere else does this paint anything. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };

rep(`.hcmd{width:100%;max-width:380px;margin:0 0 18px}`, `.hcmd{width:100%;max-width:380px;margin:22px 0 18px}
/* THE PULL. Height is written by pullGlowPaint; at rest it is zero and paints
   nothing. The light comes down from the top edge, the colour of the dial's
   arc, fading into the page. */
#pull-glow{position:fixed;top:0;left:0;right:0;height:0;z-index:-1;pointer-events:none;
  background:radial-gradient(120% 100% at 50% 0%,rgba(240,169,46,.42),rgba(240,169,46,.16) 45%,rgba(245,240,235,0) 100%),#f5f0eb}`);

rep(`function hcmdMount(){`, `/* one paint per frame, and only while the page is pulled past its top */
function pullGlowPaint(){
  var el=document.getElementById('pull-glow'),y=window.scrollY||0;
  if(!el){el=document.createElement('div');el.id='pull-glow';document.body.insertBefore(el,document.body.firstChild);}
  el.style.height=(y<0?Math.round(-y):0)+'px';
}
(function(){
  var q=0;
  window.addEventListener('scroll',function(){
    if(q)return;q=1;requestAnimationFrame(function(){q=0;pullGlowPaint();});
  },{passive:true});
})();
function hcmdMount(){`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('patched');
