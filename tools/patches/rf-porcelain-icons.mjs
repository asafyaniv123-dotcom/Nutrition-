// The board's cards wore thin coloured line icons, which Asaf found cheap and unrelated (24 Nov). He chose the
// porcelain direction from Higgsfield: small ivory objects with a thread of amber light. They are one sprite,
// assets/rf-icons.webp (4 columns x 6 rows of 160px: the two Higgsfield sheets stacked), so the board costs one
// request. An icon id with no cell keeps its old svg, so nothing can go blank.
// usage: node tools/patches/rf-porcelain-icons.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`    h+='<div class="rf-card-ic" style="color:'+g[1]+'"><svg viewBox="0 0 24 24">'+(RF_ICONS[q.ic]||'')+'</svg></div>';
`,
   `    h+=RF_PZ[q.ic]!=null?'<div class="rf-card-ic rf-card-pz" style="'+rfPzStyle(q.ic)+'"></div>'
      :'<div class="rf-card-ic" style="color:'+g[1]+'"><svg viewBox="0 0 24 24">'+(RF_ICONS[q.ic]||'')+'</svg></div>';
`],
  [`function renderReflectBoard(`,
   `/* the porcelain icons (24 Nov): a cell number in assets/rf-icons.webp, 4 across and 6 down.
   This hands over only the column and row; .rf-card-pz turns them into a position, so the cell size lives in one place. */
var RF_PZ={face:0,body:1,star:2,wave:3,target:4,dumbbell:5,sunrise:6,hands:7,spark:8,medal:9,sun:10,cloud:11,
  hourglass:12,people:13,bubble:14,heart:15,timeline:16,clock:17,steps:18,undo:19,moon:20,bowl:21,note:22,quote:23};
function rfPzStyle(id){var n=RF_PZ[id];
  return 'background-image:url('+liveBase()+'assets/rf-icons.webp);--pzc:'+(n%4)+';--pzr:'+Math.floor(n/4);}
function renderReflectBoard(`],
  [`html body.mod-endofday .rf-card-t{font-size:15px}
`,
   `html body.mod-endofday .rf-card-t{font-size:15px}
/* a porcelain object needs no dish of its own: the sheet's ground is the card's, faded out at the edge */
html body.mod-endofday .rf-card .rf-card-ic.rf-card-pz{width:70px;height:70px;margin:-6px 0 -4px;border-radius:0;box-shadow:none;
  background-color:transparent;background-repeat:no-repeat;background-size:280px 420px;
  background-position:calc(var(--pzc) * -70px) calc(var(--pzr) * -70px);
  -webkit-mask:radial-gradient(circle,#000 48%,transparent 70%);mask:radial-gradient(circle,#000 48%,transparent 70%)}
`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
