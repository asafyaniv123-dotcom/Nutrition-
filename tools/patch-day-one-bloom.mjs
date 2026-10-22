/* Day one, saved: "the light opens" (option A of review/day-one-cheer, Asaf,
 * 22 Oct) instead of the bead confetti. A warm ring leaves the well and opens
 * across the screen, a softer one after it, over a brief warm wash - nothing
 * flies. Beem is surprised, hops, smiles, and settles back to calm.
 * Option C, Beem's own ring going out, he asked to keep for another moment:
 * it lives on as beemRingOut(x,y), ready and unused. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };

const i0 = s.indexOf('/* DAY ONE, SAVED. Beem\'s own beads burst from the light');
const i1 = s.indexOf('/* A tap in the hand.', i0);
if (i0 < 0 || i1 < 0) { console.log('no doorCheer'); process.exit(1); }
s = s.slice(0, i0) + `/* DAY ONE, SAVED: THE LIGHT OPENS. A warm ring leaves the well and opens
   across the screen, a softer one after it, over a moment of warm wash -
   nothing flies (Asaf chose this over bead confetti, 22 Oct). Beem is
   surprised, hops, smiles, and goes back to his ordinary eyes. */
var BEEM_MOMENT={dur:1e9,ev:[[0,'face','surprised'],[0,'mode',{idle:0,breathe:[.016,4]}],[250,'face','happy'],[250,'hop',70],
  [250,'burst',1.4],[1300,'nod',1,8],[2800,'face','calm']]};
function doorCheer(){
  appHaptic();
  try{if(_dr.beem)_dr.beem.play(BEEM_MOMENT);}catch(e){}
  var wl=document.querySelector('.dr-well');if(!wl)return;
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var r=wl.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,d=Math.max(r.width,120),i,
      w=document.createElement('div');
  w.className='dr-bloom';
  w.innerHTML='<i class="dr-bloom-wash"></i><i class="dr-bloom-ring"></i><i class="dr-bloom-ring b"></i>';
  w.style.setProperty('--x',x+'px');w.style.setProperty('--y',y+'px');w.style.setProperty('--d',d+'px');
  document.body.appendChild(w);
  requestAnimationFrame(function(){for(i=0;i<w.children.length;i++)w.children[i].classList.add('go');});
  setTimeout(function(){w.remove();},3600);
}
/* BEEM'S OWN RING, GOING OUT - option C of the same page, which Asaf liked
   and asked to keep for another moment. His beads leave him once as a single
   ring that opens wide and fades: his shape, made big. Not used yet. */
function beemRingOut(x,y){
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var C=['#f6b73c','#f08a3c','#e8553a','#f9cf5a'],n=36,i,z=7,R=40;
  for(i=0;i<n;i++){
    var b=document.createElement('i'),a=i/n*Math.PI*2,c=C[i%4],R2=230+(i%2)*14;
    b.className='dr-bead';
    b.style.cssText='left:'+(x-z/2)+'px;top:'+(y-z/2)+'px;width:'+z+'px;height:'+z+'px;'+
      'background:radial-gradient(circle at 35% 30%,#fff8 0 18%,'+c+' 45%,color-mix(in srgb,'+c+' 70%,#7a2a10))';
    document.body.appendChild(b);
    b.animate([{transform:'translate('+Math.cos(a)*R+'px,'+Math.sin(a)*R+'px)',opacity:0},
      {transform:'translate('+Math.cos(a)*(R+20)+'px,'+Math.sin(a)*(R+20)+'px)',opacity:1,offset:.12},
      {transform:'translate('+Math.cos(a)*R2+'px,'+Math.sin(a)*R2+'px) scale(.6)',opacity:0}],
      {duration:2200,easing:'cubic-bezier(.15,.7,.3,1)',fill:'both'})
      .onfinish=(function(e){return function(){e.remove();};})(b);
  }
}
` + s.slice(i1);

rep(`.dr-bead{position:fixed;z-index:10000;border-radius:50%;pointer-events:none;box-shadow:0 1px 2px rgba(120,50,20,.25)}`,
`.dr-bead{position:fixed;z-index:10000;border-radius:50%;pointer-events:none;box-shadow:0 1px 2px rgba(120,50,20,.25)}
/* the light opens: rings of warm light from the well, and a brief wash */
.dr-bloom{position:fixed;inset:0;z-index:10000;pointer-events:none;overflow:hidden}
.dr-bloom-ring{position:absolute;left:var(--x);top:var(--y);width:var(--d);height:var(--d);margin:calc(var(--d) / -2) 0 0 calc(var(--d) / -2);border-radius:50%;opacity:0;
  box-shadow:0 0 34px 10px rgba(255,206,140,.55),inset 0 0 30px 8px rgba(255,226,180,.5)}
.dr-bloom-ring.go{animation:drBloom 2.4s cubic-bezier(.2,.7,.3,1) forwards}
.dr-bloom-ring.b.go{animation-delay:.35s;animation-duration:2.8s}
@keyframes drBloom{0%{transform:scale(.9);opacity:0}12%{opacity:1}100%{transform:scale(5.2);opacity:0}}
.dr-bloom-wash{position:absolute;inset:0;opacity:0;background:radial-gradient(circle at var(--x) var(--y),rgba(255,236,200,.55),rgba(255,236,200,0) 60%)}
.dr-bloom-wash.go{animation:drWash 2.6s ease forwards}
@keyframes drWash{0%{opacity:0}25%{opacity:1}100%{opacity:0}}`);
fs.writeFileSync(F, s);
console.log('patched');
