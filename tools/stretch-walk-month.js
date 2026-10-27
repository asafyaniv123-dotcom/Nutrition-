// The month board: a week task on today, its grip pulled two cells along.
(async function(){
  var w=function(ms){return new Promise(function(r){setTimeout(r,ms);});},out=[];
  document.querySelectorAll('.bms').forEach(function(e){e.remove()});
  localStorage.setItem(AREA_TOUR_KEY,JSON.stringify({planning:1}));
  enterModule('planning');await w(1200);
  var d=todayStr(),sun=weekSunday(new Date(d+'T12:00:00')),wk=loadWeek(sun);
  wk.tasks.push({id:'tstm1',w:'ללמוד',d:d,s:'m',c:'lav'});saveWeek(sun,wk);
  var s=planSecsGet();s.month=true;try{planSecsSet(s);}catch(e){}
  renderPlanning();await w(800);
  var g=document.querySelector('[data-mostretch="tstm1"]');out.push('grip '+(g?'found':'MISSING'));
  if(g){g.scrollIntoView({block:'center'});await w(300);
    var r=g.getBoundingClientRect(),dot=g.firstChild.getBoundingClientRect();out.push('hit '+Math.round(r.width)+'px, dot '+Math.round(dot.width)+'px');
    var cell=g.closest('.mo-cell').getBoundingClientRect(),dir=document.dir==='rtl'?-1:1,x=r.left+r.width/2,y=r.top+r.height/2;
    function ev(t,xx){return new PointerEvent(t,{bubbles:true,clientX:xx,clientY:y,pointerId:1,isPrimary:true});}
    g.dispatchEvent(ev('pointerdown',x));
    for(var k=1;k<=10;k++){window.dispatchEvent(ev('pointermove',x+dir*cell.width*2.1*k/10));await w(30);}
    window.dispatchEvent(ev('pointerup',x+dir*cell.width*2.1));await w(500);
    var t=loadWeek(sun).tasks.filter(function(t){return t.id==='tstm1';})[0];out.push('len '+wkLenOf(t));}
  return out.join(' | ');
})()
