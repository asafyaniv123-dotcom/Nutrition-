// Put a task on today's column of the week board and pull its grip two
// columns along with real pointer events; report the stored length and what
// the month draws for it.
(async function(){
  var w=function(ms){return new Promise(function(r){setTimeout(r,ms);});},out=[];
  document.querySelectorAll('.bms').forEach(function(e){e.remove()});
  localStorage.setItem(AREA_TOUR_KEY,JSON.stringify({planning:1}));
  enterModule('planning');await w(1500);
  var sun=_wkSun,wk=loadWeek(sun),d=todayStr();
  wk.tasks.push({id:'tstr1',w:'ללמוד',d:d,s:'m',c:'lav'});saveWeek(sun,wk);renderPlanWeek();await w(600);
  var g=document.querySelector('[data-stretch="tstr1"]');out.push('grip '+(g?'found':'MISSING'));
  if(g){var r=g.getBoundingClientRect();out.push('grip box '+Math.round(r.width)+'x'+Math.round(r.height)+' visible:'+(r.width>0));
    g.scrollIntoView({block:'center'});await w(300);r=g.getBoundingClientRect();
    var cols=document.querySelectorAll('.wk-col'),c0=wkColIndex(d),dir=document.dir==='rtl'?-1:1;
    var cw=cols[0].getBoundingClientRect().width,x=r.left+r.width/2,y=r.top+r.height/2;
    function ev(t,xx){var e=new PointerEvent(t,{bubbles:true,clientX:xx,clientY:y,pointerId:1,isPrimary:true});return e;}
    g.dispatchEvent(ev('pointerdown',x));
    for(var k=1;k<=10;k++){window.dispatchEvent(ev('pointermove',x+dir*cw*2.2*k/10));await w(30);}
    window.dispatchEvent(ev('pointerup',x+dir*cw*2.2));await w(400);
    var t=loadWeek(sun).tasks.filter(function(t){return t.id==='tstr1';})[0];out.push('len after pull '+wkLenOf(t)+' (col '+c0+')');}
  window.__sw=out.join(' | ');return window.__sw;
})()
