/* Labels and disputes against the live /coach, with the two test labels made
 * by make-label.mjs (a 72 g bag: per 100 g 449 kcal / 28 g protein, per bag
 * 323 / 20; and the same with the per-100 g column only).
 * With ADMIN_KEY in the environment the run spends its own budget.
 *
 *   node tools/test-coach-labels-live.mjs <chips-two.jpg> <chips-100.jpg>
 */
import fs from 'node:fs';
const [TWO, ONE, HOST = 'https://nutrition-push.nutrition-push.workers.dev'] = process.argv.slice(2);
if (!TWO || !ONE) { console.log('usage: node tools/test-coach-labels-live.mjs <chips-two.jpg> <chips-100.jpg>'); process.exit(2); }
const img = (f) => ({ mime: 'image/jpeg', data: fs.readFileSync(f).toString('base64') });
const BASE = { day: '2026-10-24', lang: 'he', units: 'metric', gender: 'f', history: [], weights: [], logged: [],
  targets: { kcal: 1800, p: 120, c: 180, f: 60 }, left: { kcal: 1500, p: 100, c: 160, f: 50 } };
const post = async (o) => {
  const r = await fetch(HOST + '/coach', { method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, process.env.ADMIN_KEY ? { Authorization: 'Bearer ' + process.env.ADMIN_KEY } : {}),
    body: JSON.stringify(Object.assign({}, BASE, o)) });
  return r.json();
};
const fails = [];
const ok = (c, what, extra) => { console.log((c ? 'ok   ' : 'FAIL ') + what + (extra ? '\n        ' + extra : '')); if (!c) fails.push(what); };
const flat = (s) => String(s || '').replace(/\s+/g, ' ');
const LABEL = { per_100g: { kcal: 449, protein: 28, carbs: 44, fat: 18 }, per_package: { kcal: 323, protein: 20, carbs: 32, fat: 13 }, package_weight_g: 72, portion_fraction: 0.5 };

// 1. her case
let j = await post({ message: 'אכלתי חצי', images: [img(TWO)] });
let it = (j.items || [])[0] || {};
ok(j.action === 'add' && it.calories === 162 && it.protein === 10, 'the label, "I ate half": 162 kcal, 10 g protein', JSON.stringify(j.items && j.items.map((x) => [x.name, x.calories, x.protein])) + ' | ' + flat(j.message));
ok(!!(it.label && it.label.per_100g && it.label.per_package), 'the label data comes back with the item');

// 2. the item as it was wrongly logged, disputed: a separate reading, corrected
const WRONG = { id: 'lb1', name: 'Protein Maxx Chips', quantity: 'חצי שקית', calories: 225, protein: 10, carbs: 22, fat: 9, meal: 'snack', label: LABEL };
j = await post({ message: 'טעית בקלוריות', logged: [WRONG],
  history: [{ role: 'user', text: 'אכלתי חצי' }, { role: 'assistant', text: 'רשמתי חצי שקית: 225 קק"ל, 10 גרם חלבון.' }],
  dispute: { id: 'lb1', said: 'אכלתי חצי', label: LABEL, image: img(TWO) } });
it = (j.items || [])[0] || {};
ok(j.dispute && j.dispute.outcome === 'fixed' && j.action === 'update' && it.id === 'lb1' && it.calories === 162, 'disputed with the picture: re-read separately, corrected to 162', JSON.stringify(j.dispute) + ' | ' + flat(j.message));
ok(/צדקת|טעיתי|טעות שלי/.test(j.message) && !/בדקתי שוב.*נכון/.test(j.message), 'it says it was wrong, not "I checked, it is right"');

// 3. disputed with no picture and no label data: no defending
j = await post({ message: 'זה לא נכון, תבדוק שוב', logged: [{ id: 'x9', name: 'חטיף חלבון', quantity: '1', calories: 220, protein: 20, carbs: 20, fat: 8, meal: 'snack' }],
  dispute: { id: 'x9', said: 'אכלתי חטיף חלבון', label: null, image: null } });
ok(j.dispute && j.dispute.outcome === 'no_source' && j.action !== 'update', 'no source: nothing changes', JSON.stringify(j.dispute));
ok(!/בדקתי/.test(j.message) && /תווית|תמונה|המספר הנכון|צלם/.test(j.message), 'and it says it has no source, asks for the label - no "I checked"', flat(j.message));

// 4. per-100 g only, "I ate 30 grams"
j = await post({ message: 'אכלתי 30 גרם', images: [img(ONE)] });
it = (j.items || [])[0] || {};
ok(it.calories === 135 && Math.abs(it.protein - 8.4) < 0.2, 'per 100 g only, 30 g: 135 kcal, 8.4 g protein', JSON.stringify(j.items && j.items.map((x) => [x.name, x.calories, x.protein])) + ' | ' + flat(j.message));

// 5. disputed when it was right: explained, not changed
j = await post({ message: 'טעית, זה לא יכול להיות', logged: [Object.assign({}, WRONG, { calories: 162 })],
  dispute: { id: 'lb1', said: 'אכלתי חצי', label: LABEL, image: img(TWO) } });
ok(j.dispute && j.dispute.outcome === 'confirmed' && j.action !== 'update', 'right all along: it stands', JSON.stringify(j.dispute));
ok(/שקית|עמודה|72|0\.5|חצי/.test(j.message), 'and it explains where the number comes from', flat(j.message));

// 6. short and to the point: no working, no thinking aloud (Asaf: "don't let them drag on")
const brief = (m) => !/[×≈=]|\d\s*[x*]\s*\d|רגע|בואי נדייק|בוא נדייק|בעצם/.test(m) && flat(m).length <= 260;
j = await post({ message: 'אכלתי חצי', images: [img(TWO)] });
ok(brief(j.message), 'logging from a label: short, no arithmetic, no second thoughts', flat(j.message).length + ' chars | ' + flat(j.message));
j = await post({ message: 'טעית, זה לא יכול להיות', logged: [Object.assign({}, WRONG, { calories: 162 })],
  dispute: { id: 'lb1', said: 'אכלתי חצי', label: LABEL, image: img(TWO) } });
ok(brief(j.message), 'a dispute that stands: one short line', flat(j.message).length + ' chars | ' + flat(j.message));

console.log('\n' + (fails.length ? fails.length + ' FAILED' : 'all right'));
process.exit(fails.length ? 1 : 0);
