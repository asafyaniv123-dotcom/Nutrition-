/* "Dig deeper" in תובנות (Asaf, 26 Nov 2026: the screen and the tone
 * approved on the review page, level A - a bank written by hand).
 * Inside a topic, a small button brings ONE sharper question about it;
 * "another question" brings the next; "answer" opens the writing screen with
 * the question in the plaque, and the saved entry keeps the question above
 * the answer. An entry stores the question's INDEX (e.dq), never its text -
 * a stored list is data, and the text is drawn through _t at display.
 * The bank is tools/patches/ins-deep-bank.mjs; this script writes it into
 * the file as insDeepQs().
 *   node tools/patches/ins-deep.mjs [file]            apply
 *   node tools/patches/ins-deep.mjs [file] --reverse  undo */
import fs from 'fs';
import { BANK } from './ins-deep-bank.mjs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const byTopic = {};
for (const r of BANK) (byTopic[r[0]] = byTopic[r[0]] || []).push(r[2]);
const cases = Object.entries(byTopic).map(([k, qs]) =>
  "    case '" + k + "':return [" + qs.map((q) => "_t('" + q + "')").join(',\n      ') + '];').join('\n');

const CSS_ANCHOR = 'html body.mod-insights .ins-was-t{color:var(--nu-ink)}\n';
const CSS = CSS_ANCHOR + String.raw`/* ── DIG DEEPER ── one small raised button under the topic; the question it
   brings is a raised card, because it is a thing handed to you, and the
   plaque stays the surface. No lamp of its own: "add an insight" keeps the
   only one on the screen. ── */
.ins-dig{display:flex;align-items:center;gap:7px;margin:-4px auto 18px;border:none;border-radius:99px;
  padding:9px 16px;font-family:inherit;font-size:12.5px;font-weight:800;cursor:pointer}
.ins-dig svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;
  stroke-linejoin:round;opacity:.7}
.ins-deep{border-radius:18px;padding:16px 17px 14px;margin:-4px 0 18px}
.ins-deep-h{font-size:10px;font-weight:800;margin-bottom:8px;letter-spacing:.02em}
.ins-deep-q{font-size:17px;font-weight:800;line-height:1.5;text-wrap:balance}
.ins-deep-b{display:flex;gap:10px;margin-top:14px;align-items:center}
.ins-deep-o{border:none;background:none;font-family:inherit;font-size:12.5px;font-weight:700;
  padding:10px 4px;cursor:pointer}
.ins-deep-a{flex:1;border:none;border-radius:14px;padding:12px;font-family:inherit;font-size:13.5px;
  font-weight:800;cursor:pointer}
.ins-ask-t{font-size:10px;font-weight:800;margin-bottom:6px}
.ins-card-q{font-size:11.5px;font-weight:800;line-height:1.5;margin-bottom:6px}
html body.mod-insights .ins-dig,html body.mod-insights .ins-deep,html body.mod-insights .ins-deep-a{
  background:var(--nu-ground);color:var(--nu-ink);
  box-shadow:-3px -3px 7px var(--nu-lit),4px 5px 10px var(--nu-shade-soft)}
html body.mod-insights .ins-deep{box-shadow:-4px -4px 9px var(--nu-lit),5px 6px 13px var(--nu-shade-soft)}
html body.mod-insights .ins-deep-q{color:var(--nu-ink)}
html body.mod-insights .ins-deep-h,html body.mod-insights .ins-deep-o,
html body.mod-insights .ins-ask-t,html body.mod-insights .ins-card-q{color:var(--nu-muted)}
`;

const JS_ANCHOR = String.raw`var _insView='home';
var _insCat=null;
var _insQ=null;
`;
const JS = JS_ANCHOR + String.raw`/* DIG DEEPER: the question on show (an index into insDeepQs of the topic it
   was drawn for), whether its card is open, and which topic that was. */
var _insDQ=null,_insDeepOpen=false,_insDeepK=null;
var INS_DIG_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v13M6.5 12.5 12 18l5.5-5.5"/><path d="M8 21h8"/></svg>';
/* The bank, by topic. Drawn at display so it follows the language; an entry
   stores the index, so a topic's list may grow at the end and never be
   reordered. Written from tools/patches/ins-deep-bank.mjs. */
function insDeepQs(k){
  switch(k){
` + cases + String.raw`
  }
  return [];
}
/* where a draft lives: a deep question has its own, so starting to answer
   one never lands in the topic's plain box */
function insDraftKey(){return insKey(_insCat,_insQ)+(_insDQ!=null?'#'+_insDQ:'');}
/* the next question of a topic: in order from where she stopped, skipping
   the ones she has already answered while any are left */
function insDeepPick(k){
  var qs=insDeepQs(k);if(!qs.length)return null;
  var pos={};try{pos=JSON.parse(localStorage.getItem('ins_deep_pos')||'{}')||{};}catch(e){}
  var done={};(loadInsights()[k]||[]).forEach(function(e){if(e&&e.dq!=null)done[e.dq]=1;});
  var start=(+pos[k]||0)%qs.length,i=start;
  for(var n=0;n<qs.length;n++){var c=(start+n)%qs.length;if(!done[c]){i=c;break;}}
  pos[k]=i+1;try{localStorage.setItem('ins_deep_pos',JSON.stringify(pos));}catch(e){}
  return i;
}
function insDeepNext(){
  _insDeepK=insKey(_insCat,_insQ);_insDQ=insDeepPick(_insDeepK);_insDeepOpen=_insDQ!=null;
  renderInsights();
}
`;

const PAIRS = [
  [CSS_ANCHOR, CSS],
  [JS_ANCHOR, JS],
  // the draft is kept under the question being answered
  [String.raw`        d=loadInsDrafts(),k=insKey(_insCat,_insQ),`, String.raw`        d=loadInsDrafts(),k=insDraftKey(),`],
  // leaving for the category list closes any question that was open
  [String.raw`function renderInsCat(){
`, String.raw`function renderInsCat(){
  _insDQ=null;_insDeepOpen=false;_insDeepK=null;
`],
  // the topic: the button, or the question it brought
  [String.raw`  h+='<div class="ins-ask" style="--c:'+cat.color+'">'+esc(q)+'</div>';
  for(var ei=entries.length-1;ei>=0;ei--){`,
   String.raw`  h+='<div class="ins-ask" style="--c:'+cat.color+'">'+esc(q)+'</div>';
  var ik=insKey(cat.id,_insQ),dqs=insDeepQs(ik);
  if(_insDeepK!==ik){_insDQ=null;_insDeepOpen=false;_insDeepK=ik;}
  if(dqs.length){
    if(_insDeepOpen&&_insDQ!=null&&dqs[_insDQ]){
      h+='<div class="ins-deep"><div class="ins-deep-h">'+_t('שאלה לעומק')+'</div>';
      h+='<div class="ins-deep-q">'+esc(dqs[_insDQ])+'</div><div class="ins-deep-b">';
      h+='<button class="ins-deep-o" onclick="insDeepNext()">&#8635; '+_t('שאלה אחרת')+'</button>';
      h+='<button class="ins-deep-a" onclick="_insView=\'entry\';renderInsights()">'+_t('לענות')+'</button>';
      h+='</div></div>';
    } else h+='<button class="ins-dig" onclick="insDeepNext()">'+INS_DIG_SVG+_t('חפור עמוק יותר')+'</button>';
  }
  for(var ei=entries.length-1;ei>=0;ei--){`],
  // an answer to a deep question carries its question
  [String.raw`    h+='<div class="ins-when">'+ds+'</div>';
    h+='<div class="ins-txt">'+esc(e.text)+'</div>';`,
   String.raw`    h+='<div class="ins-when">'+ds+'</div>';
    if(e.dq!=null&&dqs[e.dq])h+='<div class="ins-card-q">'+esc(dqs[e.dq])+'</div>';
    h+='<div class="ins-txt">'+esc(e.text)+'</div>';`],
  // a plain insight is not an answer to the question on show
  [String.raw`  h+='<button class="ins-add" onclick="_insView=\'entry\';renderInsights()">'+_t('הוסף תובנה')+'</button>';`,
   String.raw`  h+='<button class="ins-add" onclick="_insDQ=null;_insDeepOpen=false;_insView=\'entry\';renderInsights()">'+_t('הוסף תובנה')+'</button>';`],
  // writing: the question in the plaque, the topic small above it
  [String.raw`  var draft=loadInsDrafts()[insKey(_insCat,_insQ)]||{};`, String.raw`  var draft=loadInsDrafts()[insDraftKey()]||{};
  var dq=_insDQ!=null?insDeepQs(insKey(_insCat,_insQ))[_insDQ]:null;`],
  [String.raw`  h+='<div class="ins-ask" style="--c:'+cat.color+'">'+esc(q)+'</div>';
  h+='<div class="ins-lbl">'+_t('התובנה שלך')+'</div>';`,
   String.raw`  h+='<div class="ins-ask" style="--c:'+cat.color+'">'+(dq?'<div class="ins-ask-t">'+esc(q)+'</div>'+esc(dq):esc(q))+'</div>';
  h+='<div class="ins-lbl">'+_t('התובנה שלך')+'</div>';`],
  // saving keeps the question's index, and clears the right draft
  [String.raw`  data[key].push({text:textInp.value.trim(),date:Date.now(),changedFrom:changedFrom.trim()||null,changedWhy:changedWhy.trim()||null});`,
   String.raw`  var ent={text:textInp.value.trim(),date:Date.now(),changedFrom:changedFrom.trim()||null,changedWhy:changedWhy.trim()||null};
  if(_insDQ!=null)ent.dq=_insDQ;
  data[key].push(ent);`],
  [String.raw`  try{var dr=loadInsDrafts();if(dr[key]){delete dr[key];saveInsDrafts(dr);}}catch(e){}`,
   String.raw`  try{var dr=loadInsDrafts(),dk=insDraftKey();if(dr[dk]){delete dr[dk];saveInsDrafts(dr);}}catch(e){}
  _insDQ=null;_insDeepOpen=false;`],
];

let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 160)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
