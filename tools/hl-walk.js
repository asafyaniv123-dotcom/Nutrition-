// Walks Your health: nothing chosen before the acknowledgement; tick it, pick
// three; build a one-tap workout and read what was adjusted; the rest floor;
// what the coach is sent; and that the backup leaves it out.
(async function(){
  var q=function(s){return document.querySelector(s);},wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var out=window.__hlOut=window.__hlOut||[],st=window.__hlSt=(window.__hlSt||0)+1;
  if(st===1){
    hlOpen();await wait(200);
    hlPick('mg');out.push('pick before ack: '+hlLoad().on.length);
    var cb=q('.hl-ack input');cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}));await wait(150);
    ['mg','dm','op'].forEach(function(id){var b=[].filter.call(document.querySelectorAll('.hl-chips button'),function(x){return x.textContent===hlName(id);})[0];b.click();});
    await wait(200);
    out.push('ack '+hlLoad().ack+' on '+hlOn().join(',')+' cards '+document.querySelectorAll('.hl-card').length);
  } else {
    hlClose();
    var exs=[{name:'סקוואט',targetSets:3,targetReps:10},{name:'כפיפות בטן',targetSets:3,targetReps:15},{name:'חתירה בכבל',targetSets:3,targetReps:10}];
    var a=hlAdjust(exs.map(function(e){return Object.assign({},e);}));
    out.push('adjusted: '+a.exs.map(function(e){return e.name+' '+e.targetSets;}).join(' | ')+' notes '+a.notes.length);
    localStorage.setItem('fit_rest','60');out.push('rest stored 60 -> restLen '+restLen());
    out.push('coach gets (consent off): '+JSON.stringify(hlForCoach()));
    hlCoach();out.push('coach gets (consent on): '+JSON.stringify(hlForCoach()));
    out.push('in backup: '+(JSON.stringify(collectAppData()).indexOf('health_v1')>=0));
    enterModule('fitness');await wait(400);
    _fitWorkout={templateIdx:-1,name:'x',startTime:Date.now(),exercises:a.exs.map(function(e){return {name:e.name,targetSets:e.targetSets,targetReps:10,plan:[],sets:[],warm:[],ss:null};}),currentEx:0,hlNotes:a.notes};
    _fitView='workout';renderFitness();await wait(300);
    out.push('workout card: '+!!q('.hl-wn'));
    var d=document.createElement('pre');d.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;font-size:12px;white-space:pre-wrap;margin:0;padding:8px';
    d.textContent=out.join('\n');document.body.appendChild(d);
  }
})();
