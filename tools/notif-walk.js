// The notifications of 26 Oct, walked with a fake Capacitor LocalNotifications:
// what the phone is asked to ring, which buttons it is given, and what each
// button does. Run inside dev/?demo=progress (a throwaway sandbox).
(async function(){
  var w=function(ms){return new Promise(function(r){setTimeout(r,ms);});},sched=[],types=null,out=[];
  window.Capacitor={isNativePlatform:function(){return true;},Plugins:{LocalNotifications:{
    getPending:function(){return Promise.resolve({notifications:[]});},
    cancel:function(){return Promise.resolve();},
    schedule:function(o){sched=o.notifications;return Promise.resolve();},
    registerActionTypes:function(o){types=o.types;return Promise.resolve();},
    requestPermissions:function(){return Promise.resolve({display:'granted'});}}}};
  // fixtures in the writers' own shapes
  saveSumRem({on:true,time:'21:00',last:''});
  weighSave({on:true,freq:'daily'});
  var P=loadPeople();
  P.push({name:'נועה',relationship:'',whatTheyMean:'',whatILove:'',currentUpdate:'',toAsk:'',contactFreq:'monthly',
    lastContact:Date.now()-40*86400000,avatar:'',memories:[],importantDates:[{type:'birthday',date:'1990-'+dayShift(1).slice(5)}]});
  savePeople(P);
  try{localStorage.removeItem(PPL_NUDGE_KEY);localStorage.removeItem(REM_SNOOZE_KEY);}catch(e){}
  var d1=dayShift(1),dp=loadDPlan(d1);
  dp.items.push({id:'nw1',w:'רופא שיניים',c:'lav',h:10});dp.rem=dp.rem||{};dp.rem.nw1=15;saveDPlan(d1,dp);
  remNativeTypes();remNativeSync();await w(1500);
  var by={};sched.forEach(function(n){var k=(n.extra&&n.extra.k)||'?';(by[k]=by[k]||[]).push(n);});
  for(var k in by){var n=by[k][0];out.push(k+' x'+by[k].length+': '+n.title+' | '+n.body+' | '+n.schedule.at.toString().slice(0,21)+(n.actionTypeId?' ['+n.actionTypeId+']':''));}
  out.push('types: '+(types||[]).map(function(t){return t.id+'('+t.actions.map(function(a){return a.title+(a.foreground?'':'!bg');}).join('/')+')';}).join(' '));
  // the buttons
  var eve=by.eve&&by.eve[0];
  remNativeAct('later',eve);await w(1200);
  var sn=sched.filter(function(n){return n.id>=900&&n.id<1000;});
  out.push('later -> snoozed: '+sn.length+' at +'+(sn[0]?Math.round((sn[0].schedule.at-Date.now())/60000):'?')+'min '+(sn[0]&&sn[0].actionTypeId));
  var pp=by.ppl&&by.ppl[0];
  remNativeAct('talked',pp);await w(1200);
  var me=loadPeople().filter(function(p){return p.name==='נועה';})[0];
  out.push('talked -> lastContact '+Math.round((Date.now()-me.lastContact)/1000)+'s ago, memories '+me.memories.length+', ppl still scheduled: '+sched.filter(function(n){return n.id===200;}).length);
  window.__nw=out.join('\n');
  return window.__nw;
})()
