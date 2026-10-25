/* tubes prototype, round 2 (Asaf: "I loved A. Give three more options for
 * it, less glowing but still a sense of beauty and dimension").
 * A stays as it was, for comparison; three quieter versions of it, none with
 * a halo leaving the channel - the depth comes from the shape of the light
 * inside instead:
 *  A1 glass rod - a cylinder: the edges a shade deeper, a narrow sheen down
 *     one side, the surface a slightly lighter lens. No bloom at all.
 *  A2 satin     - a soft matte fill, rounded at the top like a meniscus, the
 *     depth from a faint inner shading at the walls.
 *  A3 pearl     - pale and even, one soft specular light near the top, the
 *     colour deepening only a little toward the bottom. */
import fs from 'fs';
const F = 'review/tubes-proto/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR ' + a.slice(0, 60)); process.exit(1); } s = s.replace(a, () => b); };
rep(`/* B - a living surface */`, `/* A1 - glass rod: a cylinder, no bloom */
.A1 .fill{background:
    linear-gradient(90deg,rgba(0,0,0,.07) 0%,rgba(255,255,255,0) 22%,rgba(255,255,255,.38) 34%,rgba(255,255,255,0) 50%,rgba(0,0,0,.05) 82%,rgba(0,0,0,.11) 100%),
    linear-gradient(0deg,var(--deep) 0%,var(--c) 60%,var(--hi) 100%)}
.A1 .fill::before{content:"";position:absolute;left:2px;right:2px;top:0;height:7px;border-radius:50%;
  background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,0))}
/* A2 - satin: matte, a meniscus top, shading at the walls */
.A2 .fill{border-radius:15px 15px 15px 15px;background:linear-gradient(0deg,var(--deep) -10%,var(--c) 70%,var(--hi) 115%);
  box-shadow:inset 4px 0 7px -3px rgba(0,0,0,.10),inset -4px 0 7px -3px rgba(0,0,0,.12),inset 0 3px 4px -2px rgba(255,255,255,.7)}
/* A3 - pearl: even and pale, one soft light near the top */
.A3 .fill{background:linear-gradient(0deg,var(--deep) -40%,var(--c) 45%,var(--hi) 100%)}
.A3 .fill::before{content:"";position:absolute;left:6px;top:7px;width:8px;height:22px;border-radius:50%;
  background:radial-gradient(50% 50% at 50% 50%,rgba(255,255,255,.75),rgba(255,255,255,0) 100%)}
.A3 .fill::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:radial-gradient(120% 60% at 30% 0%,rgba(255,255,255,.25),rgba(255,255,255,0) 60%)}
/* B - a living surface */`);
rep(`<button data-v="B" onclick="pick('B')">ב׳ · אור נוזלי</button><button data-v="C" onclick="pick('C')">ג׳ · הארוחה האחרונה זוהרת</button>`,
  `<button data-v="A1" onclick="pick('A1')">א1 · מוט זכוכית</button><button data-v="A2" onclick="pick('A2')">א2 · סאטן</button><button data-v="A3" onclick="pick('A3')">א3 · פנינה</button>`);
rep(`  <p>אותו ערוץ ואותם מספרים, שלושה מילויים בלי קווים בין ארוחות. לחץ "הוסף ארוחה" כדי לראות איך המילוי עולה.</p>`,
  `  <p>א׳ כמו שאהבת, ושלוש גרסאות שקטות שלו: בלי הילה שיוצאת מהצינור, והעומק בא מצורת האור בתוכו. "הוסף ארוחה" מראה איך המילוי עולה.</p>`);
fs.writeFileSync(F, s);
console.log('ok');
