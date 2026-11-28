/* The rest of the flow map (points 5-7, approved 28 Nov).
 *  5. "Back" goes where she came from: the progress graph is reached only from tracking and went to
 *     the fitness hub; steps had its way back at the bottom, worded differently from its three
 *     sibling tabs - it now has the same "back" at the top.
 *  6. A timer that ran leaves a trace: finishing a Tabata, EMOM, AMRAP or intervals after three
 *     minutes or more asks once whether to log it; yes saves it as a session with its minutes.
 *  7. Leftovers: the schedule planned two weeks, and week two was a week that never arrives (week 0
 *     is always "this week"), with a "copy week 1 to week 2" under it. It plans the week now. And
 *     a day's kinds are hers - what she trains, strength and rest - named as she named them.
 * Run: node tools/patches/fit-tidy.mjs [file] [--reverse]
 */
import fs from 'node:fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  // 5. back
  [String.raw`  h+='<div style="font-size:15px;font-weight:800;color:var(--ink)">'+_t('גרף התקדמות')+'</div>';
  h+='<button class="fit-back" onclick="_fitView=\'home\';renderFitness()">&#8249; '+_t('חזרה')+'</button>';`,
   String.raw`  h+='<div style="font-size:15px;font-weight:800;color:var(--ink)">'+_t('גרף התקדמות')+'</div>';
  h+='<button class="fit-back" onclick="_fitView=\'weights\';renderFitness()">&#8249; '+_t('חזרה')+'</button>';`],
  [String.raw`  var linked=src.kind!=='manual';
  var h='<div style="padding-bottom:20px">';`,
   String.raw`  var linked=src.kind!=='manual';
  var h='<div style="padding-bottom:20px">';
  h+='<div style="display:flex;justify-content:flex-end;margin-bottom:14px"><button class="fit-back" onclick="_fitView=\'home\';renderFitness()">&#8249; '+_t('חזרה')+'</button></div>';`],
  [String.raw`cursor:pointer;color:var(--muted);margin-top:8px;font-family:inherit">'+_t('סנכרן עכשיו')+'</button>';
  h+='</div>';

  h+='<button onclick="_fitView=\'home\';renderFitness()" style="width:100%;background:var(--surface);border:none;border-radius:12px;padding:11px;font-size:12px;font-weight:700;cursor:pointer;color:var(--muted);font-family:inherit">&#8249; '+_t('חזרה לכושר')+'</button>';
  h+='</div>';`,
   String.raw`cursor:pointer;color:var(--muted);margin-top:8px;font-family:inherit">'+_t('סנכרן עכשיו')+'</button>';
  h+='</div>';
  h+='</div>';`],
  // 6. a timer that ran
  [String.raw`function wtDone(){
  if(_wtIv){clearInterval(_wtIv);_wtIv=null;}`,
   String.raw`function wtDone(){
  /* what ran, and for how long - asked about once the clock is put away (28 Nov) */
  var _lk=_wtMode==='plan'&&_wtPlan?_wtPlan.kind:'',_lp=_wtPlan,_lm=0;
  if(_lk&&_wtFrom){var _ls=((_wtPaused||Date.now())-_wtFrom)/1000,_lt=_lp.prep+_lp.rounds*(_lp.work+_lp.rest);_lm=Math.round(Math.min(_ls,_lt)/60);}
  if(_wtIv){clearInterval(_wtIv);_wtIv=null;}`],
  [String.raw`  _wtOpen=false;_wtFull=false;
  wtLockOff();
  wtPaint();
}
function wtMin(){`,
   String.raw`  _wtOpen=false;_wtFull=false;
  wtLockOff();
  wtPaint();
  if(_lk&&_lk!=='stretch'&&_lk!=='follow'&&_lm>=3)wtLogAsk(_lk,_lm);
}
/* a Tabata done is a workout done: one question, and a yes is a session in the log */
function wtLogAsk(kind,mins){
  askConfirm(_t('לרשום את {name} כאימון?',{name:wtPlanLabel(kind)}),_t('כן, לרשום'),function(){
    var log=loadWorkoutLog(),e={date:Date.now(),name:wtPlanLabel(kind),timer:kind,duration:mins,exercises:[]};
    log.push(e);saveWorkoutLog(log);_stkWorkoutDays=null;
    showToast('✓ '+_t('נרשם: {name}',{name:e.name}));if(typeof renderFitness==='function'&&document.body.classList.contains('mod-fitness'))renderFitness();
  },_t('לא'));
}
function wtMin(){`],
  [String.raw`    h+='<div class="wh-n">'+esc(entry.type?wtLabel(entry.type):entry.name)+(entry.follow?`,
   String.raw`    h+='<div class="wh-n">'+esc(entry.timer?wtPlanLabel(entry.timer):entry.type?wtLabel(entry.type):entry.name)+(entry.follow?`],
  // 7. one week, and her kinds
  [String.raw`  h+='<div style="font-size:15px;font-weight:800;color:var(--ink)">'+_t('תכנון לשבועיים')+'</div>';`,
   String.raw`  h+='<div style="font-size:15px;font-weight:800;color:var(--ink)">'+_t('השבוע')+'</div>';`],
  [String.raw`  for(var w=0;w<2;w++){
    h+='<div class="fwp-h">'+(w===0?_t('שבוע ראשון'):_t('שבוע שני'))+'</div><div class="fwp">';`,
   String.raw`  /* ONE WEEK (28 Nov): week 0 is always "this week" and nothing ever rotated, so a second one was a
     week that never arrives */
  for(var w=0;w<1;w++){
    h+='<div class="fwp">';`],
  [String.raw`
  // Copy week 1 to week 2
  h+='<button onclick="copyWeekToWeek2()" style="width:100%;background:var(--surface);border:none;border-radius:14px;padding:11px;font-size:12px;font-weight:700;cursor:pointer;color:var(--muted)">'+_t('שכפל שבוע 1 לשבוע 2')+'</button>';
  h+='</div>';`,
   String.raw`
  /* (the copy to a week two went with week two) */
  h+='</div>';`],
  [String.raw`    h+='<button data-wt="'+WORKOUT_TYPES[i].id+'" class="'+(cur.type===WORKOUT_TYPES[i].id?'on':'')+'">'+WORKOUT_TYPES[i].label+'</button>';`,
   String.raw`    h+='<button data-wt="'+WORKOUT_TYPES[i].id+'" class="'+(cur.type===WORKOUT_TYPES[i].id?'on':'')+'">'+esc(wtLabel(WORKOUT_TYPES[i].id))+'</button>';`],
  [String.raw`function wtHidden(id,cur){var t=(WORKOUT_TYPES||[]).filter(function(x){return x.id===id;})[0];return !!(t&&t.more&&id!==cur&&(fitMe().other||[]).indexOf(id)<0);}`,
   String.raw`function wtHidden(id,cur){var t=(WORKOUT_TYPES||[]).filter(function(x){return x.id===id;})[0];
  if(id===cur||id==='rest'||id==='strength')return false;
  /* she said what she trains: her kinds, strength and rest (28 Nov) */
  var o=(fitMe().other||[]).filter(function(x){return x!=='none';});if(o.length)return o.indexOf(id)<0;   // i18n-exempt: a stored key
  return !!(t&&t.more);}`],
];

let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 200)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
