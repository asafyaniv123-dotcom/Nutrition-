/* Asaf on the phone (27 Oct):
 * 1. the month's selection strip (להאריך · החזר · מחק · ביטול) was flat text
 *    on outlined boxes, and the selected chip got a dark outline - the
 *    material now: soft raised pills, the active one pressed, the chip lifted
 * 2. a timed block crossing from afternoon into evening showed a seam: each
 *    band draws its own piece, and each piece cast its own shadow onto the
 *    next. The pieces that continue lose the shadow on that edge.
 * 3. "move task" after a long press: the finger dragged the PAGE (iOS gives a
 *    touch to scrolling unless touch-action says otherwise), and the big
 *    card sat over the board. Now the page holds still while moving, the task
 *    is a small lifted pill under the finger, and the words and ביטול sit in
 *    one soft bar at the top. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

rep(`.pt-ghost{position:fixed;z-index:960;transform:translate(-50%,-115%) rotate(-2deg);pointer-events:none;padding:10px 16px;border-radius:14px;text-align:center;
  box-shadow:0 14px 30px rgba(60,48,36,.3);transition:left .05s,top .05s}
.pt-ghost b{display:block;font-size:15px;font-weight:800;white-space:nowrap}
.pt-ghost span{display:block;font-size:11.5px;font-weight:700;opacity:.75;margin-top:2px;white-space:nowrap}
.pt-cancel{position:fixed;z-index:961;left:50%;transform:translateX(-50%);bottom:calc(112px + env(safe-area-inset-bottom));border:none;border-radius:999px;padding:11px 22px;
  font-family:inherit;font-size:14.5px;font-weight:800;color:#4a453f;background:#f3f0eb;box-shadow:-3px -3px 9px rgba(255,255,255,.85),6px 10px 22px rgba(90,74,60,.22)}`,
`.pt-ghost{position:fixed;z-index:960;transform:translate(-50%,-140%) rotate(-3deg) scale(1.05);pointer-events:none;padding:8px 14px;border-radius:10px;
  font-size:14px;font-weight:800;white-space:nowrap;box-shadow:0 12px 26px rgba(60,48,36,.28)}
.pt-bar{position:fixed;z-index:961;left:12px;right:12px;top:calc(14px + env(safe-area-inset-top));display:flex;align-items:center;gap:10px;
  padding:8px 8px 8px 16px;border-radius:999px;background:#f3f0eb;box-shadow:-3px -3px 9px rgba(255,255,255,.85),6px 10px 22px rgba(90,74,60,.22);
  animation:ptBar .35s cubic-bezier(.22,.61,.36,1) both}
@keyframes ptBar{from{opacity:0;transform:translateY(-14px)}}
.pt-bar span{flex:1;min-width:0;font-size:14px;font-weight:700;color:#4a453f;padding-inline-start:8px}
.pt-cancel{flex:none;border:none;border-radius:999px;padding:9px 16px;font-family:inherit;font-size:14px;font-weight:800;color:#4a453f;background:#e9e7e3;
  box-shadow:-2px -2px 5px rgba(255,255,255,.95),3px 3px 7px rgba(168,160,148,.3)}
/* while a task is being moved the page holds still under the finger */
html.pt-hold,html.pt-hold body,body.pt-moving,body.pt-moving *{touch-action:none!important}
html.pt-hold{overflow:hidden}
/* the month's selection, in the material (27.10) */
html body.mod-planning .pl-sel{gap:8px}
html body.mod-planning .pl-sel-b{background:var(--nu-ground);border:none;border-radius:999px;padding:10px 6px;font-family:inherit;font-size:13.5px;font-weight:800;
  color:var(--nu-ink);box-shadow:-3px -3px 7px var(--nu-lit),4px 5px 10px var(--nu-shade-soft)}
html body.mod-planning .pl-sel-d{color:#9a3d2a}
html body.mod-planning .pl-sel-on{background:var(--nu-ground);color:var(--nu-ink);box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
html body.mod-planning .pl-sel-s{font-size:13px;color:var(--nu-muted)}
html body.mod-planning .mo-chip-sel{outline:none;transform:translateY(-1px) scale(1.06);box-shadow:-2px -2px 5px var(--nu-lit),3px 6px 12px var(--nu-shade)}
/* a block that continues into the next band: no shadow on the joined edge */
html body.mod-planning .wk-blk.ct,html body.mod-planning .wk-blk.cb{box-shadow:none}`);

rep(`  g.className='pt-ghost';g.innerHTML='<b></b><span>'+esc(_t('גוררים ליום, או לוחצים עליו'))+'</span>';g.querySelector('b').textContent=f.t.w;
  g.style.background=c.soft;g.style.color=c.ink;
  var x=r.left+r.width/2,y=r.top+r.height/2;
  g.style.left=x+'px';g.style.top=y+'px';
  var x0=document.createElement('button');x0.className='pt-cancel';x0.textContent=_t('ביטול');
  document.body.appendChild(g);document.body.appendChild(x0);document.body.classList.add('pt-moving');`,
`  g.className='pt-ghost';g.textContent=f.t.w;
  g.style.background=c.soft;g.style.color=c.ink;
  var x=r.left+r.width/2,y=r.top+r.height/2;
  g.style.left=x+'px';g.style.top=y+'px';
  var bar=document.createElement('div');bar.className='pt-bar';
  bar.innerHTML='<span>'+esc(_t('גוררים ליום, או לוחצים עליו'))+'</span><button class="pt-cancel">'+esc(_t('ביטול'))+'</button>';
  var x0=bar.querySelector('button');
  document.body.appendChild(g);document.body.appendChild(bar);document.body.classList.add('pt-moving');document.documentElement.classList.add('pt-hold');
  var stopScroll=function(ev){ev.preventDefault();};
  document.addEventListener('touchmove',stopScroll,{passive:false});`);
rep(`    mark(null);g.remove();x0.remove();document.body.classList.remove('pt-moving');}`,
  `    document.removeEventListener('touchmove',stopScroll,{passive:false});
    mark(null);g.remove();bar.remove();document.body.classList.remove('pt-moving');document.documentElement.classList.remove('pt-hold');}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
