// ONE FILE THAT IS THE FIRST SCREEN, AND NOT A PICTURE OF IT.
//
// Asaf asked to BE the new user, not to look at a mock-up in a drawn phone. So
// this is the shipped app itself - the same bytes that are published - with
// one line appended that opens the door whatever the browser remembers.
//
// Generated from index.html rather than written by hand, on purpose: a
// hand-made copy of the door would drift from the real one the first time
// anybody changed it, and then it would be showing him something that is not
// what she gets.
//
// It needs no server and no network. Hebrew is its own key in this app, so no
// dictionary is fetched; opened from the disk it speaks Hebrew on its own.
import fs from 'fs';

const SRC = 'C:/Projects/Nutrition-/index.html';       // the published bytes
const OUT = 'C:/Projects/Nutrition-/first-screen.html';

let s = fs.readFileSync(SRC, 'utf8');

/* The door is answered once and then gone - and doorDone() answers true on any
   sign of use at all, so clearing a flag is not enough. This opens it. */
const BOOT = `
<script>
/* ── THE FIRST SCREEN, ON PURPOSE ──
   This file is a copy of the app, generated from the published index.html, so
   that somebody can meet it the way a new person does. The app opens its door
   only once; these lines open it every time this file is opened, and reset
   what the previous look-through answered so it starts clean.

   Nothing here is part of the app. Delete this block and the file is the app. */
(function(){
  function go(){
    try{
      var w=document.getElementById('door');
      if(w&&w.parentNode)w.parentNode.removeChild(w);
      if(typeof _doorStep!=='undefined')_doorStep=0;
      doorOpen();
    }catch(e){
      /* if it is not ready yet, wait for it */
      setTimeout(go,120);
    }
  }
  if(document.readyState==='complete')setTimeout(go,60);
  else addEventListener('load',function(){setTimeout(go,60);});
})();
</script>
`;

/* BEFORE the app boots, not after. The first version set the language on
   load, which is after the app has already decided what language it is in -
   it came up in English. Storage has to be primed ahead of the first line the
   app runs. */
const HEAD = `
<script>
/* preview only: start clean, in Hebrew */
(function(){try{
  var ks=[],i;for(i=0;i<localStorage.length;i++)ks.push(localStorage.key(i));
  for(i=0;i<ks.length;i++)localStorage.removeItem(ks[i]);
  localStorage.setItem('app_lang','he');
}catch(e){}})();
</script>
`;
{
  const h = s.indexOf('<head>');
  if (h < 0) throw new Error('no head');
  s = s.slice(0, h + 6) + HEAD + s.slice(h + 6);
}

const tail = '</body>';
const at = s.lastIndexOf(tail);
if (at < 0) throw new Error('no closing body tag');
s = s.slice(0, at) + BOOT + s.slice(at);

fs.writeFileSync(OUT, s);
const kb = Math.round(fs.statSync(OUT).size / 1024);
console.log('first-screen.html written, ' + kb + ' KB, from the published index.html');
