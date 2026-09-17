/* Several pictures of one meal, against the live /vision.
 *
 *   node tools/test-vision-multi.mjs                      # the two fixtures
 *   node tools/test-vision-multi.mjs a.jpg b.jpg "note"   # real photographs
 *
 * WHAT IT IS CHECKING is the thing the feature exists for: that a cheese and a
 * tomato paste photographed together, plus a sentence saying what was made
 * from them, come back as a LIST OF PORTIONS - and that each portion carries
 * the numbers read off ITS OWN packet rather than the average of its kind.
 *
 * Three ways this can fail that all look like success from a distance:
 *
 *   - it answers about ONE of the pictures and ignores the rest
 *   - it answers with the PACKAGE weight, 200 g of cheese for one slice,
 *     because a packet cannot say how much of it was used and the sentence can
 *   - it returns items with no per_100g at all, in which case the pictures
 *     bought nothing: the tables would have given the same answer from the
 *     words alone
 *
 * The default fixtures are RENDERED labels, not photographs: real OCR on real
 * Hebrew, but no glare, no angle, no curved tin, no thumb over the corner.
 * Pass real photographs to test those.
 *
 * It spends one of the day's /vision calls. No key on this side.
 */
import fs from 'fs';
import path from 'path';

const SERVER = process.env.SYNC_SERVER || 'https://nutrition-push.nutrition-push.workers.dev';
const F = 'tools/fixtures/';
let files = process.argv.slice(2).filter((a) => /\.(png|jpe?g|webp)$/i.test(a));
let note = process.argv.slice(2).find((a) => !/\.(png|jpe?g|webp)$/i.test(a)) || '';

if (!files.length) {
  files = [F + 'cheese-label.png', F + 'paste-label.png'];
  note = note || 'עשיתי מזה טוסט - פרוסה אחת של הגבינה הצהובה, בערך 25 גרם, ומרית רסק עגבניות, בערך 15 גרם, על פרוסת לחם';
}
for (const f of files) if (!fs.existsSync(f)) { console.log('no such file: ' + f); process.exit(2); }

const asDataUrl = (f) => {
  const mime = /\.png$/i.test(f) ? 'image/png' : /\.webp$/i.test(f) ? 'image/webp' : 'image/jpeg';
  return 'data:' + mime + ';base64,' + fs.readFileSync(f).toString('base64');
};

console.log(files.length + ' pictures: ' + files.map((f) => path.basename(f)).join(', '));
console.log('note: ' + note);
console.log('');

const res = await fetch(SERVER + '/vision', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ images: files.map(asDataUrl), note, lang: 'he' }),
});
const j = await res.json().catch(() => null);
if (!j) { console.log('FAIL: no JSON back (' + res.status + ')'); process.exit(1); }
if (!j.ok) {
  console.log('FAIL: ' + (j.error || 'not ok'));
  /* The old worker reads `image` and this sends only `images`, so it finds an
     empty string and says so. That exact message means the deploy has not
     happened - not that the pictures are wrong. */
  if (/not base64|too small/.test(String(j.error))) {
    console.log('');
    console.log('  That is what the PREVIOUS worker says when it is asked for several');
    console.log('  pictures: it only knows the `image` field. Deploy and run this again:');
    console.log('      cd push-server && npx wrangler deploy');
  }
  process.exit(1);
}

console.log('dish:  ' + j.product_name);
console.log('why:   ' + (j.why || j.visual_reasoning || ''));
console.log('items:');
for (const it of (j.items || [])) {
  const p = it.per_100g || {};
  console.log('  ' + String(it.grams).padStart(5) + ' g  ' + String(it.name).padEnd(22) +
    (it.from_label
      ? 'READ: ' + [p.calories_kcal + ' kcal', p.protein_g + 'p', p.carbohydrates_g + 'c', p.fat_g + 'f'].join('  ')
      : 'from the tables'));
}
console.log('');

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const items = j.items || [];
const labelled = items.filter((it) => it.from_label && it.per_100g);

ok(items.length >= 2, 'it answered with a list, not one product (got ' + items.length + ')');
ok(!j.values,
   'and no single set of values - there is no one packet here (got ' + JSON.stringify(j.values) + ')');
ok(labelled.length >= 2, 'at least two items carry numbers read off their own packet (got ' + labelled.length + ')');
ok(!items.some((it) => it.grams >= 150),
   'no item is logged at its PACKAGE weight - the sentence says how much was used');

/* the fixtures have known answers, so when they are the input, check them */
if (files[0].indexOf('cheese-label') >= 0) {
  const ch = items.find((it) => /גבינה|cheese/i.test(it.name));
  const pa = items.find((it) => /רסק|עגבנ|tomato|paste/i.test(it.name));
  ok(!!ch && !!pa, 'both products were identified');
  if (ch && ch.per_100g) ok(Math.abs((ch.per_100g.protein_g || 0) - 27.5) < 1.5,
    'the cheese protein is the packet\'s 27.5 (got ' + ch.per_100g.protein_g + ')');
  if (pa && pa.per_100g) ok(Math.abs((pa.per_100g.protein_g || 0) - 4.3) < 1.5,
    'the paste protein is the packet\'s 4.3 (got ' + pa.per_100g.protein_g + ')');
  if (ch) ok(ch.grams > 0 && ch.grams <= 60, 'the cheese is one slice, not the 200 g pack (got ' + ch.grams + ' g)');
}

console.log('');
if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); }
console.log('several pictures, one meal, each row from its own packet');
