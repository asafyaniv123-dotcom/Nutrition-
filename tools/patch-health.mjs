/* Health as a lens, in dev (approved on review/health-proto, 25 Oct).
 *  - Settings gets "Your health": an explicit, dated acknowledgement (general
 *    information, not medical advice, does not replace a doctor, the person
 *    decides), then seven conditions, each with what changes, why, a source,
 *    and its own off switch; and "the coach may know".
 *  - Kept on the device only: health_v1 is left out of the backup file.
 *  - A built workout (one-tap) is adjusted: fewer sets and a lower effort
 *    ceiling for myasthenia, exercises that load the bent spine replaced or
 *    dropped for osteoporosis and pregnancy, and a "what was adjusted" card
 *    on the workout; the rest timer never runs shorter than 2:30 with
 *    myasthenia on.
 *  - The coach is told the conditions only with consent, and the worker ends
 *    every health-related answer with not-a-doctor. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* not in the backup */
rep(`var BACKUP_SKIP={steps_token:1,last_export:1};`, `var BACKUP_SKIP={steps_token:1,last_export:1,health_v1:1};   // health stays on the device`);

/* the settings row */
rep(`  h+='<div id="set-backup"></div>';
  v.innerHTML=h;
  renderBackup();`, `  /* your health - opens its own screen */
  h+='<div class="set-sec"><div class="set-t">'+_t('הבריאות שלך')+'</div>'+
     '<div class="set-s">'+_t('מצב רפואי שהאפליקציה תתחשב בו')+'</div></div>';
  h+='<div class="set-langs"><button class="set-lang" onclick="hlOpen()">'+(hlOn().length?_t('{n} פעילים',{n:hlOn().length}):_t('לא הוגדר'))+' &#8249;</button></div>';
  h+='<div id="set-backup"></div>';
  v.innerHTML=h;
  renderBackup();`);

/* the module */
rep(`/* Stored the same way the language and the country are, and repainted the same
   way a language change is: a weight is on half the screens in the app, and
   changing the unit should not send anybody home. */
function unitsSet(u){`, `/* ── YOUR HEALTH ──
   Seven conditions that change what the app suggests. It never diagnoses and
   never prescribes: each changes a DEFAULT, says why, and names where the
   advice comes from; each has its own off switch; and nothing can be chosen
   before the person has said, in their own tap, that this is general
   information and not medical advice. Kept on the device - not in the backup,
   and told to the coach only with a second, separate yes. */
var HEALTH_KEY='health_v1';
var HL_IDS=['mg','dm','bp','ckd','preg','sarc','op'];
function hlLoad(){var o=null;try{o=JSON.parse(localStorage.getItem(HEALTH_KEY)||'null');}catch(e){}
  o=o||{};return {ack:o.ack||'',on:Array.isArray(o.on)?o.on:[],off:Array.isArray(o.off)?o.off:[],coach:!!o.coach};}
function hlSave(o){try{localStorage.setItem(HEALTH_KEY,JSON.stringify(o));}catch(e){}}
/* what is in force: chosen, acknowledged, and not switched off */
function hlOn(){var o=hlLoad();if(!o.ack)return [];return o.on.filter(function(x){return o.off.indexOf(x)<0;});}
function hlHas(id){return hlOn().indexOf(id)>=0;}
function hlName(id){
  if(id==='mg')return _t('מיאסטניה גרביס');if(id==='dm')return _t('סכרת');if(id==='bp')return _t('יתר לחץ דם');
  if(id==='ckd')return _t('מחלת כליות');if(id==='preg')return _t('הריון');if(id==='sarc')return _t('סרקופניה');
  return _t('אוסטאופורוזיס (דלדול עצם)');
}
function hlChanges(id){
  if(id==='mg')return [_t('מנוחה ארוכה בין סטים: לפחות 2:30'),_t('שני סטים לתרגיל, ועוצרים לפני עייפות ולא עד כישלון'),_t('כדאי להתאמן בשעות שבהן הכוח הכי טוב לך, ולהימנע מחום'),_t('חולשה בנשימה, בבליעה או בראייה: עוצרים ופונים לרופא')];
  if(id==='dm')return [_t('לבדוק סוכר לפני אימון ואחריו, ולהחזיק פחמימה מהירה בהישג יד'),_t('סוכר נמוך לפני אימון: לאכול משהו עם פחמימות לפני שמתחילים'),_t('מטרה של 150 דקות פעילות בשבוע, ושני אימוני כוח לפחות')];
  if(id==='bp')return [_t('לא לעצור את הנשימה במאמץ: נושפים בזמן ההרמה'),_t('משקלים מתונים ויותר חזרות'),_t('פחות מלח, ודגש על ירקות ופירות')];
  if(id==='ckd')return [_t('לא לדחוף ליעד חלבון גבוה'),_t('פחות מלח'),_t('אשלגן וזרחן: לפי מה שהרופא או הדיאטנית קבעו'),_t('האפליקציה לא ממליצה על תוספי חלבון')];
  if(id==='preg')return [_t('עצימות מתונה: אפשר לדבר תוך כדי אימון'),_t('בלי תרגילים בשכיבה על הגב אחרי השליש הראשון'),_t('אין מטרה של ירידה במשקל')];
  if(id==='sarc')return [_t('אימוני כוח 2–3 פעמים בשבוע, עם דגש על הרגליים'),_t('חלבון בכל ארוחה, ולא רק בערב'),_t('תרגילי שיווי משקל')];
  return [_t('אימוני כוח, נשיאת משקל ושיווי משקל'),_t('בלי כפיפת גב עם עומס ובלי סיבובים חזקים'),_t('דגש על חיזוק הגב ועל יציבה'),_t('סידן וויטמין D')];
}
/* the bodies the advice comes from - names, not sentences */
var HL_SRC={mg:'Myasthenia Gravis Foundation of America',dm:'American Diabetes Association, Standards of Care',   // i18n-exempt: the names of medical bodies
  bp:'American Heart Association; ACSM',ckd:'National Kidney Foundation; KDIGO',preg:'ACOG, Committee Opinion 804',   // i18n-exempt: same
  sarc:'EWGSOP2; ESPEN',op:'Bone Health & Osteoporosis Foundation; Royal Osteoporosis Society'};   // i18n-exempt: same
function hlOpen(){hlClose();var ov=document.createElement('div');ov.id='hl-ov';ov.className='hl-ov';document.body.appendChild(ov);hlPaint();}
function hlClose(){var e=document.getElementById('hl-ov');if(e&&e.parentNode)e.parentNode.removeChild(e);try{renderSettings();}catch(e2){}}
function hlPaint(){
  var ov=document.getElementById('hl-ov');if(!ov)return;
  var o=hlLoad(),h='<div class="hl-in"><div class="hl-top"><b>'+_t('הבריאות שלך')+'</b><button class="fit-back" onclick="hlClose()">&#8249; '+_t('חזרה')+'</button></div>',i,id;
  h+='<p class="hl-p">'+_t('יש משהו בבריאות שלך שהאפליקציה צריכה לקחת בחשבון? זה לא חובה, ואפשר לשנות בכל רגע.')+'</p>';
  h+='<label class="hl-ack"><input type="checkbox"'+(o.ack?' checked':'')+' onchange="hlAck(this.checked)"><span>'+
     _t('אני מבין/ה שזה מידע כללי ולא ייעוץ רפואי. ההתאמות מבוססות על המלצות של גופים רפואיים, אבל הן לא מותאמות אישית, לא מחליפות רופא, ואני מחליט/ה מה לעשות. לפני שינוי בפעילות או בתזונה אתייעץ עם הרופא שלי.')+'</span></label>';
  if(o.ack)h+='<div class="hl-d">'+esc(_t('אושר ב־{d}',{d:dfmt(o.ack+'T12:00:00',{day:'numeric',month:'long',year:'numeric'})}))+'</div>';
  h+='<div class="hl-chips'+(o.ack?'':' off')+'">';
  for(i=0;i<HL_IDS.length;i++){id=HL_IDS[i];h+='<button class="'+(o.on.indexOf(id)>=0?'on':'')+'" onclick="hlPick(\\''+id+'\\')">'+esc(hlName(id))+'</button>';}
  h+='</div><div class="hl-priv">'+_t('נשמר רק בטלפון שלך. לא נשמר בגיבוי ולא משותף עם אף אחד.')+'</div>';
  h+='<div class="hl-tog"><span>'+_t('שהמאמן ידע')+'<small>'+_t('כדי שתוכל להתייעץ איתו. הוא תמיד יזכיר שהוא לא רופא.')+'</small></span>'+
     '<button class="hl-sw'+(o.coach?' on':'')+'" onclick="hlCoach()" aria-label="'+esc(_t('שהמאמן ידע'))+'"><i></i></button></div>';
  for(i=0;i<o.on.length;i++){id=o.on[i];var off=o.off.indexOf(id)>=0;
    h+='<div class="hl-card"><div class="hl-ch"><b>'+esc(hlName(id))+'</b><button class="hl-sw'+(off?'':' on')+'" onclick="hlOff(\\''+id+'\\')"><i></i></button></div>';
    if(off)h+='<div class="hl-x">'+_t('כבוי. האפליקציה לא משנה דבר בגלל המצב הזה.')+'</div>';
    else h+='<ul>'+hlChanges(id).map(function(t){return '<li>'+esc(t)+'</li>';}).join('')+'</ul>';
    h+='<div class="hl-src">'+esc(_t('מקור: {s}',{s:HL_SRC[id]}))+'</div></div>';}
  h+='<div class="hl-doc">'+_t('מידע כללי ולא ייעוץ רפואי. האפליקציה לא מאבחנת ולא מחליפה רופא, והרופא שלך הוא זה שקובע.')+'</div></div>';
  ov.innerHTML=h;
}
function hlAck(v){var o=hlLoad();o.ack=v?todayStr():'';if(!v)o.on=[];hlSave(o);hlPaint();}
function hlPick(id){var o=hlLoad();if(!o.ack)return;var i=o.on.indexOf(id);if(i>=0)o.on.splice(i,1);else o.on.push(id);hlSave(o);hlPaint();}
function hlOff(id){var o=hlLoad(),i=o.off.indexOf(id);if(i>=0)o.off.splice(i,1);else o.off.push(id);hlSave(o);hlPaint();}
function hlCoach(){var o=hlLoad();o.coach=!o.coach;hlSave(o);hlPaint();}
/* what the coach is told: nothing without the second yes */
function hlForCoach(){var o=hlLoad();return o.coach?hlOn():[];}
/* a built workout, adjusted; the notes say what and why */
function hlAdjust(exs){
  var notes=[],out=[],i,e,n,risky=/כפיפות בטן|כפיפת בטן|קראנץ|טוויסט|סיבוב|נגיעה בבהונות|Crunch|Sit|Twist/i,supine=/בשכיבה|על ספסל שטוח|Bench|Floor/i;
  for(i=0;i<exs.length;i++){e=exs[i];n=e.name||'';
    if((hlHas('op')||hlHas('preg'))&&risky.test(n))continue;
    if(hlHas('preg')&&supine.test(n))continue;
    if(hlHas('mg')){e.targetSets=Math.min(2,e.targetSets||2);}
    out.push(e);}
  if(hlHas('mg'))notes.push(_t('מיאסטניה: שני סטים, מנוחה של 2:30, ועוצרים לפני עייפות'));
  if(hlHas('bp'))notes.push(_t('לחץ דם: נושפים בזמן ההרמה, ולא עוצרים את הנשימה'));
  if(hlHas('dm'))notes.push(_t('סכרת: לבדוק סוכר לפני האימון'));
  if(hlHas('sarc'))notes.push(_t('סרקופניה: דגש על הרגליים, ושיווי משקל בסוף'));
  if(hlHas('op')&&out.length<exs.length)notes.push(_t('אוסטאופורוזיס: תרגילים עם כפיפת גב הוצאו'));
  if(hlHas('preg')&&out.length<exs.length)notes.push(_t('הריון: תרגילים בשכיבה על הגב ובכפיפת בטן הוצאו'));
  return {exs:out.length?out:exs,notes:notes};
}
function hlNotesHTML(w){
  if(!w||!w.hlNotes||!w.hlNotes.length)return '';
  return '<div class="hl-wn"><b>'+_t('מה הותאם לך')+'</b>'+w.hlNotes.map(function(t){return '<div><i></i>'+esc(t)+'</div>';}).join('')+
    '<span>'+_t('מידע כללי ולא ייעוץ רפואי.')+'</span></div>';
}
/* Stored the same way the language and the country are, and repainted the same
   way a language change is: a weight is on half the screens in the app, and
   changing the unit should not send anybody home. */
function unitsSet(u){`);

/* the one-tap builder applies it */
rep(`    _fitWorkout={templateIdx:-1,name:''+_t('אימון בקליק')+'',startTime:Date.now(),
                 exercises:exs,currentEx:0};`, `    var adj=hlAdjust(exs);
    _fitWorkout={templateIdx:-1,name:''+_t('אימון בקליק')+'',startTime:Date.now(),
                 exercises:adj.exs,currentEx:0,hlNotes:adj.notes};`);
/* the workout shows what was adjusted, at the top */
rep(`function renderFitWorkout(){`, `function renderFitWorkoutHl(){
  var c=document.getElementById('content');if(!c||!_fitWorkout)return;
  var h=hlNotesHTML(_fitWorkout);if(h&&!document.getElementById('hl-wn-once'))c.insertAdjacentHTML('afterbegin','<div id="hl-wn-once">'+h+'</div>');
}
function renderFitWorkout(){`);
rep(`  else if(_fitView==='workout')renderFitWorkout();`, `  else if(_fitView==='workout'){renderFitWorkout();renderFitWorkoutHl();}`);
/* the rest never shorter than 2:30 with myasthenia */
rep(`function restLen(){`, `function restLen(){
  if(typeof hlHas==='function'&&hlHas('mg')){var r0=restLenRaw();return r0&&r0<150?150:r0;}
  return restLenRaw();
}
function restLenRaw(){`);
/* the coach is told, with consent */
rep(`      phase:(goalDef(loadProfile().goal)||{}).v||'',`, `      phase:(goalDef(loadProfile().goal)||{}).v||'',
      health:hlForCoach(),`);

/* CSS */
rep(`.fss-g{`, `/* your health */
.hl-ov{position:fixed;inset:0;z-index:960;overflow-y:auto;background:var(--nu-ground,#e9e7e3);
  --nu-ground:#e9e7e3;--nu-lit:rgba(255,255,255,.95);--nu-shade:rgba(176,168,156,.44);--nu-shade-soft:rgba(176,168,156,.28);--nu-ink:#4a453f;--nu-muted:#6d675e}
.hl-in{max-width:480px;margin:0 auto;padding:calc(env(safe-area-inset-top) + 18px) 18px 40px;color:var(--nu-ink)}
.hl-top{display:flex;justify-content:space-between;align-items:center}.hl-top b{font-size:24px;font-weight:800}
.hl-p{font-size:14.5px;color:var(--nu-muted);line-height:1.6;margin:8px 0 14px}
.hl-ack{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:1.6;cursor:pointer;border-radius:18px;padding:13px 14px;
  box-shadow:-3px -3px 8px var(--nu-lit),4px 5px 12px var(--nu-shade-soft)}
.hl-ack input{flex:none;width:22px;height:22px;margin-top:2px;accent-color:#3f7a52}
.hl-d{font-size:12px;font-weight:700;color:var(--nu-muted);margin:6px 4px 0}
.hl-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.hl-chips.off{opacity:.4;pointer-events:none}
.hl-chips button{border:none;border-radius:999px;padding:10px 14px;font-family:inherit;font-size:14.5px;font-weight:800;color:var(--nu-muted);cursor:pointer;background:var(--nu-ground);
  box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}
.hl-chips button.on{color:var(--nu-ink);box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.hl-chips button.on::before{content:"\\2713  ";color:#336843}
.hl-priv{font-size:13px;color:var(--nu-muted);margin-top:12px;line-height:1.55}
.hl-tog{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:14px;font-size:14.5px;font-weight:700}
.hl-tog small{display:block;font-size:12.5px;color:var(--nu-muted);font-weight:600;margin-top:2px}
.hl-sw{flex:none;width:52px;height:30px;border:none;border-radius:999px;position:relative;cursor:pointer;background:var(--nu-ground);box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.hl-sw i{position:absolute;top:3px;inset-inline-start:3px;width:24px;height:24px;border-radius:50%;background:var(--nu-ground);box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft);transition:inset-inline-start .2s}
.hl-sw.on i{inset-inline-start:25px;background:#fff8ec;box-shadow:0 0 8px rgba(240,169,46,.6)}
.hl-card{border-radius:20px;padding:14px;margin-top:12px;box-shadow:-4px -4px 10px var(--nu-lit),5px 6px 14px var(--nu-shade-soft)}
.hl-ch{display:flex;justify-content:space-between;align-items:center}.hl-ch b{font-size:16.5px}
.hl-card ul{margin:8px 0 0;padding:0;list-style:none;font-size:13.5px;line-height:1.6}
.hl-card li{position:relative;padding-inline-start:16px;margin-bottom:4px}
.hl-card li::before{content:"";position:absolute;inset-inline-start:2px;top:8px;width:6px;height:6px;border-radius:50%;background:var(--nu-amber,#f0a92e)}
.hl-src,.hl-x{font-size:12px;color:var(--nu-muted);font-weight:700;margin-top:6px}
.hl-doc{font-size:12.5px;color:var(--nu-muted);font-weight:600;line-height:1.55;margin-top:14px;padding:10px 12px;border-radius:14px;box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.hl-wn{border-radius:18px;padding:12px 14px;margin-bottom:12px;font-size:13px;line-height:1.5;color:var(--nu-ink);box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.hl-wn b{display:block;font-size:12.5px;color:var(--nu-muted);margin-bottom:6px}
.hl-wn div{display:flex;gap:8px;align-items:flex-start;margin-top:4px}
.hl-wn i{flex:none;width:7px;height:7px;border-radius:50%;background:var(--nu-amber,#f0a92e);margin-top:6px}
.hl-wn span{display:block;font-size:11.5px;color:var(--nu-muted);font-weight:700;margin-top:6px}
.fss-g{`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);

/* the worker: the conditions, and the rule */
const W = 'push-server/src/worker.js';
let w = fs.readFileSync(W, 'utf8');
const wrep = (a, b) => { if (w.split(a).length !== 2) { console.log('W ANCHOR', a.slice(0, 60)); process.exit(1); } w = w.replace(a, b); };
wrep(`      const phase = String((b && b.phase) || '').slice(0, 20);`, `      const phase = String((b && b.phase) || '').slice(0, 20);
      /* health conditions the person chose to tell the coach (with consent) */
      const HL = { mg: 'myasthenia gravis', dm: 'diabetes', bp: 'high blood pressure', ckd: 'chronic kidney disease', preg: 'pregnancy', sarc: 'sarcopenia', op: 'osteoporosis' };
      const health = (Array.isArray(b && b.health) ? b.health : []).filter((x) => HL[x]).map((x) => HL[x]);`);
wrep(`      /* One request, as a function, so a reply can be sent back once. */
      const ask = async (messages) => {`, `      /* One request, as a function, so a reply can be sent back once. */
      const SYS = health.length ? SYSTEM + '\\n\\n## Health conditions the user chose to share\\n' + health.join(', ') +
        '.\\nTake them into account, following mainstream guidance from recognised medical bodies. You are NOT a doctor: never diagnose, never advise on medication or doses, and if they describe warning signs (for myasthenia: weakness in breathing, swallowing or vision; for diabetes: symptoms of a low) tell them to stop and contact their doctor. Whenever your reply touches their health or one of these conditions, end it with one short line, in their language, saying that you are not a doctor, that this is general information and not medical advice, and that they should check with their own doctor.' : SYSTEM;
      const ask = async (messages) => {`);
/* only the coach's own request uses SYS: the one right after ask */
const at = w.indexOf('const ask = async (messages) => {');
const sysAt = w.indexOf('system: SYSTEM,', at);
if (sysAt < 0 || sysAt - at > 1500) { console.log('W system anchor'); process.exit(1); }
w = w.slice(0, sysAt) + 'system: SYS,' + w.slice(sysAt + 'system: SYSTEM,'.length);
fs.writeFileSync(W, w);
console.log('ok');
