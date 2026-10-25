/* home chat, round 1.1 - from the first photographs:
 *  - the area standing at the top sat on the dial/chat switch: it now stands
 *    one row lower, and the talk starts under it.
 *  - nutrition's coach kept its own amber frame and its dark send button;
 *    inside the chat it is glass like everything else - no frame, the
 *    writing line clear glass, the send and camera buttons glass discs. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`.hch-head{position:absolute;top:calc(env(safe-area-inset-top) + 16px);`, `.hch-head{position:absolute;top:calc(env(safe-area-inset-top) + 70px);`);
rep(`.hch-talk.out{opacity:0}`, `.hch-talk.out{opacity:0}
.hch.in-area .hch-talk{top:calc(env(safe-area-inset-top) + 124px)}
.hch.in-area .hch-empty{top:calc(env(safe-area-inset-top) + 140px)}`);
rep(`.hch .co-frame{flex:1;min-height:0;overflow:hidden;background:none;box-shadow:none;padding:0}`,
  `.hch .co-frame{flex:1;min-height:0;overflow:hidden;background:none;box-shadow:none;padding:0;border:none;border-radius:0}
.hch .co-in{background:transparent;box-shadow:none;border:none;font-size:16px}
.hch .co-cam,.hch .co-go{background:var(--glass);color:#5a544c;box-shadow:var(--rim),var(--haze);border:none}
.hch .co-go[disabled]{opacity:.5}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
