/* Option G - a sun rising behind the word - came out as an orange stain
   behind "li". Replaced: the first i itself in the sun's orange, the sun as
   its dot - the letter becomes a small figure holding the light. */
import fs from 'fs';
const F = 'review/olimei-ideas/index.html';
let s = fs.readFileSync(F, 'utf8');
const a = s.indexOf(" ['ז׳ · שמש זורחת מאחורי המילה'");
const b = s.indexOf('\n', a);
if (a < 0) { console.log('anchor'); process.exit(1); }
s = s.slice(0, a) + ` ['ז׳ · ה־i כולה בכתום, והשמש היא הנקודה','Olımei',function(m){m.g.save();m.g.fillStyle=OR;m.g.fillText('ı',m.x0+m.w('Ol'),m.base);m.g.restore();m.dotSun(1,.26);}],` + s.slice(b);
fs.writeFileSync(F, s);
console.log('ok');
