/* chat prototype, round 2 (Asaf: "I loved the glass. Make it softer and more
 * precise"). B only, and B opens first.
 * Softer: the field of light is paler and wider, the shadows are a hair and a
 * haze instead of a drop, the type is a weight lighter, the icons' light is
 * a breath, not a halo.
 * Precise: one edge for every piece of glass - a half-pixel white rim and a
 * one-pixel highlight on top - one radius family (20 / 999), one height for
 * the tiles, the same glass for tiles, suggestions, the writing line, its
 * buttons and the area standing at the top, which keeps a faint pool of its
 * own colour under it. A press sinks the glass rather than greying it. */
import fs from 'fs';
const F = 'review/chat-proto/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR ' + a.slice(0, 60)); process.exit(1); } s = s.replace(a, () => b); };
const a = s.indexOf('/* B - glass over a field');
const b = s.indexOf('</style>');
if (a < 0 || b < 0) { console.log('css anchors'); process.exit(1); }
s = s.slice(0, a) + `/* B - glass over a field of the areas' own light, two rows */
.B{--glass:rgba(255,255,255,.46);--rim:inset 0 0 0 .5px rgba(255,255,255,.75),inset 0 1px 0 rgba(255,255,255,.95);
  --haze:0 1px 2px rgba(110,92,72,.05),0 10px 26px -6px rgba(110,92,72,.12)}
.B .dock::before{content:"";position:absolute;left:-14%;right:-14%;bottom:30px;height:250px;z-index:-1;filter:blur(46px);opacity:.6;
  transition:opacity .6s,height .6s;
  background:radial-gradient(30% 42% at 12% 42%,rgba(166,144,207,.38),transparent),radial-gradient(28% 44% at 38% 32%,rgba(224,138,114,.32),transparent),
    radial-gradient(28% 42% at 62% 44%,rgba(111,178,131,.32),transparent),radial-gradient(30% 44% at 88% 36%,rgba(58,124,165,.28),transparent),
    radial-gradient(44% 32% at 50% 82%,rgba(240,169,46,.22),transparent)}
.B.picked .dock::before{opacity:.22;height:120px}
.B .glass,.B .ar,.B .in,.B .rb,.B .sug button{background:var(--glass);backdrop-filter:blur(22px) saturate(1.25);-webkit-backdrop-filter:blur(22px) saturate(1.25);
  box-shadow:var(--rim),var(--haze)}
.B .areas{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:0 16px 14px}
.B .ar{justify-content:center;flex-direction:column;gap:5px;height:66px;padding:0 4px;border-radius:20px;
  font:700 12.5px Assistant,sans-serif;color:#5a544c;letter-spacing:.1px;transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .3s,background .2s}
.B .ar svg{width:20px;height:20px;stroke-width:1.7;filter:drop-shadow(0 0 2.5px color-mix(in srgb,var(--c) 45%,transparent))}
.B .ar:active{transform:scale(.97);background:rgba(255,255,255,.3)}
.B .ar.top{flex-direction:row;height:42px;padding:0 14px 0 12px;font-size:14.5px;gap:8px;border-radius:999px;color:var(--ink)}
.B .ar.top::before{content:"";position:absolute;inset:6px 10px -10px;z-index:-1;border-radius:999px;filter:blur(14px);background:color-mix(in srgb,var(--c) 30%,transparent)}
.B .ar.top{position:relative}
.B .ar.top::after{font-weight:600;color:#8f877d}
.B .sug{gap:8px;padding:0 16px 12px}
.B .sug button{color:#5a544c;font-weight:700;padding:8px 14px}
.B .in{height:54px;color:var(--ink)}
.B .in::placeholder{color:#9a9188}
.B .rb{width:50px;height:50px;color:#5a544c}
.B .rb:active{transform:scale(.96);background:rgba(255,255,255,.3)}
.B .me{background:var(--glass);box-shadow:var(--rim),var(--haze);font-weight:600}
.B .logged{background:rgba(255,255,255,.3);box-shadow:var(--rim),0 1px 2px rgba(110,92,72,.04)}
.B .logged .ic{background:var(--glass);box-shadow:var(--rim)}
.B .mode{background:rgba(255,255,255,.28);box-shadow:var(--rim),inset 1px 2px 5px rgba(110,92,72,.1)}
.B .mode button.on{background:var(--glass);box-shadow:var(--rim),var(--haze)}
` + s.slice(b);
/* B first */
rep(`<button id="bA" class="on" onclick="pick('A')">א׳ · החומר שלנו</button><button id="bB" onclick="pick('B')">ב׳ · זכוכית</button>`,
  `<button id="bB" class="on" onclick="pick('B')">זכוכית, רכה יותר</button><button id="bA" onclick="pick('A')">א׳ · החומר שלנו (לשם השוואה)</button>`);
rep(`<div class="wrap"><div class="ph A" id="ph">`, `<div class="wrap"><div class="ph B" id="ph">`);
fs.writeFileSync(F, s);
console.log('ok');
