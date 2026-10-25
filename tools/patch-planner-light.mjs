/* The planner, lighter (Asaf, 25 Oct: "I don't want it to feel heavy and
 * crowded, or the questions to feel endless... skip asking 'is there anything
 * else you'd like to add?' and give the options: work, travel, workout,
 * other and so on").
 * No more loop with a wait between every question. After the range and the
 * anchors, ONE card: what to add, as chips - choose any number at once.
 * Then ONE card per chosen thing, all three answers on it (how often, how
 * long, getting ready and there), each already set to a sensible default so
 * a single press of "continue" is enough; "2 of 3" says where the end is.
 * The waking hours once, only while unknown. All of it is local and instant;
 * the model is asked once, at the end, to build the week. */
import fs from 'fs';
const CRLF = (f, fn) => { let s = fs.readFileSync(f, 'utf8'); const CR = s.includes('\r\n'); if (CR) s = s.replace(/\r\n/g, '\n'); s = fn(s); if (CR) s = s.replace(/\n/g, '\r\n'); fs.writeFileSync(f, s); };
const mk = (s) => ({ s, rep(a, b) { const n = this.s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } this.s = this.s.replace(a, () => b); return this; } });

CRLF('dev/index.html', (s0) => {
  const m = mk(s0);
  m.rep(`function plAnchorsGo(){
  var kept=(_plAnch||[]).filter(function(a){return a.on;}).map(function(a){return a.label;});
  var el=document.getElementById('pl-anch-more'),more=el?String(el.value).trim():'';
  if(more)kept.push(more);
  var hz=planProfile().horizon||'';
  _plWarm=-1;_plAnch=null;
  planBotSend(kept.length?_t('טווח: {h}. העוגנים הקבועים, כמו שהם וכולל הדרך: {list}.',{h:hz,list:kept.join('; ')})
                         :_t('טווח: {h}. אין עוגנים קבועים.',{h:hz}));
}`, `var _plKept=[];
function plAnchorsGo(){
  _plKept=(_plAnch||[]).filter(function(a){return a.on;}).map(function(a){return a.label;});
  var el=document.getElementById('pl-anch-more'),more=el?String(el.value).trim():'';
  if(more)_plKept.push(more);
  _plAnch=null;_plWarm++;planBotPaint();
}
/* ── WHAT TO ADD: one card of chips, then one card per thing ── */
/* [kind, how often, how long, around] - the defaults each card opens on */
var PL_KINDS=[['workout',2,1,2],['meet',0,2,1],['study',1,2,1],['errands',0,1,1],['project',1,2,0],['rest',2,1,0],['other',0,1,0]];
function plKindLabel(k){
  return {workout:_t('אימון'),meet:_t('לפגוש מישהו'),study:_t('לימודים'),errands:_t('סידורים וקניות'),
    project:_t('פרויקט או משימה'),rest:_t('זמן לעצמי'),other:_t('משהו אחר')}[k]||k;
}
function plOften(){return [_t('פעם אחת'),_t('פעמיים'),_t('{n} פעמים',{n:3}),_t('כל יום')];}
function plLens(){return [_t('חצי שעה'),_t('שעה'),_t('שעתיים'),_t('חצי יום')];}
function plArounds(){return [_t('בבית, בלי נסיעה'),_t('רבע שעה לכל כיוון'),_t('חצי שעה לכל כיוון'),_t('שעה לכל כיוון')];}
var _plAdd=null,_plItems=[];
function plAddToggle(k){
  var i=_plAdd.indexOf(k);if(i>=0)_plAdd.splice(i,1);else _plAdd.push(k);planBotPaint();
}
function plAddGo(){
  var o=document.getElementById('pl-other'),other=o?String(o.value).trim():'';
  _plItems=_plAdd.map(function(k){var d=PL_KINDS.filter(function(x){return x[0]===k;})[0];
    return {k:k,name:k==='other'?(other||plKindLabel('other')):plKindLabel(k),often:d[1],len:d[2],around:d[3]};});
  _plCards=_plCards.slice(0,_plWarm+1).concat(_plItems.map(function(x,i){return 'item'+i;}));
  if(!planProfile().wake)_plCards.push('waking');
  _plWarm++;
  if(_plWarm>=_plCards.length){plWarmDone();return;}
  planBotPaint();
}
function plItemSet(i,f,v){_plItems[i][f]=v;planBotPaint();}
function plItemGo(){_plWarm++;if(_plWarm>=_plCards.length){plWarmDone();return;}planBotPaint();}
/* everything gathered, said once; the model builds from it */
function plWarmDone(){
  _plWarm=-1;
  var hz=planProfile().horizon||'',one=hz===_t('מחר|אפשרות');
  var add=_plItems.map(function(x){
    return x.name+' ('+(one?'':plOften()[x.often]+', ')+plLens()[x.len]+', '+plArounds()[x.around]+')';});
  var msg=_plKept.length?_t('טווח: {h}. העוגנים הקבועים, כמו שהם וכולל הדרך: {list}.',{h:hz,list:_plKept.join('; ')}):_t('טווח: {h}. אין עוגנים קבועים.',{h:hz});
  msg+=' '+(add.length?_t('להוסיף: {list}.',{list:add.join('; ')}):_t('אין מה להוסיף.'));
  _plItems=[];_plAdd=null;_plKept=[];
  planBotSend(msg);
}
function plChips(i,f,list,cur){
  var h='<div class="pl-grp">';
  for(var j=0;j<list.length;j++)h+='<button class="pl-c'+(j===cur?' on':'')+'" onclick="plItemSet('+i+',\\''+f+'\\','+j+')">'+esc(list[j])+'</button>';
  return h+'</div>';
}`);
  m.rep(`function plWarmCards(){return ['horizon','anchors'];}`, `function plWarmCards(){return ['horizon','anchors','add'];}`);
  m.rep(`  if(_plWarm>=_plCards.length){_plWarm=-1;planBotSend(planProfile().horizon||value);return;}`,
    `  if(_plWarm>=_plCards.length){plWarmDone();return;}`);
  m.rep(`  var kind=_plCards[_plWarm]||'horizon',st=kind==='anchors'?2:1;
  var h='<div class="pb-stage"><div class="pb-dots">';
  for(var i=1;i<=PLAN_STAGES;i++)h+='<span class="pb-dot'+(i===st?' on':(i<st?' done':''))+'"></span>';
  h+='</div><span class="pb-stage-t">'+(st===2?_t('העוגנים'):_t('המסגרת'))+'</span></div>';
  var rows=[],q='';`, `  var kind=_plCards[_plWarm]||'horizon',st=kind==='horizon'?1:kind==='anchors'?2:3;
  var h='<div class="pb-stage"><div class="pb-dots">';
  for(var i=1;i<=PLAN_STAGES;i++)h+='<span class="pb-dot'+(i===st?' on':(i<st?' done':''))+'"></span>';
  h+='</div><span class="pb-stage-t">'+(st===1?_t('המסגרת'):st===2?_t('העוגנים'):_t('מה עוד נכנס'))+'</span></div>';
  var rows=[],q='';
  if(kind==='add'){
    if(!_plAdd)_plAdd=[];
    h+='<div class="pb-q">'+_t('מה עוד להכניס?')+'</div><div class="pl-kinds">';
    PL_KINDS.forEach(function(x){
      h+='<button class="pb-ans pb-anch'+(_plAdd.indexOf(x[0])>=0?' on':'')+'" onclick="plAddToggle(\\''+x[0]+'\\')">'+esc(plKindLabel(x[0]))+'</button>';});
    h+='</div>';
    if(_plAdd.indexOf('other')>=0)h+='<input id="pl-other" class="pb-in" placeholder="'+esc(_t('מה זה?'))+'">';
    h+='<button class="pb-go" onclick="plAddGo()">'+(_plAdd.length?_t('המשך'):_t('אין מה להוסיף, לבנות'))+'</button>';
    return h;
  }
  if(/^item\\d+$/.test(kind)){
    var ii=+kind.slice(4),it=_plItems[ii],one=(planProfile().horizon||'')===_t('מחר|אפשרות');
    h+='<div class="pl-of">'+_t('{n} מתוך {total}',{n:ii+1,total:_plItems.length})+'</div><div class="pb-q">'+esc(it.name)+'</div>';
    if(!one)h+='<div class="pl-lbl">'+_t('כמה פעמים בשבוע')+'</div>'+plChips(ii,'often',plOften(),it.often);
    h+='<div class="pl-lbl">'+_t('כמה זמן')+'</div>'+plChips(ii,'len',plLens(),it.len);
    h+='<div class="pl-lbl">'+_t('התארגנות והגעה')+'</div>'+plChips(ii,'around',plArounds(),it.around);
    h+='<button class="pb-go" onclick="plItemGo()">'+_t('המשך')+'</button>';
    return h;
  }`);
  m.rep(`html body.mod-planning #pl-anch-more{width:100%;margin:12px 0;resize:none;font-family:inherit}`, `html body.mod-planning #pl-anch-more{width:100%;margin:12px 0;resize:none;font-family:inherit}
html body.mod-planning .pl-kinds{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
html body.mod-planning .pl-kinds .pb-ans{margin:0}
html body.mod-planning #pl-other{width:100%;margin:0 0 12px;font-family:inherit}
html body.mod-planning .pl-of{font-size:13px;font-weight:800;color:var(--nu-muted);margin-bottom:4px}
html body.mod-planning .pl-lbl{font-size:13.5px;font-weight:800;color:var(--nu-muted);margin:14px 2px 8px}
html body.mod-planning .pl-grp{display:flex;flex-wrap:wrap;gap:8px}
html body.mod-planning .pl-c{border:none;border-radius:999px;padding:9px 14px;font-family:inherit;font-size:14px;font-weight:700;color:var(--nu-muted);cursor:pointer;
  background:var(--nu-ground);box-shadow:-3px -3px 7px var(--nu-lit),4px 5px 10px var(--nu-shade-soft)}
html body.mod-planning .pl-c.on{color:var(--nu-ink);box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
html body.mod-planning .pb-go{margin-top:18px}`);
  return m.s;
});

CRLF('push-server/src/worker.js', (s0) => {
  const m = mk(s0);
  const a = s0.indexOf(`        'STAGE 3 - WHAT ELSE GOES IN. A loop`), b = s0.indexOf(`        'THEN BUILD IT, IN THREE PHASES:\\n' +`);
  if (a < 0 || b < 0) { console.log('worker anchors'); process.exit(1); }
  m.s = s0.slice(0, a) +
`        'STAGE 3 - WHAT ELSE GOES IN is collected by the app too. The first message lists each\\n' +
        '   thing to add with how often, how long, and the time around it (getting ready, travel\\n' +
        '   there and back). Take it as given: every one of them is FLOATING unless it names a day\\n' +
        '   or an hour, and where a floating thing lands is your call.\\n' +
        '   DO NOT ASK ANYTHING ELSE unless something essential is truly missing or contradictory -\\n' +
        '   and then at most ONE question. The person chose this to be quick. Go straight to the\\n' +
        '   weekly skeleton.\\n' +
        '\\n' +
` + s0.slice(b);
  return m.s;
});
console.log('ok');
