/* A share of a dish is worked out in code (4 Nov). "We were three, I ate a
 * third of every plate": every item said "a third" and carried the whole
 * dish's figures - 2,590 kcal for about 1,060 - because the per-100 g path
 * never read the share. The arithmetic on its own, then the real /coach
 * handler with the model's reply faked.
 *
 *   node tools/test-coach-share.mjs [worker.js]
 */
import { pathToFileURL } from 'url';

const workerPath = process.argv[2] || new URL('../push-server/src/worker.js', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const W = await import(pathToFileURL(workerPath).href);
const worker = W.default;

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };

/* the four plates of 4 Nov, each given whole, with a third eaten */
const P = (kcal, p, c, f) => ({ kcal, protein: p, carbs: c, fat: f });
const PLATES = [
  { id: 'a', name: 'עוגת לבה', quantity: 'שליש מנה', grams_whole: 200, per_100g: P(325, 5, 38, 17), portion_fraction: 0.33, calories: 650, protein: 10, carbs: 76, fat: 34 },
  { id: 'b', name: 'דולמדס', quantity: 'שליש מנה', grams_whole: 300, per_100g: P(140, 3, 16, 7), portion_fraction: 0.33, calories: 420, protein: 9, carbs: 48, fat: 21 },
  { id: 'c', name: 'סטייק עם תפוחי אדמה', quantity: 'שליש מנה', grams_whole: 450, per_100g: P(255, 14, 15, 15), portion_fraction: 0.33, calories: 1150, protein: 63, carbs: 68, fat: 68 },
  { id: 'd', name: 'עוף עם אורז', quantity: 'שליש מנה', grams_whole: 500, per_100g: P(184, 11, 20, 6.5), portion_fraction: 0.33, calories: 920, protein: 55, carbs: 100, fat: 33 },
];
const T = W.coachTotals;
const sum = (a) => a.reduce((s, it) => s + T(it).calories, 0);
ok(Math.abs(sum(PLATES) - 1060) <= 25, 'a third of four plates comes to about 1,060 kcal - got ' + sum(PLATES));
ok(T(PLATES[2]).calories === Math.round(255 * 450 * 0.33 / 100), 'the steak: 450 g x 0.33 x 255/100 = ' + Math.round(255 * 450 * 0.33 / 100) + ' - got ' + T(PLATES[2]).calories);
ok(W.approxGrams(PLATES[2]) === 149 && W.coachWholeG(PLATES[2]) === 450, 'the steak shows ≈149 of ≈450 g - got ' + W.approxGrams(PLATES[2]) + ' of ' + W.coachWholeG(PLATES[2]));
ok(T({ grams_whole: 600, per_100g: P(266, 11, 33, 10), portion_fraction: 0.5 }).calories === 798, 'half a 600 g pizza at 266/100 g is 798');
ok(T({ grams_whole: 600, per_100g: P(266, 11, 33, 10) }).calories === 1596 && W.coachWholeG({ grams_whole: 600, per_100g: P(266, 11, 33, 10) }) === 0,
  'no share given: the whole, and no "of" shown');
/* the sushi of 3 Nov: pieces, twice */
ok(T({ unit_count: 9, kcal_per_unit: 45, protein_per_unit: 2, carbs_per_unit: 6, fat_per_unit: 1.5, portion_fraction: 2 }).calories === 810, 'nine pieces, twice: 810');
ok(T({ unit_count: 9, kcal_per_unit: 45, portions: 2 }).calories === 810, 'the older name, portions, still counts');
ok(T({ calories: 300, protein: 20, carbs: 30, fat: 10, portion_fraction: 0.5 }).calories === 150, 'figures given straight: halved too');
ok(T({ approx_g: 450, per_100g: P(255, 14, 15, 15), portion_fraction: 0.33 }).calories === 379, 'the older approx_g read as the whole when a share is given');

/* the share in words */
const M = W.coachShareMissed;
const whole = PLATES.map((x) => Object.assign({}, x, { portion_fraction: 1 }));
ok(M('אכלנו 3 אנשים, אכלתי שליש מכל צלחת', whole), '"שליש" with every item whole: sent back');
ok(!M('אכלנו 3 אנשים, אכלתי שליש מכל צלחת', PLATES), '"שליש" with the fractions given: stands');
ok(M('אכלתי חצי מהפיצה', [{ name: 'פיצה', grams_whole: 300, per_100g: P(266, 11, 33, 10) }]), '"חצי מהפיצה" whole: sent back');
ok(M('אכלתי פעמיים כזה', [{ name: 'סושי', unit_count: 9, kcal_per_unit: 45 }]), '"פעמיים" once: sent back');
ok(M('חלקנו את המגש', whole) && M('we shared a pizza', whole) && M('Ich habe die Hälfte gegessen', whole), 'חלקנו, shared, Hälfte');
ok(!M('אכלתי חציל ממולא', whole), 'חציל does not contain חצי');
ok(!M('אכלתי ארבע ביצים', whole), 'ארבע does not contain רבע');
ok(!M('אכלתי סלט', whole), 'no share word: nothing to check');
ok(!M('אכלתי חצי גביע קוטג', [{ name: "קוטג'", product_id: 'p1', approx_g: 125 }]), 'a saved product carries its own grams');

/* the handler */
const kv = new Map();
const env = { AI_KEY: 'x', SUBS: { get: async (k) => kv.get(k) ?? null, put: async (k, v) => { kv.set(k, v); } } };
let sent = [];
async function coach(body, replies) {
  sent = [];
  globalThis.fetch = async (url, init) => {
    if (String(url).includes('api.anthropic.com')) {
      sent.push(JSON.parse(init.body));
      const r = replies[Math.min(sent.length - 1, replies.length - 1)];
      return new Response(JSON.stringify({ content: [{ type: 'tool_use', id: 't' + sent.length, name: 'reply',
        input: Object.assign({ photo_count: '', date: '2026-11-04', message: 'נרשם' }, r) }] }), { status: 200 });
    }
    return new Response('', { status: 404 });
  };
  const req = new Request('https://w/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.assign({ day: '2026-11-04', lang: 'he', uid: 'test-' + Math.random(), now_ms: Date.now(), now_time: '21:30' }, body)) });
  return (await worker.fetch(req, env, { waitUntil: () => {} })).json();
}
const WHOLE = { action: 'add', items: whole, message: 'רשמתי. סה"כ 2,590 קק"ל' };
const THIRD = { action: 'add', items: PLATES, message: 'רשמתי שליש מכל צלחת' };
const FINAL = { action: 'add', items: PLATES, message: 'רשמתי שליש מכל צלחת - בערך 1,060 קק"ל' };

let j = await coach({ message: 'אכלנו 3 אנשים, אכלתי שליש מכל צלחת' }, [WHOLE, THIRD, FINAL]);
ok(sent.length === 3, 'whole plates are sent back, then the reply is written from the figures - calls: ' + sent.length);
ok(/portion_fraction 1/.test(JSON.stringify(sent[1].messages.at(-1))), 'the send-back names the share');
ok(/Together: 10\d\d kcal/.test(JSON.stringify(sent[2].messages.at(-1))), 'the figures sent for the message add to about 1,060');
const tot = j.items.reduce((s, x) => s + x.calories, 0);
ok(j.action === 'add' && j.items.length === 4 && Math.abs(tot - 1060) <= 25, 'four rows, about 1,060 kcal - got ' + tot);
ok(j.items[2].approx_g === 149 && j.items[2].whole_g === 450, 'the steak row carries ≈149 g of 450 g');
ok(j.message === FINAL.message, 'the message is the one written from the figures');
ok(sent[2].tool_choice.name === 'say' && sent[0].tool_choice.name === 'reply' && sent[1].tool_choice.name === 'reply',
  'the figures ask for the words alone (say); the share not given asks for the whole reply - got ' + sent.map((x) => x.tool_choice.name).join(','));
ok(sent.every((x) => x.tools.map((t) => t.name).join() === 'reply,say'), 'both tools on every call, so the cached prefix never changes');

j = await coach({ message: 'אכלתי סלט ירקות' }, [{ action: 'add', items: [{ id: 's', name: 'סלט', quantity: 'קערה', grams_whole: 250, per_100g: P(40, 1.5, 6, 1.2) }] }]);
ok(sent.length === 1 && j.items[0].calories === 100 && j.items[0].whole_g === 0, 'no share: one call, the whole, nothing extra');

/* seen, not said: the short route (say) only for an item the model itself marked as seen;
   one caught by its name - perhaps merged with food they did say - gets the whole reply */
const PIC = [{ mime: 'image/jpeg', data: 'A'.repeat(600) }];
const EGG = { id: 'e', name: 'ביצה', quantity: '1', grams_whole: 50, per_100g: P(140, 12.6, 1, 10), from_words: true };
j = await coach({ message: 'אכלתי ביצה', images: PIC }, [
  { action: 'add', not_in_words: ['לחמנייה'], items: [EGG, { id: 'r', name: 'לחמנייה', quantity: '1', grams_whole: 60, per_100g: P(270, 9, 50, 3), from_words: false }] },
  { message: 'רשמתי ביצה. רואה בתמונה גם לחמנייה, להוסיף?' }]);
ok(sent.length === 2 && sent[1].tool_choice.name === 'say', 'an item the model marked as seen: the words alone - ' + sent.map((x) => x.tool_choice.name).join(','));
ok(j.items.length === 1 && j.items[0].id === 'e' && /להוסיף/.test(j.message), 'the roll is not logged, the egg is, and the message asks');
j = await coach({ message: 'אכלתי ביצה וגבינה', images: PIC }, [
  { action: 'add', not_in_words: ['לחמנייה'], items: [{ id: 'm', name: 'לחמנייה עם ביצה וגבינה', quantity: '1', grams_whole: 160, per_100g: P(250, 12, 25, 11), from_words: true }] },
  { action: 'add', not_in_words: ['לחמנייה'], items: [EGG, { id: 'c', name: 'גבינה מגוררת', quantity: '20 ג', grams_whole: 20, per_100g: P(350, 25, 2, 27), from_words: true }], message: 'רשמתי ביצה וגבינה. רואה גם לחמנייה, להוסיף?' }]);
ok(sent.length === 2 && sent[1].tool_choice.name === 'reply', 'a merged item caught by its name: the whole reply, to split it - ' + sent.map((x) => x.tool_choice.name).join(','));
ok(j.items.map((x) => x.id).join() === 'e,c', 'the egg and the cheese kept, the roll asked about - got ' + j.items.map((x) => x.id).join());

/* cut off at max_tokens: four product photos met the ceiling on 4 Nov, and the half reply
   reached the app as "nothing to log" with an empty message - an empty bubble */
globalThis.fetch = async (url) => String(url).includes('api.anthropic.com')
  ? new Response(JSON.stringify({ stop_reason: 'max_tokens', content: [{ type: 'tool_use', id: 't1', name: 'reply', input: { photo_count: 'four packages: pastrami, ham, Leerdammer, Milram cottage' } }] }), { status: 200 })
  : new Response('', { status: 404 });
const cut = await worker.fetch(new Request('https://w/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ day: '2026-11-04', lang: 'he', uid: 'test-cut', message: 'פרוסת נקניק מכל נקניק ששלחתי לך' }) }), env, { waitUntil: () => {} });
ok(cut.status === 502 && /cut off/.test((await cut.json()).error || ''), 'a reply cut off at max_tokens is an error, not an empty "nothing to log" - status ' + cut.status);

if (fails.length) { console.log('\n' + fails.length + ' failed'); process.exit(1); }
console.log('\nall passed');
