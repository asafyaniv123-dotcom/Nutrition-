/* Against the live /coach: an edit by id, a habit offered after the third
 * same correction, and weigh-ins - salt the day before, the number hidden,
 * and weekly mode, typed into the chat. Text only, so each case costs one call of the daily cap.
 *
 *   node tools/test-coach-weigh-live.mjs
 */
const HOST = process.argv[2] || 'https://nutrition-push.nutrition-push.workers.dev';
const DAY = '2026-10-21';
const BASE = { day: DAY, lang: 'he', units: 'metric', gender: 'f', history: [], weights: [], habits: [], habits_offered: [],
  corrections_recent: [], targets: { kcal: 1700, p: 110, c: 170, f: 60 }, left: { kcal: 1200, p: 80, c: 120, f: 40 } };
const EGGS = { id: '1001', name: 'ביצים', quantity: '2', calories: 140, protein: 12, carbs: 1, fat: 10, meal: 'breakfast' };
const post = async (o) => {
  const r = await fetch(HOST + '/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({}, BASE, o)) });
  return r.json();
};
const fails = [];
const ok = (c, what, extra) => { console.log((c ? 'ok   ' : 'FAIL ') + what + (extra ? '\n        ' + extra : '')); if (!c) fails.push(what); };
const flat = (s) => String(s || '').replace(/\s+/g, ' ');

// 1. the swipe edit
let j = await post({ logged: [EGGS], edit_id: '1001', message: '2 ביצים עם כף שמן' });
const it = (j.items || [])[0] || {};
ok(j.action === 'update' && j.items.length === 1 && it.id === '1001', 'edit: an update of that id, and only it', JSON.stringify(j.items));
ok(it.calories - 140 >= 90 && it.calories - 140 <= 150, 'edit: about +120 kcal for a spoon of oil (' + (it.calories - 140) + ')');
ok(flat(j.message).length < 160 && !/נשאר להיום/.test(j.message), 'edit: one short line, no remaining block', flat(j.message));

// 2. the third "no oil" correction: it asks once, and offers the habit
const fix = (n) => ({ type: 'swipe_edit', before: n + ' (מטוגן)', after: n + ' (בלי שמן)', said: n + ' בלי שמן, אני מבשלת בלי שמן' });
j = await post({ logged: [{ id: 'm9', name: 'חביתה', quantity: '2 ביצים', calories: 230, protein: 12, carbs: 1, fat: 19, meal: 'breakfast' }],
  corrections_recent: [fix('שניצל'), fix('ירקות מוקפצים')], edit_id: 'm9', message: 'חביתה בלי שמן' });
ok(!!j.habit_offer && /שמן/.test(j.habit_offer) && !j.habit_save, 'after the third: it offers a habit and saves nothing', 'offer: ' + j.habit_offer + ' | says: ' + flat(j.message));
j = await post({ history: [{ role: 'assistant', text: 'שמתי לב שאת מבשלת בלי שמן. לזכור את זה להבא?' }], habits_offered: ['מבשלת בלי שמן'],
  logged: [], message: 'כן' });
ok(!!j.habit_save && /שמן/.test(j.habit_save), 'a yes saves it', 'save: ' + j.habit_save);

// 3. weigh-ins, typed into the chat: the worker reads the number and does the arithmetic
const SALT = [{ day: '2026-10-20', flags: ['sodium', 'restaurant', 'late_meal'] }];
const CTX = { mode: 'daily', hidden: false, trend_before_kg: 72.0, week_sum_kg: 144.1, week_n: 2, last_week_kg: 72.1,
  rate_kg_per_week: -0.2, expected_kg_per_week: -0.3, expected_vs_actual: false, weeks_of_data: 4, goal_kg: 65, flags: SALT };
const ON = { due_today: true, weighed_today: false };
j = await post({ logged: [], message: 'שקלתי 72.6', weigh_ctx: CTX, weigh_status: ON });
const m = flat(j.message);
ok(j.weight_kg === 72.6, 'it reads the weight out of the words (' + j.weight_kg + ')');
ok(j.action === 'none' && !(j.items || []).length, 'a weigh-in logs no food');
ok(/מים|נוזל/.test(m) && /נתרן|מלח|מלוח|סויה|מסעדה|בחוץ/.test(m), 'it says water, from the salt', m);
ok(!/פחות|לקצץ|לוותר|לפצות|להוריד קלוריות|לדלג/.test(m), 'it does not say to eat less or compensate');
j = await post({ logged: [], message: 'שקלתי 72.6', weigh_ctx: Object.assign({}, CTX, { hidden: true }), weigh_status: ON });
const mh = flat(j.message);
ok(j.weight_kg === 72.6 && !/7[0-5][.,]\d|7[0-5] ?ק"?ג/.test(mh), 'HIDDEN: recorded, and no weight in the reply', mh);
j = await post({ logged: [], message: 'שקלתי 71.8', weigh_ctx: Object.assign({}, CTX, { mode: 'weekly', week_sum_kg: 0, week_n: 0, last_week_kg: 72.2, flags: [] }), weigh_status: ON });
ok(/שבוע/.test(flat(j.message)), 'weekly: it compares week to week', flat(j.message));
j = await post({ logged: [], message: 'שקלתי 72.6', weigh_status: null });
ok(j.weight_kg === null, 'weigh-ins not tracked: nothing recorded');
j = await post({ logged: [], message: 'המטרה שלי היא להגיע ל-65', weigh_ctx: CTX, weigh_status: ON });
ok(j.weight_kg === null, 'a goal is not a weigh-in');

// 4. the coach mentions a missing weigh-in, once a day
j = await post({ logged: [], message: 'בוקר טוב, מה כדאי לאכול לארוחת בוקר?', weigh_ctx: CTX, weigh_status: ON });
ok(/נשקל|שקיל/.test(flat(j.message)) && j.weigh_nudged === true, 'weigh day, not yet weighed: it mentions it, and says so', flat(j.message));
j = await post({ logged: [], message: 'ומה לגבי קפה?', weigh_ctx: CTX, weigh_status: Object.assign({}, ON, { nudged: true }),
  history: [{ role: 'user', text: 'בוקר טוב, מה כדאי לאכול לארוחת בוקר?' }, { role: 'assistant', text: 'יוגורט עם פירות. אם עוד לא נשקלת היום, זה הזמן.' }] });
ok(!/נשקל|שקיל/.test(flat(j.message)), 'already said today: not again', flat(j.message));
j = await post({ logged: [], message: 'בוקר טוב, מה כדאי לאכול לארוחת בוקר?', weigh_ctx: CTX, weigh_status: { due_today: false, weighed_today: false } });
ok(!/נשקל|שקיל/.test(flat(j.message)), 'not a weigh day: nothing about it', flat(j.message));
j = await post({ logged: [EGGS], message: 'מה לאכול בצהריים?', weigh_ctx: CTX, weigh_status: ON });
ok(!/נשקל|שקיל/.test(flat(j.message)) && !j.weigh_nudged, 'already eaten today: nothing about it', flat(j.message));

console.log('\n' + (fails.length ? fails.length + ' FAILED' : 'all right'));
process.exit(fails.length ? 1 : 0);
