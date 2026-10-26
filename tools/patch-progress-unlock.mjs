/* "My progress" appears only once there is a week to show (Asaf, 26 Oct: "the
 * progress button should appear after a week of tracking something... Mip
 * shows it the first time and explains the new button, which is a little lit;
 * not there from the start, and no 'not enough data'").
 * A tracker is ready when its first record is at least seven app-days old and
 * it has records on at least three days. A way in shows only when one of its
 * trackers is ready. The first time any appears, Mip comes up beside it and
 * says what it is; the button stays lit until it has been opened once. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
const a = s.indexOf(`function prgEntryHTML(group){`), b = s.indexOf(`// Build home screen DOM`, a);
if (a < 0 || b < 0) { console.log('entry'); process.exit(1); }
s = s.slice(0, a) + `/* ── WHEN IT APPEARS ──
   the app-days each tracker has something on, over the last eight weeks */
function prgDaysOf(k){
  var D={},i,d;
  if(k==='weight'){var W=loadWeights();for(d in W)if(typeof W[d]==='number'&&d>=dayShift(-55))D[d]=1;}
  else if(k==='strength'||k==='volume'){var L=loadWorkoutLog();for(i=0;i<L.length;i++){d=appDayOf(L[i].date);if(d>=dayShift(-55))D[d]=1;}}
  else if(k==='hobbies'){var H=loadHabitLog(),key;for(key in H){d=key.slice(key.lastIndexOf('__')+2);if(hbMin(H[key])&&d>=dayShift(-55))D[d]=1;}}
  else for(i=-55;i<=0;i++){d=dayShift(i);
    if(k==='food'&&loadDay(d).meals.length)D[d]=1;
    else if(k==='water'&&loadDay(d).water)D[d]=1;
    else if(k==='steps'&&stepsOf(d))D[d]=1;
    else if(k==='mood'){var r=loadSummary(d);if(r&&(r.mood||r.dayRating))D[d]=1;}}
  return Object.keys(D).sort();
}
function prgReady(k){var D=prgDaysOf(k);return D.length>=3&&D[0]<=dayShift(-7);}
function prgGroupReady(g){return (PRG_GROUPS[g]||[]).some(function(k){return k!=='book'&&prgReady(k);});}
var PRG_SEEN='prg_seen',PRG_INTRO='prg_intro';
function prgFlag(k){try{return !!localStorage.getItem(k);}catch(e){return false;}}
function prgEntryHTML(group){
  if(!prgGroupReady(group))return '';
  var lit=!prgFlag(PRG_SEEN);
  if(!prgFlag(PRG_INTRO))setTimeout(prgIntro,700);
  return '<button class="prg-entry'+(lit?' lit':'')+'" id="prg-entry" onclick="prgEntryGo(\\''+group+'\\')"><span><svg viewBox="0 0 24 24"><path d="M4 17l5-5 4 3 7-8"/><path d="M15 7h5v5"/></svg>'+_t('ההתקדמות שלי')+'</span><i>&rsaquo;</i></button>';
}
function prgEntryGo(group){try{localStorage.setItem(PRG_SEEN,'1');}catch(e){}var e=document.getElementById('prg-entry');if(e)e.classList.remove('lit');prgOpen(group);}
/* the first time: Mip beside the new button, saying what it is */
function prgIntro(){
  var btn=document.getElementById('prg-entry');if(!btn||prgFlag(PRG_INTRO)||document.getElementById('prg-hi'))return;
  try{localStorage.setItem(PRG_INTRO,'1');}catch(e){}
  btn.scrollIntoView({block:'center',behavior:'smooth'});
  var ov=document.createElement('div');ov.className='prg-hi';ov.id='prg-hi';
  ov.innerHTML='<div class="prg-hc"><div class="prg-hm" id="prg-hm"></div><b>'+_t('שבוע של מעקב')+'</b>'+
    '<p>'+_t('מעכשיו יש כאן כפתור חדש: ההתקדמות שלי. בו רואים איך דברים זזים לאורך השבועות.')+'</p>'+
    '<div class="prg-hb"><button class="prg-hgo">'+_t('להראות לי')+'</button><button class="prg-hno">'+_t('אחר כך')+'</button></div></div>';
  document.body.appendChild(ov);
  var close=function(){if(ov.parentNode)ov.parentNode.removeChild(ov);};
  ov.querySelector('.prg-hno').onclick=close;ov.onclick=function(e){if(e.target===ov)close();};
  ov.querySelector('.prg-hgo').onclick=function(){close();btn.click();};
  beemKit().then(function(K){var el=document.getElementById('prg-hm');if(el)K.mount(el,{play:DOOR_BEEM.glad});}).catch(function(){});
}
` + s.slice(b);
rep(`.prg-entry i{font-style:normal;color:var(--nu-muted,#6d675e)}`, `.prg-entry i{font-style:normal;color:var(--nu-muted,#6d675e)}
/* new, and not yet opened: a little lit */
.prg-entry.lit{box-shadow:-4px -4px 10px var(--nu-lit,rgba(255,255,255,.95)),5px 6px 13px var(--nu-shade-soft,rgba(168,160,148,.3)),0 0 0 1.5px rgba(240,169,46,.35),0 0 18px rgba(240,169,46,.35);
  animation:prg-glow 2.4s ease-in-out infinite}
@keyframes prg-glow{50%{box-shadow:-4px -4px 10px rgba(255,255,255,.95),5px 6px 13px rgba(168,160,148,.3),0 0 0 1.5px rgba(240,169,46,.55),0 0 26px rgba(240,169,46,.5)}}
.prg-hi{position:fixed;inset:0;z-index:960;display:flex;align-items:flex-end;justify-content:center;background:rgba(74,69,63,.18);padding:0 14px calc(env(safe-area-inset-bottom) + 100px)}
.prg-hc{width:100%;max-width:420px;text-align:center;padding:10px 22px 20px;border-radius:26px;background:#e9e7e3;color:#4a453f;
  box-shadow:-5px -5px 14px rgba(255,255,255,.9),8px 10px 26px rgba(120,100,80,.25);animation:prg-up .5s cubic-bezier(.22,.61,.36,1)}
@keyframes prg-up{from{transform:translateY(30px);opacity:0}}
.prg-hm{width:110px;height:110px;margin:-50px auto 2px}
.prg-hc b{display:block;font-size:20px;font-weight:800}
.prg-hc p{margin:6px 0 16px;font-size:15px;line-height:1.55;color:#5f5850}
.prg-hb{display:flex;gap:10px;justify-content:center}
.prg-hb button{border:none;border-radius:999px;padding:11px 20px;font-family:inherit;font-size:15px;font-weight:800;cursor:pointer;color:#4a453f;background:#e9e7e3;
  box-shadow:-3px -3px 8px rgba(255,255,255,.95),4px 5px 11px rgba(168,160,148,.3)}
.prg-hb .prg-hno{background:transparent;box-shadow:none;color:#6d675e}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
const T = {
  'שבוע של מעקב': ['A week of tracking', 'Eine Woche Tracking', 'Una semana de registro', 'Une semaine de suivi', 'Una settimana di registrazioni', 'Uma semana de registros', '1週間の記録', '记录满一周', '記錄滿一週', 'أسبوع من التتبّع'],
  'מעכשיו יש כאן כפתור חדש: ההתקדמות שלי. בו רואים איך דברים זזים לאורך השבועות.': ['From now on there’s a new button here: My progress. It shows how things move over the weeks.', 'Ab jetzt gibt es hier einen neuen Knopf: Mein Fortschritt. Er zeigt, wie sich die Dinge über die Wochen bewegen.', 'Desde ahora hay un botón nuevo aquí: Mi progreso. Muestra cómo cambian las cosas a lo largo de las semanas.', 'Désormais, il y a ici un nouveau bouton : Mes progrès. Il montre comment les choses évoluent au fil des semaines.', 'Da ora c’è un nuovo pulsante qui: I miei progressi. Mostra come cambiano le cose nelle settimane.', 'A partir de agora há um botão novo aqui: Meu progresso. Ele mostra como as coisas mudam ao longo das semanas.', 'ここに新しいボタンができました：わたしの進み具合。週ごとの変化が見られます。', '从现在起这里有一个新按钮：我的进展。它显示事情在几周里怎样变化。', '從現在起這裡有一個新按鈕：我的進展。它顯示事情在幾週裡怎樣變化。', 'من الآن يوجد هنا زر جديد: تقدّمي. يعرض كيف تتغيّر الأمور على مرّ الأسابيع.'],
  'להראות לי': ['Show me', 'Zeig es mir', 'Muéstramelo', 'Montre-moi', 'Fammi vedere', 'Me mostre', '見せて', '给我看看', '給我看看', 'أرني'],
};
['en', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar'].forEach((l, i) => { const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8')); for (const k in T) if (!d[k]) d[k] = T[k][i]; fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); });
console.log('ok');
