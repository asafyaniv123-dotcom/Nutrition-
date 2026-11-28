/* Step 2 of fitness: the screen during the workout (Asaf, 28 Nov: "do A and carry on").
 *  A. A strength day's "today's workout" opens the workout that records weight and reps, not the timed
 *     one - a mass plan with no numbers in it cannot say when to add weight.
 *  B. That workout is one exercise and one action: the movement's loop, last time against today, two
 *     numbers and "log set". Everything else moves to two sheets - ⋯ for the exercise, × for the
 *     workout - and a pane under the name for what needs room. Effort is switched on from ⋯.
 *  C. The last set of an exercise moves on to the next, and the rest fills the screen on the workout:
 *     a ring, +15, skip and what comes next with last time's numbers. Elsewhere it is still the pill.
 * Run: node tools/patches/fit-onescreen.mjs [file] [--reverse]
 */
import fs from 'node:fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  [String.raw`go='fitProgStart('+tg.pi+','+tg.di+',1)';}`,
   String.raw`go='fitProgStart('+tg.pi+','+tg.di+')';}`],
  [String.raw`  var h='<div style="padding-bottom:20px">';

  // Header bar
  h+='<div class="fw-live" style="border-radius:18px;padding:12px 14px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">';
  /* Back to כושר, not out of the workout. The workout stays live and the
     home now has a card that returns to it. */
  h+='<div style="display:flex;align-items:center;gap:10px;min-width:0">';
  h+='<button onclick="fitBack()" aria-label="'+_t('חזרה')+'" class="fw-live-b" style="flex-shrink:0;width:30px;height:30px;border:none;border-radius:10px;font-size:17px;font-weight:800;font-family:inherit;cursor:pointer;line-height:1;padding:0">&#8249;</button>';
  h+='<div style="min-width:0"><div style="font-size:14px;font-weight:800;color:var(--ink)">'+esc(w.name)+'</div><div style="font-size:10px;color:var(--muted-soft);margin-top:2px">&#9200; '+_t('{n} דקות',{n:elapsed})+'</div></div>';
  h+='</div>';
  h+='<div style="display:flex;align-items:center;gap:8px;flex-shrink:0">'+
     '<button class="tg-b'+(w.tg?' on':'')+'" onclick="tgTap()" aria-label="'+_t('אימון משותף')+'">'+
     '<svg viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3"/><path d="M3.8 19a5.2 5.2 0 0 1 10.4 0"/><circle cx="16.6" cy="9.4" r="2.4"/><path d="M15.4 14.2a4.4 4.4 0 0 1 5 4.8"/></svg></button>'+
     '<div style="font-size:11px;color:var(--terra-700);font-weight:700">'+nfmt(w.currentEx+1)+' / '+nfmt(w.exercises.length)+'</div></div>';
  h+='</div>';
  if(w.tg)h+='<div id="tg-strip" class="tg-strip">'+tgStripHTML()+'</div>';

  /* ── EXERCISE TABS ──
     Assembled here and drawn first, above the exercise card. They used to sit
     at the bottom, under the thumb, on the argument that they are navigation
     and not part of the work - but you cannot see where you are in a workout
     from a strip below the fold. */
  var tabsHTML='<div class="fx-tabs">';
  for(var ei=0;ei<w.exercises.length;ei++){
    var done=w.exercises[ei].sets.length>=w.exercises[ei].targetSets;
    var isCur=ei===w.currentEx;
    tabsHTML+='<button onclick="fitGo('+ei+')" class="fx-tab'+(isCur?' on':'')+(done&&!isCur?' dn':'')+'">'+esc(exLabel(w.exercises[ei].name))+'</button>';
  }
  // adding one mid-session: the plan meets the gym more often than not
  tabsHTML+='<button onclick="workoutAddExercise()" class="fx-tab" aria-label="'+esc(_t('הוסף תרגיל'))+'">+</button>';
  tabsHTML+='</div>';

  /* first, not last: which exercise you are on is the question you ask
     before any of the numbers below mean anything */
  h+=tabsHTML;

  // Current exercise
  var prKey=ex.name;
  var curPR=prs[prKey]||0;
  /* the lift itself, in its own rectangle: what it is called, what it is for
     today, and the two things you might want to do to it */
  h+='<div class="fx-name">';
  h+='<div class="fx-nm">';
  /* THE NAME IS THE HEADING. It used to share one line with the two
     buttons and the PR badge, which is the only reason it was set at 17px -
     it had to fit beside them. On its own line it can be the title of the
     card, and the three actions are a row underneath. */
  h+='<div class="fx-head">';
  h+='<div><div class="fx-exname">'+esc(exLabel(ex.name))+'</div>';
  if(curPR>0)h+='<div class="fx-pr">PR: '+fmtWeight(curPR)+'</div>';
  h+='</div><button class="fx-howb" onclick="exHowOpen()">\uD83D\uDCA1 '+_t('איך מבצעים')+'</button></div>';
  h+=fitTgtHTML(ex);
  h+='<div class="fx-acts">';
  /* On the exercise, not in a settings screen: the moment you want to change
     it is the moment you are looking at it. */
  /* A WORD, NOT A GLYPH. ⇆ is not read as "swap" by anybody who has not been
     told, and a × at 16px with no background reads as decoration. Both carry
     their word now and both sit in the raised shell this app gives anything
     that can be pressed - the icon stays beside the word because it is what
     the eye finds second time round. */
  h+='<button class="wx-b" onclick="wxSwap('+w.currentEx+')" aria-label="'+_t('החלף תרגיל')+'">'+
     '<i class="wx-i">&#8646;</i>'+_t('החלף')+'</button>';
  h+='<button class="wx-b" onclick="ckOpen(\'sw\')"><i class="wx-i">&#9201;</i>'+_t('סטופר')+'</button>';
  h+='<button class="wx-b wx-del" onclick="wxRemove('+w.currentEx+')" aria-label="'+_t('הסר תרגיל')+'">'+
     '<i class="wx-i">&#215;</i>'+_t('הסר')+'</button>';
  /* THE THIRD ACTION, in the same row as the other two. It keeps its own
     markup and joins through display:contents on .fx-ssrow, so all three of
     its branches - the chooser, "פרק את הסופרסט" and "סופרסט עם" - keep
     working untouched. */
  /* A group is still contiguous; what changed is that any exercise can be
     made the next one. */
  (function(){
    var i=_fitWorkout.currentEx, exs=_fitWorkout.exercises;
    var lbl=ssLabel(i);
    if(lbl)h+='<div style="display:inline-block;font-size:10px;font-weight:800;color:var(--violet-700);background:var(--violet-50);border-radius:7px;padding:2px 8px;margin-bottom:9px">'+_t('סופרסט')+' '+lbl+'</div>';
    /* THE SAME SHELL AS החלף AND הסר, two rows above in this card. These
       were background:none, border:none, underlined 10px text - an underline
       is a link's affordance on a page of links, and on a card of raised
       surfaces it reads as a caption somebody forgot to style. They are small
       actions on this lift, which is precisely what those two are, so they
       get that button rather than a third style for one kind of thing. */
    if(_ssPick===i){
      /* the candidates, as the same chips the exercise row already uses */
      h+='<div class="ex-chips" style="margin-bottom:6px">';
      var cand=ssCandidates(i),ci;
      for(ci=0;ci<cand.length;ci++)
        h+='<button class="ex-chip'+((exs[cand[ci]].sets||[]).length>=exs[cand[ci]].targetSets?' fx-tab dn':'')+'" onclick="ssPairWith('+i+','+cand[ci]+')">'+esc(exs[cand[ci]].name)+'</button>';
      h+='<button class="ex-chip" onclick="ssPairNew('+i+')">+ '+_t('הוסף תרגיל')+'</button>';
      h+='</div>';
      h+='<div class="fx-ssrow"><button class="wx-b" onclick="ssPickClose()">'+_t('ביטול')+'</button></div>';
    } else {
      /* breaking is offered only where there is something to break, and it
         is the pair with the NEXT one - the group is contiguous, so that is
         the only link this exercise owns going forward */
      if(i<exs.length-1&&exs[i].ss!=null&&exs[i].ss===exs[i+1].ss)
        h+='<div class="fx-ssrow"><button class="wx-b wx-del" onclick="ssJoin('+i+')">'+
           '<i class="wx-i">&#10005;</i>'+_t('פרק את הסופרסט')+'</button></div>';
      /* always offered, even in a workout of one: the chooser can add the
         partner from the library, so there is never nothing to pick */
      else
        h+='<div class="fx-ssrow"><button class="wx-b" onclick="ssPickOpen('+i+')">'+
           '<i class="wx-i">&#8644;</i>'+_t('סופרסט עם')+'&hellip;</button></div>';
    }
  })();
  h+='</div>';
  /* (the rest and the stopwatch have their own card below the sets now, and
     the target sits under the name) */
  /* EVERYTHING ABOUT THIS LIFT, IN ONE RECTANGLE - what you did last time
     and what you have done so far today. Both are what the two boxes are
     being asked about, so both belong where you are looking when you decide.
     Measured before this moved: today's sets were sitting 1145px down the
     page, past the boxes, the wheel, the plate picture and the rest timer. */
  h+='</div>';
  h+='</div>';
  /* Straight under it: what you did last time, and what you are lifting
     it with. */
  /* THE "LAST TIME" SQUARE IS GONE. It was 92px of card saying what the one
     line in the header above now says - the comparable set, the effort and
     the ago - and he was pointing at it both times he asked for this to move
     up and take less room. The gear picture keeps the row and takes the
     width the pair used to share.
     The gear card is still REFERENCE and still drawn below: put beside the
     form it pushed the log-set button down into the tab bar's strip, above
     the fold and untappable. */
  var _ref='<div class="fx-row fx-row-one">'+exGearBoxHTML(ex)+'</div>';
  /* and then the card the set is actually written in */
  h+='<div class="fw-now">';
  /* the sets: cards across, then the editor of the one tapped */
  h+=exSetCardsHTML(ex,curPR);
  h+=exPrevHTML(ex,curPR,true);
  var _hd=h;h='';

  // Warm-up rows come first, because that is the order they happen in, and
  // they are drawn quieter so the working sets still read as the real list.
  var _wu=ex.warm||[];
  for(var wi=0;wi<_wu.length;wi++){
    h+='<div class="fw-set fw-warm">';
    h+='<div class="fw-set-i">'+_t('חימום')+'</div>';
    h+='<div class="fw-set-v">'+fmtWeight(_wu[wi].weight)+' &times; '+nfmt(_wu[wi].reps)+'</div>';
    h+='<button onclick="removeWarm('+wi+')" style="background:none;border:none;cursor:pointer;color:var(--terra-700);font-size:13px;padding:2px">&times;</button>';
    h+='</div>';
  }

  /* THE SETS ARE DRAWN ABOVE, as chips in the same card as last time's -
     see exPrevHTML. They were a stack of tall rows here, each repeating its
     own number, its plate badges and an ×, under a chip row that said the
     same thing in a different shape. */

  var _log=_ref+h;h=_hd;

  // Add set
  /* A run takes a duration and a distance, not a weight and a number of
     repetitions, and it is the exercise itself that decides which pair of
     boxes you get. */
  if(isCardioEx(ex.name)){
  h+=cardioAddHTML(ex);
  }else{
  /* The boxes open holding what you did on this same set last time, so the
     ordinary case - do it again - is one tap and nothing typed. */
  var pf=exPrefill(ex);
  /* THE EFFORT BESIDE THE BOXES (24 Oct): drawn under them it read as
     optional, because it was not next to what has to be filled in. */
  h+='<div style="margin-top:12px"><div class="fw-duo"><div class="fw-fields fw-fields2">';
  /* what was typed wins over what was stored, for exactly as long as it has
     not been logged - see _fitTyped */
  var _boxW=(_fitTyped&&_fitTyped.w!==undefined)?_fitTyped.w
          :((pf.w===''||pf.w===undefined)?'':edWeightVal(pf.w));
  var _boxR=(_fitTyped&&_fitTyped.r!==undefined)?_fitTyped.r:pf.r;
  /* THE WEIGHT IS TYPED (24 Oct): no steps, because nobody knows a gym's
     plates. The reps keep − and +, which is the ordinary change between sets. */
  h+='<label class="fx-in"><span class="fw-fl">'+_t('משקל')+' ('+weightUnit()+')'+'</span><input id="fit-w" class="fx-inn" type="number" inputmode="decimal" step="0.5" placeholder="&ndash;" value="'+esc(_boxW)+'" oninput="fitTyped();plateHint()"></label>';
  h+='<div class="fx-in"><span class="fw-fl">'+_t('חזרות')+'</span><input id="fit-r" class="fx-inn" type="number" inputmode="numeric" placeholder="'+nfmt(ex.targetReps)+'" value="'+esc(_boxR)+'" oninput="fitTyped()">'+
     '<div class="fx-pm"><button onclick="fxRepStep(-1)" aria-label="&minus;">&minus;</button><button onclick="fxRepStep(1)" aria-label="+">+</button></div></div>';
  /* SAVES WHAT IS BESIDE IT. The numbers are typed and the set is logged
     without the eye leaving the row - logSet re-renders and exPrefill opens
     the boxes on the same values, so pressing it again is one tap. */
  h+='</div>';
  var _sc=effortScale();
  /* A WHEEL, NOT TEN BUTTONS. Measured at 390px the ten came out about 33px
     across and a thumb pad is 34-42, so the row sat at or below the floor and
     the tap that missed landed on 7 or 9 and looked deliberate. One big
     target instead, and the word beside each number, because this field was
     never skipped for being small - it was skipped for being unclear. */
  h+='<div class="fw-effort"><button onclick="toggleEffort()" class="fw-fl fw-fl-b">'+(_sc==='rir'?'RIR':'RPE')+'</button>';
  h+=effortWheelHTML('fit');   // i18n-exempt: a stored key
  h+='</div></div>';
  /* one button, saying which set it writes */
  h+='<button class="fw-add fw-logset'+(_fitWarm?' warm':'')+'" onclick="logSet()">'+
     (_fitWarm?_t('הוסף חימום'):_t('רשום סט {n}',{n:(ex.sets||[]).length+1}))+'</button>';
  /* The toggle used to sit ON the button it changes, "because the decision
     is made at the moment of pressing, not before". The button moved up into
     the row with the numbers and there is no room for a word beside it, so
     the toggle takes the line that was already reserved for the plate hint -
     still one line from the thing it changes, which carries its colour.
     PRESSED means chosen, here as everywhere. */
  h+='<div class="fw-hintrow">';
  h+='<button class="fw-wt'+(_fitWarm?' on':'')+'" onclick="toggleWarm()">'+_t('חימום')+'</button>';
  /* Costs no tap: it is already right for the number the boxes opened on. */
  h+='<div id="fit-plates" style="flex:1;min-width:0;min-height:19px"></div>';
  h+='</div>';
  h+='</div></div>';
  }

  /* THE REST BESIDE THE NOTE (24 Oct): the rest is a wheel with every stop,
     the same wheel the effort uses; the note is an open box, saved as it is
     typed - it is read between sets, so it should not need opening. */
  h+='<div class="fw-now fx-restcard"><div class="fx-two">'+
     '<div><div class="fw-fl">'+_t('מנוחה|טיימר')+'</div>'+restWheelVHTML()+
     '<button class="fw-rb go fx-go" onclick="restGo()">'+_t('התחל')+'</button></div>'+
     '<div><div class="fw-fl">'+_t('הערה על התרגיל')+'</div>'+
     '<textarea class="fx-note" maxlength="200" placeholder="'+_t('מושב 4, רגליים על הקו השלישי…')+'" '+
     'oninput="exNoteSet(_fitWorkout.exercises[_fitWorkout.currentEx].name,this.value)">'+esc(exNoteGet(ex.name))+'</textarea></div>'+
     '</div></div>';
  /* and now the record, in its own card. Empty on the first set of a new
     exercise, and then there is nothing to draw and no card to draw it in. */
  if(_log.replace(/<[^>]*>/g,'').trim()||/<(input|button|img)/.test(_log))
    h+='<div class="fw-log">'+_log+'</div>';

  // the one button for when the plan meets the gym
  h+='<button class="fw-case" onclick="fitCaseOpen()">'+_t('משהו קרה?')+' &#8250;</button>';
h+=addExHTML();
  /* A workout grows mid-session more often than it survives the plan, so the
     same notebook reading belongs here too - counted off what each exercise
     is SET to do, which is the decision still open, rather than off what has
     been logged, which is already behind you.
     ABOVE the nav buttons, not below: drawn under "finish workout" it is
     advice arriving after the decision it was meant to inform. */
  h+=progAdviceHTML(w.exercises.map(function(ex){
       return {name:ex.name,sets:(+ex.targetSets||(ex.sets&&ex.sets.length)||0),
               reps:+ex.targetReps||0};
     }));
  // Nav buttons
  h+='<div style="display:flex;gap:8px">';
  if(w.currentEx>0)h+='<button onclick="_fitWorkout.currentEx--;renderFitness()" style="flex:1;background:var(--surface);border:none;border-radius:14px;padding:12px;font-size:13px;font-weight:700;cursor:pointer;color:var(--muted)">&#8249; '+_t('אחור')+'</button>';
  if(w.currentEx<w.exercises.length-1){
    h+='<button onclick="_fitWorkout.currentEx++;renderFitness()" style="flex:1;background:var(--cta-fill);border:none;border-radius:14px;padding:12px;font-size:13px;font-weight:700;cursor:pointer;color:var(--white)">'+_t('הבא')+' &#8250;</button>';
  } else {
    h+='<button onclick="finishWorkout()" style="flex:1;background:var(--cta-fill);border:none;border-radius:14px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;color:var(--white)">'+_t('סיים אימון')+' &#10003;</button>';
  }
  h+='</div>';
  h+=fitPhotoBlockHTML(w.photo,'fitLivePhoto','fitLiveClearPhoto');
  /* last on the page and quiet: a way out, not a choice offered beside "finish" */
  h+='<button onclick="fitCancelAsk()" style="display:block;width:100%;margin-top:14px;background:none;border:none;padding:12px;font-size:13px;font-weight:700;cursor:pointer;color:var(--muted)">'+_t('ביטול האימון')+'</button>';
  h+='</div>';`,
   String.raw`  /* ── ONE EXERCISE, ONE ACTION (step 2, approved 28 Nov) ──
     This screen was a wall: about 25 controls on one page, two pictures of a bar, a rest wheel, a
     note, "something happened?" and a photo slot, all at once, while she is holding a weight. Now it
     shows what the next ten seconds need - the movement, last time against today, two numbers and
     one button - and everything else is one tap away under ⋯ (this exercise) or × (the workout).
     Nothing was removed: swap, superset, warm-up, the bar, the target, rest length, the note, effort,
     the stopwatch and removing all live in those two sheets. */
  var tot=w.exercises.length,ci=w.currentEx,le=exByName(ex.name),sd=0,st=0,ei;
  for(ei=0;ei<tot;ei++){st+=Math.max(+w.exercises[ei].targetSets||0,w.exercises[ei].sets.length);sd+=w.exercises[ei].sets.length;}
  /* the library is what knows the movement; exLoad redraws this screen when it lands */
  if(!le&&_exState!=='ready')exLoad();
  var h='<div class="fw2">';
  h+='<div class="fw2-top"><button class="fw2-x" onclick="fw2Exit()" aria-label="'+esc(_t('יציאה מהאימון'))+'">&times;</button>'+
     '<button class="fw2-of" onclick="fw2List()">'+esc(_t('תרגיל {n} מתוך {m}',{n:ci+1,m:tot}))+' &middot; '+esc(_t('{n} דקות',{n:elapsed}))+'</button>'+
     '<button class="tg-b'+(w.tg?' on':'')+'" onclick="tgTap()" aria-label="'+_t('אימון משותף')+'">'+
     '<svg viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3"/><path d="M3.8 19a5.2 5.2 0 0 1 10.4 0"/><circle cx="16.6" cy="9.4" r="2.4"/><path d="M15.4 14.2a4.4 4.4 0 0 1 5 4.8"/></svg></button></div>';
  /* a machine's number: a CSS width, never formatted */
  h+='<div class="fw2-bar"><i style="width:'+Math.round(100*sd/Math.max(1,st))+'%"></i></div>';
  if(w.tg)h+='<div id="tg-strip" class="tg-strip">'+tgStripHTML()+'</div>';
  var prKey=ex.name;
  var curPR=prs[prKey]||0;
  /* the movement itself, the same loop the timed workout shows */
  if(le&&EX_DEMO[exDemoId(le)])
    h+='<div class="fw2-fig"><video src="'+stVidSrc(le)+'" muted loop playsinline autoplay preload="metadata" aria-hidden="true"></video></div>';
  var lbl=ssLabel(ci);
  h+='<div class="fw2-nm"><div class="fw2-nmx"><div class="fx-exname">'+esc(exLabel(ex.name))+'</div>';
  if(lbl||curPR>0)h+='<div class="fw2-sub">'+(lbl?esc(_t('סופרסט'))+' '+lbl:'')+(lbl&&curPR>0?' &middot; ':'')+(curPR>0?'PR: '+fmtWeight(curPR):'')+'</div>';
  h+='</div><button class="fw2-more" onclick="fw2Menu()" aria-label="'+esc(_t('עוד|תפריט'))+'">&#8943;</button></div>';
  /* the note is read between sets, so it is shown; it is written from ⋯ */
  var _nt=exNoteGet(ex.name);if(_nt)h+='<div class="fw2-note">'+esc(_nt)+'</div>';
  /* choosing a superset partner: the same chips as before, under the name */
  if(_ssPick===ci){
    var exs=w.exercises,cand=ssCandidates(ci),cj;
    h+='<div class="ex-chips" style="margin-bottom:6px">';
    for(cj=0;cj<cand.length;cj++)
      h+='<button class="ex-chip'+((exs[cand[cj]].sets||[]).length>=exs[cand[cj]].targetSets?' fx-tab dn':'')+'" onclick="ssPairWith('+ci+','+cand[cj]+')">'+esc(exs[cand[cj]].name)+'</button>';
    h+='<button class="ex-chip" onclick="ssPairNew('+ci+')">+ '+_t('הוסף תרגיל')+'</button></div>';
    h+='<div class="fx-ssrow"><button class="wx-b" onclick="ssPickClose()">'+_t('ביטול')+'</button></div>';
  }
  h+=fw2PaneHTML(ex);
  /* last time against today, and the set being edited if one was tapped */
  h+='<div class="fw-now fw2-sets">'+exSetCardsHTML(ex,curPR)+exPrevHTML(ex,curPR,true);
  var _wu=ex.warm||[];
  for(var wi=0;wi<_wu.length;wi++){
    h+='<div class="fw-set fw-warm">';
    h+='<div class="fw-set-i">'+_t('חימום')+'</div>';
    h+='<div class="fw-set-v">'+fmtWeight(_wu[wi].weight)+' &times; '+nfmt(_wu[wi].reps)+'</div>';
    h+='<button onclick="removeWarm('+wi+')" style="background:none;border:none;cursor:pointer;color:var(--terra-700);font-size:13px;padding:2px">&times;</button>';
    h+='</div>';
  }
  if(isCardioEx(ex.name)){
    h+=cardioAddHTML(ex);
  }else{
    /* the boxes open on what she did on this set last time, so "the same again" is one tap */
    var pf=exPrefill(ex);
    var _boxW=(_fitTyped&&_fitTyped.w!==undefined)?_fitTyped.w
            :((pf.w===''||pf.w===undefined)?'':edWeightVal(pf.w));
    var _boxR=(_fitTyped&&_fitTyped.r!==undefined)?_fitTyped.r:pf.r;
    if(_fitWarm)h+='<button class="fw-wt on fw2-warm" onclick="toggleWarm()">'+_t('חימום')+' &times;</button>';
    h+='<div class="fw-fields fw2-in">';
    h+='<label class="fx-in"><span class="fw-fl">'+_t('משקל')+' ('+weightUnit()+')'+'</span><input id="fit-w" class="fx-inn" type="number" inputmode="decimal" step="0.5" placeholder="&ndash;" value="'+esc(_boxW)+'" oninput="fitTyped();plateHint()"></label>';
    h+='<div class="fx-in"><span class="fw-fl">'+_t('חזרות')+'</span><input id="fit-r" class="fx-inn" type="number" inputmode="numeric" placeholder="'+nfmt(ex.targetReps)+'" value="'+esc(_boxR)+'" oninput="fitTyped()">'+
       '<div class="fx-pm"><button onclick="fxRepStep(-1)" aria-label="&minus;">&minus;</button><button onclick="fxRepStep(1)" aria-label="+">+</button></div></div>';
    h+='</div>';
    /* effort is hers to switch on, from ⋯ - on for anyone who has been rating sets */
    if(fw2Rpe()){
      var _sc=effortScale();
      h+='<div class="fw-effort fw2-eff"><button onclick="toggleEffort()" class="fw-fl fw-fl-b">'+(_sc==='rir'?'RIR':'RPE')+'</button>';
      h+=effortWheelHTML('fit');   // i18n-exempt: a stored key
      h+='</div>';
    }
    h+='<button class="fw-add fw-logset fw2-log'+(_fitWarm?' warm':'')+'" onclick="logSet()">'+
       (_fitWarm?_t('הוסף חימום'):_t('רשום סט {n}',{n:(ex.sets||[]).length+1}))+'</button>';
    /* costs no tap: already right for the number the boxes opened on */
    h+='<div id="fit-plates" class="fw2-pl"></div>';
  }
  h+='</div>';
  /* next is quiet - after the last set the workout moves on by itself - and once every exercise
     has its sets the one button left is the end */
  var allDone=w.exercises.every(function(x){return x.sets.length>=(+x.targetSets||1);});
  h+='<div class="fw2-nav">';
  if(ci>0)h+='<button class="fw2-bk" onclick="_fitWorkout.currentEx--;renderFitness()">&#8249; '+_t('אחור')+'</button>';
  if(ci<tot-1&&!allDone)h+='<button class="fw2-nx" onclick="_fitWorkout.currentEx++;renderFitness()">'+_t('הבא')+' &#8250;</button>';
  else h+='<button class="fw2-nx fw2-fin" onclick="finishWorkout()">'+_t('סיים אימון')+' &#10003;</button>';
  h+='</div>';
  h+='</div>';`],
  [String.raw`  plateHint();   // the boxes open prefilled, so the line has something to say already
}`,
   String.raw`  plateHint();   // the boxes open prefilled, so the line has something to say already
}
/* ── WHAT ⋯ AND × HOLD (step 2, 28 Nov) ──
   ⋯ is this exercise, × is the workout. A sheet of rows for the actions that are one tap, and a pane
   under the name for the few that need room (the bar, the target, rest length, the note, a photo). */
var _fw2P='',_fw2Pi=-1;
var FW2_RPE='fit_rpe_on';
function fw2Rpe(){
  var v=null,L,i,j,k,E;try{v=localStorage.getItem(FW2_RPE);}catch(e){}
  if(v!==null)return v==='1';
  /* not chosen yet: on for anyone who has rated a set in her last five workouts */
  L=loadWorkoutLog();
  for(i=L.length-1;i>=0&&i>=L.length-5;i--){E=L[i].exercises||[];
    for(j=0;j<E.length;j++)for(k=0;k<(E[j].sets||[]).length;k++)if(E[j].sets[k].rpe!=null)return true;}
  return false;
}
function fw2RpeToggle(){try{localStorage.setItem(FW2_RPE,fw2Rpe()?'0':'1');}catch(e){}renderFitness();}
function fw2Pane(k){
  _fw2P=k||'';_fw2Pi=_fitWorkout?_fitWorkout.currentEx:-1;
  _fitTgtOpen=(k==='tgt')?_fw2Pi:-1;
  renderFitness();
  var el=document.querySelector('.fw2-pane');if(el)el.scrollIntoView({block:'center',behavior:'smooth'});
}
function fw2PaneHTML(ex){
  var w=_fitWorkout,k=_fw2P,h,t;
  if(!w||!k||_fw2Pi!==w.currentEx)return '';
  t={tgt:_t('היעד לתרגיל'),gear:_t('הרכבת המשקל'),rest:_t('זמן מנוחה'),note:_t('הערה על התרגיל'),photo:_t('הוסף תמונה לאימון')}[k];
  if(!t)return '';
  h='<div class="fw-now fw2-pane"><div class="fw2-ph"><b>'+esc(t)+'</b><button class="fw2-pc" onclick="fw2Pane(\'\')">'+esc(_t('סגור'))+'</button></div>';
  if(k==='tgt'){
    if(_fitTgtOpen!==w.currentEx)_fitTgtOpen=w.currentEx;
    h+=fitTgtHTML(ex)+progAdviceHTML(w.exercises.map(function(x){
      return {name:x.name,sets:(+x.targetSets||(x.sets&&x.sets.length)||0),reps:+x.targetReps||0};}));
  }
  else if(k==='gear')h+=exGearBoxHTML(ex);
  else if(k==='rest')h+=restWheelVHTML()+'<button class="fw-rb go fx-go" onclick="restGo()">'+_t('התחל')+'</button>';
  else if(k==='note')h+='<textarea class="fx-note" maxlength="200" placeholder="'+_t('מושב 4, רגליים על הקו השלישי…')+'" '+
     'oninput="exNoteSet(_fitWorkout.exercises[_fitWorkout.currentEx].name,this.value)">'+esc(exNoteGet(ex.name))+'</textarea>';
  else if(k==='photo')h+=fitPhotoBlockHTML(w.photo,'fitLivePhoto','fitLiveClearPhoto');
  return h+'</div>';
}
function fw2Sheet(title,rows){
  fitSheetClose();
  var ov=document.createElement('div'),h='',i;ov.className='cf-ov fss-ov';ov.id='fss-ov';
  for(i=0;i<rows.length;i++)
    h+='<button onclick="fitSheetClose();'+rows[i][2]+'"'+(rows[i][3]?' class="fw2-del"':'')+'><b>'+esc(rows[i][0])+'</b>'+(rows[i][1]?'<span>'+esc(rows[i][1])+'</span>':'')+'</button>';
  ov.innerHTML='<div class="cf-card fss"><div class="cf-q" style="margin-bottom:12px">'+esc(title)+'</div><div class="fss-l">'+h+'</div>'+
    '<button class="cf-no" style="width:100%;margin-top:12px" onclick="fitSheetClose()">'+esc(_t('ביטול'))+'</button></div>';
  document.body.appendChild(ov);ov.onclick=function(e){if(e.target===ov)fitSheetClose();};
}
function fw2Menu(){
  var w=_fitWorkout;if(!w)return;
  var i=w.currentEx,ex=w.exercises[i],R=[],ss=(i<w.exercises.length-1&&ex.ss!=null&&ex.ss===w.exercises[i+1].ss);
  R.push([_t('איך מבצעים'),'','exHowOpen()']);
  R.push([_t('החלף תרגיל'),_t('המכשיר תפוס, או שכואב'),'wxSwap('+i+')']);
  R.push(ss?[_t('פרק את הסופרסט'),'','ssJoin('+i+')']:[_t('סופרסט עם')+'…','','ssPickOpen('+i+')']);
  if(!isCardioEx(ex.name)){
    R.push([_fitWarm?_t('בלי חימום'):_t('סט חימום'),'','toggleWarm()']);
    R.push([_t('הרכבת המשקל'),'','fw2Pane(\'gear\')']);
  }
  R.push([_t('היעד לתרגיל'),_t('{n} סטים',{n:ex.targetSets})+' × '+_t('{n} חזרות',{n:ex.targetReps}),'fw2Pane(\'tgt\')']);
  R.push([_t('זמן מנוחה'),'','fw2Pane(\'rest\')']);
  R.push([_t('הערה על התרגיל'),'','fw2Pane(\'note\')']);
  if(!isCardioEx(ex.name))R.push([_t('דירוג מאמץ אחרי כל סט'),fw2Rpe()?_t('פועל|מצב'):_t('כבוי'),'fw2RpeToggle()']);
  R.push([_t('סטופר'),'','ckOpen(\'sw\')']);
  R.push([_t('הסר תרגיל'),'','wxRemove('+i+')',1]);
  fw2Sheet(exLabel(ex.name),R);
}
function fw2Exit(){
  if(!_fitWorkout)return;
  fw2Sheet(_fitWorkout.name||_t('אימון'),[
    [_t('חזרה לכושר'),_t('האימון ממשיך ברקע'),'fitBack()'],
    [_t('משהו קרה?'),'','fitCaseOpen()'],
    [_t('הוסף תמונה לאימון'),'','fw2Pane(\'photo\')'],
    [_t('סיים אימון'),'','finishWorkout()'],
    [_t('ביטול האימון'),'','fitCancelAsk()',1]]);
}
/* the exercise list the tabs used to be, one tap from "exercise 2 of 6" */
function fw2List(){
  var w=_fitWorkout;if(!w)return;
  fw2Sheet(w.name||_t('אימון'),w.exercises.map(function(x,i){
    return [exLabel(x.name),nfmt(x.sets.length)+'/'+nfmt(+x.targetSets||0),'fitGo('+i+')'];
  }).concat([[_t('+ הוסף תרגיל'),'','workoutAddExercise()']]));
}
/* after the last set of an exercise, on to the next one still waiting - not inside a superset,
   whose own sequence already decides */
function fw2Advance(){
  var w=_fitWorkout,n=w.exercises.length,i,j;
  for(i=1;i<n;i++){j=(w.currentEx+i)%n;
    if(w.exercises[j].sets.length<(+w.exercises[j].targetSets||1)){w.currentEx=j;_fitPinned=false;fitTypedClear();return;}}
}
/* ── THE REST, ITS OWN SCREEN ──
   On the workout it fills the screen: the ring, +15 and skip, and what comes next with last time's
   numbers for it. Anywhere else in the app it stays the small pill it always was. */
function fw2NextHTML(){
  var w=_fitWorkout;if(!w)return '';
  var ex=w.exercises[w.currentEx];if(!ex)return '';
  if(w.exercises.every(function(x){return x.sets.length>=(+x.targetSets||1);}))
    return '<div class="fwr2-only fwr2-nx"><div><b>'+esc(_t('זה היה הסט האחרון'))+'</b></div></div>';
  var i=ex.sets.length,prev=exLastTime(ex.name),p=prev&&prev.sets&&prev.sets[i],le=exByName(ex.name),sub='';
  if(p&&!isCardioEx(ex.name))sub=_t('בפעם שעברה: {v}',{v:(p.weight?fmtWeight(p.weight)+' × ':'')+nfmt(p.reps)});
  return '<div class="fwr2-only fwr2-nx">'+
    (le&&EX_DEMO[exDemoId(le)]?'<video class="fwr2-th" src="'+stVidSrc(le)+'" muted loop playsinline autoplay preload="metadata" aria-hidden="true"></video>':'')+
    '<div><small>'+esc(_t('הבא'))+'</small><b>'+esc(exLabel(ex.name))+' · '+esc(_t('סט {n}',{n:i+1}))+'</b>'+(sub?'<small>'+esc(sub)+'</small>':'')+'</div></div>';
}
function fw2RestHTML(){
  return '<div class="fw-rest" id="fw-rest" role="timer">'+
    '<div class="fwr2-only fwr2-t">'+esc(_t('מנוחה|טיימר'))+'</div>'+
    '<div class="fwr2-ring"><svg class="fwr2-only" viewBox="0 0 170 170" aria-hidden="true"><circle cx="85" cy="85" r="72" class="fwr2-tr"/><circle id="fw-rest-r" cx="85" cy="85" r="72" class="fwr2-pr"/></svg>'+
    '<span class="fw-rest-n" id="fw-rest-n"></span></div>'+
    '<div class="fwr2-b"><button class="fw-rest-x fwr2-only" onclick="restMore()">'+esc(_t('+{n} שניות',{n:15}))+'</button>'+
    '<button class="fw-rest-x" onclick="restStop()">'+_t('דלג')+'</button></div>'+fw2NextHTML()+'</div>';
}
function restMore(){if(!_restEnd)return;_restEnd+=15000;_restTot=(_restTot||restLen())+15;restTick();}`],
  [String.raw`  } else {
    restStart();   // rest begins the moment the set ends, not when you remember`,
   String.raw`  } else {
    /* the last set of a lone exercise: on to the next one, so the rest shows what is coming */
    if(ssGroup(_i).length<2&&+ex.targetSets>0&&ex.sets.length>=+ex.targetSets)fw2Advance();
    restStart();   // rest begins the moment the set ends, not when you remember`],
  [String.raw`  _restEnd=Date.now()+n*1000;
  if(_restIv)clearInterval(_restIv);`,
   String.raw`  _restEnd=Date.now()+n*1000;_restTot=n;
  /* drawn afresh each time: what comes next has changed since the last one */
  var _o=document.getElementById('fw-rest');if(_o)_o.remove();
  if(_restIv)clearInterval(_restIv);`],
  [String.raw`    document.body.insertAdjacentHTML('beforeend',
      '<div class="fw-rest" id="fw-rest"><span class="fw-rest-n" id="fw-rest-n"></span>'+
      '<button class="fw-rest-x" onclick="restStop()">'+_t('דלג')+'</button></div>');
    el=document.getElementById('fw-rest');
  }`,
   String.raw`    document.body.insertAdjacentHTML('beforeend',fw2RestHTML());
    el=document.getElementById('fw-rest');
  }
  /* the whole screen on the workout, the pill anywhere else */
  el.classList.toggle('fwr2',_fitView==='workout'&&typeof currentModule!=='undefined'&&currentModule==='fitness');
  var _rg=document.getElementById('fw-rest-r'),_tt=_restTot||restLen()||left;
  if(_rg)_rg.style.strokeDashoffset=String(452.4*(1-Math.min(1,left/_tt)));`],
  [String.raw`var REST_KEY='fit_rest',_restEnd=0,_restIv=null;`,
   String.raw`var REST_KEY='fit_rest',_restEnd=0,_restIv=null,_restTot=0;`],
  [String.raw`.fw-rest-x{border:none;background:rgba(255,255,255,.16);color:var(--white);border-radius:10px;padding:6px 11px;font-size:11px;font-weight:800;font-family:inherit;cursor:pointer}`,
   String.raw`.fw-rest-x{border:none;background:rgba(255,255,255,.16);color:var(--white);border-radius:10px;padding:6px 11px;font-size:11px;font-weight:800;font-family:inherit;cursor:pointer}
.fw2-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
.fw2-x{flex:none;width:38px;height:38px;border:none;border-radius:50%;background:var(--card);box-shadow:-3px -3px 7px var(--nu-lit),4px 5px 10px var(--nu-shade-soft);font-size:21px;line-height:1;color:var(--ink);cursor:pointer;font-family:inherit;padding:0}
.fw2-of{flex:1;min-width:0;border:none;background:none;font:inherit;font-size:12.5px;font-weight:800;color:var(--ink-soft);cursor:pointer;text-align:center;padding:8px 4px}
.fw2-bar{height:5px;border-radius:9px;background:var(--nu-shade-soft);overflow:hidden;margin:0 2px 12px}
.fw2-bar i{display:block;height:100%;border-radius:9px;background:var(--cta-fill);transition:width .3s}
.fw2-fig{width:100%;height:min(24vh,190px);max-width:100%;border-radius:18px;overflow:hidden;background:#140f0c}
.fw2 .fx-rows{gap:4px 8px}
.fw2 .fx-sc{min-height:30px;padding:4px 6px}
.fw2 .fx-ri,.fw2 .fx-rw{font-size:13.5px}
.fw2 .fx-inn{font-size:24px;padding:2px 0 0}
.fw2-sets{padding-top:10px;padding-bottom:10px}
.fw2-fig video{width:100%;height:100%;display:block;object-fit:contain}
.fw2-nm{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:12px 2px 6px}
.fw2-nmx{min-width:0}
.fw2-sub{font-size:11.5px;font-weight:700;color:var(--muted);margin-top:2px}
.fw2-more{flex:none;width:40px;height:40px;border:none;border-radius:13px;background:var(--card);box-shadow:-3px -3px 7px var(--nu-lit),4px 5px 10px var(--nu-shade-soft);font-size:20px;font-weight:800;color:var(--ink);cursor:pointer;font-family:inherit;padding:0}
.fw2-note{font-size:12px;color:var(--muted);margin:0 2px 8px;white-space:pre-wrap}
.fw2-pane{margin-bottom:12px}
.fw2-ph{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;font-size:13.5px;color:var(--ink)}
.fw2-pc{border:none;background:none;font:inherit;font-size:12px;font-weight:700;color:var(--muted);cursor:pointer;padding:4px}
.fw2-in{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0 0;align-items:stretch}
.fw2-in .fx-in{display:flex;flex-direction:column;justify-content:center}
.fw2-eff{margin-top:10px}
.fw2-warm{margin-top:10px}
.fw2-log{margin:12px 0 4px}
.fw2-pl{min-height:19px}
.fw2-nav{display:flex;gap:8px;margin-top:12px}
.fw2-bk{flex:0 0 auto;border:none;background:none;padding:12px 14px;font:inherit;font-size:13px;font-weight:700;color:var(--muted);cursor:pointer}
.fw2-nx{flex:1;border:none;border-radius:14px;padding:12px;font:inherit;font-size:13.5px;font-weight:800;background:var(--surface);color:var(--ink);cursor:pointer}
.fw2-nx.fw2-fin{background:var(--cta-fill);color:var(--white)}
.fss-l .fw2-del b{color:var(--terra-700)}
.fw-rest:not(.fwr2) .fwr2-only{display:none}
.fw-rest:not(.fwr2) .fwr2-ring,.fw-rest:not(.fwr2) .fwr2-b{display:contents}
.fw-rest.fwr2{inset:0;transform:none;border-radius:0;flex-direction:column;justify-content:center;gap:18px;background:var(--nu-ground,#ebe7e1);color:var(--ink);box-shadow:none;z-index:900;padding:calc(24px + env(safe-area-inset-top)) max(24px,env(safe-area-inset-right)) calc(24px + env(safe-area-inset-bottom)) max(24px,env(safe-area-inset-left))}
.fwr2-t{font-size:13px;font-weight:800;color:var(--muted)}
.fwr2-ring{position:relative;width:200px;height:200px;display:grid;place-items:center}
.fwr2-ring svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}
.fwr2-tr{fill:none;stroke:var(--nu-shade-soft);stroke-width:12}
.fwr2-pr{fill:none;stroke:var(--cta-fill);stroke-width:12;stroke-linecap:round;stroke-dasharray:452.4;transition:stroke-dashoffset .25s linear}
.fwr2 .fw-rest-n{font-size:46px;color:var(--ink)}
.fwr2-b{display:flex;gap:10px;width:100%;max-width:320px}
.fwr2 .fw-rest-x{flex:1;background:var(--card);color:var(--ink);box-shadow:-3px -3px 7px var(--nu-lit),4px 5px 10px var(--nu-shade-soft);padding:13px;font-size:14px;border-radius:14px}
.fwr2-nx{display:flex;gap:12px;align-items:center;width:100%;max-width:320px;border-radius:16px;padding:10px 12px;background:var(--card);box-shadow:inset 2px 3px 6px var(--nu-shade-soft),inset -2px -2px 5px var(--nu-lit)}
.fwr2-th{flex:none;width:56px;height:56px;border-radius:12px;object-fit:cover;background:#140f0c}
.fwr2-nx small{display:block;font-size:11.5px;color:var(--muted)}
.fwr2-nx b{display:block;font-size:15px;color:var(--ink)}`],
];

let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 200)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
