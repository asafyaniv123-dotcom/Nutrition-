/* The splash, with the chosen wordmark (option B): the word is drawn with its
 * last i dotless, then the brand sun lands where the dot belongs - the same
 * dot-in animation the full stop of "Better Me." had. Its place comes from
 * tools/render-olimei.mjs, which prints it as fractions of the image box. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const a = s.indexOf('  <div style="display:flex;align-items:flex-end;direction:ltr">\n    <img src="assets/brand-name.png" alt="Olimei"');
const svgAt = s.indexOf('<svg viewBox="11 11 78 78" aria-hidden="true" style="', a);
const svgStyleEnd = s.indexOf('">', svgAt);
if (a < 0 || svgAt < 0 || svgAt - a > 800) { console.log('anchor', a, svgAt); process.exit(1); }
const CX = 0.9126, CY = 0.2489, D = 0.5240;
s = s.slice(0, a) +
  `  <div style="position:relative;direction:ltr;--wh:clamp(60px,16vw,96px)">\n` +
  `    <img src="assets/brand-name-olimei.png" alt="Olimei" style="display:block;height:var(--wh);width:auto;clip-path:inset(0 100% 0 0);animation:reveal-ltr 1.1s cubic-bezier(.65,0,.35,1) forwards;animation-delay:.25s">` +
  `<svg viewBox="11 11 78 78" aria-hidden="true" style="position:absolute;width:calc(var(--wh)*${D});height:calc(var(--wh)*${D});left:calc(${(CX * 100).toFixed(2)}% - var(--wh)*${(D / 2).toFixed(4)});top:calc(${(CY * 100).toFixed(2)}% - var(--wh)*${(D / 2).toFixed(4)});opacity:0;transform:scale(.5);animation:dot-in .5s ease-out forwards;animation-delay:1.45s` +
  s.slice(svgStyleEnd);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
