// long press on planning tasks: open the menu (contextmenu = the desktop long
// press), move a week task by drag, change dates via the wheels, delete a day item.
(async function(){try{
  var w=function(ms){return new Promise(function(r){setTimeout(r,ms);});},out=[];
  document.querySelectorAll('.bms').forEach(function(e){e.remove()});
  localStorage.setItem(AREA_TOUR_KEY,JSON.stringify({planning:1}));
  var d=todayStr(),sun=weekSunday(new Date(d+'T12:00:00')),wk=loadWeek(sun);
  wk.tasks.push({id:'L1',w:'ללמוד',d:d,s:'m',c:'lav'});saveWeek(sun,wk);
  var dp=loadDPlan(d);dp.items.push({id:'L2',w:'מכולת',c:'tea'});saveDPlan(d,dp);
  localStorage.setItem(PLAN_SECS_KEY,JSON.stringify({week:false,month:true,day:false}));_planSecs=null;
  enterModule('planning');await w(1200);
  function pe(t,x,y,el){(el||document.elementFromPoint(x,y)).dispatchEvent(new PointerEvent(t,{clientX:x,clientY:y,pointerId:1,isPrimary:true,bubbles:true,cancelable:true}));}
  function c(el){var r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};}
  var ch=document.querySelector('[data-ptk="L1"]');ch.scrollIntoView({block:'center'});await w(200);
  ch.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}));await w(300);
  out.push('menu: '+[].map.call(document.querySelectorAll('#lp-menu button span'),function(s){return s.textContent;}).join('/'));
  window.__shot1=1;
  // drag
  document.querySelector('#lp-menu button').click();await w(200);
  var t=dayShift(2),cell=document.querySelector('.mo-cell[data-date="'+t+'"]'),a=c(ch),b=c(cell);
  pe('pointerdown',a.x,a.y,document.body);for(var i=1;i<=10;i++){pe('pointermove',a.x+(b.x-a.x)*i/10,a.y+(b.y-a.y)*i/10,document.body);await w(30);}
  pe('pointerup',b.x,b.y,document.body);await w(400);
  var f=ptFind('L1',t,false);out.push('dragged to '+(f&&f.t.d)+' (want '+t+')');
  // dates: L1 from +2 to +5
  var ch2=document.querySelector('[data-ptk="L1"]');ch2.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}));await w(300);
  document.querySelectorAll('#lp-menu button')[1].click();await w(400);
  var eY=document.getElementById('pt-e-d');var e5=new Date(dayShift(5)+'T12:00:00');eY.scrollTop=(e5.getDate()-1)*60;document.getElementById('pt-e-m').scrollTop=e5.getMonth()*60;await w(300);
  document.getElementById('bw-ok').click();await w(400);
  f=ptFind('L1',t,false);out.push('dates: start '+f.t.d+' len '+wkLenOf(f.t));
  // delete the day item
  var ch3=document.querySelector('[data-ptk="L2"]');ch3.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}));await w(300);
  document.querySelector('#lp-menu .lp-del').click();await w(300);
  out.push('L2 gone: '+!loadDPlan(d).items.some(function(x){return x.id==='L2';}));
  return out.join(' | ');
}catch(e){return 'ERR '+e.message;}})()
