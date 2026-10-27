/* Asaf's notes from his phone, 27 Oct:
 * 1. "רואה את האור?" on the first day still spoke of the well, which is gone
 * 2. the flow demo's moving dot covered the word it passed - arrows instead
 * 3. the day board's + buttons and the undo pill were dark slabs - the
 *    material, like everything else
 * 4. stretching works but nobody can find it: the grab point was a 5px dot at
 *    38% opacity with a 16px target. It is now an amber bead with a white ring,
 *    on a 28px target, on the week and on the month; the tour says where
 * 5. the closet tour shows the photograph being cut out: the frame closes in,
 *    the floor goes, the piece stands alone
 * 6. the fitness summary: "מה שהבנתי" read as the app checking itself, in
 *    10px type - now "התוכנית שמתאימה לך" with the numbers as tiles */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

/* 1 */
rep(`      doorDay1Page()+
      '<div class="dr-sub2">'+_t('רואה את האור? כך מתמלא סיום היום, בכל ערב שתסכם.')+'</div></div>'+`,
`      doorDay1Page()+'</div>'+`);

/* 2 */
rep(`  if(k==='flow')return '<div class="td-flow"><span>'+esc(_t('החודש'))+'</span><span>'+esc(_t('השבוע'))+'</span><span>'+esc(_t('היום'))+'</span></div><i class="td-dot"></i>';`,
  `  if(k==='flow')return '<div class="td-flow"><span>'+esc(_t('החודש'))+'</span><b></b><span>'+esc(_t('השבוע'))+'</span><b></b><span>'+esc(_t('היום'))+'</span></div>';`);
rep(`.td-dot{position:absolute;top:50%;margin-top:-6px;inset-inline-start:40px`, `.td-flow b{flex:none;align-self:center;width:8px;height:8px;border-top:2.5px solid #b0a08c;border-inline-end:2.5px solid #b0a08c;transform:rotate(45deg)}
[dir=rtl] .td-flow b{transform:rotate(-135deg)}
.td-flow{gap:6px!important}
.td-dot-unused{position:absolute;top:50%;margin-top:-6px;inset-inline-start:40px`);

/* 3 */
rep(`  out+='<button onclick="dpAdd()" style="background:var(--cta-fill);border:none;border-radius:11px;padding:0 17px;font-size:19px;font-weight:700;cursor:pointer;color:var(--white);flex-shrink:0;font-family:inherit">+</button>';`,
  `  out+='<button class="dp-plus" onclick="dpAdd()">+</button>';`);
rep(`    h+='<button onclick="dpRailAdd()" style="background:var(--cta-fill);border:none;border-radius:11px;padding:0 14px;font-size:18px;font-weight:700;cursor:pointer;color:var(--white);flex-shrink:0;font-family:inherit">+</button>';`,
  `    h+='<button class="dp-plus" onclick="dpRailAdd()">+</button>';`);

/* 4 - the month's grab point: a real target */
rep(`           ' style="position:absolute;inset-inline-end:-2px;top:50%;margin-top:-8px;width:16px;height:16px;'+`,
  `           ' style="position:absolute;inset-inline-end:-10px;top:50%;margin-top:-14px;width:28px;height:28px;z-index:2;'+`);
rep(`             (ech?'':'<div data-stretch="'+list[t].id+'" style="position:absolute;inset-inline-end:-6px;top:50%;margin-top:-11px;'+
                   'width:22px;height:22px;pointer-events:auto;cursor:ew-resize;touch-action:none;'+`,
  `             (ech?'':'<div data-stretch="'+list[t].id+'" style="position:absolute;inset-inline-end:-10px;top:50%;margin-top:-14px;z-index:2;'+
                   'width:28px;height:28px;pointer-events:auto;cursor:ew-resize;touch-action:none;'+`);

/* the CSS for 3 and 4 and 6, last in the sheet */
rep(`html body #me-screen.me-screen{padding-top:calc(34px + env(safe-area-inset-top))}`, `html body #me-screen.me-screen{padding-top:calc(34px + env(safe-area-inset-top))}
/* the grab point that stretches a task, findable (27.10) */
html body.mod-planning .mo-grip{width:11px;height:11px;border-radius:50%;background:#f0a92e;opacity:1;box-shadow:0 0 0 2.5px rgba(255,255,255,.95),0 1px 3px rgba(90,70,40,.3)}
html body.mod-planning .mo-grabs{padding-inline-end:16px}
/* the day board's + in the material */
.dp-plus{flex:none;width:46px;min-height:44px;border:none;border-radius:14px;cursor:pointer;font:700 22px/1 inherit;color:var(--nu-ink,#4a453f);
  background:var(--nu-ground,#e9e7e3);box-shadow:-3px -3px 7px var(--nu-lit,rgba(255,255,255,.95)),4px 5px 10px var(--nu-shade-soft,rgba(168,160,148,.3))}
.dp-plus:active{box-shadow:inset 2px 3px 6px var(--nu-shade,rgba(168,160,148,.45)),inset -2px -2px 5px var(--nu-lit,rgba(255,255,255,.95))}
html body .plan-undo{background:#f3f0eb;color:#4a453f;border-radius:999px;box-shadow:-3px -3px 9px rgba(255,255,255,.85),6px 10px 22px rgba(90,74,60,.22)}
/* the fitness summary as tiles */
.fw-sum-t{font-size:22px;font-weight:800;color:var(--nu-ink,#4a453f);margin:2px 0 4px;line-height:1.3}
.fw-sum-s{font-size:14px;color:var(--nu-muted,#6d675e);line-height:1.5;margin-bottom:14px}
.fw-tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fw-tile{border-radius:16px;padding:12px 14px;box-shadow:inset 2px 3px 6px var(--nu-shade-soft,rgba(168,160,148,.3)),inset -2px -2px 5px var(--nu-lit,rgba(255,255,255,.95))}
.fw-tile b{display:block;font-size:20px;font-weight:800;color:var(--nu-ink,#4a453f);line-height:1.2}
.fw-tile span{display:block;font-size:13px;font-weight:700;color:var(--nu-muted,#6d675e);margin-top:2px}
/* the closet demo: a photograph cut out */
.td-ph{position:absolute;top:6px;bottom:6px;inset-inline-start:12px;width:120px;border-radius:10px;overflow:hidden;
  background:linear-gradient(160deg,#c9b9a3,#a99377);animation:tdFloor 4s ease infinite}
.td-ph::after{content:"";position:absolute;inset:6px;border:2px solid #fff;border-radius:6px;animation:tdFrame 4s ease infinite}
.td-ph svg,.td-cut svg{position:absolute;left:50%;top:50%;width:44px;height:44px;margin:-22px 0 0 -22px}
.td-cut{position:absolute;top:6px;bottom:6px;inset-inline-end:12px;width:120px;border-radius:10px;animation:tdCut 4s ease infinite}
.td-cut svg{filter:drop-shadow(0 3px 4px rgba(90,70,40,.3))}
@keyframes tdFloor{0%,30%{opacity:1}50%,100%{opacity:.35}}
@keyframes tdFrame{0%{inset:6px;opacity:0}12%{opacity:1}30%{inset:10px 34px;opacity:1}45%,100%{inset:10px 34px;opacity:0}}
@keyframes tdCut{0%,48%{opacity:0;transform:scale(.9)}62%,92%{opacity:1;transform:none}100%{opacity:0}}`);

/* 5 - the closet tour */
rep(`    ['.cl-empty,.cl-add',_t('מוסיפים בגד עם ה־+.'),_t('מצלמים, או בוחרים כמה תמונות בבת אחת. כדאי לצלם כל בגד מאותו מרחק.')],`,
`    ['.cl-empty,.cl-add',_t('מוסיפים בגד עם ה־+.'),_t('מצלמים, או בוחרים כמה תמונות בבת אחת. כדאי לצלם כל בגד מאותו מרחק.')],
    [null,_t('ואז גוזרים אותו.'),_t('מסמנים מסגרת, או מעבירים אצבע סביב הבגד. "הסר רקע" מוריד את הרצפה, ובעריכה אפשר למחוק עוד עם מברשת. נשאר רק הבגד.'),'cut'],`);
rep(`  if(k==='lib')return`, `  if(k==='cut'){var sh='<svg viewBox="0 0 48 48"><path d="M17 6l-11 7 5 9 5-3v23h16V19l5 3 5-9-11-7c-1 4-4 6-7 6s-6-2-7-6z" fill="#6f97c8"/></svg>';
    return '<span class="td-ph">'+sh+'</span><span class="td-cut">'+sh+'</span>';}
  if(k==='lib')return`);

/* 4 - the tour says where */
rep(`_t('תופסים את הנקודה בקצה של משימה ומושכים אותה על פני כמה ימים. כך היא מופיעה על כולם, וגם בתצוגת החודש.')`,
  `_t('בלוח השבוע או החודש, תופסים את הנקודה הכתומה בקצה של משימה ומושכים אותה על פני כמה ימים. כך היא מופיעה על כולם.')`);

/* 6 - the summary */
rep(`    h+='<div class="gn-c"><div class="gn-h">'+_t('מה שהבנתי')+'</div>';
    h+='<div style="font-size:19px;font-weight:800;color:var(--ink);margin-top:6px">'+esc(names.join(' \\u00b7 '))+'</div>';`,
`    h+='<div class="gn-c"><div class="fw-sum-t">'+_t('התוכנית שמתאימה לך')+'</div>';
    h+='<div class="fw-sum-s">'+esc(names.join(' \\u00b7 '))+'</div>';`);
rep(`  var loadable=genEquip()!=='none',h='';   // i18n-exempt: a stored key
  h+='<div class="gn-s">'+_t('אימונים בשבוע')+': <b>'+nfmt(+me.days||3)+'</b></div>';
  h+='<div class="gn-s">'+_t('כל שריר חוזר כל {lo}–{hi} שעות',{lo:I.lo,hi:I.hi})+'</div>';
  h+='<div class="gn-s">'+_t('סטים באימון')+': <b>'+nfmt(fitWPerSession(fitWPlan()))+'</b></div>';
  h+='<div class="gn-s">'+_t('טווח חזרות')+': <b>'+nfmt(g.lo)+'–'+nfmt(g.hi)+'</b></div>';
  h+='<div class="gn-s">'+_t('מנוחה בין סטים')+': <b>'+_t('{n} שניות',{n:g.rest})+'</b></div>';
  h+='<div class="gn-s">'+_t('קושי')+': <b>RPE '+(GENPROG_RPE[me.exp]||'6–8')+'</b></div>';
  h+='<div class="gn-s">'+(loadable
      ?_t('קפיצת משקל')+': <b>'+fmtWeight(g.step)+'</b>'
      :_t('איך עולים')+': <b>'+_t('חזרות וקושי')+'</b>')+'</div>';
  return h;`,
`  var loadable=genEquip()!=='none',h='';   // i18n-exempt: a stored key
  function tile(v,l){return '<div class="fw-tile"><b>'+v+'</b><span>'+l+'</span></div>';}
  h+='<div class="fw-tiles">'+
    tile(nfmt(+me.days||3),_t('אימונים בשבוע'))+
    tile(nfmt(fitWPerSession(fitWPlan())),_t('סטים באימון'))+
    tile(nfmt(g.lo)+'–'+nfmt(g.hi),_t('טווח חזרות'))+
    tile(_t('{n} שניות',{n:g.rest}),_t('מנוחה בין סטים'))+
    tile('RPE '+(GENPROG_RPE[me.exp]||'6–8'),_t('קושי'))+
    (loadable?tile(fmtWeight(g.step),_t('קפיצת משקל')):tile(_t('חזרות וקושי'),_t('איך עולים')))+
    '</div>';
  h+='<div class="gn-s" style="margin:12px 0 0;font-size:13px">'+_t('כל שריר חוזר כל {lo}–{hi} שעות',{lo:I.lo,hi:I.hi})+'</div>';
  return h;`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
