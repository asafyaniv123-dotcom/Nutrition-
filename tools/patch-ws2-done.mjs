/* "I liked the green after a set is done - but in our design: another green,
 * and a fine button, not a cheap one" (Asaf, 24 Oct). The flat mint fill
 * becomes the material's own idiom: the done exercise is PRESSED in, with a
 * soft sage light inside the channel and a small check in a deep green; the
 * name stays ink. The same green is used for a set already written. */
import fs from 'fs';
const F = 'review/workout-screen-2/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b, all) => { const n = s.split(a).length - 1; if (!n || (!all && n !== 1)) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 60)); process.exit(1); } s = s.split(a).join(b); };
rep(`.chips button.dn::before{content:"✓ ";color:var(--t7)}`,
`/* a finished exercise: pressed in, a sage light inside the channel, a deep
   green check - the material's way of saying done */
.chips button.dn{color:var(--ink);background:radial-gradient(120% 140% at 50% 120%,rgba(143,199,158,.42),rgba(143,199,158,.12) 55%,var(--g) 85%);
  box-shadow:inset 2px 3px 6px var(--sh),inset -2px -2px 5px var(--lit),inset 0 0 0 1px rgba(111,178,131,.18)}
.chips button.dn::before{content:"";display:inline-block;width:16px;height:16px;margin-inline-end:6px;vertical-align:-3px;border-radius:50%;
  background:#3f7a52 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 12.5 4 4 8-9'/%3E%3C/svg%3E") center/11px no-repeat;
  box-shadow:0 1px 2px rgba(40,80,50,.3)}
/* a set already written: the same sage light, the same check */
.sets .now.ok{background:radial-gradient(120% 160% at 50% 120%,rgba(143,199,158,.36),rgba(143,199,158,.1) 55%,var(--g) 85%)}
.sets .now.ok::before{content:"✓ ";color:#3f7a52}`);
rep(`<div class="chips"><button class="raise press on">לחיצת חזה במוט</button>`,
    `<div class="chips"><button class="raise dn">מתח במכונת סיוע</button><button class="raise dn">פרפר במכונה</button><button class="raise press on">לחיצת חזה במוט</button>`, true);
rep(`<button class="raise">מתח במכונת סיוע</button><button class="raise">+</button></div>`, `<button class="raise">+</button></div>`, true);
rep(`    <li><b>צבע לכל דרגת קושי:</b>`, `    <li><b>תרגיל שהסתיים:</b> נשאר ירוק, אבל בחומר של האפליקציה. הכפתור שקוע פנימה, יש בתוכו אור ירוק־מרווה רך, ולידו עיגול ירוק עמוק עם וי. השם נשאר כהה. אותו ירוק מסמן גם סט שכבר נרשם.</li>
    <li><b>צבע לכל דרגת קושי:</b>`);
fs.writeFileSync(F, s);
console.log('patched');
