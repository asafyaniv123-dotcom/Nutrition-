/* The saved tasks in the writing bar (Asaf, 27 Oct): they appear only when ☆
 * is pressed, in their own titled tray above the bar - a soft panel that
 * scrolls sideways - and the waiting tasks stay where they were. A tap on a
 * saved task puts it straight into the day (or the month's waiting row);
 * dragging it onto an hour still works. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`  var row=_dpLibShow?lib:loose;
  if(_dpColShow){
    h+='<div class="dpk-cols">'+wkSwatches("dpkColor('%K%')",_mo?(_wkNewColor||'lav'):(_dpNewColor||'lav'))+'</div>';
  }else if(row.length){
    h+='<div class="dpk-row">';
    for(i=0;i<row.length;i++){var c=wkColor(row[i].c);
      h+='<div class="dpk-chip" '+(_dpLibShow?'data-lib':'data-task')+'="'+row[i].id+'" style="background:'+c.soft+';color:'+c.ink+'">'+esc(row[i].w)+'</div>';}
    h+='</div>';
  }else if(_dpLibShow)h+='<div class="dpk-hint">'+_t('שמור כאן משימה שחוזרת אצלך, וגרור אותה מכאן במקום לכתוב אותה שוב.')+'</div>';`,
`  var row=loose;
  if(_dpLibShow){
    /* the saved ones, only when asked for: a tray of their own */
    h+='<div class="dpk-tray"><div class="dpk-th">'+_t('משימות חוזרות')+'<span>'+_t('לחיצה מוסיפה, או גרירה לשעה')+'</span></div>';
    if(lib.length){h+='<div class="dpk-row">';
      for(i=0;i<lib.length;i++){var lc=wkColor(lib[i].c);
        h+='<div class="dpk-chip" data-lib="'+lib[i].id+'" onclick="dpkUseLib(\\''+lib[i].id+'\\')" style="background:'+lc.soft+';color:'+lc.ink+'">'+esc(lib[i].w)+'</div>';}
      h+='</div>';}
    else h+='<div class="dpk-hint">'+_t('שמור כאן משימה שחוזרת אצלך, וגרור אותה מכאן במקום לכתוב אותה שוב.')+'</div>';
    h+='</div>';
  }
  if(_dpColShow){
    h+='<div class="dpk-cols">'+wkSwatches("dpkColor('%K%')",_mo?(_wkNewColor||'lav'):(_dpNewColor||'lav'))+'</div>';
  }else if(row.length){
    h+='<div class="dpk-row">';
    for(i=0;i<row.length;i++){var c=wkColor(row[i].c);
      h+='<div class="dpk-chip" data-task="'+row[i].id+'" style="background:'+c.soft+';color:'+c.ink+'">'+esc(row[i].w)+'</div>';}
    h+='</div>';
  }`);
rep(`function dpkColor(k){`,`/* a tap on a saved task: into the day without an hour, or the month's waiting row */
function dpkUseLib(id){
  var t=taskLibFind(id);if(!t)return;
  var nid=(typeof planView==='function'&&planView()==='month'?'t':'d')+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  if(typeof planView==='function'&&planView()==='month'){var p=loadPool();p.tasks.push({id:nid,w:t.w,c:t.c||'lav'});savePool(p);}
  else{var dp=loadDPlan(_dpDate);dp.items.push({id:nid,w:t.w,c:t.c||'lav'});saveDPlan(_dpDate,dp);}
  appHaptic&&appHaptic();renderPlanning();
}
function dpkColor(k){`);
rep(`.dpk-cols{padding:8px 10px 12px}`,`.dpk-cols{padding:8px 10px 12px}
.dpk-tray{margin:0 0 10px;padding:12px 10px 4px;border-radius:22px;background:#e9e7e3;
  box-shadow:-4px -4px 10px rgba(255,255,255,.95),6px 8px 18px rgba(120,104,88,.2);animation:dpkTray .3s cubic-bezier(.22,.61,.36,1) both}
@keyframes dpkTray{from{opacity:0;transform:translateY(10px)}}
.dpk-th{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:0 6px 4px;font-size:14px;font-weight:800;color:#4a453f}
.dpk-th span{font-size:12px;font-weight:600;color:#6d675e}
.dpk-tray .dpk-chip{cursor:pointer}`);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
