// node tools/patches/gen-wait.mjs <index.html> [--undo] - Asaf, 20 Nov, from his phone: "it won't let me tap anything" on the
//   one-tap workout's focus question - three chips, no muscles under them, and Continue refusing. The muscles come from the
//   exercise library (fitDeficit -> bandGroups -> exAll), which is fetched on demand, and the generator read it ONCE, when it
//   opened. Opened before the library landed - and since this morning the library is 2 MB, ten languages of steps - the list
//   was empty for good: "all / upper / lower" chose from nothing and Continue had no muscle to continue with.
//   Now (1) the library starts loading the moment כושר is entered, not when something first needs it; (2) the generator reads
//   the muscles whenever it has none yet, and redraws when the library lands; (3) while it has none it says it is loading
//   rather than showing chips that do nothing. --undo restores the file byte for byte.
import fs from 'node:fs';
const F = process.argv[2], undo = process.argv.includes('--undo');
const E = [
  [`  currentModule=mod;
  /* the frosted-glass nutrition screen hangs off this, and only off this */`,
   `  currentModule=mod;
  /* the exercise library is 2 MB: start it on the way in, so the first tap on
     anything that reads it does not arrive before it */
  if(mod==='fitness')exLoad();
  /* the frosted-glass nutrition screen hangs off this, and only off this */`],
  [`  var g=_gen,h='<div style="padding-bottom:24px">',ns=genSteps();`,
   `  var g=_gen,h='<div style="padding-bottom:24px">',ns=genSteps();
  /* the muscles come from the library; opened before it landed, read them now -
     or when it lands. Never hold on to an empty list. */
  if(!g.def.length){
    if(exAll().length)g.def=fitDeficit();
    else exLoad(function(){if(_gen&&!_gen.def.length&&exAll().length){_gen.def=fitDeficit();if(_fitView==='build')renderFitness();}});
  }`],
  [`  ['all','up','low'].forEach(function(k){
    h+='<button class="gn-e'+(genGroupOn(k)?' on':'')+'" onclick="genGroup(\\''+k+'\\')">'+`,
   `  if(!g.def.length)h+='<div class="gn-s">'+_t('טוען את המאגר…')+'</div>';
  else ['all','up','low'].forEach(function(k){
    h+='<button class="gn-e'+(genGroupOn(k)?' on':'')+'" onclick="genGroup(\\''+k+'\\')">'+`],
];
let s = fs.readFileSync(F, 'utf8');
for (const [o, n] of undo ? E.slice().reverse() : E) {
  const [a, b] = undo ? [n, o] : [o, n], c = s.split(a).length - 1;
  if (c !== 1) throw new Error(`${undo ? 'undo' : 'apply'}: expected 1 of ${JSON.stringify(a.slice(0, 60))}, found ${c}`);
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(undo ? 'undone' : 'applied');
