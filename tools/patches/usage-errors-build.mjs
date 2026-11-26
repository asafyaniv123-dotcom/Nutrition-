/* The usage ping says which build it came from, and a script error nobody
 * reported reaches the server anyway (26 Nov, before two testers start on
 * TestFlight). Pairs are [anchor, replacement], each applied exactly once.
 *   node tools/patches/usage-errors-build.mjs [file]            apply
 *   node tools/patches/usage-errors-build.mjs [file] --reverse  undo */
import fs from 'fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  [
    `        o:u.o,s:u.s,a:Object.keys(u.a)})}).catch(function(){});`,
    `        o:u.o,s:u.s,a:Object.keys(u.a),p:appPlatform()})}).catch(function(){});`,
  ],
  [
    `window.addEventListener('load',function(){setTimeout(function(){try{usageNote('open');}catch(e){}},1500);});\n`,
    `window.addEventListener('load',function(){setTimeout(function(){try{usageNote('open');}catch(e){}},1500);});
/* ── WHICH BUILD ── 'web' in a browser; 'ios-13' or 'android' inside the
   shell. The number is the TestFlight build: Codemagic writes it into
   build.json beside the page, so the page itself stays the same file in
   every copy. Read once, long before the first ping at 1.5 s. */
var _appBuildNo='';
function appPlatform(){
  var C=window.Capacitor;
  if(!(C&&C.isNativePlatform&&C.isNativePlatform()))return 'web';
  return ((C.getPlatform&&C.getPlatform())||'native')+(_appBuildNo?'-'+_appBuildNo:'');
}
(function(){
  var C=window.Capacitor;if(!(C&&C.isNativePlatform&&C.isNativePlatform()))return;
  try{fetch('build.json',{cache:'no-store'}).then(function(r){return r.ok?r.json():null;})
    .then(function(j){if(j&&/^\\d{1,6}$/.test(String(j.b)))_appBuildNo=String(j.b);}).catch(function(){});}catch(e){}
})();
/* ── ERRORS, ANONYMOUS ── a script error nobody reported is still a bug.
   Sent: the message, where it was thrown, the area open, the build and the
   language - never anything typed. A JSON error can quote the data it choked
   on, so everything from its first quote on is cut. Each distinct error
   goes once per session, ten at most; a dropped connection is not a bug. */
var _errSeen={},_errN=0;
function errNote(msg,at){
  if(!SYNC_SERVER)return;
  msg=String(msg||'').slice(0,300);at=String(at||'').slice(0,120);
  if(!msg||/^Script error\\.?$/.test(msg)||/ResizeObserver loop|Load failed|Failed to fetch|NetworkError|AbortError|cancelled/i.test(msg))return;
  if(/JSON/i.test(msg))msg=msg.replace(/["'][\\s\\S]*$/,'"…"');
  var sig=msg+'|'+at;if(_errSeen[sig]||_errN>=10)return;_errSeen[sig]=1;_errN++;
  try{fetch(SYNC_SERVER+'/err',{method:'POST',headers:{'Content-Type':'application/json'},keepalive:true,
    body:JSON.stringify({uid:installId(),dev:!!window.__DEV__,day:todayStr(),p:appPlatform(),lang:appLang(),
      area:(typeof currentModule==='string'&&currentModule)||'home',m:msg,at:at})}).catch(function(){});}catch(e){}
}
window.addEventListener('error',function(e){
  if(!e||(e.target&&e.target!==window))return; /* a picture that failed to load, not a script */
  try{errNote(e.message||(e.error&&String(e.error)),(e.filename||'').replace(/^.*\\//,'')+':'+(e.lineno||0)+':'+(e.colno||0));}catch(_){}
});
window.addEventListener('unhandledrejection',function(e){
  var r=e&&e.reason;
  try{errNote('unhandled: '+(r&&r.message?r.message:String(r)),r&&r.stack?(String(r.stack).split('\\n')[1]||'').trim():'');}catch(_){}
});
`,
  ],
];

let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 120)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
