/* Her sushi, against the live /coach: two photos of ONE plate and "I ate
 * twice what's in the picture, and only one plate of teriyaki". The same
 * photos are also sent as "I ate what's in the picture", and the sushi of
 * the first must come to about twice the sushi of the second - not the same
 * (the bug: one plate logged) and not four times (two photos taken as two
 * plates, then doubled again). Each case runs three times; the model varies.
 *
 *   node tools/test-coach-portions-live.mjs <photo1.jpg> <photo2.jpg> [host]
 */
import fs from 'node:fs';
const [p1, p2, HOST = 'https://nutrition-push.nutrition-push.workers.dev'] = process.argv.slice(2);
if (!p1 || !p2) { console.log('usage: node tools/test-coach-portions-live.mjs <photo1.jpg> <photo2.jpg> [host]'); process.exit(2); }
const images = [p1, p2].map((f) => ({ mime: 'image/jpeg', data: fs.readFileSync(f).toString('base64') }));
const BASE = { day: '2026-10-20', lang: 'he', units: 'metric', gender: 'f', logged: [], history: [], weights: [],
  targets: { kcal: 1800, protein: 120, carbs: 180, fat: 60 }, left: { kcal: 1800, protein: 120, carbs: 180, fat: 60 } };
/* everything that is not the teriyaki is the plate - the model spells nigiri
   four ways, and a name pattern for sushi missed half of them */
const isSauce = (n) => /טריאקי|teriyaki/i.test(n);
const isSushi = (n) => !isSauce(n);
async function ask(message) {
  const r = await fetch(HOST + '/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.assign({}, BASE, { message, images })) });
  const j = await r.json();
  if (!j.ok) return { err: r.status + ' ' + JSON.stringify(j).slice(0, 200) };
  const sushi = j.items.filter((i) => isSushi(i.name)).reduce((a, i) => a + i.calories, 0);
  const sauce = j.items.filter((i) => isSauce(i.name)).reduce((a, i) => a + i.calories, 0);
  const total = j.items.reduce((a, i) => a + i.calories, 0);
  return { j, sushi, sauce, total };
}
const once = [], twice = [];
const RUNS = Number(process.env.RUNS || 3);
for (let k = 0; k < RUNS; k++) {
  const a = await ask('אכלתי את מה שבתמונה');
  const b = await ask('אכלתי פעמיים כמו התמונה, ורק צלחת אחת של טריאקי');
  for (const [lbl, x, arr] of [['once ', a, once], ['twice', b, twice]]) {
    if (x.err) { console.log(lbl, 'ERROR', x.err); continue; }
    arr.push(x);
    console.log(lbl + ' | ' + x.j.action + ' | sushi ' + x.sushi + ' | teriyaki ' + x.sauce + ' | total ' + x.total + (x.j.retried ? ' | retried' : ''));
    for (const i of x.j.items) console.log('        ' + i.name + ' | ' + i.quantity + ' | ' + i.calories + ' | portions ' + i.portions + (i.units ? ' x ' + i.units + ' pcs' : ''));
    if (lbl === 'twice') console.log('        says: ' + x.j.message.replace(/\s+/g, ' ').slice(0, 220));
  }
}
const avg = (a, k) => a.reduce((s, x) => s + x[k], 0) / (a.length || 1);
const ratio = avg(twice, 'sushi') / (avg(once, 'sushi') || 1);
const fails = [];
if (twice.length < RUNS || once.length < RUNS) fails.push('a call failed');
if (ratio < 1.6 || ratio > 2.4) fails.push('sushi twice / once = ' + ratio.toFixed(2) + ', want about 2');
if (twice.some((x) => x.j.action !== 'add')) fails.push('"I ate" was not logged');
if (twice.some((x) => x.sauce < 1)) fails.push('the teriyaki is missing from a reply');
console.log('\nsushi once ~' + Math.round(avg(once, 'sushi')) + ', twice ~' + Math.round(avg(twice, 'sushi')) + ' (x' + ratio.toFixed(2) + '); twice in all ~' + Math.round(avg(twice, 'total')) + ' kcal');
console.log(fails.length ? 'FAIL: ' + fails.join('; ') : 'ok: two photos are one plate, and "twice" is twice');
process.exit(fails.length ? 1 : 0);
