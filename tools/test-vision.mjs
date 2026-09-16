/* /vision against a real picture, live.
 *
 *   node tools/test-vision.mjs <image> ["note written alongside it"]
 *
 * What it is checking is not "did something come back" but the split the
 * endpoint exists to keep:
 *
 *   read it   -> numbers, and they are the packet's, not a table's average
 *   looked at -> no numbers at all, items and grams instead
 *
 * The second half is the one worth guarding. This project has already
 * measured what a model's numbers are worth when it is looking rather than
 * reading: a named tub of whey came back 35 kcal and 6 g of protein against
 * a true 114 and 15, and said confidence "high". So an answer that is
 * estimated AND carries nutrition figures is a FAILURE here, however
 * plausible the figures look.
 *
 * It spends one of the day's /vision calls. No key on this side.
 */
import fs from 'fs';

const SERVER = process.env.SYNC_SERVER || 'https://nutrition-push.nutrition-push.workers.dev';
const file = process.argv[2];
const note = process.argv[3] || '';
if (!file) { console.log('usage: node tools/test-vision.mjs <image> ["note"]'); process.exit(2); }

const buf = fs.readFileSync(file);
const mime = /\.png$/i.test(file) ? 'image/png' : 'image/jpeg';
/* deliberately sent WITH the data: prefix - stripping it is part of the
   contract and an untested contract is a hope */
const image = 'data:' + mime + ';base64,' + buf.toString('base64');

console.log('  ' + file.split(/[\\/]/).pop() + '  ' + Math.round(buf.length / 1024) + ' KB' +
  (note ? '  note: "' + note + '"' : '') + '\n');

const t0 = Date.now();
const r = await fetch(SERVER + '/vision', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image, lang: 'he', note }),
});
const j = await r.json();
const ms = Date.now() - t0;

if (!j || j.ok !== true) {
  console.log('  /vision said no (' + r.status + '): ' + JSON.stringify(j).slice(0, 400));
  process.exit(1);
}

console.log('  product     ' + j.product_name + (j.brand ? '   [' + j.brand + ']' : ''));
console.log('  serving     ' + j.serving);
console.log('  packaged    ' + j.packaged + '        estimated  ' + j.estimated);
console.log('  confidence  ' + j.confidence);
console.log('  values      ' + JSON.stringify(j.values));
console.log('  items       ' + (j.items.length ? j.items.map((i) => i.name + ' ' + i.grams + 'g').join(', ') : '(none)'));
console.log('  why         ' + j.why);
console.log('  model       ' + j.model + '   ' + ms + ' ms\n');

let bad = 0;
const check = (what, ok, detail) => { if (!ok) bad++; console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + what + (detail ? '   ' + detail : '')); };

check('the data: prefix was stripped, not rejected ', true, '(it answered at all)');
check('it named a product                          ', !!j.product_name, j.product_name || 'empty');

if (j.estimated) {
  check('an estimate states NO nutrition figures     ', j.values === null,
    j.values === null ? '(items only, tables supply the rest)' : JSON.stringify(j.values));
  check('an estimate says what is on the plate       ', j.items.length > 0, j.items.length + ' items');
} else {
  check('a reading carries numbers                   ', !!j.values, JSON.stringify(j.values));
  check('and says what text it read                  ', j.why.length > 8, j.why);
}

console.log(bad ? '\n' + bad + ' FAILED' : '\nthe split holds');
process.exit(bad ? 1 : 0);
