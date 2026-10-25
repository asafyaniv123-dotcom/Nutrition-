/* The app's half of the meter: every route that can call a model carries the
 * install's random id in its address, so the server's count can say which
 * install spent what. The id is the one /ping already sends; nothing else. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const ROUTES = ['analyze', 'ask', 'beem', 'coach', 'cross', 'estimate', 'match', 'off', 'parse', 'plan', 'route', 'say', 'schedule', 'see', 'transcribe', 'vision', 'week'];
let n = 0;
for (const r of ROUTES) {
  const a = "fetch(SYNC_SERVER+'/" + r + "',";
  const k = s.split(a).length - 1;
  if (!k) { console.log('missing ' + r); process.exit(1); }
  n += k;
  s = s.split(a).join("fetch(SYNC_SERVER+'/" + r + "'+meterQ(),");
}
const anchor = 'function installId(){';
if (s.split(anchor).length !== 2) { console.log('anchor'); process.exit(1); }
s = s.replace(anchor, () => `/* the address suffix for a route that may call a model: the server's meter
   counts what each install spent. Anonymous - the same random id as /ping. */
function meterQ(){return '?u='+installId()+(window.__DEV__?'&d=1':'');}
` + anchor);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok, ' + n + ' calls');
