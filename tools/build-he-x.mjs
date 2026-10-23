/* data/he-x.json - Hebrew in the PLURAL (אתם), Asaf's answer for "other"
 * (23 Oct 2026). An overlay on HE like he-f.json: only the strings whose
 * Hebrew changes. Six agents wrote .impeccable/plural/out-1..6.json from the
 * template, one slice each; the seven counted keys they set aside are written
 * here by hand, as category objects like he-f's.
 *
 * Like he-f.json this is a HAND-MADE file once written: re-running this
 * script overwrites it from the agents' output, so later corrections belong
 * in data/he-x.json itself, not here. */
import fs from 'fs';
const out = {};
for (let i = 1; i <= 6; i++) Object.assign(out, JSON.parse(fs.readFileSync(`.impeccable/plural/out-${i}.json`, 'utf8')));
Object.assign(out, {
  'התאמנת איתו {n} פעמים': { one: 'התאמנתם איתו פעם אחת', two: 'התאמנתם איתו פעמיים', other: 'התאמנתם איתו {n} פעמים' },
  '{n} ימים שסיכמת': { one: 'יום אחד שסיכמתם', two: 'יומיים שסיכמתם', other: '{n} ימים שסיכמתם' },
  'ימים שסיכמת': { one: 'יום שסיכמתם', two: 'ימים שסיכמתם', other: 'ימים שסיכמתם' },
  'התאמנת {n} פעמים בחמישה השבועות האחרונים.': { one: 'התאמנתם פעם אחת בחמישה השבועות האחרונים.', two: 'התאמנתם פעמיים בחמישה השבועות האחרונים.', other: 'התאמנתם {n} פעמים בחמישה השבועות האחרונים.' },
  '{ex}: {n} חזרות. הטווח למטרה שבחרת הוא {lo} עד {hi}.': { one: '{ex}: חזרה אחת. הטווח למטרה שבחרתם הוא {lo} עד {hi}.', two: '{ex}: שתי חזרות. הטווח למטרה שבחרתם הוא {lo} עד {hi}.', other: '{ex}: {n} חזרות. הטווח למטרה שבחרתם הוא {lo} עד {hi}.' },
  'הצג {n} תרגילים': { one: 'הציגו תרגיל אחד', two: 'הציגו שני תרגילים', other: 'הציגו {n} תרגילים' },
  '{n} ימים שכתבת בהם': { one: 'יום אחד שכתבתם בו', two: 'יומיים שכתבתם בהם', other: '{n} ימים שכתבתם בהם' },
});
/* every key must be one the app asks for, and keep every {hole} */
const tpl = JSON.parse(fs.readFileSync('data/lang/_template.json', 'utf8'));
const holes = (x) => (String(x).match(/\{[a-z]+\}/gi) || []).sort().join(',');
let bad = 0;
for (const [k, v] of Object.entries(out)) {
  if (!(k in tpl)) { console.log('NOT A KEY', k); bad++; continue; }
  const vs = typeof v === 'object' ? Object.values(v) : [v];
  const kh = holes(k);
  for (const x of vs) if (!/\{n\}/.test(k) || typeof v !== 'object' ? holes(x) !== kh : holes(x).replace('{n},', '').replace('{n}', '') !== kh.replace('{n},', '').replace('{n}', '')) {
    if (holes(x) !== kh && !(typeof v === 'object' && kh.includes('{n}'))) { console.log('HOLES DIFFER', k, '->', x); bad++; }
  }
}
if (bad) { console.log(bad, 'problems'); process.exit(1); }
const sorted = {}; Object.keys(out).sort().forEach((k) => { sorted[k] = out[k]; });
fs.writeFileSync('data/he-x.json', JSON.stringify(sorted, null, 2) + '\n');
console.log(Object.keys(sorted).length, 'entries -> data/he-x.json');
