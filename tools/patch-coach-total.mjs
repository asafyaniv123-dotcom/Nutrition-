/* A meal total under the coach's rows (Asaf, 1 Nov):
 *   "סה״כ הארוחה: 294 קק״ל · 22 ג' חלבון · 30 ג' פחמימות · 8 ג' שומן"
 * - from the rows of THAT reply only, read from the day as they stand now, so a
 *   correction or a deletion moves it too;
 * - only with 2 rows or more (with one it would repeat the row);
 * - summed from the rounded figures the rows show, so it is exactly their sum.
 *
 *   node tools/patch-coach-total.mjs [--undo]
 */
import fs from 'fs';
const F = 'dev/index.html', undo = process.argv.includes('--undo');
let s = fs.readFileSync(F, 'utf8');
const P = [
  ["  var day=loadDay(d||todayStr()),h='',i,j,m;\n  for(j=0;j<ids.length;j++)for(i=0;i<day.meals.length;i++){m=day.meals[i];\n    if(String(m.id)!==String(ids[j]))continue;",
   "  var day=loadDay(d||todayStr()),h='',i,j,m,n=0,T={k:0,p:0,c:0,f:0};\n  for(j=0;j<ids.length;j++)for(i=0;i<day.meals.length;i++){m=day.meals[i];\n    if(String(m.id)!==String(ids[j]))continue;\n" +
   "    n++;T.k+=Math.round(m.kcal||0);T.p+=Math.round(m.p||0);T.c+=Math.round(m.c||0);T.f+=Math.round(m.f||0);"],
  ["  return h?'<div class=\"co-its\">'+h+'</div>':'';\n}",
   "  /* the meal as one line, from the rows above it - with one row it would only repeat it */\n" +
   "  if(n>=2)h+='<div class=\"co-it co-it-sum\">'+_t('סה״כ הארוחה: {v}',{v:[_t('{n} קק\"ל',{n:T.k}),_t('{n} גרם חלבון',{n:T.p}),\n" +
   "    _t('{n} גרם פחמימה',{n:T.c}),_t('{n} גרם שומן',{n:T.f})].join(' \\u00b7 ')})+'</div>';\n" +
   "  return h?'<div class=\"co-its\">'+h+'</div>':'';\n}"],
  [".co-it-v{white-space:nowrap}",
   ".co-it-v{white-space:nowrap}\n.co-it-sum{margin-top:2px;padding-top:5px;border-top:1px solid var(--nu-line,rgba(120,100,80,.16));color:var(--nu-ink,#4a453f);font-weight:700}"],
];
for (let [a, b] of P) {
  if (s.split(undo ? b : a).length === 1 && s.includes((undo ? b : a).split('\n').join('\r\n'))) {
    a = a.split('\n').join('\r\n'); b = b.split('\n').join('\r\n');
  }
  const [x, y] = undo ? [b, a] : [a, b];
  const c = s.split(x).length - 1;
  if (c !== 1) { console.log('expected once, found ' + c + ':\n' + x.slice(0, 160)); process.exit(1); }
  s = s.replace(x, () => y);
}
fs.writeFileSync(F, s);
console.log(undo ? 'undone' : 'applied');
