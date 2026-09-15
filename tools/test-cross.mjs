/* Does the second opinion catch the rows we actually got wrong?
 *
 * Round 1 asks it cold. Round 2 shows it the exact rows the app picked on
 * 15 September - egg powder for a fresh egg, a breaded product for plain
 * chicken - and asks which are the wrong FOOD.
 *
 * The bar is not "does it produce nice numbers". It is: does `disagree` name
 * the row we know is wrong, and are its `terms` words that would actually find
 * the right row in our tables. Anything less and the loop cannot converge.
 *
 *   node tools/test-cross.mjs
 */
const HOST = process.argv[2] || 'https://nutrition-push.nutrition-push.workers.dev';

const CASES = [
  {
    label: 'pancake - the app matched EGG POWDER',
    q: 'פנקייק מ- ביצה, גביע קוטג 5%, 4 כפות קמח',
    rows: [
      { name: 'ביצה שלמה מיובשת', grams: 50, kcal: 303, protein: 24.2 },
      { name: "קוטג' 5%, תנובה", grams: 250, kcal: 238, protein: 24 },
      { name: 'קמח חיטה לבן', grams: 32, kcal: 116, protein: 3.3 },
    ],
    wrong: 0,
    should: 'name row 0, and give terms for a FRESH egg',
  },
  {
    label: 'stir fry - the app matched a BREADED chicken product',
    q: '150 גרם חזה עוף, 100 גרם אטריות אודון, ירקות מוקפצים',
    rows: [
      { name: 'בשר עוף, פילה עוף אמיתי/בשומשום, מאמא עוף', grams: 150, kcal: 321, protein: 22.5 },
      { name: 'אטריות אודון, Taste of Asia', grams: 100, kcal: 123, protein: 3 },
      { name: 'ירקות מוקפצים, בצל, ברוקולי, גזר', grams: 200, kcal: 170, protein: 3 },
    ],
    wrong: 0,
    should: 'name row 0, and give terms for PLAIN chicken breast',
  },
];

async function cross(body) {
  const r = await fetch(HOST + '/cross', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => null);
  if (!r.ok) return { error: (j && j.error) || r.status, why: j && j.why };
  return j;
}

let bad = 0;
for (const c of CASES) {
  console.log('─'.repeat(72));
  console.log(c.label);
  console.log('should  ' + c.should + '\n');

  const one = await cross({ q: c.q, lang: 'he' });
  if (one.error) { bad++; console.log('  round 1 FAILED  ' + one.error + ' ' + (one.why || '')); }
  else {
    console.log('  round 1 (cold)   ' + JSON.stringify(one.totals));
    console.log('                   ' + (one.items || []).map(i => i.name + ' ' + i.grams + 'g').join(' · '));
  }

  const two = await cross({ q: c.q, lang: 'he', rows: c.rows });
  if (two.error) { bad++; console.log('  round 2 FAILED  ' + two.error + ' ' + (two.why || '')); continue; }

  const dis = (two.disagree || []).map(Number);
  const caught = dis.indexOf(c.wrong) >= 0;
  if (!caught) bad++;
  console.log('\n  round 2 (shown our rows)');
  console.log('    disagree   ' + JSON.stringify(two.disagree) + '   ' +
    (caught ? 'CAUGHT the wrong row' : 'MISSED - expected ' + c.wrong));
  const it = (two.items || [])[c.wrong];
  console.log('    its terms  ' + JSON.stringify(it && it.terms));
  if (two.note) console.log('    note       ' + two.note);
  console.log('');
}
console.log('─'.repeat(72));
console.log(bad ? bad + ' problem(s)' : 'Both wrong rows caught, with terms to look again with.');
process.exit(bad ? 1 : 0);
