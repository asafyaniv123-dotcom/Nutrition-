// Walks the saved-timers path on the real timer screen, for shoot-page --then.
// Stage is chosen by window.__tmStage so one file can be called three times.
(async function(){
  var q=function(s){return document.querySelector(s);},wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var out=window.__tmOut=window.__tmOut||[];
  var st=window.__tmStage=(window.__tmStage||0)+1;
  if(st===1){
    enterModule('fitness');await wait(500);
    _fitView='timer';renderFitness();await wait(300);
    out.push('empty card: '+!!q('.tm-card .tm-sub'));
    wtKindPick('tabata');await wait(200);
    var ins=document.querySelectorAll('.tm-row input');
    ins[0].value='כפיפות בטן';ins[0].dispatchEvent(new Event('input',{bubbles:true}));
    ins[1].value='פלאנק';ins[1].dispatchEvent(new Event('input',{bubbles:true}));
    var r=q('#tm-n-rounds');r.value='8';r.dispatchEvent(new Event('input',{bubbles:true}));
    q('.tm-save').click();await wait(300);
    out.push('sheet name: '+q('#wt-sv-n').value);
  } else if(st===2){
    q('#wt-sv-n').value='Tabata בטן';
    q('#wt-sv-new').click();await wait(400);
    out.push('saved: '+JSON.stringify(wtSavedAll().map(function(p){return [p.name,p.kind,p.rounds,p.names];})));
    out.push('rows: '+document.querySelectorAll('.tm-sv').length+' on: '+!!q('.tm-sv.on'));
    // change something and save again: should offer update
    wtKindPick('interval');await wait(200);
    wtSavedUse(wtSavedAll()[0].id);await wait(200);
    out.push('loaded kind '+_wtKind+' rounds '+q('#tm-n-rounds').value+' name1 '+document.querySelectorAll('.tm-row input')[0].value);
    var p=q('#tm-n-prep');p.value='5';p.dispatchEvent(new Event('input',{bubbles:true}));
    q('.tm-save').click();await wait(300);
    out.push('update offered: '+!!q('#wt-sv-up')+' '+(q('#wt-sv-up')||{}).textContent);
  } else if(st===3){
    q('#wt-sv-up').click();await wait(300);
    out.push('after update count '+wtSavedAll().length+' prep '+wtSavedAll()[0].prep);
    // an unsaved run, made to end now
    wtKindPick('interval');await wait(100);
    wtPlanStart('interval',1,0,1,0,[]);_wtFrom=Date.now()-5000;await wait(1600);
    out.push('offer after run: '+!!q('#wt-sv-ov')+' '+((q('#wt-sv-ov .cf-q')||{}).textContent||''));
    var d=document.createElement('pre');d.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;font-size:12px;white-space:pre-wrap;margin:0;padding:8px';
    d.textContent=out.join('\n');document.body.appendChild(d);
  }
})();
