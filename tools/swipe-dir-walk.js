(async function(){try{
  var w=function(m){return new Promise(function(r){setTimeout(r,m)})},out=[];
  document.querySelectorAll('.bms').forEach(function(e){e.remove()});localStorage.setItem(AREA_TOUR_KEY,JSON.stringify({planning:1}));
  localStorage.setItem(PLAN_VIEW_KEY,'month');enterModule('planning');await w(1200);
  var c=document.querySelector('.mo-cell[data-date="2026-10-14"]');c.scrollIntoView({block:'center'});await w(200);
  var y=c.getBoundingClientRect().top+30;
  function pe(t,x,el){(el||window).dispatchEvent(new PointerEvent(t,{clientX:x,clientY:y,pointerId:1,isPrimary:true,bubbles:true,cancelable:true}));}
  pe('pointerdown',300,c);pe('pointerup',120,c);await w(300);out.push('month: finger left -> '+(_moMonth.getMonth()+1));
  c=document.querySelector('.mo-cell');y=c.getBoundingClientRect().top+30;pe('pointerdown',120,c);pe('pointerup',300,c);await w(300);out.push('finger right -> '+(_moMonth.getMonth()+1));
  planViewSet('day');await w(800);_dpDate=todayStr();renderPlanning();await w(300);
  var st=document.getElementById('plws');st.dispatchEvent(new Event('pointerdown'));
  /* the finger moving left drags the content left: the strip scrolls toward its right-hand child */
  var right=[].reduce.call(st.children,function(a,b){return b.getBoundingClientRect().left>a.getBoundingClientRect().left?b:a;});
  st.scrollLeft+=right.getBoundingClientRect().left-st.getBoundingClientRect().left;st.dispatchEvent(new Event('scroll'));await w(500);
  out.push('strip: finger left -> '+_dpDate);
  return out.join(' | ');
}catch(e){return 'ERR '+e.message;}})()
