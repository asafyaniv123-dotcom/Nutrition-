/* The sun's entrance, measured: it appeared already in place. The 64px
 * start and the slide to 0 were two timers 150ms apart, and when they fire
 * together the browser never paints the start, so there is nothing to slide
 * from. A forced layout between them makes the start real. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR: ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`      _bhelp.B=K.mount(el,{play:BEEM_SUN_WAKE});
    },2600);
    setTimeout(function(){el.className='bhelp-b come';el.style.transform='translate(0,0)';},2750);`,
`      _bhelp.B=K.mount(el,{play:BEEM_SUN_WAKE});
      void el.offsetWidth;   // the start on the right, laid out before the slide
      el.className='bhelp-b come';el.style.transform='translate(0,0)';
    },2600);`);
fs.writeFileSync(F, s); console.log('patched');
