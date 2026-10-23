/* The first run, walked on the iPhone from TestFlight (Asaf, 23 Oct):
 *  1. picking a language flipped the whole grid (RTL to LTR) - it read as the
 *     order changing, not as a choice being pressed. The grid is always LTR
 *     now, English first.
 *  2. Beem went up under the camera: nothing on the door counted the safe area.
 *  3. on the name screen the keyboard hid Beem; he sits under the field now.
 *  4. "מה חשוב לך?" -> "במה חשוב לך להתמקד?"
 *  5. "why" read as AI (a triad of verbs). It shows a day's page instead.
 *  6. a button that said "בוא".
 *  7. the reminder was promised, then asked for only after the first summary,
 *     and the jump into "how did you feel" was abrupt. Now: the hour, then
 *     "remind you every day?" (permission asked there), then a bridge screen,
 *     then the first summary. In the iPhone app the permission and the
 *     reminder are native local notifications - a WKWebView has no Web Push. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

/* 7 - the order of steps */
rep(`  return a.concat(['areas','why','time','timeok','mood','moment','day1','remind']);`,
    `  return a.concat(['areas','why','time','remind','bridge','mood','moment','day1']);`);
rep(`  if(step==='timeok'||step==='day1'||step==='remind')doorBeem('glad');`,
    `  if(step==='bridge'||step==='day1'||step==='remind')doorBeem('glad');
  /* the name: Beem under the field, where the keyboard will not cover him */
  var bm=document.getElementById('dr-beem');
  if(bm){bm.style.top='';bm.style.left='';}
  if(step==='name')setTimeout(function(){
    var f=document.getElementById('dr-nm'),b=document.getElementById('dr-beem');if(!f||!b)return;
    var r=f.getBoundingClientRect(),wr=w.getBoundingClientRect();
    b.style.top=(r.bottom-wr.top+18)+'px';b.style.left='calc(50% - 57px)';
  },60);`);
rep(`  if(step==='timeok'){
    return '<div class="dr-end"><div class="dr-q2">'+_t('כל יום ב־{t}. אזכיר לך.',{t:doorTime()})+'</div>'+
      '<div class="dr-sub2">'+_t('ועכשיו, בוא נסכם יחד את היום הראשון שלך. שתי שאלות קטנות.')+'</div></div>'+
      '<button class="dr-btn" onclick="doorNext()">'+_t('בוא')+'</button>';
  }`, `  if(step==='bridge'){
    /* a breath between setting things up and the first summary */
    return '<div class="dr-end"><div class="dr-q2">'+_t('ועכשיו, היום הראשון שלך.')+'</div>'+
      '<div class="dr-sub2">'+_t('שתי שאלות קטנות על היום הזה. ככה מתחיל היומן שלך.')+'</div></div>'+
      '<button class="dr-btn" onclick="doorNext()">'+_t('נתחיל')+'</button>';
  }`);
rep(`  return '<div class="dr-end"><div class="dr-q2">'+_t('להזכיר לך מחר ב־{t}?',{t:doorTime()})+'</div>'+`,
    `  return '<div class="dr-end"><div class="dr-q2">'+_t('להזכיר לך כל יום ב־{t}?',{t:doorTime()})+'</div>'+`);

/* 5 - "why": a day's page, shown rather than described */
rep(`  if(step==='why'){
    return '<div class="dr-body"><div class="dr-q2">'+_t('כמה דקות בערב.')+'<br>'+_t('יום שלם שנשמר.')+'</div><div class="dr-pts">'+
      doorPt('pause',_t('עוצרים'),_t('רגע אחד בסוף היום, רק בשבילך.'))+
      doorPt('star',_t('שמים לב'),_t('מה היה טוב, מה הרגשת, מי היה שם.'))+
      doorPt('book',_t('זוכרים'),_t('כל ערב נשמר, ויחד הם מספרים את החיים שלך.'))+
      '</div><div class="dr-how">'+_t('את כל זה עושים בשאלון קצר בסוף היום. אני שואל, אתה עונה, וזה הכול.')+'</div></div>'+
      '<button class="dr-btn" onclick="doorNext()">'+_t('הבנתי')+'</button>';
  }`, `  if(step==='why'){
    /* SHOWN, NOT DESCRIBED: the triad of verbs read as written by a machine.
       A page of a day, the way one will look, says it in one look. */
    return '<div class="dr-body"><div class="dr-q2">'+_t('בסוף כל יום, שתי דקות.')+'</div>'+
      '<div class="dr-w2">'+_t('כמה שאלות קצרות בערב, וכל יום נשמר כדף ביומן. ככה נראה דף כזה:')+'</div>'+
      '<div class="dr-page"><div class="dr-page-h"><span>'+esc(dfmt(new Date(),{weekday:'long',day:'numeric',month:'long'}))+'</span>'+
      '<span class="dr-page-s">&#10003; '+_t('סיכום יום')+'</span></div>'+
      '<div class="dr-page-r"><span class="dr-page-f">'+rfFace(3,RF_MOODS[3].c,true)+'</span><b>'+esc(RF_MOODS[3].l)+'</b></div>'+
      '<div class="dr-page-k">'+_t('הרגע הכי טוב')+'</div><div class="dr-page-v">'+_t('קפה עם נועה, בשמש')+'</div></div></div>'+
      '<button class="dr-btn" onclick="doorNext()">'+_t('נשמע טוב')+'</button>';
  }`);

/* 4 - the areas question */
rep(`_t('מה חשוב לך?')`, `_t('במה חשוב לך להתמקד?')`);

/* 1 - the language grid holds still */
rep(`    for(i=0;i<L.length;i++)h+='<button class="dr-lr'`, `    /* English first, then the rest, and the grid always left to right: a
       pick must look pressed, not reshuffle the screen when the direction flips */
    L.sort(function(x,y){return (x[0]==='en'?0:1)-(y[0]==='en'?0:1);});   // i18n-exempt: language codes
    for(i=0;i<L.length;i++)h+='<button class="dr-lr'`);
rep(`.dr-langs{display:grid;grid-template-columns:1fr 1fr;gap:10px}`,
    `.dr-langs{display:grid;grid-template-columns:1fr 1fr;gap:10px;direction:ltr}`);
rep(`h='<div class="dr-body dr-lstep"><div class="dr-q2" dir="ltr" lang="en">`, `h='<div class="dr-body dr-lstep"><div class="dr-q2" dir="ltr" lang="en">`);

/* 2 - the safe area under the camera, for everything the door positions */
rep(`.dr-beem{position:absolute;z-index:2;width:230px;height:230px;left:calc(50% - 115px);top:15%;transform-origin:0 0;`,
    `.dr-beem{position:absolute;z-index:2;width:230px;height:230px;left:calc(50% - 115px);top:15%;transform-origin:0 0;margin-top:env(safe-area-inset-top,0px);`);
rep(`.dr-well{position:absolute;z-index:1;`, `.dr-well{position:absolute;z-index:1;margin-top:env(safe-area-inset-top,0px);`);
rep(`.dr-arc{position:absolute;`, `.dr-arc{margin-top:env(safe-area-inset-top,0px);position:absolute;`);
rep(`.dr2.at-remind .dr-beem{left:calc(50% - 92px);top:12%;transform:scale(.8)}`,
    `.dr2.at-remind .dr-beem{left:calc(50% - 92px);top:12%;transform:scale(.8)}
.dr2.at-bridge .dr-beem{left:calc(50% - 115px);top:13%;transform:none}
.dr2.at-name .dr-beem{transform:scale(.5)}
.dr2.at-bridge .dr-end{padding-top:200px}
/* "why": one page of a day */
.dr-page{margin:6px auto 0;width:100%;max-width:330px;box-sizing:border-box;padding:16px 18px;border-radius:20px;text-align:start;background:#f6f1e8;
  box-shadow:-4px -4px 10px var(--nu-lit),6px 8px 18px var(--nu-shade-soft)}
.dr-page-h{display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:700;color:var(--nu-muted);margin-bottom:12px}
.dr-page-s{font-size:12px;color:#a0661f;font-weight:800}
.dr-page-r{display:flex;align-items:center;gap:10px;font-size:16px;margin-bottom:12px}
.dr-page-f svg{width:34px;height:34px;fill:none;stroke-width:1.7;stroke-linecap:round}
.dr-page-k{font-size:12.5px;font-weight:700;color:var(--nu-muted)}
.dr-page-v{font-size:17px;font-weight:800;line-height:1.4}`);

/* 7 - native reminders: the iPhone app has no Web Push, it has local
   notifications. Fourteen days ahead, each on the app's own day, skipping a
   day already summarised; re-laid on every open, on every change and when
   the evening is summarised. */
rep(`function sumRemAsk(){`, `function remNative(){
  var C=window.Capacitor;
  return (C&&C.isNativePlatform&&C.isNativePlatform()&&C.Plugins&&C.Plugins.LocalNotifications)||null;
}
function remNativeSync(){
  var LN=remNative();if(!LN)return;
  var o=loadSumRem();
  LN.getPending().then(function(p){
    var ids=((p&&p.notifications)||[]).map(function(n){return {id:n.id};});
    return ids.length?LN.cancel({notifications:ids}):null;
  }).then(function(){
    if(!o.on)return;
    var hm=String(o.time||'21:00').split(':'),out=[],i,d,day;
    for(i=0;i<15;i++){
      d=new Date(Date.now()+i*86400000);d.setHours(+hm[0]||0,+hm[1]||0,0,0);
      if(d.getTime()<=Date.now()+30000)continue;
      day=appDayOf(d);if(rfDone(rfRec(day)))continue;
      out.push({id:100+i,title:sumRemTitle(),body:sumRemMsg(),schedule:{at:d,allowWhileIdle:true}});
    }
    return out.length?LN.schedule({notifications:out}):null;
  }).catch(function(){});
}
function remNativeAsk(){
  var LN=remNative();if(!LN)return;
  LN.requestPermissions().then(function(r){
    var ok=r&&r.display==='granted';
    showToast(ok?_t('✓ התראות מאושרות'):_t('ההתראות חסומות בהגדרות הטלפון. אפשר לאפשר אותן שם.'));
    if(ok)remNativeSync();
  }).catch(function(){});
}
document.addEventListener('visibilitychange',function(){if(!document.hidden)try{remNativeSync();}catch(e){}});
window.addEventListener('load',function(){setTimeout(function(){try{remNativeSync();}catch(e){}},2000);});
function sumRemAsk(){
  if(remNative()){remNativeAsk();return;}`);
rep(`function sumRemPushSync(){
  var o=loadSumRem();`, `function sumRemPushSync(){
  if(remNative()){remNativeSync();return;}
  var o=loadSumRem();`);
rep(`  if(o.on&&('Notification' in window)&&Notification.permission==='default')sumRemAsk();
  renderSumRem();`, `  if(o.on&&(remNative()||(('Notification' in window)&&Notification.permission==='default')))sumRemAsk();
  renderSumRem();`);
rep(`      if(!('Notification' in window))showToast(_t('כדי לקבל תזכורת בטלפון, צריך להוסיף את האפליקציה למסך הבית.'));`,
    `      if(remNative())sumRemAsk();
      else if(!('Notification' in window))showToast(_t('כדי לקבל תזכורת בטלפון, צריך להוסיף את האפליקציה למסך הבית.'));`);
/* a summarised evening takes its own reminder off */
rep(`  try{if(_rfDate===todayStr())usageNote('sum');}catch(e){}`,
    `  try{if(_rfDate===todayStr())usageNote('sum');}catch(e){}
  try{remNativeSync();}catch(e){}`);
fs.writeFileSync(F, s);
console.log('patched');
