/* The setup screen, round two (Asaf, 25 Oct):
 *  1. it opens with a welcome to the area - what you can do there - and
 *     "before we start, a few questions", then the goal;
 *  2. sex is not asked again when the first run already learned how to
 *     address the person (m/f); and the first run now asks the birthday too,
 *     so the app can greet on the day, and the area does not ask it again;
 *  3. a birth date is a WHEEL - day, month, year, in the app's own wheel - with
 *     the age shown as it turns; no native date picker anywhere it is asked
 *     (the first run, the setup, the profile);
 *  4. "your health? yes" continues IN the flow - the acknowledgement, the
 *     conditions, the coach - instead of a second screen popping up; and the
 *     acknowledgement is the app's raised toggle, not the system's green
 *     checkbox, in the app's type. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* ── the birth wheel ── */
rep(`/* ── THE ONE-TIME SETUP SCREEN ── */`, `/* ── A BIRTH DATE, ON A WHEEL ──
   Day, month, year in the app's own wheel (the first run's hour wheel), the
   age said as it turns. No system date picker: on the iPhone it opens a
   calendar sheet and jumps. */
function bwParse(v){var m=/^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(v||'');return m?{y:+m[1],m:+m[2]-1,d:+m[3]}:{y:1990,m:0,d:1};}
function bwYears(){var y=appNow().getFullYear(),a=[],i;for(i=y-10;i>=y-100;i--)a.push(i);return a;}
function bwHTML(id){
  var h='<div class="dr-wheel bw"><div class="win"></div><div class="dr-col bw-d" id="'+id+'-d">',i;
  for(i=1;i<=31;i++)h+='<div>'+nfmt(i)+'</div>';
  h+='</div><div class="dr-col bw-m" id="'+id+'-m">';
  for(i=0;i<12;i++)h+='<div>'+esc(dfmt(new Date(2000,i,1,12),{month:'long'}))+'</div>';
  h+='</div><div class="dr-col bw-y" id="'+id+'-y">';
  bwYears().forEach(function(y){h+='<div>'+String(y)+'</div>';});   // i18n-exempt: a year, written as the year
  return h+'</div></div><div class="bw-age" id="'+id+'-age"></div>';
}
function bwInit(id,val){
  var v=bwParse(val),cols=[[id+'-d',v.d-1],[id+'-m',v.m],[id+'-y',Math.max(0,bwYears().indexOf(v.y))]];
  cols.forEach(function(c){var el=document.getElementById(c[0]);if(!el)return;
    el.scrollTop=c[1]*60;doorMark(el);
    el.addEventListener('scroll',function(){doorMark(el);bwAge(id);});});
  bwAge(id);
}
function bwVal(id){
  var k=function(s2){var el=document.getElementById(id+'-'+s2);return el?Math.round(el.scrollTop/60):0;};
  var y=bwYears()[k('y')]||1990,m=k('m'),d=Math.min(k('d')+1,new Date(y,m+1,0).getDate());
  return y+'-'+(m<9?'0':'')+(m+1)+'-'+(d<10?'0':'')+d;
}
function bwAge(id){var e=document.getElementById(id+'-age'),a=profileAge(bwVal(id));if(e)e.textContent=a===null?'':_t('גיל {n}',{n:a});}
/* ── THE ONE-TIME SETUP SCREEN ── */`);

/* setup: welcome first, sex skipped when the voice is known, health in the flow */
rep(`  if(a==='nutrition'){
    if(!fqHas(p,'goal'))out.push('gate','add','goal');
    ['sex','birth','height','weight','activity'].forEach(function(k){if(!fqHas(p,k))out.push(k);});`,
`  out.push('welcome');
  if(a==='nutrition'){
    if(!fqHas(p,'goal'))out.push('gate','add','goal');
    var g0=appGender();
    ['sex','birth','height','weight','activity'].forEach(function(k){if(!fqHas(p,k)&&!(k==='sex'&&(g0==='m'||g0==='f')))out.push(k);});`);
rep(`  if(!hlLoad().ack)out.push('health');
  return out;`, `  if(!hlLoad().ack)out.push('health','hack','hconds','hcoach');
  return out;`);
rep(`  if(!st.length){asetMark(a);return;}`, `  if(st.length<2){asetMark(a);return;}   /* only the welcome left: nothing to ask */`);
rep(`  _aset={a:a,steps:asetSteps(a),i:0,t:{goal:p.goal||'',sex:p.sex||'',`, `  var g1=appGender();
  _aset={a:a,steps:asetSteps(a),i:0,t:{hl:[],goal:p.goal||'',sex:p.sex||(g1==='m'||g1==='f'?g1:''),`);
rep(`function asetSkip(k){var t=_aset.t;if(k==='add')return t.gate!=='no';`, `function asetSkip(k){var t=_aset.t;if(k==='hack'||k==='hconds'||k==='hcoach')return t.health!=='yes';if(k==='add')return t.gate!=='no';`);
rep(`  if(k==='birth'){e=document.getElementById('as-birth');t.birth=e?e.value:'';}`, `  if(k==='birth')t.birth=bwVal('as-b');`);
rep(`  if(k==='exp')return !!t.exp;if(k==='equip')return !!t.equip;if(k==='limits')return t.limits.length>0;if(k==='health')return !!t.health;`,
    `  if(k==='exp')return !!t.exp;if(k==='equip')return !!t.equip;if(k==='limits')return t.limits.length>0;if(k==='health')return !!t.health;
  if(k==='hack')return t.ack==='yes';if(k==='hconds')return t.hl.length>0;if(k==='hcoach')return !!t.coach;`);
rep(`  var health=t.health==='yes';
  asetClose();`, `  if(t.health==='yes'&&t.ack==='yes'&&t.hl.length)hlSave({ack:todayStr(),on:t.hl.slice(),off:[],coach:t.coach==='yes'});
  asetClose();`);
rep(`  if(health)setTimeout(hlOpen,250);\n`, ``);
/* the screens */
rep(`  if(k==='gate'){q=fit?`, `  if(k==='welcome'){
    q=fit?_t('ברוכים הבאים לכושר'):_t('ברוכים הבאים לתזונה');
    var L=fit?[_t('בונים אימון, או מתחילים אחד בקליק'),_t('רושמים סטים, משקלים ומנוחה'),_t('ורואים את ההתקדמות לאורך זמן')]
             :[_t('רושמים מה אוכלים, בטקסט, בתמונה או בקול'),_t('רואים מול היעד שלך כמה נשאר להיום'),_t('ומתייעצים עם המאמן על כל ארוחה')];
    body='<ul class="as-pts">'+L.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>'+
      '<div class="as-why">'+(fit?_t('לפני שנתחיל, כמה שאלות קצרות, כדי שהאימונים יתאימו לך.'):_t('לפני שנתחיל, כמה שאלות קצרות, כדי שהמספרים יהיו שלך.'))+'</div>';
  }
  if(k==='gate'){q=fit?`);
rep(`  if(k==='birth'){q=fqQuestion('birth');body='<label class="pf-row fq-date as-box"><input class="pf-in" id="as-birth" type="date" required value="'+esc(t.birth||'')+'"><span>'+_t('בחירת תאריך')+'</span></label>';}`,
    `  if(k==='birth'){q=fqQuestion('birth');body=bwHTML('as-b');}`);
rep(`  if(k==='health'){q=_t('הבריאות שלך');`, `  if(k==='hack'){q=_t('לפני שבוחרים');body=asetChoice('ack','yes',_t('אני מבין/ה שזה מידע כללי ולא ייעוץ רפואי. ההתאמות מבוססות על המלצות של גופים רפואיים, אבל הן לא מותאמות אישית, לא מחליפות רופא, ואני מחליט/ה מה לעשות. לפני שינוי בפעילות או בתזונה אתייעץ עם הרופא שלי.'));}
  if(k==='hconds'){q=_t('מצב רפואי שהאפליקציה תתחשב בו');why=_t('אפשר לבחור יותר מאחת.');for(i=0;i<HL_IDS.length;i++)body+=asetChoice('hl',HL_IDS[i],esc(hlName(HL_IDS[i])),'',1);}
  if(k==='hcoach'){q=_t('שהמאמן ידע');why=_t('כדי שתוכל להתייעץ איתו. הוא תמיד יזכיר שהוא לא רופא.');body=asetChoice('coach','yes',_t('כן'))+asetChoice('coach','no',_t('לא'));}
  if(k==='health'){q=_t('הבריאות שלך');`);
rep(`  h+='<button class="as-go'+(nudge?' nudge':'')+'" onclick="asetNext()">'+_t('המשך')+'</button></div>';
  ov.innerHTML=h;`, `  h+='<button class="as-go'+(nudge?' nudge':'')+'" onclick="asetNext()">'+(k==='welcome'?_t('בוא נתחיל'):_t('המשך'))+'</button></div>';
  ov.innerHTML=h;
  if(k==='birth')bwInit('as-b',t.birth);`);
rep(`function asetReady(){
  var k=asetKey(),t=_aset.t;`, `function asetReady(){
  var k=asetKey(),t=_aset.t;
  if(k==='welcome')return true;`);

/* the first run asks the birthday */
rep(`  if(appLang()==='he')a.push('gender');
  return a.concat(['areas',`, `  if(appLang()==='he')a.push('gender');
  a.push('birth');
  return a.concat(['areas',`);
rep(`  if(step==='gender'){`, `  if(step==='birth'){
    return '<div class="dr-body"><div class="dr-q2">'+_t('מתי יום ההולדת שלך?')+'</div>'+
      '<div class="dr-w2">'+_t('כדי שאדע לברך אותך ביום הזה. אפשר גם בלי.')+'</div>'+bwHTML('dr-b')+'</div>'+
      '<button class="dr-btn" onclick="doorBirth()">'+_t('אפשר להמשיך')+'</button>'+
      '<button class="dr-later" onclick="doorNext()">'+_t('אולי אחר כך')+'</button>';
  }
  if(step==='gender'){`);
rep(`  if(step==='time'){doorBeem('listen');doorWheel();}`, `  if(step==='time'){doorBeem('listen');doorWheel();}
  if(step==='birth'){doorBeem('listen');bwInit('dr-b',loadProfile().birth||'');}`);
rep(`function doorGender2(g,el){`, `function doorBirth(){
  var p=loadProfile();p.birth=bwVal('dr-b');saveProfile(p);doorBeem('glad');setTimeout(doorNext,500);
}
function doorGender2(g,el){`);

/* the profile row: the date opens the wheel */
rep(`     '<input class="pf-in" type="date" value="'+(p.birth||'')+'" onchange="profSet(\\u0027birth\\u0027,this.value)">'+`,
    `     '<button class="pf-in pf-bd" onclick="pfBirthSheet()">'+(p.birth?esc(dfmt(p.birth+'T12:00:00',{day:'numeric',month:'long',year:'numeric'})):'&ndash;')+'</button>'+`);
rep(`function bwAge(id){`, `function pfBirthSheet(){
  var ov=document.createElement('div');ov.className='cf-ov fss-ov';ov.id='bw-ov';
  ov.innerHTML='<div class="cf-card fss"><div class="cf-q" style="margin-bottom:12px">'+esc(_t('תאריך לידה'))+'</div>'+bwHTML('pf-b')+
    '<div class="tm-sv-col" style="margin-top:14px"><button class="cf-yes" id="bw-ok">'+esc(_t('שמור'))+'</button><button class="cf-no" id="bw-x">'+esc(_t('ביטול'))+'</button></div></div>';
  document.body.appendChild(ov);bwInit('pf-b',loadProfile().birth||'');
  var close=function(){if(ov.parentNode)ov.parentNode.removeChild(ov);};
  document.getElementById('bw-x').onclick=close;ov.onclick=function(e){if(e.target===ov)close();};
  document.getElementById('bw-ok').onclick=function(){var v=bwVal('pf-b');close();profSet('birth',v);};
}
function bwAge(id){`);

/* the health screen's acknowledgement: the app's toggle, not the system's checkbox */
rep(`  h+='<label class="hl-ack"><input type="checkbox"'+(o.ack?' checked':'')+' onchange="hlAck(this.checked)"><span>'+`,
    `  h+='<button class="hl-ack'+(o.ack?' on':'')+'" onclick="hlAck('+(!o.ack)+')"><i></i><span>'+`);
rep(`ואני מחליט/ה מה לעשות. לפני שינוי בפעילות או בתזונה אתייעץ עם הרופא שלי.')+'</span></label>';
  if(o.ack)`, `ואני מחליט/ה מה לעשות. לפני שינוי בפעילות או בתזונה אתייעץ עם הרופא שלי.')+'</span></button>';
  if(o.ack)`);

/* CSS */
rep(`.hl-ack input{flex:none;width:22px;height:22px;margin-top:2px;accent-color:#3f7a52}`,
`.hl-ack{width:100%;border:none;font-family:inherit;color:var(--nu-ink);background:var(--nu-ground);text-align:start;font-weight:600}
.hl-ack i{flex:none;width:26px;height:26px;border-radius:9px;margin-top:2px;box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.hl-ack.on{box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.hl-ack.on i{background:#fff8ec url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23336843' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 12.5 4 4 8-9'/%3E%3C/svg%3E") center/16px no-repeat;
  box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}`);
rep(`.as-go{margin-top:auto;`, `.as-pts{margin:0;padding:0;list-style:none;display:grid;gap:12px}
.as-pts li{position:relative;padding-inline-start:20px;font-size:17px;font-weight:700;line-height:1.45}
.as-pts li::before{content:"";position:absolute;inset-inline-start:2px;top:9px;width:8px;height:8px;border-radius:50%;background:var(--nu-amber,#f0a92e)}
.bw{gap:2px}
.bw .dr-col{width:28%}.bw .bw-m{width:40%}
.bw .dr-col div{font-size:21px}
.bw-age{text-align:center;font-size:15px;font-weight:800;color:var(--nu-muted,#6d675e);margin-top:12px;min-height:20px}
.pf-bd{cursor:pointer;font-size:15px}
.as-go{margin-top:auto;`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);

const K = ['גיל {n}', 'ברוכים הבאים לכושר', 'ברוכים הבאים לתזונה', 'בונים אימון, או מתחילים אחד בקליק', 'רושמים סטים, משקלים ומנוחה', 'ורואים את ההתקדמות לאורך זמן',
  'רושמים מה אוכלים, בטקסט, בתמונה או בקול', 'רואים מול היעד שלך כמה נשאר להיום', 'ומתייעצים עם המאמן על כל ארוחה', 'לפני שנתחיל, כמה שאלות קצרות, כדי שהאימונים יתאימו לך.',
  'לפני שנתחיל, כמה שאלות קצרות, כדי שהמספרים יהיו שלך.', 'לפני שבוחרים', 'מתי יום ההולדת שלך?', 'כדי שאדע לברך אותך ביום הזה. אפשר גם בלי.'];
const A = {
  en: ['Age {n}', 'Welcome to fitness', 'Welcome to nutrition', 'Build a workout, or start one in a tap', 'Log sets, weights and rest', 'And watch your progress over time',
    'Log what you eat, by text, photo or voice', 'See how much is left against your target today', 'And talk any meal over with the coach', 'Before we start, a few short questions so your workouts fit you.',
    'Before we start, a few short questions so the numbers are yours.', 'Before you choose', 'When is your birthday?', 'So I can wish you a happy birthday. You can skip this.'],
  de: ['Alter {n}', 'Willkommen bei Fitness', 'Willkommen bei Ernährung', 'Ein Training bauen oder mit einem Tipp starten', 'Sätze, Gewichte und Pausen eintragen', 'Und den Fortschritt über die Zeit sehen',
    'Eintragen, was du isst – per Text, Foto oder Sprache', 'Sehen, wie viel heute bis zum Ziel bleibt', 'Und jede Mahlzeit mit dem Coach besprechen', 'Bevor wir anfangen, ein paar kurze Fragen, damit die Trainings zu dir passen.',
    'Bevor wir anfangen, ein paar kurze Fragen, damit die Zahlen deine sind.', 'Bevor du wählst', 'Wann hast du Geburtstag?', 'Damit ich dir gratulieren kann. Du kannst es auch überspringen.'],
  es: ['Edad {n}', 'Bienvenido al ejercicio', 'Bienvenido a la alimentación', 'Crea un entrenamiento o empieza uno con un toque', 'Registra series, pesos y descansos', 'Y mira tu progreso con el tiempo',
    'Registra lo que comes, con texto, foto o voz', 'Mira cuánto te queda hoy frente a tu objetivo', 'Y consulta cada comida con el coach', 'Antes de empezar, unas preguntas cortas para que los entrenamientos te encajen.',
    'Antes de empezar, unas preguntas cortas para que los números sean tuyos.', 'Antes de elegir', '¿Cuándo es tu cumpleaños?', 'Para poder felicitarte ese día. Puedes saltarlo.'],
  fr: ['{n} ans', 'Bienvenue dans le sport', 'Bienvenue dans la nutrition', 'Construis une séance, ou lance-en une en un geste', 'Note séries, charges et repos', 'Et vois tes progrès au fil du temps',
    'Note ce que tu manges, par texte, photo ou voix', 'Vois ce qu’il te reste aujourd’hui par rapport à ton objectif', 'Et parle de chaque repas avec le coach', 'Avant de commencer, quelques questions pour que les séances te correspondent.',
    'Avant de commencer, quelques questions pour que les chiffres soient les tiens.', 'Avant de choisir', 'Quand est ton anniversaire ?', 'Pour te le souhaiter le jour venu. Tu peux passer.'],
  it: ['Età {n}', 'Benvenuto nell’allenamento', 'Benvenuto nell’alimentazione', 'Crea un allenamento o avviane uno con un tocco', 'Registra serie, pesi e recuperi', 'E guarda i progressi nel tempo',
    'Registra ciò che mangi, con testo, foto o voce', 'Vedi quanto ti manca oggi rispetto all’obiettivo', 'E parla di ogni pasto con il coach', 'Prima di iniziare, qualche domanda veloce perché gli allenamenti siano adatti a te.',
    'Prima di iniziare, qualche domanda veloce perché i numeri siano tuoi.', 'Prima di scegliere', 'Quando è il tuo compleanno?', 'Così posso farti gli auguri. Puoi saltare.'],
  pt: ['Idade {n}', 'Bem-vindo ao treino', 'Bem-vindo à alimentação', 'Monte um treino ou comece um com um toque', 'Registre séries, cargas e descanso', 'E veja seu progresso ao longo do tempo',
    'Registre o que você come, por texto, foto ou voz', 'Veja quanto falta hoje em relação à sua meta', 'E converse sobre cada refeição com o coach', 'Antes de começar, algumas perguntas rápidas para os treinos combinarem com você.',
    'Antes de começar, algumas perguntas rápidas para os números serem seus.', 'Antes de escolher', 'Quando é o seu aniversário?', 'Para eu poder te dar parabéns no dia. Dá para pular.'],
  ja: ['{n}歳', 'フィットネスへようこそ', '食事へようこそ', 'ワークアウトを作る、またはワンタップで始める', 'セット・重量・休憩を記録', 'そして成長を時間とともに確認',
    '食べたものをテキスト・写真・音声で記録', '今日の目標まであとどれだけか確認', 'どの食事もコーチに相談', '始める前に、あなたに合ったワークアウトにするための短い質問を少し。',
    '始める前に、数字をあなた用にするための短い質問を少し。', '選ぶ前に', '誕生日はいつですか？', 'その日にお祝いを言うためです。スキップもできます。'],
  'zh-Hans': ['{n} 岁', '欢迎来到健身', '欢迎来到饮食', '制定训练，或一键开始', '记录组数、重量和休息', '并随时间查看进步',
    '用文字、照片或语音记录吃了什么', '看看今天离目标还差多少', '每一餐都可以和教练商量', '开始之前，几个简短的问题，让训练适合你。',
    '开始之前，几个简短的问题，让这些数字属于你。', '选择之前', '你的生日是哪天？', '这样我能在那天祝你生日快乐。也可以跳过。'],
  'zh-Hant': ['{n} 歲', '歡迎來到健身', '歡迎來到飲食', '制定訓練，或一鍵開始', '記錄組數、重量和休息', '並隨時間查看進步',
    '用文字、照片或語音記錄吃了什麼', '看看今天離目標還差多少', '每一餐都可以和教練商量', '開始之前，幾個簡短的問題，讓訓練適合你。',
    '開始之前，幾個簡短的問題，讓這些數字屬於你。', '選擇之前', '你的生日是哪天？', '這樣我能在那天祝你生日快樂。也可以跳過。'],
  ar: ['العمر {n}', 'مرحبًا بك في اللياقة', 'مرحبًا بك في التغذية', 'ابنِ تمرينًا أو ابدأ واحدًا بنقرة', 'سجّل المجموعات والأوزان والراحة', 'وتابع تقدمك مع الوقت',
    'سجّل ما تأكله بالنص أو الصورة أو الصوت', 'اعرف كم تبقّى اليوم مقابل هدفك', 'واستشر المدرب في كل وجبة', 'قبل أن نبدأ، بعض الأسئلة القصيرة لتناسبك التمارين.',
    'قبل أن نبدأ، بعض الأسئلة القصيرة لتكون الأرقام أرقامك.', 'قبل الاختيار', 'متى عيد ميلادك؟', 'لأتمكن من تهنئتك في ذلك اليوم. يمكنك التخطي.'],
};
for (const [l, v] of Object.entries(A)) { const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8')); K.forEach((k, i) => { d[k] = v[i]; }); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); }
const add = (f, m) => { const d = JSON.parse(fs.readFileSync(f, 'utf8')); Object.assign(d, m); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); };
add('data/he-x.json', { 'רואים מול היעד שלך כמה נשאר להיום': 'רואים מול היעד שלכם כמה נשאר להיום', 'לפני שנתחיל, כמה שאלות קצרות, כדי שהאימונים יתאימו לך.': 'לפני שנתחיל, כמה שאלות קצרות, כדי שהאימונים יתאימו לכם.',
  'לפני שנתחיל, כמה שאלות קצרות, כדי שהמספרים יהיו שלך.': 'לפני שנתחיל, כמה שאלות קצרות, כדי שהמספרים יהיו שלכם.', 'מתי יום ההולדת שלך?': 'מתי יום ההולדת שלכם?',
  'כדי שאדע לברך אותך ביום הזה. אפשר גם בלי.': 'כדי שאדע לברך אתכם ביום הזה. אפשר גם בלי.' });
console.log('ok');
