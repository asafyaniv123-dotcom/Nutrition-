/* The evening's "what else to add to today" cards in the material (Asaf,
 * 25 Oct: "the end-of-day questions don't match the design either").
 * Each card was a pastel wash of its own colour, and an answered one wore a
 * green outline - paint, and a coloured seam. Now every card is the one
 * ground, raised; its colour lives only in its icon, as light; an answered
 * card is pressed into the ground, its icon lit a little brighter, and a
 * small pressed disc holds a check drawn in light. Type a step larger, so
 * the subtitle is readable. The board's markup is unchanged. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`html body.mod-endofday .rf-card-s{color:var(--nu-muted)}`, `html body.mod-endofday .rf-card-s{color:var(--nu-muted)}
/* one ground, raised; the colour only in the icon, as light (25.10) */
html body.mod-endofday .rf-card{background:var(--nu-ground)!important;border:none;padding:18px 12px 16px;
  box-shadow:-5px -5px 12px var(--nu-lit),6px 7px 15px var(--nu-shade-soft)}
html body.mod-endofday .rf-card:active{transform:none;box-shadow:inset 3px 4px 8px var(--nu-shade),inset -3px -3px 7px var(--nu-lit)}
html body.mod-endofday .rf-card .rf-card-ic{width:44px;height:44px;border-radius:50%}
html body.mod-endofday .rf-card .rf-card-ic svg{width:22px;height:22px;filter:drop-shadow(0 0 3px currentColor)}
html body.mod-endofday .rf-card-t{font-size:15px}
html body.mod-endofday .rf-card-s{font-size:12px}
html body.mod-endofday .rf-card.done{border:none;box-shadow:inset 5px 6px 12px var(--nu-shade),inset -4px -4px 10px var(--nu-lit)}
html body.mod-endofday .rf-card.done .rf-card-ic{box-shadow:inset 2px 3px 5px var(--nu-shade),inset -2px -2px 4px var(--nu-lit)}
html body.mod-endofday .rf-card.done .rf-card-ic svg{filter:drop-shadow(0 0 5px currentColor)}
html body.mod-endofday .rf-card .rf-card-v{width:22px;height:22px;top:10px;inset-inline-end:10px;border-radius:50%;font-size:12px;color:#336843;
  text-shadow:0 0 6px rgba(111,178,131,.7);box-shadow:inset 1px 2px 4px var(--nu-shade),inset -1px -1px 3px var(--nu-lit)}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
