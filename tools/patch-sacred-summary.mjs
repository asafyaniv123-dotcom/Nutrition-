/* "The day's summary card should be sacred" (Asaf, 31 Oct).
 * 1. The journal's prompt question ("מה עובר לך בראש היום?"), put on the page
 *    by 'לדף', is the app's sentence, not hers - the summary shows only what
 *    she wrote. Matched in the reader's language AND as the Hebrew key, so a
 *    page written while the app was in another language is cleaned too.
 * 2. Nutrition appears only when something was logged: four empty tubes
 *    reading 0 are not a fact about the day.
 *
 *   node tools/patch-sacred-summary.mjs [--undo]
 */
import fs from 'fs';
const F = 'dev/index.html', undo = process.argv.includes('--undo');
let s = fs.readFileSync(F, 'utf8');
const P = [
  // the questions, as data: one list both the page and the summary read
  ["var _jbSi=0,_jbSearch=false;",
   "var _jbSi=0,_jbSearch=false;\n" +
   "/* every question the page can offer, in any notebook: a line that is one of\n" +
   "   these is the app's prompt, not her writing */\n" +
   "var JB_SPARK_KEYS=['מה עובר לך בראש היום?','מה הצחיק אותך היום?','מה היה הרגע הכי טוב היום?','מה היית רוצה לזכור מהיום הזה?',\n" +
   "  'על מה אתה מודה היום?','מי עשה לך טוב השבוע?','איזה דבר קטן שימח אותך היום?','מה חלמת הלילה?','איזה רעיון לא עוזב אותך?',\n" +
   "  'מה היית רוצה להגיד לעצמך בעוד שנה?'];   // i18n-exempt: keys, compared - shown only through _t in jbSparks\n" +
   "function jrnlOwnLines(t){\n" +
   "  var ask={},i;for(i=0;i<JB_SPARK_KEYS.length;i++){ask[JB_SPARK_KEYS[i]]=1;ask[_t(JB_SPARK_KEYS[i]).trim()]=1;}\n" +
   "  return String(t||'').split('\\n').filter(function(l){l=l.trim();return l&&!ask[l];});\n" +
   "}"],
  ["  if(jrnl&&jrnl.trim()){\n    var lines=jrnl.split('\\n'),jh='';\n    for(i=0;i<lines.length;i++)if(lines[i].trim())jh+='<p>'+esc(lines[i])+'</p>';",
   "  if(jrnl&&jrnl.trim()){\n    var lines=jrnlOwnLines(jrnl),jh='';\n    for(i=0;i<lines.length;i++)jh+='<p>'+esc(lines[i])+'</p>';"],
  ["  if(sum.kcal!==undefined&&sumSecOn('food')){",
   "  /* only a day something was eaten or drunk on: zeros are not a fact about it */\n" +
   "  if(sum.kcal!==undefined&&(sum.kcal>0||sum.water>0)&&sumSecOn('food')){"],
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
