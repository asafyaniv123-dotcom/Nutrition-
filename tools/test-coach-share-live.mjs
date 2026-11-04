/* The share of a dish, against the DEPLOYED /coach (4 Nov) - the three cases
 * Asaf asked for. Each run costs a few model calls.
 *   - "we were three, I ate a third of every plate": every item 0.33, about 1,060 kcal
 *   - "I ate half the pizza": 0.5
 *   - "twice that" (the sushi of 3 Nov): 2
 *
 *   node tools/test-coach-share-live.mjs [runs]
 */
const H = 'https://nutrition-push.nutrition-push.workers.dev';
const RUNS = Number(process.argv[2] || 2);
const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
async function coach(message, history) {
  const r = await fetch(H + '/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ day: '2026-11-04', lang: 'he', gender: 'm', now_time: '21:30', now_ms: Date.now(), message,
      history: history || [], logged: [], targets: { kcal: 2200, p: 150, c: 220, f: 75 }, uid: 'sharetest' }) });
  return r.json();
}
const line = (j) => (j.items || []).map((x) => `${x.name} ×${x.portions} ${x.calories}kcal ${x.approx_g}/${x.whole_g}g`).join(' ; ');
for (let run = 1; run <= RUNS; run++) {
  console.log('\nrun ' + run);
  let j = await coach('אכלנו 3 אנשים במסעדה יוונית, אכלתי שליש מכל צלחת: עוגת לבה, דולמדס, סטייק עם תפוחי אדמה, עוף עם אורז');
  const tot = (j.items || []).reduce((s, x) => s + x.calories, 0);
  console.log('     ' + line(j)); console.log('     msg: ' + String(j.message || '').replace(/\n/g, ' / '));
  ok(j.action === 'add' && (j.items || []).length >= 4, 'four plates logged - action ' + j.action);
  ok((j.items || []).every((x) => Math.abs(x.portions - 0.33) < 0.02), 'every item is a third - ' + (j.items || []).map((x) => x.portions).join(','));
  ok(tot >= 800 && tot <= 1400, 'about 1,060 kcal in all - got ' + tot);
  const said = String(j.message || '').match(/[\d,]{3,}/g) || [];
  ok(!said.some((n) => Number(n.replace(/,/g, '')) > 1800), 'the message names no whole-plate total - numbers: ' + said.join(' '));

  j = await coach('אכלתי חצי מהפיצה, פיצה מרגריטה משפחתית');
  console.log('     ' + line(j));
  ok(j.action === 'add' && (j.items || []).some((x) => Math.abs(x.portions - 0.5) < 0.01), 'half the pizza: 0.5 - ' + (j.items || []).map((x) => x.portions).join(','));

  j = await coach('אכלתי פעמיים כזה', [{ role: 'user', text: 'מגש סושי: 8 יחידות מאקי סלמון' }, { role: 'assistant', text: 'רואה מגש של 8 יחידות מאקי סלמון. אכלת את כולו?' }]);
  console.log('     ' + line(j));
  ok(j.action === 'add' && (j.items || []).some((x) => x.portions === 2 || x.units === 16), 'twice the tray: 2 - ' + (j.items || []).map((x) => x.portions + '/' + x.units).join(','));
}
if (fails.length) { console.log('\n' + fails.length + ' failed'); process.exit(1); }
console.log('\nall passed');
