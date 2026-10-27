(async function(){try{
  var w=function(ms){return new Promise(function(r){setTimeout(r,ms);});},out=[];
  document.querySelectorAll('.bms').forEach(function(e){e.remove()});
  localStorage.setItem(AREA_TOUR_KEY,JSON.stringify({planning:1}));localStorage.setItem(PLAN_VIEW_KEY,'month');
  enterModule('planning');await w(1200);
  out.push('old strip '+!!document.querySelector('#plan-sec-month .pl-bar'));
  var i=document.getElementById('dp-rail-in');out.push('ph '+i.placeholder);
  i.value='כנס';i.dispatchEvent(new Event('input'));document.querySelector('.dpk-add').click();await w(300);
  var chip=[].filter.call(document.querySelectorAll('.dpk-chip'),function(c){return c.textContent==='כנס';})[0];out.push('chip '+!!chip);
  var cell=document.querySelector('.mo-cell[data-date="'+dayShift(2)+'"]');cell.scrollIntoView({block:'center'});await w(200);
  chip=[].filter.call(document.querySelectorAll('.dpk-chip'),function(c){return c.textContent==='כנס';})[0];
  var a=chip.getBoundingClientRect(),b=cell.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2,bx=b.left+b.width/2,by=b.top+b.height/2;
  function pe(t,x,y,el){(el||window).dispatchEvent(new PointerEvent(t,{clientX:x,clientY:y,pointerId:1,isPrimary:true,bubbles:true,cancelable:true}));}
  pe('pointerdown',ax,ay,chip);for(var k=1;k<=14;k++){pe('pointermove',ax+(bx-ax)*k/14,ay+(by-ay)*k/14);await w(30);}pe('pointerup',bx,by);await w(500);
  var on=moWeekTasksOn(dayShift(2),{}).some(function(t){return t.w==='כנס';});out.push('on day+2 '+on+' pool '+loadPool().tasks.length);
  return out.join(' | ');
}catch(e){return 'ERR '+e.message;}})()
