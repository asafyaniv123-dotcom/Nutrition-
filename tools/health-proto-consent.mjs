/* Health prototype (Asaf, 25 Oct: "legally, if something happens, nobody
   should be able to say the app told me - it is only a recommendation"):
   before any condition can be chosen, the person confirms - in their own tap,
   with the date kept - that what follows is general information from medical
   bodies and not medical advice, that it does not replace their doctor, and
   that they decide what to do. The same words sit under every change and in
   every coach answer about health. Not legal advice; the final text and the
   terms of use should be read by a lawyer. */
import fs from 'fs';
const F = 'review/health-proto/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR', a.slice(0, 60)); process.exit(1); } s = s.replace(a, b); };
rep(`var S=JSON.parse(localStorage.getItem('health_proto')||'{"on":[],"coach":true,"off":[]}');`,
    `var S=JSON.parse(localStorage.getItem('health_proto')||'{"on":[],"coach":true,"off":[],"ack":""}');`);
rep(`<div class="lab">אפשר לבחור כמה</div><div class="chips">';`,
`<div class="lab">לפני שבוחרים</div><label class="ack"><input type="checkbox" '+(S.ack?'checked':'')+' onchange="S.ack=this.checked?new Date().toISOString().slice(0,10):\\'\\';if(!S.ack){S.on=[];}save()"><span>'+
  'אני מבין/ה ש<b>זה מידע כללי ולא ייעוץ רפואי</b>. ההתאמות מבוססות על המלצות של גופים רפואיים, אבל הן לא מותאמות אישית, לא מחליפות רופא, ואני זה/זו שמחליט/ה מה לעשות. לפני שינוי בפעילות או בתזונה אתייעץ עם הרופא שלי.</span></label>'+
  (S.ack?'<div class="ackd">אושר ב־'+S.ack+'</div>':'')+'<div class="lab" style="margin-top:14px">אפשר לבחור כמה</div><div class="chips'+(S.ack?'':' off')+'">';`);
rep(`function tg(id){`, `function tg(id){if(!S.ack)return;`);
rep(`.priv{display:flex;`, `.ack{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:1.6;color:var(--ink);cursor:pointer;margin-bottom:4px}
.ack input{flex:none;width:22px;height:22px;margin-top:2px;accent-color:#3f7a52}
.ackd{font-size:12px;color:var(--mu);font-weight:700;margin:2px 32px 0 0}
.chips.off{opacity:.4;pointer-events:none}
.priv{display:flex;`);
/* the line under every list of changes says the same */
rep(`'<div class="doc">אלה המלצות כלליות של גופים רפואיים, לא הנחיה אישית. הרופא שלך מכיר אותך, והוא זה שקובע.</div>'`,
    `'<div class="doc">מידע כללי ולא ייעוץ רפואי. אלה המלצות של גופים רפואיים, לא הנחיה אישית. הרופא שלך מכיר אותך, והוא זה שקובע.</div>'`);
rep(`<span class="nd">אני לא רופא. כדאי לבדוק עם הרופא שלך מה מתאים לך.</span>':'')+'</div>';
  h+='<div class="msg me">כמה`, `<span class="nd">אני לא רופא, וזה מידע כללי ולא ייעוץ רפואי. כדאי לבדוק עם הרופא שלך מה מתאים לך.</span>':'')+'</div>';
  h+='<div class="msg me">כמה`);
rep(`(S.coach&&has('dm')?'<span class="nd">אני לא רופא. כדאי לבדוק עם הרופא שלך מה מתאים לך.</span>':'')`,
    `(S.coach&&has('dm')?'<span class="nd">אני לא רופא, וזה מידע כללי ולא ייעוץ רפואי. כדאי לבדוק עם הרופא שלך מה מתאים לך.</span>':'')`);
fs.writeFileSync(F, s);
console.log('ok');
