/* The "new workout" sheet, shorter (flow map point 4, approved 28 Nov). It offered six ways in, and
 * two of them - "write a plan myself", "build me a plan" - were planning, not a workout. Planning
 * lives in "my programs" (its "+ new program" offers both), so the sheet keeps: a session already
 * done, from my programs, an empty workout, a workout in a click. And "from my programs" no longer
 * says "today: Pilates" under it on a Pilates day - only a strength day is a programme's to name.
 * Run: node tools/patches/fit-sheet3.mjs [file] [--reverse]
 */
import fs from 'node:fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  [String.raw`  /* and the two ways to plan ahead, the same as "+ new program" */
  h+='</div><div class="fss-g">'+esc(_t('לתכנן מראש'))+'</div><div class="fss-l">';
  h+='<button onclick="fitSheetClose();startFitEdit(-1)"><b>'+esc(_t('כתוב תוכנית בעצמי'))+'</b><span>'+esc(_t('אימון אחד, או כמה ימים'))+'</span></button>'+
     '<button onclick="fitSheetClose();fitWOpen(1)"><b>'+esc(_t('בנה לי תוכנית'))+'</b><span>'+esc(_t('האפליקציה בונה אותה בשבילך'))+'</span></button>';
  h+='</div><button class="cf-no"`,
   String.raw`  /* planning ahead is not a workout: it lives in "my programs", under "+ new program" (28 Nov) */
  h+='</div><button class="cf-no"`],
  [String.raw`     (tp?esc(_t('היום לפי הלוז: {name}',{name:fitPlanName(tp)})):(tpls.length?`,
   String.raw`     (tp&&tp.type==='strength'?esc(_t('היום לפי הלוז: {name}',{name:fitPlanName(tp)})):(tpls.length?`],
];

let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 200)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
