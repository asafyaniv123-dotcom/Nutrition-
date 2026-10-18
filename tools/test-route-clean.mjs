/* What the home bar's /route lets through. The model's answer is a
 * suggestion; routeClean is what makes it safe to put on a card the person
 * confirms. Every case here is a way the model could be wrong that would put
 * something false on that card.
 *
 *   node tools/test-route-clean.mjs
 */
import { routeClean } from '../push-server/src/worker.js';

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const P = ['דנה', 'Yossi', 'אמא'];
const base = { intent: '', text: '', person: '', date: '', time: '', amount: 0, page: 0, area: '' };
const R = (o) => routeClean(Object.assign({}, base, o), P);

ok(R({ intent: 'quote', text: 'כל ההתחלות קשות' }).intent === 'quote', 'a quote with text stays a quote');
ok(R({ intent: 'quote', text: '  ' }).intent === 'unknown', 'a quote with no text is not a quote');
ok(R({ intent: 'nonsense', text: 'x' }).intent === 'unknown', 'an intent the app does not have is unknown');
ok(R({ intent: 'person_note', text: 'אוהבת שוקולד', person: 'דנה' }).person === 'דנה', 'a known person is kept');
ok(R({ intent: 'person_note', text: 'x', person: 'yossi' }).person === 'Yossi', 'matched without case, returned as the app spells it');
ok(R({ intent: 'person_note', text: 'x', person: 'רונית' }).intent === 'unknown', 'a person the app does not know is never invented');
ok(R({ intent: 'task', text: 'להתקשר', date: 'tomorrow' }).date === '', 'a date that is not a date is dropped, not guessed');
ok(R({ intent: 'task', text: 'x', date: '2026-02-30' }).date === '', 'a date that does not exist is dropped, not rolled into March');
ok(R({ intent: 'task', text: 'x', date: '2026-10-18', time: '9:05' }).time === '09:05', 'a time is normalised to HH:MM');
ok(R({ intent: 'task', text: 'x', time: '25:00' }).time === '', 'an impossible time is dropped');
ok(R({ intent: 'water', amount: 250 }).amount === 250, 'water keeps its millilitres');
ok(R({ intent: 'water', amount: 0 }).intent === 'unknown', 'water with no amount is not logged as nothing');
ok(R({ intent: 'water', amount: 90000 }).intent === 'unknown', 'ninety litres is not a glass of water');
ok(R({ intent: 'steps', amount: 8000.4 }).amount === 8000, 'steps are whole');
ok(R({ intent: 'quote', text: 'x', amount: 300 }).amount === 0, 'an amount on an intent that has none is dropped');
ok(R({ intent: 'open', area: 'people' }).area === 'people', 'open keeps a real area');
ok(R({ intent: 'open', area: 'kitchen' }).intent === 'unknown', 'open to an area that does not exist is unknown');
ok(R({ intent: 'moment', text: 'a'.repeat(5000) }).text.length === 1000, 'text is capped');
ok(routeClean(null, P).intent === 'unknown', 'no answer at all is unknown, not a crash');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('nothing the model says reaches the card unchecked');
