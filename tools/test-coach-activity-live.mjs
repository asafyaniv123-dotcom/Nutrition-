/* Steps and activity through the live /coach: the dinner question (asked
 * once, never when activity is in), the bonus worked out in code, a later
 * number replacing the earlier, and a watch's calories refused.
 * With ADMIN_KEY in the environment the run spends its own budget.
 *
 *   node tools/test-coach-activity-live.mjs
 */
const HOST = process.argv[2] || 'https://nutrition-push.nutrition-push.workers.dev';
const DAY = '2026-10-21';
const BASE = { day: DAY, lang: 'he', units: 'metric', gender: 'm', history: [], weights: [], logged: [],
  targets: { kcal: 2050, p: 140, c: 220, f: 65 }, left: { kcal: 900, p: 50, c: 90, f: 25 } };
const ACT = { steps: 0, base: 8000, kg: 69, cm: 170, strength: false, cardio_min: 0, target: 2050, left: 900, ask: true, asked: false, has: false, now: '19:00' };
const post = async (o) => {
  const r = await fetch(HOST + '/coach', { method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, process.env.ADMIN_KEY ? { Authorization: 'Bearer ' + process.env.ADMIN_KEY } : {}),
    body: JSON.stringify(Object.assign({}, BASE, o)) });
  return r.json();
};
const fails = [];
const ok = (c, what, extra) => { console.log((c ? 'ok   ' : 'FAIL ') + what + (extra ? '\n        ' + extra : '')); if (!c) fails.push(what); };
const flat = (s) => String(s || '').replace(/\s+/g, ' ');
const asks = (m) => /כמה צעדים/.test(m);

let j = await post({ message: 'אכלתי לארוחת ערב חזה עוף עם אורז וסלט', activity: ACT });
ok(j.action === 'add' && (j.asked_steps === true && asks(j.message) || j.steps_due === true), 'dinner at 19:00, nothing reported: it asks at the end, or the app will', flat(j.message) + ' | steps_due ' + j.steps_due);
j = await post({ message: 'אכלתי לארוחת ערב חזה עוף עם אורז וסלט', activity: Object.assign({}, ACT, { steps: 12000, has: true }) });
ok(!j.asked_steps && !j.steps_due && !asks(j.message), 'steps already in today: it does not ask', flat(j.message));
j = await post({ message: 'אכלתי לארוחת ערב חזה עוף עם אורז וסלט', activity: Object.assign({}, ACT, { asked: true }) });
ok(!j.asked_steps && !j.steps_due && !asks(j.message), 'already asked today: not again', flat(j.message));
j = await post({ message: 'אכלתי לארוחת צהריים סלט טונה', activity: Object.assign({}, ACT, { now: '13:00' }) });
ok(!j.asked_steps && !j.steps_due && !asks(j.message), 'lunch at 13:00: nothing about steps', flat(j.message));

j = await post({ message: '14,000', history: [{ role: 'assistant', text: 'רשמתי. כמה צעדים הלכת היום? אעדכן לך את היעד' }], activity: Object.assign({}, ACT, { asked: true }) });
ok(j.activity && j.activity.steps === 14000 && j.activity.bonus === 146, 'answering 14,000 at 69 kg, 170 cm: +146, worked out in code', JSON.stringify(j.activity));
ok(/146/.test(j.message), 'the reply says +146', flat(j.message));
j = await post({ message: 'רגע, בעצם 17,000 צעדים', activity: Object.assign({}, ACT, { steps: 14000, has: true, asked: true, left: 1140 }) });
ok(j.activity && j.activity.steps === 17000 && j.activity.bonus === 219, 'updated to 17,000: +219, not added on top', JSON.stringify(j.activity));
j = await post({ message: 'עשיתי היום אימון כוח', activity: Object.assign({}, ACT, { now: '12:00' }) });
ok(j.activity && j.activity.strength === true && j.activity.bonus === 200, 'a strength workout: +200', JSON.stringify(j.activity));
j = await post({ message: 'השעון אומר ששרפתי היום 900 קלוריות באימון', activity: Object.assign({}, ACT, { now: '12:00' }) });
ok(!(j.activity && j.activity.bonus >= 900) && /שעון|שעונים|מעריכ|מגזימ/.test(j.message), 'watch calories: not used, and it says why', flat(j.message) + ' | ' + JSON.stringify(j.activity));

console.log('\n' + (fails.length ? fails.length + ' FAILED' : 'all right'));
process.exit(fails.length ? 1 : 0);
