// node tools/patches/tour-targets.mjs [--reverse] [file]
// The area tours pointed at screens that have since changed: planning lost its week
// board and its three doors on 27 Oct (one switch, day or month), and סיום יום moved
// its moments into a sheet and its settings into two quiet links. A step whose element
// is missing is skipped in silence, so six steps had stopped being shown at all.
import fs from 'node:fs';
const REV = process.argv.includes('--reverse');
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
const P = [
[`    ['#plan-sec-week .pl-add',_t('ב־+ שומרים משימות בצד.'),_t('כותבים משימה ב־+, והיא מחכה בשורה. משם גוררים אותה ליום ולשעה.'),'add'],
    ['#plan-sec-week',_t('ולמחוק? מחליקים.'),_t('גוררים משימה לפח, או מחליקים אותה הצידה, והיא יורדת מהלוח. החלקה על הלוח עצמו מעבירה שבוע.'),'swipe'],
    ['#plan-sec-week',_t('משימה של כמה ימים? מותחים.'),_t('בלוח השבוע או החודש, תופסים את הנקודה הכתומה בקצה של משימה ומושכים אותה על פני כמה ימים. כך היא מופיעה על כולם.'),'stretch'],
    ['.pl-door',_t('חודש, שבוע ויום.'),_t('מה ששמים בחודש או בשבוע מגיע גם ליום שלו, ושם נותנים לו שעה. לחיצה על כל אחד פותחת או סוגרת את הלוח שלו.'),'flow'],`,
`    ['.dpk-bar',_t('ב־+ שומרים משימות בצד.'),_t('כותבים משימה ב־+, והיא מחכה בשורה. משם גוררים אותה ליום ולשעה.'),'add'],
    ['#plan-sec-day',_t('ולמחוק? מחליקים.'),_t('גוררים משימה לפח, או מחליקים אותה הצידה, והיא יורדת מהלוח. החלקה על הלוח עצמו מעבירה שבוע.'),'swipe'],
    ['.plv',_t('יום וחודש.'),_t('המתג למעלה עובר בין היום, עם השבוע מעליו, לבין החודש. מה ששמים בחודש מגיע גם ליום שלו, ושם נותנים לו שעה.'),'flow'],
    ['.plv',_t('משימה של כמה ימים? מותחים.'),_t('בחודש תופסים את הנקודה הכתומה בקצה של משימה ומושכים אותה על פני כמה ימים. כך היא מופיעה על כולם.'),'stretch'],`],
[`    ['#rfm-in',_t('דברים לזכור.'),_t('רגע קטן מהיום? רושמים כאן, והוא מחכה לסיכום של הערב.')],
    ['.rf-secs-b',_t('ומה נשאל.'),_t('בוחרים אילו שאלות יופיעו כל ערב, ומה ייכנס לסיכום.')]];`,
`    ['.rf-mem',_t('דברים לזכור.'),_t('רגע קטן מהיום? רושמים כאן, והוא מחכה לסיכום של הערב.')],
    ['.rf-quiet',_t('ומה נשאל.'),_t('בוחרים אילו שאלות יופיעו כל ערב, ומה ייכנס לסיכום.')]];`],
// the flow demo: month into day, as the switch now has it
[`  if(k==='flow')return '<div class="td-flow"><span>'+esc(_t('החודש'))+'</span><b></b><span>'+esc(_t('השבוע'))+'</span><b></b><span>'+esc(_t('היום'))+'</span></div>';`,
 `  if(k==='flow')return '<div class="td-flow"><span>'+esc(_t('החודש'))+'</span><b></b><span>'+esc(_t('היום'))+'</span></div>';`],
];
let s = fs.readFileSync(F, 'utf8');
const pairs = REV ? P.map(([a, b]) => [b, a]).reverse() : P;
for (const [a, b] of pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + 'x:\n' + a.slice(0, 160)); process.exit(1); }
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log((REV ? 'reversed ' : 'applied ') + pairs.length + ' pairs to ' + F);
