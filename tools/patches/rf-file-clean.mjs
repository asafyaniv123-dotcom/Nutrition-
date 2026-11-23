// Filing the day, cleaned up after Asaf saw it on the phone (23 Nov: "דברים דורסים אחד על השני ומכסים"). Four collisions,
// each seen in a frame-by-frame capture: the done screen stayed under the binder (Mip, the text and the button showed
// through); Mip's evening timer fired mid-flight and turned the page to night under it; the cover's back face showed as a
// mirrored date beside the binder while it began to close; and a tap during the flight reached the tab bar beneath.
// usage: node tools/patches/rf-file-clean.mjs [--reverse]
import fs from 'node:fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [];
const P = (a, b) => pairs.push([a, b]);

// the stage is cleared, and nothing under it can be touched while the day is being filed
P(`.rff{position:fixed;inset:0;z-index:9000;pointer-events:none;perspective:900px}`,
  `.rff{position:fixed;inset:0;z-index:9000;pointer-events:auto;perspective:900px;touch-action:none}`);
// the cover turns in from edge-on, so its back is never seen
P(`.rff-cover{transform-origin:right center;opacity:0;backface-visibility:visible;`,
  `.rff-cover{transform-origin:right center;opacity:0;backface-visibility:hidden;`);
P(`  .then(function(){return go(cv,[{opacity:0,transform:'rotateY(-165deg)'},{opacity:1,transform:'rotateY(-150deg)',offset:.1},{opacity:1,transform:'rotateY(0)'}],850);})`,
  `  .then(function(){return go(cv,[{opacity:0,transform:'rotateY(-88deg)'},{opacity:1,transform:'rotateY(-80deg)',offset:.15},{opacity:1,transform:'rotateY(0)'}],750);})`);
// the done screen steps back before the page moves: only the page and the binder are on the stage
P(`  card.style.visibility='hidden';
  var bk=ov.querySelector('.rff-bk')`,
  `  card.style.visibility='hidden';
  var body=card.closest('.rf-body');
  if(body&&body.animate)body.animate([{opacity:1},{opacity:0}],{duration:260,fill:'forwards'});
  var bk=ov.querySelector('.rff-bk')`);
// and Mip does not fall asleep in the middle of it
P(`      if(!_rfEl.isConnected)return;
      try{K.glow(b,0);b.play(BEEM_NIGHT);}catch(e){}`,
  `      if(!_rfEl.isConnected||_rffBusy)return;
      try{K.glow(b,0);b.play(BEEM_NIGHT);}catch(e){}`);

if (rev) {
  for (const [a, b] of pairs.slice().reverse()) { if (s.split(b).length !== 2) throw new Error('reverse: not once: ' + b.slice(0, 80)); s = s.replace(b, () => a); }
} else {
  for (const [a, b] of pairs) { if (s.split(a).length !== 2) throw new Error('not once: ' + a.slice(0, 80)); s = s.replace(a, () => b); }
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied', pairs.length);
