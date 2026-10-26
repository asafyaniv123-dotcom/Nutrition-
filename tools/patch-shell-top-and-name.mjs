/* Two things Asaf found in the TestFlight build (26 Oct):
 * 1. In the iPhone shell the page runs under the status bar (contentInset
 *    never), so env(safe-area-inset-top) is ~47px there and 0 in the browser.
 *    The home's chat switch respected it and the greeting and menu did not, so
 *    the switch sat on top of "ערב רגוע, אסף"; every area's ⌂ בית sat under
 *    the clock. Now the home padding, the menu and every area header add it.
 * 2. Tapping the greeting opened the name for editing. The name changes only
 *    in Settings now - which had no name field, so it gets one, first. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

/* 1 - the top of the screen, once, at the end of the stylesheet so it follows
   every per-area header rule (all of them are html body.mod-x .hdr) */
rep(`html body.mod-journal .set-country{background:var(--nu-ground);border:none;color:var(--nu-ink);
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
</style>`, `html body.mod-journal .set-country{background:var(--nu-ground);border:none;color:var(--nu-ink);
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
/* THE STATUS BAR (26.10). In the phone shells the page runs under the clock,
   and env(safe-area-inset-top) says how far; in a browser it is 0, so this
   changes nothing there. Last in the sheet so it follows every area's own
   .hdr rule, which all set padding-top to 16-18px. */
html body[class] .hdr{padding-top:calc(16px + env(safe-area-inset-top))}
html body #home-screen{padding-top:calc(60px + env(safe-area-inset-top))}
html body[class] .home-menu{top:calc(18px + env(safe-area-inset-top))}
.set-name{display:block;width:100%;box-sizing:border-box;border:none;border-radius:16px;padding:12px 16px;margin:8px 0 12px;
  font:inherit;font-size:15px;font-weight:700;color:var(--nu-ink,#4a453f);background:var(--nu-ground,#e9e7e3);outline:none;
  box-shadow:inset 2px 3px 6px var(--nu-shade,rgba(168,160,148,.45)),inset -2px -2px 5px var(--nu-lit,rgba(255,255,255,.95))}
</style>`);

/* 2 - the greeting is words, not a control */
rep(`  el.innerHTML='<button class="greet-line" onclick="greetEdit()">'+
    '<span class="greet-w">'+esc(g.text)+(g.icon?' '+g.icon:'')+'</span>'+
    (g.named?'':'<span class="greet-add">'+_t('מי אתה?')+'</span>')+
    '</button>'+`,
`  /* words, not a control: the name changes in Settings only (Asaf, 26.10) */
  el.innerHTML='<div class="greet-line" style="cursor:default">'+
    '<span class="greet-w">'+esc(g.text)+(g.icon?' '+g.icon:'')+'</span>'+
    '</div>'+`);
rep(`  h+='<button class="set-hl" onclick="hlOpen()">`,
`  /* YOUR NAME, the one place it is changed */
  h+='<div class="set-sec"><div class="set-t">'+_t('השם שלך')+'</div></div>'+
     '<input class="set-name" type="text" maxlength="24" autocomplete="given-name" placeholder="'+_t('השם שלך')+'" value="'+esc(greetName())+'" onchange="profName(this.value)">';
  h+='<button class="set-hl" onclick="hlOpen()">`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
