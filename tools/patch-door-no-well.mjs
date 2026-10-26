/* 3A (Asaf, 26 Oct): the well over the first reflection is gone - nobody could
 * tell what the glass circle was. Mip stands in the middle instead, through
 * the mood, the moment and the first day; the light that opens on the first
 * day now opens from him. The element stays (doorFill still writes to it),
 * it is simply never shown. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };
rep(`.dr2.at-mood .dr-beem,.dr2.at-moment .dr-beem{left:14px;top:46px;transform:scale(.42)}
.dr2.at-day1 .dr-beem{left:calc(50% + 30px);top:22px;transform:scale(.42)}`,
`.dr2.at-mood .dr-beem,.dr2.at-moment .dr-beem{left:calc(50% - 80px);top:30px;transform:scale(.7)}
.dr2.at-day1 .dr-beem{left:calc(50% - 69px);top:22px;transform:scale(.6)}`);
rep(`[dir=rtl] .dr2.at-name .dr-beem,[dir=rtl] .dr2.at-gender .dr-beem,[dir=rtl] .dr2.at-birth .dr-beem,[dir=rtl] .dr2.at-mood .dr-beem,[dir=rtl] .dr2.at-moment .dr-beem{left:14px}
[dir=ltr] .dr2.at-name .dr-beem,[dir=ltr] .dr2.at-gender .dr-beem,[dir=ltr] .dr2.at-mood .dr-beem,[dir=ltr] .dr2.at-moment .dr-beem{left:calc(100% - 129px)}`,
`[dir=rtl] .dr2.at-name .dr-beem,[dir=rtl] .dr2.at-gender .dr-beem,[dir=rtl] .dr2.at-birth .dr-beem{left:14px}
[dir=ltr] .dr2.at-name .dr-beem,[dir=ltr] .dr2.at-gender .dr-beem{left:calc(100% - 129px)}`);
rep(`.dr2.at-mood .dr-well,.dr2.at-moment .dr-well{opacity:1;transform:none}
.dr2.at-day1 .dr-well{opacity:1;transform:translateY(20px) scale(1.25);
  box-shadow:inset 4px 6px 10px var(--nu-shade),inset -4px -4px 9px var(--nu-lit),0 0 24px 6px rgba(140,184,232,.45)}`,
`/* the well is no longer shown (3A, 26.10): Mip stands where it stood */
.dr-well{display:none}`);
rep(`.dr2.at-day1 .dr-well{transform:translateY(0) scale(1.02)}`, ``);
rep(`  var wl=document.querySelector('.dr-well');if(!wl)return;`,
  `  var wl=document.getElementById('dr-beem');if(!wl)return;`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
