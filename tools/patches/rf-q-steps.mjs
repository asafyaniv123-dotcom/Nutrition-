// צעדים (25 Nov), as Asaf approved it on the eleventh review page - the footprints were rejected, stones in their place:
//  - five porcelain stepping stones rising in an arc, the last lit from within (cut from the render into
//    assets/rf-q11.webp, 680x260)
//  - the number in the page's serif inside one wide pressed well; it is written the reader's way (nfmt) and read
//    back digit by digit, Arabic-Indic digits included
//  - without a source: four pebbles for a rough count - about 3,000 / 6,000 / 10,000, and "more", which empties the
//    well to be typed into. With one: the number is already in the well and a lit dot says where it came from;
//    it can still be corrected, and only a corrected number is stored as typed by hand.
// usage: node tools/patches/rf-q-steps.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`q.id==='differently'?'arc':'';`,
   `q.id==='differently'?'arc':q.id==='steps'?'stones':'';`],
  [`k==='arc'?'rf-q10':'rf-q';`,
   `k==='arc'?'rf-q10':k==='stones'?'rf-q11':'rf-q';`],
  [`    var sv=stepsOf(_rfDate);
    if(sv>0){
      h+='<div style="text-align:center;padding:6px 0"><div style="font-size:44px;font-weight:800;color:var(--green-700);line-height:1">'+nfmt(sv)+'</div>';
      h+='<div style="font-size:11px;color:var(--muted);margin-top:6px">'+_t('נקרא מהמקור שחיברת')+'</div></div>';
    } else {
      h+='<input id="rf-in" type="number" inputmode="numeric" class="rf-in" style="min-height:0;text-align:center;font-size:30px;font-weight:800" placeholder="'+nfmt(10000)+'">';
    }`,
   `    var sv=stepsOf(_rfDate);
    h+='<input id="rf-in" type="text" inputmode="numeric" autocomplete="off" class="rf-in rfq-num" oninput="rfqAboutIn()" placeholder="'+nfmt(8000)+'" value="'+(sv>0?nfmt(sv):'')+'">';
    if(sv>0)h+='<div class="rfq-src"><i></i>'+_t('נקרא מהמקור שחיברת')+'</div>';
    else{
      h+='<div class="rfq-kinds rfq-about">';
      for(i=0;i<RF_ABOUT.length;i++)h+='<button class="rfq-kind" onclick="rfqAbout(this,'+RF_ABOUT[i]+')">'+_t('בערך {n}',{n:RF_ABOUT[i]})+'</button>';
      h+='<button class="rfq-kind" onclick="rfqAbout(this,0)">'+_t('יותר')+'</button></div>';
    }`],
  [`  } else if(q.kind==='steps'){
    el=document.getElementById('rf-in');
    var n=el?parseInt(el.value,10):NaN;
    if(n>=0){saveSteps(_rfDate,n,'manual');rfSave({steps:n});}`,
   `  } else if(q.kind==='steps'){
    el=document.getElementById('rf-in');
    var n=el?rfqNum(el.value):NaN;
    if(n>=0&&n===stepsOf(_rfDate))rfSave({steps:n});
    else if(n>=0){saveSteps(_rfDate,n,'manual');rfSave({steps:n});}`],
  [`/* a part of the day is a pebble that fills the time; typing an exact time lets the pebbles go */`,
   `/* steps: a rough count is a pebble that fills the well; "more" empties it to be typed into */
var RF_ABOUT=[3000,6000,10000];
function rfqNum(v){
  var d=String(v||'').replace(/[\\u0660-\\u0669]/g,function(c){return String(c.charCodeAt(0)-1632);}).replace(/[\\u06f0-\\u06f9]/g,function(c){return String(c.charCodeAt(0)-1776);}).replace(/[^0-9]/g,'');
  return d?parseInt(d,10):NaN;
}
function rfqAbout(b,n){
  var el=document.getElementById('rf-in'),on=!b.classList.contains('on');
  Array.prototype.forEach.call(document.querySelectorAll('.rfq-about .rfq-kind'),function(x){x.classList.remove('on');});
  if(on)b.classList.add('on');
  if(!el)return;
  el.value=on&&n?nfmt(n):'';
  if(on&&!n)el.focus();
}
function rfqAboutIn(){
  Array.prototype.forEach.call(document.querySelectorAll('.rfq-about .rfq-kind'),function(x){if(x.getAttribute('onclick').indexOf(',0)')<0)x.classList.remove('on');});
}
/* a part of the day is a pebble that fills the time; typing an exact time lets the pebbles go */`],
  [`/* the tenth review (25 Nov): assets/rf-q10.webp, a 260x200 arc that curves back, drawn at 0.42 */`,
   `/* the eleventh review (25 Nov): assets/rf-q11.webp, 680x260 stepping stones with room to fade, drawn at 0.4 */
html body.mod-endofday .rfq-stones{width:272px;height:104px;background-size:272px 104px;background-position:0 0;
  -webkit-mask:radial-gradient(farthest-side,#000 88%,transparent 100%);mask:radial-gradient(farthest-side,#000 88%,transparent 100%)}
html body.mod-endofday .rf-in.rfq-num{min-height:0;height:96px;margin-top:6px;padding:0 24px;border:none;border-radius:99px;text-align:center;direction:ltr;
  font-family:"Frank Ruhl Libre",Georgia,serif;font-size:46px;font-weight:500;line-height:96px;color:var(--nu-ink);caret-color:#f0a92e;background:var(--nu-ground);
  box-shadow:inset 4px 5px 10px var(--nu-shade),inset -4px -4px 9px var(--nu-lit)}
html body.mod-endofday .rf-in.rfq-num::placeholder{color:rgba(120,110,98,.35)}
html body.mod-endofday .rfq-about{margin:20px 0 4px;gap:6px}
html body.mod-endofday .rfq-about .rfq-kind{padding:9px 10px;font-size:13.5px}
html body.mod-endofday .rfq-src{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:18px;font-family:"Frank Ruhl Libre",Georgia,serif;font-size:14.5px;color:var(--nu-muted)}
html body.mod-endofday .rfq-src i{width:8px;height:8px;border-radius:50%;background:#f0a92e;box-shadow:0 0 6px 2px rgba(240,169,46,.55)}
/* the tenth review (25 Nov): assets/rf-q10.webp, a 260x200 arc that curves back, drawn at 0.42 */`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
