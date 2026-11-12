// The library's equipment tab, through its real buttons: stage 1 opens it, stage 2 picks two.
//   W="fetch('/tools/eq-walk.js?'+Math.random()).then(r=>r.text()).then(t=>(0,eval)(t))"
//   node tools/shoot-page.mjs a.png dev/ 9000 --eval "$W" --then "$W" b.png 1200      (or '' for the stable app)
(async function(){
  var q=function(s){return document.querySelector(s);},qa=function(s){return [].slice.call(document.querySelectorAll(s));};
  var wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var st=+(sessionStorage.getItem('__eqSt')||0);sessionStorage.setItem('__eqSt',st+1);
  if(st===0){
    localStorage.setItem('home_tour_done','1');localStorage.setItem('area_tour_done',JSON.stringify({fitness:1}));
    if(typeof doorFinish==='function')doorFinish();
    enterModule('fitness');await wait(600);
    var later=qa('button').filter(function(b){return b.textContent.trim()==='אחר כך';})[0];if(later){later.click();await wait(400);}
    exPickInto(function(){});await wait(2500);
    qa('.ex-tab')[1].click();await wait(1500);
    return 'cards '+qa('.gp .eq-art').length+' svg '+qa('.gp .eq-art svg').length;
  }
  qa('.gp')[0].click();await wait(200);qa('.gp')[1].click();await wait(900);
  return 'on '+qa('.gp.on').length;
})();
