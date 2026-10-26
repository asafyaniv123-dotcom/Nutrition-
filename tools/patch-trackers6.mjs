/* trackers round 6 (Asaf: "loved the plates and how they come in; the numbers
 * don't make it clear where you started and where you are today - maybe
 * something written above each plate"). Each plate on the right side carries
 * its weight above it - the old ones quiet, the new ones in terracotta - and
 * the row says both ends in words: "started at 60 · today 85". */
import fs from 'fs';
const F = 'review/trackers-2/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`      if(side>0)x+=w+1;});});`, `      if(side>0){s2+='<text class="pt'+(nw?' nw':'')+'" style="--d:'+(k*90)+'ms" x="'+(x+w/2).toFixed(1)+'" y="'+(cy-d[0]/2-4-(k%2)*10)+'" text-anchor="middle">'+String(p)+'</text>';x+=w+1;}});});`);
rep(`W2=210,cx=W2/2,H2=56,cy=H2/2`, `W2=210,cx=W2/2,H2=70,cy=42`);
rep(`'<span class="bbv"><b>'+e[2]+'</b> ק"ג <em><bdi dir="ltr">+'+(e[2]-e[1])+'</bdi></em></span></div>'`,
  `'<span class="bbv">התחלת ב-'+e[1]+' · היום <b>'+e[2]+'</b> ק"ג</span></div>'`);
rep(`.bb{display:block;width:100%;height:44px;direction:ltr}`, `.bb{display:block;width:100%;height:58px;direction:ltr}
.bb text.pt{font:800 9.5px Assistant,sans-serif;fill:#8f877d;animation:slide .7s cubic-bezier(.22,.61,.36,1) both;animation-delay:calc(var(--d) + 650ms);--from:0px}
.bb text.pt.nw{fill:#c0603f}`);
rep(`<div class="lb" style="text-align:center;margin:8px 0 2px">המשקלות על המוט, בכל צד · הכתומים: מה שנוסף ב-8 שבועות</div>`,
  `<div class="lb" style="text-align:center;margin:8px 0 2px">מעל כל משקולת: כמה היא שוקלת (בכל צד) · הכתומות נוספו ב-8 שבועות</div>`);
fs.writeFileSync(F, s);
console.log('ok');
