/* Her own products, and grams times per 100 g - through the real /coach
 * handler, with only the model's reply faked (3 Nov).
 *
 * The cases are the breakfast Asaf logged: cottage Milram written down as
 * 40 g = 65 kcal and 8 g protein when its label says 95 kcal and 12 g per
 * 100 g, and surimi as 36 g = 60 kcal. A weight and a calorie figure the
 * model wrote independently; the code now multiplies, so they cannot drift.
 * The app half - what is kept from a label - is LIFTED from dev/index.html.
 *
 *   node tools/test-coach-products.mjs [worker.js] [index.html]
 */
import fs from 'fs';
import vm from 'vm';
import { pathToFileURL } from 'url';

const workerPath = process.argv[2] || new URL('../push-server/src/worker.js', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const appPath = process.argv[3] || new URL('../dev/index.html', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const worker = (await import(pathToFileURL(workerPath).href)).default;

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };

const kv = new Map();
const env = { AI_KEY: 'x', SUBS: { get: async (k) => kv.get(k) ?? null, put: async (k, v) => { kv.set(k, v); } } };
let sent = [];
async function coach(body, items, extra = {}) {
  sent = [];
  globalThis.fetch = async (url, init) => {
    if (String(url).includes('api.anthropic.com')) {
      sent.push(JSON.parse(init.body));
      return new Response(JSON.stringify({ content: [{ type: 'tool_use', id: 't1', name: 'reply',
        input: Object.assign({ photo_count: '', action: 'add', date: '2026-11-03', items, message: 'נרשם' }, extra) }] }), { status: 200 });
    }
    return new Response('', { status: 404 });
  };
  const req = new Request('https://w/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.assign({ day: '2026-11-03', lang: 'he', message: 'אכלתי', uid: 'test-' + Math.random() }, body)) });
  return (await worker.fetch(req, env, { waitUntil: () => {} })).json();
}

const MILRAM = { id: 'p1', name: "קוטג' 5%", brand: 'Milram', per_100g: { kcal: 95, protein: 12, carbs: 2, fat: 5 }, package_g: 250, unit_g: 0 };

/* 1. the saved product, by id: her figures, the model's grams */
let j = await coach({ message: "2 כפות קוטג' Milram", products: [MILRAM] },
  [{ id: 'a', name: "קוטג' Milram", quantity: '2 כפות', calories: 65, protein: 8, carbs: 1, fat: 2, approx_g: 40, product_id: 'p1' }]);
let it = j.items && j.items[0];
ok(it && it.calories === 38, "2 tbsp cottage Milram from her product: 38 kcal (was 65) - got " + (it && it.calories));
ok(it && it.protein === 4.8, 'and 4.8 g protein (was 8) - got ' + (it && it.protein));
ok(it && it.approx_g === 40, 'still about 40 g');
ok(it && it.label && it.label.per_100g.kcal === 95, 'the label kept on the row is her product');
ok(it && it.product_id === 'p1' && it.brand === 'Milram', 'the row says which product it was');
const st = sent[0] && sent[0].messages.at(-1).content.at(-1).text;
ok(st && st.includes('THEIR PRODUCTS') && st.includes('Milram'), 'the products reach the model in the state');

/* 2. surimi, no label: per 100 g and grams, multiplied here */
j = await coach({ message: 'סורימי' },
  [{ id: 'b', name: 'סורימי', quantity: '2 מקלות', calories: 60, protein: 6, carbs: 5, fat: 1, approx_g: 36, per_100g: { kcal: 100, protein: 8, carbs: 15, fat: 1 } }]);
it = j.items && j.items[0];
ok(it && it.calories === 36 && it.protein === 2.9, 'surimi 36 g: 36 kcal, 2.9 g protein (was 60, 6) - got ' + (it && it.calories + ', ' + it.protein));

/* 3. a label read with per 100 g and no portion: the grams are the portion */
j = await coach({ message: 'קוטג' },
  [{ id: 'c', name: "קוטג' Milram", quantity: '2 כפות', calories: 65, protein: 8, carbs: 1, fat: 2, approx_g: 40, brand: 'Milram',
     label: { per_100g: { kcal: 95, protein: 12, carbs: 2, fat: 5 }, package_weight_g: 250 } }]);
it = j.items && j.items[0];
ok(it && it.calories === 38 && it.label.portion_g === 40, 'a label with no portion takes approx_g: 38 kcal - got ' + (it && it.calories));

/* 4. an id that is not hers is dropped, and the item stands as given */
j = await coach({ products: [MILRAM] },
  [{ id: 'd', name: 'יוגורט', quantity: '1', calories: 120, protein: 10, carbs: 12, fat: 3, approx_g: 150, product_id: 'zz' }]);
it = j.items && j.items[0];
ok(it && it.product_id === '' && it.calories === 120 && !it.label, 'an unknown product id is ignored');

/* 5. pieces keep their own path; per 100 g does not override them */
j = await coach({}, [{ id: 'e', name: 'ביצה', quantity: '2', calories: 140, protein: 12.6, carbs: 1, fat: 10, approx_g: 100,
  unit_count: 2, kcal_per_unit: 70, protein_per_unit: 6.3, carbs_per_unit: 0.5, fat_per_unit: 5, per_100g: { kcal: 155, protein: 13, carbs: 1, fat: 11 } }]);
it = j.items && j.items[0];
ok(it && it.calories === 140, 'two eggs still counted by the piece: 140 kcal - got ' + (it && it.calories));

/* 6. the prompt asks about what is in the photo and not in the words */
const sys0 = sent[0] && sent[0].system;
const sys = Array.isArray(sys0) ? sys0.map((x) => x.text).join('') : sys0;
ok(Array.isArray(sys0) && sys0.at(-1).cache_control && sys0.at(-1).cache_control.type === 'ephemeral', 'the instructions are marked for the cache');
ok(!/2026-11-03|"id":"p1"/.test(sys), 'nothing that changes per turn (the day, her products) is inside the cached instructions');
ok(sys && sys.includes('Compare the photo with their words') && sys.includes('Do NOT log that food until they confirm'), 'the prompt asks about unmentioned food in the photo');
ok(sys && sys.includes('## Their own products'), 'the prompt explains her products');
ok(sent.length === 1, 'none of these was sent back for macros - one call each');

/* 7. the app: what is kept from a reply */
const src = fs.readFileSync(appPath, 'utf8');
const a = src.indexOf('var MYPROD_KEY'), z = src.indexOf('function coachApply(j,onDate)');
const store = {};
const ctx = { localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } }, Date, Math, JSON, String };
vm.createContext(ctx);
vm.runInContext(src.slice(a, z), ctx);
ctx.myProdLearn([{ name: "קוטג' Milram", brand: 'Milram', label: { per_100g: { kcal: 95, protein: 12, carbs: 2, fat: 5 }, package_weight_g: 250, unit_weight_g: 0 } },
  { name: 'סורימי', calories: 36 }]);
let P = ctx.myProdForCoach();
ok(P.length === 1 && P[0].per_100g.kcal === 95 && P[0].brand === 'Milram' && P[0].package_g === 250, 'a label item is kept; an item without one is not');
ctx.myProdLearn([{ name: 'חטיף', brand: 'X', label: { per_package: { kcal: 200, protein: 10, carbs: 20, fat: 8 }, package_weight_g: 50 } }]);
P = ctx.myProdForCoach();
ok(P.length === 2 && P[0].name === 'חטיף' && P[0].per_100g.kcal === 400 && P[0].per_100g.protein === 20, 'only a package column: per 100 g from the package weight');
ctx.myProdLearn([{ name: "קוטג' Milram", brand: 'Milram', label: { per_100g: { kcal: 95, protein: 12, carbs: 2, fat: 5 } } }]);
P = ctx.myProdForCoach();
ok(P.length === 2 && P[0].brand === 'Milram' && P[0].package_g === 250, 'the same product again is one entry, moved to the front, its package weight kept');
const id = P[0].id;
ctx.myProdLearn([{ name: 'שם אחר', product_id: id, label: { per_100g: { kcal: 1, protein: 1, carbs: 1, fat: 1 } } }]);
P = ctx.myProdForCoach();
ok(P.length === 2 && P[0].id === id && P[0].per_100g.kcal === 95, 'an answer FROM a saved product never rewrites it');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('a product she sent once is read from her list, and grams decide the calories');
