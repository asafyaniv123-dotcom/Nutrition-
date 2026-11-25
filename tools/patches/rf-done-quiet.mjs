// סיום יום, after the day is closed (25 Nov): Asaf saw it on the phone - "take out that bar with the three yellow
// balls, I don't like it", and the line with the mood and the score goes too; only "open again" stays under the title.
// The thread, its beads and assets/rf-bead.webp are removed whole rather than hidden. rfRecap stays: the days
// before still use it. usage: node tools/patches/rf-done-quiet.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`  if(_bDone&&_bN)h+=rfStreakArcHTML(_bN)+'<div class="rf-streak">'`,
   `  if(_bDone&&_bN)h+='<div class="rf-streak">'`],
  [`    h+='<div class="rf-hero-t">'+_t('סיכמת את היום שלך.')+'</div>';
    h+='<div class="rf-hero-s">'+rfRecap(r)+'</div>';`,
   `    h+='<div class="rf-hero-t">'+_t('סיכמת את היום שלך.')+'</div>';`],
  [`/* the streak as a lit thread, a bead for each day of it - seven at most, the number says the rest */
function rfStreakArcHTML(n){
  var k=Math.min(7,n),h='<div class="rf-sarc" aria-hidden="true" style="--bd:url('+liveBase()+'assets/rf-bead.webp)"><svg viewBox="0 0 240 40"><path d="M10 8Q120 36 230 8"/></svg>',i,t,x,y;
  for(i=0;i<k;i++){
    t=.5+(i-(k-1)/2)*.13;
    x=Math.round((1-t)*(1-t)*10+2*(1-t)*t*120+t*t*230);
    y=Math.round((1-t)*(1-t)*8+2*(1-t)*t*36+t*t*8);
    h+='<i style="left:'+x+'px;top:'+y+'px"></i>';
  }
  return h+'</div>';
}
function rfGlazeIx(k){`, `function rfGlazeIx(k){`],
  [`/* the fifteenth review (25 Nov): after the day is closed - the streak's thread and beads, the folio */
html body.mod-endofday .rf-sarc{position:relative;width:240px;height:40px;margin:-2px auto 4px}
html body.mod-endofday .rf-sarc svg{position:absolute;inset:0;width:240px;height:40px;overflow:visible}
html body.mod-endofday .rf-sarc path{fill:none;stroke:rgba(240,169,46,.7);stroke-width:1.6;stroke-linecap:round;filter:drop-shadow(0 0 3px rgba(240,169,46,.6))}
html body.mod-endofday .rf-sarc i{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;background:var(--bd) 0 0/22px 22px no-repeat;
  -webkit-mask:radial-gradient(closest-side,#000 70%,transparent 100%);mask:radial-gradient(closest-side,#000 70%,transparent 100%)}
`,
   `/* the fifteenth review (25 Nov): after the day is closed - the folio */
`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  if (!a) throw new Error('empty anchor');
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
