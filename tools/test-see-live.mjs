/* Does the LIVE /see hand back a front-of-pack claim, or swallow it?
 *
 *   node tools/test-see-live.mjs <image.jpg|png>
 *
 * The chain test proves the rule; this proves the DEPLOYMENT. They are not the
 * same thing and the difference is exactly what went wrong here: the app half
 * of the partial-label fix was released and the worker half was not, so a
 * packet reading 26 g of protein came back as a table row's 22.8 for a week
 * while every test in the repo was green.
 *
 * It sends a picture of a pack whose front states protein and fat and no
 * energy or carbohydrate line - the shape the old worker destroyed - and
 * prints what /see actually returned. A label object with p and no kcal is a
 * pass: that is the partial the overlay exists for.
 *
 * It spends one of the day's /see calls. No key is involved on this side; the
 * endpoint is the app's own worker and the model key never leaves it.
 *
 * GIVE IT A REAL PHOTOGRAPH. A rendered mock of a pack - a flat graphic with
 * crisp type, no lens, no lighting - came back {ok:false, why:"unreadable"}
 * twice, which is the worker's label for a model reply that would not parse
 * as JSON. Whatever that was, it is not a reading of a pack, so a synthetic
 * image cannot confirm or deny anything about this chain. Point it at an
 * actual photograph of an actual packet.
 */
import fs from 'fs';

const SERVER = process.env.SYNC_SERVER || 'https://nutrition-push.nutrition-push.workers.dev';
const file = process.argv[2];
if (!file) { console.log('usage: node tools/test-see-live.mjs <image>'); process.exit(2); }

const buf = fs.readFileSync(file);
const mime = /\.png$/i.test(file) ? 'image/png' : 'image/jpeg';
const image = buf.toString('base64');
console.log('  ' + file.split(/[\\/]/).pop() + '  ' + Math.round(buf.length / 1024) + ' KB  ' + mime + '\n');

const r = await fetch(SERVER + '/see', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image, mime, lang: 'he' }),
});
const j = await r.json();

if (!j || j.ok !== true) {
  console.log('  /see said no: ' + JSON.stringify(j));
  process.exit(1);
}

console.log('  dish       ' + j.dish);
console.log('  product    ' + (j.product || '(none)'));
console.log('  items      ' + j.items.map((i) => i.name + ' ' + i.grams + 'g').join(', '));
console.log('  confidence ' + j.confidence);
console.log('  note       ' + j.note);
console.log('  label      ' + JSON.stringify(j.label));
console.log('');

let bad = 0;
const check = (what, ok, detail) => { if (!ok) bad++; console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + what + (detail ? '   ' + detail : '')); };

const L = j.label;
check('a label came back at all                ', !!L, L ? '' : 'null - the worker is still dropping partials');
if (L) {
  check('it carries a basis                      ', !!L.basis, L.basis || '');
  check('it carries the protein that is printed  ', typeof L.p === 'number', L.p === undefined ? 'missing' : String(L.p));
  check('it does NOT invent an energy figure     ', L.kcal === undefined || L.kcal === null,
    L.kcal === undefined ? '(absent, as printed)' : 'kcal=' + L.kcal);
  check('it does NOT invent a carbohydrate line  ', L.c === undefined || L.c === null,
    L.c === undefined ? '(absent, as printed)' : 'c=' + L.c);
}

console.log(bad ? '\n' + bad + ' FAILED' : '\nthe live worker passes a partial label through');
process.exit(bad ? 1 : 0);
