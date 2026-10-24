/* review/workout-proto, round three (Asaf, 24 Oct):
 *  - swap the note and the effort: the effort with weight and reps, the note
 *    beside the rest;
 *  - no fixed dock splitting the page - one page that scrolls as one.
 * Sets card: rows, then weight and reps stacked beside the effort wheel, then
 * one "+ log set" button. Below it, one card: the rest beside the note. */
import fs from 'fs';
const F = 'review/workout-proto/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };

rep(`      <div class="entry">
        <div class="f press"><span>ק״ג</span><input id="kw" inputmode="decimal"><div class="pm"><button class="raise" onclick="step('kw',-2.5)">−</button><button class="raise" onclick="step('kw',2.5)">+</button></div></div>
        <div class="f press"><span>חזרות</span><input id="kr" inputmode="numeric"><div class="pm"><button class="raise" onclick="step('kr',-1)">−</button><button class="raise" onclick="step('kr',1)">+</button></div></div>
        <button class="raise seam add" id="addb" onclick="logSet()">+</button>
      </div>
      <input class="note press" id="note" placeholder="✎ הערה על התרגיל">
    </div>
  </div>
  <div class="dock">
    <div class="two">
      <div>`, `      <div class="entry2">
        <div class="nums">
          <div class="f press"><span>ק״ג</span><input id="kw" inputmode="decimal"><div class="pm"><button class="raise" onclick="step('kw',-2.5)">−</button><button class="raise" onclick="step('kw',2.5)">+</button></div></div>
          <div class="f press"><span>חזרות</span><input id="kr" inputmode="numeric"><div class="pm"><button class="raise" onclick="step('kr',-1)">−</button><button class="raise" onclick="step('kr',1)">+</button></div></div>
        </div>
        <div><div class="lab" style="margin-bottom:6px;text-align:center">איך הרגיש הסט</div><div class="ew press tall" id="ew"></div></div>
      </div>
      <button class="raise seam logb" id="addb" onclick="logSet()">+ רשום סט</button>
    </div>
    <div class="card">
    <div class="two">
      <div>`);
rep(`      <div><div class="lab" style="margin-bottom:6px">איך הרגיש הסט</div><div class="ew press" id="ew"></div></div>
    </div>
  </div>`, `      <div><div class="lab" style="margin-bottom:6px">הערה על התרגיל</div><textarea class="note press" id="note" placeholder="למשל: מושב בגובה 4, אחיזה רחבה"></textarea></div>
    </div>
    </div>
  </div>`);
/* the page scrolls as one: the screen holds the card that was the dock */
rep(`.dock{position:absolute;left:12px;right:12px;bottom:84px;z-index:5;border-radius:22px;padding:12px;background:var(--g);
  box-shadow:-4px -4px 10px var(--lit),0 -6px 18px rgba(120,100,80,.18)}
.dock .two{`, `.two{`);
rep(`.scr{position:absolute;inset:0;overflow-y:auto;padding:0 16px 330px;`, `.scr{position:absolute;inset:0;overflow-y:auto;padding:0 16px 100px;`);
rep(`.note{border-radius:14px;padding:11px 12px;font-size:13.5px;color:var(--mu);font-weight:600;margin-top:12px;width:100%;border:none;font-family:inherit;text-align:start;background:var(--g);outline:none}`,
`.note{border-radius:14px;padding:11px 12px;font-size:14px;color:var(--ink);font-weight:600;width:100%;height:138px;border:none;font-family:inherit;text-align:start;background:var(--g);outline:none;resize:none;line-height:1.45}
.note::placeholder{color:#8f877d}
.entry2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;align-items:start}
.nums{display:grid;gap:8px}
.ew.tall{height:180px}.ew.tall .col{height:180px;padding:72px 0}.ew.tall .win{top:72px}
.logb{width:100%;border-radius:16px;padding:14px;font-size:16.5px;font-weight:800;margin-top:12px}`);
/* the button reads as what it does; the edit state still says ✓ */
rep(`  document.getElementById('addb').textContent=sel>=0?'✓':'+';`, `  document.getElementById('addb').textContent=sel>=0?'✓ שמור את הסט':'+ רשום סט '+(ex().sets.length+1);`);
rep(`document.getElementById('addb').textContent='✓';toast('שנה ולחץ ✓');}`, `document.getElementById('addb').textContent='✓ שמור את הסט';toast('שנה ולחץ שמור');}`);
/* the note belongs to the exercise */
rep(`function go(i){W.cur=i;`, `function go(i){ex().note=document.getElementById('note').value;W.cur=i;document.getElementById('note').value=W.ex[i].note||'';`);
rep(`    <li>המנוחה: גלגלת עם כל האפשרויות, מכבוי ועד 3 דקות.</li>`, `    <li>המנוחה: גלגלת עם כל האפשרויות, מכבוי ועד 3 דקות, וליד המנוחה ההערה על התרגיל.</li>
    <li>דרגת הקושי ליד המשקל והחזרות, וכפתור אחד "רשום סט".</li>
    <li>עמוד אחד שנגלל כולו, בלי מגירה קבועה באמצע.</li>`);
fs.writeFileSync(F, s);
console.log('patched');
