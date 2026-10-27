(async function(){
  var w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  document.querySelectorAll('.bms').forEach(function(e){e.remove()});
  localStorage.setItem(AREA_TOUR_KEY,JSON.stringify({planning:1}));
  var d=todayStr(),dp=loadDPlan(d);dp.items.push({id:'od1',w:'ללמוד',c:'lav',h:16});saveDPlan(d,dp);
  enterModule('planning');await w(1000);
  var s=planSecsGet();s.month=true;s.week=true;localStorage.setItem(PLAN_SECS_KEY,JSON.stringify(s));_planSecs=null;renderPlanning();await w(700);
  moCellTap(d);await w(700);var p=document.querySelector('.pod');if(p)p.scrollIntoView({block:'center'});return 'ok';
})()
