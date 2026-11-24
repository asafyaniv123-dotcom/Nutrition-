// The fourth pair of evening questions, and the workout moved into the day - as Asaf approved them on the review
// page (24 Nov, "הכל מאושר"):
//  - למחר: a porcelain sunrise over the question; the writing well has faint ruled lines like a paper card and the
//    page's serif; under it three optional pebbles - a thought, an intention, a small step - stored as
//    takeawayKind (data, translated at display) and shown beside the sentence in the summary.
//  - הכרת תודה: porcelain hands holding a small light; up to three numbered slots, one open, "+" for the next. The
//    answer is still ONE string under `grateful`, a line per thing, so every day already answered reads as before.
//    Lines in written answers now show as lines in the summary (white-space:pre-line).
//  - האימון: asked during the day instead. On a day the week plan has a workout and nothing is logged, from 18:00
//    until the day ends at 04:00 a small porcelain card on home asks "today's workout - did it happen?". The answer
//    is NOT written into sum_<date>: three places (the evening reminder among them) read a summary's mere
//    existence as "the day is already summarised", and a yes at six would have silenced the reminder. It goes to
//    wo_said_<date>; trainedOn reads it, and the evening's first save copies it into the summary, so the
//    summary shows it without asking.
// Sunrise and hands are cut from the two approved renders into assets/rf-q4.webp (600x240 sunrise over 360x300
// hands at x=120), colour-matched to the ground.
// usage: node tools/patches/rf-q-take-thanks.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`var RF_PLANNED=['בכלל לא','קצת','חלקית','די הרבה','לגמרי'];
`,
   `var RF_PLANNED=['בכלל לא','קצת','חלקית','די הרבה','לגמרי'];
// what kind of thing the sentence for tomorrow is - optional, stored as picked
var RF_TAKE_KIND=['מחשבה','כוונה','צעד קטן'];
`],
  [`q.id==='plannedVsActual'?'target':'';
  var pic=k==='star'||k==='wave'?'rf-q2':k==='target'?'rf-q3':'rf-q';`,
   `q.id==='plannedVsActual'?'target':q.id==='takeawayForTomorrow'?'sunrise':q.id==='grateful'?'hands':'';
  var pic=k==='star'||k==='wave'?'rf-q2':k==='target'?'rf-q3':k==='sunrise'||k==='hands'?'rf-q4':'rf-q';`],
  [`  else if(q.kind==='text'){
    h+='<textarea class="rf-in" id="rf-in" oninput="rfGrow(this)" placeholder="'+(q.ph||'')+'">'+(cur?esc(cur):'')+'</textarea>';
    h+='<button onclick="rfNext()" class="rf-next">'+_t('המשך')+'</button>';`,
   `  else if(q.kind==='text'){
    if(q.id==='grateful')h+=rfqThanksHTML(cur,q.ph);
    else h+='<textarea class="rf-in'+(q.id==='takeawayForTomorrow'?' rfq-lined':'')+'" id="rf-in" oninput="rfGrow(this)" placeholder="'+(q.ph||'')+'">'+(cur?esc(cur):'')+'</textarea>';
    if(q.id==='takeawayForTomorrow')h+=rfqKindHTML();
    h+='<button onclick="rfNext()" class="rf-next">'+_t('המשך')+'</button>';`],
  [`function rfqFace(i){`,
   `/* gratitude: a slot per thing, at most three asked for; a day that wrote more keeps them all */
function rfqThanksHTML(cur,ph){
  var a=String(cur||'').split('\\n').filter(function(x){return x.trim();}),n=Math.max(1,a.length),i,h='<div class="rfq-thx" id="rfq-thx">';
  for(i=0;i<n;i++)h+=rfqThxSlot(i,a[i]||'',ph);
  h+='</div>';
  if(n<3)h+='<button class="rfq-plus" id="rfq-plus" onclick="rfqThxAdd()" aria-label="'+_t('עוד דבר')+'">+</button>';
  return h;
}
function rfqThxSlot(i,v,ph){
  return '<label class="rfq-slot'+(v?' has':'')+'"><span class="rfq-n">'+nfmt(i+1)+'</span><input class="rfq-thx-in" value="'+esc(v)+'" placeholder="'+(ph||'')+'" oninput="this.parentNode.classList.toggle(&quot;has&quot;,!!this.value.trim())"></label>';
}
function rfqThxAdd(){
  var box=document.getElementById('rfq-thx');if(!box)return;
  var n=box.querySelectorAll('.rfq-slot').length,q=rfSteps()[_rfStep]||{};
  box.insertAdjacentHTML('beforeend',rfqThxSlot(n,'',q.ph));
  var ins=box.querySelectorAll('.rfq-thx-in');ins[ins.length-1].focus();
  if(n+1>=3){var p=document.getElementById('rfq-plus');if(p)p.remove();}
}
function rfqKindHTML(){
  var cur=rfVal('takeawayKind'),h='<div class="rfq-kinds">',i;
  for(i=0;i<RF_TAKE_KIND.length;i++)h+='<button class="rfq-kind'+(cur===RF_TAKE_KIND[i]?' on':'')+'" onclick="rfqKind('+i+')">'+_t(RF_TAKE_KIND[i])+'</button>';
  return h+'</div>';
}
/* no re-render: the sentence being written stays where it is */
function rfqKind(i){
  var v=RF_TAKE_KIND[i],nv=rfVal('takeawayKind')===v?'':v;
  rfSave({takeawayKind:nv});
  var b=document.querySelectorAll('.rfq-kind');
  for(var j=0;j<b.length;j++)b[j].className='rfq-kind'+(RF_TAKE_KIND[j]===nv?' on':'');
}
function rfqFace(i){`],
  [`  if(q.kind==='text'){
    el=document.getElementById('rf-in');
    if(el){p[q.id]=el.value.trim();rfSave(p);}`,
   `  if(q.kind==='text'&&q.id==='grateful'){
    var tx=document.querySelectorAll('.rfq-thx-in'),a=[];
    for(var ti=0;ti<tx.length;ti++)if(tx[ti].value.trim())a.push(tx[ti].value.trim());
    if(tx.length){p.grateful=a.join('\\n');rfSave(p);}
  } else if(q.kind==='text'){
    el=document.getElementById('rf-in');
    if(el){p[q.id]=el.value.trim();rfSave(p);}`],
  [`      if(el&&String(el.value||'').trim()){wrote=true;break;}}
    if(!wrote)return;`,
   `      if(el&&String(el.value||'').trim()){wrote=true;break;}}
    var tx=document.querySelectorAll('.rfq-thx-in');
    for(i=0;i<tx.length;i++)if(tx[i].value.trim())wrote=true;
    if(!wrote)return;`],
  [`  var r=loadSummary(d)||{date:d,createdAt:new Date().toISOString()};
  for(var k in patch)if(Object.prototype.hasOwnProperty.call(patch,k))r[k]=patch[k];`,
   `  var r=loadSummary(d);
  /* the day's first answer carries what home already heard about the workout */
  if(!r){r={date:d,createdAt:new Date().toISOString()};var ws=woSaid(d);if(ws!==null)r.workoutDone=ws;}
  for(var k in patch)if(Object.prototype.hasOwnProperty.call(patch,k))r[k]=patch[k];`],
  [`  if(sum&&sum.workoutDone===true)return true;`,
   `  if(sum&&sum.workoutDone===true)return true;
  if(dateStr&&woSaid(dateStr)===true)return true;`],
  [`/* If a session was already recorded there is nothing to ask - the app knows. */`,
   `/* "Did it happen?", asked on home during the day. Kept apart from sum_<date>,
   whose mere existence means "already summarised" to the evening reminder. */
function woSaid(d){try{var x=localStorage.getItem('wo_said_'+d);return x==='1'?true:x==='0'?false:null;}catch(e){return null;}}
function homeWoPaint(){
  var el=document.getElementById('home-wo');if(!el)return;
  var d=todayStr(),pl=null,logged=false,s=loadSummary(d),hr=new Date().getHours();
  try{pl=plannedWorkoutFor(d);logged=workoutLoggedOn(d);}catch(e){}
  var heard=woSaid(d)!==null||(s&&(s.workoutDone===true||s.workoutDone===false));
  if(!pl||logged||heard||(hr<18&&hr>=4)){if(!el.querySelector('.hwo-said'))el.innerHTML='';return;}
  el.innerHTML='<div class="hwo"><div class="hwo-q">'+_t('האימון של היום — יצא?')+'</div>'+
    '<div class="hwo-b"><button onclick="homeWoSay(true)">'+_t('כן')+'</button><button onclick="homeWoSay(false)">'+_t('לא היום')+'</button></div></div>';
}
function homeWoSay(v){
  var d=todayStr();
  try{localStorage.setItem('wo_said_'+d,v?'1':'0');}catch(e){}
  var s=loadSummary(d);if(s){s.workoutDone=v;saveSummary(d,s);}
  var el=document.getElementById('home-wo');if(!el)return;
  el.innerHTML='<div class="hwo hwo-said">'+(v?_t('נרשם. כל הכבוד.'):_t('נרשם. מחר יום חדש.'))+'</div>';
  setTimeout(function(){if(el.querySelector('.hwo-said'))el.innerHTML='';},2600);
}

/* If a session was already recorded there is nothing to ask - the app knows. */`],
  [`    '<div id="home-today" class="td-wrap"></div>'+`,
   `    '<div id="home-wo" class="hwo-wrap"></div>'+
    '<div id="home-today" class="td-wrap"></div>'+`],
  [`function renderHomeToday(){
  renderGreeting();`,
   `function renderHomeToday(){
  renderGreeting();
  try{homeWoPaint();}catch(e){}`],
  [`      items+='<div class="sm2-pz">'+(lab?'<div class="sm2-pz-l">'+sumIconSVG(id)+'<span>'+lab+'</span></div>':'')+
             '<div class="sm2-pz-b">'+esc(sum[id])+'</div></div>';`,
   `      items+='<div class="sm2-pz">'+(lab?'<div class="sm2-pz-l">'+sumIconSVG(id)+'<span>'+lab+'</span></div>':'')+
             '<div class="sm2-pz-b">'+sumProseBody(sum,id)+'</div></div>';`],
  [`<span>'+sumLabelFor(id)+'</span></div><p>'+esc(sum[id])+'</p></div>';`,
   `<span>'+sumLabelFor(id)+'</span></div><p>'+sumProseBody(sum,id)+'</p></div>';`],
  [`/* Every written answer as its own memory card:`,
   `/* A written answer, and for the sentence for tomorrow the kind it was given */
function sumProseBody(sum,id){
  var h=esc(sum[id]);
  if(id==='takeawayForTomorrow'&&sum.takeawayKind)h='<i class="sm-kind">'+labelOf(sum.takeawayKind)+'</i>'+h;
  return h;
}
/* Every written answer as its own memory card:`],
  [`html body.mod-endofday .rfq-plan .rf-rung.on .rfq-g{filter:drop-shadow(0 0 4px rgba(240,169,46,.6))}
`,
   `html body.mod-endofday .rfq-plan .rf-rung.on .rfq-g{filter:drop-shadow(0 0 4px rgba(240,169,46,.6))}
/* the fourth pair (24 Nov): assets/rf-q4.webp is a 600x240 sunrise over 360x300 hands, drawn at 0.4 */
html body.mod-endofday .rfq-sunrise{width:240px;height:96px;background-size:240px 216px;background-position:0 0;
  -webkit-mask:radial-gradient(farthest-side,#000 62%,transparent 100%);mask:radial-gradient(farthest-side,#000 62%,transparent 100%)}
html body.mod-endofday .rfq-hands{width:144px;height:120px;background-size:240px 216px;background-position:-48px -96px;
  -webkit-mask:radial-gradient(closest-side,#000 70%,transparent 100%);mask:radial-gradient(closest-side,#000 70%,transparent 100%)}
html body.mod-endofday .rf-in.rfq-lined{font-family:"Frank Ruhl Libre",Georgia,serif;line-height:34px;padding:12px 18px;
  background-image:repeating-linear-gradient(transparent 0 33px,rgba(176,168,156,.32) 33px 34px);background-position:0 12px;background-attachment:local}
html body.mod-endofday .rfq-kinds{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:16px 0 2px}
html body.mod-endofday .rfq-kind{border:none;padding:9px 18px;border-radius:99px;background:var(--nu-ground);color:var(--nu-ink);
  font-family:"Frank Ruhl Libre",Georgia,serif;font-size:15px;box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}
html body.mod-endofday .rfq-kind.on{color:#8a5a1c;
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit),0 0 0 2px rgba(240,169,46,.5),0 0 12px 2px rgba(240,169,46,.25)}
html body.mod-endofday .rfq-thx{display:flex;flex-direction:column;gap:12px}
html body.mod-endofday .rfq-slot{display:flex;align-items:center;gap:12px;padding:6px;padding-inline-end:16px;border-radius:99px;
  background:var(--nu-ground);box-shadow:inset 3px 4px 8px var(--nu-shade),inset -3px -3px 7px var(--nu-lit);transition:box-shadow .2s}
html body.mod-endofday .rfq-slot.has{box-shadow:inset 3px 4px 8px var(--nu-shade),inset -3px -3px 7px var(--nu-lit),0 0 0 2px rgba(240,169,46,.45),0 0 12px 2px rgba(240,169,46,.2)}
html body.mod-endofday .rfq-thx-in{flex:1;min-width:0;border:none;background:none;outline:none;padding:10px 0;
  font-family:"Frank Ruhl Libre",Georgia,serif;font-size:16px;color:var(--nu-ink);unicode-bidi:plaintext}
html body.mod-endofday .rfq-thx-in::placeholder{color:var(--nu-muted)}
html body.mod-endofday .rfq-plus{display:block;width:44px;height:44px;margin:14px auto 0;padding:0;border:none;border-radius:50%;
  background:var(--nu-ground);color:var(--nu-ink);font-size:22px;box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}
.sm2-pz-b,.sm4-mem p{white-space:pre-line}
.sm-kind{display:block;font-style:normal;font-size:12px;font-weight:700;color:var(--muted);margin-bottom:2px}
`],
  [`html body.mod-home .td-clock{color:var(--nu-ink)}
`,
   `html body.mod-home .td-clock{color:var(--nu-ink)}
/* the workout, asked during the day (24 Nov) */
.hwo-wrap{width:100%;max-width:380px}
.hwo-wrap:empty{display:none}
.hwo{margin:0 0 16px;padding:14px 16px;border-radius:22px;background:var(--nu-ground,#e9e7e3);color:var(--nu-ink,#4a453f);
  box-shadow:-5px -5px 13px var(--nu-lit,#fff),6px 8px 18px var(--nu-shade-soft,rgba(176,168,156,.4))}
.hwo-q{font-size:15px;font-weight:700;margin-bottom:10px}
.hwo-b{display:flex;gap:10px}
.hwo-b button{flex:1;border:none;padding:10px;border-radius:99px;font:inherit;font-size:14px;font-weight:600;cursor:pointer;
  background:var(--nu-ground,#e9e7e3);color:var(--nu-ink,#4a453f);box-shadow:-3px -3px 7px var(--nu-lit,#fff),3px 4px 9px var(--nu-shade-soft,rgba(176,168,156,.4))}
.hwo-said{font-size:14px;font-weight:600;text-align:center;color:var(--nu-ink,#4a453f)}
`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
