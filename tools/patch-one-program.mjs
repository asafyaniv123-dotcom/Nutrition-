/* One way to write a program (Asaf, 24 Oct). "Build a workout ahead" made one
 * workout and "add a program from the gym" made a multi-day one through a
 * seven-step wizard - two doors to the same thing, since a workout is a
 * program of one day. Now:
 *   כתוב תוכנית בעצמי - the workout editor, with days: "+ day" adds B, C...
 *                       One day saves as a workout, as before; more save as
 *                       a program, which starts by asking which day.
 *   בנה לי תוכנית     - the app builds it, as before.
 * Editing a program from ⋯ opens the same editor on its days.
 *
 * The editor keeps _tpl.exercises as the CURRENT day's array; _tpl.days holds
 * every day's array by reference, so all the existing tpl* functions keep
 * working on the day in front of you without knowing days exist. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b, n0) => { const n = s.split(a).length - 1; if (n !== (n0 || 1)) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.split(a).join(b); };

/* the two sheets: two ways, each with what it does */
const THREE = `'<button onclick="fitSheetClose();startFitEdit(-1)"><b>'+esc(_t('בנה אימון מראש'))+'</b></button>'+
     '<button onclick="fitSheetClose();genProgOpen()"><b>'+esc(_t('בנה לי תוכנית'))+'</b></button>'+
     '<button onclick="fitSheetClose();startProgramWizard()"><b>'+esc(_t('הוסף תוכנית מחדר כושר'))+'</b></button>'`;
const TWO = `'<button onclick="fitSheetClose();startFitEdit(-1)"><b>'+esc(_t('כתוב תוכנית בעצמי'))+'</b><span>'+esc(_t('אימון אחד, או כמה ימים'))+'</span></button>'+
     '<button onclick="fitSheetClose();genProgOpen()"><b>'+esc(_t('בנה לי תוכנית'))+'</b><span>'+esc(_t('האפליקציה בונה אותה בשבילך'))+'</span></button>'`;
rep(`  h+=` + THREE + `;`, `  h+=` + TWO + `;`);
rep(`    '<button onclick="fitSheetClose();startFitEdit(-1)"><b>'+esc(_t('בנה אימון מראש'))+'</b></button>'+
    '<button onclick="fitSheetClose();genProgOpen()"><b>'+esc(_t('בנה לי תוכנית'))+'</b></button>'+
    '<button onclick="fitSheetClose();startProgramWizard()"><b>'+esc(_t('הוסף תוכנית מחדר כושר'))+'</b></button>'+`,
`    '<button onclick="fitSheetClose();startFitEdit(-1)"><b>'+esc(_t('כתוב תוכנית בעצמי'))+'</b><span>'+esc(_t('אימון אחד, או כמה ימים'))+'</span></button>'+
    '<button onclick="fitSheetClose();genProgOpen()"><b>'+esc(_t('בנה לי תוכנית'))+'</b><span>'+esc(_t('האפליקציה בונה אותה בשבילך'))+'</span></button>'+`);
rep(`/* and the ways to plan ahead, the same three as "+ new program" */`, `/* and the two ways to plan ahead, the same as "+ new program" */`);

/* editing a program opens the same editor */
rep(`    if(kind==='t')startFitEdit(i);else{_fitView='edit-program';_fitProgIdx=i;renderFitness();}`,
    `    if(kind==='t')startFitEdit(i);else fitProgEdit(i);`);
rep(`function startFitEdit(idx){
  _fitEditIdx=idx;`, `var _fitEditProg=-1;
function fitProgEdit(pi){_fitEditProg=pi;_fitEditIdx=-1;_tpl=null;_fitView='editTemplate';renderFitness();}
function startFitEdit(idx){
  _fitEditProg=-1;
  _fitEditIdx=idx;`);

/* load: a workout is one day; a program, its days */
rep(`function tplLoad(){
  var templates=loadTemplates();
  var t=(_fitEditIdx>=0&&templates[_fitEditIdx])?templates[_fitEditIdx]:{name:'',exercises:[]};
  _tpl={name:t.name||'',exercises:(t.exercises||[]).map(function(ex){
    return {name:ex.name,plan:tplRows(ex).map(function(s){return {w:s.w,r:s.r};})};
  })};
}`, `function tplLoad(){
  var p=_fitEditProg>=0?loadPrograms()[_fitEditProg]:null;
  if(p){
    var order=[],by={};
    (p.exercises||[]).forEach(function(ex){
      var d=ex.day||'';if(!by[d]){by[d]=[];order.push(d);}
      by[d].push({name:ex.name,plan:(ex.plan&&ex.plan.length)?ex.plan.map(function(s){return {w:s.w,r:s.r};})
        :Array.apply(null,Array(Math.max(1,+ex.sets||3))).map(function(){return {w:'',r:+ex.targetReps||10};})});
    });
    var days=order.map(function(d){return by[d];});if(!days.length)days=[[]];
    _tpl={name:progLabel(p.name)||'',days:days,dayNames:order,cur:0,exercises:days[0]};
    return;
  }
  var templates=loadTemplates();
  var t=(_fitEditIdx>=0&&templates[_fitEditIdx])?templates[_fitEditIdx]:{name:'',exercises:[]};
  var ex0=(t.exercises||[]).map(function(ex){
    return {name:ex.name,plan:tplRows(ex).map(function(s){return {w:s.w,r:s.r};})};
  });
  _tpl={name:t.name||'',days:[ex0],dayNames:[''],cur:0,exercises:ex0};
}
/* the days: switch, add, drop */
function tplDay(i){if(!_tpl||!_tpl.days[i])return;_tpl.cur=i;_tpl.exercises=_tpl.days[i];renderFitness();}
function tplDayAdd(){if(!_tpl)return;var d=[];_tpl.days.push(d);_tpl.dayNames.push('');_tpl.cur=_tpl.days.length-1;_tpl.exercises=d;renderFitness();}
function tplDayDrop(i){
  if(!_tpl||_tpl.days.length<2)return;
  _tpl.days.splice(i,1);_tpl.dayNames.splice(i,1);
  _tpl.cur=Math.min(_tpl.cur,_tpl.days.length-1);_tpl.exercises=_tpl.days[_tpl.cur];renderFitness();
}
function tplDayLetter(i){return String.fromCharCode(65+i);}`);

/* the editor: the strip of days under the name */
rep(`  h+='<div class="tpl-t">'+(_fitEditIdx>=0?''+_t('עריכת תבנית')+'':''+_t('תבנית חדשה')+'')+'</div>';
  h+='<input class="tpl-name" value="'+esc(_tpl.name)+'" placeholder="'+_t("שם התבנית — למשל דחיפה")+'" oninput="tplName(this.value)">';`,
`  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'+
     '<div class="tpl-t" style="margin:0">'+((_fitEditIdx>=0||_fitEditProg>=0)?_t('עריכת תוכנית'):_t('תוכנית חדשה'))+'</div>'+
     '<button class="fit-back" onclick="tplCancel()">&#8249; '+_t('חזרה')+'</button></div>';
  h+='<input class="tpl-name" value="'+esc(_tpl.name)+'" placeholder="'+_t("שם התבנית — למשל דחיפה")+'" oninput="tplName(this.value)">';
  /* ONE DAY OR SEVERAL: the strip appears as days do; one day is a workout */
  h+='<div class="tpl-days">';
  for(var di=0;di<_tpl.days.length;di++)
    h+='<button class="tpl-day'+(di===_tpl.cur?' on':'')+'" onclick="tplDay('+di+')">'+_t('יום {d}',{d:tplDayLetter(di)})+
       (di===_tpl.cur&&_tpl.days.length>1?'<i onclick="event.stopPropagation();tplDayDrop('+di+')">&times;</i>':'')+'</button>';
  h+='<button class="tpl-day add" onclick="tplDayAdd()">'+_t('+ יום')+'</button></div>';`);

/* save: one day -> a workout; more -> a program */
rep(`  if(!_tpl.exercises.length){showToast(''+_t('הוסף לפחות תרגיל אחד')+'');return;}
  var templates=loadTemplates();`, `  var days=_tpl.days.filter(function(d){return d.length;});
  if(!days.length){showToast(''+_t('הוסף לפחות תרגיל אחד')+'');return;}
  if(days.length>1||_fitEditProg>=0){
    var progs=loadPrograms(),flat=[],di,ek;
    for(di=0;di<days.length;di++)for(ek=0;ek<days[di].length;ek++){
      var e2=days[di][ek],pl=e2.plan.map(function(s){return {w:(s.w===''?0:s.w),r:(s.r===''?0:s.r)};});
      flat.push({name:e2.name,plan:pl,sets:pl.length,targetReps:pl.length?pl[pl.length-1].r:10,day:days.length>1?tplDayLetter(di):''});
    }
    var old=_fitEditProg>=0?progs[_fitEditProg]:null;
    var p={id:old?old.id:Date.now(),name:name,daysPerWeek:days.length,exercises:flat};
    if(old)progs[_fitEditProg]=p;else progs.push(p);
    savePrograms(progs);
    /* a workout that grew a second day is a program now, not both */
    if(_fitEditIdx>=0){var tl=loadTemplates();tl.splice(_fitEditIdx,1);saveTemplates(tl);_fitEditIdx=-1;}
    _tpl=null;_fitEditProg=-1;
    showToast(''+_t('נשמר')+' ✓');
    _fitView='start';renderFitness();
    return;
  }
  _tpl.exercises=days[0];
  var templates=loadTemplates();`);
rep(`  _tpl=null;
  showToast(''+_t('נשמר')+' ✓');
  _fitView='home';renderFitness();
}
function tplCancel(){_tpl=null;_fitView='home';renderFitness();}`,
`  _tpl=null;
  showToast(''+_t('נשמר')+' ✓');
  _fitView='start';renderFitness();
}
function tplCancel(){_tpl=null;_fitEditProg=-1;_fitView='start';renderFitness();}`);

rep(`.fss-g{`, `.tpl-days{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0 14px}
.tpl-day{display:inline-flex;align-items:center;gap:6px;border:none;border-radius:999px;padding:8px 14px;font-family:inherit;font-size:13px;font-weight:800;cursor:pointer;
  color:var(--nu-muted);background:var(--nu-ground);box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}
.tpl-day.on{color:var(--nu-ink);box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.tpl-day i{font-style:normal;font-size:15px;color:var(--nu-muted)}
.fss-g{`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);

const K = { 'כתוב תוכנית בעצמי': ['Write it yourself', 'Selbst erstellen', 'Escríbelo tú', 'Le rédiger soi-même', 'Scrivilo tu', 'Escreva você mesmo', '自分で作る', '自己写', '自己寫', 'اكتبه بنفسك'],
  'אימון אחד, או כמה ימים': ['One workout, or several days', 'Ein Training oder mehrere Tage', 'Un entrenamiento o varios días', 'Une séance, ou plusieurs jours', 'Un allenamento o più giorni', 'Um treino ou vários dias', '1回分でも、数日分でも', '一次训练，或几天的计划', '一次訓練，或幾天的計畫', 'تمرين واحد أو عدة أيام'],
  'האפליקציה בונה אותה בשבילך': ['The app builds it for you', 'Die App erstellt es für dich', 'La app lo crea por ti', 'L’app le construit pour toi', 'L’app lo crea per te', 'O app monta para você', 'アプリが作ります', '由应用为你制定', '由應用為你制定', 'التطبيق يبنيه لك'],
  'עריכת תוכנית': ['Edit program', 'Programm bearbeiten', 'Editar programa', 'Modifier le programme', 'Modifica programma', 'Editar programa', 'プログラムを編集', '编辑计划', '編輯計畫', 'تعديل البرنامج'],
  'יום {d}': ['Day {d}', 'Tag {d}', 'Día {d}', 'Jour {d}', 'Giorno {d}', 'Dia {d}', '{d}日目', '第{d}天', '第{d}天', 'اليوم {d}'],
  '+ יום': ['+ Day', '+ Tag', '+ Día', '+ Jour', '+ Giorno', '+ Dia', '+ 日', '+ 天', '+ 天', '+ يوم'] };
const L = ['en', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar'];
L.forEach((l, i) => { const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8')); for (const k in K) d[k] = K[k][i]; fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); });
const add = (f, m) => { const d = JSON.parse(fs.readFileSync(f, 'utf8')); Object.assign(d, m); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); };
add('data/he-f.json', { 'כתוב תוכנית בעצמי': 'כתבי תוכנית בעצמך' });
add('data/he-x.json', { 'כתוב תוכנית בעצמי': 'כתבו תוכנית בעצמכם' });
console.log('ok');
