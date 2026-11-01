/* Every AI request gets one more try when the connection drops (Asaf, 1 Nov:
 * "fix it for everyone"). The coach gave up on its first dropped request; so
 * did the other 21 places the app asks the server - the home bar, Mip, the
 * planner, the food search, photos, dictation. One wrapper, in one place,
 * instead of 22 copies of the same retry.
 * Only routes that WRITE NOTHING on the server are resent: their answer is
 * applied by the app, so a second send cannot record anything twice.
 * /corrections, /together, /steps, /subscribe are not in the list. /coach has
 * its own retry with a button (patch-coach-retry), so it is left out too.
 *
 *   node tools/patch-server-retry.mjs [--undo]
 */
import fs from 'fs';
const F = 'dev/index.html', undo = process.argv.includes('--undo');
let s = fs.readFileSync(F, 'utf8');
const A = "var SYNC_SERVER='https://nutrition-push.nutrition-push.workers.dev';";
const B = A + "\n" +
  "/* A dropped connection, or a 5xx, gets ONE more try after 1.5 s - only for the\n" +
  "   AI routes, which write nothing on the server (the app applies the answer),\n" +
  "   so resending cannot record anything twice. A request the app cancelled\n" +
  "   itself stays cancelled. (1 Nov: the coach and 21 others gave up at once.) */\n" +
  "var SRV_RETRY=/^\\/(route|match|estimate|week|vision|transcribe|say|plan|parse|off|cross|beem|ask|analyze|act|schedule|see)(\\?|$)/;\n" +
  "(function(){\n" +
  "  var F0=window.fetch;if(!F0)return;\n" +
  "  window.fetch=function(u,o){\n" +
  "    var url=String(u&&u.url||u),self=this,args=arguments;\n" +
  "    if(!SYNC_SERVER||url.indexOf(SYNC_SERVER)!==0||!SRV_RETRY.test(url.slice(SYNC_SERVER.length)))return F0.apply(self,args);\n" +
  "    var again=function(){return new Promise(function(r){setTimeout(r,1500);}).then(function(){return F0.apply(self,args);});};\n" +
  "    return F0.apply(self,args).then(function(r){return r.status>=500?again():r;},\n" +
  "      function(e){if(o&&o.signal&&o.signal.aborted)throw e;return again();});\n" +
  "  };\n" +
  "})();";
const [x, y] = undo ? [B, A] : [A, B];
const n = s.split(x).length - 1;
if (n !== 1) { console.log('expected once, found ' + n); process.exit(1); }
s = s.replace(x, () => y);
fs.writeFileSync(F, s);
console.log(undo ? 'undone' : 'applied');
