/* The workout screen as option F of review/workout-screen-2 (Asaf, 24 Oct):
 * everything that was on it stays; what changes is the order.
 *  1. the exercise: name and PR, "how it is done" as a small button beside
 *     the name instead of a tall tile, the target, then swap / remove /
 *     superset in one row; the exercise tabs above - finished ones in a sage
 *     light pressed in with a deep green check, the current one pressed;
 *  2. the sets, as cards across - each says last time above and today below,
 *     the one you are on outlined - then the two boxes and the effort wheel
 *     SIDE BY SIDE ("the effort below the boxes does not invite you to use it
 *     - it is not next to what you must fill in"), and one button "log set N";
 *  3. the rest and the stopwatch in their own card, with the note.
 * The wheel gives each level its own colour, a dot beside the number. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

/* ── the wheel: a colour per level ── */
rep(`    h+='<div class="ew-n" data-v="'+v+'"><span class="ew-num">'+nfmt(v)+'</span>'+`,
    `    h+='<div class="ew-n" data-v="'+v+'"><i class="ew-dot" style="--c:'+effortDot(effortToRPE(v))+'"></i><span class="ew-num">'+nfmt(v)+'</span>'+`);
rep(`function effortWheelHTML(which){`, `/* one colour per level for the wheel's dot: green at easy, through amber, to
   red at failure. A dot, so the number and its word stay ink. */
var EFFORT_DOTS=['#6fb283','#7fba76','#9bbf5a','#b9bf4a','#d6b63e','#e5a03a','#e8853a','#e2683d','#d84c40','#c33a3a'];
function effortDot(rpe){var i=Math.max(1,Math.min(10,Math.round(+rpe||1)));return EFFORT_DOTS[i-1];}
function effortWheelHTML(which){`);

/* ── the set editor without the old chips (the cards draw the sets now) ── */
rep(`function exPrevHTML(ex,curPR){
  var mySets=(ex.sets||[]),h,i,s;`, `function exPrevHTML(ex,curPR,edOnly){
  var mySets=(ex.sets||[]),h,i,s;`);
rep(`    h+='<div class="fw-prev-t fw-mine-t">'+_t('היום')+'</div><div class="fw-prev-s">';
    for(i=0;i<mySets.length;i++){`, `    if(!edOnly)h+='<div class="fw-prev-t fw-mine-t">'+_t('היום')+'</div><div class="fw-prev-s">';
    for(i=0;i<mySets.length&&!edOnly;i++){`);
rep(`         ((curPR&&s.weight>curPR)?'<i class="fw-ps-pr">&#9733;</i>':'')+'</button>';
    }
    h+='</div>';`, `         ((curPR&&s.weight>curPR)?'<i class="fw-ps-pr">&#9733;</i>':'')+'</button>';
    }
    if(!edOnly)h+='</div>';`);

/* ── the set cards ── */
rep(`function exPrevHTML(ex,curPR,edOnly){`, `/* THE SETS AS CARDS ACROSS: last time above, today below, the one you are
   on outlined. A logged set is pressed and lit sage, tapped to edit. */
function exSetCardsHTML(ex,curPR){
  var prev=exLastTime(ex.name),mine=ex.sets||[],ps=(prev&&prev.sets)||[],i,h,
      n=Math.max(+ex.targetSets||0,mine.length+1,ps.length,1),cardio=isCardioEx(ex.name);
  var num=function(st){return (st.weight?nfmt(edWeightVal(st.weight))+'&times;':'')+nfmt(st.reps);};
  h='<div class="fx-sets" style="--n:'+Math.min(n,4)+'">';
  for(i=0;i<n;i++){
    var m=mine[i],p=ps[i],cur=(i===mine.length);
    h+='<'+(m?'button onclick="setSelOpen('+i+')"':'div')+' class="fx-sc'+(m?' ok':'')+(cur?' cur':'')+(_setSel===i?' sel':'')+'">'+
       '<span class="fx-sc-n">'+_t('סט {n}',{n:i+1})+'</span>'+
       '<span class="fx-sc-w">'+(p&&!cardio?num(p):'&ndash;')+'</span>'+
       '<span class="fx-sc-t">'+(m?(cardio?cardioRowHTML(m):num(m))+((curPR&&m.weight>curPR)?' &#9733;':''):(cur?_t('עכשיו'):'&nbsp;'))+'</span>'+
       '</'+(m?'button':'div')+'>';
  }
  h+='</div>';
  if(prev)h+='<div class="fx-sets-l">'+_t('בפעם הקודמת')+' &middot; '+agoText(prev.date)+'</div>';
  else if(!mine.length)h+='<div class="fw-prev none">'+_t('הפעם הראשונה שאתה עושה את זה')+' &mdash; '+_t('מה שתרשום היום יהיה מה שתנסה לעבור בפעם הבאה.')+'</div>';
  return h;
}
function exPrevHTML(ex,curPR,edOnly){`);

/* ── the screen ── */
rep(`    tabsHTML+='<button onclick="fitGo('+ei+')" style="flex-shrink:0;border:none;border-radius:10px;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer;background:'+(isCur?'var(--cta-fill)':(done?'var(--green-200)':'var(--surface)'))+';color:'+(isCur||done?'var(--white)':'var(--muted)')+'">'+esc(exLabel(w.exercises[ei].name))+'</button>';`,
    `    tabsHTML+='<button onclick="fitGo('+ei+')" class="fx-tab'+(isCur?' on':'')+(done&&!isCur?' dn':'')+'">'+esc(exLabel(w.exercises[ei].name))+'</button>';`);
rep(`  var tabsHTML='<div style="display:flex;gap:5px;overflow-x:auto;margin-bottom:12px;padding-bottom:2px">';`,
    `  var tabsHTML='<div class="fx-tabs">';`);
rep(`  tabsHTML+='<button onclick="workoutAddExercise()" style="flex-shrink:0;border:1.5px dashed #e0d8ce;background:none;border-radius:10px;padding:6px 11px;font-size:11px;font-weight:800;cursor:pointer;color:var(--muted);font-family:inherit">+</button>';`,
    `  tabsHTML+='<button onclick="workoutAddExercise()" class="fx-tab" aria-label="'+esc(_t('הוסף תרגיל'))+'">+</button>';`);
rep(`  h+='<div class="fx-exname">'+esc(exLabel(ex.name))+'</div>';
  if(curPR>0)h+='<div class="fx-pr">PR: '+fmtWeight(curPR)+'</div>';
  h+='</div>';`, `  h+='<div><div class="fx-exname">'+esc(exLabel(ex.name))+'</div>';
  if(curPR>0)h+='<div class="fx-pr">PR: '+fmtWeight(curPR)+'</div>';
  h+='</div><button class="fx-howb" onclick="exHowOpen()">\\uD83D\\uDCA1 '+_t('איך מבצעים')+'</button></div>';
  h+=fitTgtHTML(ex);`);
rep(`  h+='</div>';
  /* THE REST, WITH THE BUTTONS. It is a decision about this exercise like
     the three above it, and it used to live below the form, below the whole
     record and below "משהו קרה?" - the furthest point on the card from the
     set that was just logged. */
  h+=restRowHTML();
  h+=fitTgtHTML(ex);`, `  h+='</div>';
  /* (the rest and the stopwatch have their own card below the sets now, and
     the target sits under the name) */`);
rep(`  h+=exLastHTML(ex);
  h+=exPrevHTML(ex,curPR);
  h+='</div>';
  /* how it is done, on the far side of the name it belongs to */
  h+=exHowBoxHTML();
  h+='</div>';`, `  h+='</div>';
  h+='</div>';`);
rep(`  h+='<div class="fw-now">';
  /* The note sits with the lift itself, above the sets - it is a setup
     instruction, and setup happens before the first rep. */
  /* CAPTURED, NOT EMITTED. Everything from here to the add-set form is the
     RECORD - the note, last time, the warm-ups, the sets already logged -
     and it grows all session. Held aside and drawn in its own card below the
     form, so the form keeps a fixed place on the screen no matter how long
     the record gets. It used to sit under all of it. */
  /* THE NOTE IS SETUP, so it is drawn BEFORE the form rather than in the
     record below it. It was arriving after the thing it sets up. */
  h+=exNoteHTML(ex,w.currentEx);
  var _hd=h;h='';`, `  h+='<div class="fw-now">';
  /* the sets: cards across, then the editor of the one tapped */
  h+=exSetCardsHTML(ex,curPR);
  h+=exPrevHTML(ex,curPR,true);
  var _hd=h;h='';`);

/* the boxes and the wheel side by side, one button under them */
rep(`  h+='<div style="margin-top:12px">'+
     /* THREE, and the third is why that used to be forbidden. The cell that
        broke this held ten RPE buttons that cannot wrap, so its min-content
        width - 287px of a 347px card - starved the two the screen exists for
        down to 29 and 28 pixels; measured on a phone, invisible at desktop
        width, which is how it shipped.
        This one is \`auto\` over a single 56px button. Measured the same way
        after: the boxes stay above 100px each. */
     '<div class="fw-fields">';`, `  /* THE EFFORT BESIDE THE BOXES (24 Oct): drawn under them it read as
     optional, because it was not next to what has to be filled in. */
  h+='<div style="margin-top:12px"><div class="fw-duo"><div class="fw-fields fw-fields2">';`);
rep(`  h+='<div class="fw-addcell"><button class="fw-add'+(_fitWarm?' warm':'')+'" onclick="logSet()" '+
     'aria-label="'+esc(_fitWarm?_t('הוסף חימום'):_t('הוסף סט'))+'">+</button></div>';
  /* The label is the switch. Nothing else on this screen has room for a
     settings row, and the person who wants the other scale is looking
     straight at the word that is wrong. */
  h+='</div>';
  var _sc=effortScale();`, `  h+='</div>';
  var _sc=effortScale();`);
rep(`  h+='<div class="fw-effort"><button onclick="toggleEffort()" class="fw-fl fw-fl-b">'+(_sc==='rir'?'RIR':'RPE')+'</button>';
  h+=effortWheelHTML('fit');   // i18n-exempt: a stored key
  h+='</div>';`, `  h+='<div class="fw-effort"><button onclick="toggleEffort()" class="fw-fl fw-fl-b">'+(_sc==='rir'?'RIR':'RPE')+'</button>';
  h+=effortWheelHTML('fit');   // i18n-exempt: a stored key
  h+='</div></div>';
  /* one button, saying which set it writes */
  h+='<button class="fw-add fw-logset'+(_fitWarm?' warm':'')+'" onclick="logSet()">'+
     (_fitWarm?_t('הוסף חימום'):_t('רשום סט {n}',{n:(ex.sets||[]).length+1}))+'</button>';`);

/* the rest and the stopwatch, with the note, in their own card */
rep(`  /* and now the record, in its own card. Empty on the first set of a new
     exercise, and then there is nothing to draw and no card to draw it in. */`,
`  h+='<div class="fw-now fx-restcard">'+restRowHTML()+exNoteHTML(ex,w.currentEx)+'</div>';
  /* and now the record, in its own card. Empty on the first set of a new
     exercise, and then there is nothing to draw and no card to draw it in. */`);

/* ── the look ── */
rep(`.fw-hintrow{display:flex;gap:9px;align-items:center;margin-bottom:9px}`,
`.fw-hintrow{display:flex;gap:9px;align-items:center;margin-bottom:9px}
/* ── the workout screen as option F (24 Oct) ── */
.fx-tabs{display:flex;gap:7px;overflow-x:auto;margin:0 -2px 12px;padding:4px 2px 8px;scrollbar-width:none}
.fx-tabs::-webkit-scrollbar{display:none}
.fx-tab{flex:none;border:none;border-radius:999px;padding:9px 14px;background:var(--nu-ground,#e9e7e3);font-family:inherit;font-size:13px;font-weight:800;color:var(--nu-muted,#6d675e);cursor:pointer;
  box-shadow:-3px -3px 7px var(--nu-lit,rgba(255,255,255,.95)),3px 4px 9px var(--nu-shade-soft,rgba(176,168,156,.28))}
.fx-tab.on{color:var(--nu-ink,#4a453f);box-shadow:inset 2px 3px 6px var(--nu-shade,rgba(176,168,156,.44)),inset -2px -2px 5px var(--nu-lit,rgba(255,255,255,.95))}
/* finished: pressed in, a sage light inside, a deep green check */
.fx-tab.dn{color:var(--nu-ink,#4a453f);background:radial-gradient(120% 140% at 50% 120%,rgba(143,199,158,.42),rgba(143,199,158,.12) 55%,var(--nu-ground,#e9e7e3) 85%);
  box-shadow:inset 2px 3px 6px var(--nu-shade,rgba(176,168,156,.44)),inset -2px -2px 5px var(--nu-lit,rgba(255,255,255,.95)),inset 0 0 0 1px rgba(111,178,131,.18)}
.fx-tab.dn::before{content:"";display:inline-block;width:16px;height:16px;margin-inline-end:6px;vertical-align:-3px;border-radius:50%;
  background:#3f7a52 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 12.5 4 4 8-9'/%3E%3C/svg%3E") center/11px no-repeat}
.fx-howb{flex:none;border:none;border-radius:14px;padding:8px 11px;background:var(--nu-ground,#e9e7e3);font-family:inherit;font-size:12.5px;font-weight:800;color:var(--nu-ink,#4a453f);cursor:pointer;
  box-shadow:-3px -3px 7px var(--nu-lit,rgba(255,255,255,.95)),3px 4px 9px var(--nu-shade-soft,rgba(176,168,156,.28))}
.fx-head{align-items:flex-start}
.fx-sets{display:grid;grid-template-columns:repeat(var(--n),1fr);gap:8px}
.fx-sc{display:flex;flex-direction:column;align-items:center;gap:2px;border:none;border-radius:16px;padding:9px 4px;font-family:inherit;color:var(--nu-ink);
  background:var(--nu-ground);box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.fx-sc-n{font-size:12px;font-weight:800;color:var(--nu-muted)}
.fx-sc-w{font-size:13px;font-weight:700;color:var(--nu-muted)}
.fx-sc-t{font-size:15.5px;font-weight:800}
.fx-sc.ok{cursor:pointer;background:radial-gradient(120% 160% at 50% 120%,rgba(143,199,158,.36),rgba(143,199,158,.1) 55%,var(--nu-ground) 85%)}
.fx-sc.ok .fx-sc-t::before{content:"✓ ";color:#3f7a52}
.fx-sc.cur{outline:2px solid color-mix(in srgb,var(--terra-500) 65%,transparent);outline-offset:-2px}
.fx-sc.sel{outline:2px solid #6fb283;outline-offset:-2px}
.fx-sets-l{font-size:12px;font-weight:700;color:var(--nu-muted);margin:8px 2px 0}
.fw-duo{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start}
.fw-fields2{grid-template-columns:1fr;margin-bottom:0}
.fw-logset{width:100%;min-height:52px;margin:6px 0 10px;font-size:16px;font-weight:800}
.fx-restcard .fw-restset{margin-bottom:10px}
.ew-dot{flex:none;width:11px;height:11px;border-radius:50%;background:var(--c);box-shadow:inset 0 -1px 2px rgba(0,0,0,.18);opacity:.55;margin-inline-end:2px}
.ew-n.on .ew-dot{opacity:1;width:13px;height:13px}`);
fs.writeFileSync(F, s);
console.log('patched');
/* the superset chooser too (Asaf, 24 Oct): an exercise already finished
   wears the same green there, so it is not picked by mistake */
{ let t = fs.readFileSync(F, 'utf8');
  const a = `        h+='<button class="ex-chip" onclick="ssPairWith('+i+','+cand[ci]+')">'+esc(exs[cand[ci]].name)+'</button>';`;
  if (t.split(a).length !== 2) { console.log('anchor ss'); process.exit(1); }
  t = t.replace(a, `        h+='<button class="ex-chip'+((exs[cand[ci]].sets||[]).length>=exs[cand[ci]].targetSets?' fx-tab dn':'')+'" onclick="ssPairWith('+i+','+cand[ci]+')">'+esc(exs[cand[ci]].name)+'</button>';`);
  fs.writeFileSync(F, t); console.log('patched superset chips'); }
/* second pass, from the photo: no "last time" row of dashes when there is no
   last time; no empty editor slot under the cards; the wheel's small
   subline stays out of the narrow half-width wheel */
{ let t = fs.readFileSync(F, 'utf8');
  const r2 = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL); if (t.split(a).length !== 2) { console.log('anchor p2: ' + a.slice(0, 60)); process.exit(1); } t = t.replace(a, () => b); };
  r2(`       '<span class="fx-sc-w">'+(p&&!cardio?num(p):'&ndash;')+'</span>'+`, `       (prev?'<span class="fx-sc-w">'+(p&&!cardio?num(p):'&ndash;')+'</span>':'')+`);
  r2(`.fx-sets-l{`, `.fw-now .fw-prev:empty{display:none}
.fw-duo .ew-n.on .ew-sub{display:none}
.fx-sets-l{`);
  fs.writeFileSync(F, t); console.log('patched pass 2'); }
