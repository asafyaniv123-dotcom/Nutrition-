/* Asaf on the phone (27 Oct): writing in planning, the keyboard came up and
 * the Better / Me bar rose with it, sitting over what he was typing. In the
 * shell the keyboard resizes the page, so everything fixed to the bottom
 * rides up on top of it. While a field has focus: the tab bar and the undo
 * pill step away; the day's writing bar stays only if it is the one being
 * typed in, sitting right on the keyboard; otherwise it steps away too. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

rep(`body.dpk-on #content{padding-bottom:150px}`, `body.dpk-on #content{padding-bottom:150px}
/* the keyboard is up: nothing fixed to the bottom rides up over the field */
body.kb-open .tabbar,body.kb-open .plan-undo{display:none!important}
body.kb-open:not(.kb-dock) .dpk{display:none}
body.kb-open.kb-dock .dpk{bottom:8px}`);

rep(`var _dpLibShow=false;`, `var _dpLibShow=false;
/* is the keyboard up? A field with focus is the honest signal on both
   platforms; the blur is checked a moment later, because focus moving from
   one field to the next passes through nothing. */
function kbIsField(el){
  if(!el||!el.tagName)return false;
  var t=el.tagName;if(t==='TEXTAREA'||el.isContentEditable)return true;
  if(t!=='INPUT')return false;
  return !/^(button|checkbox|radio|range|color|file|submit|reset|image|hidden)$/i.test(el.type||'');
}
document.addEventListener('focusin',function(e){
  if(!kbIsField(e.target))return;
  document.body.classList.add('kb-open');
  document.body.classList.toggle('kb-dock',!!(e.target.closest&&e.target.closest('#dp-rail')));
});
document.addEventListener('focusout',function(){
  setTimeout(function(){if(!kbIsField(document.activeElement))document.body.classList.remove('kb-open','kb-dock');},60);
});`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
