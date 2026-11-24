// "איך אתה עכשיו" leaves the evening (Asaf, 24 Nov: less relevant, and it only adds weight). It is taken out of
// the bank, so it is never offered or asked again - an evening list that still names it skips it, as rfSteps
// already does for any id whose question is gone. Days that answered it keep their answer: the summary still
// reads endOfDayMood and now names it itself, since there is no card title left to borrow.
// usage: node tools/patches/rf-drop-now-mood.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`  /* moon rather than face: the board now carries two mood cards - the day as
     a whole and this minute - and two identical icons is two cards nobody can
     tell apart at a glance. */
  {id:'endOfDayMood',kind:'mood',t:''+_t('איך אתה עכשיו')+'',s:''+_t('ברגע הזה')+'',ic:'moon',g:'ter',q:''+_t('איך אתה מרגיש עכשיו, ברגע הזה?')+''},
  {id:'gratefulOverlooked',`, `  {id:'gratefulOverlooked',`],
  [`  if(id==='photo')return ''+_t('תמונת היום')+'';
  return '';`,
   `  if(id==='photo')return ''+_t('תמונת היום')+'';
  /* no longer asked (24 Nov), but the days that answered it still show it */
  if(id==='endOfDayMood')return ''+_t('איך אתה עכשיו')+'';
  return '';`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
