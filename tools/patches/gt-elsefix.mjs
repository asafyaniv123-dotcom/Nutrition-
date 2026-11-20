// node tools/patches/gt-elsefix.mjs <index.html> [--undo] - a bug gt-patch.mjs shipped to dev (20 Nov): the "on the clock" button
//   was inserted between "if there are steps, the how-it's-done door" and its "else: not written yet", so the else became the
//   clock button's - and every stretch (no clock button) said its explanation was not written, right under the door to it.
//   The button now follows the if/else it had split. --undo restores the file byte for byte.
import fs from 'node:fs';
const F = process.argv[2], undo = process.argv.includes('--undo');
const A = `  if(how.s&&how.s.length)h+=exHowBoxHTML('exDetailHow()');
  /* and beside it, the same exercise on the clock - as a stretch has its hold */
  if(!e.st&&exHasDemo(e))h+='<button class="tm-go xd-hold" onclick="gtOne(\\''+e.id+'\\')">'+_t('תרגול על זמן')+'</button>';
  else h+='<div class="xd-none small">'+_t('ההסבר לתרגיל הזה עוד לא נכתב.')+'</div>';
`;
const B = `  if(how.s&&how.s.length)h+=exHowBoxHTML('exDetailHow()');
  else h+='<div class="xd-none small">'+_t('ההסבר לתרגיל הזה עוד לא נכתב.')+'</div>';
  /* and beside it, the same exercise on the clock - as a stretch has its hold */
  if(!e.st&&exHasDemo(e))h+='<button class="tm-go xd-hold" onclick="gtOne(\\''+e.id+'\\')">'+_t('תרגול על זמן')+'</button>';
`;
const [a, b] = undo ? [B, A] : [A, B];
let s = fs.readFileSync(F, 'utf8');
const c = s.split(a).length - 1;
if (c !== 1) throw new Error(`expected the block once, found ${c}`);
fs.writeFileSync(F, s.replace(a, () => b));
console.log(undo ? 'undone' : 'applied');
