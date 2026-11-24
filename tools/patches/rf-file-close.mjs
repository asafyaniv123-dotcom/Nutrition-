// Filing the day: Asaf saw "a strange jump", not a binder closing (24 Nov, on the phone). Two causes, both measured
// in frames at a fifth of the speed:
//  1. The cover turned on a NEGATIVE angle, which swings its free edge AWAY from the reader - behind the page, in
//     the same 3D context - so it was hidden the whole way and appeared all at once, already shut. A cover closes
//     toward you: positive angles.
//  2. The binder took the page's own proportions, and the magazine page is 2.5 times taller than wide, so it was a
//     thin strip. It is a binder now, 3 by 4, and the page is tucked in: scaled to its width, its foot clipped.
// usage: node tools/patches/rf-file-close.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`  var k=Math.min((innerWidth*.62-inset*2)/c.width,(innerHeight*.46-inset*2)/c.height,1);
  var W=Math.round(c.width*k+inset*2),H=Math.round(c.height*k+inset*2),cx=innerWidth/2,cy=innerHeight*.44;`,
   `  /* a binder is a binder, 3 by 4, whatever the page's length: the page goes in at its width and its foot is tucked */
  var W=Math.round(Math.min(innerWidth*.62,innerHeight*.46*.75)),H=Math.round(W/.75);
  var k=Math.min((W-inset*2)/c.width,1),tuck=Math.max(0,Math.round(c.height-(H-inset*2)/k)),cx=innerWidth/2,cy=innerHeight*.44;`],
  [`  go(pg,[{transform:at(c.left-x0,c.top-y0)+' scale(1)'},{transform:at(inset,inset)+' scale('+k+')'}],800)
  .then(function(){return go(cv,[{opacity:0,transform:'rotateY(-88deg)'},{opacity:1,transform:'rotateY(-80deg)',offset:.15},{opacity:1,transform:'rotateY(0)'}],750);})`,
   `  go(pg,[{transform:at(c.left-x0,c.top-y0)+' scale(1)',clipPath:'inset(0 0 0)'},
    {transform:at(inset,inset)+' scale('+k+')',clipPath:'inset(0 0 '+tuck+'px)'}],800)
  .then(function(){return go(cv,[{opacity:0,transform:'rotateY(176deg)'},{opacity:0,transform:'rotateY(92deg)',offset:.3},
    {opacity:1,transform:'rotateY(86deg)',offset:.36},{opacity:1,transform:'rotateY(0)'}],900,'cubic-bezier(.45,0,.3,1)');})`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
