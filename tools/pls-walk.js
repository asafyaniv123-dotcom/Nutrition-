// The schedule as a picture (13 Nov), through the real button. Stage per call:
//   W="fetch('/tools/pls-walk.js?'+Math.random()).then(r=>r.text()).then(t=>(0,eval)(t))"
//   node tools/shoot-page.mjs a.png dev/ 9000 --eval "$W" --then "$W" sheet.png 3000 --then "$W" month.png 3000
// Stage 0 seeds this week through the planner's own writer (loadDPlan / saveDPlan), so the shape is the real one.
// After stages 1 and 2, window.__plsPic holds the picture as a data URL, for a driver to save.
(async function(){
  var q=function(s){return document.querySelector(s);};
  var wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var st=+(sessionStorage.getItem('__plsSt')||0);sessionStorage.setItem('__plsSt',st+1);
  function grab(){return fetch(_plShot.url).then(function(r){return r.blob();}).then(function(b){
    return new Promise(function(res){var fr=new FileReader();fr.onload=function(){window.__plsPic=fr.result;res();};fr.readAsDataURL(b);});});}
  if(st===0){
    localStorage.setItem('home_tour_done','1');localStorage.setItem('area_tour_done',JSON.stringify({planning:1}));
    if(typeof doorFinish==='function')doorFinish();
    var sun=weekSunday(appNow()),plan=[
      [0,[['ריצה בפארק','grn',7,0,480],['ישיבת צוות','blu',10,0,660],['קניות לשבוע','amb',null]]],
      [1,[['רופא שיניים','ros',9,30,600],['להתקשר לאמא','ter',18,0,0]]],
      [2,[['אימון כוח','grn',7,0,480],['עבודה על המצגת','ind',13,0,960],['ארוחת ערב עם דנה','plm',20,0,1320]]],
      [3,[]],
      [4,[['אימון כוח','grn',7,0,480],['פגישה עם הבנק','gry',11,0,690],['איסוף מהגן','tea',16,0,0],['ספר - פרק 4','lav',null]]],
      [5,[['שוק','olv',9,0,600],['ארוחת שישי','cly',19,30,0]]],
      [6,[['טיול בטבע','grn',8,0,780]]]];
    plan.forEach(function(p){
      var d=new Date(sun.getTime());d.setDate(sun.getDate()+p[0]);var key=dayStr(d),dp=loadDPlan(key);
      p[1].forEach(function(it,i){dp.items.push({id:'pw'+p[0]+'_'+i,w:it[0],c:it[1],h:it[2],mn:it[3]||0,e:it[4]||0,n:''});});
      saveDPlan(key,dp);
    });
    enterModule('planning');await wait(800);
    var later=[].slice.call(document.querySelectorAll('button')).filter(function(b){return b.textContent.trim()==='אחר כך';})[0];if(later){later.click();await wait(400);}
    planViewSet('day');await wait(600);
    return 'button '+!!q('.plv-shot');
  }
  if(st===1){q('.plv-shot').click();await wait(2500);await grab();return 'week ready '+!document.getElementById('pls-go').disabled;}
  if(st===2){document.querySelectorAll('.pls-seg button')[1].click();await wait(2500);await grab();return 'month ready '+!document.getElementById('pls-go').disabled;}
})();
