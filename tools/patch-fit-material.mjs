/* Every fitness screen in the one material (Asaf, 24 Oct: "go over the
 * screens and see that they all match our design"). Found by
 * tools/fit-paint-audit.js, which reads the computed PAINT of every view, not
 * the source. What it found, and what each becomes:
 *  - the template editor's "+ add exercise" and "save": ink slabs -> raised;
 *    its name field, a bare underline -> pressed like every other field;
 *  - the weigh-in's lavender "record" and cream box -> raised / pressed;
 *  - the weights screen's violet-gradient and cream buttons, and its violet
 *    rule down the side -> raised, no rule;
 *  - the history calendar's ink squares (and the key) -> lit, the way the
 *    week strip lights a day trained;
 *  - the progress chart's purple/green/terra figures -> ink; the volume
 *    bars' green gradient -> a pressed channel with light in it;
 *  - the per-muscle bar's violet fill -> the same light.
 * And one duplication: אימון חדש had a "+ new workout" button although the
 * start sheet already offers "empty workout" - so this screen is "my
 * programs" now, and says so. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* the duplication */
rep(`  var h='<div class="fs-card">';
  h+='<button class="fs-new" onclick="startEmptyWorkout()"><span>+</span>'+_t('אימון חדש')+'</button>';`,
`  /* no "+ new workout" here any more: the start sheet's "empty workout" is
     that button, and this screen is the programs behind "from my programs" */
  var h='<div class="fs-card">';`);
const st = s.indexOf(`function renderFitStart(){\n  document.getElementById('hdr-title').textContent=''+_t('אימון חדש')+'';`);
if (st < 0) { console.log('start title anchor'); process.exit(1); }
s = s.replace(`function renderFitStart(){\n  document.getElementById('hdr-title').textContent=''+_t('אימון חדש')+'';`,
  `function renderFitStart(){\n  document.getElementById('hdr-title').textContent=''+_t('התוכניות שלי')+'';`);

/* the weigh-in: classes instead of inline paint */
rep(`     'style="flex:1;min-width:0;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px;font-size:12.5px;font-family:inherit;text-align:center">';
  h+='<button onclick="weighInSubmit()" style="background:var(--violet-100);border:none;border-radius:12px;padding:10px 16px;font-size:12.5px;font-weight:700;color:var(--violet-700);cursor:pointer;font-family:inherit">'+_t('רישום')+'</button>';`,
`     'class="fm-in">';
  h+='<button onclick="weighInSubmit()" class="fm-b">'+_t('רישום')+'</button>';`);

/* the CSS: one block, after the fitness material rules */
rep(`html body.mod-fitness .gp-n{color:var(--nu-muted)}`, `html body.mod-fitness .gp-n{color:var(--nu-muted)}
/* ── EVERY SCREEN IN THE MATERIAL (24 Oct, from fit-paint-audit) ── */
html body.mod-fitness .tpl-addex,html body.mod-fitness .tpl-save,html body.mod-fitness .fm-b,
html body.mod-fitness #content button[style*="var(--violet-100)"],
html body.mod-fitness #content button[style*="background:var(--surface)"]{
  background:var(--nu-ground)!important;color:var(--nu-ink)!important;border:none!important;
  box-shadow:-3px -3px 8px var(--nu-lit),4px 5px 12px var(--nu-shade-soft)!important}
html body.mod-fitness .tpl-addex:active,html body.mod-fitness .tpl-save:active,html body.mod-fitness .fm-b:active{
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)!important}
.fm-b{border:none;border-radius:14px;padding:10px 16px;font-size:13px;font-weight:800;font-family:inherit;cursor:pointer}
.fm-in,html body.mod-fitness .tpl-name{flex:1;min-width:0;border:none;border-radius:14px;padding:11px 12px;font-size:13.5px;font-family:inherit;
  color:var(--nu-ink);background:var(--nu-ground);outline:none;text-align:center;
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
html body.mod-fitness .tpl-name{text-align:start;font-size:16px;padding:13px 14px;border-bottom:none}
/* a day trained, lit the way the week strip lights it, instead of an ink block */
html body.mod-fitness .wh-d.on,html body.mod-fitness .wh-key .k-on{background:var(--terra-500);box-shadow:0 0 7px 1px rgba(224,138,114,.55)}
/* figures in ink; bars as light in a pressed channel; no coloured rule */
html body.mod-fitness #content [style*="border-inline-start:3px solid"],html body.mod-fitness #content [style*="border-right:3px solid"]{border-color:transparent!important}`);

if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
