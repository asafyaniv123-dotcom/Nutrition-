// Seeds eight weeks of data shaped like the app's own records, for walking
// the progress screen (dev sandbox only).
(function(){
  localStorage.setItem('app_onboarded','1');localStorage.setItem('home_mode','dial');
  var W={},i,d;
  for(i=0;i<56;i++){if(i%2)continue;d=dayShift(-i);W[d]=Math.round((72.4+i*0.035+Math.sin(i)*0.3)*100)/100;}
  localStorage.setItem('weights',JSON.stringify(W));
  var wc={};try{wc=JSON.parse(localStorage.getItem(WEIGH_KEY)||'{}');}catch(e){}wc.on=true;wc.goal=70;localStorage.setItem(WEIGH_KEY,JSON.stringify(wc));
  for(i=0;i<14;i++){d=dayShift(-i);var day=loadDay(d);
    day.meals=[{name:'a',time:'08:00',kcal:600+((i*137)%400),p:40+(i*7)%30,c:50,f:20},{name:'b',time:'13:00',kcal:900+((i*91)%500),p:50+(i*5)%30,c:80,f:30},{name:'c',time:'19:00',kcal:450,p:30,c:40,f:15}];
    day.water=1200+((i*347)%1600);saveDay(d,day);saveSteps(d,5000+((i*2311)%8000),'manual');}
  var L=[],EX=[['סקוואט',40],['דדליפט',60],['לחיצת חזה',35],['חתירה',30]];
  for(i=55;i>=0;i-=3){var t=new Date(dayShift(-i)+'T18:00:00').getTime(),wk=(55-i)/56;
    L.push({date:t,name:'אימון',duration:50,exercises:EX.map(function(e){var w=Math.round((e[1]+wk*e[1]*0.4)/2.5)*2.5;return {name:e[0],targetSets:3,targetReps:8,sets:[{weight:w,reps:8},{weight:w,reps:8},{weight:w,reps:8}],warm:[]};})});}
  localStorage.setItem('fit_log',JSON.stringify(L));
  localStorage.setItem('habits_list',JSON.stringify(['גיטרה','קריאה']));
  var H={};for(i=0;i<14;i++){if(i%2===0)H['גיטרה__'+dayShift(-i)]=30;if(i%3===0)H['קריאה__'+dayShift(-i)]=25;}
  localStorage.setItem('habits_log',JSON.stringify(H));
  for(i=0;i<14;i++){d=dayShift(-i);var r=loadSummary(d)||{date:d};r.mood=1+((i*3)%5);r.dayRating=4+((i*5)%6);saveSummary(d,r);}
  localStorage.setItem('current_book',JSON.stringify({title:'האיש שחיפש משמעות',page:124,total:180,cover:''}));
  localStorage.setItem('book_quotes',JSON.stringify([{text:'למי שיש "למה" לחיות, יוכל לשאת כמעט כל "איך".',page:41},{text:'אפשר לקחת מאדם הכול מלבד דבר אחד.',page:86}]));
  location.reload();
  return new Promise(function(r){setTimeout(r,100);});
})()
