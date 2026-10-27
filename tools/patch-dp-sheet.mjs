/* The task sheet on the day board (Asaf, 27 Oct: "doesn't match at all"):
 * 10px tracked capitals, a hairline-boxed note, outlined reminder chips, a
 * pale pink button and a dark slab "שמור". In the material now - one ground,
 * a raised close button, the note pressed in, the reminder choices as soft
 * chips (the chosen one pressed with the amber dot), "שמור" raised with the
 * lamp under it, and delete a quiet word. Same functions, same ids. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

rep(`  h+='<div class="summary-sheet" style="padding-bottom:calc(30px + env(safe-area-inset-bottom))"><div class="summary-pull"></div>';
  h+='<button class="summary-close" onclick="dpCloseDetail(true)">&times;</button>';
  h+='<div style="display:flex;align-items:center;gap:9px;margin-bottom:14px">';
  h+='<span style="width:13px;height:13px;border-radius:50%;background:'+c.dot+';flex-shrink:0"></span>';
  h+='<div style="font-size:10px;letter-spacing:.1em;font-weight:700;color:var(--muted)">'+(t.hour!==null?dpHH(t.hour):''+_t('ללא שעה')+'')+(t.src!=='day'?' &middot; '+(t.src==='month'?''+_t('מהחודש')+'':''+_t('מהשבוע')+''):'')+'</div></div>';
  if(t.src==='day')
    h+='<input id="dp-d-title" class="mtin" style="font-size:16px;font-weight:800" value="'+esc(t.w)+'">';
  else
    h+='<div style="font-size:17px;font-weight:800;color:var(--ink);margin-bottom:12px">'+esc(t.w)+'</div>';
  h+='<div style="font-size:10px;letter-spacing:.1em;font-weight:700;color:var(--muted);margin:6px 0 8px">'+_t('פרטים שחשוב לזכור')+'</div>';
  h+='<textarea id="dp-d-note" class="q-input" style="min-height:120px" placeholder="'+_t("מה צריך להביא, עם מי, מה להגיד, מה לא לשכוח...")+'">'+esc(note)+'</textarea>';`,
`  h+='<div class="summary-sheet dps" style="padding-bottom:calc(30px + env(safe-area-inset-bottom))"><div class="summary-pull"></div>';
  h+='<button class="dps-x" onclick="dpCloseDetail(true)" aria-label="'+esc(_t('סגור'))+'">&times;</button>';
  h+='<div class="dps-meta"><span style="background:'+c.dot+'"></span>'+(t.hour!==null?dpHH(t.hour):''+_t('ללא שעה')+'')+(t.src!=='day'?' &middot; '+(t.src==='month'?''+_t('מהחודש')+'':''+_t('מהשבוע')+''):'')+'</div>';
  if(t.src==='day')
    h+='<input id="dp-d-title" class="dps-title dps-in" value="'+esc(t.w)+'">';
  else
    h+='<div class="dps-title">'+esc(t.w)+'</div>';
  h+='<div class="dps-l">'+_t('פרטים שחשוב לזכור')+'</div>';
  h+='<textarea id="dp-d-note" class="dps-note" placeholder="'+_t("מה צריך להביא, עם מי, מה להגיד, מה לא לשכוח...")+'">'+esc(note)+'</textarea>';`);
rep(`  h+='<button onclick="taskLibSave(\\''+esc(t.w).replace(/'/g,"\\\\'")+'\\',\\''+(t.c||'lav')+'\\')" style="width:100%;background:var(--surface);border:none;border-radius:14px;padding:12px;font-size:12.5px;font-weight:700;cursor:pointer;color:var(--muted);font-family:inherit;margin-top:16px">&#9734; '+_t('שמור כמשימה חוזרת')+'</button>';
  h+='<button onclick="dpCloseDetail(true)" style="width:100%;background:var(--cta-fill);border:none;border-radius:14px;padding:14px;font-size:14px;font-weight:800;cursor:pointer;color:var(--white);font-family:inherit;margin-top:8px">'+_t('שמור')+'</button>';
  if(t.src==='day')h+='<button onclick="dpCloseDetail(false);dpDel(\\''+t.id+'\\')" style="width:100%;background:none;border:none;padding:12px;font-size:12px;font-weight:700;color:var(--terra-700);cursor:pointer;font-family:inherit">'+_t('מחק')+'</button>';`,
`  h+='<button class="dps-lib" onclick="taskLibSave(\\''+esc(t.w).replace(/'/g,"\\\\'")+'\\',\\''+(t.c||'lav')+'\\')">&#9734; '+_t('שמור כמשימה חוזרת')+'</button>';
  h+='<button class="dps-ok" onclick="dpCloseDetail(true)">'+_t('שמור')+'</button>';
  if(t.src==='day')h+='<button class="dps-del" onclick="dpCloseDetail(false);dpDel(\\''+t.id+'\\')">'+_t('מחק')+'</button>';`);
rep(`  if(_rid)h+='<button onclick="dpCloseDetail(false);psSeriesEndFrom(\\''+_rid+'\\',_dpDate)" style="width:100%;background:none;border:none;padding:4px 12px 12px;font-size:12px;font-weight:700;color:var(--terra-700);cursor:pointer;font-family:inherit">'`,
  `  if(_rid)h+='<button class="dps-del" onclick="dpCloseDetail(false);psSeriesEndFrom(\\''+_rid+'\\',_dpDate)">'`);
/* the reminder heading */
rep(`  var h='<div style="font-size:10px;letter-spacing:.1em;font-weight:700;color:var(--muted);margin:18px 0 8px">'+_t('תזכורת')+'</div>';`,
  `  var h='<div class="dps-l" style="margin-top:20px">'+_t('תזכורת')+'</div>';`);

rep(`html body.mod-planning .mo-chip-sel{`, `/* the task sheet (27.10) */
.dps{background:#e9e7e3!important;color:#4a453f;--g:#e9e7e3;--l:rgba(255,255,255,.95);--d:rgba(168,160,148,.5);--d2:rgba(168,160,148,.3)}
.dps-x{position:absolute;top:18px;inset-inline-end:18px;width:40px;height:40px;border:none;border-radius:50%;font-size:22px;line-height:1;color:#6d675e;cursor:pointer;
  background:var(--g);box-shadow:-3px -3px 7px var(--l),4px 5px 10px var(--d2)}
.dps-meta{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:700;color:#6d675e;margin:6px 0 8px}
.dps-meta span{width:11px;height:11px;border-radius:50%;flex:none}
.dps-title{font-size:24px;font-weight:800;color:#4a453f;margin:0 0 6px;padding-inline-end:48px}
.dps-in{display:block;width:100%;box-sizing:border-box;border:none;border-radius:16px;padding:10px 14px;font-family:inherit;background:var(--g);outline:none;
  box-shadow:inset 2px 3px 6px var(--d),inset -2px -2px 5px var(--l)}
.dps-l{font-size:14px;font-weight:800;color:#6d675e;margin:16px 0 8px}
.dps-note{display:block;width:100%;box-sizing:border-box;min-height:110px;border:none;border-radius:18px;padding:14px 16px;font-family:inherit;font-size:15px;line-height:1.5;
  color:#4a453f;background:var(--g);outline:none;resize:none;box-shadow:inset 3px 4px 8px var(--d),inset -3px -3px 7px var(--l)}
.dps .dp-rem-row{gap:8px}
.dps .dp-rem-b,html body .dps .dp-rem-b{border:none;border-radius:999px;padding:9px 14px;font-size:13.5px;font-weight:800;color:#4a453f;background:var(--g);
  box-shadow:-3px -3px 7px var(--l),4px 5px 10px var(--d2)}
.dps .dp-rem-b.on,html body .dps .dp-rem-b.on{background:var(--g);color:#4a453f;box-shadow:inset 2px 3px 6px var(--d),inset -2px -2px 5px var(--l)}
.dps .dp-rem-b.on::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:#f0a92e;margin-inline-end:6px;vertical-align:2px}
.dps-lib{display:block;width:100%;margin-top:20px;border:none;border-radius:18px;padding:13px;font-family:inherit;font-size:14.5px;font-weight:800;color:#6d675e;cursor:pointer;
  background:var(--g);box-shadow:-3px -3px 7px var(--l),4px 5px 10px var(--d2)}
.dps-ok{position:relative;display:block;width:100%;margin-top:14px;border:none;border-radius:20px;padding:16px;font-family:inherit;font-size:16px;font-weight:800;color:#4a453f;cursor:pointer;
  background:var(--g);box-shadow:-5px -5px 12px var(--l),7px 9px 18px var(--d)}
.dps-ok::after{content:"";position:absolute;left:50%;transform:translateX(-50%);width:60px;bottom:-6px;height:2px;border-radius:2px;background:#f0a92e}
.dps-del{display:block;width:100%;margin-top:10px;border:none;background:none;padding:12px;font-family:inherit;font-size:14px;font-weight:700;color:#9a3d2a;cursor:pointer}
html body.mod-planning .mo-chip-sel{`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
