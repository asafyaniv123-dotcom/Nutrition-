// Walks אימון בקליק and starting a multi-day program, through real buttons.
(async function(){
  var q=function(s){return document.querySelector(s);},wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var out=window.__qkOut=window.__qkOut||[],st=window.__qkSt=(window.__qkSt||0)+1;
  var btn=function(t,sc){return [].slice.call(document.querySelectorAll((sc||'#content')+' button')).filter(function(b){return b.textContent.trim()===t;})[0];};
  if(st===1){
    _gen=null;_fitView='build';renderFitness();await wait(300);
    btn('30 דקות').click();await wait(150);btn('המשך').click();await wait(200);
    out.push('q2: '+q('.gn-q').textContent+' preselected '+Object.keys(_gen.on).length+' counts shown '+document.querySelectorAll('.gn-n').length);
    btn('המשך').click();await wait(200);out.push('empty continue stays on step '+(_gen.step+1));
    btn('פלג גוף תחתון').click();await wait(200);
    out.push('lower picks: '+Object.keys(_gen.on).join(','));
  } else if(st===2){
    btn('המשך').click();await wait(200);out.push('q3: '+q('.gn-q').textContent);
    btn('בנה לי אימון').click();await wait(600);
    out.push('built: '+_fitView+' "'+(_fitWorkout&&_fitWorkout.name)+'" '+(_fitWorkout?_fitWorkout.exercises.map(function(e){return e.name;}).join(','):''));
    _fitWorkout=null;
    savePrograms([{id:1,name:'תוכנית מסה',exercises:[{name:'סקוואט',sets:4,targetReps:9,day:'A - רגליים'},{name:'לחיצת חזה במוט',sets:4,targetReps:9,day:'B - חזה'}]}]);
    _fitView='start';renderFitness();await wait(300);
    [].filter.call(document.querySelectorAll('.fs-go'),function(b){return /מסה/.test(b.textContent);})[0].click();await wait(300);
    out.push('day sheet: '+[].map.call(document.querySelectorAll('#fss-ov .fss-l b'),function(b){return b.textContent;}).join(' / '));
    document.querySelectorAll('#fss-ov .fss-l button')[1].click();await wait(500);
    out.push('started: '+_fitView+' "'+(_fitWorkout&&_fitWorkout.name)+'" '+(_fitWorkout?_fitWorkout.exercises.map(function(e){return e.name+' '+e.targetSets+'x'+e.targetReps;}).join(','):''));
    var d=document.createElement('pre');d.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;font-size:12px;white-space:pre-wrap;margin:0;padding:8px';
    d.textContent=out.join('\n');document.body.appendChild(d);
  }
})();
