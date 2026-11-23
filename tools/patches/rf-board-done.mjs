// The deep-pass board "מה עוד להוסיף להיום?" showed only cards, and a person could not see what they had already done
// (Asaf, 23 Nov, screenshot: "חסרה האפשרות לראות מה כבר עשית והשאלות שכבר ענית עליהן"). Above the cards now: what
// was already written today - the evening's own questions and any card already answered - each with its answer, and a
// tap that reopens it and comes back here. The grid below holds only what is still open.
// usage: node tools/patches/rf-board-done.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [];
const P = (a, b) => pairs.push([a, b]);

P(`  h+='<div class="rf-board">';
  for(i=0;i<bank.length;i++){
    var q=bank[i],g=RF_GRAD[q.g]||RF_GRAD.lav,ok=rfAnswered(q);
    h+='<button class="rf-card'+(ok?' done':'')+'" style="background:'+g[0]+'" onclick="rfOpenCard('+i+')">';`,
`  h+=rfDidHTML();
  h+='<div class="rf-board">';
  for(i=0;i<bank.length;i++){
    var q=bank[i],g=RF_GRAD[q.g]||RF_GRAD.lav,ok=rfAnswered(q);
    if(ok)continue;
    h+='<button class="rf-card'+(ok?' done':'')+'" style="background:'+g[0]+'" onclick="rfOpenCard('+i+')">';`);
P(`  h+='<button onclick="rfFinish()" class="rf-next" style="margin-top:20px">'+_t('סיימתי להיום')+'</button>';
  h+='</div>';
  document.getElementById('content').innerHTML=h;
}
function rfOpenCard(i){`,
`  h+='<button onclick="rfFinish()" class="rf-next" style="margin-top:20px">'+_t('סיימתי להיום')+'</button>';
  h+='</div>';
  document.getElementById('content').innerHTML=h;
  try{hydratePhotos(document.getElementById('content'));}catch(e){}
}
/* WHAT IS ALREADY WRITTEN. The evening's own questions first, in the order
   they were asked, then the cards answered off the board - each with its
   answer, so the person sees the day they have so far. A tap reopens that
   question; when it is done the person lands back here, not further along. */
var _rfEditBack=false;
function rfDidHTML(){
  var r=rfRec(_rfDate)||{},rows='',n=0,i,q,v;
  var st=_rfStage;_rfStage=1;var one=rfSteps();_rfStage=st;
  for(i=0;i<one.length;i++){
    q=one[i];
    if(rfAnsweredIn(r,q))v=rfAnsShort(r,q);
    else if(q.kind==='photo'&&r.dayColor&&dayColorOf(r.dayColor))v='<span class="rf-did-c" style="--dc:'+dayColorOf(r.dayColor)+'"></span>';
    else continue;
    rows+='<button class="rf-did-r" onclick="rfEditAns(1,'+i+')"><span class="rf-did-l">'+(sumLabelFor(q.id)||q.t||q.q)+'</span><span class="rf-did-v">'+v+'</span></button>';n++;
  }
  var bank=rfBank();
  for(i=0;i<bank.length;i++){
    q=bank[i];if(!rfAnsweredIn(r,q))continue;
    rows+='<button class="rf-did-r" onclick="rfEditAns(2,'+i+')"><span class="rf-did-l">'+q.t+'</span><span class="rf-did-v">'+rfAnsShort(r,q)+'</span></button>';n++;
  }
  if(!n)return '';
  return '<div class="rf-did"><div class="rf-did-h">'+_t('מה כבר כתבת היום')+'</div>'+rows+'</div>';
}
/* one answer, short: the summary's own wording where it has one, else the
   person's words (cut, never re-written) or the option they picked */
function rfAnsShort(r,q){
  var v=r[q.id],f='';
  if(q.kind==='photo'&&v)return '<span class="rf-did-ph">'+photoImg(v,'alt=""')+'</span>';
  try{f=sumFactValue(r,q.id,_rfDate)||'';}catch(e){f='';}
  if(f)return f;
  if(q.kind==='branch')return v?_t('כן'):_t('לא');
  if(q.kind==='mood'){var m=RF_MOODS[v-1];return m?m.l:'';}
  if(Array.isArray(v)){
    var w=v.filter(function(x){return typeof x==='string'&&x;}).map(function(x){return esc(_t(x));});
    if(w.length)return w.join(' · ');
  }
  if(typeof v==='string'&&v.trim())return esc(v.length>80?v.slice(0,80)+'…':v);
  if(q.note&&typeof r[q.note]==='string'&&r[q.note])return esc(r[q.note].slice(0,80));
  return '&#10003;';
}
function rfEditAns(stage,i){
  _rfEditBack=true;_rfStage=stage;_rfStep=i;_rfView='step';
  if(stage===2)rfSave({lastStage:2,lastStep:i});
  renderReflect();window.scrollTo(0,0);
}
function rfOpenCard(i){`);
// back to the board after an evening question reopened from it
P(`  var last=rfSteps().length-1;
  rfSave({lastStep:Math.min(last,_rfStep+1),lastStage:1});`,
`  if(_rfEditBack){_rfEditBack=false;_rfStage=2;_rfView='board';renderReflect();return;}
  var last=rfSteps().length-1;
  rfSave({lastStep:Math.min(last,_rfStep+1),lastStage:1});`);
P(`  if(_rfStage===2){_rfView='board';renderReflect();return;}
  if(_rfStep===0){_rfView='home';renderReflect();return;}`,
`  if(_rfStage===2){_rfView='board';renderReflect();return;}
  if(_rfEditBack){_rfEditBack=false;_rfStage=2;_rfView='board';renderReflect();return;}
  if(_rfStep===0){_rfView='home';renderReflect();return;}`);
P(`html body.mod-endofday .rf-hero-t{color:var(--nu-ink);font-size:17px;font-weight:800}`,
`html body.mod-endofday .rf-hero-t{color:var(--nu-ink);font-size:17px;font-weight:800}
/* what is already written, above the cards still open: one raised sheet, rows of answer */
.rf-did{border-radius:20px;padding:14px 16px 6px;margin:0 0 18px;background:var(--nu-ground);
  box-shadow:-4px -4px 9px var(--nu-lit),5px 6px 13px var(--nu-shade-soft)}
.rf-did-h{font-size:13px;font-weight:800;color:var(--nu-muted);margin-bottom:4px}
.rf-did-r{display:flex;align-items:center;gap:12px;width:100%;padding:11px 0;border:none;background:none;cursor:pointer;
  font-family:inherit;text-align:start;color:var(--nu-ink)}
.rf-did-r+.rf-did-r{box-shadow:0 -1px 0 var(--nu-shade-soft)}
.rf-did-l{flex:0 0 36%;font-size:12.5px;font-weight:700;color:var(--nu-muted);line-height:1.35}
.rf-did-v{flex:1;min-width:0;font-size:14px;font-weight:600;line-height:1.45;unicode-bidi:plaintext;overflow-wrap:anywhere}
.rf-did-v .sm2-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-inline-end:6px;vertical-align:middle}
.rf-did-ph img{width:44px;height:44px;border-radius:10px;object-fit:cover;display:block}
.rf-did-c{display:inline-block;width:22px;height:22px;border-radius:50%;background:var(--dc);box-shadow:0 0 10px var(--dc);vertical-align:middle}`);

if (rev) {
  for (const [a, b] of pairs.slice().reverse()) { if (s.split(b).length !== 2) throw new Error('reverse: not once: ' + b.slice(0, 80)); s = s.replace(b, () => a); }
} else {
  for (const [a, b] of pairs) { if (s.split(a).length !== 2) throw new Error('not once: ' + a.slice(0, 80)); s = s.replace(a, () => b); }
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied', pairs.length, F);
