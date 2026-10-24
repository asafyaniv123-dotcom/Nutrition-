/* Fitness, one material (Asaf, 24 Oct: "not the app's design"). Walking every
 * fitness screen found two leftovers of the old look:
 *  - a DARK FILL for actions (start, stopwatch, add a set, start the timer,
 *    save, + add exercise) and for the current exercise tab - several written
 *    inline as background:var(--cta-fill), which no class rule can reach
 *    without !important;
 *  - GREEN OUTLINED chips for a selection (muscles, equipment) and the dark
 *    selected timer mode.
 * Actions become raised with the area's terracotta seam, as the start button
 * and the welcome already are; a selection is pressed in, as everywhere else. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const a = `html body.mod-fitness .tm-start{background:var(--cta-fill);color:var(--white)}`;
if (s.split(a).length !== 2) { console.log('anchor'); process.exit(1); }
s = s.replace(a, a + EOL + `/* ── FITNESS, ONE MATERIAL (24 Oct) ── actions raised with the seam,
   selections pressed in. !important only because several of these buttons
   carry their old dark fill inline. */
html body.mod-fitness #content button[style*="var(--cta-fill)"],
html body.mod-fitness .fw-rb.go,html body.mod-fitness .fw-add,html body.mod-fitness .tm-start,html body.mod-fitness .ex-go{
  background:var(--nu-ground)!important;color:var(--nu-ink)!important;border:none!important;
  box-shadow:-3px -3px 8px var(--nu-lit),4px 5px 12px var(--nu-shade-soft),inset 0 -3px 0 color-mix(in srgb,var(--terra-500) 60%,transparent)!important}
html body.mod-fitness .tm-k.on,html body.mod-fitness .gn-m.on,html body.mod-fitness .gn-e.on{
  background:var(--nu-ground)!important;color:var(--nu-ink)!important;border-color:transparent!important;
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)!important}`.replace(/\n/g, EOL));
fs.writeFileSync(F, s);
console.log('patched');
/* and the unchosen raised, so a pressed choice reads at a glance */
{ let t = fs.readFileSync(F, 'utf8');
  const b = `html body.mod-fitness .tm-k.on,html body.mod-fitness .gn-m.on,html body.mod-fitness .gn-e.on{`;
  if (t.split(b).length !== 2) { console.log('anchor2'); process.exit(1); }
  t = t.replace(b, `html body.mod-fitness .gn-m:not(.on),html body.mod-fitness .gn-e:not(.on){background:var(--nu-ground);border-color:transparent;color:var(--nu-muted);
  box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}` + EOL + b);
  fs.writeFileSync(F, t); console.log('patched unchosen'); }
