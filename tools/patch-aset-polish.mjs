/* Asaf on the nutrition setup, from his phone (26 Oct):
 * 1. every step needs a visible "חזרה" - the round ‹ was not read as one; and
 *    the goals screen gets one too, back to the last question
 * 2. Mip's eyes moved on every tap - he now looks up only when the step
 *    changes, not on every repaint
 * 3. the "I understand" card did not look pressable - it becomes a checkbox
 *    row: an empty circle, filled and ticked when agreed
 * 4. "129ג" on the goals screen - whole words: grams, and litres of water */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

/* 1 - the back pill */
rep(`'<button class="as-back" onclick="asetMove(-1)" aria-label="'+esc(_t('חזרה'))+'">&#8249;</button>'`,
  `'<button class="as-back" onclick="asetMove(-1)"><span>&#8249;</span> '+_t('חזרה')+'</button>'`);
rep(`.as-top{display:grid;grid-template-columns:44px 1fr 44px;align-items:center;gap:10px;min-height:44px}`,
  `.as-top{display:grid;grid-template-columns:96px 1fr 96px;align-items:center;gap:6px;min-height:44px}`);
rep(`.as-back{width:40px;height:40px;border:none;border-radius:50%;font-family:inherit;font-size:22px;line-height:1;`,
  `.as-back{justify-self:start;height:40px;padding:0 14px;white-space:nowrap;border:none;border-radius:999px;font-family:inherit;font-size:14.5px;font-weight:800;line-height:1;`);
rep(`.as-dots{display:flex;justify-content:center;gap:6px}`, `.as-dots{display:flex;justify-content:center;gap:6px}
.as-back span{font-size:20px;vertical-align:-1px}`);

/* 2 - Mip reacts to a new step, not to a repaint */
rep(`  if(_aset.beem)try{_aset.beem.play(DOOR_BEEM[k==='welcome'?'glad':'listen']);}catch(e){}
  if(k==='birth')bwInit('as-b',t.birth);`,
`  if(_aset.beem&&_aset.playedAt!==_aset.i){_aset.playedAt=_aset.i;try{_aset.beem.play(DOOR_BEEM[k==='welcome'?'glad':'listen']);}catch(e){}}
  if(k==='birth')bwInit('as-b',t.birth);`);

/* 3 - the agreement as a checkbox */
rep(`  if(k==='hack'){q=_t('לפני שבוחרים');body=asetChoice(`, `  if(k==='hack'){q=_t('לפני שבוחרים');body=asetChk(`);
rep(`function asetChoice(f,v,label,sub,multi){`, `/* an agreement reads as one: a circle that fills and ticks */
function asetChk(f,v,label,sub,multi){return asetChoice(f,v,label,sub,multi).replace('class="dr-r2 as-o','class="dr-r2 as-o as-chk');}
function asetChoice(f,v,label,sub,multi){`);
rep(`.as-o.on b::before{content:"\\2713  ";color:#336843}`, `.as-o.on b::before{content:"\\2713  ";color:#336843}
.as-o.as-chk{flex-direction:row;align-items:flex-start;gap:14px}
.as-o.as-chk::before{content:"";flex:none;width:28px;height:28px;margin-top:2px;border-radius:50%;
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.as-o.as-chk.on::before{content:"\\2713";display:grid;place-items:center;background:#3f7a4f;color:#fff;font-weight:800;font-size:16px;box-shadow:none}
.as-o.as-chk.on b::before{content:none}`);

/* 4 - whole words, and a way back from the goals */
rep(`  var T0=TARGETS,p=loadProfile(),i,
      tubes=[[_t('חלבון'),fmtGrams(T0.p),'#c7b2e8','#a690cf'],[_t('פחמימה'),fmtGrams(T0.c),'#f3c98a','#e9a24f'],
             [_t('שומן'),fmtGrams(T0.f),'#f2b2a0','#e48a73'],[_t('מים'),fmtVolume(T0.water),'#bcd6ee','#8db8e0']];
  var h='<div class="as-in"><div class="as-top"><span></span><span></span><span></span></div>'+`,
`  var T0=TARGETS,p=loadProfile(),i,
      gr=function(n){return nfmt(n)+' '+_t('גרם');},
      wl=APP_UNITS==='imperial'?fmtVolume(T0.water):_t('{n} ליטר',{n:Math.round(T0.water/100)/10}),
      tubes=[[_t('חלבון'),gr(T0.p),'#c7b2e8','#a690cf'],[_t('פחמימה'),gr(T0.c),'#f3c98a','#e9a24f'],
             [_t('שומן'),gr(T0.f),'#f2b2a0','#e48a73'],[_t('מים'),wl,'#bcd6ee','#8db8e0']];
  var h='<div class="as-in"><div class="as-top"><button class="as-back" onclick="asetGoalsBack()"><span>&#8249;</span> '+_t('חזרה')+'</button><span></span><span></span></div>'+`);
rep(`function asetGoals(){`, `/* back from the goals to the last question; finishing again saves again */
function asetGoalsBack(){if(!_aset)return;var i=_aset.steps.length-1;while(i>0&&asetSkip(_aset.steps[i]))i--;_aset.i=i;asetPaint();}
function asetGoals(){`);

/* the litre in Hebrew does not inflect */
rep(`  'עוד {n} דקות':{one:'עוד דקה',two:'עוד שתי דקות',other:'עוד {n} דקות'},`,
  `  'עוד {n} דקות':{one:'עוד דקה',two:'עוד שתי דקות',other:'עוד {n} דקות'},
  '{n} ליטר':{one:'ליטר אחד',two:'{n} ליטר',other:'{n} ליטר'},`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
