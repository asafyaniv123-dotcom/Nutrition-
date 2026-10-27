// A one-day week task, with and without an hour, as the month and the week draw it.
(async function(){
  var w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  document.querySelectorAll('.bms').forEach(function(e){e.remove()});
  localStorage.setItem(AREA_TOUR_KEY,JSON.stringify({planning:1}));
  var d=todayStr(),sun=weekSunday(new Date(d+'T12:00:00')),wk=loadWeek(sun);
  wk.tasks.push({id:'g1',w:'ללמוד',d:d,s:'e',c:'lav'});wk.tasks.push({id:'g2',w:'ריצה',d:dayShift(1),s:'m',c:'green'});saveWeek(sun,wk);
  var dp=loadDPlan(d);dp.hours=dp.hours||{};dp.hours.g1=16;saveDPlan(d,dp);
  enterModule('planning');await w(1000);
  var s=planSecsGet();s.month=true;s.week=true;localStorage.setItem('plan_secs',JSON.stringify(s));renderPlanning();await w(900);
  var o=[];['g1','g2'].forEach(function(id){o.push(id+' month grip:'+!!document.querySelector('[data-mostretch="'+id+'"]')+' week grip:'+!!document.querySelector('[data-stretch="'+id+'"]'));});
  var m=document.querySelector('.mo-cell.today');if(m)m.scrollIntoView({block:'center'});
  return o.join(' | ');
})()
