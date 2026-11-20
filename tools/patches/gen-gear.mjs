// node tools/patches/gen-gear.mjs <index.html> [--undo] - Asaf, 20 Nov, from his phone: "without equipment means physically only a
//   mat - no bar and no machines like you see there. And a handstand is too much." The one-tap workout for בלי ציוד had drawn an
//   inverted row (a bar), a Nordic curl (an anchor) and a handstand push-up. The library tags all three משקל גוף - the body is
//   the load - while each needs something to hold, hang from or brace against. So the places, not the tags, now decide those:
//   GEN_GEAR names the places where each one is possible, and where nothing is carried (no equipment, bands, home) the advanced
//   ones are left out as well. --undo restores the file byte for byte.
import fs from 'node:fs';
const F = process.argv[2], undo = process.argv.includes('--undo');
const E = [
  [`var GEN_EQUIP_ORDER=['gym','home','bands','park','none'];`,
   `/* WHAT THE TAG CANNOT SAY (20 Nov). These are tagged bodyweight because the
   body is the load, and each still needs something: parallel bars, a bar to
   hang under, a roman chair, an anchor for the heels, a wheel, a rope, a pool,
   a bench or a step. Where an exercise is possible is the place, so the
   places say it - an id missing from here goes wherever its tags allow. */
var GEN_GEAR={x22:['gym','park'],x55:['gym','park'],x65:['gym'],x156:['gym'],x194:['gym'],x264:['gym'],
  x219:['gym'],x224:[],x19:['gym','home','park'],x20:['gym','home','park'],x161:['gym','home','park']};   // i18n-exempt: place keys
/* where nothing is carried, nothing advanced either: a handstand is not what
   "no equipment" asks for (Asaf, 20 Nov) */
var GEN_BARE={none:1,bands:1,home:1};   // i18n-exempt: place keys
var GEN_EQUIP_ORDER=['gym','home','bands','park','none'];`],
  [`  var doable=function(e){
    var q=e.q||[];
    for(var z=0;z<q.length;z++)if(!have[q[z]])return false;
    return true;
  };`,
   `  /* the place these answers came from - every caller passes one of the
     GEN_EQUIP lists itself, so it is found by identity */
  var place='';for(k in GEN_EQUIP)if(GEN_EQUIP[k]===equip)place=k;
  var doable=function(e){
    var q=e.q||[];
    for(var z=0;z<q.length;z++)if(!have[q[z]])return false;
    if(place&&GEN_GEAR[e.id]&&GEN_GEAR[e.id].indexOf(place)<0)return false;
    if(GEN_BARE[place]&&e.lv==='מתקדם')return false;   // i18n-exempt: a level key from the library, compared
    return true;
  };`],
];
let s = fs.readFileSync(F, 'utf8');
for (const [o, n] of undo ? E.slice().reverse() : E) {
  const [a, b] = undo ? [n, o] : [o, n], c = s.split(a).length - 1;
  if (c !== 1) throw new Error(`${undo ? 'undo' : 'apply'}: expected 1 of ${JSON.stringify(a.slice(0, 60))}, found ${c}`);
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(undo ? 'undone' : 'applied');
