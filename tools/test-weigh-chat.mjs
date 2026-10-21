/* A weigh-in in the chat: the arithmetic the worker does once the model has
 * noticed a weight, and what is kept from a hidden reply.
 *
 *   node tools/test-weigh-chat.mjs
 */
import { weighCtxClean, weighResult, weighScrub } from '../push-server/src/worker.js';

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const J = (x) => JSON.stringify(x);
const SALT = [{ day: '2026-10-20', flags: ['sodium', 'restaurant', 'hack'] }];
let c = weighCtxClean({ mode: 'daily', hidden: false, trend_before_kg: 72.0, rate_kg_per_week: -0.05, goal_kg: 65, flags: SALT });
let r = weighResult(c, 72.6);
ok(r.change_vs_trend_kg === 0.6 && r.today_kg === 72.6 && r.to_goal_kg === 7.6, 'daily: today against the seven days before it (+0.6), and to the goal');
ok(r.trend_direction === 'flat', 'the direction is the rate\'s, not one morning\'s');
ok(J(r.flags) === J([{ day: '2026-10-20', flags: ['sodium', 'restaurant'] }]), 'only known flags pass');
c = weighCtxClean({ mode: 'weekly', week_sum_kg: 0, week_n: 0, last_week_kg: 72.2 });
r = weighResult(c, 71.8);
ok(r.change_vs_trend_kg === -0.4 && /week/.test(r.compared_with), 'weekly: this week against last week (-0.4)');
c = weighCtxClean({ mode: 'weekly', week_sum_kg: 143.6, week_n: 2, last_week_kg: 72.2 });
ok(weighResult(c, 71.8).change_vs_trend_kg === -0.4, 'weekly with two readings already this week: their mean with today\'s');
c = weighCtxClean({ mode: 'daily', hidden: true, trend_before_kg: 72.0, goal_kg: 65 });
r = weighResult(c, 72.6);
ok(!('today_kg' in r) && !('trend_kg' in r) && !('goal_kg' in r) && !J(r).includes('72'), 'HIDDEN: no weight in what the model is given');
ok(r.change_vs_trend_kg === 0.6, 'hidden still carries the difference');
ok(weighCtxClean({ trend_before_kg: 9000 }).trend_before_kg === null && weighCtxClean(null) === null, 'nonsense is dropped, nothing is null');
ok(weighResult(weighCtxClean({ mode: 'daily' }), 70).change_vs_trend_kg === null, 'no trend yet: no change, not a guess');

ok(weighScrub('שקלת 72.6 ק"ג, חצי קילו מעל המגמה.', 72.6) === 'שקלת, חצי קילו מעל המגמה.', 'the scrub takes the weight and its unit');
ok(weighScrub('72,6 kg - מים מהנתרן', 72.6) === '- מים מהנתרן', 'with a comma and in kg');
ok(weighScrub('ארוחה של 450 קל׳, 120 גרם חלבון', 72.6) === 'ארוחה של 450 קל׳, 120 גרם חלבון', 'other numbers stay');
ok(weighScrub('בין 71 ל-74', 72.6) === 'בין ל-', 'anything within three kilos goes, even a range');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('the worker does the arithmetic, and a hidden weight is not said back');
