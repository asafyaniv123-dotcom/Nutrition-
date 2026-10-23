/* The welcome, option A of review/welcome-type (Asaf, 23 Oct): "WELCOME TO"
 * arcs over Beem like a halo of his own, "Better Me" large under him with
 * "Me" in his amber, the promise beneath. The words come in after him, one
 * line at a time. Placed against Beem's own box on this step (top:15%,
 * 230px), so the arc follows him on any screen height. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`    return '<div class="dr-hi2" dir="ltr" lang="en"><div class="w">Welcome to</div><div class="n">Better Me</div>'+   // i18n-exempt: the English welcome is a decision, see above
      '<p>Get ready to become the best version of yourself.</p></div>'+   // i18n-exempt: same`,
`    return '<svg class="dr-arc" viewBox="0 0 390 160" aria-hidden="true"><defs><path id="dr-arcp" d="M55 145 A140 140 0 0 1 335 145"/></defs>'+
      '<text><textPath href="#dr-arcp" startOffset="50%" text-anchor="middle">WELCOME TO</textPath></text></svg>'+   // i18n-exempt: the English welcome is a decision, see above
      '<div class="dr-hi2 dr-hi3" dir="ltr" lang="en"><div class="n">Better <b>Me</b></div>'+   // i18n-exempt: same
      '<p>Get ready to become the best version of yourself.</p></div>'+   // i18n-exempt: same`);
rep(`.dr-hi2 .l{`, `/* the welcome's words around Beem - option A, 23 Oct */
.dr-arc{position:absolute;left:calc(50% - 195px);top:calc(15% - 30px);width:390px;height:160px;overflow:visible;pointer-events:none;
  opacity:0;animation:drWord .9s cubic-bezier(.2,.8,.3,1) .45s forwards}
.dr-arc text{font-family:inherit;font-size:25px;font-weight:700;letter-spacing:6px;fill:var(--nu-muted)}
.dr-hi3{justify-content:flex-start;padding:calc(15vh + 222px) 0 0}
.dr-hi3 .n{font-size:58px;letter-spacing:-1.6px;margin:0 0 12px;opacity:0;animation:drWord .9s cubic-bezier(.2,.8,.3,1) .85s forwards}
.dr-hi3 .n b{color:#b0782e;font-weight:800}
.dr-hi3 p{font-size:17px;opacity:0;animation:drWord .9s cubic-bezier(.2,.8,.3,1) 1.25s forwards}
@keyframes drWord{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.dr-arc,.dr-hi3 .n,.dr-hi3 p{animation:none;opacity:1}}
.dr-hi2 .l{`);
fs.writeFileSync(F, s);
console.log('patched');
