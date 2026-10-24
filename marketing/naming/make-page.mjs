/* The naming decision page: every finalist set the way the brand is set today
 * (the sun, then the name in Fraunces 700), in the places a name lives (under
 * the icon, the store title, a sentence), with what was checked beside it.
 *
 *   node marketing/naming/make-page.mjs   -> review/names/index.html
 *
 * Reads marketing/naming/shortlist.json (written by hand from round1.json,
 * trademarks.md and languages.md) - the page carries no judgement of its own.
 */
import fs from 'fs';
const S = JSON.parse(fs.readFileSync('marketing/naming/shortlist.json', 'utf8'));
const OR = '#ff7a1a';
const P = { n: 9, c: 19.5, d: 5.6, r: 33, rot: 0.5 };   // brand/build-svgs.mjs, the line chosen on 23 Oct
function sun(size) {
  let s = `<circle cx="50" cy="50" r="${P.c}" fill="${OR}"/>`;
  for (let i = 0; i < P.n; i++) {
    const a = (i + P.rot) / P.n * Math.PI * 2 - Math.PI / 2;
    s += `<circle cx="${(50 + Math.cos(a) * P.r).toFixed(2)}" cy="${(50 + Math.sin(a) * P.r).toFixed(2)}" r="${P.d}" fill="${OR}"/>`;
  }
  return `<svg viewBox="11 11 78 78" width="${size}" height="${size}" aria-hidden="true">${s}</svg>`;
}
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const mark = { ok: '✓', warn: '!', bad: '✕', na: '–' };
const cell = (c) => `<span class="ck ${c.s}">${mark[c.s]}</span> ${esc(c.t)}`;

const cards = S.names.map((n, i) => `
<section class="card${n.recommended ? ' rec' : ''}" id="${n.name.toLowerCase()}">
  <div class="kick">${n.recommended ? 'ההמלצה שלי · ' : ''}${i + 1}</div>
  <div class="lock">${sun(64)}<span class="wm">${esc(n.name)}</span></div>
  <p class="idea">${esc(n.idea)}</p>
  <div class="uses">
    <div class="icon"><div class="tile">${sun(54)}</div><div class="lbl">${esc(n.name)}</div></div>
    <div class="store"><div class="st">${esc(n.name)}: Daily Reflection</div><div class="ss">A journal that knows your day</div></div>
  </div>
  <p class="line">“Most days disappear. <b>${esc(n.name)}</b> keeps them.”</p>
  <table>
    <tr><th>חנויות</th><td>${cell(n.stores)}</td></tr>
    <tr><th>סימני מסחר</th><td>${cell(n.trademark)}</td></tr>
    <tr><th>11 השפות</th><td>${cell(n.languages)}</td></tr>
    <tr><th>YouTube</th><td>${cell(n.youtube)}</td></tr>
    <tr><th>דומיין</th><td>${cell(n.domain)}</td></tr>
  </table>
  <p class="risk"><b>הסיכון:</b> ${esc(n.risk)}</p>
</section>`).join('');

const html = `<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>שם חדש לאפליקציה</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=Assistant:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  :root{--ground:#fbf6ee;--ink:#2e2925;--muted:#6f655c;--line:#e6dccd;--or:${OR};--ok:#2f7a45;--warn:#a5640c;--bad:#b3261e}
  *{box-sizing:border-box}
  body{margin:0;background:var(--ground);color:var(--ink);font:16px/1.55 Assistant,system-ui,sans-serif}
  header{max-width:1180px;margin:0 auto;padding:40px 24px 8px}
  h1{font-size:32px;margin:0 0 8px}
  .lede{max-width:760px;color:var(--muted);margin:0 0 6px}
  .how{max-width:760px;font-size:14px;color:var(--muted)}
  main{max-width:1180px;margin:0 auto;padding:16px 24px 64px;display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px}
  .card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:22px 22px 18px;display:flex;flex-direction:column;gap:12px}
  .card.rec{border:2px solid var(--or)}
  .kick{font-size:13px;font-weight:700;color:var(--or)}
  .lock{direction:ltr;display:flex;align-items:center;gap:14px}
  .wm{font-family:Fraunces,serif;font-weight:700;font-size:46px;line-height:1;letter-spacing:-.5px}
  .idea{margin:0}
  .uses{direction:ltr;display:flex;gap:18px;align-items:center;background:var(--ground);border-radius:14px;padding:14px}
  .icon{width:76px;text-align:center}
  .tile{width:64px;height:64px;margin:0 auto 6px;border-radius:15px;background:var(--ground);box-shadow:0 1px 3px rgba(0,0,0,.18);display:grid;place-items:center;background:#fbf6ee}
  .lbl{font:12px/1.2 -apple-system,system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .st{font:600 17px/1.25 -apple-system,system-ui,sans-serif}
  .ss{font:14px/1.3 -apple-system,system-ui,sans-serif;color:var(--muted)}
  .line{direction:ltr;text-align:left;margin:0;font-family:Fraunces,serif;font-size:18px}
  table{border-collapse:collapse;font-size:14px;width:100%}
  th{text-align:right;font-weight:600;color:var(--muted);padding:5px 0 5px 10px;white-space:nowrap;vertical-align:top}
  td{padding:5px 0;vertical-align:top}
  .ck{display:inline-grid;place-items:center;width:18px;height:18px;border-radius:50%;font-size:11px;font-weight:700;color:#fff}
  .ck.ok{background:var(--ok)}.ck.warn{background:var(--warn)}.ck.bad{background:var(--bad)}.ck.na{background:#b9b0a5}
  .risk{margin:0;font-size:14px;color:var(--muted)}
  footer{max-width:1180px;margin:0 auto;padding:0 24px 60px;font-size:14px;color:var(--muted)}
</style></head><body>
<header>
  <h1>שם חדש לאפליקציה</h1>
  <p class="lede">${esc(S.lede)}</p>
  <p class="how">${esc(S.how)}</p>
</header>
<main>${cards}</main>
<footer>${esc(S.footer)}</footer>
</body></html>
`;
fs.mkdirSync('review/names', { recursive: true });
fs.writeFileSync('review/names/index.html', html);
console.log('review/names/index.html:', S.names.length, 'names');
