/* Asaf still could not stretch (27 Oct) - and he was right. His task was
 * written on the DAY board, and a day item is drawn on the week (as a timed
 * block) and on the month (as a chip) with no grab point at all: only the
 * week's own tasks could be stretched. Now every task can: pulling a day item's
 * bead first moves it into its week's record as a week task - its hour, end,
 * note and reminder stay on its day - and then stretches like any other.
 * Week tasks that have an hour (drawn as timed blocks) get the bead too. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

/* the move */
rep(`function moDayItemsOn(date){`, `/* A DAY ITEM BECOMES A WEEK TASK, so it can run across days. Same id, so
   its reminder (dp.rem) and anything keyed by it keep working; its hour, end
   and note move to where a week task keeps them on its day. */
function dpPromote(date,id){
  var dp=loadDPlan(date),i,it=null;
  for(i=0;i<dp.items.length;i++)if(dp.items[i].id===id){it=dp.items.splice(i,1)[0];break;}
  if(!it)return false;
  var sun=weekSunday(new Date(date+'T12:00:00')),wk=loadWeek(sun),h=typeof it.h==='number'?it.h:null,slot='m',j;
  if(h!==null)for(j=0;j<WK_SLOTS.length;j++)if(h>=WK_SLOTS[j][3]&&h<WK_SLOTS[j][4])slot=WK_SLOTS[j][0];
  wk.tasks.push({id:id,w:it.w,c:it.c||'lav',d:date,s:slot});
  if(h!==null){dp.hours=dp.hours||{};dp.hours[id]=h;if(it.mn){dp.mins=dp.mins||{};dp.mins[id]=it.mn;}if(it.e){dp.ends=dp.ends||{};dp.ends[id]=it.e;}}
  if(it.n){dp.notes=dp.notes||{};dp.notes[id]=it.n;}
  saveDPlan(date,dp);saveWeek(sun,wk);
  return true;
}
function moDayItemsOn(date){`);

/* the month: a day item's chip carries the bead */
rep(`      h+='<div class="mo-chip" style="background:'+dc.soft+';color:'+dc.ink+'">'+esc(di[t].w)+'</div>';`,
`      h+='<div class="mo-chip mo-grabs" style="background:'+dc.soft+';color:'+dc.ink+'">'+esc(di[t].w)+
         '<div data-mostretch="'+esc(di[t].id)+'" data-mostart="'+st+'" data-moday="1"'+
         ' data-mosun="'+wkStamp(weekSunday(new Date(st+'T12:00:00')))+'"'+
         ' style="position:absolute;inset-inline-end:-10px;top:50%;margin-top:-14px;width:28px;height:28px;z-index:2;'+
         'pointer-events:auto;cursor:ew-resize;touch-action:none;display:flex;align-items:center;justify-content:center">'+
         '<div class="mo-grip"></div></div></div>';`);
rep(`    var sd=gh.getAttribute('data-mostart'),sn=gh.getAttribute('data-mosun');
    if(!sd||!sn)return;`,
`    var sd=gh.getAttribute('data-mostart'),sn=gh.getAttribute('data-mosun');
    if(!sd||!sn)return;
    if(gh.getAttribute('data-moday'))dpPromote(sd,gh.getAttribute('data-mostretch'));`);

/* the week: a timed block carries the bead, a day item's promoted on the pull */
rep(`          if(!p.ct){
            if(p.hgt<22)h+=esc(p.w);
            else h+='<span class="wk-t">'+dpHM(p.h,p.mn)+(p.e?'&ndash;'+dpFmt(p.e):'')+'</span>'+esc(p.w);
          }
          h+='</div>';`,
`          if(!p.ct){
            if(p.hgt<22)h+=esc(p.w);
            else h+='<span class="wk-t">'+dpHM(p.h,p.mn)+(p.e?'&ndash;'+dpFmt(p.e):'')+'</span>'+esc(p.w);
            /* the bead that stretches it, on the piece that starts it */
            if(p.src==='day'||p.src==='week')
              h+='<div data-stretch="'+esc(p.id)+'"'+(p.src==='day'?' data-stday="'+st+'"':'')+' class="wk-blk-g">'+
                 '<div class="mo-grip"></div></div>';
          }
          h+='</div>';`);
rep(`    var sid=gh.getAttribute('data-stretch'),wk=loadWeek(_wkSun),st=null,q;`,
  `    if(gh.getAttribute('data-stday'))dpPromote(gh.getAttribute('data-stday'),gh.getAttribute('data-stretch'));
    var sid=gh.getAttribute('data-stretch'),wk=loadWeek(_wkSun),st=null,q;`);
rep(`html body.mod-planning .mo-grabs{padding-inline-end:16px}`, `html body.mod-planning .mo-grabs{padding-inline-end:16px}
html body.mod-planning .mo-chip.mo-grabs{position:relative;overflow:visible}
.wk-blk-g{position:absolute;inset-inline-end:-12px;top:-2px;width:28px;height:28px;z-index:3;pointer-events:auto;cursor:ew-resize;touch-action:none;display:flex;align-items:center;justify-content:center}
html body.mod-planning .wk-blk{overflow:visible}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
