/* The tubes, satin (Asaf chose A2 on review/tubes-proto, 25 Oct: "I don't
 * like the lines after a meal is filled in - as if the meals are divided").
 * One continuous fill per tube, its height exactly the sum the bands made
 * (each meal's share of the target, capped at the top of the track), so the
 * scale is unchanged. The fill is matte, rounded at the top like the surface
 * of a liquid, deepening toward the bottom, with a faint shading at the walls
 * - no line in it and no glow leaving the channel. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`  var h='',bottom=0,i,share,key,drawn=0;
  for(i=0;i<meals.length;i++){
    share=(+meals[i][b.k]||0)/tgt*100;
    if(share<=0)continue;
    if(bottom>=100)break;
    if(bottom+share>100)share=100-bottom;   // the target is the top of the track
    key='m'+bi+'-'+i;
    h+='<div class="macro-band'+(drawn===0?' first':'')+'" data-k="'+key+'" data-h="'+share+'"'+
       ' style="bottom:'+bottom+'%;height:'+bandBorn(key,share)+'%;background:'+
       (i===meals.length-1?b.g:b.dim)+'"></div>';
    bottom+=share;drawn++;
  }
  if(!drawn)
    return '<div class="macro-fill" data-k="m'+bi+'" data-h="0" style="height:0%;background:'+b.g+'"></div>';
  return h;`,
`  /* ONE fill (25.10, satin): the meals are no longer cut apart by lines. Its
     height is the sum the bands made - each meal's share, the target the top
     of the track - so the scale is exactly what it was. */
  var bottom=0,i,share;
  for(i=0;i<meals.length;i++){
    share=(+meals[i][b.k]||0)/tgt*100;
    if(share>0)bottom=Math.min(100,bottom+share);
  }
  return '<div class="macro-fill" data-k="m'+bi+'" data-h="'+bottom+'" style="height:'+barBorn('m'+bi,bottom)+'%;background:'+b.g+'"></div>';`);
rep(`body.mod-nutrition .macro-col:nth-child(4) .macro-band,body.mod-nutrition .macro-col:nth-child(4) .macro-fill{background:var(--nu-fat)!important;box-shadow:none}`,
`body.mod-nutrition .macro-col:nth-child(4) .macro-band,body.mod-nutrition .macro-col:nth-child(4) .macro-fill{background:var(--nu-fat)!important;box-shadow:none}
/* satin (review/tubes-proto, A2): matte, a liquid's rounded surface, deeper
   toward the bottom, shaded faintly at the walls; no line, no glow */
body.mod-nutrition .macro-col:nth-child(1){--tb:var(--nu-cal);--tb-deep:#f0ad5a;--tb-hi:#fde7c4}
body.mod-nutrition .macro-col:nth-child(2){--tb:var(--nu-pro);--tb-deep:#f48f78;--tb-hi:#ffdcd2}
body.mod-nutrition .macro-col:nth-child(3){--tb:var(--nu-carb);--tb-deep:#93bb83;--tb-hi:#e2eedb}
body.mod-nutrition .macro-col:nth-child(4){--tb:var(--nu-fat);--tb-deep:#86ade0;--tb-hi:#dbe8f8}
body.mod-nutrition .macro-col:nth-child(n) .macro-fill{border-radius:15px!important;
  background:linear-gradient(0deg,var(--tb-deep) -10%,var(--tb) 70%,var(--tb-hi) 115%)!important;
  box-shadow:inset 4px 0 7px -3px rgba(0,0,0,.10),inset -4px 0 7px -3px rgba(0,0,0,.12),inset 0 3px 4px -2px rgba(255,255,255,.7)!important}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
