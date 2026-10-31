/* Dictation into the journal, punctuated (Asaf, 31 Oct): "you manage to give me
 * punctuation, to understand what I say ... and there it doesn't exist".
 * A mic on today's page records, /transcribe in mode 'prose' writes it down the
 * way a person would write it, and the words land where the caret is.
 *
 *   node tools/patch-journal-dictation.mjs          # apply to dev/index.html
 *   node tools/patch-journal-dictation.mjs --undo   # take it back out
 */
import fs from 'fs';
const F = 'dev/index.html', undo = process.argv.includes('--undo');
let s = fs.readFileSync(F, 'utf8');
const P = [
  // the mode travels with the recording
  ["var _micBox='fdb-q',_micBtn='mic-btn',_micAfter=null;",
   "var _micBox='fdb-q',_micBtn='mic-btn',_micAfter=null,_micMode='';"],
  ["      body:JSON.stringify({mime:(blob.type||'audio/webm').split(';')[0],data:b64,lang:appLang()})",
   "      body:JSON.stringify({mime:(blob.type||'audio/webm').split(';')[0],data:b64,lang:appLang(),mode:_micMode||undefined})"],
  // prose lands at the caret, as typing would, and is saved the way typing is
  ["      if(box){\n        box.value=(box.value?box.value.replace(/\\s+$/,'')+' ':'')+said;",
   "      if(box&&_micMode==='prose'){\n" +
   "        /* where the caret is, as typing would put it - a page is not a box that\n" +
   "           only grows at the end - with one space or line break to its left */\n" +
   "        var at=typeof box.selectionStart==='number'?box.selectionStart:box.value.length,pre=box.value.slice(0,at),post=box.value.slice(at);\n" +
   "        var glue=!pre||/\\s$/.test(pre)?'':' ';\n" +
   "        box.value=pre+glue+said+(post&&!/^\\s/.test(post)?' ':'')+post;\n" +
   "        var c=(pre+glue+said).length;try{box.setSelectionRange(c,c);}catch(e){}\n" +
   "        if(box.id==='jrnl-text')jrnlType(box);\n" +
   "      }\n" +
   "      else if(box){\n        box.value=(box.value?box.value.replace(/\\s+$/,'')+' ':'')+said;"],
  ["function micToggle(box,btn,after){",
   "function micToggle(box,btn,after,mode){"],
  ["  _micBox=box||'fdb-q';_micBtn=btn||'mic-btn';_micAfter=after||null;",
   "  _micBox=box||'fdb-q';_micBtn=btn||'mic-btn';_micAfter=after||null;_micMode=mode||'';"],
  // the button, in today's date line
  ["    '<div class=\"jb-dt\"><span>'+esc(jbLabel(d))+'</span><small>'+esc(dfmt(dt,{day:'numeric',month:'long'}))+'</small></div>'+",
   "    '<div class=\"jb-dt\"><span>'+esc(jbLabel(d))+'</span><small>'+esc(dfmt(dt,{day:'numeric',month:'long'}))+'</small>'+\n" +
   "      (k===0&&micCan()?'<button class=\"jb-mic mic-btn\" id=\"jb-mic\" data-base=\"jb-mic mic-btn\" onclick=\"micToggle(\\'jrnl-text\\',\\'jb-mic\\',null,\\'prose\\')\" aria-label=\"'+esc(_t('הכתבה'))+'\">'+\n" +
   "        '<svg viewBox=\"0 0 24 24\"><path d=\"M12 3.5a2.8 2.8 0 0 1 2.8 2.8v5a2.8 2.8 0 0 1-5.6 0v-5A2.8 2.8 0 0 1 12 3.5z\"/><path d=\"M6 11a6 6 0 0 0 12 0M12 17v3.5\"/></svg></button>':'')+'</div>'+"],
  [".jb-dt small{font-family:Assistant,sans-serif;font-size:12.5px;color:var(--nu-muted);font-weight:700}",
   ".jb-dt small{font-family:Assistant,sans-serif;font-size:12.5px;color:var(--nu-muted);font-weight:700}\n" +
   "/* dictation, at the far end of today's date line: raised like the page's other round buttons */\n" +
   ".jb-mic{margin-inline-start:auto;align-self:center;flex:none;width:34px;height:34px;border:none;border-radius:50%;cursor:pointer;background:var(--jb-paper);color:var(--nu-ink);\n" +
   "  box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}\n" +
   ".jb-mic.listening{box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}"],
];
for (let [a, b] of P) {
  /* parts of this file carry CRLF: a multi-line anchor takes the line ending
     the file has at that spot, and the replacement is written the same way */
  if (s.split(undo ? b : a).length === 1 && s.includes((undo ? b : a).split('\n').join('\r\n'))) {
    a = a.split('\n').join('\r\n'); b = b.split('\n').join('\r\n');
  }
  const [x, y] = undo ? [b, a] : [a, b];
  const n = s.split(x).length - 1;
  if (n !== 1) { console.log('expected once, found ' + n + ':\n' + x.slice(0, 120)); process.exit(1); }
  s = s.replace(x, () => y);
}
fs.writeFileSync(F, s);
console.log(undo ? 'undone' : 'applied');
