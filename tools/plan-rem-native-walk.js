// A fake Capacitor LocalNotifications in the page; set a task with a reminder
// through the plan's own functions and read what the phone was asked to ring.
(async function(){
  var w=function(ms){return new Promise(function(r){setTimeout(r,ms);});},sched=[];
  window.Capacitor={isNativePlatform:function(){return true;},Plugins:{LocalNotifications:{
    getPending:function(){return Promise.resolve({notifications:[]});},
    cancel:function(){return Promise.resolve();},
    schedule:function(o){sched=o.notifications;return Promise.resolve();},
    requestPermissions:function(){return Promise.resolve({display:'granted'});}}}};
  var d0=dayShift(0),d1=dayShift(1),dp=loadDPlan(d1);
  dp.items.push({id:'dtest1',w:'רופא שיניים',c:'lav',h:10});dp.rem=dp.rem||{};dp.rem.dtest1=15;
  dp.items.push({id:'dtest2',w:'שיחה עם נועה',c:'lav',h:1});dp.rem.dtest2=0;
  saveDPlan(d1,dp);
  await w(1500);
  var mine=sched.filter(function(n){return n.id>=1000;}).map(function(n){return n.title+' | '+n.body+' | '+n.schedule.at.toString().slice(0,21);});
  window.__pr='scheduled '+sched.length+' total; planning: '+mine.join(' ;; ');
})();
