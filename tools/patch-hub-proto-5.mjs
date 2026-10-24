/* review/fit-hub-proto, round five (Asaf, 24 Oct): the two doors side by side
 * as in A (stopwatch and timers, liked), and under them the tracking card as
 * in B - he liked that it shows what is inside. One layout, no switcher. */
import fs from 'fs';
const F = 'review/fit-hub-proto/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };

rep(`<div class="sw" id="sw"><button class="on" data-v="a">א׳ · שלוש דלתות בשורה</button><button data-v="b">ב׳ · רשימה וכרטיס מעקב</button></div></div>`, `</div>`);
rep(`<h1>מסך הכושר: שלוש דלתות</h1>`, `<h1>מסך הכושר: הגרסה המשולבת</h1>`);
rep(`<p>"אימון שנבנה לך" נכנס לתוך "התחל אימון", והלוז קומפקטי: שורה לכל יום. לחץ על כרטיס האימון, על השבוע ועל "מעקב".</p>`,
    `<p>שתי הדלתות בשורה כמו בא׳, ומתחתן כרטיס המעקב מב׳. לחץ על כרטיס האימון, על השבוע ועל כרטיס המעקב.</p>`);
/* A keeps the row, now of two, and gets B's card under it */
rep(`      <div class="big3" id="a3"></div>`, `      <div class="big3 two" id="a3"></div>
      <div class="trk raise" onclick="trkOpen('w')" style="margin-top:12px"><div class="trk-h"><span>מעקב</span><em>הכול ‹</em></div>
        <div class="trk-g"><div><b>3</b><span>אימונים השבוע</span></div><div><b>6,240</b><span>צעדים היום</span></div><div><b>72.5</b><span>שיא בלחיצת חזה</span></div></div></div>`);
rep(`document.getElementById('a3').innerHTML=['tmr','vid','trk'].map(big).join('');`, `document.getElementById('a3').innerHTML=['tmr','vid'].map(big).join('');`);
rep(`.big3 button{`, `.big3.two{grid-template-columns:1fr 1fr}
.big3 button{`);
rep(`    <li><b>א׳:</b> שלוש דלתות בשורה: סטופר וטיימרים, אימונים שאהבתי, מעקב.</li>
    <li><b>ב׳:</b> "להתאמן" כרשימה של שתיים, ו"לעקוב" ככרטיס אחד עם שלושה מספרים במבט.</li>`,
`    <li><b>הסידור:</b> סטופר וטיימרים ואימונים שאהבתי כשתי דלתות בשורה, ומתחתן כרטיס המעקב עם שלושה מספרים במבט: אימונים השבוע, צעדים היום, שיא אחרון.</li>`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('patched');
