/* Planning stays as it is (Asaf, 27 Oct), with what nutrition already has: a
 * long press on a task - on the month or the week - lifts it and opens the
 * same menu, with three things in it:
 *   גרירת משימה - the task comes up under the finger: touch anywhere and drag
 *                 it onto a day (or just tap the day); it moves there
 *   תאריכים     - a start date and an end date on the app's own wheels; the
 *                 task runs from one to the other
 *   מחיקה
 * It works for both kinds a board holds - a week task and a task written on
 * the day board (which becomes a week task when it is given more than a day). */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

/* tag what can be pressed */
rep(`          h+='<div class="wk-chip" style="position:relative;background:'+cc.soft+';color:'+cc.ink+(ech?';opacity:.55':'')+'">'+`,
  `          h+='<div class="wk-chip"'+(ech?'':' data-ptk="'+esc(list[t].id)+'" data-pdate="'+esc(list[t].d)+'"')+' style="position:relative;background:'+cc.soft+';color:'+cc.ink+(ech?';opacity:.55':'')+'">'+`);
rep(`          h+='<div class="wk-blk'+(p.ct?' ct':'')+(p.cb?' cb':'')+'" style="'+`,
  `          h+='<div class="wk-blk'+(p.ct?' ct':'')+(p.cb?' cb':'')+'"'+((p.src==='day'||p.src==='week')?' data-ptk="'+esc(p.id)+'" data-pdate="'+st+'"'+(p.src==='day'?' data-pday="1"':''):'')+' style="'+`);
rep(`    h+='<div style="position:absolute;z-index:4;pointer-events:none;'+
       'inset-inline-start:calc('+(ci*100/7)+'% + 3px);'+`,
  `    h+='<div data-ptk="'+esc(t.id)+'" data-pdate="'+esc(t.d)+'" style="position:absolute;z-index:4;pointer-events:auto;'+
       'inset-inline-start:calc('+(ci*100/7)+'% + 3px);'+`);
rep(`        h+='<div class="mo-chip mo-grabs'+(_moSel===wt[t].id?' mo-chip-sel':'')+'"'+`,
  `        h+='<div class="mo-chip mo-grabs'+(_moSel===wt[t].id?' mo-chip-sel':'')+'" data-ptk="'+esc(wt[t].id)+'" data-pdate="'+esc(wt[t].d)+'"'+`);
rep(`      h+='<div class="mo-chip mo-grabs" style="background:'+dc.soft+';color:'+dc.ink+'">'+esc(di[t].w)+`,
  `      h+='<div class="mo-chip mo-grabs" data-ptk="'+esc(di[t].id)+'" data-pdate="'+st+'" data-pday="1" style="background:'+dc.soft+';color:'+dc.ink+'">'+esc(di[t].w)+`);
rep(`    bar.className='mo-span';`, `    bar.className='mo-span';
    bar.setAttribute('data-ptk',id);bar.setAttribute('data-pdate',src.getAttribute('data-spanstart')||'');`);

/* the long press reaches them; a press on the stretch bead stays a stretch */
rep(`function lpTarget(t){return t&&t.closest?t.closest('.log-sw > .log-item, .co-u[data-ti]'):null;}`,
  `function lpTarget(t){
  if(!t||!t.closest)return null;
  if(t.closest('[data-stretch],[data-mostretch]'))return null;
  return t.closest('.log-sw > .log-item, .co-u[data-ti], [data-ptk]');
}`);
rep(`  var ic=function(d){return '<svg viewBox="0 0 24 24">'+d+'</svg>';};
  m.innerHTML='<div class="lp-grp">'+`,
  `  var ic=function(d){return '<svg viewBox="0 0 24 24">'+d+'</svg>';};
  if(el.hasAttribute('data-ptk'))m.innerHTML='<div class="lp-grp">'+
      '<button role="menuitem" onclick="lpAct(\\'pdrag\\')"><span>'+_t('גרירת משימה')+'</span>'+ic('<path d="M12 3v18M3 12h18"/><path d="M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>')+'</button>'+
      '<button role="menuitem" onclick="lpAct(\\'pdates\\')"><span>'+_t('תאריך התחלה וסיום')+'</span>'+ic('<rect x="4" y="5.5" width="16" height="14.5" rx="3"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>')+'</button>'+
    '</div><div class="lp-grp">'+
      '<button role="menuitem" class="lp-del" onclick="lpAct(\\'pdel\\')"><span>'+_t('מחיקה')+'</span>'+ic('<path d="M4 7h16"/><path d="M9 7V4.5h6V7"/><path d="M6.5 7l1 13h9l1-13"/>')+'</button>'+
    '</div>';
  else m.innerHTML='<div class="lp-grp">'+`);
rep(`  var el=m._el;lpClose();
  if(!el)return;`, `  var el=m._el;lpClose();
  if(!el)return;
  if(el.hasAttribute('data-ptk')){ptAct(what,el.getAttribute('data-ptk'),el.getAttribute('data-pdate'),!!el.getAttribute('data-pday'),el);return;}`);

/* the three actions */
rep(`function lpCopy(txt){`, `/* ── A TASK ON THE BOARDS, PRESSED ──
   Where a task lives: a week task in its week's record, or an item written on
   one day. Found by id from the day it was pressed on. */
function ptFind(id,date,isDay){
  if(isDay){var dp=loadDPlan(date),i;for(i=0;i<dp.items.length;i++)if(dp.items[i].id===id)return {kind:'day',date:date,t:dp.items[i]};}
  var k,sun;for(k=0;k<=MO_SPAN_BACK;k++){sun=wkDateOf(weekSunday(new Date(date+'T12:00:00')),-7*k);
    var wk=loadWeek(sun),j;for(j=0;j<wk.tasks.length;j++)if(wk.tasks[j].id===id)return {kind:'week',sun:sun,t:wk.tasks[j]};}
  return null;
}
/* a task to a new start (and a length): out of wherever it is, into the
   week its new day belongs to, with what it keeps on its day */
function ptPlace(id,date,isDay,to,len,slot){
  var f=ptFind(id,date,isDay);if(!f)return false;
  if(f.kind==='day'&&(len||1)<2){
    if(to===date)return true;
    var a=loadDPlan(date),b=loadDPlan(to),i,it=null;
    for(i=0;i<a.items.length;i++)if(a.items[i].id===id){it=a.items.splice(i,1)[0];break;}
    if(!it)return false;b.items.push(it);
    if(a.rem&&a.rem[id]!==undefined){b.rem=b.rem||{};b.rem[id]=a.rem[id];delete a.rem[id];}
    saveDPlan(date,a);saveDPlan(to,b);return true;
  }
  if(f.kind==='day'){dpPromote(date,id);f=ptFind(id,date,false);if(!f)return false;}
  var from=f.t.d,old=loadWeek(f.sun),t=null,n;
  old.tasks=old.tasks.filter(function(x){if(x.id===id){t=x;return false;}return true;});
  if(!t)return false;
  t.d=to;if(slot)t.s=slot;
  if(len!==undefined){if(len>1)t.len=Math.min(len,WK_MAX_LEN);else delete t.len;}
  var sun2=weekSunday(new Date(to+'T12:00:00'));
  if(wkStamp(sun2)===wkStamp(f.sun)){old.tasks.push(t);saveWeek(f.sun,old);}
  else{saveWeek(f.sun,old);n=loadWeek(sun2);n.tasks.push(t);saveWeek(sun2,n);}
  if(from&&from!==to)dpCarry(from,to,id);
  return true;
}
function ptAct(what,id,date,isDay,el){
  if(what==='pdel'){
    var f=ptFind(id,date,isDay);if(!f)return;
    if(f.kind==='day'){var dp=loadDPlan(date);dp.items=dp.items.filter(function(x){return x.id!==id;});saveDPlan(date,dp);}
    else{var wk=loadWeek(f.sun);wk.tasks=wk.tasks.filter(function(x){return x.id!==id;});saveWeek(f.sun,wk);}
    renderPlanning();showToast(_t('נמחק'));return;
  }
  if(what==='pdates'){ptDates(id,date,isDay);return;}
  if(what==='pdrag')ptDrag(id,date,isDay,el);
}
/* start and end, on the app's wheels */
function ptDates(id,date,isDay){
  var f=ptFind(id,date,isDay);if(!f)return;
  var start=f.kind==='day'?date:f.t.d,len=f.kind==='day'?1:wkLenOf(f.t),end=wkStamp(wkDateOf(new Date(start+'T12:00:00'),len-1));
  var y=appNow().getFullYear(),ys=[y-1,y,y+1,y+2];
  var ov=document.createElement('div');ov.className='cf-ov fss-ov';ov.id='bw-ov';
  ov.innerHTML='<div class="cf-card fss"><div class="cf-q" style="margin-bottom:4px">'+esc(f.t.w)+'</div>'+
    '<div class="pt-wl">'+esc(_t('התחלה'))+'</div>'+bwHTML('pt-s',{years:ys,noAge:true})+
    '<div class="pt-wl">'+esc(_t('סיום'))+'</div>'+bwHTML('pt-e',{years:ys,noAge:true})+
    '<div class="tm-sv-col" style="margin-top:14px"><button class="cf-yes" id="bw-ok">'+esc(_t('שמור'))+'</button><button class="cf-no" id="bw-x">'+esc(_t('ביטול'))+'</button></div></div>';
  document.body.appendChild(ov);bwInit('pt-s',start);bwInit('pt-e',end);
  var close=function(){if(ov.parentNode)ov.parentNode.removeChild(ov);};
  document.getElementById('bw-x').onclick=close;ov.onclick=function(e){if(e.target===ov)close();};
  document.getElementById('bw-ok').onclick=function(){
    var a=bwVal('pt-s'),b=bwVal('pt-e'),n=Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000)+1;
    if(n<1){showToast(_t('הסיום לפני ההתחלה'));return;}
    if(n>WK_MAX_LEN){showToast(_t('עד {n} ימים',{n:WK_MAX_LEN}));return;}
    close();ptPlace(id,date,isDay,a,n);renderPlanning();
    showToast(n>1?_t('{n} ימים',{n:n}):_t('נשמר'));
  };
}
/* the task comes up under the finger: touch anywhere and drag it to a day,
   or tap the day */
function ptDrag(id,date,isDay,el){
  var f=ptFind(id,date,isDay);if(!f)return;
  var r=el.getBoundingClientRect(),g=document.createElement('div'),c=wkColor(f.t.c);
  g.className='pt-ghost';g.innerHTML='<b></b><span>'+esc(_t('גוררים ליום, או לוחצים עליו'))+'</span>';g.querySelector('b').textContent=f.t.w;
  g.style.background=c.soft;g.style.color=c.ink;
  var x=r.left+r.width/2,y=r.top+r.height/2;
  g.style.left=x+'px';g.style.top=y+'px';
  var x0=document.createElement('button');x0.className='pt-cancel';x0.textContent=_t('ביטול');
  document.body.appendChild(g);document.body.appendChild(x0);document.body.classList.add('pt-moving');
  var hot=null,live=false;
  function cellAt(px,py){g.style.display='none';var e=document.elementFromPoint(px,py);g.style.display='';
    return e&&e.closest?e.closest('.mo-cell[data-date],.wk-cell[data-date],.dp-slot'):null;}
  function mark(cell){if(hot)hot.classList.remove('hot');hot=cell;if(hot)hot.classList.add('hot');}
  function at(px,py){g.style.left=px+'px';g.style.top=py+'px';mark(cellAt(px,py));}
  function done(){document.removeEventListener('pointerdown',down,true);window.removeEventListener('pointermove',move,true);window.removeEventListener('pointerup',up,true);
    mark(null);g.remove();x0.remove();document.body.classList.remove('pt-moving');}
  function drop(cell){
    var to=cell.getAttribute('data-date')||(cell.classList.contains('dp-slot')?(typeof _dpDate!=='undefined'?_dpDate:''):''),sl=cell.getAttribute('data-slot')||'';
    done();if(!to)return;
    var len=f.kind==='week'?wkLenOf(f.t):1;
    if(ptPlace(id,date,isDay,to,len,sl)){renderPlanning();showToast(_t('הועבר ל{d}',{d:dfmt(new Date(to+'T12:00:00'),{weekday:'long',day:'numeric',month:'numeric'})}));}
  }
  function down(e){
    if(e.target===x0){e.preventDefault();e.stopPropagation();done();return;}
    e.preventDefault();e.stopPropagation();live=true;at(e.clientX,e.clientY);
  }
  function move(e){if(!live)return;e.preventDefault();e.stopPropagation();at(e.clientX,e.clientY);}
  function up(e){if(!live)return;e.preventDefault();e.stopPropagation();live=false;var cell=cellAt(e.clientX,e.clientY);if(cell)drop(cell);}
  setTimeout(function(){document.addEventListener('pointerdown',down,true);window.addEventListener('pointermove',move,true);window.addEventListener('pointerup',up,true);},50);
}
function lpCopy(txt){`);

rep(`.lp-menu .lp-del{color:var(--terra-700)}`, `.lp-menu .lp-del{color:var(--terra-700)}
/* a task being moved after a long press: it hangs over the board, and a day
   lights under it */
.pt-ghost{position:fixed;z-index:960;transform:translate(-50%,-115%) rotate(-2deg);pointer-events:none;padding:10px 16px;border-radius:14px;text-align:center;
  box-shadow:0 14px 30px rgba(60,48,36,.3);transition:left .05s,top .05s}
.pt-ghost b{display:block;font-size:15px;font-weight:800;white-space:nowrap}
.pt-ghost span{display:block;font-size:11.5px;font-weight:700;opacity:.75;margin-top:2px;white-space:nowrap}
.pt-cancel{position:fixed;z-index:961;left:50%;transform:translateX(-50%);bottom:calc(112px + env(safe-area-inset-bottom));border:none;border-radius:999px;padding:11px 22px;
  font-family:inherit;font-size:14.5px;font-weight:800;color:#4a453f;background:#f3f0eb;box-shadow:-3px -3px 9px rgba(255,255,255,.85),6px 10px 22px rgba(90,74,60,.22)}
body.pt-moving .mo-cell[data-date],body.pt-moving .wk-cell[data-date]{transition:background .12s}
.pt-wl{font-size:13px;font-weight:800;color:var(--nu-muted,#6d675e);margin:12px 0 2px}
[data-ptk]{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
