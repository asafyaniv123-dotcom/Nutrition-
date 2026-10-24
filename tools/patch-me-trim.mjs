/* The Me screen, trimmed (Asaf, 24 Oct):
 *  - "N days summarised out of 14" goes - Beem's halo of days already says it;
 *  - the sounds switch moves to settings, beside the other settings;
 *  - the small summaries go: the range switch, the day score, steps,
 *    calories, where the time goes, and what the data shows.
 * The functions that drew them stay in the file (meCard, meLine, meTimeSplit,
 * meInsights): unreferenced is not the same as dead, and the weekly deck
 * and other screens may draw on them. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

const i0 = s.indexOf(`  // the one number worth leading with${EOL}  h+='<div class="me-hero">`);
const i1 = s.indexOf(`  h+='<div id="home-book" class="me-slot"></div>';`, i0);
if (i0 < 0 || i1 < 0) { console.log('no Me block'); process.exit(1); }
s = s.slice(0, i0) + `  /* Language and sounds live behind the gear in the drawer: they are chosen
     once, and this screen is for what you come back to. The day count and
     the small charts left on 24 Oct - Beem's halo already counts the days. */
  h+='<div id="home-cal" class="me-slot"></div>';
  h+='<div id="home-vision" class="me-slot"></div>';
`.replace(/\n/g, EOL) + s.slice(i1);

/* renderMe no longer needs the rows it computed for the charts */
rep(`function renderMe(){
  var rows=meDayList(_meRange),i,r;
  var done=rows.filter(function(x){return x.sum&&x.sum.done;}).length;
  var h='<div class="me-wrap">';`, `function renderMe(){
  var h='<div class="me-wrap">';`);

/* sounds, in settings */
rep(`  h+='<div id="set-backup"></div>';`, `  /* sounds - moved here from the Me screen (24 Oct) */
  h+='<div class="set-sec"><div class="set-t">'+_t('צלילים')+'</div>'+
     '<div class="set-s">'+_t('צליל פתיחה והתראות בתוך האפליקציה')+'</div></div>';
  h+='<div class="set-langs"><button class="set-lang'+(sndOn()?' on':'')+'" onclick="sndToggle()">'+_t('מופעל')+'</button>'+
     '<button class="set-lang'+(sndOn()?'':' on')+'" onclick="sndToggle()">'+_t('מושתק')+'</button></div>';
  h+='<div id="set-backup"></div>';`);
rep(`function sndToggle(){
  sndSet(!sndOn());
  if(sndOn())sndPlay(SND_OPEN,0.5);
  renderMe();
}`, `function sndToggle(){
  sndSet(!sndOn());
  if(sndOn())sndPlay(SND_OPEN,0.5);
  if(document.getElementById('set-backup'))renderSettings();
  else renderMe();
}`);
fs.writeFileSync(F, s);
console.log('patched');
