/* Two from the phone (Asaf, 24 Oct):
 *  1. the exercise picker's "by muscle / by equipment" was not in the
 *     material - an ink-filled tab beside a cream one. It is the segmented
 *     control the tracking tabs already are: a pressed trough, the chosen one
 *     raised out of it.
 *  2. אימון חדש carried a steps row - "it has nothing to do with there".
 *     Steps live under tracking now. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

rep(`html body.mod-fitness .ex-tab.on,
html body.mod-fitness .ex-go{background:var(--ink);color:var(--white)}`,
`html body.mod-fitness .ex-go{background:var(--ink);color:var(--white)}
/* the two tabs as the segmented control the tracking tabs are: a pressed
   trough, the chosen one raised out of it (24 Oct - it was ink beside cream) */
html body.mod-fitness .ex-tabs{gap:4px;border-radius:16px;padding:4px;background:var(--nu-ground);
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
html body.mod-fitness .ex-tab{background:none;color:var(--nu-muted);border-radius:12px;padding:10px;font-size:13px}
html body.mod-fitness .ex-tab.on{background:var(--nu-ground);color:var(--nu-ink);
  box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}`);

const a = s.indexOf(`  // Steps: the one number that moves every day, workout or not\n`);
const endTok = `'<div style="font-size:15px;color:var(--chev);flex-shrink:0">&#8250;</div></button>';\n`;
const b = s.indexOf(endTok, a);
if (a < 0 || b < 0 || b - a > 2000) { console.log('steps block anchor', a, b); process.exit(1); }
s = s.slice(0, a) + `  /* (steps used to be a row here; it lives under tracking now) */\n` + s.slice(b + endTok.length);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
