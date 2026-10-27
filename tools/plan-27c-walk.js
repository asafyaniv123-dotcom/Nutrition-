(async function(){try{
  var w=function(ms){return new Promise(function(r){setTimeout(r,ms);});},out=[];
  document.querySelectorAll('.bms').forEach(function(e){e.remove()});
  localStorage.setItem(AREA_TOUR_KEY,JSON.stringify({planning:1}));localStorage.setItem(PLAN_VIEW_KEY,'day');
  var d=todayStr(),dp=loadDPlan(d);dp.items.push({id:'Z1',w:'משתדל',c:'lav',h:14});saveDPlan(d,dp);
  enterModule('planning');await w(1200);
  _dpDate=d;dpOpenDetail('Z1');await w(300);
  out.push('times '+[].map.call(document.querySelectorAll('.dps-step b'),function(b){return b.textContent;}).join('–'));
  document.querySelectorAll('.dps-step button')[3].click();await w(200);
  var it=loadDPlan(d).items.filter(function(x){return x.id==='Z1';})[0];out.push('end after + '+it.e);
  document.querySelector('.dps-lib').click();await w(200);
  out.push('lib '+loadTaskLib().some(function(x){return x.w==='משתדל';})+' btn '+document.querySelector('.dps-lib').textContent);
  dpCloseDetail(true);await w(200);
  planViewSet('month');await w(600);out.push('view '+planView()+' slide '+!!document.querySelector('.plv-in'));
  return out.join(' | ');
}catch(e){return 'ERR '+e.message;}})()
