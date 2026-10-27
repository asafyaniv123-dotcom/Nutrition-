(async function(){try{
  var w=function(ms){return new Promise(function(r){setTimeout(r,ms);});},out=[];
  document.querySelectorAll('.bms').forEach(function(e){e.remove()});
  localStorage.setItem(AREA_TOUR_KEY,JSON.stringify({planning:1}));localStorage.setItem(PLAN_VIEW_KEY,'month');
  var sun=weekSunday(new Date('2026-10-29T12:00:00')),wk=loadWeek(sun);wk.tasks.push({id:'N1',w:'משחק',d:'2026-10-29',s:'m',c:'blu'});saveWeek(sun,wk);
  enterModule('planning');await w(1200);
  out.push('next cells '+document.querySelectorAll('.mo-cell.mo-next').length);
  var g=document.querySelector('[data-mostretch="N1"]'),cell=document.querySelector('.mo-cell[data-date="2026-11-02"]');
  g.scrollIntoView({block:'center'});await w(200);
  var a=g.getBoundingClientRect(),b=cell.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2,bx=b.left+b.width/2,by=b.top+b.height/2;
  function pe(t,x,y,el){(el||window).dispatchEvent(new PointerEvent(t,{clientX:x,clientY:y,pointerId:1,isPrimary:true,bubbles:true,cancelable:true}));}
  pe('pointerdown',ax,ay,g);for(var k=1;k<=14;k++){pe('pointermove',ax+(bx-ax)*k/14,ay+(by-ay)*k/14);await w(30);}pe('pointerup',bx,by);await w(500);
  var t=loadWeek(sun).tasks.filter(function(x){return x.id==='N1';})[0];out.push('len '+wkLenOf(t));
  document.querySelector('.dpk-col').click();await w(200);out.push('swatches '+document.querySelectorAll('.dpk-cols .wk-swatch').length);
  document.querySelectorAll('.dpk-cols .wk-swatch')[3].click();await w(200);
  var i=document.getElementById('dp-rail-in');i.value='טסט';i.dispatchEvent(new Event('input'));document.querySelector('.dpk-add').click();await w(300);
  var p=loadPool().tasks.filter(function(x){return x.w==='טסט';})[0];out.push('new colour '+(p&&p.c));
  return out.join(' | ');
}catch(e){return 'ERR '+e.message;}})()
