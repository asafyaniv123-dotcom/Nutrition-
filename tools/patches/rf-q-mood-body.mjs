// The first two evening questions, inside, as Asaf approved them on the review page (24 Nov): the porcelain
// look he chose for the board, and a wider range than five faces and seven words ("the range of feelings is
// bigger than what you offered").
//  - איך הרגשת: a porcelain face over the question; the five faces are porcelain, each in a raised dish, the
//    chosen one pressed with light round it. The five-point scale stays exactly as stored - the day's colour,
//    the charts and the trends read it - and under it a layer of named feelings, several allowed, the group
//    that matches the face first and the rest one tap away. Stored as moodWords, raw Hebrew, like every list.
//  - הגוף שלך: a porcelain figure; fifteen states instead of seven, as tiles, the good ones first. The seven
//    old words are unchanged, so every answer already stored still lights its tile.
// The faces and figures are cut from the two approved Higgsfield renders into one sprite, assets/rf-q.webp
// (two 300px heroes over five 120px faces).
// usage: node tools/patches/rf-q-mood-body.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`var RF_BODY=['אנרגטי','עייף','רגוע','מתוח','כבד','חזק','כאוב'];
`,
   `var RF_BODY=['אנרגטי','רענן','חזק','גמיש','רגוע','קליל','עייף','ישנוני','כבד','מתוח','תפוס','כאוב','כאב ראש','נפוח','חולה'];
var RF_BODY_GOOD=6;   // the first six feel good; a gap is drawn after them
/* the feelings under the five faces (24 Nov): pleasant, in between, hard - cut at RF_FEEL_CUT */
var RF_FEEL=['שמח','רגוע','גאה','אסיר תודה','נרגש','מלא תקווה','אהוב','סקרן','מסופק','בטוח בעצמי',
  'שקט','מעורב','מבולבל','משועמם','מפוזר','נוסטלגי',
  'עצוב','מתוסכל','לחוץ','חרד','כועס','בודד','מאוכזב','מוצף','אשם','פגוע'];
var RF_FEEL_CUT=[10,16];
`],
  [`var LABEL_CTX={'חברה':'חברה|קשר','כבד':'כבד|גוף'};`,
   `var LABEL_CTX={'חברה':'חברה|קשר','כבד':'כבד|גוף','תפוס':'תפוס|גוף','קליל':'קליל|גוף','שקט':'שקט|רגש','מעורב':'מעורב|רגש'};`],
  [`function rfFaceMini(m){`,
   `/* the porcelain pieces in assets/rf-q.webp: a hero over a question, and the five faces */
var _rfFeelAll=false;
function rfqHero(q){
  var k=q.kind==='mood'?'face':q.id==='bodyFeelings'?'body':'';
  return k?'<div class="rfq-hero rfq-'+k+'" style="background-image:url('+liveBase()+'assets/rf-q.webp)"></div>':'';
}
function rfqFace(i){return '<i class="rfq-f" style="background-image:url('+liveBase()+'assets/rf-q.webp);--fi:'+i+'"></i>';}
/* the feelings, the group that matches the face first; the others wait behind one button */
function rfqFeelHTML(v){
  var g=[RF_FEEL.slice(0,RF_FEEL_CUT[0]),RF_FEEL.slice(RF_FEEL_CUT[0],RF_FEEL_CUT[1]),RF_FEEL.slice(RF_FEEL_CUT[1])];
  var order=v>=4?[0,1,2]:v===3?[1,0,2]:[2,1,0],sel=rfArr('moodWords'),i,h='',more=false;
  for(i=1;i<3;i++)if(g[order[i]].some(function(w){return sel.indexOf(w)>=0;}))more=true;
  h+='<div class="rf-sub rfq-ask">'+_t('מה בדיוק הרגשת?')+'</div><div class="rfq-tiles">'+rfChipsHTML('moodWords',g[order[0]],sel);
  if(_rfFeelAll||more)for(i=1;i<3;i++)h+=rfChipsHTML('moodWords',g[order[i]],sel);
  else h+='<button class="rf-ghost rfq-more" onclick="_rfFeelAll=true;renderReflectStep()">'+_t('עוד רגשות')+'</button>';
  return h+'</div>';
}
function rfFaceMini(m){`],
  [`  h+='<div class="rf-q">'+q.q+'</div>';
  if(q.sub)h+='<div class="rf-sub">'+q.sub+'</div>';`,
   `  h+=rfqHero(q);
  h+='<div class="rf-q">'+q.q+'</div>';
  if(q.sub)h+='<div class="rf-sub">'+q.sub+'</div>';`],
  [`    h+='<div class="rf-moods">';
    for(i=0;i<RF_MOODS.length;i++){
      var m=RF_MOODS[i],on=cur===m.v;
      h+='<button class="rf-mood'+(on?' on':'')+'" onclick="rfPickMood(\\''+q.id+'\\','+m.v+')">'+rfFace(i,m.c,on)+'<span class="rf-mood-l">'+m.l+'</span></button>';
    }
    h+='</div>';`,
   `    h+='<div class="rf-moods rfq-moods">';
    for(i=0;i<RF_MOODS.length;i++){
      var m=RF_MOODS[i],on=cur===m.v;
      h+='<button class="rf-mood'+(on?' on':'')+'" onclick="rfPickMood(\\''+q.id+'\\','+m.v+')"><span class="rfq-dish">'+rfqFace(i)+'</span><span class="rf-mood-l">'+m.l+'</span></button>';
    }
    h+='</div>';
    /* the day's mood asks what exactly; the one at the very end of the evening stays a single tap */
    if(q.id==='mood'&&cur){h+=rfqFeelHTML(cur);h+='<button onclick="rfNext()" class="rf-next">'+_t('המשך')+'</button>';}`],
  [`  else if(q.kind==='chips'){
    h+=rfChipsHTML(q.id,q.opts,rfArr(q.id));`,
   `  else if(q.kind==='chips'&&q.id==='bodyFeelings'){
    h+='<div class="rfq-tiles">'+rfChipsHTML(q.id,q.opts.slice(0,RF_BODY_GOOD),rfArr(q.id))+rfChipsHTML(q.id,q.opts.slice(RF_BODY_GOOD),rfArr(q.id))+'</div>';
    h+='<button onclick="rfNext()" class="rf-next">'+_t('המשך')+'</button>';
  }
  else if(q.kind==='chips'){
    h+=rfChipsHTML(q.id,q.opts,rfArr(q.id));`],
  [`function rfPickMood(id,v){
  var p={};p[id]=v;rfSave(p);`,
   `function rfPickMood(id,v){
  var p={};p[id]=v;rfSave(p);
  if(id==='mood'){_rfFeelAll=false;renderReflectStep();return;}`],
  [`    m=RF_MOODS[v-1];if(!m)return '';
    return '<span class="sm2-dot" style="background:'+m.c+'"></span>'+m.l;`,
   `    m=RF_MOODS[v-1];if(!m)return '';
    a=id==='mood'&&Array.isArray(sum.moodWords)?sum.moodWords:[];
    return '<span class="sm2-dot" style="background:'+m.c+'"></span>'+m.l+(a.length?' · '+a.map(function(x){return labelOf(x);}).join(' · '):'');`],
  [`html body.mod-endofday .rf-field{background:none;border:none}
`,
   `html body.mod-endofday .rf-field{background:none;border:none}
/* ── THE PORCELAIN QUESTIONS (24 Nov) ── a hero over the question, faces in dishes, answers as tiles ── */
html body.mod-endofday .rfq-hero{width:150px;height:150px;margin:0 auto 14px;flex:none;background-repeat:no-repeat;background-size:300px 210px;
  -webkit-mask:radial-gradient(closest-side,#000 52%,transparent 97%);mask:radial-gradient(closest-side,#000 52%,transparent 97%)}
html body.mod-endofday .rfq-body{background-position:-150px 0}
html body.mod-endofday .rfq-moods{gap:4px}
html body.mod-endofday .rfq-moods .rf-mood{opacity:1;transform:none;gap:9px}
html body.mod-endofday .rfq-dish{display:grid;place-items:center;width:58px;height:58px;border-radius:50%;background:var(--nu-ground);overflow:hidden;
  box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft);transition:box-shadow .2s}
html body.mod-endofday .rfq-f{display:block;width:62px;height:62px;background-repeat:no-repeat;background-size:310px 217px;
  background-position:calc(var(--fi) * -62px) -155px;
  -webkit-mask:radial-gradient(closest-side,#000 71%,transparent 77%);mask:radial-gradient(closest-side,#000 71%,transparent 77%)}
html body.mod-endofday .rfq-moods .rf-mood.on .rfq-dish{box-shadow:inset 3px 4px 8px var(--nu-shade),inset -3px -3px 7px var(--nu-lit),
  0 0 0 2px rgba(240,169,46,.55),0 0 16px 3px rgba(240,169,46,.35)}
html body.mod-endofday .rfq-moods .rf-mood-l{font-size:12px;color:var(--nu-muted)}
html body.mod-endofday .rfq-moods .rf-mood.on .rf-mood-l{color:#8a5a1c}
html body.mod-endofday .rfq-ask{margin:28px 0 12px;font-weight:700;color:var(--nu-ink)}
html body.mod-endofday .rfq-tiles .rf-chips{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
html body.mod-endofday .rfq-tiles .rf-chips+.rf-chips{margin-top:18px}
html body.mod-endofday .rfq-tiles .rf-chip{border-radius:16px;padding:13px 6px;font-size:14px;line-height:1.2;min-width:0}
html body.mod-endofday .rfq-tiles .rf-chip.on{color:#8a5a1c;
  box-shadow:inset 3px 4px 8px var(--nu-shade),inset -3px -3px 7px var(--nu-lit),inset 0 0 0 1.5px rgba(240,169,46,.6),inset 0 0 12px rgba(240,169,46,.22)}
html body.mod-endofday .rfq-more{display:block;margin:14px auto 0;font-size:14px;font-weight:700}
`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
