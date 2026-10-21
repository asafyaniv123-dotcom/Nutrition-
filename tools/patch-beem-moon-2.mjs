/* The night page, measured: the day card underneath went dark with it and
 * its date sank to near-invisible while its bars stayed white. The card is
 * paper - it keeps the day's tokens on the night page. And the streak line
 * reads var(--ink), which the night does not touch. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const a = `html body.mod-endofday .app{transition:background-color 2.6s ease}`;
if (s.split(a).length !== 2) { console.log('anchor'); process.exit(1); }
s = s.replace(a, a + EOL + `html body.mod-endofday.rf-night .rfd-stage{--nu-ground:#e9e7e3;--nu-lit:rgba(255,255,255,.95);
  --nu-shade:rgba(176,168,156,.44);--nu-shade-soft:rgba(176,168,156,.28);--nu-ink:#4a453f;--nu-muted:#6d675e}
html body.mod-endofday.rf-night .rf-streak{color:var(--nu-ink)}`.replace(/\n/g, EOL));
fs.writeFileSync(F, s); console.log('patched');
