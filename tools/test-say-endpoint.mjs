/* Does Gemini actually answer better than we did? Three questions with known
 * right answers, asked through our own /say endpoint.
 *
 * These are not invented probes. Each one is a meal he logged today where the
 * app was wrong and he checked it against Gemini by hand, so the "truth"
 * column is either the product's published figures or our own table read with
 * the correct row. The point is to settle with a table whether a second
 * provider earns its keep, before anyone attaches a credit card.
 *
 * NO PERSONAL DATA IS SENT. Three sentences, all of which he has already
 * shown me in screenshots. Nothing from his log, no photographs.
 *
 *   node tools/test-say-endpoint.mjs
 *   node tools/test-say-endpoint.mjs https://some-other-host
 */
const HOST = process.argv[2] || 'https://nutrition-push.nutrition-push.workers.dev';

const CASES = [
  {
    q: 'פנקייק מ- ביצה, גביע קוטג 5%, 4 כפות קמח',
    appSaid: '657 kcal · 55 p · 34.3 f',
    truth: 'about 426 kcal · 33.6 p · 17.6 f',
    why: 'the app matched the egg to egg POWDER at 605 kcal/100g',
  },
  {
    q: 'Herbalife 24 Rebuild Strength, 30 גרם',
    appSaid: '107 kcal · 9.3 p  (as a generic "protein supplement, MERITENE")',
    truth: '190 kcal · 25 p per the 50 g serving, so about 114 · 15 for 30 g',
    why: 'Herbalife is 0 rows of 7,240 - no matching could ever have found it',
  },
  {
    q: '150 גרם חזה עוף, 100 גרם אטריות אודון, ירקות מוקפצים',
    appSaid: '614 kcal · 28.7 p · 26.7 f',
    truth: 'about 533 kcal · 51 p · 19 f',
    why: 'the app matched the chicken to a breaded product at p15 where plain breast is p30',
  },
];

async function ask(q) {
  const r = await fetch(HOST + '/say', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q, lang: 'he' }),
  });
  if (!r.ok) {
    let why = '';
    try { why = (await r.text()).slice(0, 300); } catch {}
    return { error: r.status + ' ' + why };
  }
  if (!r.body) return { error: 'no stream' };
  const rd = r.body.getReader();
  const td = new TextDecoder();
  let buf = '', out = '', chunks = 0;
  for (;;) {
    const { done, value } = await rd.read();
    if (done) break;
    buf += td.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (line.indexOf('data:') !== 0) continue;
      const p = line.slice(5).trim();
      if (!p) continue;
      let j; try { j = JSON.parse(p); } catch { continue; }
      if (typeof j.t === 'string') { out += j.t; chunks++; }
      if (j.error) return { error: 'the stream reported an error' };
    }
  }
  return { out, chunks };
}

console.log('asking ' + HOST + '/say\n');
let failed = 0;
for (const c of CASES) {
  console.log('─'.repeat(72));
  console.log('Q       ' + c.q);
  console.log('app     ' + c.appSaid);
  console.log('truth   ' + c.truth);
  console.log('why     ' + c.why);
  const t0 = Date.now();
  const r = await ask(c.q);
  if (r.error) { failed++; console.log('\nFAILED  ' + r.error + '\n'); continue; }
  console.log('\nGemini  (' + r.chunks + ' chunks, ' + (Date.now() - t0) + ' ms)\n');
  console.log(r.out.split('\n').map(l => '        ' + l).join('\n'));
  console.log('');
}
console.log('─'.repeat(72));
console.log(failed ? failed + ' of ' + CASES.length + ' could not be asked.'
                   : 'All three answered. Read them against the truth line above - '
                     + 'that judgement is his, not a number this script can compute.');
process.exit(failed ? 1 : 0);
