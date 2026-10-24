/* Beem under the name field sat on "נעים מאוד, אסף." (Asaf, 24 Oct). He
 * goes under the greeting line instead - it is always there, empty until
 * the name is said, so his place never moves. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const a = "    var f=document.getElementById('dr-nm'),b=document.getElementById('dr-beem');if(!f||!b)return;";
if (s.split(a).length !== 2) { console.log('anchor'); process.exit(1); }
s = s.replace(a, "    var f=document.getElementById('dr-said')||document.getElementById('dr-nm'),b=document.getElementById('dr-beem');if(!f||!b)return;");
fs.writeFileSync(F, s); console.log('patched');
