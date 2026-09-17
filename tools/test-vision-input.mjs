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
/* the stubbed answer, swappable per case */
let ANSWER = null;
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

/* a whole Gemini envelope around any answer object */
const wrap = (obj) => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(obj) }] } }] });

globalThis.fetch = async (url, opt) => {
  sent = { url: String(url), body: JSON.parse(opt.body) };
  const body = ANSWER ? wrap(ANSWER) : GEMINI_OK;
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
};

/* the shape the model answers in, with the items swapped per case */
const answerWith = (items) => ({
  product_name: 'ארוחה', brand: null, serving_size_analyzed: '100g',
  is_packaged_product: false, is_estimated: true, confidence: 'Medium',
  cooking_state: 'unspecified', meal_type: 'unspecified',
  package_g: null, package_is_guess: false, nutritional_values: null,
  items, visual_reasoning: 'stub',
});

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
console.log('the three rules reach the model');
sent = null; ANSWER = null;
await post({ images: [img(), img()], note: 'סקופ מהזאת', lang: 'he' });
const rules = (sent.body.contents[0].parts.find((p) => p.text) || {}).text || '';
ok(/RULE 1 - THE WORDS MAY POINT AT THE PICTURE/.test(rules), 'rule 1, visual anaphora');
ok(/מהזאת/.test(rules) && /scoop of THAT powder/.test(rules), 'with the referring words named, and the worked example');
ok(/RULE 2 - ONE BASE INGREDIENT, ONE ROW/.test(rules), 'rule 2, de-duplication');
ok(/RULE 3 - HOUSEHOLD MEASURES BECOME GRAMS/.test(rules), 'rule 3, household measures');
ok(/scoop of protein powder 30 g/.test(rules) && /peanut butter or tahini 16 g/.test(rules),
   'with a conversion table');
ok(/states its own serving/.test(rules), "and the pack's own serving outranks it");

console.log('');
console.log("each item's own panel survives the assembly");
ANSWER = answerWith([
  { name: 'גבינה צהובה', grams: 25, from_label: true,
    per_100g: { calories_kcal: 350, protein_g: 27.5, carbohydrates_g: 1.2, fat_g: 26 } },
  { name: 'לחם', grams: 30, from_label: false, per_100g: null },
]);
r = await post({ images: [img(), img()], note: 'טוסט', lang: 'he' });
j = await r.json();
const ch = (j.items || [])[0] || {};
ok(!!ch.per_100g, 'per_100g reaches the app at all - it used to be dropped here');
ok(ch.per_100g && ch.per_100g.protein_g === 27.5, 'with the packet\'s own protein (got ' + (ch.per_100g || {}).protein_g + ')');
ok(ch.from_label === true, 'and marked as read rather than estimated');
ok(((j.items || [])[1] || {}).per_100g === null, 'an item with no panel carries none');

console.log('');
console.log('one base ingredient, one row');
ANSWER = answerWith([
  { name: 'חלב', grams: 100, from_label: false, per_100g: null },
  { name: 'חלב טרה 3%', grams: 150, from_label: true,
    per_100g: { calories_kcal: 60, protein_g: 3.4, carbohydrates_g: 4.8, fat_g: 3 } },
  { name: 'גבינה צהובה', grams: 25, from_label: false, per_100g: null },
  { name: 'גבינה לבנה', grams: 40, from_label: false, per_100g: null },
]);
r = await post({ images: [img()], note: 'שייק', lang: 'he' });
j = await r.json();
const names = (j.items || []).map((x) => x.name);
ok(names.length === 3, 'the two milks became one row (got ' + names.length + ': ' + names.join(', ') + ')');
const milk = (j.items || []).find((x) => /חלב/.test(x.name)) || {};
ok(milk.name === 'חלב טרה 3%', 'the more specific name survives (got ' + milk.name + ')');
ok(milk.grams === 250, 'and the grams add up (got ' + milk.grams + ')');
ok(milk.from_label === true && !!milk.per_100g, 'a panel that was read beats one that was not');
ok(names.indexOf('גבינה צהובה') >= 0 && names.indexOf('גבינה לבנה') >= 0,
   'but yellow and white cheese are NOT merged - they are two foods, not one brand');

console.log('');
console.log('whey, a stated figure, and a small pour');
sent = null; ANSWER = null;
await post({ images: [img()], note: 'סקופ מהזאת עם קצת חלב (25 גרם חלבון)', lang: 'he' });
const r2 = (sent.body.contents[0].parts.find((p) => p.text) || {}).text || '';
ok(/RULE 4 - WHEY IS NOT SOY/.test(r2), 'rule 4, whey is not soy');
ok(/Defaulting an unmarked protein powder to soy/.test(r2), 'and says what going wrong costs');
ok(/RULE 5 - A FIGURE THE PERSON STATES IS BINDING/.test(r2), 'rule 5, a stated figure is binding');
ok(/not per\s*\n?\s*100 g/.test(r2) || /not per 100 g/.test(r2),
   'stated for the PORTION, not per 100 g');
ok(/[Dd]o NOT invent the rest/.test(r2), 'and the rest is not invented to look complete');
ok(/RULE 6 - A HEDGED QUANTITY IS A SMALL ONE/.test(r2), 'rule 6, "a little" is not a glass');
ok(/60 ml/.test(r2) && /240 ml/.test(r2), 'with the pour and the glass side by side');

ANSWER = answerWith([
  { name: 'אבקת חלבון מי גבינה (WHEY)', grams: 30, from_label: true,
    per_100g: { calories_kcal: 380, protein_g: 75, carbohydrates_g: 8, fat_g: 5 },
    stated_by_user: { calories_kcal: null, protein_g: 25, carbohydrates_g: null, fat_g: null } },
  { name: 'חלב', grams: 60, from_label: false, per_100g: null, stated_by_user: null },
]);
r = await post({ images: [img()], note: 'סקופ מהזאת עם קצת חלב (25 גרם חלבון)', lang: 'he' });
j = await r.json();
const scoop = (j.items || [])[0] || {};
ok(!!scoop.stated_by_user, 'what the person stated reaches the app');
ok(scoop.stated_by_user && scoop.stated_by_user.protein_g === 25, 'exactly as given (got ' + (scoop.stated_by_user || {}).protein_g + ')');
ok(scoop.stated_by_user && scoop.stated_by_user.calories_kcal === null,
   'and only the line they gave - the rest stays null for the tables to fill');
ok(!!scoop.per_100g, "the packet's own panel is kept alongside it, not replaced");

console.log('');
console.log('and a stated figure survives a merge');
ANSWER = answerWith([
  { name: 'חלבון', grams: 30, from_label: false, per_100g: null,
    stated_by_user: { calories_kcal: null, protein_g: 25, carbohydrates_g: null, fat_g: null } },
  { name: 'חלבון מי גבינה', grams: 0.0001, from_label: false, per_100g: null, stated_by_user: null },
]);
r = await post({ images: [img()], note: '25 גרם חלבון', lang: 'he' });
j = await r.json();
const one1 = (j.items || [])[0] || {};
ok((j.items || []).length === 1, 'the two rows merged (got ' + (j.items || []).length + ')');
ok(one1.stated_by_user && one1.stated_by_user.protein_g === 25,
   'and the stated figure came through the merge - no table can replace it');

console.log('');
if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); }
console.log('the worker takes several pictures as one meal, and one as one product');
