/* Builds data/exercises.json - the exercise list the workout screen picks from.
 *
 *   node tools/build-exercises.mjs
 *
 * Why this is written rather than fetched. tools/fetch-exercises.mjs pulls
 * wger's open database, which is the right thing to reach for: free, CC-BY-SA,
 * commercial use allowed, and every exercise carries the muscle it works and
 * the equipment it needs - the structure Hevy organises its library by and
 * that we had no way to do at all.
 *
 * But 22 of its 871 exercises have a Hebrew name, and the list is thick with
 * near-duplicates and junk: "3008 Abdominal Crunch", "Bench Dips On Floor HD",
 * "Bizeps Curls Trifecta", a few entries in Spanish. Dropping 716 of those
 * into a Hebrew app is worse than having no library, because the cost of a
 * library is the scrolling and the benefit is only in the entries you would
 * actually pick.
 *
 * So the taxonomy is wger's - the muscle names, the equipment names, the way
 * an exercise is described - and the list is written: the movements a person
 * doing this actually does, in the words they use for them. לחיצת חזה, not a
 * translation of "bench press". Where wger has the same movement its English
 * name is kept alongside, because half the gym says it in English anyway and
 * it makes the thing searchable both ways.
 */
import fs from 'fs';
import {HOWTO} from './exercise-howto.mjs';

const M={
  chest:'חזה', back:'גב', lats:'גב רחב', traps:'טרפז', shoulders:'כתפיים',
  biceps:'יד קדמית', triceps:'יד אחורית', forearm:'אמה',
  quads:'ארבע ראשי', hams:'ירך אחורית', glutes:'ישבן', calves:'תאומים',
  abs:'בטן', obliques:'אלכסונים', lower:'גב תחתון', cardio:'אירובי'
};
const Q={
  bar:'מוט', db:'משקולות יד', kb:'קטלבל', cable:'פולי', machine:'מכונה',
  bw:'משקל גוף', bench:'ספסל', bar_pull:'מתח', band:'גומייה', ball:'כדור פיזיו',
  mat:'מזרן', card:'מכשיר אירובי'
};

/* name, primary muscle, equipment, English name.
   Ordered within each group from the movement most people build a session
   around to the ones that finish it off. */
const RAW=[
// ── חזה ──
['לחיצת חזה במוט',M.chest,[Q.bar,Q.bench],'Barbell Bench Press'],
['לחיצת חזה במשקולות',M.chest,[Q.db,Q.bench],'Dumbbell Bench Press'],
['לחיצת חזה בשיפוע חיובי',M.chest,[Q.bar,Q.bench],'Incline Bench Press'],
['לחיצת חזה בשיפוע חיובי במשקולות',M.chest,[Q.db,Q.bench],'Incline Dumbbell Press'],
['לחיצת חזה בשיפוע שלילי',M.chest,[Q.bar,Q.bench],'Decline Bench Press'],
['לחיצת חזה במכונה',M.chest,[Q.machine],'Chest Press Machine'],
['פרפר במשקולות',M.chest,[Q.db,Q.bench],'Dumbbell Fly'],
['פרפר בפולי',M.chest,[Q.cable],'Cable Crossover'],
['פרפר במכונה',M.chest,[Q.machine],'Pec Deck'],
['שכיבות סמיכה',M.chest,[Q.bw],'Push Ups'],
['שכיבות סמיכה בשיפוע',M.chest,[Q.bw],'Incline Push Ups'],
['מקבילים',M.chest,[Q.bw],'Dips'],
['פולאובר',M.chest,[Q.db,Q.bench],'Dumbbell Pullover'],
// ── גב ──
['מתח',M.lats,[Q.bar_pull],'Pull Ups'],
['מתח אחיזה תחתונה',M.lats,[Q.bar_pull],'Chin Ups'],
['מתח בסיוע גומייה',M.lats,[Q.bar_pull,Q.band],'Assisted Pull Ups'],
['פולי עליון',M.lats,[Q.cable],'Lat Pulldown'],
['פולי עליון אחיזה צרה',M.lats,[Q.cable],'Close Grip Pulldown'],
['חתירה במוט',M.back,[Q.bar],'Barbell Row'],
['חתירה במשקולת יד',M.back,[Q.db,Q.bench],'Dumbbell Row'],
['חתירה בפולי בישיבה',M.back,[Q.cable],'Seated Cable Row'],
['חתירה במכונה',M.back,[Q.machine],'Machine Row'],
['חתירת T',M.back,[Q.bar],'T-Bar Row'],
['דדליפט',M.back,[Q.bar],'Deadlift'],
['דדליפט רומני',M.hams,[Q.bar],'Romanian Deadlift'],
['דדליפט סומו',M.glutes,[Q.bar],'Sumo Deadlift'],
['הרמת גב',M.lower,[Q.bw],'Hyperextension'],
['גוד מורנינג',M.lower,[Q.bar],'Good Morning'],
['משיכת כתפיים',M.traps,[Q.db],'Shrugs'],
['משיכת כתפיים במוט',M.traps,[Q.bar],'Barbell Shrugs'],
['פייס פול',M.shoulders,[Q.cable],'Face Pull'],
// ── כתפיים ──
['לחיצת כתפיים במוט',M.shoulders,[Q.bar],'Overhead Press'],
['לחיצת כתפיים במשקולות',M.shoulders,[Q.db],'Dumbbell Shoulder Press'],
['לחיצת כתפיים במכונה',M.shoulders,[Q.machine],'Machine Shoulder Press'],
['לחיצת ארנולד',M.shoulders,[Q.db],'Arnold Press'],
['הרחקת כתף',M.shoulders,[Q.db],'Lateral Raise'],
['הרחקת כתף בפולי',M.shoulders,[Q.cable],'Cable Lateral Raise'],
['הרמה קדמית',M.shoulders,[Q.db],'Front Raise'],
['פרפר הפוך',M.shoulders,[Q.db],'Rear Delt Fly'],
['פרפר הפוך במכונה',M.shoulders,[Q.machine],'Reverse Pec Deck'],
['חתירה אנכית',M.shoulders,[Q.bar],'Upright Row'],
// ── יד קדמית ──
['כפיפת מרפק במוט',M.biceps,[Q.bar],'Barbell Curl'],
['כפיפת מרפק במשקולות',M.biceps,[Q.db],'Dumbbell Curl'],
['כפיפת פטיש',M.biceps,[Q.db],'Hammer Curl'],
['כפיפה בסקוט',M.biceps,[Q.bar,Q.bench],'Preacher Curl'],
['כפיפת מרפק בפולי',M.biceps,[Q.cable],'Cable Curl'],
['כפיפת ריכוז',M.biceps,[Q.db],'Concentration Curl'],
['כפיפת מרפק בשיפוע',M.biceps,[Q.db,Q.bench],'Incline Curl'],
// ── יד אחורית ──
['פשיטת מרפק בפולי',M.triceps,[Q.cable],'Tricep Pushdown'],
['פשיטת מרפק בחבל',M.triceps,[Q.cable],'Rope Pushdown'],
['סקאל קראשר',M.triceps,[Q.bar,Q.bench],'Skull Crushers'],
['פשיטת מרפק מעל הראש',M.triceps,[Q.db],'Overhead Tricep Extension'],
['לחיצת חזה אחיזה צרה',M.triceps,[Q.bar,Q.bench],'Close Grip Bench Press'],
['מקבילים לטרייספס',M.triceps,[Q.bw],'Tricep Dips'],
['בעיטת טרייספס',M.triceps,[Q.db],'Tricep Kickback'],
// ── רגליים ──
['סקוואט',M.quads,[Q.bar],'Barbell Squat'],
['סקוואט קדמי',M.quads,[Q.bar],'Front Squat'],
['סקוואט גובלט',M.quads,[Q.db],'Goblet Squat'],
['סקוואט משקל גוף',M.quads,[Q.bw],'Bodyweight Squat'],
['לחיצת רגליים',M.quads,[Q.machine],'Leg Press'],
['האק סקוואט',M.quads,[Q.machine],'Hack Squat'],
['פשיטת ברך',M.quads,[Q.machine],'Leg Extension'],
['כפיפת ברך בשכיבה',M.hams,[Q.machine],'Lying Leg Curl'],
['כפיפת ברך בישיבה',M.hams,[Q.machine],'Seated Leg Curl'],
['לאנג׳',M.quads,[Q.db],'Lunges'],
['לאנג׳ בהליכה',M.quads,[Q.db],'Walking Lunges'],
['סקוואט בולגרי',M.quads,[Q.db,Q.bench],'Bulgarian Split Squat'],
['עליות מדרגה',M.quads,[Q.db],'Step Ups'],
['היפ ת׳ראסט',M.glutes,[Q.bar,Q.bench],'Hip Thrust'],
['גשר ישבן',M.glutes,[Q.bw],'Glute Bridge'],
['הרחקת ירך במכונה',M.glutes,[Q.machine],'Hip Abduction'],
['הרמת עקבים בעמידה',M.calves,[Q.machine],'Standing Calf Raise'],
['הרמת עקבים בישיבה',M.calves,[Q.machine],'Seated Calf Raise'],
// ── בטן ──
['כפיפות בטן',M.abs,[Q.mat],'Crunches'],
['הרמת רגליים בתלייה',M.abs,[Q.bar_pull],'Hanging Leg Raise'],
['הרמת רגליים בשכיבה',M.abs,[Q.mat],'Lying Leg Raise'],
['פלאנק',M.abs,[Q.mat],'Plank'],
['פלאנק צידי',M.obliques,[Q.mat],'Side Plank'],
['טוויסט רוסי',M.obliques,[Q.mat],'Russian Twist'],
['גלגל בטן',M.abs,[Q.mat],'Ab Wheel'],
['טיפוס הרים',M.abs,[Q.bw],'Mountain Climbers'],
['כפיפות בטן בפולי',M.abs,[Q.cable],'Cable Crunch'],
['ווקאום',M.abs,[Q.bw],'Stomach Vacuum'],
// ── אירובי ──
['ריצה',M.cardio,[Q.card],'Running'],
['הליכון',M.cardio,[Q.card],'Treadmill'],
['אופני כושר',M.cardio,[Q.card],'Stationary Bike'],
['אליפטיקל',M.cardio,[Q.card],'Elliptical'],
['מכונת חתירה',M.cardio,[Q.card],'Rowing Machine'],
['קפיצה בחבל',M.cardio,[Q.bw],'Jump Rope'],
['ברפי',M.cardio,[Q.bw],'Burpees'],
['סטפר',M.cardio,[Q.card],'Stair Climber'],
// ── קטלבל ──
['סווינג קטלבל',M.glutes,[Q.kb],'Kettlebell Swing'],
['גובלט סקוואט קטלבל',M.quads,[Q.kb],'Kettlebell Goblet Squat'],
['טורקיש גט אפ',M.abs,[Q.kb],'Turkish Get Up'],
['קלין אנד פרס',M.shoulders,[Q.kb],'Clean and Press'],
// ── אמות ──
['כפיפת שורש כף יד',M.forearm,[Q.bar],'Wrist Curl'],
['אחיזת חוואי',M.forearm,[Q.db],'Farmers Carry']
];

const list=RAW.map(function(r,i){
  const o={id:'x'+(i+1),n:r[0],m:[r[1]],q:r[2]};
  if(r[3])o.en=r[3];
  /* How it is done and what goes wrong. Not every exercise has it yet - a
     screen that says nothing is better than one that says something vague. */
  const hw=HOWTO[r[0]];
  if(hw){o.s=hw.s;o.k=hw.m;}
  return o;
});

// nothing named twice, or the picker shows the same movement in two places
const seen={};
for(const e of list){
  if(seen[e.n])throw new Error('two exercises called '+e.n);
  seen[e.n]=1;
}

fs.writeFileSync('data/exercises.json',JSON.stringify({
  taxonomy:'wger (CC-BY-SA 3.0) - muscle and equipment names',
  url:'https://wger.de',
  note:'the list itself is written for this app, not translated',
  built:new Date().toISOString().slice(0,10),
  muscles:[M.chest,M.back,M.lats,M.traps,M.shoulders,M.biceps,M.triceps,M.forearm,
           M.quads,M.hams,M.glutes,M.calves,M.abs,M.obliques,M.lower,M.cardio],
  equipment:[Q.bar,Q.db,Q.machine,Q.cable,Q.bw,Q.bar_pull,Q.kb,Q.bench,Q.band,Q.mat,Q.card,Q.ball],
  exercises:list
}));
const byM={};for(const e of list)byM[e.m[0]]=(byM[e.m[0]]||0)+1;
const withHow=list.filter(e=>e.s).length;
console.log('exercises: '+list.length+'   with instructions: '+withHow);
console.log('all in Hebrew: '+list.every(e=>/[֐-׿]/.test(e.n)));
console.log('by muscle: '+Object.entries(byM).map(([k,v])=>k+' '+v).join(', '));
console.log('data/exercises.json: '+fs.statSync('data/exercises.json').size+' bytes');
