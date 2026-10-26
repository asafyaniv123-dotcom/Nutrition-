/* 6B (Asaf, 26 Oct): the first time a person enters an area, Mip - the one in
 * the corner - explains it, and then points at the things nobody finds alone:
 * in planning the text line, the planner, the + and swiping to delete; in the
 * closet the + and scrolling a row; and so on for every area. The home tour's
 * engine and material, with the corner Mip as the speaker (his circle stays lit
 * beside each target). A step whose element is not on screen is skipped, so a
 * fresh area shows only what it has. Once per area; only for people who came
 * through the new door (FIRST_RUN_KEY), never for someone already living in it.
 * Waits for the one-time setup questions, and for the home tour. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

rep(`  if(mod==='nutrition'||mod==='fitness')setTimeout(function(){asetMaybe(mod);},350);`,
  `  if(mod==='nutrition'||mod==='fitness')setTimeout(function(){asetMaybe(mod);},350);
  setTimeout(function(){areaTourMaybe(mod);},1100);`);

rep(`/* ── BEEM, THE HELPER ── in the corner of every screen;`, `/* ── MIP SHOWS EACH AREA ── once, on the first entry (6B, 26.10). A step is
   asked for when it is shown, like the home tour's: a list of translated
   strings is one refactor from being compared against. */
var AREA_TOUR_KEY='area_tour_done';
function areaTourStep(a,i){
  var S=null;
  if(a==='nutrition')S=[
    [null,_t('זה אזור התזונה.'),_t('כאן רושמים מה אכלת, ואני סופר קלוריות, חלבון ומים מול המטרות שלך.')],
    ['.co-bar',_t('פשוט כותבים מה אכלת.'),_t('במילים רגילות, כמו "2 ביצים וטוסט". אני מפרק את זה לקלוריות ולחלבון. אפשר גם לשאול אותי על אוכל.')],
    ['.co-cam',_t('או מצלמים את הצלחת.'),_t('תמונה אחת או כמה, ואני מזהה מה יש בה.')],
    ['.kind-row',_t('הארוחות של היום.'),_t('לחיצה על ארוחה ריקה מוסיפה אותה. לחיצה ארוכה על ארוחה שנרשמה פותחת עריכה, העתקה או מחיקה.')],
    ['.tabs',_t('ולמעלה עוד שלושה מקומות.'),_t('ההיסטוריה של הימים הקודמים, מתכונים, ו"אישי" עם המטרות.')]];
  if(a==='fitness')S=[
    [null,_t('זה אזור הכושר.'),_t('כאן בונים תוכניות אימון, רושמים כל אימון ורואים איך מתחזקים.')],
    ['.fh',_t('מתחילים אימון כאן.'),_t('מתוכנית שלך, אימון ריק, אימון מהיר שאני מרכיב לפי זמן וציוד, או תוכנית שלמה שאני בונה.')],
    ['.fwk-tap',_t('השבוע שלך.'),_t('לחיצה פותחת את לוח האימונים: באילו ימים, ומה בכל יום.')],
    ['.ftk',_t('המעקב.'),_t('משקלות, צעדים, היסטוריה והתקדמות, במקום אחד.')],
    ['.fr-list',_t('וכלים לאימון.'),_t('טיימרים לאינטרוולים ולטבטה, וסרטונים ששמרת.')]];
  if(a==='closet')S=[
    [null,_t('זה הארון.'),_t('כאן מצלמים את הבגדים, מרכיבים מהם לוקים, ורואים מה באמת לובשים.')],
    ['.cl-empty,.cl-add',_t('מוסיפים בגד עם ה־+.'),_t('מצלמים, או בוחרים כמה תמונות בבת אחת. כדאי לצלם כל בגד מאותו מרחק.')],
    ['.cl-track',_t('גוללים כל שורה הצידה.'),_t('מה שעומד באמצע כל שורה הוא מה שלובשים, וכל השורות יחד הן הלוק.')],
    ['.cl-b1',_t('ומכאן הלוק.'),_t('לערבב הכול, לשמור לוק, ולרשום מה לבשת היום.')],
    ['.cl-seasons',_t('עונות.'),_t('מסננים לפי עונה, ובגד שמוסיפים כשעונה מסומנת נשמר בה.')]];
  if(a==='planning')S=[
    [null,_t('זה תכנון הזמן.'),_t('כאן מתכננים את השבוע ואת היום שאחרי, ואני מזכיר כשמגיע הזמן.')],
    ['#psay',_t('אפשר פשוט לכתוב.'),_t('במילים רגילות, כמו "כל רביעי 9–10 מדיטציה". אני מבין משימה חד־פעמית או קבועה, שעות וטווחים, וגם "להוריד מהלוח".')],
    ['.pb-lamp',_t('או לתת למתכנן לבנות.'),_t('מספרים לו מה יש השבוע, והוא מחזיר לוח שלם. אחר כך מאשרים מה נכנס.')],
    ['#plan-sec-week .pl-add',_t('ה־+ מחזיק משימות בצד.'),_t('כותבים משימה ב־+, והיא מחכה בשורה. משם גוררים אותה ליום ולשעה.')],
    ['#plan-sec-week',_t('ולמחוק? מחליקים.'),_t('גוררים משימה לפח, או מחליקים אותה הצידה, והיא יורדת מהלוח. החלקה על הלוח עצמו מעבירה שבוע.')],
    ['.pl-door',_t('חודש, שבוע ויום.'),_t('לחיצה על כל אחד פותחת או סוגרת את הלוח שלו.')]];
  if(a==='people')S=[
    [null,_t('אלה האנשים שלך.'),_t('כאן שומרים את מי שחשוב: מה קורה איתו, ימי הולדת, ומתי דיברתם לאחרונה.')],
    ['.pp-add',_t('מוסיפים אדם.'),_t('שם, מה הוא בשבילך, וכל כמה זמן לדבר איתו. כשעובר זמן, אני מזכיר.')],
    ['#ppl-q',_t('מחפשים ומסדרים.'),_t('לפי שם, מקום או תפקיד, או לפי מי שהכי מזמן.')],
    ['.pp-row',_t('לחיצה על אדם פותחת את הדף שלו.'),_t('שם רושמים שיחה, זיכרונות ותאריכים חשובים.')]];
  if(a==='hobbies')S=[
    [null,_t('אלה התחביבים.'),_t('כאן עוקבים אחרי מה שאוהבים לעשות: כמה זמן, כמה פעמים, ואיך זה מתקדם.')],
    ['.hb-first,.hb-addp',_t('מוסיפים תחביב.'),_t('שלוש שאלות: מה זה, איך מודדים, ומה היעד.')],
    ['.hbt-bars',_t('לחיצה על עמודה רושמת.'),_t('תחביב של כן או לא נרשם מיד. אחרים פותחים כמות או טיימר.')],
    ['#hb-map',_t('מפת השנה.'),_t('לחיצה על יום מוסיפה זמן ליום שעבר.')]];
  if(a==='insights')S=[
    [null,_t('אלה התובנות.'),_t('כאן נשמרות מחשבות, שאלות וגילויים, כדי שלא ילכו לאיבוד.')],
    ['.ins-grid',_t('בוחרים נושא.'),_t('בכל נושא יש שאלות שעוזרות לחשוב. בכל שאלה מוסיפים תובנה, ואפשר גם לרשום "שיניתי דעה".')]];
  if(a==='endofday')S=[
    ['.rf-next',_t('זה סיום היום.'),_t('כל ערב כמה שאלות קצרות על היום. זה הלב של האפליקציה: מכאן אני לומד מה עובד בשבילך.')],
    ['#rf-vlog',_t('יומן וידאו.'),_t('כמה שניות מול המצלמה על היום.')],
    ['#rfm-in',_t('דברים לזכור.'),_t('רגע קטן מהיום? רושמים כאן, והוא מחכה לסיכום של הערב.')],
    ['.rf-secs-b',_t('ומה נשאל.'),_t('בוחרים אילו שאלות יופיעו כל ערב, ומה ייכנס לסיכום.')]];
  if(!S)return null;
  if(i==='n')return S.length;
  return S[i]?{el:S[i][0],t:S[i][1],d:S[i][2]}:null;
}
function areaTourSeen(a){try{return !!(JSON.parse(localStorage.getItem(AREA_TOUR_KEY)||'{}')||{})[a];}catch(e){return true;}}
function areaTourMark(a){var o={};try{o=JSON.parse(localStorage.getItem(AREA_TOUR_KEY)||'{}')||{};}catch(e){}o[a]=1;try{localStorage.setItem(AREA_TOUR_KEY,JSON.stringify(o));}catch(e){}}
function areaTourMaybe(a,tries){
  try{if(!localStorage.getItem(FIRST_RUN_KEY))return;}catch(e){return;}
  if(areaTourSeen(a)||!areaTourStep(a,'n'))return;
  if(typeof currentModule!=='undefined'&&currentModule!==a)return;
  /* the setup questions, the home tour or a sheet first - then try again */
  if(document.getElementById('as-ov')||document.getElementById('tour')||document.querySelector('.bms')){
    if((tries||0)<40)setTimeout(function(){areaTourMaybe(a,(tries||0)+1);},1500);return;
  }
  areaTour(a);
}
function areaTour(a){
  var N=areaTourStep(a,'n'),k=0,w=document.createElement('div');
  w.className='tour';w.id='tour';
  w.innerHTML='<svg><path id="tour-hole" fill-rule="evenodd"/></svg><div class="tour-c" id="tour-c"><div class="tour-r"><div class="tour-b" id="tour-b"></div>'+
    '<div><div class="tour-t" id="tour-t"></div><div class="tour-d" id="tour-d"></div></div></div>'+
    '<div class="tour-f"><div class="tour-dots" id="tour-dots"></div><div><button class="tour-x" id="tour-x">'+_t('דלג')+'</button>'+
    '<button class="tour-n" id="tour-n"></button></div></div></div>';
  document.body.appendChild(w);
  var B=null;
  function circ(cx,cy,r){return 'M'+(cx-r)+' '+cy+'a'+r+' '+r+' 0 1 0 '+(2*r)+' 0a'+r+' '+r+' 0 1 0 '+(-2*r)+' 0Z';}
  function rr(x,y,ww,hh,r){r=Math.min(r,hh/2,ww/2);return 'M'+(x+r)+' '+y+'h'+(ww-2*r)+'a'+r+' '+r+' 0 0 1 '+r+' '+r+'v'+(hh-2*r)+'a'+r+' '+r+' 0 0 1 '+(-r)+' '+r+
    'h'+(2*r-ww)+'a'+r+' '+r+' 0 0 1 '+(-r)+' '+(-r)+'v'+(2*r-hh)+'a'+r+' '+r+' 0 0 1 '+r+' '+(-r)+'Z';}
  /* the corner Mip is the speaker wherever he is on screen */
  function corner(){var c=document.getElementById('bhelp');if(!c)return null;var r=c.getBoundingClientRect();
    return (r.width&&getComputedStyle(c).opacity!=='0')?r:null;}
  function show(){
    var st=areaTourStep(a,k);
    while(st&&st.el&&!document.querySelector(st.el)){k++;st=areaTourStep(a,k);}
    if(!st)return end();
    var W=innerWidth,H=innerHeight,cr=corner(),hole='',top,e=st.el?document.querySelector(st.el):null;
    if(e){try{e.scrollIntoView({block:'center'});}catch(er){}}
    if(cr)hole+=circ(cr.left+cr.width/2,cr.top+cr.height/2,cr.width/2+8);
    if(e){
      var b=e.getBoundingClientRect(),bt=Math.max(b.top,6),bb=Math.min(b.bottom,H-6);
      hole+=rr(b.left-6,bt-6,b.width+12,bb-bt+12,22);
      top=(bb+16+210<H)?bb+16:Math.max(12,bt-226);
    }else top=cr?cr.bottom+22:120;
    document.getElementById('tour-hole').setAttribute('d','M0 0H'+W+'V'+H+'H0Z'+hole);
    document.getElementById('tour-c').style.top=Math.min(top,H-230)+'px';
    document.getElementById('tour-t').textContent=st.t;document.getElementById('tour-d').textContent=st.d;
    var h='',i;for(i=0;i<N;i++)h+='<i'+(i===k?' class="on"':'')+'></i>';document.getElementById('tour-dots').innerHTML=h;
    var last=!areaTourNext(k);
    document.getElementById('tour-n').textContent=last?_t('הבנתי'):_t('הבא');
    document.getElementById('tour-x').style.visibility=last?'hidden':'';
    /* with the corner Mip lit, he speaks; without him (סיום יום), Mip in the card */
    var tb=document.getElementById('tour-b');tb.style.display=cr?'none':'';
    if(cr){try{if(_bhelp.B)_bhelp.B.play(k%2?DOOR_BEEM.nod:DOOR_BEEM.glad);}catch(er){}}
    else if(!B)beemKit().then(function(K){B=K.mount(tb,{play:DOOR_BEEM.smile});}).catch(function(){});
    else try{B.play(k%2?DOOR_BEEM.nod:DOOR_BEEM.glad);}catch(er){}
  }
  function areaTourNext(i){for(var j=i+1;j<N;j++){var x=areaTourStep(a,j);if(x&&(!x.el||document.querySelector(x.el)))return true;}return false;}
  function hold(ev){if(document.getElementById('tour')&&!(ev.target.closest&&ev.target.closest('.tour-c'))){ev.stopPropagation();ev.preventDefault();}}
  document.addEventListener('click',hold,true);
  function end(){areaTourMark(a);document.removeEventListener('click',hold,true);var t=document.getElementById('tour');if(t)t.remove();}
  document.getElementById('tour-n').onclick=function(){k++;if(k>=N)end();else show();};
  document.getElementById('tour-x').onclick=end;
  show();
}
/* ── BEEM, THE HELPER ── in the corner of every screen;`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
