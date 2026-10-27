// A task written on the DAY board, at 16:00 with a 15-minute reminder: pull
// its bead on the month, then on the week; it must run three days and keep
// its hour and its reminder on its first day.
(async function(){
  var w=function(ms){return new Promise(function(r){setTimeout(r,ms);});},out=[];
  document.querySelectorAll('.bms').forEach(function(e){e.remove()});
  localStorage.setItem(AREA_TOUR_KEY,JSON.stringify({planning:1}));
  var d=todayStr(),dp=loadDPlan(d);dp.items.push({id:'dw1',w:'ללמוד',c:'lav',h:16});dp.rem=dp.rem||{};dp.rem.dw1=15;saveDPlan(d,dp);
  var d2=dayShift(1),dp2=loadDPlan(d2);dp2.items.push({id:'dw2',w:'ריצה',c:'green',h:7});saveDPlan(d2,dp2);
  enterModule('planning');await w(1000);
  var s=planSecsGet();s.month=true;s.week=true;localStorage.setItem(PLAN_SECS_KEY,JSON.stringify(s));_planSecs=null;renderPlanning();await w(900);
  async function pull(sel,cellSel){
    var g=document.querySelector(sel);if(!g)return 'NO GRIP '+sel;
    g.scrollIntoView({block:'center'});await w(300);
    var r=g.getBoundingClientRect(),cw=document.querySelector(cellSel).getBoundingClientRect().width,dir=document.dir==='rtl'?-1:1,x=r.left+r.width/2,y=r.top+r.height/2;
    function ev(t,xx){return new PointerEvent(t,{bubbles:true,clientX:xx,clientY:y,pointerId:1,isPrimary:true});}
    g.dispatchEvent(ev('pointerdown',x));
    for(var k=1;k<=10;k++){window.dispatchEvent(ev('pointermove',x+dir*cw*2.1*k/10));await w(30);}
    window.dispatchEvent(ev('pointerup',x+dir*cw*2.1));await w(600);return 'pulled';
  }
  out.push('month: '+await pull('[data-mostretch="dw1"]','.mo-cell'));
  var sun=weekSunday(new Date(d+'T12:00:00')),t=loadWeek(sun).tasks.filter(function(x){return x.id==='dw1';})[0],dpa=loadDPlan(d);
  out.push('dw1 len '+(t?wkLenOf(t):'not a week task')+', hour '+dpa.hours.dw1+', rem '+(dpa.rem&&dpa.rem.dw1)+', still a day item '+dpa.items.some(function(x){return x.id==='dw1';}));
  out.push('week: '+await pull('[data-stretch="dw2"]','.wk-col'));
  var t2=loadWeek(weekSunday(new Date(d2+'T12:00:00'))).tasks.filter(function(x){return x.id==='dw2';})[0];
  out.push('dw2 len '+(t2?wkLenOf(t2):'not a week task')+', hour '+loadDPlan(d2).hours.dw2);
  out.push('dpAll today has it once: '+dpAll(d).filter(function(x){return x.id==='dw1';}).length);
  return out.join(' | ');
})()
