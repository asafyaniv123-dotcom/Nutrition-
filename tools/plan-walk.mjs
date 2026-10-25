/* Walks the live /plan through the new loop, answering each question with
 * its first option (or a fixed answer), and prints every question. */
const U = 'https://nutrition-push.nutrition-push.workers.dev/plan';
const turns = [{ role: 'user', text: 'טווח: השבוע. העוגנים הקבועים: עבודה · יום א׳, יום ב׳, יום ג׳, יום ד׳, יום ה׳ · 09:00–17:00.' }];
const scripted = ['חדר כושר שלוש פעמים בשבוע', 'שעה', 'חצי שעה לכל כיוון', 'לפגוש את נועה פעם בשבוע', 'שעתיים', 'רבע שעה לכל כיוון', 'זהו, זה הכול'];
let si = 0;
for (let i = 0; i < 12; i++) {
  const r = await fetch(U, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lang: 'he', gender: 'm', now: '2026-10-25 17:10', tz: 'Asia/Jerusalem', calendar: [], turns, profile: {} }) });
  const j = await r.json();
  const o = j.answer || j.reply || j;
  if (!o || !o.type) { console.log('?', JSON.stringify(j).slice(0, 300)); break; }
  if (o.type !== 'question') { console.log('==>', o.type, (o.message || '').slice(0, 200), o.days ? o.days.length + ' days' : ''); break; }
  console.log(`[${o.stage} ${o.stageName}] ${o.message}\n     ${(o.options || []).join(' | ')}${o.skip ? '  (skip: ' + o.skip + ')' : ''}`);
  turns.push({ role: 'bot', text: JSON.stringify(o) });
  const a = scripted[si++] || (o.options || [])[0] || 'זהו';
  console.log('  -> ' + a);
  turns.push({ role: 'user', text: a });
}
