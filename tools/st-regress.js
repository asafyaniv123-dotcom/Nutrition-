// What the stretch feature (13 Nov) must not have changed: picking an exercise into
// a workout still offers "choose" and "your own", and the timer still keeps its plan.
//   node tools/shoot-page.mjs out.png dev/ 9000 --eval "fetch('/tools/st-regress.js').then(r=>r.text()).then(t=>(0,eval)(t))"
(async function(){
  var q=function(s){return document.querySelector(s);},qa=function(s){return [].slice.call(document.querySelectorAll(s));};
  var wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});},out=[];
  if(typeof doorFinish==='function')doorFinish();
  enterModule('fitness');await wait(600);
  var picked=null;
  exPickInto(function(n){picked=n;});await wait(2500);
  out.push('chips '+qa('.ex-chip').length+' on:'+(q('.ex-chip.on')||{}).textContent);
  exShowResults();await wait(800);
  out.push('own box '+!!q('#ex-own')+' tiles '+qa('.ex-tile').length);
  qa('.ex-tile')[0].click();await wait(800);
  out.push('pick btn '+!!q('.xd-pick')+' history/none '+!!q('.xd-none,.xd-now')+' hold advice '+!!q('.xd-say.st'));
  q('.xd-pick').click();await wait(300);
  out.push('picked '+picked);
  wtPlanStart('tabata',20,10,8,10,[]);await wait(300);
  out.push('tabata saved '+JSON.stringify(wtPlanLoad()));
  wtDone();
  return out.join(' | ');
})();
