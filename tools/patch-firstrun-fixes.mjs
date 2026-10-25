/* Five from the phone (Asaf, 25 Oct, the first run and the first areas):
 *  1. typing a name, Beem looked up and down on every key - "think" now
 *     starts once, when typing starts, and he listens again after a pause;
 *  2. the areas question gets "all" - one chip that picks every area, and
 *     unpicks them when all are on;
 *  5. the card that popped up on the first visit to each area is gone: the
 *     area explains itself on its own first screen, and the card only stood
 *     between the person and it;
 *  6. the birth date box was invisible on the iPhone - an empty date input
 *     collapses there; it is a full box with a "choose a date" line now;
 *  7. "starting target, fill in your profile" sat as a raised slab over the
 *     bars - it is a quiet line with an arrow. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* 1 */
rep(`  doorBeem('think');clearTimeout(_dr.tq);_dr.tq=setTimeout(function(){doorBeem('listen');},900);`,
    `  /* once, when typing starts - not on every key, which read as a twitch */
  if(!_dr.thinking){_dr.thinking=1;doorBeem('think');}
  clearTimeout(_dr.tq);_dr.tq=setTimeout(function(){_dr.thinking=0;doorBeem('listen');},1200);`);
/* 2 */
rep(`    return h+'</div></div><button class="dr-btn" id="dr-g4" onclick="doorAreas()"'+(_doorPick.length?'':' disabled')+'>'+_t('אפשר להמשיך')+'</button>';`,
    `    h+='<button class="dr-chip dr-all'+(doorAllOn()?' on':'')+'" style="animation-delay:'+(.35+k*.06).toFixed(2)+'s" onclick="doorChipAll(this)">'+_t('הכל')+'</button>';
    return h+'</div></div><button class="dr-btn" id="dr-g4" onclick="doorAreas()"'+(_doorPick.length?'':' disabled')+'>'+_t('אפשר להמשיך')+'</button>';`);
rep(`function doorChip(id,el){`, `function doorAllIds(){return HOME_AREAS.filter(function(a){return !a.fixed;}).map(function(a){return a.id;});}
function doorAllOn(){var ids=doorAllIds();return ids.length&&ids.every(function(x){return _doorPick.indexOf(x)>=0;});}
function doorChipAll(el){
  var on=!doorAllOn();_doorPick=on?doorAllIds():[];
  [].forEach.call(document.querySelectorAll('.dr-chips .dr-chip:not(.dr-all)'),function(b){b.classList.toggle('on',on);});
  if(el)el.classList.toggle('on',on);
  doorBeem(on?'nod':'listen');
  var g=document.getElementById('dr-g4');if(g)g.disabled=!_doorPick.length;
}
function doorChip(id,el){`);
rep(`  var b=document.getElementById('dr-g4');if(b)b.disabled=!_doorPick.length;
}`, `  var b=document.getElementById('dr-g4');if(b)b.disabled=!_doorPick.length;
  var al=document.querySelector('.dr-all');if(al)al.classList.toggle('on',doorAllOn());
}`);
/* 5 */
rep(`  setTimeout(function(){areaIntroMaybe(mod);},450);\n`, `  /* (the first-visit card is gone: each area explains itself) */\n`);
/* 6 */
rep(`    return '<div class="pf-row"><input class="pf-in" type="date" value="" onchange="profSet(\\u0027birth\\u0027,this.value)"></div>';`,
    `    return '<label class="pf-row fq-date"><input class="pf-in" type="date" value="" onchange="profSet(\\u0027birth\\u0027,this.value)"><span>'+_t('בחירת תאריך')+'</span></label>';`);
/* 6, 7: CSS */
rep(`.pf-in:focus{`, `.fq-date{position:relative;display:block}
.fq-date input{display:block;width:100%;min-height:52px;-webkit-appearance:none;appearance:none;text-align:center}
.fq-date span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--nu-muted);pointer-events:none}
.fq-date input:valid+span{display:none}
.fq-date input[value=""]:not(:focus){color:transparent}
.macro-guess{display:block;width:100%;border:none;background:none!important;box-shadow:none!important;padding:0 2px 10px;font-family:inherit;
  font-size:12.5px;font-weight:700;color:var(--nu-muted);text-align:start;cursor:pointer}
.macro-guess::after{content:" \\2039";font-size:15px}
.pf-in:focus{`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
const A = { en: 'All', de: 'Alle', es: 'Todo', fr: 'Tout', it: 'Tutto', pt: 'Tudo', ja: 'すべて', 'zh-Hans': '全部', 'zh-Hant': '全部', ar: 'الكل' };
const B = { en: 'Choose a date', de: 'Datum wählen', es: 'Elegir una fecha', fr: 'Choisir une date', it: 'Scegli una data', pt: 'Escolher uma data', ja: '日付を選ぶ', 'zh-Hans': '选择日期', 'zh-Hant': '選擇日期', ar: 'اختر تاريخًا' };
for (const l of Object.keys(A)) { const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8')); if (!d['הכל']) d['הכל'] = A[l]; d['בחירת תאריך'] = B[l]; fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); }
console.log('ok');
