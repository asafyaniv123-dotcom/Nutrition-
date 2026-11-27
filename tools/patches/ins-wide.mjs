/* "Go deeper" moves up (Asaf, 27 Nov 2026): the button is called להעמיק, and
 * it lives where she starts - on the Insights home screen it brings a
 * question from ANY topic, inside a category one from that category's topics.
 * Drawn at random, skipping questions already answered while any are left.
 * "Answer" opens the same writing screen as before, filed under the topic the
 * question came from, and saving returns to the screen she asked from.
 * Inside a single topic the button is gone: one place to ask, not three -
 * he wants Insights light, because the thinking is already the work.
 *   node tools/patches/ins-wide.mjs [file]            apply
 *   node tools/patches/ins-wide.mjs [file] --reverse  undo */
import fs from 'fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  // CSS: the home/category button sits a little lower than the topic one did
  [String.raw`.ins-ask-t{font-size:10px;font-weight:800;margin-bottom:6px}`,
   String.raw`.ins-ask-t{font-size:10px;font-weight:800;margin-bottom:6px}
.ins-dig-w{margin:2px auto 20px}
.ins-deep-w{margin:2px 0 20px}`],
  // the drawing and the card, after the topic-level functions
  [String.raw`function insDeepNext(){
  _insDeepK=insKey(_insCat,_insQ);_insDQ=insDeepPick(_insDeepK);_insDeepOpen=_insDQ!=null;
  renderInsights();
}`,
   String.raw`function insDeepNext(){
  _insDeepK=insKey(_insCat,_insQ);_insDQ=insDeepPick(_insDeepK);_insDeepOpen=_insDQ!=null;
  renderInsights();
}
/* GO DEEPER from above: _insW is the question on show {s:scope,c,q,d} - the
   scope is '' on the home screen or the category it was drawn in, so a card
   drawn on one screen never appears on another. _insFrom is the screen
   "answer" was pressed on, so saving goes back there. */
var _insW=null,_insFrom=null;
function insWideDraw(catId){
  var data=loadInsights(),all=[],fresh=[];
  INSIGHTS_CATS.forEach(function(c){
    if(catId&&c.id!==catId)return;
    for(var qi=0;qi<c.questions.length;qi++){
      var k=insKey(c.id,qi),n=insDeepQs(k).length,done={};
      (data[k]||[]).forEach(function(e){if(e&&e.dq!=null)done[e.dq]=1;});
      for(var d=0;d<n;d++){var x={s:catId||'',c:c.id,q:qi,d:d};all.push(x);if(!done[d])fresh.push(x);}
    }
  });
  var pool=fresh.length?fresh:all,w=_insW;
  if(w&&pool.length>1)pool=pool.filter(function(x){return !(x.c===w.c&&x.q===w.q&&x.d===w.d);});
  _insW=pool.length?pool[Math.floor(Math.random()*pool.length)]:null;
  renderInsights();
}
function insWideCard(catId){
  var arg=catId?"'"+catId+"'":'null',w=_insW&&_insW.s===(catId||'')?_insW:null;
  if(!w)return '<button class="ins-dig ins-dig-w" onclick="insWideDraw('+arg+')">'+INS_DIG_SVG+_t('להעמיק')+'</button>';
  var c=INSIGHTS_CATS.find(function(x){return x.id===w.c;}),dq=insDeepQs(insKey(w.c,w.q))[w.d];
  if(!c||!dq){_insW=null;return insWideCard(catId);}
  /* where the question comes from, small above it: on the home screen the
     category too, since it could be any of seven */
  var from=catId?c.questions[w.q]:c.title+' · '+c.questions[w.q];
  var h='<div class="ins-deep ins-deep-w"><div class="ins-deep-h">'+esc(from)+'</div>';
  h+='<div class="ins-deep-q">'+esc(dq)+'</div><div class="ins-deep-b">';
  h+='<button class="ins-deep-o" onclick="insWideDraw('+arg+')">&#8635; '+_t('שאלה אחרת')+'</button>';
  h+='<button class="ins-deep-a" onclick="insWideAnswer('+arg+')">'+_t('לענות')+'</button>';
  return h+'</div></div>';
}
function insWideAnswer(catId){
  var w=_insW;if(!w)return;
  _insCat=w.c;_insQ=w.q;_insDQ=w.d;_insFrom=catId?'cat':'home';_insW=null;
  _insView='entry';renderInsights();
}`],
  // the home screen: under the one-line intro, above the seven tiles
  [String.raw`  h+='<div class="ins-intro">'+_t('כשיש לך תובנה על החיים — תרשום אותה כאן.')+'</div>';
  h+='<div class="ins-grid">';`,
   String.raw`  h+='<div class="ins-intro">'+_t('כשיש לך תובנה על החיים — תרשום אותה כאן.')+'</div>';
  h+=insWideCard(null);
  h+='<div class="ins-grid">';`],
  // a category: under "back", above its topics
  [String.raw`  h+='<button class="ins-back" onclick="_insView=\'home\';renderInsights()">&#8249; '+_t('חזרה')+'</button>';
  for(var qi=0;qi<cat.questions.length;qi++){`,
   String.raw`  h+='<button class="ins-back" onclick="_insView=\'home\';renderInsights()">&#8249; '+_t('חזרה')+'</button>';
  h+=insWideCard(cat.id);
  for(var qi=0;qi<cat.questions.length;qi++){`],
  // inside a topic: no button any more (an answered question still shows above its answer)
  [String.raw`  if(dqs.length){
    if(_insDeepOpen&&_insDQ!=null&&dqs[_insDQ]){
      h+='<div class="ins-deep"><div class="ins-deep-h">'+_t('שאלה לעומק')+'</div>';
      h+='<div class="ins-deep-q">'+esc(dqs[_insDQ])+'</div><div class="ins-deep-b">';
      h+='<button class="ins-deep-o" onclick="insDeepNext()">&#8635; '+_t('שאלה אחרת')+'</button>';
      h+='<button class="ins-deep-a" onclick="_insView=\'entry\';renderInsights()">'+_t('לענות')+'</button>';
      h+='</div></div>';
    } else h+='<button class="ins-dig" onclick="insDeepNext()">'+INS_DIG_SVG+_t('חפור עמוק יותר')+'</button>';
  }
  for(var ei=entries.length-1;ei>=0;ei--){`, String.raw`  for(var ei=entries.length-1;ei>=0;ei--){`],
  // writing: "back" returns to where the question was asked
  [String.raw`  h+='<button class="ins-back" onclick="_insView=\'q\';renderInsights()">&#8249; '+esc(q)+'</button>';
  h+='<div class="ins-ask" style="--c:'+cat.color+'">'+(dq?`,
   String.raw`  h+='<button class="ins-back" onclick="_insView=_insFrom||\'q\';_insFrom=null;renderInsights()">&#8249; '+esc(_insFrom==='home'?_t('תובנות'):_insFrom==='cat'?cat.title:q)+'</button>';
  h+='<div class="ins-ask" style="--c:'+cat.color+'">'+(dq?`],
  // saving returns there too
  [String.raw`  showToast(''+_t('תובנה נשמרה')+' ✓');
  _insView='q';renderInsights();`,
   String.raw`  showToast(''+_t('תובנה נשמרה')+' ✓');
  _insView=_insFrom||'q';_insFrom=null;renderInsights();`],
];

let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  if (!from) { console.error('empty anchor - cannot reverse a pure deletion'); process.exit(1); }
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 200)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
