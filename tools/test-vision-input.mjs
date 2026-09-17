/* The worker's half of the multi-image path, without a key and without a deploy.
 *
 *   node tools/test-vision-input.mjs
 *
 * /vision cannot be tested end to end from here: the model call needs
 * GEMINI_KEY, and a key has no business in a test anyone can run. But
 * everything BEFORE that call is ours and is where the mistakes live - how
 * many pictures are accepted, what is refused and with which message, and
 * whether all of them actually reach the request or only the first.
 *
 * So the worker module is imported, handed a stub env and a stub global fetch,
 * and the OUTGOING call to the model is intercepted and inspected. That last
 * part is the one that matters: a version that validated four pictures
 * correctly and then sent only the first would pass every other check here and
 * be completely broken.
 *
 * No network. No key. No deploy.
 */
import worker from '../push-server/src/worker.js';

const PNG = 'A'.repeat(2000) + '==';           // legal base64, big enough to pass
const img = (mime) => 'data:' + (mime || 'image/jpeg') + ';base64,' + PNG;

const env = {
  GEMINI_KEY: 'test-only-not-a-key',
  SUBS: {
    _m: new Map(),
    async get(k) { return this._m.get(k) ?? null; },
    async put(k, v) { this._m.set(k, v); },
  },
};

let sent = null;
const GEMINI_OK = {
  candidates: [{ content: { parts: [{ text: JSON.stringify({
    product_name: 'טוסט גבינה', brand: null, serving_size_analyzed: '100g',
    is_packaged_product: false, is_estimated: true, confidence: 'Medium',
    cooking_state: 'unspecified', meal_type: 'unspecified',
    package_g: null, package_is_guess: false, nutritional_values: null,
    items: [
      { name: 'גבינה צהובה', grams: 25, from_label: true,
        per_100g: { calories_kcal: 350, protein_g: 27.5, carbohydrates_g: 1.2, fat_g: 26 } },
      { name: 'רסק עגבניות', grams: 15, from_label: true,
        per_100g: { calories_kcal: 82, protein_g: 4.3, carbohydrates_g: 18.9, fat_g: 0.5 } },
    ],
    visual_reasoning: 'stub',
  }) }] } }],
};

globalThis.fetch = async (url, opt) => {
  sent = { url: String(url), body: JSON.parse(opt.body) };
  return new Response(JSON.stringify(GEMINI_OK), { status: 200, headers: { 'content-type': 'application/json' } });
};

const post = (body) => worker.fetch(
  new Request('https://x/vision', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }), env, { waitUntil() {} },
);

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };

console.log('what is refused');
let r = await post({ images: [img(), img(), img(), img(), img()] });
let j = await r.json();
ok(r.status === 400 && /too many images/.test(j.error || ''), 'five pictures are refused, and it says so (' + j.error + ')');

r = await post({ images: [img(), img('image/gif')] });
j = await r.json();
ok(r.status === 400 && /picture 2/.test(j.error || ''),
   'a bad type names WHICH picture (' + j.error + ')');

r = await post({ images: [img(), 'data:image/jpeg;base64,' + 'A'.repeat(900002)] });
j = await r.json();
ok(r.status === 413, 'an oversized picture is refused (' + j.error + ')');

r = await post({ images: [img(), img(), img()].map(() => 'data:image/jpeg;base64,' + 'A'.repeat(700000)) });
j = await r.json();
ok(r.status === 413 && /together/.test(j.error || ''),
   'three legal pictures that are too much TOGETHER are refused (' + j.error + ')');

console.log('');
console.log('what reaches the model');
sent = null;
r = await post({ images: [img(), img()], note: 'עשיתי מזה טוסט', lang: 'he' });
j = await r.json();
ok(j.ok === true, 'two pictures are accepted');
const parts = sent && sent.body && sent.body.contents && sent.body.contents[0].parts || [];
const inline = parts.filter((p) => p.inlineData);
const text = (parts.find((p) => p.text) || {}).text || '';
ok(inline.length === 2, 'BOTH pictures reach the model, not just the first (got ' + inline.length + ')');
ok(parts.indexOf(parts.find((p) => p.text)) === parts.length - 1,
   'the question comes after the pictures, not before them');
ok(/THERE ARE 2 PICTURES/.test(text), 'the prompt says there are two and they are one meal');
ok(/per_100g/.test(text), 'and asks for each component\'s own panel');
ok(/עשיתי מזה טוסט/.test(text), 'the sentence is in the prompt');
ok(sent.body.generationConfig.maxOutputTokens > 3000,
   'the token budget grows with the pictures (' + sent.body.generationConfig.maxOutputTokens + ')');

console.log('');
console.log('one picture still behaves exactly as it did');
sent = null;
r = await post({ image: img(), note: '', lang: 'he' });
j = await r.json();
const parts1 = sent && sent.body.contents[0].parts || [];
const text1 = (parts1.find((p) => p.text) || {}).text || '';
ok(j.ok === true, 'the old `image` field still works');
ok(parts1.filter((p) => p.inlineData).length === 1, 'one picture goes in');
ok(!/THERE ARE 1 PICTURES/.test(text1) && !/THERE ARE/.test(text1),
   'and it is NOT asked the ingredients question');
ok(sent.body.generationConfig.maxOutputTokens === 3000, 'with the budget it always had');

console.log('');
if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); }
console.log('the worker takes several pictures as one meal, and one as one product');
