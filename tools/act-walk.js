// Walks the chat-that-does with /act stubbed in-page (the route is not
// deployed yet): a read, then a write card, then "add" - and checks the
// record landed where the fitness screen keeps it.
(async function(){
  var w=function(ms){return new Promise(function(r){setTimeout(r,ms);});},q=function(s){return document.querySelector(s);};
  var out=[],n=0,seen=[];
  window.__of=window.__of||window.fetch;
  window.fetch=function(u,o){
    if(String(u).indexOf('/act')<0)return window.__of(u,o);
    var b=JSON.parse(o.body);seen.push(b.messages.length);n++;
    var c;
    if(n===1)c=[{type:'tool_use',id:'t1',name:'get_fitness',input:{}}];
    else if(n===2){var r=JSON.parse(b.messages[b.messages.length-1].content[0].content);out.push('read returned planned='+r.planned_today+' programs='+r.programs.length);
      c=[{type:'tool_use',id:'t2',name:'log_set',input:{exercise:'סקוואט',sets:3,reps:8,weight:60,unit:'kg'}},{type:'tool_use',id:'t3',name:'hobby_log',input:{hobby:'גיטרה',amount:30}}];}
    else c=[{type:'text',text:'רשמתי, תאשר בכרטיסים.'}];
    return Promise.resolve(new Response(JSON.stringify({ok:true,content:c}),{headers:{'content-type':'application/json'}}));
  };
  localStorage.setItem('habits_list',JSON.stringify(['גיטרה']));
  var before=loadWorkoutLog().length;
  q('.hch-tile[data-k=fitness]').click();await w(1300);
  out.push('chips: '+[].map.call(document.querySelectorAll('#hch-sug button'),function(b){return b.textContent;}).join(' / '));
  var i=q('#hch-in');i.value='עשיתי סקוואט 3 על 8 ב-60 וניגנתי חצי שעה';q('.hch-row .hch-btn:last-child').click();await w(1500);
  out.push('calls '+n+', cards '+document.querySelectorAll('#hch-talk .hch-card').length+': '+[].map.call(document.querySelectorAll('#hch-talk .hch-card'),function(d){return d.textContent.replace(/\s+/g,' ').slice(0,70);}).join(' | '));
  var adds=[].filter.call(document.querySelectorAll('#hch-talk .btns button'),function(x){return !x.classList.contains('ghost');});
  adds[0].click();await w(300);
  adds=[].filter.call(document.querySelectorAll('#hch-talk .btns button'),function(x){return !x.classList.contains('ghost');});
  if(adds[0])adds[0].click();await w(300);
  var L=loadWorkoutLog(),e=L[L.length-1];
  out.push('fit_log '+before+' -> '+L.length+': '+(e&&e.name)+' / '+(e&&e.exercises.map(function(x){return x.name+' '+x.sets.length+'x'+x.sets[0].reps+'@'+x.sets[0].weight;}).join(','))+' | PR '+loadPRs()['סקוואט']);
  out.push('hobby today: '+loadHabitLog()['גיטרה__'+todayStr()]);
  out.push('saved cards: '+[].map.call(document.querySelectorAll('#hch-talk .hch-card'),function(d){return d.textContent.replace(/\s+/g,' ').slice(0,70);}).join(' | '));
  window.__aw=out.join('\n');
})();
