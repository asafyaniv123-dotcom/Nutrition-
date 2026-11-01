/* The coach's logged items, listed by the APP under its reply (Asaf, 1 Nov):
 * "the list shows only name and amount ('2 slices') - add to every item the
 * assumption and the values", e.g.
 *   לחם Körner Balance, 2 פרוסות (≈76 ג') · 190 קל׳, 7 ג' חלבון
 * The reply was the model's prose and could not be held to that; the rows
 * are the day's own records, so what is shown is what was logged.
 *
 *   node tools/patch-coach-items.mjs [--undo]
 */
import fs from 'fs';
const F = 'dev/index.html', undo = process.argv.includes('--undo');
let s = fs.readFileSync(F, 'utf8');
const P = [
  // the weight the coach assumed is kept with the row
  ["        kcal:q.calories,p:q.protein,c:q.carbs,f:q.fat,note:q.assumption||'',",
   "        kcal:q.calories,p:q.protein,c:q.carbs,f:q.fat,note:q.assumption||'',g:q.approx_g>0?q.approx_g:undefined,"],
  ["        if(typeof u.fat==='number')day.meals[i].f=u.fat;",
   "        if(typeof u.fat==='number')day.meals[i].f=u.fat;\n        if(typeof u.approx_g==='number'&&u.approx_g>0)day.meals[i].g=u.approx_g;"],
  // under every reply that logged something: its rows, as they stand in the day now
  ["      h+='<div class=\"co-a\">'+mdLite(t.weigh&&weighHidden()?weighScrubTxt(t.text||'',loadWeights()[d]):(t.text||''))+\n         (t.q?'<div class=\"co-q\">'+esc(t.q)+'</div>':'')+'</div>';",
   "      h+='<div class=\"co-a\">'+mdLite(t.weigh&&weighHidden()?weighScrubTxt(t.text||'',loadWeights()[d]):(t.text||''))+\n         (t.q?'<div class=\"co-q\">'+esc(t.q)+'</div>':'')+'</div>';\n" +
   "      if(Array.isArray(t.ids)&&t.ids.length)h+=coachItemsHTML(t.ids,d);"],
  ["function coachKindsHTML(ids){",
   "/* What was logged, row by row: name, amount, the weight that was assumed,\n" +
   "   calories and protein - read from the day, so an edit shows here too and a\n" +
   "   deleted row simply leaves. */\n" +
   "function coachItemsHTML(ids,d){\n" +
   "  var day=loadDay(d||todayStr()),h='',i,j,m;\n" +
   "  for(j=0;j<ids.length;j++)for(i=0;i<day.meals.length;i++){m=day.meals[i];\n" +
   "    if(String(m.id)!==String(ids[j]))continue;\n" +
   "    h+='<div class=\"co-it\"><b>'+esc(m.name||'')+'</b>'+(m.amount?', '+esc(m.amount):'')+\n" +
   "       (m.g>0?' <span class=\"co-it-g\">(\\u2248'+fmtGrams(Math.round(m.g))+')</span>':'')+\n" +
   "       ' <span class=\"co-it-v\">\\u00b7 '+_t('{n} קק\"ל',{n:Math.round(m.kcal||0)})+', '+_t('{n} גרם חלבון',{n:Math.round(m.p||0)})+'</span></div>';\n" +
   "    break;}\n" +
   "  return h?'<div class=\"co-its\">'+h+'</div>':'';\n" +
   "}\n" +
   "function coachKindsHTML(ids){"],
  [".co-a{align-self:flex-start;",
   "/* the logged rows under a reply: quiet, one per line, so the assumption can be read and corrected */\n" +
   ".co-its{align-self:flex-start;max-width:88%;display:flex;flex-direction:column;gap:4px;margin:-3px 0 2px;padding:0 6px;font-size:12.5px;line-height:1.45;color:var(--nu-muted,#6d675e)}\n" +
   ".co-it b{color:var(--nu-ink,#4a453f);font-weight:700}\n" +
   ".co-it-v{white-space:nowrap}\n" +
   ".co-a{align-self:flex-start;"],
];
for (let [a, b] of P) {
  if (s.split(undo ? b : a).length === 1 && s.includes((undo ? b : a).split('\n').join('\r\n'))) {
    a = a.split('\n').join('\r\n'); b = b.split('\n').join('\r\n');
  }
  const [x, y] = undo ? [b, a] : [a, b];
  const n = s.split(x).length - 1;
  if (n !== 1) { console.log('expected once, found ' + n + ':\n' + x.slice(0, 140)); process.exit(1); }
  s = s.replace(x, () => y);
}
fs.writeFileSync(F, s);
console.log(undo ? 'undone' : 'applied');
