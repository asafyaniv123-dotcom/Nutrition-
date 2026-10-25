/* The setup screen in the first run's look (Asaf, 25 Oct: "where is Beem?",
 * "the design still misses our line"). It was a flat grey form of its own.
 * It now IS the first run's material: the warm sand ground and its window
 * light, Beem at the top (the same mount and moods), the question centred in
 * the first run's type, the first run's raised choices and its button, and
 * "later" as its quiet link. The welcome says "welcome to the nutrition area". */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

rep(`    q=fit?_t('ברוכים הבאים לכושר'):_t('ברוכים הבאים לתזונה');`, `    q=fit?_t('ברוכים הבאים לאזור הכושר'):_t('ברוכים הבאים לאזור התזונה');`);
/* the frame: the door's own classes, and Beem */
rep(`  var h='<div class="as-in"><div class="as-top">'+(pos>0?'<button class="fit-back" onclick="asetMove(-1)">&#8249; '+_t('חזרה')+'</button>':'<span></span>')+
    '<button class="as-later" onclick="asetClose();'+(fit?'renderFitness()':'render()')+'">'+_t('אחר כך')+'</button></div>';
  h+='<div class="as-dots">';for(i=0;i<shown.length;i++)h+='<i class="'+(i<=pos?'on':'')+'"></i>';h+='</div>';
  h+='<div class="as-q">'+q+'</div>'+(why?'<div class="as-why">'+why+'</div>':'')+'<div class="as-body">'+body+'</div>';
  h+='<button class="as-go'+(nudge?' nudge':'')+'" onclick="asetNext()">'+(k==='welcome'?_t('בוא נתחיל'):_t('המשך'))+'</button></div>';
  ov.innerHTML=h;`,
`  var h='<div class="as-in"><div class="as-top">'+(pos>0?'<button class="as-back" onclick="asetMove(-1)" aria-label="'+esc(_t('חזרה'))+'">&#8250;</button>':'<span></span>')+
    '<div class="as-dots">';for(i=0;i<shown.length;i++)h+='<i class="'+(i<=pos?'on':'')+'"></i>';h+='</div><span></span></div>';
  h+='<div class="as-beem'+(k==='welcome'?' big':'')+'" id="as-beem"></div>';
  h+='<div class="as-mid"><div class="dr-q2">'+q+'</div>'+(why?'<div class="dr-w2">'+why+'</div>':'')+'<div class="as-body">'+body+'</div></div>';
  h+='<button class="dr-btn as-go'+(nudge?' nudge':'')+'" onclick="asetNext()">'+(k==='welcome'?_t('בוא נתחיל'):_t('המשך'))+'</button>'+
     '<button class="dr-later" onclick="asetClose();'+(fit?'renderFitness()':'render()')+'">'+_t('אחר כך')+'</button></div>';
  /* Beem stays mounted across steps: the frame is rebuilt, he is moved in */
  var keep=_aset.beemEl;ov.innerHTML=h;var slot=document.getElementById('as-beem');
  if(keep)slot.appendChild(keep);
  else beemKit().then(function(K){var el=document.createElement('div');el.className='as-bm';slot.appendChild(el);_aset&&(_aset.beemEl=el);
    try{_aset.beem=K.mount(el,{play:DOOR_BEEM.smile});}catch(e){}}).catch(function(){});
  if(_aset.beem)try{_aset.beem.play(DOOR_BEEM[k==='welcome'?'glad':'listen']);}catch(e){}`);
/* the choices: the first run's raised rows */
rep(`  return '<button class="as-o'+(on?' on':'')+'" onclick=`, `  return '<button class="dr-r2 as-o'+(on?' on':'')+'" onclick=`);

/* CSS: replace the setup screen's own look with the door's */
const a = s.indexOf('/* the one-time setup screen */\n.as-ov{');
const b = s.indexOf('.gate{margin-top:14px}', a);
if (a < 0 || b < 0) { console.log('css anchor'); process.exit(1); }
s = s.slice(0, a) + `/* the one-time setup screen, in the first run's material */
.as-ov{position:fixed;inset:0;z-index:955;overflow-y:auto;background:#ece3d4;color:#4a453f;
  --nu-ground:#ece3d4;--nu-lit:rgba(255,251,243,.92);--nu-shade:rgba(186,160,124,.46);--nu-shade-soft:rgba(186,160,124,.3);
  --nu-ink:#4a453f;--nu-muted:#5f5850;--nu-amber:#f0a92e}
.as-ov::before{content:"";position:fixed;inset:0 auto auto 0;width:72%;height:520px;pointer-events:none;
  background:radial-gradient(34% 14% at 3% 2%,rgba(255,255,250,.5),transparent 70%),
    linear-gradient(118deg,transparent 6%,rgba(255,255,252,.5) 12%,rgba(255,255,252,.18) 17%,rgba(255,255,252,0) 21%,
      rgba(150,118,80,.05) 24%,rgba(150,118,80,0) 27%,rgba(255,255,252,.28) 31%,rgba(255,255,252,0) 36%,transparent 40%);
  -webkit-mask-image:radial-gradient(120% 90% at 0% 0%,#000 0,#000 30%,transparent 72%);mask-image:radial-gradient(120% 90% at 0% 0%,#000 0,#000 30%,transparent 72%);filter:blur(6px)}
.as-in{position:relative;min-height:100%;max-width:480px;margin:0 auto;padding:calc(env(safe-area-inset-top) + 14px) 24px calc(env(safe-area-inset-bottom) + 16px);
  display:flex;flex-direction:column;text-align:center}
.as-top{display:grid;grid-template-columns:44px 1fr 44px;align-items:center;gap:10px;min-height:44px}
.as-back{width:40px;height:40px;border:none;border-radius:50%;font-family:inherit;font-size:22px;line-height:1;color:var(--nu-muted);cursor:pointer;background:var(--nu-ground);
  box-shadow:-3px -3px 8px var(--nu-lit),4px 5px 11px var(--nu-shade-soft)}
[dir=ltr] .as-back{transform:scaleX(-1)}
.as-dots{display:flex;justify-content:center;gap:6px}
.as-dots i{width:7px;height:7px;border-radius:50%;background:rgba(186,160,124,.45)}
.as-dots i.on{background:var(--nu-amber);box-shadow:0 0 7px rgba(240,169,46,.6)}
.as-beem{width:120px;height:120px;margin:18px auto 8px;flex:none}
.as-beem.big{width:190px;height:190px;margin-top:36px}
.as-beem .as-bm{width:100%;height:100%}
.as-mid{flex:1;display:flex;flex-direction:column;align-items:stretch}
.as-mid .dr-w2{margin-inline:auto}
.as-body{display:grid;gap:12px;margin:8px 0 18px;text-align:start}
.as-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.as-o{display:flex;flex-direction:column;align-items:flex-start;gap:2px;cursor:pointer}
.as-grid .as-o{align-items:center;text-align:center;padding:15px 6px}
.as-o b{font-size:17px;font-weight:800}.as-o span{font-size:13.5px;font-weight:600;color:var(--nu-muted)}
.as-o.on b::before{content:"\\2713  ";color:#336843}
.as-row{display:flex;align-items:center;gap:10px}
.as-row .pf-in{min-height:58px;font-size:22px;background:var(--nu-ground);box-shadow:inset 3px 4px 9px var(--nu-shade),inset -3px -3px 8px var(--nu-lit)}
.as-pts{margin:6px auto 0;padding:0;list-style:none;display:grid;gap:14px;text-align:start;max-width:340px}
.as-pts li{position:relative;padding-inline-start:22px;font-size:17px;font-weight:700;line-height:1.45}
.as-pts li::before{content:"";position:absolute;inset-inline-start:2px;top:9px;width:8px;height:8px;border-radius:50%;background:var(--nu-amber);box-shadow:0 0 7px rgba(240,169,46,.6)}
.as-mid .as-pts+.as-why,.as-body .as-why{font-size:15px;line-height:1.55;color:var(--nu-muted);margin-top:16px;text-align:center}
.as-go{margin-top:6px}
.as-go.nudge{animation:as-nudge .35s}
@keyframes as-nudge{25%{transform:translateX(6px)}75%{transform:translateX(-6px)}}
.bw{gap:2px}
.bw .dr-col{width:28%}.bw .bw-m{width:40%}
.bw .dr-col div{font-size:21px}
.bw-age{text-align:center;font-size:15px;font-weight:800;color:var(--nu-muted,#6d675e);margin-top:12px;min-height:20px}
.pf-bd{cursor:pointer;font-size:15px}
` + s.slice(b);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
const A = { en: ['Welcome to nutrition', 'Welcome to fitness'], de: ['Willkommen im Bereich Ernährung', 'Willkommen im Bereich Fitness'], es: ['Bienvenido al área de alimentación', 'Bienvenido al área de ejercicio'],
  fr: ['Bienvenue dans l’espace nutrition', 'Bienvenue dans l’espace sport'], it: ['Benvenuto nell’area alimentazione', 'Benvenuto nell’area allenamento'], pt: ['Bem-vindo à área de alimentação', 'Bem-vindo à área de treino'],
  ja: ['食事エリアへようこそ', 'フィットネスエリアへようこそ'], 'zh-Hans': ['欢迎来到饮食区', '欢迎来到健身区'], 'zh-Hant': ['歡迎來到飲食區', '歡迎來到健身區'], ar: ['مرحبًا بك في قسم التغذية', 'مرحبًا بك في قسم اللياقة'] };
for (const [l, v] of Object.entries(A)) { const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  delete d['ברוכים הבאים לתזונה']; delete d['ברוכים הבאים לכושר']; d['ברוכים הבאים לאזור התזונה'] = v[0]; if (!d['ברוכים הבאים לאזור הכושר']) d['ברוכים הבאים לאזור הכושר'] = v[1];
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); }
console.log('ok');
