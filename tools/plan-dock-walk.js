// the writing bar: type, add, drag the chip onto 14:00; swipe the week strip
(async function(){try{
  var w=function(ms){return new Promise(function(r){setTimeout(r,ms);});},out=[];
  document.querySelectorAll('.bms').forEach(function(e){e.remove()});
  localStorage.setItem(AREA_TOUR_KEY,JSON.stringify({planning:1}));localStorage.setItem(PLAN_VIEW_KEY,'day');
  enterModule('planning');await w(1200);
  var i=document.getElementById('dp-rail-in');i.value='לקנות חלב';i.dispatchEvent(new Event('input'));document.querySelector('.dpk-add').click();await w(300);
  var chip=[].filter.call(document.querySelectorAll('.dpk-chip'),function(c){return c.textContent==='לקנות חלב';})[0];
  out.push('chip '+!!chip);
  var slot=document.querySelector('.dp-slot[data-hour="14"]');slot.scrollIntoView({block:'center'});await w(300);
  chip=[].filter.call(document.querySelectorAll('.dpk-chip'),function(c){return c.textContent==='לקנות חלב';})[0];
  var a=chip.getBoundingClientRect(),b=slot.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2,bx=b.left+b.width/2,by=b.top+10;
  function pe(t,x,y,el){(el||document.elementFromPoint(x,y)).dispatchEvent(new PointerEvent(t,{clientX:x,clientY:y,pointerId:1,isPrimary:true,bubbles:true,cancelable:true}));}
  pe('pointerdown',ax,ay,chip);for(var k=1;k<=14;k++){pe('pointermove',ax+(bx-ax)*k/14,ay+(by-ay)*k/14,window);await w(30);}pe('pointerup',bx,by,window);await w(400);
  var it=loadDPlan(todayStr()).items.filter(function(x){return x.w==='לקנות חלב';})[0];out.push('hour '+(it&&it.h));
  // swipe the strip to the next week
  var st=document.getElementById('plws');st.scrollLeft=st.children[2].offsetLeft-(st.clientWidth-st.children[2].offsetWidth)/2;st.dispatchEvent(new Event('pointerdown'));st.scrollLeft=st.scrollLeft;st.dispatchEvent(new Event('scroll'));await w(500);
  out.push('day after swipe '+_dpDate+' (was '+todayStr()+')');
  return out.join(' | ');
}catch(e){return 'ERR '+e.message;}})()
