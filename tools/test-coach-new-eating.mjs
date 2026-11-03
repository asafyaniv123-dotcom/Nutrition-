/* A new eating is not a correction (3 Nov). Two surimi sticks at breakfast,
 * "אכלתי סורימי 1" at lunch: the coach answered "updated to 3" and rewrote
 * the breakfast row, then a fourth. Through the real /coach handler with the
 * model's reply faked, and the rule on its own.
 *
 *   node tools/test-coach-new-eating.mjs [worker.js]
 */
import { pathToFileURL } from 'url';

const workerPath = process.argv[2] || new URL('../push-server/src/worker.js', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const W = await import(pathToFileURL(workerPath).href);
const worker = W.default;

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };

const NOW = Date.parse('2026-11-03T13:30:00+02:00');
const MORNING = { id: 'sm', name: 'סורימי', quantity: '2 מקלות', calories: 34, protein: 3, carbs: 5, fat: 0.4, time: '08:10', at: NOW - 5.3 * 3600e3 };
const RECENT = { id: 'eg', name: 'ביצה', quantity: '2 ביצים', calories: 140, protein: 12.6, carbs: 1, fat: 10, time: '13:28', at: NOW - 2 * 60e3 };

/* the rule */
const S = W.coachStaleUpdates;
if (!S) { console.log('  FAIL coachStaleUpdates is not exported'); process.exit(1); }
ok(S([{ id: 'sm' }], [MORNING], 'אכלתי סורימי 1', NOW).join() === 'sm', 'lunch "אכלתי סורימי 1" over a breakfast row: stale');
ok(S([{ id: 'sm' }], [MORNING], 'רק חצי', NOW).length === 0, '"רק חצי" is a correction');
ok(S([{ id: 'sm' }], [MORNING], 'טעית, היו 2', NOW).length === 0, '"טעית, היו 2" is a correction');
ok(S([{ id: 'sm' }], [MORNING], 'בעצם אכלתי 3', NOW).length === 0, '"בעצם" is a correction');
ok(S([{ id: 'sm' }], [MORNING], 'אכלתי ירקות וסורימי', NOW).join() === 'sm', 'ירקות does not contain the word רק');
ok(S([{ id: 'sm' }], [MORNING], 'אכלתי חציל', NOW).join() === 'sm', 'חציל does not contain the word חצי');
ok(S([{ id: 'sm' }], [MORNING], 'אכלתי ארבע', NOW).join() === 'sm', 'ארבע does not contain the word רבע');
ok(S([{ id: 'sm' }], [MORNING], 'ורק אחד', NOW).length === 0, 'a prefix letter: ורק is still רק');
ok(S([{ id: 'eg' }], [RECENT], 'רק אחת', NOW).length === 0 && S([{ id: 'eg' }], [RECENT], 'אחת', NOW).length === 0, 'a row from two minutes ago may be updated');
ok(S([{ id: 'sm' }], [MORNING], 'it was only one', NOW).length === 0, 'English "only" is a correction');

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
        input: Object.assign({ photo_count: '', date: '2026-11-03', message: 'נרשם' }, r) }] }), { status: 200 });
    }
    return new Response('', { status: 404 });
  };
  const req = new Request('https://w/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.assign({ day: '2026-11-03', lang: 'he', uid: 'test-' + Math.random(), now_ms: NOW, now_time: '13:30' }, body)) });
  return (await worker.fetch(req, env, { waitUntil: () => {} })).json();
}
const UPD3 = { action: 'update', items: [{ id: 'sm', name: 'סורימי', quantity: '3 מקלות', calories: 51, protein: 4.5, carbs: 7.5, fat: 0.6 }], message: 'עדכנתי ל-3 מקלות' };
const ADD1 = { action: 'add', items: [{ id: 'n1', name: 'סורימי', quantity: 'מקל 1', calories: 17, protein: 1.5, carbs: 2.5, fat: 0.2 }], message: 'רשמתי מקל סורימי' };

let j = await coach({ message: 'אכלתי סורימי 1', logged: [MORNING] }, [UPD3, ADD1]);
ok(sent.length === 2, 'the rewrite of the breakfast row is sent back - calls: ' + sent.length);
ok(/more than an hour ago/.test(JSON.stringify(sent[1].messages.at(-1))), 'the send-back says why');
ok(j.action === 'add' && j.items.length === 1 && j.items[0].id === 'n1' && j.items[0].calories === 17, 'a new row at lunch, 17 kcal; breakfast untouched');

j = await coach({ message: 'אכלתי סורימי 1', logged: [MORNING] }, [UPD3, UPD3]);
ok(j.action === 'add' && j.items.length === 1 && j.items[0].id !== 'sm' && j.items[0].calories === 17,
  'a model that insists: the difference is logged as a new row (17 kcal, not 51) - got ' + JSON.stringify(j.items.map((x) => [x.id, x.calories])));

j = await coach({ message: 'רק אחת', logged: [RECENT] }, [{ action: 'update', items: [{ id: 'eg', name: 'ביצה', quantity: 'ביצה 1', calories: 70, protein: 6.3, carbs: 0.5, fat: 5 }] }]);
ok(sent.length === 1 && j.action === 'update' && j.items[0].id === 'eg', '"אכלתי 2 ביצים" then "רק אחת": an update of the same row, nothing sent back');

j = await coach({ message: 'רק חצי', logged: [MORNING] }, [{ action: 'update', items: [{ id: 'sm', name: 'סורימי', quantity: 'מקל 1', calories: 17, protein: 1.5, carbs: 2.5, fat: 0.2 }] }]);
ok(sent.length === 1 && j.action === 'update', 'an old row corrected in words ("רק חצי") stays an update');

j = await coach({ message: 'שם', logged: [MORNING], edit_id: 'sm' }, [UPD3]);
ok(sent.length === 1 && j.action === 'update' && j.items[0].id === 'sm', 'an edit by long press names its row and is never second-guessed');

/* the question is shown once */
j = await coach({ message: 'אכלתי מקל 1', logged: [MORNING] }, [{ action: 'none', items: [], message: 'עוד מקל?', question: 'עוד מקל?' }]);
ok(j.message === 'עוד מקל?' && j.question === '', 'a question already in the message is not drawn again under it');
j = await coach({ message: 'אכלתי מקל 1', logged: [MORNING] }, [{ action: 'none', items: [], message: 'בסדר.', question: 'עוד מקל, או בסך הכל אחד?' }]);
ok(/עוד מקל, או בסך הכל אחד\?/.test(j.message) && j.question === '', 'a question only in question goes into the message, once');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('a new eating is a new row, a correction is an update, and the question is asked once');
