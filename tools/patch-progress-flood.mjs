/* The new progress button, impossible to miss (Asaf, 26 Oct: "it should flood
 * the screen - not only on entering Me - and point to the new button").
 * The first time a week of tracking exists, wherever the app is opened, Mip's
 * full-screen moment floods it (the same building block as the birthday): a
 * burst of beads, "a week of tracking", what the button is, and one button.
 * Pressing it takes the person to Me and puts a spotlight on the new button -
 * everything else dimmed, a ring of light breathing around it - and a tap
 * there opens it. Once only; the button stays lit until it is opened. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`  var lit=!prgFlag(PRG_SEEN);
  if(!prgFlag(PRG_INTRO))setTimeout(prgIntro,700);
`, `  var lit=!prgFlag(PRG_SEEN);
`);
const a = s.indexOf(`/* the first time: Mip beside the new button, saying what it is */
function prgIntro(){`), b = s.indexOf(`// Build home screen DOM`, a);
if (a < 0 || b < 0) { console.log('intro'); process.exit(1); }
s = s.slice(0, a) + `/* the first time: Mip floods the screen, wherever the app is, then lights the
   way to the new button */
function prgUnlockCheck(){
  try{
    if(prgFlag(PRG_INTRO)||!doorDone()||document.getElementById('prg'))return;
    if(!['nutrition','fitness','me'].some(prgGroupReady))return;
    localStorage.setItem(PRG_INTRO,'1');
    beemKit().then(function(K){
      K.screen({bg:'#7a64b0',ink:'#ffffff',accent:'#3f2f6e',play:DOOR_BEEM.glad,beads:true,
        title:_t('שבוע של מעקב'),
        sub:_t('מעכשיו יש כפתור חדש: ההתקדמות שלי. בו רואים איך דברים זזים לאורך השבועות.'),
        button:_t('להראות לי'),onClose:prgSpot});
    }).catch(function(){});
  }catch(e){}
}
/* everything dimmed but the new button, a ring of light breathing round it */
function prgSpot(){
  showMain('me');
  setTimeout(function(){
    var btn=document.getElementById('prg-entry');if(!btn)return;
    btn.scrollIntoView({block:'center'});
    setTimeout(function(){
      var r=btn.getBoundingClientRect(),sp=document.createElement('div');sp.className='prg-spot';sp.id='prg-spot';
      sp.innerHTML='<i style="left:'+(r.left-8)+'px;top:'+(r.top-8)+'px;width:'+(r.width+16)+'px;height:'+(r.height+16)+'px"></i>'+
        '<span style="top:'+(r.bottom+22)+'px">'+_t('הכפתור החדש שלך')+'</span>';
      document.body.appendChild(sp);
      var done=function(open){if(sp.parentNode)sp.parentNode.removeChild(sp);if(open)btn.click();};
      sp.onclick=function(e){var x=e.clientX,y=e.clientY;done(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom);};
    },350);
  },400);
}
window.addEventListener('load',function(){setTimeout(prgUnlockCheck,2600);});
document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(prgUnlockCheck,1200);});
` + s.slice(b);
rep(`.prg-hi{position:fixed;`, `.prg-spot{position:fixed;inset:0;z-index:960;cursor:pointer;animation:prg-fade .4s ease}
@keyframes prg-fade{from{opacity:0}}
.prg-spot i{position:fixed;border-radius:24px;box-shadow:0 0 0 9999px rgba(43,39,36,.62),0 0 0 3px rgba(240,169,46,.9),0 0 26px 6px rgba(240,169,46,.7);animation:prg-ring 1.8s ease-in-out infinite}
@keyframes prg-ring{50%{box-shadow:0 0 0 9999px rgba(43,39,36,.62),0 0 0 5px rgba(240,169,46,.95),0 0 40px 12px rgba(240,169,46,.8)}}
.prg-spot span{position:fixed;left:0;right:0;text-align:center;font-size:18px;font-weight:800;color:#fff8ec;text-shadow:0 2px 10px rgba(0,0,0,.4)}
.prg-hi{position:fixed;`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
const T = {
  'מעכשיו יש כפתור חדש: ההתקדמות שלי. בו רואים איך דברים זזים לאורך השבועות.': ['From now on there’s a new button: My progress. It shows how things move over the weeks.', 'Ab jetzt gibt es einen neuen Knopf: Mein Fortschritt. Er zeigt, wie sich die Dinge über die Wochen bewegen.', 'Desde ahora hay un botón nuevo: Mi progreso. Muestra cómo cambian las cosas a lo largo de las semanas.', 'Désormais, il y a un nouveau bouton : Mes progrès. Il montre comment les choses évoluent au fil des semaines.', 'Da ora c’è un nuovo pulsante: I miei progressi. Mostra come cambiano le cose nelle settimane.', 'A partir de agora há um botão novo: Meu progresso. Ele mostra como as coisas mudam ao longo das semanas.', '新しいボタンができました：わたしの進み具合。週ごとの変化が見られます。', '现在有一个新按钮：我的进展。它显示事情在几周里怎样变化。', '現在有一個新按鈕：我的進展。它顯示事情在幾週裡怎樣變化。', 'يوجد الآن زر جديد: تقدّمي. يعرض كيف تتغيّر الأمور على مرّ الأسابيع.'],
  'הכפתור החדש שלך': ['Your new button', 'Dein neuer Knopf', 'Tu botón nuevo', 'Ton nouveau bouton', 'Il tuo nuovo pulsante', 'Seu botão novo', 'あなたの新しいボタン', '你的新按钮', '你的新按鈕', 'زرّك الجديد'],
};
['en', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'ar'].forEach((l, i) => { const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  delete d['מעכשיו יש כאן כפתור חדש: ההתקדמות שלי. בו רואים איך דברים זזים לאורך השבועות.']; for (const k in T) d[k] = T[k][i]; fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); });
console.log('ok');
