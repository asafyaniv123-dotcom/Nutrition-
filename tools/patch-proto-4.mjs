/* review/workout-proto, round four (Asaf, 24 Oct): keep − and + on the reps;
 * the weight is typed by hand - nobody knows which plates a gym has, and a
 * fixed step there gets in the way. The weight box takes the room the
 * buttons left, a big field that opens the number pad. */
import fs from 'fs';
const F = 'review/workout-proto/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`<div class="f press"><span>ק״ג</span><input id="kw" inputmode="decimal"><div class="pm"><button class="raise" onclick="step('kw',-2.5)">−</button><button class="raise" onclick="step('kw',2.5)">+</button></div></div>`,
    `<label class="f press fw"><span>ק״ג</span><input id="kw" type="text" inputmode="decimal" enterkeyhint="done" onfocus="this.select()"><em>הקלדה</em></label>`);
rep(`.nums{display:grid;gap:8px}`, `.nums{display:grid;gap:8px}
/* the weight: typed, not stepped - a big field that opens the number pad */
.f.fw{display:block;cursor:text}
.f.fw input{font-size:30px;padding:6px 0 2px}
.f.fw em{display:block;font-style:normal;font-size:11.5px;font-weight:700;color:#a1978b}`);
rep(`    <li>דרגת הקושי ליד המשקל והחזרות, וכפתור אחד "רשום סט".</li>`, `    <li>דרגת הקושי ליד המשקל והחזרות, וכפתור אחד "רשום סט".</li>
    <li>המשקל מוקלד ידנית, והחזרות נשארות עם − ו־+.</li>`);
fs.writeFileSync(F, s); console.log('patched');
