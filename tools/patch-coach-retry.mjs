/* The coach gives up on the first dropped connection (Asaf, 1 Nov: a photo of
 * a Corny bar came back "לא הצלחתי לענות כרגע" - and the server's meter shows
 * no failed model call that day, so the request was lost on the way, not
 * refused). The answer is stateless on the server - the app applies it - so
 * sending the same request again cannot log anything twice.
 *  - a dropped request or a 5xx is tried once more, quietly, after 1.5 s;
 *  - if that fails too, the error line carries "נסה שוב", which sends the SAME
 *    request again (no second copy of her message in the chat).
 *
 *   node tools/patch-coach-retry.mjs [--undo]
 */
import fs from 'fs';
const F = 'dev/index.html', undo = process.argv.includes('--undo');
let s = fs.readFileSync(F, 'utf8');
const P = [
  ["var _coachBusy=false,_coachErr='',_coachPics=[];",
   "var _coachBusy=false,_coachErr='',_coachPics=[],_coachRetry=null;"],
  ["  fetch(SYNC_SERVER+'/coach'+meterQ(),{\n    method:'POST',headers:{'Content-Type':'application/json'},",
   "  var _coOpts={\n    method:'POST',headers:{'Content-Type':'application/json'},"],
  ["      images:pics.map(function(p){return{mime:'image/jpeg',data:p.split(',')[1]||''};})\n    })\n  }).then(function(r){return r.json();}).then(function(j){",
   "      images:pics.map(function(p){return{mime:'image/jpeg',data:p.split(',')[1]||''};})\n    })\n  };\n" +
   "  _coachRetry=null;\n" +
   "  (function coGo(left){\n" +
   "  fetch(SYNC_SERVER+'/coach'+meterQ(),_coOpts).then(function(r){if(r.status>=500)throw new Error(String(r.status));return r.json();}).then(function(j){"],
  ["  },function(){\n    _coachBusy=false;_coachErr=''+_t('לא הצלחתי לענות כרגע.')+'';coachPaint();\n  });\n  });",
   "  },function(){\n" +
   "    /* lost on the way: once more, quietly; then the same request on a tap */\n" +
   "    if(left>0){setTimeout(function(){coGo(left-1);},1500);return;}\n" +
   "    _coachBusy=false;_coachErr=''+_t('לא הצלחתי לענות כרגע.')+'';\n" +
   "    _coachRetry=function(){_coachRetry=null;_coachBusy=true;_coachErr='';coachPaint();coGo(1);};\n" +
   "    coachPaint();\n" +
   "  });\n  })(1);\n  });"],
  ["  if(_coachErr)h+='<div class=\"co-err\">'+esc(_coachErr)+'</div>';",
   "  if(_coachErr)h+='<div class=\"co-err\">'+esc(_coachErr)+\n" +
   "    (_coachRetry?' <button class=\"co-retry\" onclick=\"_coachRetry&&_coachRetry()\">'+_t('נסה שוב')+'</button>':'')+'</div>';"],
  [".co-err{align-self:center;font-size:12.5px;color:var(--terra-700);padding:6px}",
   ".co-err{align-self:center;font-size:12.5px;color:var(--terra-700);padding:6px}\n" +
   ".co-retry{margin-inline-start:6px;border:none;border-radius:999px;padding:5px 12px;font:inherit;font-weight:800;cursor:pointer;color:var(--nu-ink,#4a453f);\n" +
   "  background:var(--nu-ground,#e9e7e3);box-shadow:-2px -2px 5px var(--nu-lit,#fff),2px 3px 7px var(--nu-shade-soft,rgba(176,168,156,.28))}"],
];
for (let [a, b] of P) {
  if (s.split(undo ? b : a).length === 1 && s.includes((undo ? b : a).split('\n').join('\r\n'))) {
    a = a.split('\n').join('\r\n'); b = b.split('\n').join('\r\n');
  }
  const [x, y] = undo ? [b, a] : [a, b];
  const n = s.split(x).length - 1;
  if (n !== 1) { console.log('expected once, found ' + n + ':\n' + x.slice(0, 160)); process.exit(1); }
  s = s.replace(x, () => y);
}
fs.writeFileSync(F, s);
console.log(undo ? 'undone' : 'applied');
