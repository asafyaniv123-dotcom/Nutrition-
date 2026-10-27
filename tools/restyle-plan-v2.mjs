/* plan-v2 in the app's own look (Asaf: "it isn't our design at all"). Taken
 * from the shipped planning styles, not from memory:
 *  - the palette is WK_COLORS (soft fill, the word in its ink), lifted by the
 *    app's two shadows; no coloured seam at the start (rejected 24 Oct)
 *  - the header: the corner Mip in his niche, the ⌂ בית pill, a 30px title
 *  - the board is one pressed channel; the month has no vertical lines and a
 *    hairline between weeks, a small muted number, today darker with one
 *    amber dot; the week has raised day pills and today's lane deeper with
 *    the warm line along its top
 *  - the bead stays amber with a white ring (what the app now uses)
 * Also: a month run can be pulled DOWN into the next week - the lane is
 * found by date, so the finger over any cell of a later row stretches it. */
import fs from 'fs';
const F = 'review/plan-v2/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* palette */
rep(`var C={lav:['#dcd3ef','#a690cf'],blue:['#d6e4f2','#6f97c8'],green:['#d5e8d2','#6a9a62'],amber:['#f5e2bc','#e0a34a'],terra:['#f2d6cc','#d07a5e'],gray:['#e2ddd6','#9c948a']};`,
`/* WK_COLORS: soft, ink, dot */
var C={lav:['#cec9d8','#5b4f6b','#a690cf'],blue:['#cad6de','#2f5a73','#6f97c8'],green:['#cad4c4','#3d6047','#6a9a62'],amber:['#e7d7b7','#6d5530','#c98b3f'],
  terra:['#dbc2b6','#6f483a','#d07a5e'],gray:['#d3d0ca','#57504a','#8d847d'],rose:['#e0c4c8','#78394a','#e0728c'],teal:['#c0d2cd','#2f5f58','#4fa89b']};`);
rep(`function tkStyle(t){return 'background:'+C[t.c][0]+';box-shadow:inset 3px 0 0 '+C[t.c][1];}`,
  `function tkStyle(t){return 'background:'+C[t.c][0]+';color:'+C[t.c][1];}`);
rep(`for(k in C)h+='<button data-c="'+k+'" class="'+(t.c===k?'on':'')+'" style="background:'+C[k][1]+'"></button>';`,
  `for(k in C)h+='<button data-c="'+k+'" class="'+(t.c===k?'on':'')+'" style="background:'+C[k][2]+'"></button>';`);

/* header: Mip's niche and the home pill, as every area has */
rep(`  <div class="hd"><h2>תכנון זמן</h2><div class="crumbs" id="crumbs"></div></div>
  <div class="steps"><button class="raise" id="prev">&#8250;</button><button class="raise" id="next">&#8249;</button></div>`,
`  <div class="hd"><div class="home raise">&#8962; בית</div><h2>תכנון זמן</h2></div>
  <div class="niche raise"><div id="mip"></div></div>
  <div class="nav"><div class="crumbs" id="crumbs"></div><div class="steps"><button class="raise" id="prev">&#8250;</button><button class="raise" id="next">&#8249;</button></div></div>`);
rep(`.hd{position:absolute;top:0;left:0;right:0;padding:50px 18px 8px}
.hd h2{margin:0;font-size:30px;font-weight:800}
.crumbs{display:flex;align-items:center;gap:6px;margin-top:10px;flex-wrap:wrap}
.crumbs button{border:none;font:inherit;cursor:pointer;border-radius:999px;padding:7px 13px;font-size:14px;font-weight:700;color:var(--mut)}
.crumbs button.on{color:#4a453f;font-weight:800}
.crumbs i{font-style:normal;color:#b0a08c;font-weight:800}
.steps{position:absolute;top:52px;inset-inline-end:16px;display:flex;gap:8px}`,
`.hd{position:absolute;top:0;left:0;right:0;padding:46px 20px 0}
.home{display:inline-block;padding:7px 14px;border-radius:999px;font-size:13.5px;font-weight:800;color:#4a453f}
.hd h2{margin:10px 0 0;font-size:30px;font-weight:800;letter-spacing:-.6px}
.niche{position:absolute;top:44px;left:16px;width:72px;height:72px;border-radius:50%}
.niche #mip{position:absolute;inset:4px}
.nav{position:absolute;top:128px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:8px}
.crumbs{display:flex;align-items:center;gap:5px;min-width:0}
.crumbs button{border:none;font-family:inherit;cursor:pointer;border-radius:999px;padding:7px 12px;font-size:13.5px;font-weight:700;color:var(--mut);white-space:nowrap}
.crumbs button.on{color:#4a453f;font-weight:800}
.crumbs i{font-style:normal;color:#b0a08c;font-weight:800}
.steps{display:flex;gap:6px;flex:none}`);
rep(`.steps button{width:38px;height:38px;`, `.steps button{width:36px;height:36px;`);
rep(`.board{position:absolute;top:150px;`, `.board{position:absolute;top:178px;`);
rep(`.board{position:absolute;top:178px;left:12px;right:12px;bottom:206px;border-radius:26px;`,
  `.board{position:absolute;top:178px;left:12px;right:12px;bottom:206px;border-radius:22px;box-shadow:inset 3px 4px 8px var(--sh),inset -3px -3px 7px var(--lit);`);

/* the task, everywhere */
rep(`.tk{position:relative;display:flex;align-items:center;gap:4px;border-radius:9px;font-weight:800;color:#3f3a35;cursor:grab;touch-action:none;`,
  `.tk{position:relative;display:flex;align-items:center;gap:4px;border-radius:8px;font-weight:800;cursor:grab;touch-action:none;
  box-shadow:-1px -1px 3px var(--lit),1.5px 3px 5px var(--sh2);`);
rep(`.bead i{width:11px;height:11px;`, `.bead i{width:10px;height:10px;`);

/* month */
rep(`.mhd div{text-align:center;font-size:12px;font-weight:800;color:var(--mut);padding:10px 0 4px}
.mrow{position:relative;display:grid;grid-template-columns:repeat(7,1fr);min-height:86px;border-top:1px solid rgba(168,160,148,.25)}
.mcell{padding:4px 2px 2px;min-height:86px}
.mcell .n{font-size:12.5px;font-weight:800;color:var(--mut);text-align:center;height:20px;line-height:20px}
.mcell.today .n{color:#4a453f}
.mcell.today .n span{display:inline-block;min-width:22px;border-radius:11px;background:var(--amber);color:#fff}
.mcell.out .n{opacity:.35}`,
`.mhd div{text-align:center;font-size:12px;font-weight:800;color:var(--mut);padding:12px 0 6px}
.mrow{position:relative;display:grid;grid-template-columns:repeat(7,1fr);min-height:92px;margin:0 6px;border-top:1px solid rgba(176,168,156,.26)}
.mcell{padding:5px 2px 2px;min-height:92px;border-radius:11px}
.mcell .n{font-size:12px;font-weight:700;color:var(--mut);text-align:center;height:20px;line-height:20px}
.mcell.today .n{color:#4a453f;font-weight:800}
.mcell.today .n::after{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--amber);margin-inline-start:4px;vertical-align:1px}
.mcell.out .n{opacity:.35}`);
rep(`.mlane{position:absolute;height:19px;font-size:11px;padding:0 6px}`, `.mlane{position:absolute;height:20px;font-size:11px;padding:0 6px}`);

/* week */
rep(`.wcol{position:relative;border-inline-start:1px solid rgba(168,160,148,.22);min-height:520px;padding-bottom:20px}
.wcol:first-child{border-inline-start:none}
.whd{text-align:center;padding:10px 0 8px;cursor:pointer}
.whd b{display:block;font-size:12.5px}.whd span{display:block;font-size:11.5px;color:var(--mut);font-weight:700}
.wcol.today .whd b{color:#b0782e}`,
`.wcol{position:relative;min-height:520px;padding-bottom:20px}
.wcol.today{background:rgba(176,168,156,.13);box-shadow:inset 2px 0 4px -2px var(--sh),inset -2px 0 4px -2px var(--sh)}
.wcol.today::before{content:"";position:absolute;top:0;inset-inline:0;height:2px;border-radius:2px;background:linear-gradient(90deg,rgba(240,169,46,0),rgba(240,169,46,.85),rgba(240,169,46,0))}
.whd{margin:8px 3px 10px;text-align:center;padding:8px 0 7px;cursor:pointer;border-radius:14px;background:#e9e7e3;box-shadow:-2px -2px 5px var(--lit),3px 3px 7px var(--sh2)}
.whd b{display:block;font-size:12px}.whd span{display:block;font-size:11px;color:var(--mut);font-weight:700}`);
rep(`h+='<div class="wcol'+(day===TODAY?' today':'')+'" data-drop-date="'+day+'"><div class="whd" data-day="'+day+'"><b>'+DL[c]+'</b><span>'+D(day).getDate()+'</span></div>';`,
  `h+='<div class="wcol'+(day===TODAY?' today':'')+'" data-drop-date="'+day+'"><div class="whd" data-day="'+day+'"><b>'+DL[c]+'</b><span>'+dm(day)+'</span></div>';`);
rep(`h+='<div class="tk wbar" data-id="'+m.id+'" style="'+tkStyle(m)+';top:'+(52+i*28)+'px;`, `h+='<div class="tk wbar" data-id="'+m.id+'" style="'+tkStyle(m)+';top:'+(68+i*28)+'px;`);

/* day: hours like the app's day board */
rep(`.hrow b{width:52px;font-size:12px;color:var(--mut);padding:4px 0 0 0;text-align:center;font-weight:700}`,
  `.hrow{border-top:1px solid rgba(176,168,156,.26)}
.hrow b{width:56px;font-size:12px;color:var(--mut);padding:5px 0 0 0;text-align:center;font-weight:700;border-inline-end:1px solid rgba(176,168,156,.26)}`);

/* Mip in his niche */
rep(`draw();
function fit(){`, `draw();
window.BEEM_ASSET_BASE='../../dev/assets/';
var sc=document.createElement('script');sc.src='../../vendor/beem-app.js';sc.onload=function(){if(window.BeemKit)BeemKit.ready.then(function(){BeemKit.mount(document.getElementById('mip'),{});});};document.head.appendChild(sc);
function fit(){`);
fs.writeFileSync(F, s);
console.log('ok');
