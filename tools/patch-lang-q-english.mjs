/* "The app is meant for English, and it asks which language we speak in
 * Hebrew" (Asaf, 23 Oct). The question is asked before the answer is known,
 * so it is asked in English, like the welcome before it. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const a = `    h='<div class="dr-body dr-lstep"><div class="dr-q2">'+_t('באיזו שפה נדבר?')+'</div><div class="dr-langs">';`;
if (s.split(a).length !== 2) { console.log('anchor'); process.exit(1); }
s = s.replace(a, `    h='<div class="dr-body dr-lstep"><div class="dr-q2" dir="ltr" lang="en">Which language shall we speak?</div><div class="dr-langs">';   // i18n-exempt: asked before the answer is known, in English like the welcome`);
fs.writeFileSync(F, s); console.log('patched');
