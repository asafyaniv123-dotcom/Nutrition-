/* סיום יום's "your week" card (Asaf, 27 Oct: the rectangle does not fit):
 * seven days were seven outlined boxes, a written one a slab of mood colour.
 * Now the card is the material, and each day a small pressed well with its
 * weekday letter under it; a written day lights inside its well with the
 * mood's colour, today carries the amber dot. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`  var h='<div style="background:var(--card);border-radius:22px;padding:18px 16px;margin:20px 0 4px;box-shadow:0 4px 20px rgba(200,180,160,.12)">';
  h+='<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px">';
  h+='<div style="font-size:13px;font-weight:800;color:var(--ink)">'+_t('השבוע שלך')+'</div>';`,
`  var h='<div class="rfwk">';
  h+='<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px">';
  h+='<div style="font-size:17px;font-weight:800;color:var(--nu-ink)">'+_t('השבוע שלך')+'</div>';`);
rep(`  h+='<div style="display:flex;gap:6px;margin-bottom:16px">';
  for(i=0;i<days.length;i++){
    var rec=days[i].r,mood=rec&&rec.mood?Math.max(1,Math.min(5,rec.mood)):0;
    var col=mood?RF_MOODS[mood-1].c:"transparent";
    var bd=mood?"transparent":"var(--line-strong)";
    h+='<button class="rf-wkdot" onclick="rfPickDay(&quot;'+days[i].d+'&quot;)" '+
       'aria-label="'+esc(fmtDate(days[i].d))+'" title="'+esc(fmtDate(days[i].d))+'" '+
       'style="background:'+col+';border-color:'+bd+'"></button>';
  }
  h+='</div>';`,
`  h+='<div class="rfwk-days">';
  for(i=0;i<days.length;i++){
    var rec=days[i].r,mood=rec&&rec.mood?Math.max(1,Math.min(5,rec.mood)):0;
    var col=mood?RF_MOODS[mood-1].c:(rec?'#c9bfb2':'');
    h+='<button class="rfwk-d'+(days[i].d===todayStr()?' t':'')+'" onclick="rfPickDay(&quot;'+days[i].d+'&quot;)" '+
       'aria-label="'+esc(fmtDate(days[i].d))+'" title="'+esc(fmtDate(days[i].d))+'">'+
       '<i>'+(col?'<b style="background:'+col+'"></b>':'')+'</i><span>'+esc(dfmt(new Date(days[i].d+'T12:00:00'),{weekday:'narrow'}))+'</span></button>';
  }
  h+='</div>';`);
rep(`.rf-wkdot{position:relative;`,`.rfwk{border-radius:24px;padding:18px 16px;margin:20px 0 4px;background:var(--nu-ground,#e9e7e3);
  box-shadow:-5px -5px 12px var(--nu-lit,rgba(255,255,255,.95)),7px 9px 20px var(--nu-shade-soft,rgba(168,160,148,.3))}
.rfwk-days{display:flex;justify-content:space-between;margin-bottom:16px}
.rfwk-d{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;border:none;background:none;padding:0;cursor:pointer;font-family:inherit}
.rfwk-d i{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;
  box-shadow:inset 2px 3px 6px var(--nu-shade,rgba(168,160,148,.45)),inset -2px -2px 5px var(--nu-lit,rgba(255,255,255,.95))}
.rfwk-d b{width:18px;height:18px;border-radius:50%;box-shadow:0 1px 3px rgba(90,74,60,.25)}
.rfwk-d span{font-size:12px;font-weight:800;color:var(--nu-muted,#6d675e)}
.rfwk-d.t span::after{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:#f0a92e;margin-inline-start:3px;vertical-align:2px}
.rf-wkdot{position:relative;`);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
