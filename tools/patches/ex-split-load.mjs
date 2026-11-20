// node tools/patches/ex-split-load.mjs <index.html> [--undo] - the app reads the split library (tools/split-exercises.mjs, 20 Nov):
//   data/exercises-core.json first - every exercise, its names in all eleven languages, the Hebrew steps - and then only the
//   reader's own data/exsteps/<lang>.json. 600 KB on the wire became about 90 KB for Hebrew and 125 KB for any other language,
//   which is what an LTE phone waits for before the generator can show a muscle.
//   - core missing or unreachable: the full data/exercises.json, which still carries every language, and exHow reads it as before
//   - steps on their way: exHow answers no steps rather than the Hebrew ones, and the screen is drawn again when they land
//   - steps unreachable: the English file, and failing that the Hebrew - never a blank card for good; asked again after 30 s
//   - a language change loads that language's steps (langOn), and redraws when they land
//   --undo restores the file byte for byte.
import fs from 'node:fs';
const F = process.argv[2], undo = process.argv.includes('--undo');
const E = [
  [`  fetch(liveBase()+'data/exercises.json').then(function(r){return r.json();}).then(function(j){
    _exDB=j;_exState='ready';`,
   `  /* the core, and the full file only if the core cannot be had (it carries every language's steps itself) */
  fetch(liveBase()+'data/exercises-core.json').then(function(r){if(!r.ok)throw new Error(r.status);return r.json();})
  .catch(function(){return fetch(liveBase()+'data/exercises.json').then(function(r){return r.json();});}).then(function(j){
    _exDB=j;_exState='ready';exStepsLoad();`],
  [`function exAll(){return (_exDB&&_exDB.exercises)||[];}`,
   `function exAll(){return (_exDB&&_exDB.exercises)||[];}
/* THE STEPS IN ONE LANGUAGE (20 Nov). _exSl[lang] is undefined until asked,
   false while on its way, null if it could not be had, else {id:{s,k[,l]}}. */
var _exSl={};
function exStepsLoad(l){
  l=l||appLang();
  if(l==='he'||_exSl[l]!==undefined||(_exDB&&exAll()[0]&&exAll()[0].sl))return;
  _exSl[l]=false;
  fetch(liveBase()+'data/exsteps/'+l+'.json').then(function(r){if(!r.ok)throw new Error(r.status);return r.json();})
  .then(function(m){_exSl[l]=m;},function(){_exSl[l]=null;setTimeout(function(){if(_exSl[l]===null)delete _exSl[l];},30000);})
  .then(function(){if(l===appLang()||l==='en')exStepsLanded();});
}
/* only what shows steps is drawn again - the exercise page and the how-it's-done
   sheet; the clock reads them on every tick. Not the whole screen: a search
   being typed must not be wiped by a file landing. */
function exStepsLanded(){
  if(_exDetail&&document.getElementById('ex-body')){try{_exPaintBody();}catch(e){}}
  if(_exHowOn){try{exHowPaint();}catch(e){}}
}
langOn(function(){if(_exState==='ready')exStepsLoad();});`],
  [`function exHow(e){
  var l=appLang(),src=e.sl&&(e.sl[l]||e.sl.en);
  if(l!=="he"&&src)return {s:src.s,k:src.k,lang:(e.sl[l]?l:"en")};
  return {s:e.s,k:e.k,lang:"he"};
}`,
   `function exHow(e){
  var l=appLang(),src=e.sl&&(e.sl[l]||e.sl.en),m;
  if(l!=="he"&&src)return {s:src.s,k:src.k,lang:(e.sl[l]?l:"en")};
  if(l==="he"||e.sl)return {s:e.s,k:e.k,lang:"he"};
  /* the split library: this language's file, then the English one */
  m=_exSl[l];
  if(m===undefined)exStepsLoad(l);
  if(m===undefined||m===false)return {s:[],k:[],lang:l};
  if(m===null){m=_exSl.en;if(m===undefined)exStepsLoad('en');if(m===undefined||m===false)return {s:[],k:[],lang:l};}
  src=m&&m[e.id];
  if(src)return {s:src.s,k:src.k,lang:src.l||(m===_exSl[l]?l:"en")};
  return {s:e.s,k:e.k,lang:"he"};
}`],
];
let s = fs.readFileSync(F, 'utf8');
for (const [o, n] of undo ? E.slice().reverse() : E) {
  const [a, b] = undo ? [n, o] : [o, n], c = s.split(a).length - 1;
  if (c !== 1) throw new Error(`${undo ? 'undo' : 'apply'}: expected 1 of ${JSON.stringify(a.slice(0, 60))}, found ${c}`);
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(undo ? 'undone' : 'applied');
