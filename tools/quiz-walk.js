// Walks "built for you" as a questionnaire and the one "+ new" sheet, through
// the real buttons. Stage per call (shoot-page --then).
(async function(){
  var q=function(s){return document.querySelector(s);},wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var out=window.__qzOut=window.__qzOut||[],st=window.__qzSt=(window.__qzSt||0)+1;
  var btn=function(t){return [].slice.call(document.querySelectorAll('#content button')).filter(function(b){return b.textContent.trim()===t;})[0];};
  if(st===1){
    _gen=null;_fitView='build';renderFitness();await wait(300);
    out.push('step1: '+q('.gn-st').textContent+' / '+q('.gn-q').textContent+' / options '+document.querySelectorAll('.gn-e').length);
    btn('{n} דקות'.replace('{n}','20'))&&btn('20 דקות').click();await wait(200);
    out.push('min chosen '+_gen.min);
  } else if(st===2){
    btn('המשך').click();await wait(200);out.push('step2: '+q('.gn-q').textContent);
    btn('המשך').click();await wait(200);out.push('step3: '+q('.gn-q').textContent+' chosen '+Object.keys(_gen.on).length);
  } else if(st===3){
    var nx=btn('המשך');if(nx){nx.click();await wait(200);out.push('step4: '+q('.gn-q').textContent);}
    btn('בנה לי אימון').click();await wait(600);
    var sets=0;(_fitWorkout&&_fitWorkout.exercises||[]).forEach(function(e){sets+=+e.targetSets||0;});
    out.push('built: view '+_fitView+' exercises '+(_fitWorkout?_fitWorkout.exercises.length:0)+' sets '+sets+' (cap for 20 min = 6)');
    _fitWorkout=null;_fitView='start';renderFitness();await wait(300);
    out.push('programs back pill: '+!!q('#content .fit-back')+' rows '+document.querySelectorAll('.fs-row').length+' pills '+document.querySelectorAll('.fs-pill').length);
    btn('+ תוכנית חדשה').click();await wait(300);
    out.push('new sheet: '+[].map.call(document.querySelectorAll('#fss-ov .fss-l b'),function(b){return b.textContent;}).join(' / '));
    var d=document.createElement('pre');d.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;font-size:12px;white-space:pre-wrap;margin:0;padding:8px';
    d.textContent=out.join('\n');document.body.appendChild(d);
  }
})();
