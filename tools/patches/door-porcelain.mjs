// node tools/patches/door-porcelain.mjs [--reverse] [file]
// The first-run door wears the evening's porcelain: the same faces, shell and folio
// the app now shows, so the first summary looks like every summary after it.
import fs from 'node:fs';
const REV = process.argv.includes('--reverse');
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
const P = [
// 1. CSS, after the door's textarea rule
[`.dr-area{font-size:17px;font-weight:600;line-height:1.5;resize:none;text-align:center}
`,
`.dr-area{font-size:17px;font-weight:600;line-height:1.5;resize:none;text-align:center}
/* the door wears the evening's porcelain (25 Nov): the faces, the shell and the folio
   are the ones סיום יום shows, so her first page looks like every page after it */
.door .dr-faces{gap:2px}
.door .dr-face{background:none;box-shadow:none;padding:0;gap:9px;font-size:12px;font-weight:700}
.door .dr-dish{display:grid;place-items:center;width:58px;height:58px;border-radius:50%;background:var(--nu-ground);overflow:hidden;
  box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft);transition:box-shadow .2s}
.door .rfq-f{display:block;width:62px;height:62px;background-repeat:no-repeat;background-size:310px 217px;
  background-position:calc(var(--fi) * -62px) -155px;
  -webkit-mask:radial-gradient(closest-side,#000 71%,transparent 77%);mask:radial-gradient(closest-side,#000 71%,transparent 77%)}
.door .dr-face.on .dr-dish{box-shadow:inset 3px 4px 8px var(--nu-shade),inset -3px -3px 7px var(--nu-lit),
  0 0 0 2px rgba(240,169,46,.55),0 0 16px 3px rgba(240,169,46,.35)}
.door .dr-face.on{color:#8a5a1c}
.door .dr-hero{width:151px;height:126px;margin:-8px auto 4px;background-size:151px 126px;background-repeat:no-repeat;
  -webkit-mask:radial-gradient(closest-side,#000 74%,transparent 100%);mask:radial-gradient(closest-side,#000 74%,transparent 100%)}
.door .dr-area.dr-lined{font-family:"Frank Ruhl Libre",Georgia,serif;font-weight:500;line-height:34px;padding:12px 18px;text-align:start;
  border-radius:18px;box-shadow:inset 3px 4px 9px var(--nu-shade-soft),inset -3px -3px 8px var(--nu-lit);
  background-image:repeating-linear-gradient(transparent 0 33px,rgba(176,160,140,.32) 33px 34px);background-position:0 12px;background-attachment:local}
.door .dr-fol{position:relative;display:flex;align-items:center;gap:16px;width:min(300px,92%);height:104px;margin:8px auto 0;
  padding:0 30px 0 16px;box-sizing:border-box;border-radius:14px;direction:rtl;background:var(--nu-ground);
  box-shadow:-4px -4px 10px var(--nu-lit),5px 6px 14px var(--nu-shade),0 3px 0 -1px var(--nu-ground),0 4px 0 -1px rgba(176,160,140,.5)}
.door .dr-fol .rfb-plate{border-radius:10px;padding:10px 14px;text-align:start}
.door .dr-fol .rfb-plate small{font-family:"Frank Ruhl Libre",Georgia,serif;font-size:13.5px;font-weight:500}
.door .dr-fol .rfb-plate b{font-family:"Frank Ruhl Libre",Georgia,serif;font-size:22px;font-weight:500}
.door .dr-fol .rfb-dot{width:54px;height:54px}
.door .dr-fol .rfb-dot i{display:block;width:36px;height:36px;background:var(--gz) no-repeat;background-size:288px 36px;
  -webkit-mask:radial-gradient(closest-side,#000 86%,transparent 92%);mask:radial-gradient(closest-side,#000 86%,transparent 92%)}
.door .dr-fol .rfb-dot .rfq-f{width:50px;height:50px;background-size:250px 175px;background-position:calc(var(--fi) * -50px) -125px}
.door .dr-fol .rfb-spine{right:0;top:12px;bottom:12px;width:3px;border-radius:2px 0 0 2px}
.door .dr-sum{position:relative;width:min(320px,94%);height:min(46vh,400px);margin:10px auto 0;border-radius:22px;overflow:hidden;
  background:var(--nu-ground);text-align:start;
  box-shadow:inset 3px 4px 10px var(--nu-shade-soft),inset -3px -3px 8px var(--nu-lit);
  -webkit-mask:linear-gradient(#000 82%,transparent);mask:linear-gradient(#000 82%,transparent)}
.door .dr-sum-in{zoom:.74;padding:14px 14px 30px;--nu-ground:#efe8dc}
.door .dr-sum-in.go{animation:drGlide 28s ease-in-out 1s infinite alternate}
@keyframes drGlide{0%,12%{transform:translateY(0)}88%,100%{transform:translateY(calc(var(--dd,0px) / .74))}}
@media (prefers-reduced-motion:reduce){.door .dr-sum-in.go{animation:none}.door .dr-sum{overflow-y:auto}}
.door .dr-sum .sm4-play,.door .dr-sum a{pointer-events:none}
.door .dr-fol-m{width:min(300px,92%);margin:18px auto 0;text-align:center}
.door .dr-fol-m small{display:block;font-size:12.5px;font-weight:700;color:var(--nu-muted);margin-bottom:4px}
.door .dr-fol-m b{display:block;font-family:"Frank Ruhl Libre",Georgia,serif;font-size:19px;font-weight:500;line-height:1.45;color:var(--nu-ink)}
`],
// 2. the folio, one builder for the sample and for her own first page
[`/* her first page, as saved: the same card "why" promised */
function doorDay1Page(){
  var r=rfRec(todayStr())||{},i,mi=-1,h;
  for(i=0;i<RF_MOODS.length;i++)if(RF_MOODS[i].v===r.mood)mi=i;
  h='<div class="dr-page dr-page1"><div class="dr-page-h"><span>'+esc(dfmt(new Date(),{weekday:'long',day:'numeric',month:'long'}))+'</span>'+
    '<span class="dr-page-s">&#10003; '+_t('סיכום יום')+'</span></div>';
  if(mi>=0)h+='<div class="dr-page-r"><span class="dr-page-f">'+rfFace(mi,RF_MOODS[mi].c,true)+'</span><b>'+esc(RF_MOODS[mi].l)+'</b></div>';
  if(r.moment)h+='<div class="dr-page-k">'+_t('הרגע הכי טוב')+'</div><div class="dr-page-v">'+esc(r.moment)+'</div>';
  return h+'</div>';
}`,
`/* a page of a day as the closed day files it: the date on a pressed plate, the
   day in a round well, and the best moment under it. The sample on "why" and her
   own first page are the same folio, so the promise and the result match. */
function doorFolio(dot,moment){
  var day=new Date(appNow());
  return '<div class="dr-fol"><span class="rfb-plate"><small>'+esc(dfmt(day,{weekday:'long'}))+'</small><b>'+esc(dfmt(day,{day:'numeric',month:'long'}))+'</b></span>'+
    '<span class="rfb-dot">'+dot+'</span><span class="rfb-spine"></span></div>'+
    (moment?'<div class="dr-fol-m"><small>'+_t('הרגע הכי טוב')+'</small><b>'+moment+'</b></div>':'');
}
/* her first page, as saved: the same folio "why" promised */
function doorDay1Page(){
  var r=rfRec(todayStr())||{},i,mi=-1;
  for(i=0;i<RF_MOODS.length;i++)if(RF_MOODS[i].v===r.mood)mi=i;
  return doorFolio(mi>=0?rfqFace(mi):'',r.moment?esc(r.moment):'');
}`],
// 3. "why": the sample is a whole day's page, drawn by the summary itself from a day
//    somebody really lived - a photograph, the moment, the numbers, a line, a song,
//    a thanks - gliding slowly past inside a window, so the promise is the real thing
[`      '<div class="dr-page"><div class="dr-page-h"><span>'+esc(dfmt(new Date(),{weekday:'long',day:'numeric',month:'long'}))+'</span>'+
      '<span class="dr-page-s">&#10003; '+_t('סיכום יום')+'</span></div>'+
      '<div class="dr-page-r"><span class="dr-page-f">'+rfFace(3,RF_MOODS[3].c,true)+'</span><b>'+esc(RF_MOODS[3].l)+'</b></div>'+
      '<div class="dr-page-k">'+_t('הרגע הכי טוב')+'</div><div class="dr-page-v">'+_t('קפה עם נועה, בשמש')+'</div></div></div>'+`,
`      '<div class="dr-sum" id="dr-sum"><div class="dr-sum-in" id="dr-sum-in">'+summaryBodyHTML(todayStr(),doorSampleDay())+'</div></div></div>'+`],
[`function summaryBodyHTML(dateStr){`,
 `/* the day "why" shows: a whole page, as somebody's real evening would leave it */
function doorSampleDay(){
  var b=liveBase()+'assets/';
  return {date:todayStr(),photo:b+'door-day.webp',photoCaption:_t('שש בבוקר, למעלה.'),
    moment:_t('הליכה בהרים, לפני שכולם קמו.'),
    mood:5,moodWords:[RF_FEEL[1],RF_FEEL[3]],dayRating:9,steps:11240,bodyFeelings:[RF_BODY[0],RF_BODY[5]],
    workoutDone:true,workout:_t('טיול בוקר'),energyGivers:[RF_ENERGY[5],RF_ENERGY[7]],selfCare:true,selfCareActivity:[RF_SELFCARE[3],RF_SELFCARE[2]],
    flow:[_t('קפה על המרפסת'),{w:_t('הליכה בהרים'),p:b+'door-song.webp'},_t('ארוחת ערב עם אמא')],
    quote:_t('לאט זה גם קדימה.'),
    song:'Here Comes the Sun',songArtist:'The Beatles',songArt:b+'door-song.webp',   // i18n-exempt: a song's own name
    proudOf:_t('שיצאתי מהמיטה גם כשהיה קר.'),
    takeawayForTomorrow:_t('להתחיל עוד בוקר בלי הטלפון.'),
    grateful:_t('על הבוקר השקט, ועל הרגליים שלקחו אותי למעלה.')};
}
/* the page glides from the photograph down to the song and back, slowly */
function doorSumGlide(){
  var f=document.getElementById('dr-sum'),i=document.getElementById('dr-sum-in');if(!f||!i)return;
  var d=Math.max(0,i.getBoundingClientRect().height-f.clientHeight);
  i.style.setProperty('--dd',(-d)+'px');i.classList.add('go');
}
function summaryBodyHTML(dateStr,given){`],
[`  var vlg=loadVlog(dateStr);
  var sum=loadSummary(dateStr);
  var jrnl=loadJournal(dateStr);`,
 `  /* given: a day that is not stored - the door's sample - drawn without the
     clip, the journal, the moments, the food or the workouts of the real date */
  var vlg=given?null:loadVlog(dateStr);
  var sum=given||loadSummary(dateStr);
  var jrnl=given?'':loadJournal(dateStr);`],
[`  sum=sumDayTotals(dateStr,sum);
  var flowStops=parseFlow(sum.flow);`,
 `  if(!given)sum=sumDayTotals(dateStr,sum);
  var flowStops=parseFlow(sum.flow);`],
[`    var _art=typeof sum.songArt==='string'&&sum.songArt.indexOf('https://')===0;`,
 `    var _art=typeof sum.songArt==='string'&&(sum.songArt.indexOf('https://')===0||!!given);`],
[`  var _wos=workoutsOn(dateStr);`, `  var _wos=given?[]:workoutsOn(dateStr);`],
[`  var _rfm=rfmLoad(dateStr);
  if(_rfm.length){`, `  var _rfm=given?[]:rfmLoad(dateStr);
  if(_rfm.length){`],
[`  if(step==='gender'||step==='why'||step==='hi')doorBeem('smile');`,
 `  if(step==='gender'||step==='why'||step==='hi')doorBeem('smile');
  /* the sample's photograph is a file, not one of hers in the photo store */
  if(step==='why'){document.querySelectorAll('#dr-sum img[data-photo]').forEach(function(im){im.src=im.getAttribute('data-photo');});setTimeout(doorSumGlide,900);}`],
// 4. mood: the porcelain faces, each in its dish
[`h+='<button class="dr-face" onclick="doorMood('+i+',this)">'+rfFace(i,RF_MOODS[i].c,true)+esc(RF_MOODS[i].l)+'</button>';`,
 `h+='<button class="dr-face" onclick="doorMood('+i+',this)"><span class="dr-dish">'+rfqFace(i)+'</span>'+esc(RF_MOODS[i].l)+'</button>';`],
// 5. moment: under the shell, written into a ruled well
[`    return '<div class="dr-body"><div class="dr-q2">'+_t('מה היה הרגע הכי טוב שלך היום?')+'</div><div class="dr-w2">'+_t('אפילו רגע קטן.')+'</div>'+
      '<textarea id="dr-mo" class="dr-field dr-area" rows="3"`,
 `    return '<div class="dr-body"><div class="dr-hero" style="background-image:url('+liveBase()+'assets/rf-q13.webp)"></div><div class="dr-q2">'+_t('מה היה הרגע הכי טוב שלך היום?')+'</div><div class="dr-w2">'+_t('אפילו רגע קטן.')+'</div>'+
      '<textarea id="dr-mo" class="dr-field dr-area dr-lined" rows="3"`],
];
let s = fs.readFileSync(F, 'utf8');
const pairs = REV ? P.map(([a, b]) => [b, a]).reverse() : P;
for (const [a, b] of pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + 'x:\n' + a.slice(0, 160)); process.exit(1); }
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log((REV ? 'reversed ' : 'applied ') + pairs.length + ' pairs to ' + F);
