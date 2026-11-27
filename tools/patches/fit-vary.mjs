/* Asaf, 27 Nov, approved on its review page: training that changes every week (Pilates booked at the
 * start of the week) and training that does not (swimming on Monday and Thursday). Each other training
 * answers "the same days every week?": fixed picks its days once, changing is asked on top of כושר at
 * the start of each week, and strength is placed around both - spread, no two in a row where it can
 * be helped. And the plan loses its grey paragraphs: the caveats, the "tap a day" hint, the "start
 * without a plan" explanation; a plan too thin for growth offers one more workout as a button.
 * Built by scratchpad mk-fitvary.mjs from byte-exact slices of dev/index.html.
 * Run: node tools/patches/fit-vary.mjs [file] [--reverse]
 */
import fs from 'node:fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';
const PAIRS = [
 [
  "if(!o.otherDone)out.push('other','otherN','days');",
  "if(!o.otherDone)out.push('other','oMode','oDays','otherN','days');"
 ],
 [
  "other:(o.other||[]).slice(),otherN:+o.otherN||0}};",
  "other:(o.other||[]).slice(),otherN:+o.otherN||0,oMode:Object.assign({},o.oMode||{}),oFix:JSON.parse(JSON.stringify(o.oFix||{}))}};"
 ],
 [
  "function asetOthN(){var t=_aset&&_aset.t;return t&&t.other&&t.other.length&&t.other.indexOf('none')<0?(+t.otherN||0):0;}",
  "/* the other training she chose, all of it or only the fixed ('f') or changing ('v') ones */\nfunction asetOth(kind){var t=_aset&&_aset.t;if(!t||!t.other)return [];\n  return t.other.filter(function(x){return x!=='none'&&(!kind||t.oMode[x]===kind);});}   // i18n-exempt: a stored key\n/* how many days of the week it takes: the fixed days counted, plus how often the changing ones come */\nfunction asetOthN(){var t=_aset&&_aset.t,n=0;if(!t||!asetOth().length)return 0;\n  asetOth('f').forEach(function(x){n+=(t.oFix[x]||[]).length;});\n  if(asetOth('v').length)n+=(+t.otherN||0);return n;}\nfunction asetMode(x,v){_aset.t.oMode[x]=v;asetPaint();}\nfunction asetFix(x,d){var F=_aset.t.oFix,L=F[x]=(F[x]||[]),j=L.indexOf(d);if(j>=0)L.splice(j,1);else L.push(d);L.sort();asetPaint();}"
 ],
 [
  "if(k==='otherN')return !t.other.length||t.other.indexOf('none')>=0;",
  "if(k==='oMode')return !asetOth().length;if(k==='oDays')return !asetOth('f').length;if(k==='otherN')return !asetOth('v').length;"
 ],
 [
  "if(k==='otherN')return t.otherN>0;",
  "if(k==='otherN')return t.otherN>0;if(k==='oMode')return asetOth().every(function(x){return !!t.oMode[x];});if(k==='oDays')return asetOth('f').every(function(x){return (t.oFix[x]||[]).length>0;});"
 ],
 [
  "  if(k==='otherN'){q=_t('כמה מהם בשבוע?');",
  "  if(k==='otherN'){q=asetOth('v').length===1?_t('כמה פעמים בשבוע {name}?',{name:wtLabel(asetOth('v')[0])}):_t('כמה מהם בשבוע?');"
 ],
 [
  "  if(k==='minutes'){q=fitMeQuestion('minutes');",
  "  /* each other training answers for itself: the same days every week, or different ones */\n  if(k==='oMode'){q=_t('באותם ימים כל שבוע?');\n    asetOth().forEach(function(x){body+='<div class=\"as-oml\">'+esc(wtLabel(x))+'</div><div class=\"as-grid as-om\">'+\n      [['f',_t('קבוע|ימים'),_t('בוחרים ימים פעם אחת')],['v',_t('משתנה|ימים'),_t('אשאל בתחילת כל שבוע')]].map(function(o){\n        return '<button class=\"dr-r2 as-o'+(t.oMode[x]===o[0]?' on':'')+'\" onclick=\"asetMode(\\''+x+'\\',\\''+o[0]+'\\')\"><b>'+o[1]+'</b><span>'+o[2]+'</span></button>';}).join('')+'</div>';});}\n  if(k==='oDays'){q=_t('באילו ימים?');var WL=fitWdLbls();\n    asetOth('f').forEach(function(x){var L=t.oFix[x]||[];body+='<div class=\"as-oml\">'+esc(wtLabel(x))+'</div><div class=\"as-wd\">';\n      for(var wd=0;wd<7;wd++)body+='<button class=\"dr-r2 as-o'+(L.indexOf(wd)>=0?' on':'')+'\" onclick=\"asetFix(\\''+x+'\\','+wd+')\"><b>'+esc(WL[wd])+'</b></button>';\n      body+='</div>';});}\n  if(k==='minutes'){q=fitMeQuestion('minutes');"
 ],
 [
  "o.otherN=o.other.length&&t.days>1?Math.max(1,Math.min(t.otherN||1,t.days-1)):0;o.otherDone=1;}",
  "o.otherN=o.other.length?Math.max(0,Math.min(asetOthN(),t.days-1)):0;o.oMode={};o.oFix={};\n      o.other.forEach(function(x){if(t.oMode[x])o.oMode[x]=t.oMode[x];if(t.oMode[x]==='f')o.oFix[x]=(t.oFix[x]||[]).slice();});o.otherDone=1;}"
 ],
 [
  "/* the weekdays (0 = Sunday) a week of n sessions lands on */\nvar fitWeekSlots=[[],[1],[1,4],[0,2,4],[0,1,3,4],[0,1,2,4,5],[0,1,2,3,4,5]];\nfunction fitWeekFor(p,me){\n  me=me||fitMe();\n  var d=Math.max(1,Math.min(6,+me.days||3)),S=Math.min(d,fitStrengthDays(me)),oth=me.other||[],slots=fitWeekSlots[d],\n      wk=[],isS={},days=[],i,si=0,oi=0;\n  for(i=0;i<p.exercises.length;i++)if(days.indexOf(p.exercises[i].day||'')<0)days.push(p.exercises[i].day||'');\n  for(i=0;i<7;i++)wk.push({type:'rest'});\n  for(i=0;i<S;i++)isS[Math.floor(i*d/S)]=1;\n  for(i=0;i<slots.length;i++){\n    if(isS[i]){wk[slots[i]]={type:'strength',label:'',prog:p.id,pday:days[si%days.length]};si++;}\n    else if(oth.length){wk[slots[i]]={type:oth[oi%oth.length],label:''};oi++;}\n  }\n  return wk;\n}",
  "/* THE WEEK IS PLACED, NOT LAID ON SLOTS (27 Nov). Fixed training sits on its own days; changing\n   training sits where she said it is THIS week (or last week, until she says); what she changed by\n   hand stays; strength takes the free days spread as far apart as they go - no two in a row where it\n   can be helped, Saturday last; and changing training not placed yet fills what is left. */\nfunction fitWdLbls(){\n  var n=[],s=[],i;for(i=0;i<7;i++){var d=dayShift(i-appNow().getDay())+'T12:00:00';n.push(dfmt(d,{weekday:'narrow'}));s.push(dfmt(d,{weekday:'short'}));}\n  /* S and S, T and T: a narrow letter that repeats is not a choice */\n  return n.filter(function(x,j){return n.indexOf(x)!==j;}).length?s:n;\n}\nfunction fitWeekKey(){return dayShift(-appNow().getDay());}\nfunction fitWkAns(){try{return JSON.parse(localStorage.getItem('fit_wk_ans')||'null');}catch(e){return null;}}\nfunction fitVaryTypes(me){me=me||fitMe();var m=me.oMode||{};return (me.other||[]).filter(function(x){return m[x]==='v';});}\nfunction fitWeekPlace(free,R,taken){\n  var best=null,bs=1e9,mask,i,pos,adj,gap,sc;\n  for(mask=0;mask<128;mask++){\n    pos=[];for(i=0;i<7;i++)if(mask&(1<<i)){if(free.indexOf(i)<0){pos=null;break;}pos.push(i);}\n    if(!pos||pos.length!==R)continue;\n    var all=pos.concat(taken).sort(),set={};all.forEach(function(x){set[x]=1;});\n    adj=0;gap=7;\n    for(i=0;i<all.length;i++){if(set[(all[i]+1)%7])adj++;if(all.length>1)gap=Math.min(gap,(all[(i+1)%all.length]-all[i]+7)%7||7);}\n    sc=adj*100-gap*10+(set[6]?1:0);\n    if(sc<bs){bs=sc;best=pos;}\n  }\n  return best||[];\n}\nfunction fitWeekFor(p,me,hand){\n  me=me||fitMe();hand=hand||{};\n  var oth=me.other||[],m=me.oMode||{},fx=me.oFix||{},A=fitWkAns(),ans=(A&&A.days)||{},\n      S=fitStrengthDays(me),nO=oth.length?(+me.otherN||0):0,wk=[],days=[],i,k;\n  if(p)for(i=0;i<p.exercises.length;i++)if(days.indexOf(p.exercises[i].day||'')<0)days.push(p.exercises[i].day||'');\n  for(i=0;i<7;i++)wk.push(null);\n  oth.forEach(function(x){if(m[x]==='f')(fx[x]||[]).forEach(function(d){wk[d]={type:x,label:''};});});\n  for(k in hand)if(hand.hasOwnProperty(k)&&+k>=0&&+k<7)wk[+k]=hand[k];\n  oth.forEach(function(x){if(m[x]==='v')(ans[x]||[]).forEach(function(d){wk[d]={type:x,label:''};});});\n  var taken=[],placedO=0,free=[];\n  for(i=0;i<7;i++){if(!wk[i])free.push(i);else if(wk[i].type==='strength')taken.push(i);else if(wk[i].type!=='rest')placedO++;}\n  var put=days.length?fitWeekPlace(free,Math.min(free.length,Math.max(0,S-taken.length)),taken):[];\n  put.forEach(function(d){wk[d]={type:'strength',label:'',prog:p.id,pday:''};});\n  /* the plan's days in order across the week */\n  var si=0;for(i=0;i<7;i++)if(wk[i]&&wk[i].type==='strength'&&!wk[i].pday&&days.length)wk[i].pday=days[si++%days.length];\n  /* changing training she has not placed yet, and anything older without an answer */\n  var wait=oth.filter(function(x){return m[x]!=='f'&&!(m[x]==='v'&&ans[x]);}),left=[];\n  for(i=0;i<7;i++)if(!wk[i])left.push(i);\n  var U=Math.min(left.length,Math.max(0,nO-placedO));\n  for(i=0;i<U&&wait.length;i++)wk[left[Math.floor(i*left.length/U)]]={type:wait[i%wait.length],label:''};\n  for(i=0;i<7;i++)if(!wk[i])wk[i]={type:'rest'};\n  return wk;\n}"
 ],
 [
  "  return h+'</div>'+(edit?'<div class=\"gn-s fwk-h\">'+_t('לחיצה על יום מחליפה מה עושים בו.')+'</div>':'');\n}\n/* a day of the week being drawn",
  "  return h+'</div>';\n}\n/* a day of the week being drawn"
 ],
 [
  "_fitW.week[i]=_fitW.pick[j];fitSheetClose();",
  "_fitW.week[i]=_fitW.pick[j];(_fitW.hand=_fitW.hand||{})[i]=_fitW.pick[j];fitSheetClose();"
 ],
 [
  "  if(_fitW){_fitW.plan=p;_fitW.week=fitWeekFor(p,me);}",
  "  if(_fitW){_fitW.plan=p;_fitW.week=fitWeekFor(p,me,_fitW.hand);}"
 ],
 [
  "  fitWeekWrite((_fitW&&_fitW.week)||fitWeekFor(p));",
  "  var me0=fitMe();me0.hand=(_fitW&&_fitW.hand)||{};try{localStorage.setItem(FIT_ME_KEY,JSON.stringify(me0));}catch(e){}\n  fitWeekWrite((_fitW&&_fitW.week)||fitWeekFor(p,me0,me0.hand));"
 ],
 [
  "/* EVERY caveat that applies, not the first that matches. Bands-only and\n   fat-with-mass are about different things and both can be true at once. */\nfunction fitWCaveats(){\n  var me=fitMe(),out=me.out||[],eq=genEquip(),c=[];\n  /* from the plan, not from the budget - the same number the card shows */\n  var p=fitWPlan(),nDays={},dn=0,k;\n  for(var z=0;z<p.exercises.length;z++)nDays[p.exercises[z].day]=1;\n  for(k in nDays)if(nDays.hasOwnProperty(k))dn++;\n  var tot=0;for(z=0;z<p.exercises.length;z++)tot+=p.exercises[z].sets;\n  /* the cycle repeats to fill the week, then spread over the groups it works */\n  var per=dn?Math.round(tot*(fitStrengthDays(me)/dn)/6):0;\n  if(eq==='none')   // i18n-exempt: a stored key\n    c.push(''+_t('רק משקל גוף: אפשר להתקדם, אבל העומס עולה בחזרות ובקושי התרגיל ולא במשקל — אז המעקב כאן נראה אחרת.')+'');\n  if(out.indexOf('fat')>=0&&out.indexOf('mass')>=0)   // i18n-exempt: stored keys\n    c.push(''+_t('שומן ומסה יחד: בעיקר בהתחלה, אחרי הפסקה, או כשיש מה להוריד. אחרת זה שלב אחרי שלב, ואגיד לך מתי להחליף.')+'');\n  /* the NUMBER decides this one rather than a hand-written pairing */\n  if(per<SETS_BAND.lo&&out.indexOf('mass')>=0)   // i18n-exempt: a stored key\n    c.push(''+_t('זה יוצא בערך {n} סטים לשריר בשבוע, ולגדילה צריך לפחות {lo}. עוד אימון, או עוד עשרים דקות, יסגרו את הפער.',{n:per,lo:SETS_BAND.lo})+'');\n  return c;\n}",
  "/* TOO THIN TO GROW (27 Nov): the plan says so by offering one more strength workout, not in a\n   paragraph - the sets per muscle a week, from the plan itself, under the band's floor */\nfunction fitWThin(){\n  var me=fitMe(),out=me.out||[];if(out.indexOf('mass')<0)return false;   // i18n-exempt: a stored key\n  var p=fitWPlan(),nDays={},dn=0,k,tot=0,z;\n  for(z=0;z<p.exercises.length;z++){nDays[p.exercises[z].day]=1;tot+=p.exercises[z].sets;}\n  for(k in nDays)if(nDays.hasOwnProperty(k))dn++;\n  var per=dn?Math.round(tot*(fitStrengthDays(me)/dn)/6):0;\n  return per<SETS_BAND.lo&&fitStrengthDays(me)<6&&(+me.days||3)<7;\n}\nfunction fitWAddStrength(){\n  var me=fitMe();me.days=(+me.days||3)+1;try{localStorage.setItem(FIT_ME_KEY,JSON.stringify(me));}catch(e){}\n  if(_fitW){_fitW.plan=null;_fitW.hand={};}renderFitness();\n}"
 ],
 [
  "    /* why THIS split, in the one case where it is not obvious from the chips */\n    if(progSplitFor(fitStrengthDays(me),'adv')!==sp)\n      h+='<div class=\"gn-s\">'+_t('בשלב הזה עדיף לחזור על כל שריר יותר פעמים, גם אם יש לך יותר ימים פנויים.')+'</div>';\n    h+=fitWRows();\n    h+='</div>';\n    var cv=fitWCaveats();\n    for(i=0;i<cv.length;i++)h+='<div class=\"gn-c\"><div class=\"gn-s\">'+cv[i]+'</div></div>';",
  "    h+=fitWRows();\n    if(fitWThin())h+='<button class=\"fq-later fw-more\" onclick=\"fitWAddStrength()\">'+_t('להוסיף אימון כוח בשבוע')+'</button>';\n    h+='</div>';"
 ],
 [
  "        h+='<div class=\"gn-s\">'+esc(ln.join(' \\u00b7 '))+'</div>';\n        h+='<div class=\"gn-s\">'+_t('רשום, ולא מסתיר שום תרגיל. אם משהו ברשימה לא מתאים לך — תחליף אותו.')+'</div>';\n",
  "        h+='<div class=\"gn-s\">'+esc(ln.join(' \\u00b7 '))+'</div>';\n"
 ],
 [
  "    h+='<button class=\"fq-later\" onclick=\"fitWSkip()\">'+_t('בלי תוכנית בינתיים')+'</button>';\n    h+='<div class=\"gn-g\">'+_t('אפשר לשנות כל אחד מהם מתי שתרצה — או להתחיל אימון בלי תוכנית בכלל.')+'</div>';",
  "    h+='<button class=\"fq-later\" onclick=\"fitWSkip()\">'+_t('אימון בלי תוכנית')+'</button>';"
 ],
 [
  "/* ── THE DOOR TO כושר ──",
  "/* THE WEEK'S QUESTION (27 Nov). Training that changes every week (Pilates booked on Sunday) is\n   asked once a week, on top of כושר: which days this week. The answer places it and the strength\n   moves around it. Unanswered, the week stays as it was and the question waits. */\nvar _fitAsk=null;\nfunction fitAskDue(){return fitVaryTypes().length>0&&(function(A){return !A||A.wk!==fitWeekKey();})(fitWkAns());}\nfunction fitAskInit(){var A=fitWkAns();_fitAsk={};\n  fitVaryTypes().forEach(function(x){_fitAsk[x]=((A&&A.days&&A.days[x])||[]).slice();});}\nfunction fitAskOpen(){fitAskInit();renderFitness();}\nfunction fitAskDay(x,d){if(!_fitAsk)return;var L=_fitAsk[x]=(_fitAsk[x]||[]),j=L.indexOf(d);if(j>=0)L.splice(j,1);else L.push(d);L.sort();renderFitness();}\nfunction fitAskHTML(){\n  var v=fitVaryTypes();if(!v.length)return '';\n  if(!_fitAsk){if(!fitAskDue())return '';fitAskInit();}\n  var WL=fitWdLbls(),h='<div class=\"gn-c fask\"><div class=\"fask-q\">'+(v.length===1?_t('מתי {name} השבוע?',{name:wtLabel(v[0])}):_t('מתי האימונים האחרים השבוע?'))+'</div>';\n  v.forEach(function(x){var L=_fitAsk[x]||[];\n    if(v.length>1)h+='<div class=\"as-oml\">'+esc(wtLabel(x))+'</div>';\n    h+='<div class=\"fask-d\">';for(var d=0;d<7;d++)h+='<button class=\"'+(L.indexOf(d)>=0?'on':'')+'\" onclick=\"fitAskDay(\\''+x+'\\','+d+')\">'+esc(WL[d])+'</button>';h+='</div>';});\n  return h+'<button class=\"gn-go\" onclick=\"fitAskSave()\">'+_t('זהו')+'</button></div>';\n}\n/* once answered, the same question stays one tap away for the week the Pilates moves */\nfunction fitAskAgainHTML(){return (!_fitAsk&&fitVaryTypes().length&&!fitAskDue())?'<button class=\"fq-later fask-re\" onclick=\"fitAskOpen()\">'+_t('הימים השתנו השבוע?')+'</button>':'';}\nfunction fitAskSave(){\n  if(!_fitAsk)return;\n  try{localStorage.setItem('fit_wk_ans',JSON.stringify({wk:fitWeekKey(),days:_fitAsk}));}catch(e){}\n  _fitAsk=null;fitWeekRedo();showToast('&#10003; '+_t('השבוע סודר'));renderFitness();\n}\n/* the saved plan placed again around this week's answer */\nfunction fitWeekRedo(){\n  var me=fitMe(),W=loadWeekPlan(),id='',i,p=null;\n  for(i=0;i<7;i++)if(W['w0d'+i]&&W['w0d'+i].prog){id=W['w0d'+i].prog;break;}\n  if(id)p=loadPrograms().filter(function(x){return x.id===id;})[0]||null;\n  if(p){fitWeekWrite(fitWeekFor(p,me,me.hand));return;}\n  /* no plan of hers: only the changing training moves, onto rest days */\n  var v=fitVaryTypes(me),A=fitWkAns(),wk=[];\n  for(i=0;i<7;i++){var e=W['w0d'+i];wk.push(e&&v.indexOf(e.type)>=0?{type:'rest'}:e);}\n  v.forEach(function(x){((A&&A.days&&A.days[x])||[]).forEach(function(d){if(!wk[d]||wk[d].type==='rest')wk[d]={type:x,label:''};});});\n  fitWeekWrite(wk);\n}\n\n/* ── THE DOOR TO כושר ──"
 ],
 [
  "  h+=fitWeekStripHTML();\n  h+=fitAreaGridHTML();",
  "  h+=fitAskHTML();\n  h+=fitWeekStripHTML()+fitAskAgainHTML();\n  h+=fitAreaGridHTML();"
 ],
 [
  ".fw-when{font-size:13px;color:var(--nu-muted,#6d675e);margin:-2px 0 6px}",
  ".fw-when{font-size:13px;color:var(--nu-muted,#6d675e);margin:-2px 0 6px}\n.as-oml{font-size:15px;font-weight:800;color:var(--nu-ink,#4a453f);margin:14px 0 6px}\n.as-om{grid-template-columns:1fr 1fr}\n.as-wd{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}\n.as-wd .as-o{padding:12px 0;min-width:0;align-items:center;text-align:center}\n.as-wd .as-o.on b::before{content:none}\n.as-wd .as-o.on b{color:#336843}\n.fask-q{font-size:18px;font-weight:800;color:var(--nu-ink,#4a453f);line-height:1.3;margin-bottom:12px}\n.fask-d{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;margin-bottom:6px}\n.fask-d button{border:0;border-radius:12px;padding:11px 0;font:inherit;font-size:14px;font-weight:800;color:var(--nu-ink,#4a453f);\n  background:var(--nu-ground,#eae6e1);box-shadow:-2px -2px 5px rgba(255,255,255,.8),2px 3px 6px rgba(150,135,115,.28)}\n.fask-d button.on{box-shadow:inset 2px 3px 6px rgba(150,135,115,.3),inset -2px -2px 5px rgba(255,255,255,.8)}\n.fask-re{display:block;margin:2px auto 8px}\n.fw-more{display:block;margin:10px auto 0}"
 ]
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
