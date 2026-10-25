/* "I still did not see Your health" (Asaf, 25 Oct): it sat near the bottom of
   Settings, below the language grid, the voice, the reminder, the country,
   the units and the sounds, as one small chip. It moves to the top of
   Settings as a full raised row that says what it is and how many are on. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`  /* your health - opens its own screen */
  h+='<div class="set-sec"><div class="set-t">'+_t('הבריאות שלך')+'</div>'+
     '<div class="set-s">'+_t('מצב רפואי שהאפליקציה תתחשב בו')+'</div></div>';
  h+='<div class="set-langs"><button class="set-lang" onclick="hlOpen()">'+(hlOn().length?_t('{n} פעילים',{n:hlOn().length}):_t('לא הוגדר'))+' &#8249;</button></div>';
`, ``);
rep(`  var cur=appLang(),h='';
  h+='<div class="set-sec"><div class="set-t">'+_t('שפה')+'</div>'+`, `  var cur=appLang(),h='';
  /* YOUR HEALTH, FIRST: it changes what the app suggests, so it is not one
     chip under the sounds */
  h+='<button class="set-hl" onclick="hlOpen()"><span><b>'+_t('הבריאות שלך')+'</b><i>'+_t('מצב רפואי שהאפליקציה תתחשב בו')+'</i></span>'+
     '<em>'+(hlOn().length?_t('{n} פעילים',{n:hlOn().length}):_t('לא הוגדר'))+' &#8249;</em></button>';
  h+='<div class="set-sec"><div class="set-t">'+_t('שפה')+'</div>'+`);
rep(`.fq-date{`, `.set-hl{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;border:none;border-radius:18px;padding:14px 16px;margin:4px 0 6px;
  font-family:inherit;text-align:start;cursor:pointer;color:var(--nu-ink,#4a453f);background:var(--nu-ground,#e9e7e3);
  box-shadow:-3px -3px 8px var(--nu-lit,rgba(255,255,255,.95)),4px 5px 12px var(--nu-shade-soft,rgba(176,168,156,.28))}
.set-hl b{display:block;font-size:16px;font-weight:800}.set-hl i{display:block;font-style:normal;font-size:12.5px;color:var(--nu-muted,#6d675e);font-weight:600;margin-top:2px}
.set-hl em{flex:none;font-style:normal;font-size:13px;font-weight:800;color:var(--nu-muted,#6d675e)}
.fq-date{`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
