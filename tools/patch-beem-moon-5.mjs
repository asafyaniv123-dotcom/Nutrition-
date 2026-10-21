/* Measured on the walk: mounting a Beem stops the page for about a second,
 * and the sun's slide ran during that stop - so it arrived already in place.
 * Both are made BEFORE anything moves: the moon where it sits, the sun
 * waiting out of sight on the right, clipped by the niche. Then only
 * transforms run. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR: ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`.bhelp-b{width:46px;height:46px;pointer-events:none}`,
    `.bhelp-b{position:absolute;left:7px;top:7px;width:46px;height:46px;pointer-events:none}`);
rep(`    try{localStorage.setItem(key,todayStr());}catch(e){}
    _bhelp.B=K.mount(el,{play:BEEM_MOON_STILL});
    /* out to the left and a little down, the way the moon sets... */
    setTimeout(function(){el.className='bhelp-b go';el.style.transform='translate(-64px,14px)';},900);
    /* ...and only once it is gone does he change, out of sight, on the right */
    setTimeout(function(){
      el.className='bhelp-b';el.innerHTML='';el.style.transform='translate(64px,14px)';
      _bhelp.B=K.mount(el,{play:BEEM_SUN_WAKE});
      void el.offsetWidth;   // the start on the right, laid out before the slide
      el.className='bhelp-b come';el.style.transform='translate(0,0)';
    },2600);`,
`    try{localStorage.setItem(key,todayStr());}catch(e){}
    K.mount(el,{play:BEEM_MOON_STILL});
    var sun=document.createElement('div');sun.className='bhelp-b';sun.style.transform='translate(64px,14px)';
    el.parentNode.appendChild(sun);
    _bhelp.B=K.mount(sun,{play:BEEM_SUN_IDLE});
    /* out to the left and a little down, the way the moon sets... */
    setTimeout(function(){el.className='bhelp-b go';el.style.transform='translate(-64px,14px)';},900);
    /* ...and only once it is gone does the sun come in, from the right */
    setTimeout(function(){
      el.remove();sun.id='bhelp-b';
      try{_bhelp.B.play(BEEM_SUN_WAKE);}catch(e){}
      sun.className='bhelp-b come';sun.style.transform='translate(0,0)';
    },2600);`);
fs.writeFileSync(F, s); console.log('patched');
