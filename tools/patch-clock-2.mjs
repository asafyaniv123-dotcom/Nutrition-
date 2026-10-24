/* The clock screen's tokens on one wrapper (.ck) rather than a list of its
   parts - the list made two classes look like they were defined twice - and
   a green dark enough to read as text (4.13:1 -> above 4.5). */
import fs from 'fs';
const f = 'dev/index.html';
let s = fs.readFileSync(f, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n, a.slice(0, 60)); process.exit(1); } s = s.replace(a, () => b); };
rep('.ck-seg,.ck-face,.ck-rb,.ck-lap,.ck-wl,.ck-wlab,.ck-rc{--nu-ground', '.ck{--nu-ground');
rep(`function renderFitClock(){
  var h='<div style="padding-bottom:20px">';`, `function renderFitClock(){
  var h='<div class="ck" style="padding-bottom:20px">';`);
rep('.ck-rb.go{color:#3f7a52}', '.ck-rb.go{color:#336843}');
rep('.ck-lap.best{color:#3f7a52}', '.ck-lap.best{color:#336843}');
rep('.ck-rc svg{width:16px;height:16px;fill:#3f7a52}', '.ck-rc svg{width:16px;height:16px;fill:#336843}');
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(f, s);
console.log('ok');
