// Walks the stretch feature (13 Nov) through its real buttons, one stage per call:
//   W="fetch('/tools/st-walk.js?'+Math.random()).then(r=>r.text()).then(t=>(0,eval)(t))"
//   node tools/shoot-page.mjs s0.png dev/ 9000 --eval "$W" --then "$W" s1.png 1500 ... \
//        --print "sessionStorage.getItem('__stOut')"
// Stage 0 closes the first-run door a fresh profile opens on. The counter and the
// log live in sessionStorage, so the stages do not depend on window state.
(async function(){
  var q=function(s){return document.querySelector(s);},qa=function(s){return [].slice.call(document.querySelectorAll(s));};
  var wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var out=JSON.parse(sessionStorage.getItem('__stOut')||'[]'),st=+(sessionStorage.getItem('__stSt')||0);
  sessionStorage.setItem('__stSt',st+1);
  function btn(txt){return qa('button').filter(function(b){return b.textContent.trim()===txt;})[0];}
  function show(){sessionStorage.setItem('__stOut',JSON.stringify(out));}
  if(st===0){
    /* the door's own way out - a reload would kill the call the driver waits on */
    localStorage.setItem('greet_name','אסף');
    localStorage.setItem('home_tour_done','1');localStorage.setItem('area_tour_done',JSON.stringify({fitness:1}));
    if(typeof doorFinish==='function')doorFinish();
    return;
  } else if(st===1){
    enterModule('fitness');await wait(500);
    var later=btn('אחר כך');if(later)later.click();
    _fitView='home';renderFitness();await wait(400);
    out.push('1 doors: '+qa('.fr-t').map(function(e){return e.textContent;}).join(', '));
    var door=qa('.fr').filter(function(b){return b.textContent.indexOf('מתיחות וגמישות')>=0;})[0];
    if(door)door.scrollIntoView({block:'center'});
  } else if(st===2){
    qa('.fr').filter(function(b){return b.textContent.indexOf('מתיחות וגמישות')>=0;})[0].click();await wait(1500);
    out.push('2 view '+_fitView+' title '+q('#hdr-title').textContent+' | rows: '+qa('.tm-sv-l').map(function(b){return b.textContent;}).join(' / '));
  } else if(st===3){
    q('.tm-sv-l').click();await wait(1200);
    out.push('3 open list rows '+qa('.st-li').length+': '+qa('.st-x b').map(function(b){return b.textContent;}).join(', '));
  } else if(st===4){
    q('.tm-sv-go').click();await wait(7500);
    var v=q('#wt-vid');
    out.push('4 player class '+q('#wt').className+' | phase "'+(q('#wt-ph')||{}).textContent+'" | ttl '+(q('.wtr-ttl')||{}).textContent+' | vid '+(v&&v.getAttribute('data-s')||'').split('/').pop()+' rs '+(v&&v.readyState)+' | list '+qa('.wtr-li').length);
  } else if(st===5){
    /* into the gap after the first side of the third stretch (x281, one-sided) */
    _wtFrom=Date.now()-(5+2*40+30+2)*1000;wtTick();await wait(1200);
    var v2=q('#wt-vid');
    out.push('5 gap phase "'+q('#wt-ph').textContent+'" vid '+(v2.getAttribute('data-s')||'').split('/').pop()+' now: '+(q('.wtr-li.now span')||{}).textContent);
  } else if(st===6){
    _wtFrom=Date.now()-(5+3*40+3)*1000;wtTick();await wait(1200);
    out.push('6 side 2 name "'+q('#wt-ph').textContent+'" | after it, gap: '+(function(){_wtFrom=Date.now()-(5+3*40+33)*1000;wtTick();return q('#wt-ph').textContent;})());
    _wtFrom=Date.now()-(5+3*40+3)*1000;wtTick();
  } else if(st===7){
    btn('סיים').click();await wait(300);
    out.push('7 timer closed: '+!q('#wt')+' | saved plan untouched: '+JSON.stringify(wtPlanLoad()));
    qa('.tm-go').filter(function(b){return b.textContent.indexOf('לכל המתיחות')>=0;})[0].click();await wait(2500);
    out.push('7 library tiles '+qa('.ex-tile').length+' chips: '+qa('.ex-chip').map(function(b){return b.textContent+(b.classList.contains('on')?'*':'');}).join(' | ')+' own box '+!!q('#ex-own'));
  } else if(st===8){
    q('.ex-back').click();await wait(1200);
    out.push('8 filter step cards '+qa('.gp').length+' foot: '+q('.ex-go').textContent);
  } else if(st===9){
    qa('.ex-chip')[1].click();await wait(600);
    var s1=q('.ex-go').textContent;
    qa('.ex-chip')[0].click();await wait(600);
    var s2=q('.ex-go').textContent;
    qa('.ex-chip')[2].click();await wait(300);
    exShowResults();await wait(1500);
    out.push('9 strength foot '+s1+' | all foot '+s2+' | stretch tiles '+qa('.ex-tile').length);
    qa('.ex-tile')[3].click();await wait(2000);
    out.push('9 detail '+q('.xd-name').textContent+' | advice '+!!q('.xd-say.st')+' | pick btn '+!!q('.xd-pick')+' | history box '+!!q('.xd-none:not(.small)'));
  } else if(st===10){
    var a=q('.ex-sheet');if(a)a.scrollTop=420;await wait(800);
  } else if(st===11){
    exClose();
    var all=exAll(),pick=function(m){return all.filter(function(e){return !e.st&&e.m[0]===m&&EX_DEMO[e.id];})[0];};
    var ex=[pick('חזה'),pick('ארבע ראשי'),pick('רחב גבי'),pick('כתפיים')];
    _fitWorkout={templateIdx:-1,name:'אימון בדיקה',startTime:Date.now()-50*60000,currentEx:0,
      exercises:ex.map(function(e,i){return {name:e.n,targetSets:3,targetReps:10,plan:[],warm:[],
        sets:[{weight:40,reps:10},{weight:40,reps:9},{weight:40,reps:8}].slice(0,i===0?3:2)};})};
    _fitView='workout';renderFitness();await wait(500);
    finishWorkout();await wait(2500);
    var c=qa('.tm-card').filter(function(x){return x.textContent.indexOf('שחרור ומתיחות')>=0;})[0];
    out.push('11 worked: '+ex.map(function(e){return e.n+'('+e.m[0]+')';}).join(', '));
    out.push('11 cooldown: '+(c?qa('.tm-card .st-x b').map(function(b){return b.textContent;}).join(', ')+' | '+c.querySelector('.tm-sub').textContent:'MISSING'));
    if(c)c.scrollIntoView({block:'center'});
  } else if(st===12){
    langSet('en');await wait(2500);
    _fitView='stretch';_stOpen='lower';renderFitness();await wait(1500);
    out.push('12 en rows: '+qa('.tm-sv-l').map(function(b){return b.textContent;}).join(' / '));
  } else if(st===13){
    langSet('de');await wait(2500);
    stStart('x281,x297');await wait(7000);
    out.push('13 de player: "'+q('#wt-ph').textContent+'" ttl '+q('.wtr-ttl').textContent);
  } else if(st===14){
    wtDone();langSet('ar');await wait(2500);
    _fitView='summary';renderFitness();await wait(1500);
    var c2=qa('.tm-card').filter(function(x){return !!x.querySelector('.st-list');})[0];
    out.push('14 ar cooldown: '+(c2?c2.querySelector('.tm-h').textContent+' | '+c2.querySelector('.tm-sub').textContent:'MISSING'));
    if(c2)c2.scrollIntoView({block:'center'});
    langSet('he');
  }
  show();
})();
