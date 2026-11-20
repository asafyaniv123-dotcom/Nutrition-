// node tools/patches/review-fixes.mjs <index.html> [--undo] - three things a second reading of 20 Nov's patches found:
//   1. the generator's focus question waited for the library forever when the fetch FAILED (no signal): exLoad answers a failure
//      by calling back with an empty library, and nothing drew again. It now says it could not load and offers to try again.
//   2. a guided step whose moment is past the start asks the loop to play there - and a phone in Low Power Mode refuses to play
//      by itself. The refusal was swallowed and the step's ring sat on frame one; now a refused play lands on the moment directly.
//   3. a reader who asked for less motion got the guided card's loop frozen with no way to start it (the plain demo it replaced
//      had controls). Where the card plays the loop whole, such a reader gets the controls back.
//   --undo restores the file byte for byte.
import fs from 'node:fs';
const F = process.argv[2], undo = process.argv.includes('--undo');
const E = [
  [`    else exLoad(function(){if(_gen&&!_gen.def.length&&exAll().length){_gen.def=fitDeficit();if(_fitView==='build')renderFitness();}});`,
   `    /* a failed fetch also calls back, with nothing: say so once, and wait for her to ask again */
    else if(!g.libFail)exLoad(function(){if(!_gen||_gen.def.length)return;if(exAll().length)_gen.def=fitDeficit();else _gen.libFail=1;if(_fitView==='build')renderFitness();});`],
  [`  if(!g.def.length)h+='<div class="gn-s">'+_t('טוען את המאגר…')+'</div>';`,
   `  if(!g.def.length)h+=g.libFail?'<div class="gn-s">'+_t('לא הצלחתי לטעון את המאגר. בדוק חיבור ונסה שוב.')+'</div>'+
      '<div class="gn-w"><button class="gn-e" onclick="_gen.libFail=0;renderFitness()">'+_t('נסה שוב')+'</button></div>'
    :'<div class="gn-s">'+_t('טוען את המאגר…')+'</div>';`],
  [`    sp.classList.add('off');v.loop=true;
    if(!still){var p=v.play();if(p&&p.catch)p.catch(function(){});}`,
   `    sp.classList.add('off');v.loop=true;
    if(!still){var p=v.play();if(p&&p.catch)p.catch(function(){});}
    else v.controls=true;`],
  [`    var q=v.play();if(q&&q.catch)q.catch(function(){});`,
   `    /* refused (Low Power Mode will not let a page play by itself): go straight to the moment */
    var q=v.play();if(q&&q.catch)q.catch(function(){if(v._xgStop===g[0]){v._xgStop=null;v.currentTime=g[0];}});`],
];
let s = fs.readFileSync(F, 'utf8');
for (const [o, n] of undo ? E.slice().reverse() : E) {
  const [a, b] = undo ? [n, o] : [o, n], c = s.split(a).length - 1;
  if (c !== 1) throw new Error(`${undo ? 'undo' : 'apply'}: expected 1 of ${JSON.stringify(a.slice(0, 60))}, found ${c}`);
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(undo ? 'undone' : 'applied');
