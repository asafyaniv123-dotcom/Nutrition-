// Seeds a week plan and a log in the shapes their writers store, then walks
// the fitness hub through its real buttons. Stage per call (shoot-page --then).
(async function(){
  var q=function(s){return document.querySelector(s);},wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var out=window.__hbOut=window.__hbOut||[],st=window.__hbSt=(window.__hbSt||0)+1;
  if(st===1){
    var dow=appNow().getDay(),plan={};
    for(var i=0;i<7;i++)plan['w0d'+i]={type:i%2?'rest':'strength',label:i%2?'':['עליון','','תחתון','','עליון','','גוף מלא'][i],note:''};
    plan['w0d'+dow]={type:'strength',label:'גוף מלא',note:''};
    saveWeekPlan(plan);
    var two=new Date(appNow().getTime()-86400000*Math.min(dow,1)).getTime();
    saveWorkoutLog([
      {date:two-86400000*7,name:'A',exercises:[{name:'לחיצת חזה במוט',sets:[{weight:70,reps:8}]}]},
      {date:two,name:'A',exercises:[{name:'לחיצת חזה במוט',sets:[{weight:72.5,reps:8}]}]}]);
    enterModule('fitness');await wait(500);
    var later=[].slice.call(document.querySelectorAll('button')).filter(function(b){return b.textContent.trim()==='אחר כך';})[0];if(later)later.click();
    _fitView='home';renderFitness();await wait(300);
    out.push('strip labels: '+[].map.call(document.querySelectorAll('.fwk-t'),function(e){return e.textContent;}).join('|'));
    out.push('done days lit: '+document.querySelectorAll('.fwk-d.done').length);
    out.push('doors: '+[].map.call(document.querySelectorAll('.fr-t'),function(e){return e.textContent;}).join(', '));
    out.push('card: '+(q('.ftk')||{}).textContent);
    out.push('hero: '+(q('.fh-s')||{}).textContent);
  } else if(st===2){
    q('.fh').click();await wait(300);
    out.push('start sheet: '+[].map.call(document.querySelectorAll('.fss-l b'),function(e){return e.textContent;}).join(' / '));
  } else if(st===3){
    fitSheetClose();q('.fwk-tap').click();await wait(300);
    out.push('schedule rows: '+document.querySelectorAll('.fwp-r').length+' now: '+document.querySelectorAll('.fwp-r.now').length);
    document.querySelectorAll('.fwp-r')[1].click();await wait(300);
    out.push('day sheet chips: '+document.querySelectorAll('#fwp-c button').length+' title '+(q('#fss-ov .cf-q')||{}).textContent);
  } else if(st===4){
    [].filter.call(document.querySelectorAll('#fwp-c button'),function(b){return b.getAttribute('data-wt')==='cardio';})[0].click();
    q('#fwp-n').value='ריצה קלה';q('#fwp-ok').click();await wait(300);
    out.push('saved day 1: '+JSON.stringify(loadWeekPlan().w0d1)+' row: '+document.querySelectorAll('.fwp-r span')[1].textContent);
    _fitView='home';renderFitness();await wait(200);
    q('.ftk').click();await wait(300);
    out.push('tracking: view '+_fitView+' tabs '+[].map.call(document.querySelectorAll('.ftt button'),function(b){return b.textContent+(b.className?'*':'');}).join(','));
    document.querySelectorAll('.ftt button')[2].click();await wait(300);
    out.push('after tab 3: '+_fitView+' title '+document.getElementById('hdr-title').textContent);
    var d=document.createElement('pre');d.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;font-size:12px;white-space:pre-wrap;margin:0;padding:8px';
    d.textContent=out.join('\n');document.body.appendChild(d);
  }
})();
