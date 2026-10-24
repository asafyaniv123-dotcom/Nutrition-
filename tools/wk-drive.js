// Drives dev into a workout in progress, for tools/shoot-page.mjs --then.
(function(){
  try{localStorage.setItem('dev:onboarded','1');}catch(e){}
  enterModule('fitness');
  _fitWorkout={templateIdx:-1,name:'פלג גוף עליון',startTime:Date.now()-600000,currentEx:1,exercises:[
    {name:'פרפר במכונה',targetSets:3,targetReps:12,plan:[],sets:[{weight:40,reps:12,rpe:7},{weight:40,reps:12,rpe:8},{weight:40,reps:10,rpe:9}],warm:[],ss:null},
    {name:'לחיצת חזה במוט',targetSets:3,targetReps:8,plan:[],sets:[{weight:70,reps:8,rpe:8}],warm:[],ss:null},
    {name:'הרחקת כתף',targetSets:3,targetReps:12,plan:[],sets:[],warm:[],ss:null}]};
  _fitView='workout';renderFitness();
})();
