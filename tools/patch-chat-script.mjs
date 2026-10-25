/* chat prototype, round 5 (Asaf: "make sure every area is precise and the
 * questions are really relevant - the person can even choose from existing
 * questions - and make the chat's answers precise").
 * Every suggestion now names something its area actually does (from
 * push-server/beem-guide.md, which is written from the code), and each has
 * its own answer instead of one answer per area: what gets saved, where, and
 * the numbers worked out (two eggs fried in a teaspoon of oil and two slices
 * of wholemeal bread is 330 kcal, 20 g protein; 3 x 8 at 60 kg is 1,440 kg).
 * An answer that saves something shows "saved in ..."; an answer that only
 * tells you something shows its card without it. Nothing invents a time
 * the person did not say (a task with no hour lands on today, no hour).
 * The questions stay available after the first one: the ones not asked yet
 * sit in one row above the writing line. */
import fs from 'fs';
const F = 'review/chat-proto/index.html';
let s = fs.readFileSync(F, 'utf8');
const cut = (a, b, by) => { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) { console.log('ANCHOR ' + a.slice(0, 50)); process.exit(1); } s = s.slice(0, i) + by + s.slice(j); };

/* the areas and their questions */
cut('var AREAS=[', 'var ICON={},COL={};', `/* [key, name, question when empty, suggestions] - each suggestion is
   something the area really does, and has its own answer in SCRIPT */
var AREAS=[['nutrition','תזונה','מה אכלת היום?',['אכלתי חביתה משתי ביצים ושתי פרוסות','כמה חלבון נשאר לי היום?','שתיתי 2 כוסות מים','שקלתי 72.4']],
  ['fitness','כושר','מה עשית היום?',['סקוואט 3×8 ב-60 קילו','מה האימון הבא שלי?','בנה לי אימון של 30 דקות','הלכתי היום 6,000 צעדים']],
  ['planning','תכנון זמן','מה צריך לעשות?',['מחר ב-10 רופא שיניים','כל רביעי 9–10 מדיטציה','לזכור להתקשר לאמא','מה יש לי היום?']],
  ['people','האנשים שלי','על מי נדבר?',['דיברתי עם נועה בטלפון','נועה התחילה עבודה חדשה','למי לא התקשרתי מזמן?']],
  ['hobbies','תחביבים','במה התעסקת היום?',['ניגנתי גיטרה חצי שעה','קראתי 20 עמודים','כמה ניגנתי השבוע?']],
  ['closet','הארון שלי','מה נלבש?',['תרכיב לי לוק להיום','לבשתי היום את הלוק הכחול','מה לא לבשתי הרבה זמן?']],
  ['insights','תובנות','על מה תרצה לכתוב?',['תן לי שאלה לכתוב עליה','למדתי היום שאני צריך יותר שקט בבוקר','מה כתבתי בחודש האחרון?']],
  ['endofday','סיום יום','איך היה היום?',['בוא נסכם את היום','הרגע הכי טוב היום: ארוחת ערב עם המשפחה','איך הרצף שלי?']]];
var GENERAL=['אכלתי חביתה משתי ביצים ושתי פרוסות','מחר ב-10 רופא שיניים','נועה התחילה עבודה חדשה','שתיתי 2 כוסות מים'];
`);
/* the suggestions: before the first word, the full set; after it, one row of
   the ones not asked yet */
cut('function drawSug(){', 'function sizeDock(){', `function drawSug(){
  var list=cur?area(cur)[3]:GENERAL,asked=(talk.textContent||'');
  if(started)list=list.filter(function(q){return asked.indexOf(q)<0;});
  sug.classList.toggle('one',started);
  sug.innerHTML=list.map(function(q){return '<button onclick="say(this.textContent)">'+q+'</button>';}).join('');sizeDock();}
`);
/* the answers */
cut('/* scripted answers: what was said, and where it landed */', 'function reset(){', `/* scripted answers, one per question: the words, where it landed, and a
   card - [title, detail, saved?]. In the general chat the answer says which
   area took it. */
var SCRIPT={
  'אכלתי חביתה משתי ביצים ושתי פרוסות':['nutrition','רשמתי בארוחת בוקר: חביתה משתי ביצים (עם כפית שמן) ושתי פרוסות לחם מלא. יחד 330 קק״ל ו-20 גרם חלבון.',['ארוחת בוקר · 330 קק״ל','חלבון 20 · פחמימה 27 · שומן 16',1]],
  'כמה חלבון נשאר לי היום?':['nutrition','אכלת עד עכשיו 64 גרם מתוך 120. נשארו 56 - למשל 150 גרם חזה עוף מבושל (46 גרם) ויוגורט חלבון (10 גרם).',['חלבון היום','64 מתוך 120 ג׳ · נשארו 56',0]],
  'שתיתי 2 כוסות מים':['nutrition','הוספתי 500 מ״ל. היום 1.5 ליטר מתוך 2.5.',['מים · +500 מ״ל','1.5 מתוך 2.5 ליטר',1]],
  'שקלתי 72.4':['nutrition','רשמתי שקילה: 72.4 ק״ג, 0.3 פחות מהשקילה הקודמת. המגמה בשבועיים האחרונים יורדת לאט, כ-0.2 ק״ג בשבוע.',['שקילה · 72.4 ק״ג','‎−0.3 מהקודמת · מגמה יורדת',1]],
  'סקוואט 3×8 ב-60 קילו':['fitness','רשמתי: סקוואט, 3 סטים של 8 ב-60 ק״ג. נפח 1,440 ק״ג. השיא הקודם שלך היה 57.5 - זה שיא חדש.',['סקוואט · 3×8 · 60 ק״ג','נפח 1,440 ק״ג · שיא חדש',1]],
  'מה האימון הבא שלי?':['fitness','לפי התוכנית שלך (Full Body, שלוש פעמים בשבוע) הבא הוא אימון B ביום שלישי: לחיצת חזה, חתירה בכבל, מכרעים ופלאנק. בערך 45 דקות.',['אימון B · יום שלישי','4 תרגילים · כ-45 דקות',0]],
  'בנה לי אימון של 30 דקות':['fitness','בניתי אימון של 30 דקות לפי מה שחסר לך השבוע - גב ורגליים: דדליפט רומני 3×10, חתירה בכבל 3×12, לאנג׳ים 3×10 לכל רגל. מנוחה של דקה בין סטים.',['אימון שנבנה לך · 30 דק׳','גב ורגליים · 3 תרגילים',1]],
  'הלכתי היום 6,000 צעדים':['fitness','רשמתי 6,000 צעדים להיום.',['צעדים · 6,000','היום',1]],
  'מחר ב-10 רופא שיניים':['planning','הוספתי למחר, יום שני: רופא שיניים, 10:00–11:00.',['רופא שיניים','מחר · 10:00–11:00',1]],
  'כל רביעי 9–10 מדיטציה':['planning','הוספתי מדיטציה בכל יום רביעי, 9:00–10:00. הראשונה ביום רביעי הקרוב.',['מדיטציה · כל רביעי','9:00–10:00 · חוזר',1]],
  'לזכור להתקשר לאמא':['planning','הוספתי להיום, בלי שעה: להתקשר לאמא. אם תגיד שעה, אשים אותה בלוח.',['להתקשר לאמא','היום · בלי שעה',1]],
  'מה יש לי היום?':['planning','היום: 09:00 ישיבת צוות, 13:00 ארוחת צהריים עם דני, 18:30 אימון. ובלי שעה: להתקשר לאמא.',['היום','3 בלוח · 1 בלי שעה',0]],
  'דיברתי עם נועה בטלפון':['people','רשמתי שיחה עם נועה. הפעם הקודמת הייתה לפני 12 יום.',['נועה · שיחה','היום',1]],
  'נועה התחילה עבודה חדשה':['people','שמרתי בדף של נועה, תחת "משהו שאני רוצה לזכור": התחילה עבודה חדשה.',['נועה · לזכור','התחילה עבודה חדשה',1]],
  'למי לא התקשרתי מזמן?':['people','אולי הגיע הזמן לבדוק מה שלום דני - עברו 5 שבועות, וביקשת תזכורת כל 3. וסבתא - 16 יום, תזכורת כל שבועיים.',['הגיע הזמן','דני · סבתא',0]],
  'ניגנתי גיטרה חצי שעה':['hobbies','הוספתי 30 דקות לגיטרה. השבוע: שעה וחצי.',['גיטרה · 30 דק׳','השבוע: 1:30',1]],
  'קראתי 20 עמודים':['hobbies','הוספתי 20 עמודים לקריאה. היום 20 מתוך היעד של 25.',['קריאה · 20 עמודים','היום: 20 מתוך 25',1]],
  'כמה ניגנתי השבוע?':['hobbies','השבוע ניגנת שעה וחצי, בשלושה ימים. בשבוע שעבר: שעה ורבע.',['גיטרה · השבוע','1:30 · שלושה ימים',0]],
  'תרכיב לי לוק להיום':['closet','מהארון שלך: החולצה הלבנה, הג׳ינס הכהה והסניקרס הלבנות. אף אחד מהם לא נלבש השבוע.',['לוק להיום','חולצה לבנה · ג׳ינס כהה · סניקרס',0]],
  'לבשתי היום את הלוק הכחול':['closet','סימנתי שלבשת היום את "הלוק הכחול". זו הפעם השלישית ב-30 הימים האחרונים.',['הלוק הכחול · נלבש היום','3 פעמים ב-30 יום',1]],
  'מה לא לבשתי הרבה זמן?':['closet','שלושה פריטים לא נלבשו 30 יום: הז׳קט האפור, המכנסיים הירוקים והחולצה המשובצת.',['לא נלבשו 30 יום','3 פריטים',0]],
  'תן לי שאלה לכתוב עליה':['insights','מתוך "רגשות ותודעה": מה הרגש שהכי ליווה אותך השבוע, ומאיפה הוא הגיע?',['רגשות ותודעה','שאלה לכתיבה',0]],
  'למדתי היום שאני צריך יותר שקט בבוקר':['insights','שמרתי תחת "אני", עם התאריך של היום.',['אני · תובנה','היום',1]],
  'מה כתבתי בחודש האחרון?':['insights','בחודש האחרון כתבת 6 פעמים - שלוש ב"אני", שתיים ב"אנשים" ואחת ב"הצלחה ועשייה". האחרונה לפני ארבעה ימים.',['החודש','6 רשומות',0]],
  'בוא נסכם את היום':['endofday','בוא. השאלה הראשונה: מה היה הרגע הטוב ביותר היום?',['סיכום היום','נפתח · 1 מתוך 4',0]],
  'הרגע הכי טוב היום: ארוחת ערב עם המשפחה':['endofday','שמרתי כרגע הטוב של היום. השאלה הבאה: יש תמונה מהיום?',['הרגע הטוב ביותר','ארוחת ערב עם המשפחה',1]],
  'איך הרצף שלי?':['endofday','11 ימים ברצף. יום החסד זמין - אם תפספס ערב אחד, הרצף ממשיך.',['רצף · 11 ימים','יום החסד זמין',0]]};
/* a typed sentence: the question it is closest to, else a plain answer */
function match(t){
  if(SCRIPT[t])return t;
  var best='',score=0,words=t.split(/\\s+/).filter(function(w){return w.length>2;});
  Object.keys(SCRIPT).forEach(function(q){
    if(cur&&SCRIPT[q][0]!==cur)return;
    var n=words.filter(function(w){return q.indexOf(w)>=0;}).length;
    if(n>score){score=n;best=q;}
  });
  return score?best:'';
}
function avatar(){return cur?'<i class="av area" style="--c:'+COL[cur]+'">'+(ICON[cur]||'')+'</i>':'<i class="av"></i>';}
function say(t){
  if(!started){started=true;empty.classList.add('gone');}
  var m=document.createElement('div');m.className='me';m.textContent=t;talk.appendChild(m);
  drawSug();
  var w=document.createElement('div');w.className='it';w.innerHTML=avatar()+'<div class="dots"><i></i><i></i><i></i></div>';talk.appendChild(w);talk.scrollTop=1e5;
  setTimeout(function(){
    var q=match(t),r=q&&SCRIPT[q];
    if(!r){w.innerHTML=avatar()+'<div>'+(cur?'אפשר לבחור באחת השאלות למטה, או לספר במילים שלך.':'אני כאן. ספר מה קרה, או בחר אזור למטה.')+'</div>';talk.scrollTop=1e5;return;}
    var k=r[0],a=area(k),c=r[2];
    var where=!cur&&c[2]?'<span class="to">'+a[1]+'</span>':'';
    w.innerHTML=avatar()+'<div>'+r[1]+'<div class="logged"><span class="ic" style="color:'+COL[k]+'">'+(ICON[k]||'')+'</span><div>'+c[0]+'<small>'+(c[2]?'נשמר ב'+a[1]+' · ':'')+c[1]+'</small></div></div></div>';
    talk.scrollTop=1e5;
  },900);
}
`);
/* one row of what is left, once the talk has started */
s = s.replace('.sug button{border:none;', '.sug.one{flex-wrap:nowrap;justify-content:flex-start;overflow-x:auto;scrollbar-width:none}\n.sug.one::-webkit-scrollbar{display:none}\n.sug.one button{flex:none}\n.sug button{border:none;');
fs.writeFileSync(F, s);
console.log('ok');
