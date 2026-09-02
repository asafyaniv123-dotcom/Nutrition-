/* Builds data/exercises.json from wger's open exercise database.
 *
 *   node tools/fetch-exercises.mjs
 *
 * wger is the only free, structured exercise database with a licence that
 * allows commercial use: the exercise data is CC-BY-SA 3.0. That carries the
 * same share-alike obligation as Open Food Facts, and the same note applies -
 * fine while the app shows it as it is, worth settling properly before the
 * App Store, and not something this script can settle for you.
 *
 * What it is good for: the structure. Every exercise carries the muscle it
 * works, the equipment it needs, and a category - which is exactly how Hevy
 * lets you find one, and what we had no way to do at all.
 *
 * What it is not good for: Hebrew. Of 871 exercises, 22 have a Hebrew name.
 * So the names come from HE_NAMES below, which is written by hand and covers
 * the movements a person actually does; anything past that keeps its English
 * name rather than being machine-translated into nonsense. An exercise nobody
 * can read the name of is worse than one that is honestly in English.
 */
import fs from 'fs';

const OUT='data/exercises.json';
const UA='BetterMe/0.1 (personal fitness prototype)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const MUSCLE_HE={
  'Shoulders':'כתפיים','Biceps':'יד קדמית','Triceps':'יד אחורית','Chest':'חזה',
  'Lats':'גב רחב','Trapezius':'טרפז','Abs':'בטן','Quads':'ארבע ראשי',
  'Hamstrings':'ירך אחורית','Glutes':'ישבן','Calves':'תאומים','Brachialis':'זרוע',
  'Serratus anterior':'משונן קדמי','Soleus':'סוליה',
  'Obliquus externus abdominis':'אלכסונים'
};
const EQUIP_HE={
  'Barbell':'מוט','Dumbbell':'משקולות יד','Kettlebell':'קטלבל','Bench':'ספסל',
  'Incline bench':'ספסל משופע','Cable machine':'פולי','Pull-up bar':'מתח',
  'Resistance band':'גומייה','SZ-Bar':'מוט SZ','Swiss Ball':'כדור פיזיו',
  'Gym mat':'מזרן','none (bodyweight exercise)':'משקל גוף'
};
const CAT_HE={
  'Arms':'ידיים','Legs':'רגליים','Abs':'בטן','Chest':'חזה','Back':'גב',
  'Shoulders':'כתפיים','Calves':'תאומים','Cardio':'אירובי'
};

/* The movements people actually do, in the words they actually use. Written
   rather than translated: "Bench Press" is לחיצת חזה, not "לחיצת ספסל", and
   no automatic translation gets that right. */
const HE_NAMES={
  'bench press':'לחיצת חזה','barbell bench press':'לחיצת חזה במוט',
  'dumbbell bench press':'לחיצת חזה במשקולות','incline bench press':'לחיצת חזה בשיפוע',
  'decline bench press':'לחיצת חזה בשיפוע שלילי','push ups':'שכיבות סמיכה',
  'push-ups':'שכיבות סמיכה','chest fly':'פרפר','dumbbell flyes':'פרפר במשקולות',
  'cable crossover':'פרפר בפולי','dips':'מקבילים','chest press':'לחיצת חזה במכונה',
  'squats':'סקוואט','squat':'סקוואט','barbell squat':'סקוואט במוט',
  'front squat':'סקוואט קדמי','goblet squat':'סקוואט גובלט','leg press':'לחיצת רגליים',
  'lunges':'לאנג׳','walking lunges':'לאנג׳ בהליכה','bulgarian split squat':'סקוואט בולגרי',
  'leg extension':'פשיטת ברך','leg curl':'כפיפת ברך','romanian deadlift':'דדליפט רומני',
  'deadlift':'דדליפט','deadlifts':'דדליפט','sumo deadlift':'דדליפט סומו',
  'hip thrust':'היפ ת׳ראסט','glute bridge':'גשר ישבן','calf raises':'הרמת עקבים',
  'standing calf raises':'הרמת עקבים בעמידה',
  'pull ups':'מתח','pull-ups':'מתח','chin ups':'מתח אחיזה עליונה',
  'lat pulldown':'פולי עליון','seated row':'חתירה בישיבה','barbell row':'חתירה במוט',
  'bent over row':'חתירה בהטיה','dumbbell row':'חתירה במשקולת','t-bar row':'חתירת T',
  'face pull':'פייס פול','shrugs':'משיכת כתפיים','hyperextensions':'הרמת גב',
  'shoulder press':'לחיצת כתפיים','overhead press':'לחיצת כתפיים מעל הראש',
  'military press':'לחיצה צבאית','arnold press':'לחיצת ארנולד',
  'lateral raises':'הרחקת כתף','front raises':'הרמה קדמית',
  'rear delt fly':'פרפר הפוך','upright row':'חתירה אנכית',
  'bicep curls':'כפיפת מרפק','biceps curl':'כפיפת מרפק','hammer curl':'כפיפת פטיש',
  'preacher curl':'כפיפה בסקוט','concentration curl':'כפיפת ריכוז',
  'triceps extension':'פשיטת מרפק','tricep pushdown':'פשיטת מרפק בפולי',
  'skull crushers':'סקאל קראשר','overhead triceps extension':'פשיטת מרפק מעל הראש',
  'close grip bench press':'לחיצת חזה אחיזה צרה',
  'crunches':'כפיפות בטן','sit ups':'כפיפות בטן','plank':'פלאנק',
  'side plank':'פלאנק צידי','leg raises':'הרמת רגליים','hanging leg raise':'הרמת רגליים בתלייה',
  'russian twist':'טוויסט רוסי','mountain climbers':'טיפוס הרים','ab wheel':'גלגל בטן',
  'burpees':'ברפי','jumping jacks':'קפיצות פישוק','running':'ריצה','cycling':'אופניים',
  'rowing':'חתירה','jump rope':'קפיצה בחבל','treadmill':'הליכון'
};
function heName(en){
  const k=String(en||'').toLowerCase().replace(/[()]/g,'').replace(/\s+/g,' ').trim();
  if(HE_NAMES[k])return HE_NAMES[k];
  // "Barbell Bench Press" also answers to "bench press"
  for(const key in HE_NAMES)if(k.indexOf(key)>=0&&key.length>6)return HE_NAMES[key];
  return '';
}

async function grab(url,tries){
  tries=tries||0;
  try{
    const r=await fetch(url,{headers:{'User-Agent':UA}});
    if(r.status===429||r.status>=500)throw new Error('busy');
    return await r.json();
  }catch(e){
    if(tries>=6)return null;
    await sleep(1200*Math.pow(1.6,tries));
    return grab(url,tries+1);
  }
}

const out=[];
let url='https://wger.de/api/v2/exerciseinfo/?limit=100&format=json',page=0;
while(url&&page<40){
  const j=await grab(url);
  if(!j)break;
  for(const e of (j.results||[])){
    const tr=e.translations||[];
    const en=(tr.find(t=>t.language===2)||{}).name||'';
    const he=(tr.find(t=>t.language===21)||{}).name||'';
    if(!en&&!he)continue;
    const name=he||heName(en)||en;
    if(!name)continue;
    const muscles=[].concat(e.muscles||[],e.muscles_secondary||[])
      .map(m=>MUSCLE_HE[m.name_en||m.name]).filter(Boolean);
    const prim=(e.muscles||[]).map(m=>MUSCLE_HE[m.name_en||m.name]).filter(Boolean);
    const equip=(e.equipment||[]).map(q=>EQUIP_HE[q.name]).filter(Boolean);
    // the English name is kept whenever it is not the one being shown, because
    // it is what half the gym calls it anyway
    const o={id:'w'+e.id,n:name,
             m:prim.length?prim:muscles.slice(0,1),
             q:equip.length?equip:['משקל גוף'],
             c:CAT_HE[(e.category||{}).name]||''};
    if(name!==en&&en)o.en=en;
    out.push(o);
  }
  url=j.next;page++;
  process.stdout.write('.');
  await sleep(400);
}

// one entry per name: wger carries the same movement several times over
const seen=new Map();
for(const e of out){
  const k=e.n.toLowerCase();
  const had=seen.get(k);
  // keep the one that knows the most about itself
  if(!had||((e.m.length+e.q.length)>(had.m.length+had.q.length)))seen.set(k,e);
}
const list=[...seen.values()].sort((a,b)=>a.n.localeCompare(b.n,'he'));

fs.writeFileSync(OUT,JSON.stringify({
  source:'wger',
  licence:'CC-BY-SA 3.0 - attribution required, share-alike on derived databases',
  url:'https://wger.de',
  fetched:new Date().toISOString().slice(0,10),
  note:'Hebrew names for the common movements are written by hand, not translated',
  exercises:list
}));
const heCount=list.filter(e=>/[֐-׿]/.test(e.n)).length;
console.log('\nexercises: '+list.length);
console.log('with a Hebrew name: '+heCount+' ('+Math.round(heCount/list.length*100)+'%)');
console.log('muscles covered: '+[...new Set(list.flatMap(e=>e.m))].join(', '));
console.log(OUT+': '+fs.statSync(OUT).size+' bytes');
