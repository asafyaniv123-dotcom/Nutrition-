/* What Asaf found walking the new first run on his phone, 21 Oct:
 *  1. the first summary's light arrived in a jump, and saving day one passed
 *     without a moment of its own;
 *  2. "turn it with your thumb" - and the thumb dragged the whole page, because
 *     the tour's veil sat over the dial and caught every touch;
 *  3. the tour called the centre "the well"; it is סיום יום, fed by every area;
 *  4. "יופי" was an odd button, and Beem was simply gone the moment it was pressed. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

/* 1 - the fill rises instead of jumping. A gradient's size cannot transition,
   but a registered number can, and the gradient is drawn from it. Its own
   name: --fill is also the home hub's, and registering that would change it. */
rep(`/* the well of סיום יום, for the first reflection */
.dr-well{position:absolute;z-index:1;left:calc(50% - 56px);top:34px;width:112px;height:112px;border-radius:50%;overflow:hidden;opacity:0;
  transform:scale(.8);transition:opacity .6s,transform .8s cubic-bezier(.2,.9,.3,1),box-shadow .8s;`,
`/* the well of סיום יום, for the first reflection. --drf is registered so the
   light can RISE: a gradient's size does not transition, a number does. */
@property --drf{syntax:'<number>';inherits:true;initial-value:0}
.dr-well{position:absolute;z-index:1;left:calc(50% - 56px);top:34px;width:112px;height:112px;border-radius:50%;overflow:hidden;opacity:0;
  transform:scale(.8);transition:opacity .6s,transform .8s cubic-bezier(.2,.9,.3,1),box-shadow .8s,--drf 2.6s cubic-bezier(.35,.1,.25,1);`);
rep(`.dr-well i{position:absolute;inset:0;border-radius:50%;transition:background .9s ease;
  background:radial-gradient(85% calc(var(--fill,0) * 100% + 4%) at 50% 104%,`,
`.dr-well i{position:absolute;inset:0;border-radius:50%;
  background:radial-gradient(85% calc(var(--drf) * 100% + 4%) at 50% 104%,`);
rep(`function doorFill(p){var f=document.getElementById('dr-fill');if(f)f.parentNode.style.setProperty('--fill',p);}`,
`function doorFill(p){var f=document.getElementById('dr-fill');if(f)f.parentNode.style.setProperty('--drf',p);}
/* DAY ONE, SAVED. Beem's own beads burst from the light - the same glossy
   amber, orange and red he is made of, so it is his, not a party popper -
   and the phone answers in the hand where it can. */
function doorCheer(){
  appHaptic();
  var wl=document.querySelector('.dr-well');if(!wl)return;
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var r=wl.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,
      C=['#f6b73c','#f08a3c','#e8553a','#f9cf5a'],i;
  for(i=0;i<34;i++){
    var b=document.createElement('i'),a=Math.random()*Math.PI*2,d=70+Math.random()*120,z=5+Math.random()*7,c=C[i%C.length];
    b.className='dr-bead';
    b.style.cssText='left:'+(cx-z/2)+'px;top:'+(cy-z/2)+'px;width:'+z+'px;height:'+z+'px;'+
      'background:radial-gradient(circle at 35% 30%,#fff8 0 18%,'+c+' 45%,color-mix(in srgb,'+c+' 70%,#7a2a10))';
    document.body.appendChild(b);
    var dx=Math.cos(a)*d,dy=Math.sin(a)*d;
    b.animate([{transform:'translate(0,0) scale(.3)',opacity:0},{transform:'translate('+dx*.7+'px,'+dy*.7+'px) scale(1)',opacity:1,offset:.35},
      {transform:'translate('+dx+'px,'+(dy+140)+'px) scale(.8)',opacity:0}],
      {duration:1500+Math.random()*700,easing:'cubic-bezier(.2,.7,.4,1)',delay:Math.random()*120,fill:'forwards'})
      .onfinish=(function(x){return function(){x.remove();};})(b);
  }
}
/* A tap in the hand. Android has vibrate; iOS Safari has none, but since iOS
   18 toggling a native switch gives a haptic tick, and a label click is
   enough to toggle it - so that is the fallback. Neither is guaranteed: the
   platform owns haptics, which is why this is a nicety and never a signal. */
function appHaptic(){
  try{if(navigator.vibrate){navigator.vibrate([14,60,22]);return;}}catch(e){}
  try{
    var l=document.createElement('label'),c=document.createElement('input');
    c.type='checkbox';c.setAttribute('switch','');l.appendChild(c);
    l.style.cssText='position:fixed;left:-99px;top:0;opacity:0;pointer-events:none';
    document.body.appendChild(l);l.click();setTimeout(function(){l.remove();},300);
  }catch(e){}
}`);
rep(`.dr-step{position:absolute;inset:0;box-sizing:border-box;`, `.dr-bead{position:fixed;z-index:10000;border-radius:50%;pointer-events:none;box-shadow:0 1px 2px rgba(120,50,20,.25)}
.dr-step{position:absolute;inset:0;box-sizing:border-box;`);

/* the moment fills it most of the way; day one, once the well has arrived,
   finishes the rise - and the beads come when the light is full */
rep(`  doorFill(1);doorBeem('glad');setTimeout(doorNext,700);
}`, `  doorFill(.6);doorBeem('glad');setTimeout(doorNext,900);
}`);
rep(`  if(step==='timeok'||step==='day1'||step==='remind')doorBeem('glad');`,
`  if(step==='timeok'||step==='day1'||step==='remind')doorBeem('glad');
  if(step==='day1'){setTimeout(function(){doorFill(1);},700);setTimeout(doorCheer,3000);}`);

/* 4 - not "יופי", and Beem does not just vanish: a smile first */
rep(`      '<button class="dr-btn" onclick="doorNext()">'+_t('יופי')+'</button>';`,
`      '<button class="dr-btn" onclick="doorDay1Go(this)">'+_t('המשך')+'</button>';`);
rep(`function doorBeem(k){`, `function doorDay1Go(b){
  if(b)b.disabled=true;
  doorBeem('beam');setTimeout(doorNext,1200);
}
function doorBeem(k){`);
rep(`  glad:{dur:6000,`, `  beam:{dur:2400,ev:[[0,'face','happy'],[0,'mode',{breathe:[.02,4],idle:0}],[60,'nod',1,12],[420,'face','wink'],[760,'face','happy'],
    [300,'fx',{t:'rings',v:{sc:[1.12,1.16,1.2]},d:900,s:80}]]},
  glad:{dur:6000,`);

/* 3 - it is סיום יום, and it is fed by everything */
rep(`'<div class="dr-sub2">'+_t('רואה איך הבאר התמלאה? כך היא תיראה בכל ערב שתסכם.')+'</div></div>'+`,
`'<div class="dr-sub2">'+_t('רואה את האור? כך מתמלא סיום היום, בכל ערב שתסכם.')+'</div></div>'+`);
rep(`{el:'.hdial .chub',t:_t('וזו הבאר.'),d:_t('כל ערב, כשתסכם את היום, היא מתמלאת באור. זה הלב של הכול.')}`,
`{el:'.hdial .chub',t:_t('וזה סיום היום.'),d:_t('כל אזור שאתה עוקב אחריו מזין אותו. בערב לוחצים כאן, מסכמים את היום, והוא מתמלא באור.')}`);

/* 2 - the veil catches touches only where it is painted; through the hole the
   dial is live, so the thumb turns it instead of dragging the page. A press on
   an area during the tour is held back - opening one mid-sentence loses her. */
rep(`.tour{position:fixed;inset:0;z-index:9990;pointer-events:auto}
.tour svg{position:absolute;inset:0;width:100%;height:100%}
.tour path{fill:rgba(42,34,27,.58)}`,
`.tour{position:fixed;inset:0;z-index:9990;pointer-events:none}
.tour svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.tour path{fill:rgba(42,34,27,.58);pointer-events:visiblePainted;touch-action:none}
.tour-c{pointer-events:auto;touch-action:none}`);
rep(`  function end(){try{localStorage.setItem(TOUR_KEY,'1');}catch(e){}var t=document.getElementById('tour');if(t)t.remove();}
  document.getElementById('tour-n').onclick`,
`  function hold(e){var t=e.target.closest&&e.target.closest('.hdisc,.chub');if(t&&document.getElementById('tour')){e.stopPropagation();e.preventDefault();}}
  document.addEventListener('click',hold,true);
  function end(){try{localStorage.setItem(TOUR_KEY,'1');}catch(e){}document.removeEventListener('click',hold,true);
    var t=document.getElementById('tour');if(t)t.remove();}
  document.getElementById('tour-n').onclick`);
fs.writeFileSync(F, s);
console.log('patched');
