/* A mic that fails must say so (Asaf, 31 Oct: "the mic doesn't work").
 * The journal has no #mic-err line, so every failure there - no permission,
 * an empty recording, a failed transcription - looked like nothing at all.
 * Where the screen has no error line, the reason now comes as a toast.
 *
 *   node tools/patch-mic-visible.mjs [--undo]
 */
import fs from 'fs';
const F = 'dev/index.html', undo = process.argv.includes('--undo');
let s = fs.readFileSync(F, 'utf8');
const P = [
  ["  var e=document.getElementById('mic-err');\n  if(e)e.textContent=_micErr||'';\n}",
   "  var e=document.getElementById('mic-err');\n  if(e)e.textContent=_micErr||'';\n" +
   "  /* no error line on this screen (the journal): say it out loud once */\n" +
   "  else if(_micErr&&_micErr!==_micSaid){_micSaid=_micErr;showToast(_micErr);}\n" +
   "  if(!_micErr)_micSaid='';\n}"],
  ["var _micErr='';", "var _micErr='',_micSaid='';"],
  // an empty recording is a failure the person should hear about
  ["      if(!blob.size){micReset();return;}",
   "      if(!blob.size){micFail();return;}"],
  // refused permission, or no microphone
  ["  },function(){\n    /* refused the microphone, or there is none. Nothing to say that the\n       browser's own prompt did not already say. */\n    micReset();",
   "  },function(){\n    /* refused the microphone, or there is none. On the phone the refusal is\n       remembered and no prompt comes again, so the app has to say where to\n       give it back. */\n    _micErr=''+_t('אין גישה למיקרופון. אפשר לאשר אותה בהגדרות של הטלפון.')+'';\n    micReset();"],
];
for (let [a, b] of P) {
  if (s.split(undo ? b : a).length === 1 && s.includes((undo ? b : a).split('\n').join('\r\n'))) {
    a = a.split('\n').join('\r\n'); b = b.split('\n').join('\r\n');
  }
  const [x, y] = undo ? [b, a] : [a, b];
  const n = s.split(x).length - 1;
  if (n !== 1) { console.log('expected once, found ' + n + ':\n' + x.slice(0, 140)); process.exit(1); }
  s = s.replace(x, () => y);
}
fs.writeFileSync(F, s);
console.log(undo ? 'undone' : 'applied');
