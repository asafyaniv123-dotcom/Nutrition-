/* The four questions under the day fold behind one card, "למקד את היום"
 * (Asaf, 27 Oct). Closed by default; a tap opens them in place; what is
 * already answered is counted on the card so it is not forgotten. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

rep(`  var feels=(dpl.feeling||'');
  out+='<div class="dp-deep">';`,
`  var feels=(dpl.feeling||'');
  /* folded behind one card until asked for (27.10) */
  var _dn=(dpl.intent?1:0)+(feels?1:0)+(dpl.blocker?1:0)+((Array.isArray(dpl.reminders)&&dpl.reminders.length)?1:0);
  out+='<button class="dpf'+(_dpDeepOpen?' on':'')+'" onclick="_dpDeepOpen=!_dpDeepOpen;renderPlanDay()">'+
       '<span><b>'+_t('למקד את היום')+'</b><i>'+(_dn?_t('{n} מתוך 4 נענו',{n:_dn}):_t('מה חשוב, איך להרגיש, מה עלול להפריע'))+'</i></span>'+
       '<em>'+(_dpDeepOpen?'&#8963;':'&#8964;')+'</em></button>';
  if(!_dpDeepOpen)return out+'</div>';
  out+='<div class="dp-deep">';`);
rep(`var _dpLibShow=false;`, `var _dpLibShow=false,_dpDeepOpen=false;`);
rep(`body.dpk-on #content{padding-bottom:150px}`, `body.dpk-on #content{padding-bottom:150px}
.dpf{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;margin:18px 0 10px;border:none;border-radius:22px;padding:16px 18px;
  font-family:inherit;text-align:start;cursor:pointer;color:var(--nu-ink,#4a453f);background:var(--nu-ground,#e9e7e3);
  box-shadow:-4px -4px 10px var(--nu-lit,rgba(255,255,255,.95)),5px 7px 14px var(--nu-shade-soft,rgba(168,160,148,.3))}
.dpf.on{box-shadow:inset 2px 3px 6px var(--nu-shade,rgba(168,160,148,.45)),inset -2px -2px 5px var(--nu-lit,rgba(255,255,255,.95))}
.dpf b{display:block;font-size:17px;font-weight:800}
.dpf i{display:block;font-style:normal;font-size:13px;font-weight:600;color:var(--nu-muted,#6d675e);margin-top:3px}
.dpf em{font-style:normal;font-size:20px;color:var(--nu-muted,#6d675e)}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
