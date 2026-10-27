// The draft planner, walked with real pointer events and typing.
(async function(){try{
  var w=function(ms){return new Promise(function(r){setTimeout(r,ms);});},out=[];
  document.querySelector('.bar').style.display='none';document.querySelector('.wrap').style.padding='0';fit();
  function c(el){var r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};}
  function pe(t,x,y,el){(el||document.elementFromPoint(x,y)).dispatchEvent(new PointerEvent(t,{clientX:x,clientY:y,pointerId:1,isPrimary:true,bubbles:true,cancelable:true}));}
  async function drag(a,b,n){pe('pointerdown',a.x,a.y);for(var i=1;i<=(n||12);i++){pe('pointermove',a.x+(b.x-a.x)*i/(n||12),a.y+(b.y-a.y)*i/(n||12));await w(25);}pe('pointerup',b.x,b.y);await w(200);}
  // 1 pool -> Wednesday
  await drag(c(document.querySelector('#pool [data-id="p2"]')),c(document.querySelector('.wcol[data-drop-date="2026-10-28"]')));
  out.push('pool->wed: '+JSON.stringify(find('p2'))+' pool '+S.pool.length);
  // 2 stretch ללמוד (Tue) to Thu
  await drag(c(document.querySelector('[data-bead="b"]')),c(document.querySelector('.wcol[data-drop-date="2026-10-29"] .whd')));
  out.push('stretch b len '+find('b').len);
  // 3 undo
  document.getElementById('undo-b').click();await w(100);out.push('after undo len '+find('b').len);
  // 4 type
  var i=document.getElementById('in');i.value='רופא מחר 10:00';i.dispatchEvent(new Event('input'));document.getElementById('add').click();await w(100);
  out.push('typed: '+JSON.stringify(S.tasks[S.tasks.length-1]));
  // 5 go to Tuesday's day view and move ללמוד to 14:00
  document.querySelector('.whd[data-day="2026-10-27"]').click();await w(200);
  var row=document.querySelector('.hrow[data-drop-hour="14"]');row.scrollIntoView({block:'center'});await w(100);
  await drag(c(document.querySelector('.blk[data-id="b"]')),c(row));
  out.push('moved b to '+find('b').s/60+'h e '+find('b').e/60);
  // 6 delete לשלם חשבון via bin
  document.getElementById('scroll').scrollTop=0;await w(100);
  await drag(c(document.querySelector('.allday [data-id="d"]')),c(document.getElementById('bin')),16);
  out.push('d deleted: '+!find('d'));
  return out.join(" | ");}catch(err){return "ERR "+err.message+" @ "+out.join(" | ");}
})()
