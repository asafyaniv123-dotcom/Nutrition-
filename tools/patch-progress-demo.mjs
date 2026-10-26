/* (Asaf: "the purple softer, in our design; and show it moving - a link that
 * is really what it will be, animations and all").
 *  - the flood is a soft lavender with dark ink instead of a saturated violet.
 *  - dev/?demo=progress: the real app in a throwaway sandbox of its own
 *    ('demo:', emptied on every load, never the dev or the real data), filled
 *    with eight weeks shaped like real records, so the moment plays exactly as
 *    it will: the flood on opening, the walk to Me, the spotlight, the page. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`K.screen({bg:'#7a64b0',ink:'#ffffff',accent:'#3f2f6e',play:DOOR_BEEM.glad,beads:true,`,
  `K.screen({bg:'#d4c8ea',ink:'#3a2f55',accent:'#3a2f55',play:DOOR_BEEM.glad,beads:true,`);
rep(`  var P='dev:',SEEDED=P+'__seeded';`, `  /* ?demo=progress: a throwaway sandbox of its own, emptied on every load */
  var DEMO=/[?&]demo=progress(&|$)/.test(location.search);
  var P=DEMO?'demo:':'dev:',SEEDED=P+'__seeded';
  if(DEMO){window.__DEMO__=true;
    for(var di=raw.length-1;di>=0;di--){var dk=raw.key(di);if(dk&&dk.indexOf(P)===0)raw.removeItem(dk);}
    raw.setItem(SEEDED,'1');raw.setItem(P+'app_onboarded','1');}`);
rep(`window.addEventListener('load',function(){setTimeout(prgUnlockCheck,2600);});`,
`/* the demo's eight weeks, shaped like real records */
function prgDemoSeed(){
  var W={},i,d;
  for(i=0;i<56;i++){if(i%2)continue;d=dayShift(-i);W[d]=Math.round((72.4+i*0.035+Math.sin(i)*0.3)*100)/100;}
  saveWeights(W);
  var wc={};try{wc=JSON.parse(localStorage.getItem(WEIGH_KEY)||'{}')||{};}catch(e){}wc.on=true;wc.goal=70;localStorage.setItem(WEIGH_KEY,JSON.stringify(wc));
  for(i=0;i<14;i++){d=dayShift(-i);var day=loadDay(d);
    day.meals=[{name:'a',time:'08:00',kcal:600+((i*137)%400),p:40+(i*7)%30,c:50,f:20},{name:'b',time:'13:00',kcal:900+((i*91)%500),p:50+(i*5)%30,c:80,f:30},{name:'c',time:'19:00',kcal:450,p:30,c:40,f:15}];
    day.water=1200+((i*347)%1600);saveDay(d,day);saveSteps(d,5000+((i*2311)%8000),'manual');}
  var L=[],EX=[['סקוואט',40],['דדליפט',60],['לחיצת חזה',35],['חתירה',30]];
  for(i=55;i>=0;i-=3){var t=new Date(dayShift(-i)+'T18:00:00').getTime(),wk=(55-i)/56;
    L.push({date:t,name:_t('אימון'),duration:50,exercises:EX.map(function(e){var w=Math.round((e[1]+wk*e[1]*0.4)/2.5)*2.5;return {name:e[0],targetSets:3,targetReps:8,sets:[{weight:w,reps:8},{weight:w,reps:8},{weight:w,reps:8}],warm:[]};})});}
  saveWorkoutLog(L);
  saveHabits(['גיטרה','קריאה']);
  var H={};for(i=0;i<14;i++){if(i%2===0)H['גיטרה__'+dayShift(-i)]=30;if(i%3===0)H['קריאה__'+dayShift(-i)]=25;}
  saveHabitLog(H);
  for(i=0;i<14;i++){d=dayShift(-i);var r=loadSummary(d)||{date:d};r.mood=1+((i*3)%5);r.dayRating=4+((i*5)%6);saveSummary(d,r);}
  saveBook({title:'האיש שחיפש משמעות',page:124,total:180,cover:''});
  saveBookQuotes([{text:'למי שיש "למה" לחיות, יוכל לשאת כמעט כל "איך".',page:41},{text:'אפשר לקחת מאדם הכול מלבד דבר אחד.',page:86}]);
}
window.addEventListener('load',function(){
  if(window.__DEMO__){try{prgDemoSeed();}catch(e){}try{render();}catch(e){}}
  setTimeout(prgUnlockCheck,2600);
});`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
