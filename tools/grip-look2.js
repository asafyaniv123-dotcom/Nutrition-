// A task written on the day board (a day item), as the month and the week draw it.
(async function(){
  var w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  document.querySelectorAll('.bms').forEach(function(e){e.remove()});
  localStorage.setItem(AREA_TOUR_KEY,JSON.stringify({planning:1}));
  var d=todayStr(),dp=loadDPlan(d);dp.items.push({id:'dg1',w:'ללמוד',c:'lav',h:16});saveDPlan(d,dp);
  enterModule('planning');await w(1000);
  var s=planSecsGet();s.month=true;s.week=true;localStorage.setItem(PLAN_SECS_KEY,JSON.stringify(s));_planSecs=null;renderPlanning();await w(900);
  var txt=[].map.call(document.querySelectorAll('.mo-cell.today .mo-chip'),function(c){return c.textContent+(c.querySelector('[data-mostretch]')?'[grip]':'');}).join(',');
  var wkTxt=document.querySelector('#plan-sec-week')?document.querySelector('#plan-sec-week').textContent.indexOf('ללמוד')>=0:false;
  return 'month today: '+txt+' | in week board: '+wkTxt+' | week grip:'+!!document.querySelector('[data-stretch="dg1"]');
})()
