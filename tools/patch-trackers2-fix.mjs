/* trackers round 2, fixes from the photographs: the calorie columns ran off
 * the card (a no-wrap label wider than its column) and the protein line read
 * backwards; the steps labels alternated above and below and read as each
 * other's; the road's offset light made a halo; the eight past weeks wrapped
 * onto two lines. */
import fs from 'fs';
const F = 'review/trackers-2/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`.col{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px}`, `.col{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:6px}
.col .tg{font-size:11px;padding:2px 6px}.col .tg.lit{font-size:12px}`);
rep(`<span class="lb" style="font-size:10.5px">`, `<span class="lb" dir="rtl" style="font-size:10.5px">`);
rep(`var P=V.map(function(v,i){return [28+i*(W-56)/6,108+dy[i]];}),d=smooth(P),tot=V.reduce(function(a,b){return a+b;},0);`,
  `var P=V.map(function(v,i){return [28+i*(W-56)/6,170-(v-4000)/9000*110];}),d=smooth(P),tot=V.reduce(function(a,b){return a+b;},0);`);
rep(`  s+='<path d="'+d+'" fill="none" stroke="rgba(168,160,148,.35)" stroke-width="24" stroke-linecap="round" transform="translate(1.5,2)"/>'+
     '<path d="'+d+'" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="24" stroke-linecap="round" transform="translate(-1.5,-1.5)"/>'+
     '<path d="'+d+'" fill="none" stroke="#e6e3de" stroke-width="22" stroke-linecap="round"/>';`,
  `  s+='<path d="'+d+'" fill="none" stroke="rgba(168,160,148,.18)" stroke-width="20" stroke-linecap="round"/>';`);
rep(`      tagS(p[0],p[1]+(dy[i]>0?-30:32),nf(V[i]),lit);`, `      tagS(p[0],p[1]-28,nf(V[i]),lit);`);
rep(`.past{display:flex;align-items:center;justify-content:center;gap:6px;margin:16px 0 6px;flex-wrap:wrap;direction:ltr}
.past span{font-size:12px;color:var(--mu);font-weight:700;margin-inline-end:4px;direction:rtl}`,
  `.past{display:flex;align-items:center;justify-content:center;gap:5px;margin:22px 0 6px;direction:ltr;position:relative;padding-top:20px}
.past>span:first-child{position:absolute;top:0;left:0;right:0;text-align:center;font-size:12px;color:var(--mu);font-weight:700}
.past .tg{padding:2px 8px}`);
fs.writeFileSync(F, s);
console.log('ok');
