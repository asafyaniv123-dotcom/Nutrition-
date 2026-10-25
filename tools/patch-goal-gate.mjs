/* The first time in fitness or nutrition opens with one question, in the
 * area's own question card - "do you have a goal here?" (Asaf, 25 Oct; the
 * prototype's flow, the app's design). Yes opens the goals; No asks once
 * more, "would you like to add one?", and Yes there opens the same goals.
 * "Not now" goes on: fitness to its remaining questions with no outcome
 * chosen (general health), nutrition with "keep my weight" - the goal the
 * targets would assume anyway - so the rest of the questions still mean
 * something. The gate's state is per area: _gate[area] = '' | 'add' | 'pick'. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* the gate itself, beside the question frames */
rep(`function fqStepHTML(k,p){`, `/* ── DO YOU HAVE A GOAL? ── the door in front of the goal question */
var _gate={fitness:'',nutrition:''};
function gateHTML(area){
  var st=_gate[area]||'',fit=area==='fitness',h='<div class="gate">';
  if(st==='add'){
    h+='<div class="gate-s">'+(fit?_t('מטרה עוזרת לבנות לך אימון שמתאים לך: כמה חזרות, כמה מנוחה, ומתי להעלות משקל.')
                              :_t('מטרה קובעת את יעד הקלוריות והחלבון שלך. בלי מטרה נשמור על המשקל הנוכחי.'))+'</div>';
    h+='<button class="gn-go" onclick="gateSet(\\''+area+'\\',\\'pick\\')">'+_t('כן, בוא נבחר')+'</button>';
    h+='<button class="fq-later" onclick="gateNone(\\''+area+'\\')">'+_t('לא עכשיו')+'</button>';
  } else {
    h+='<div class="gate-yn"><button class="fg-b fq-o" onclick="gateSet(\\''+area+'\\',\\'pick\\')">'+_t('כן, יש לי מטרה')+'</button>'+
       '<button class="fg-b fq-o" onclick="gateSet(\\''+area+'\\',\\'add\\')">'+_t('לא')+'</button></div>';
  }
  return h+'</div>';
}
function gateQuestion(area){
  if(_gate[area]==='add')return _t('תרצה להוסיף מטרה?');
  return area==='fitness'?_t('יש לך מטרה בכושר?'):_t('יש לך מטרה בתזונה?');
}
function gateSet(area,st){_gate[area]=st;if(area==='fitness')renderFitness();else render();}
function gateNone(area){
  _gate[area]='';
  if(area==='fitness'){var o=fitMe();o.out=[];o.outDone=1;try{localStorage.setItem(FIT_ME_KEY,JSON.stringify(o));}catch(e){}renderFitness();}
  else profSet('goal','keep');
}
function fqStepHTML(k,p){`);

/* nutrition: the goal step goes through the gate */
rep(`  return fqFrameHTML({
    area:'nutrition',
    q:fqQuestion(left[0]),`, `  var gated=left[0]==='goal'&&_gate.nutrition!=='pick';
  return fqFrameHTML({
    area:'nutrition',
    q:gated?gateQuestion('nutrition'):fqQuestion(left[0]),`);
rep(`    body:fqStepHTML(left[0],p),`, `    body:gated?gateHTML('nutrition'):fqStepHTML(left[0],p),`);
/* fitness: the outcome step goes through the gate */
rep(`    h+='<div style="font-size:18px;font-weight:800;color:var(--ink);margin-top:6px;line-height:1.35">'+fitMeQuestion(k)+'</div>';
    h+='<div class="gn-s">'+fitMeWhy(k)+'</div>';
    h+=fitMeBody(k);`, `    var gatedF=k==='out'&&_gate.fitness!=='pick';
    h+='<div style="font-size:18px;font-weight:800;color:var(--ink);margin-top:6px;line-height:1.35">'+(gatedF?gateQuestion('fitness'):fitMeQuestion(k))+'</div>';
    if(!gatedF)h+='<div class="gn-s">'+fitMeWhy(k)+'</div>';
    h+=gatedF?gateHTML('fitness'):fitMeBody(k);`);
rep(`.fss-g{`, `.gate{margin-top:14px}
.gate-yn{display:grid;gap:10px}
.gate-yn .fq-o{text-align:center;justify-content:center;font-size:16px;padding:16px}
.gate-s{font-size:14px;line-height:1.6;color:var(--nu-muted,#6d675e);margin:-4px 0 14px}
.fss-g{`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);

const K = ['מטרה עוזרת לבנות לך אימון שמתאים לך: כמה חזרות, כמה מנוחה, ומתי להעלות משקל.', 'מטרה קובעת את יעד הקלוריות והחלבון שלך. בלי מטרה נשמור על המשקל הנוכחי.', 'כן, בוא נבחר', 'לא עכשיו', 'כן, יש לי מטרה', 'לא', 'תרצה להוסיף מטרה?', 'יש לך מטרה בכושר?', 'יש לך מטרה בתזונה?'];
const A = {
  en: ['A goal helps build a workout that fits you: how many reps, how much rest, and when to add weight.', 'A goal sets your calorie and protein targets. Without one we keep you at your current weight.', 'Yes, let’s choose', 'Not now', 'Yes, I have a goal', 'No', 'Would you like to add a goal?', 'Do you have a fitness goal?', 'Do you have a nutrition goal?'],
  de: ['Ein Ziel hilft, ein passendes Training zu bauen: wie viele Wiederholungen, wie viel Pause und wann mehr Gewicht.', 'Ein Ziel legt deine Kalorien- und Proteinziele fest. Ohne Ziel halten wir dein jetziges Gewicht.', 'Ja, lass uns wählen', 'Nicht jetzt', 'Ja, ich habe ein Ziel', 'Nein', 'Möchtest du ein Ziel festlegen?', 'Hast du ein Fitnessziel?', 'Hast du ein Ernährungsziel?'],
  es: ['Un objetivo ayuda a crear un entrenamiento a tu medida: cuántas repeticiones, cuánto descanso y cuándo subir peso.', 'Un objetivo fija tus metas de calorías y proteína. Sin uno, te mantenemos en tu peso actual.', 'Sí, elijamos', 'Ahora no', 'Sí, tengo un objetivo', 'No', '¿Quieres añadir un objetivo?', '¿Tienes un objetivo de ejercicio?', '¿Tienes un objetivo de alimentación?'],
  fr: ['Un objectif aide à construire une séance qui te correspond : combien de répétitions, combien de repos, et quand augmenter la charge.', 'Un objectif fixe tes cibles de calories et de protéines. Sans objectif, on te maintient à ton poids actuel.', 'Oui, choisissons', 'Pas maintenant', 'Oui, j’ai un objectif', 'Non', 'Veux-tu ajouter un objectif ?', 'As-tu un objectif sportif ?', 'As-tu un objectif alimentaire ?'],
  it: ['Un obiettivo aiuta a creare un allenamento adatto a te: quante ripetizioni, quanto recupero e quando aumentare il peso.', 'Un obiettivo stabilisce i tuoi target di calorie e proteine. Senza, ti manteniamo al peso attuale.', 'Sì, scegliamo', 'Non ora', 'Sì, ho un obiettivo', 'No', 'Vuoi aggiungere un obiettivo?', 'Hai un obiettivo di allenamento?', 'Hai un obiettivo alimentare?'],
  pt: ['Um objetivo ajuda a montar um treino que combina com você: quantas repetições, quanto descanso e quando aumentar a carga.', 'Um objetivo define suas metas de calorias e proteína. Sem objetivo, mantemos seu peso atual.', 'Sim, vamos escolher', 'Agora não', 'Sim, tenho um objetivo', 'Não', 'Quer adicionar um objetivo?', 'Você tem um objetivo no treino?', 'Você tem um objetivo na alimentação?'],
  ja: ['目標があると、あなたに合ったワークアウトを作れます：回数、休憩、重量を上げるタイミング。', '目標でカロリーとたんぱく質の目標が決まります。目標がなければ今の体重を保つ設定にします。', 'はい、選びます', '今はしない', 'はい、目標があります', 'いいえ', '目標を追加しますか？', '運動の目標はありますか？', '食事の目標はありますか？'],
  'zh-Hans': ['有目标能帮我们为你制定合适的训练：做几次、休息多久、什么时候加重量。', '目标决定你的热量和蛋白质目标。没有目标时，我们按维持当前体重来设定。', '好，我们来选', '先不了', '有，我有目标', '没有', '要添加一个目标吗？', '你有健身目标吗？', '你有饮食目标吗？'],
  'zh-Hant': ['有目標能幫我們為你制定合適的訓練：做幾次、休息多久、什麼時候加重量。', '目標決定你的熱量和蛋白質目標。沒有目標時，我們依維持目前體重來設定。', '好，我們來選', '先不要', '有，我有目標', '沒有', '要新增一個目標嗎？', '你有健身目標嗎？', '你有飲食目標嗎？'],
  ar: ['الهدف يساعدنا على بناء تمرين يناسبك: كم تكرارًا، وكم راحة، ومتى تزيد الوزن.', 'الهدف يحدد هدف السعرات والبروتين لديك. بلا هدف نحافظ على وزنك الحالي.', 'نعم، لنختر', 'ليس الآن', 'نعم، لدي هدف', 'لا', 'هل تريد إضافة هدف؟', 'هل لديك هدف في اللياقة؟', 'هل لديك هدف في التغذية؟'],
};
for (const [l, v] of Object.entries(A)) { const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8')); K.forEach((k, i) => { if (!(k in d)) d[k] = v[i]; }); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); }
const add = (f, m) => { const d = JSON.parse(fs.readFileSync(f, 'utf8')); Object.assign(d, m); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); };
add('data/he-f.json', { 'תרצה להוסיף מטרה?': 'תרצי להוסיף מטרה?' });
add('data/he-x.json', { 'תרצה להוסיף מטרה?': 'תרצו להוסיף מטרה?', 'יש לך מטרה בכושר?': 'יש לכם מטרה בכושר?', 'יש לך מטרה בתזונה?': 'יש לכם מטרה בתזונה?',
  'כן, יש לי מטרה': 'כן, יש לנו מטרה', 'מטרה עוזרת לבנות לך אימון שמתאים לך: כמה חזרות, כמה מנוחה, ומתי להעלות משקל.': 'מטרה עוזרת לבנות לכם אימון שמתאים לכם: כמה חזרות, כמה מנוחה, ומתי להעלות משקל.',
  'מטרה קובעת את יעד הקלוריות והחלבון שלך. בלי מטרה נשמור על המשקל הנוכחי.': 'מטרה קובעת את יעד הקלוריות והחלבון שלכם. בלי מטרה נשמור על המשקל הנוכחי.' });
console.log('ok');
