/* Two from the phone (Asaf, 24 Oct):
 *  1. the start sheet "shines too much, it should shout less" - the card's
 *     white halo on a dark, blurred scrim. A lighter scrim, no blur, and a
 *     plain soft shadow. And the order: from my programs, empty, built for
 *     you. Today's plan is no longer its own row: it is what "from my
 *     programs" says under its name, and what it starts when it can.
 *  2. "the back button here does not match the app" - fitness had five kinds
 *     of back: a flat pink-grey chip in eight views, an unchevroned one in
 *     liked workouts, and a full-width slab in the two clock screens. One now:
 *     the raised pill the header's ⌂ בית already is, saying ‹ חזרה. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* 2. one back */
const ST = [
  'style="background:var(--surface);border:none;border-radius:10px;padding:6px 12px;font-size:11px;color:var(--ink-soft);cursor:pointer;font-family:inherit"',
  'style="background:var(--surface);border:none;border-radius:10px;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer;color:var(--muted)"'];
let n = 0;
s = s.replace(/<button onclick="([^"]*)" (style="[^"]*")>(&#8249; )?'\+_t\('חזרה'\)\+'<\/button>/g, (m, on, st) => {
  if (!ST.includes(st)) return m;
  n++;
  return `<button class="fit-back" onclick="${on}">&#8249; '+_t('חזרה')+'</button>`;
});
if (n !== 8) { console.log('expected 8 flat backs, found', n); process.exit(1); }
rep(`  h+='<button class="fv-back" onclick="_fitView=\\'home\\';renderFitness()">'+_t('חזרה')+'</button></div>';`,
    `  h+='<button class="fit-back" onclick="_fitView=\\'home\\';renderFitness()">&#8249; '+_t('חזרה')+'</button></div>';`);
rep(`  h+='<button class="fw-timerhome" style="margin-bottom:14px" onclick="fitTimerBack()">&#8249; '+_t('חזרה')+'</button>';`,
    `  h+='<button class="fit-back" style="margin-bottom:14px" onclick="fitTimerBack()">&#8249; '+_t('חזרה')+'</button>';`);
rep(`  h+='<button class="fw-timerhome" style="margin-bottom:14px" onclick="_fitView=\\'timer\\';renderFitness()">&#8249; '+_t('חזרה')+'</button>';`,
    `  h+='<button class="fit-back" style="margin-bottom:14px" onclick="_fitView=\\'timer\\';renderFitness()">&#8249; '+_t('חזרה')+'</button>';`);
rep(`.fw-timerhome{width:100%;background:#e9e7e3;`, `/* ONE BACK IN FITNESS: the header's ⌂ בית pill, saying ‹ חזרה */
.fit-back{display:inline-flex;align-items:center;gap:4px;border:none;border-radius:20px;padding:6px 13px;font-family:inherit;
  font-size:12px;font-weight:700;color:var(--nu-muted,#6d675e);background:var(--nu-ground,#e9e7e3);cursor:pointer;flex:0 0 auto;
  box-shadow:-3px -3px 6px var(--nu-lit,rgba(255,255,255,.95)),3px 4px 8px var(--nu-shade-soft,rgba(176,168,156,.28))}
.fit-back:active{box-shadow:inset 2px 3px 6px var(--nu-shade,rgba(176,168,156,.44)),inset -2px -2px 5px var(--nu-lit,rgba(255,255,255,.95))}
.fw-timerhome{width:100%;background:#e9e7e3;`);

/* 1. the start sheet, quieter and reordered */
rep(`  if(tp)h+='<button onclick="fitSheetClose();'+(ti>=0?'startWorkout('+ti+')':'_fitView=\\'start\\';renderFitness()')+'"><b>'+esc(fitPlanName(tp))+'</b><span>'+esc(_t('לפי הלוז של היום'))+'</span></button>';
  h+='<button onclick="fitSheetClose();_fitView=\\'build\\';renderFitness()"><b>'+esc(_t('אימון שנבנה לך'))+'</b><span>'+esc(_t('לפי מה שחסר לך השבוע'))+'</span></button>';
  h+='<button onclick="fitSheetClose();_fitView=\\'start\\';renderFitness()"><b>'+esc(_t('מהתוכניות שלי'))+'</b><span>'+
     (tpls.length?esc(tpls.slice(0,3).map(function(t){return t.name;}).join(' · ')):'')+'</span></button>';
  h+='<button onclick="fitSheetClose();startEmptyWorkout()"><b>'+esc(_t('אימון ריק'))+'</b><span>'+esc(_t('מוסיפים תרגילים תוך כדי'))+'</span></button>';`,
`  /* first the plan, then nothing planned, then one built for you. A program
     the schedule names for today starts straight away; otherwise the list. */
  h+='<button onclick="fitSheetClose();'+(ti>=0?'startWorkout('+ti+')':'_fitView=\\'start\\';renderFitness()')+'"><b>'+esc(_t('מהתוכניות שלי'))+'</b><span>'+
     (tp?esc(_t('היום לפי הלוז: {name}',{name:fitPlanName(tp)})):(tpls.length?esc(tpls.slice(0,3).map(function(t){return t.name;}).join(' · ')):''))+'</span></button>';
  h+='<button onclick="fitSheetClose();startEmptyWorkout()"><b>'+esc(_t('אימון ריק'))+'</b><span>'+esc(_t('מוסיפים תרגילים תוך כדי'))+'</span></button>';
  h+='<button onclick="fitSheetClose();_fitView=\\'build\\';renderFitness()"><b>'+esc(_t('אימון שנבנה לך'))+'</b><span>'+esc(_t('לפי מה שחסר לך השבוע'))+'</span></button>';`);
rep(`/* the start sheet and the day sheet */`, `/* the start sheet and the day sheet: quieter than a confirm - a light scrim,
   no blur, and a plain shadow instead of the white halo */
.fss-ov{background:rgba(74,67,64,.22);-webkit-backdrop-filter:none;backdrop-filter:none}
.fss-ov .cf-card{box-shadow:0 14px 34px rgba(74,67,64,.18)}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('patched, flat backs:', n);
