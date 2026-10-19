/* Home screen, direction ב (chosen 19 Oct 2026): סיום יום at the centre.
 *   node tools/patch-home-b.mjs            apply to dev/index.html
 *   node tools/patch-home-b.mjs --reverse  undo, byte for byte
 * Every replacement must match exactly once, or nothing is written. */
import fs from 'fs';
const F = 'dev/index.html';
const REV = process.argv.includes('--reverse');
let s = fs.readFileSync(F, 'utf8');

const EDITS = [
  /* 1. the wordmark and the slogan leave the home screen - the tab bar already
        spells the name - and the duplicate date under the tab bar goes with
        them. The streak gets its own slot, under the board, before the dev
        strip, so the board+slot sibling rule below holds in dev too. */
  [`    '<div class="home-logo">Better Me</div>'+
    '<div class="home-sub">Become the best version of yourself</div>'+
`, ``],
  [`    '<div class="home-grid" id="home-grid"></div>'+
`, `    '<div class="home-grid" id="home-grid"></div>'+
    /* the streak sits in the room under the hub it belongs beside */
    '<div id="home-stk" class="home-stk"></div>'+
`],
  [`    '<div class="home-date" id="home-date"></div>'+
`, ``],
  /* 2. the greeting is the one headline, the day's date under it; the streak
        is drawn into its own slot */
  [`    (g.named?'':'<span class="greet-add">'+_t('מי אתה?')+'</span>')+
    '</button>'+streakHTML();
}`, `    (g.named?'':'<span class="greet-add">'+_t('מי אתה?')+'</span>')+
    '</button>'+
    '<div class="greet-date">'+dfmt(appNow(),{weekday:'long',day:'numeric',month:'long'})+'</div>';
  var sk=document.getElementById('home-stk');
  if(sk)sk.innerHTML=streakHTML();
}`],
  /* 3. so the today card no longer prints the date a second time */
  [`  h+='<div class="td-when">'+dfmt(appNow(),{weekday:'long',day:'numeric',month:'long'})+
     ' <span class="td-clock">'+nowTodayHM()+'</span></div>';`,
   `  h+='<div class="td-when"><span class="td-clock">'+nowTodayHM()+'</span></div>';`],
  /* 4. the look */
  [`html body.mod-home .greet-wrap{max-width:none;margin-bottom:4px}
`, `html body.mod-home .greet-wrap{max-width:none;margin-bottom:4px}
/* ── HOME, DIRECTION ב (19 Oct) ── the greeting is the one headline, the
   date its second line; the name and slogan are gone from this screen. */
html body.mod-home .greet-w{font-size:24px;letter-spacing:-.4px}
html body.mod-home .greet-date{font-size:13px;font-weight:600;color:var(--nu-muted);margin-top:2px}
html body.mod-home .cfan{margin-top:22px}
/* סיום יום is the biggest thing on the screen: 114 -> 140 */
html body.mod-home .chub{width:140px;height:140px;margin:-70px 0 0 -70px;gap:6px}
html body.mod-home .chub-ic{width:56px;height:56px}
html body.mod-home .chub-ic svg{width:26px;height:26px}
html body.mod-home .chub-t{font-size:13.5px}
html body.mod-home .cname{font-size:10.5px}
/* the seven shafts step back so they do not compete with it */
html body.mod-home .cray{opacity:.52}
/* the streak fills the dead band under the hub: read as a line, not a pill.
   Only under the fan - the other layouts have no band to fill. */
html body.mod-home .home-stk{position:relative;z-index:1;display:flex;justify-content:center;
  width:100%;margin-bottom:6px}
html body.mod-home .home-stk:empty{display:none}
html body.mod-home .home-board:has(.cfan)+.home-stk{margin-top:-52px}
html body.mod-home .home-stk .stk{background:none;box-shadow:none;margin:0}
/* the card holds what it has; it no longer reserves 16vh when that is less */
html body.mod-home .td-cols{min-height:0}
`],
];

/* the working copy may be CRLF (core.autocrlf): speak its line ending */
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
for (const e of EDITS) { e[0] = e[0].replace(/\n/g, EOL); e[1] = e[1].replace(/\n/g, EOL); }

let n = 0;
for (const [a, b] of EDITS) {
  const [from, to] = REV ? [b, a] : [a, b];
  if (REV && from === '') continue;              // deletions are reversed below
  const c = s.split(from).length - 1;
  if (c !== 1) { console.log('ABORT: expected 1 match, found ' + c + ' for:\n' + from.slice(0, 120)); process.exit(1); }
  s = s.replace(from, () => to); n++;
}
if (REV) {
  /* put the two deleted blocks back where they stood */
  const g = `    '<div id="home-greet" class="greet-wrap"></div>'+` + EOL;
  if (s.split(g).length !== 2) { console.log('ABORT: greet anchor'); process.exit(1); }
  s = s.replace(g, () => g + EDITS[0][0]);
  const t = `    '<div id="trip-toggle-strip" style="width:100%;max-width:380px;margin-top:16px"></div>'+` + EOL;
  if (s.split(t).length !== 2) { console.log('ABORT: trip anchor'); process.exit(1); }
  s = s.replace(t, () => t + EDITS[2][0]);
  n += 2;
}
fs.writeFileSync(F, s);
console.log((REV ? 'reversed ' : 'applied ') + n + ' edits');
