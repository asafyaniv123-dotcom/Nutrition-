/* Against the live /coach: an edit by id, a habit offered after the third
 * same correction, and weigh-ins - salt the day before, the number hidden,
 * and weekly mode. Text only, so each case costs one call of the daily cap.
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

// 3. weigh-ins
const SALT = [{ day: '2026-10-20', flags: ['sodium', 'restaurant', 'late_meal'] }];
const W = { mode: 'daily', trend_direction: 'flat', change_vs_trend_kg: 0.6, rate_kg_per_week: -0.2, expected_kg_per_week: -0.3,
  expected_vs_actual: false, weeks_of_data: 4, flags: SALT };
j = await post({ logged: [], message: 'שקילת בוקר: 72.6 ק"ג',
  weigh: Object.assign({ hidden: false, today_kg: 72.6, trend_kg: 72.0, goal_kg: 65, to_goal_kg: 7, recent: [{ d: '2026-10-19', kg: 72.0 }, { d: '2026-10-20', kg: 72.1 }, { d: DAY, kg: 72.6 }] }, W) });
const m = flat(j.message);
ok(j.action === 'none' && !(j.items || []).length, 'a weigh-in logs no food');
ok(/מים|נוזל/.test(m) && /נתרן|מלח|סויה|מסעדה/.test(m), 'it says water, from the salt', m);
ok(!/פחות|לקצץ|לוותר|לפצות|להוריד קלוריות|לדלג/.test(m), 'it does not say to eat less or compensate');
j = await post({ logged: [], message: 'שקילת בוקר', weigh: Object.assign({ hidden: true }, W) });
const mh = flat(j.message);
ok(!/\d{2}[.,]\d|\d{2,3} ?ק"?ג/.test(mh), 'HIDDEN: no weight in the reply', mh);
j = await post({ logged: [], message: 'שקילת בוקר: 71.8 ק"ג',
  weigh: Object.assign({}, W, { mode: 'weekly', hidden: false, change_vs_trend_kg: -0.4, today_kg: 71.8, trend_kg: 71.8, recent: [{ d: '2026-10-14', kg: 72.2 }, { d: DAY, kg: 71.8 }], flags: [] }) });
ok(/שבוע/.test(flat(j.message)), 'weekly: it compares week to week', flat(j.message));

// 4. no reminder push: the coach mentions a missing weigh-in, once a day
j = await post({ logged: [], message: 'בוקר טוב, מה כדאי לאכול לארוחת בוקר?', weigh_status: { due_today: true, weighed_today: false } });
ok(/נשקל|שקיל/.test(flat(j.message)), 'weigh day, not yet weighed: it mentions it', flat(j.message));
j = await post({ logged: [], message: 'ומה לגבי קפה?', weigh_status: { due_today: true, weighed_today: false },
  history: [{ role: 'user', text: 'בוקר טוב, מה כדאי לאכול לארוחת בוקר?' }, { role: 'assistant', text: 'יוגורט עם פירות. אם עוד לא נשקלת היום, זה הזמן.' }] });
ok(!/נשקל|שקיל/.test(flat(j.message)), 'already said today: not again', flat(j.message));
j = await post({ logged: [], message: 'בוקר טוב, מה כדאי לאכול לארוחת בוקר?', weigh_status: { due_today: false, weighed_today: false } });
ok(!/נשקל|שקיל/.test(flat(j.message)), 'not a weigh day: nothing about it', flat(j.message));

console.log('\n' + (fails.length ? fails.length + ' FAILED' : 'all right'));
process.exit(fails.length ? 1 : 0);
