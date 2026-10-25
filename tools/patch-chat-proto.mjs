/* chat prototype, round 1.1: Mip himself beside each answer (his body and
 * happy face, the app's own pictures) instead of a plain orange ball; and in
 * B the field of light behind the glass dims once an area is chosen and the
 * glass is gone, instead of glowing over an empty floor. */
import fs from 'fs';
const F = 'review/chat-proto/index.html';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR ' + a.slice(0, 60)); process.exit(1); } s = s.replace(a, () => b); };
rep(`.it .av{flex:none;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#ffd36b,#f0a92e 55%,#d9661c);box-shadow:0 0 10px rgba(240,169,46,.45)}`,
  `.it .av{flex:none;width:34px;height:34px;background:url(../../dev/assets/beem-f-happy.png) center/contain no-repeat,url(../../dev/assets/beem-body.png) center/contain no-repeat}`);
rep(`.B .areas{`, `.B .dock::before{transition:opacity .5s,height .5s}
.B.picked .dock::before{opacity:.28;height:120px}
.B .areas{`);
rep(`  cur=k;var a=area(k);`, `  cur=k;var a=area(k);ph.classList.add('picked');`);
rep(`  cur=null;hello.textContent=`, `  ph.classList.remove('picked');cur=null;hello.textContent=`);
fs.writeFileSync(F, s);
console.log('ok');
