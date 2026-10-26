/* Hebrew's own plural forms for the progress counts (the HE table is how the
 * Hebrew build says "one record" rather than "1 records"). */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const a = `var HE={\n`;
if (s.split(a).length !== 2) { console.log('anchor'); process.exit(1); }
s = s.replace(a, a + `  '{n} שיאים חדשים בשבוע האחרון':{one:'שיא חדש אחד בשבוע האחרון',two:'שני שיאים חדשים בשבוע האחרון',other:'{n} שיאים חדשים בשבוע האחרון'},
  '{n} ימים מלאים השבוע':{one:'יום אחד מלא השבוע',two:'יומיים מלאים השבוע',other:'{n} ימים מלאים השבוע'},
  '{n} ימים קרוב ליעד השבוע':{one:'יום אחד קרוב ליעד השבוע',two:'יומיים קרוב ליעד השבוע',other:'{n} ימים קרוב ליעד השבוע'},
  '{n} משפטים שמורים':{one:'משפט שמור אחד',two:'שני משפטים שמורים',other:'{n} משפטים שמורים'},
`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
