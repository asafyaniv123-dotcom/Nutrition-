/* "משחק" looked stuck above the writing bar (Asaf, 27 Oct). It was a task
 * running over several days with no hour - put on the week or the month - and
 * the bar's row showed it beside what had just been written, with nothing
 * saying where it came from. Such tasks are this day's ALL-DAY tasks: they now
 * sit in a "כל היום" row at the top of the day's hours, where a day's
 * all-day things belong (a tap opens it, a drag gives it an hour). The bar's
 * row holds only what was written on this day and is still waiting. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`  else for(i=0;i<all.length;i++)if(all[i].hour===null)loose.push(all[i]);`,
  `  else for(i=0;i<all.length;i++)if(all[i].hour===null&&all[i].src==='day')loose.push(all[i]);`);
rep(`  // the hours
  out+='<div class="dp-grid">';`,
`  /* the day's all-day tasks: put on the week or the month without an hour */
  var _ad=all.filter(function(x){return x.hour===null&&x.src!=='day';});
  if(_ad.length){
    out+='<div class="dp-allday"><span>'+_t('כל היום')+'</span><div>';
    for(i=0;i<_ad.length;i++){var _c=wkColor(_ad[i].c);
      out+='<div class="dpk-chip" data-task="'+_ad[i].id+'" onclick="dpOpenDetail(\\''+_ad[i].id+'\\')" style="background:'+_c.soft+';color:'+_c.ink+'">'+esc(_ad[i].w)+'</div>';}
    out+='</div></div>';
  }
  // the hours
  out+='<div class="dp-grid">';`);
rep(`.dpk-cols{padding:8px 10px 12px}`,`.dpk-cols{padding:8px 10px 12px}
.dp-allday{display:flex;align-items:center;gap:10px;margin:0 0 12px;padding:10px 12px;border-radius:18px;
  box-shadow:inset 2px 3px 6px var(--nu-shade,rgba(168,160,148,.45)),inset -2px -2px 5px var(--nu-lit,rgba(255,255,255,.95))}
.dp-allday>span{flex:none;font-size:13px;font-weight:800;color:var(--nu-muted,#6d675e)}
.dp-allday>div{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:2px}
.dp-allday .dpk-chip{padding:7px 12px;font-size:13.5px}`);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
