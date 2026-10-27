/* The open day under the week and under the month (Asaf, 27 Oct: "things
 * written there that should be in the app's design"): a blue gradient
 * button, 11px grey "סגור", a pale pink button, hairline rows and a red ×.
 * Both become the material: a raised card, a raised button with the clock in
 * a pressed well and the amber lamp under it, a soft "סגור" pill, rows at
 * reading size, and the × a small soft circle. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };
const CLOCK = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 2"/></svg>`;

/* the week's open day */
rep(`    h+='<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px">';
    h+='<div style="font-size:12.5px;font-weight:800;color:var(--ink)">'+WK_DAYS[_wkOpen]+' &middot; '+wkShort(od)+'</div>';
    h+='<button onclick="wkOpen('+_wkOpen+')" style="background:none;border:none;font-size:11px;color:var(--muted);cursor:pointer;font-family:inherit">'+_t('סגור')+'</button></div>';
    h+='<button onclick="planOpenDay(\\''+ost+'\\')" style="width:100%;display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,var(--water-100),#d6ebf7);border:none;border-radius:14px;padding:12px 14px;margin-bottom:10px;cursor:pointer;text-align:start;font-family:inherit">';
    h+='<div style="width:32px;height:32px;border-radius:50%;background:var(--card);display:flex;align-items:center;justify-content:center;color:var(--water-700);flex-shrink:0">';
    h+='<svg viewBox="0 0 24 24" style="width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round"><circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 2"/></svg></div>';
    h+='<div style="flex:1;font-size:12.5px;font-weight:800;color:#2f5a73">'+_t('תכנן את היום הזה לפי שעות')+'</div>';
    h+='<div style="font-size:14px;color:#8fbdd8">&#8250;</div></button>';`,
`    h+='<div class="pod-h"><div class="pod-t">'+WK_DAYS[_wkOpen]+' &middot; '+wkShort(od)+'</div>';
    h+='<button class="pod-x" onclick="wkOpen('+_wkOpen+')">'+_t('סגור')+'</button></div>';
    h+='<button class="pod-go" onclick="planOpenDay(\\''+ost+'\\')"><i>${CLOCK}</i><b>'+_t('תכנן את היום הזה לפי שעות')+'</b></button>';`);

/* the month's open day */
rep(`  h+='<div style="background:var(--card);border-radius:18px;padding:14px;margin-top:14px;box-shadow:0 4px 18px rgba(200,180,160,.12)">';
  h+='<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px">';
  h+='<div style="font-size:13px;font-weight:800;color:var(--ink)">'+fmtDate(_moOpen)+'</div>';`,
`  h+='<div class="pod">';
  h+='<div class="pod-h">';
  h+='<div class="pod-t">'+fmtDate(_moOpen)+'</div>';`);
rep(`  h+='<button onclick="moOpenDay(\\''+_moOpen+'\\')" style="background:none;border:none;font-size:11px;color:var(--muted);cursor:pointer;font-family:inherit">'+_t('סגור')+'</button></div>';
  if(!all.length)h+='<div style="font-size:11.5px;color:var(--muted-soft);line-height:1.6;margin-bottom:10px">'+_t('אין כאן כלום עדיין.')+'</div>';
  for(i=0;i<all.length;i++){
    var it=all[i],c=wkColor(it.c);
    h+='<div style="display:flex;align-items:center;gap:8px;padding:7px 2px;border-bottom:1px solid var(--line)">';
    h+='<span style="width:7px;height:7px;border-radius:50%;background:'+c.dot+';flex-shrink:0"></span>';
    h+='<span style="flex:1;min-width:0;font-size:12.5px;color:var(--ink)">'+esc(it.w)+'</span>';
    if(it.hour!==null&&it.hour!==undefined)
      h+='<span style="font-size:10px;color:var(--muted);font-variant-numeric:tabular-nums">'+dpClock(it.hour,it.min)+'</span>';
    h+='<span style="font-size:9px;color:var(--muted-soft);flex-shrink:0">'+(it.src==='week'?''+_t('מהשבוע')+'':it.src==='month'?''+_t('מהחודש')+'':'')+'</span>';
    if(it.src==='day')h+='<button onclick="moDayDel(\\''+it.id+'\\')" style="background:none;border:none;color:var(--terra-700);font-size:15px;cursor:pointer;font-family:inherit;padding:0 2px">&times;</button>';
    h+='</div>';
  }`,
`  h+='<button class="pod-x" onclick="moOpenDay(\\''+_moOpen+'\\')">'+_t('סגור')+'</button></div>';
  if(!all.length)h+='<div class="pod-e">'+_t('אין כאן כלום עדיין.')+'</div>';
  for(i=0;i<all.length;i++){
    var it=all[i],c=wkColor(it.c);
    h+='<div class="pod-r">';
    h+='<span class="pod-d" style="background:'+c.dot+'"></span>';
    h+='<span class="pod-w">'+esc(it.w)+'</span>';
    if(it.hour!==null&&it.hour!==undefined)
      h+='<span class="pod-c">'+dpClock(it.hour,it.min)+'</span>';
    if(it.src==='week'||it.src==='month')h+='<span class="pod-s">'+(it.src==='week'?_t('מהשבוע'):_t('מהחודש'))+'</span>';
    if(it.src==='day')h+='<button class="pod-del" onclick="moDayDel(\\''+it.id+'\\')" aria-label="'+esc(_t('מחק'))+'">&times;</button>';
    h+='</div>';
  }`);
rep(`  h+='<button onclick="planOpenDay(\\''+_moOpen+'\\')" style="width:100%;margin-top:10px;background:var(--surface);border:none;border-radius:12px;padding:9px;font-size:11.5px;color:var(--ink-soft);cursor:pointer;font-family:inherit">'+_t('לתכנן את היום הזה לפי שעות')+' &#8250;</button>';`,
  `  h+='<button class="pod-go" style="margin-top:12px" onclick="planOpenDay(\\''+_moOpen+'\\')"><i>${CLOCK}</i><b>'+_t('לתכנן את היום הזה לפי שעות')+'</b></button>';`);

rep(`html body.mod-planning .mo-grabs{padding-inline-end:16px}`, `html body.mod-planning .mo-grabs{padding-inline-end:16px}
/* the open day, under the week and the month (27.10) */
html body.mod-planning .wk-open,.pod{position:relative;margin-top:16px;border-radius:24px;padding:16px;background:var(--nu-ground,#e9e7e3);
  box-shadow:-5px -5px 12px var(--nu-lit,rgba(255,255,255,.95)),7px 9px 20px var(--nu-shade-soft,rgba(168,160,148,.3))}
.pod-h{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}
.pod-t{font-size:16px;font-weight:800;color:var(--nu-ink,#4a453f)}
.pod-x{border:none;border-radius:999px;padding:7px 14px;font:700 13px/1 inherit;color:var(--nu-muted,#6d675e);cursor:pointer;background:var(--nu-ground,#e9e7e3);
  box-shadow:-2px -2px 5px var(--nu-lit,rgba(255,255,255,.95)),3px 3px 7px var(--nu-shade-soft,rgba(168,160,148,.3))}
.pod-go{position:relative;width:100%;display:flex;align-items:center;gap:12px;border:none;border-radius:18px;padding:12px 14px;margin-bottom:12px;cursor:pointer;
  text-align:start;font-family:inherit;color:var(--nu-ink,#4a453f);background:var(--nu-ground,#e9e7e3);
  box-shadow:-4px -4px 10px var(--nu-lit,rgba(255,255,255,.95)),5px 7px 14px var(--nu-shade,rgba(168,160,148,.45))}
.pod-go::after{content:"";position:absolute;left:50%;transform:translateX(-50%);width:54px;bottom:-5px;height:2px;border-radius:2px;background:var(--nu-amber,#f0a92e)}
.pod-go i{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;
  box-shadow:inset 2px 3px 6px var(--nu-shade,rgba(168,160,148,.45)),inset -2px -2px 5px var(--nu-lit,rgba(255,255,255,.95))}
.pod-go svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.pod-go b{flex:1;font-size:15px;font-weight:800}
.pod-e{font-size:14px;color:var(--nu-muted,#6d675e);line-height:1.6;margin-bottom:10px}
.pod-r{display:flex;align-items:center;gap:10px;padding:10px 2px}
.pod-r+.pod-r{border-top:1px solid rgba(168,160,148,.22)}
.pod-d{width:9px;height:9px;border-radius:50%;flex:none}
.pod-w{flex:1;min-width:0;font-size:15px;font-weight:700;color:var(--nu-ink,#4a453f)}
.pod-c{font-size:13px;font-weight:700;color:var(--nu-muted,#6d675e);font-variant-numeric:tabular-nums}
.pod-s{font-size:12px;color:var(--nu-muted,#6d675e)}
.pod-del{flex:none;width:30px;height:30px;border:none;border-radius:50%;font-size:17px;line-height:1;color:var(--nu-muted,#6d675e);cursor:pointer;background:var(--nu-ground,#e9e7e3);
  box-shadow:-2px -2px 5px var(--nu-lit,rgba(255,255,255,.95)),3px 3px 7px var(--nu-shade-soft,rgba(168,160,148,.3))}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
