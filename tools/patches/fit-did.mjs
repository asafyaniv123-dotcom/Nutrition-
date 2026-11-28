/* "I did it" (Asaf approved the flow map, 28 Nov: "let's move on").
 * On a day of other training the big button said "today: Pilates" and opened five ways to start a
 * weights workout; nothing could record that the Pilates happened, so "this week 1 of 5" could never
 * fill. Now that day's button says the training and "I did it": how long, how it felt, saved as a
 * session like any other - the week strip, the streak and the evening all read fit_log already.
 * The start sheet gets the same as its first row, for a session that was not on the schedule.
 * With no strength at all, the rep-range goal card goes and the record tile becomes the week's
 * minutes against the WHO's 150. History shows such a session by its kind, without "0 exercises".
 * Run: node tools/patches/fit-did.mjs [file] [--reverse]
 */
import fs from 'node:fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  // the hero: a day of other training is done, not started
  [String.raw`  if(tg){title=_t('האימון של היום');when=esc(fitPlanName(tp))+' \u00b7 '+_t('{n} תרגילים',{n:tg.n});go='fitProgStart('+tg.pi+','+tg.di+',1)';}
  return '<button class="fh" onclick="'+go+'" style="background:'+gr[0]+'">'+
    '<div class="fh-ic"><svg viewBox="0 0 24 24" style="stroke:'+gr[1]+'">'+a.ic+'</svg></div>'+`,
   String.raw`  if(tg){title=_t('האימון של היום');when=esc(fitPlanName(tp))+' \u00b7 '+_t('{n} תרגילים',{n:tg.n});go='fitProgStart('+tg.pi+','+tg.di+',1)';}
  /* a day of other training is not started here, it is done somewhere else: "I did it", two taps (28 Nov) */
  var did=0,ic=a.ic;
  if(tp&&!tg&&tp.type!=='strength'&&!workoutsOn(todayStr()).some(function(w){return w.type===tp.type;})){
    did=1;title=esc(fitPlanName(tp));when=esc(_t('היום לפי הלוז'));go='fitDidOpen(\''+tp.type+'\')';ic='<path d="M20 6 9 17l-5-5"/>';}
  return '<button class="fh" onclick="'+go+'" style="background:'+gr[0]+'">'+
    '<div class="fh-ic"><svg viewBox="0 0 24 24" style="stroke:'+gr[1]+'">'+ic+'</svg></div>'+`],
  [String.raw`    '<div class="fh-go" style="background:'+gr[1]+'">'+_t('להתחיל')+'</div>'+`,
   String.raw`    '<div class="fh-go" style="background:'+gr[1]+'">'+(did?_t('עשיתי'):_t('להתחיל'))+'</div>'+`],
  // the start sheet: a session already done comes first
  [String.raw`  h='<div class="cf-card fss"><div class="cf-q" style="margin-bottom:12px">'+esc(_t('אימון חדש'))+'</div><div class="fss-l">';`,
   String.raw`  h='<div class="cf-card fss"><div class="cf-q" style="margin-bottom:12px">'+esc(_t('אימון חדש'))+'</div><div class="fss-l">';
  h+='<button onclick="fitDidOpen(\'\')"><b>'+esc(_t('אימון שכבר עשיתי'))+'</b><span>'+esc(_t('בלי תרגילים: כמה זמן ואיך היה'))+'</span></button>';`],
  [String.raw`function fitSheetClose(){var e=document.getElementById('fss-ov');if(e&&e.parentNode)e.parentNode.removeChild(e);}`,
   String.raw`function fitSheetClose(){var e=document.getElementById('fss-ov');if(e&&e.parentNode)e.parentNode.removeChild(e);}
/* ── "I DID IT" (28 Nov) ──
   Pilates, a run, a swim: a session with no sets in it, recorded after the fact. How long and how
   it felt, nothing else - and it is a fit_log entry like any other, so the week strip, the streak,
   the evening's "did you train" and the history all count it without being told. */
var FIT_DID_MINS=[20,30,45,60,90];
var _fitDid=null;
function fitNoStrength(){var me=fitMe();return !!(me.otherDone&&(me.other||[]).filter(function(x){return x!=='none';}).length&&fitStrengthDays(me)===0);}   // i18n-exempt: a stored key
function fitDidTypes(){var o=(fitMe().other||[]).filter(function(x){return x!=='none';});   // i18n-exempt: a stored key
  return o.length?o:['cardio','walk','yoga','pilates','swim','cycle','other'];}   // i18n-exempt: stored keys
function fitDidOpen(type){_fitDid={type:type||'',min:0,feel:0,ask:!type};fitDidPaint();}
function fitDidPaint(){
  fitSheetClose();var d=_fitDid,h,i;if(!d)return;
  var ov=document.createElement('div');ov.className='cf-ov fss-ov';ov.id='fss-ov';
  h='<div class="cf-card fss fdid"><div class="cf-q" style="margin-bottom:12px">'+esc(d.ask?_t('אימון שכבר עשיתי'):_t('עשיתי {name}',{name:wtLabel(d.type)}))+'</div>';
  if(d.ask){h+='<div class="gn-w fdid-w">';fitDidTypes().forEach(function(x){
    h+='<button class="gn-e'+(d.type===x?' on':'')+'" onclick="_fitDid.type=\''+x+'\';fitDidPaint()">'+esc(wtLabel(x))+'</button>';});h+='</div>';}
  h+='<div class="fdn-q">'+_t('כמה זמן?')+'</div><div class="gn-w fdid-w">';
  FIT_DID_MINS.forEach(function(m){h+='<button class="gn-e'+(d.min===m?' on':'')+'" onclick="_fitDid.min='+m+';fitDidPaint()">'+_t('{n} דקות',{n:m})+'</button>';});
  h+='</div><div class="fdn-q">'+_t('איך זה הרגיש?')+'</div><div class="fdn-fs">';
  for(i=1;i<=5;i++)h+='<button class="fdn-f'+(d.feel===i?' on':'')+'" onclick="_fitDid.feel='+i+';fitDidPaint()">'+
    rfFace(i-1,RF_MOODS[i-1].c,!d.feel||d.feel===i)+'<span>'+esc(fitFeelWord(i))+'</span></button>';
  h+='</div><button class="gn-go" style="margin-top:16px"'+(d.type&&d.min?'':' disabled')+' onclick="fitDidSave()">'+esc(_t('שמור'))+'</button>'+
    '<button class="cf-no" style="width:100%;margin-top:10px" onclick="_fitDid=null;fitSheetClose()">'+esc(_t('ביטול'))+'</button></div>';
  ov.innerHTML=h;document.body.appendChild(ov);
  ov.onclick=function(ev){if(ev.target===ov){_fitDid=null;fitSheetClose();}};
}
function fitDidSave(){
  var d=_fitDid;if(!d||!d.type||!d.min)return;
  var log=loadWorkoutLog(),e={date:Date.now(),name:wtLabel(d.type),type:d.type,duration:d.min,exercises:[]};
  if(d.feel)e.feel=d.feel;
  log.push(e);saveWorkoutLog(log);_stkWorkoutDays=null;
  _fitDid=null;fitSheetClose();showToast('✓ '+_t('נרשם: {name}',{name:e.name}));renderFitness();
  try{beemReact('workout');}catch(x){}
}
/* the week's minutes, every kind of session - what "150 a week" is counted in */
function fitWeekMinutes(){var sun=dayShift(-appNow().getDay()),m=0;
  loadWorkoutLog().forEach(function(w){if(w.date&&appDayOf(w.date)>=sun)m+=+w.duration||0;});return m;}`],
  // tracking at a glance: with no strength, minutes instead of a record
  [String.raw`      '<span><b>'+(pr?esc(fmtWeight(pr.weight)):'&ndash;')+'</b><i>'+(pr?esc(exLabel(pr.name)):_t('שיא אחרון'))+'</i></span>'+`,
   String.raw`      (fitNoStrength()?'<span><b>'+nfmt(fitWeekMinutes())+'/'+nfmt(150)+'</b><i>'+_t('דקות תנועה השבוע')+'</i></span>':
      '<span><b>'+(pr?esc(fmtWeight(pr.weight)):'&ndash;')+'</b><i>'+(pr?esc(exLabel(pr.name)):_t('שיא אחרון'))+'</i></span>')+`],
  // no rep range to aim at without a plan
  [String.raw`  if(fo.length&&!_fitGoalOpen){
    h+='<div class="fg"><div class="fg-hd"><span class="fg-k">'+_t('המטרה שלי')+'</span>'+`,
   String.raw`  if(fitNoStrength()){/* no strength plan: a rep range would be advice for nothing she does */}
  else if(fo.length&&!_fitGoalOpen){
    h+='<div class="fg"><div class="fg-hd"><span class="fg-k">'+_t('המטרה שלי')+'</span>'+`],
  // history: such a session by its kind, without "0 exercises" or a volume
  [String.raw`    h+='<div class="wh-n">'+esc(entry.name)+(entry.follow?`,
   String.raw`    h+='<div class="wh-n">'+esc(entry.type?wtLabel(entry.type):entry.name)+(entry.follow?`],
  [String.raw`    h+='<span>'+_t('{n} תרגילים',{n:entry.exercises.length})+'</span>';
    /* A count beside`,
   String.raw`    if(entry.exercises.length)h+='<span>'+_t('{n} תרגילים',{n:entry.exercises.length})+'</span>';
    /* A count beside`],
  [String.raw`    else h+='<span class="wh-v">'+nfmt(volDisp(vol))+' '+_t('{u} נפח',{u:weightUnit()})+'</span>';`,
   String.raw`    else if(entry.exercises.length)h+='<span class="wh-v">'+nfmt(volDisp(vol))+' '+_t('{u} נפח',{u:weightUnit()})+'</span>';`],
  [String.raw`.as-sp{margin-top:14px}`,
   String.raw`.as-sp{margin-top:14px}
.fdid .gn-w{margin:0 0 16px}`],
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
