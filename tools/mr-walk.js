// "Dinner like yesterday" through the real chat box and send button (13 Nov). Stage per call:
//   W="fetch('/tools/mr-walk.js?'+Math.random()).then(r=>r.text()).then(t=>(0,eval)(t))"
//   node tools/shoot-page.mjs a.png dev/ 9000 --eval "$W" --then "$W" b.png 1500 --then "$W" c.png 1500 --print "sessionStorage.getItem('__mrOut')"
// Yesterday is seeded in the shape coachApply writes; nothing reaches the server (the copy never calls it).
(async function(){
  var q=function(s){return document.querySelector(s);},qa=function(s){return [].slice.call(document.querySelectorAll(s));};
  var wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var out=JSON.parse(sessionStorage.getItem('__mrOut')||'[]'),st=+(sessionStorage.getItem('__mrSt')||0);
  sessionStorage.setItem('__mrSt',st+1);
  function keep(){sessionStorage.setItem('__mrOut',JSON.stringify(out));}
  function say(text){var el=q('#co-in');el.value=text;el.dispatchEvent(new Event('input',{bubbles:true}));q('.co-go').click();}
  if(st===0){
    localStorage.setItem('home_tour_done','1');localStorage.setItem('area_tour_done',JSON.stringify({nutrition:1}));
    if(typeof doorFinish==='function')doorFinish();
    var y=dayShift(-1),at=Date.now()-86400000;
    saveDay(y,{water:0,meals:[
      {id:'s1',src:'coach',name:'חזה עוף בגריל',amount:'150 ג׳',kcal:248,p:46,c:0,f:5,kind:'dinner',time:'20:10',at:at},
      {id:'s2',src:'coach',name:'אורז לבן',amount:'כוס',kcal:205,p:4,c:45,f:0,kind:'dinner',time:'20:10',at:at},
      {id:'s3',src:'coach',name:'סלט ירקות',amount:'קערה',kcal:60,p:2,c:9,f:2,kind:'dinner',time:'20:12',at:at},
      {id:'s4',src:'coach',name:'יוגורט',amount:'גביע',kcal:120,p:10,c:12,f:3,kind:'lunch',time:'13:00',at:at}]});
    saveDay(todayStr(),{water:0,meals:[]});
    enterModule('nutrition');await wait(800);
    var later=qa('button').filter(function(b){return b.textContent.trim()==='אחר כך';})[0];if(later){later.click();await wait(400);}
    out.push('0 seeded '+y+'; today meals '+loadDay(todayStr()).meals.length);keep();return;
  }
  if(st===1){
    say('ארוחת ערב כמו אתמול');await wait(900);
    var t=loadDay(todayStr()).meals;
    out.push('1 today: '+t.map(function(m){return m.name+'/'+m.kind+'/'+m.kcal;}).join(', ')+' | busy '+_coachBusy);
    var turns=loadCoach(todayStr()).turns;out.push('1 reply: '+turns[turns.length-1].text+' | rows shown '+qa('.co-it').length);
    var w=q('#co-wrap');if(w)w.scrollIntoView({block:'end'});keep();return;
  }
  if(st===2){
    say('ארוחת בוקר כמו אתמול');await wait(900);
    var tt=loadCoach(todayStr()).turns;
    out.push('2 reply: '+tt[tt.length-1].text+' | today meals '+loadDay(todayStr()).meals.length);
    var w2=q('#co-wrap');if(w2)w2.scrollIntoView({block:'end'});keep();return;
  }
})();
