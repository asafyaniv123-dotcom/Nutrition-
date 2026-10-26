/* "My progress" without the tabs (Asaf, 26 Oct: "I didn't like the strip at
 * the top to switch between them - inside My progress, just everything, one
 * after another, and you scroll down. Simple.").
 * Every tracker of the group is drawn in one column; one with nothing to show
 * yet is left out (and if none has anything, one sentence says so). Each
 * enters from the left when it scrolls into view. Ids inside a tracker get
 * its name as a suffix, since several now share the page. */
import fs from 'fs';
const R = [
[`function prgPick(k){_prg.cur=k;prgDraw();}
function prgDraw(){
  var o=document.getElementById('prg');if(!o)return;
  var h='<div class="prg-in"><div class="prg-top"><button class="fit-back" onclick="prgClose()">&#8249; '+_t('חזרה')+'</button>';
  if(_prg.list.length>1){h+='<div class="prg-tabs">';
    _prg.list.forEach(function(k){h+='<button class="'+(k===_prg.cur?'on':'')+'" onclick="prgPick(\\''+k+'\\')">'+esc(prgName(k))+'</button>';});
    h+='</div>';}
  h+='</div>';
  var b=PRG_B[_prg.cur],body='';
  try{body=b?b():'';}catch(e){body='';}
  h+=body||('<h2>'+esc(prgName(_prg.cur))+'</h2><div class="card"><div class="empty">'+_t('עוד אין כאן מספיק כדי להראות התקדמות. אחרי עוד כמה ימים של רישום, זה יופיע כאן.')+'</div></div>');
  o.innerHTML=h+'</div>';o.scrollTop=0;
  prgEnter();
}`,
`/* everything of the group, one after another; each enters as it is reached */
function prgDraw(){
  var o=document.getElementById('prg');if(!o)return;
  var h='<div class="prg-in"><div class="prg-top"><button class="fit-back" onclick="prgClose()">&#8249; '+_t('חזרה')+'</button>'+
    '<span class="prg-ttl">'+_t('ההתקדמות שלי')+'</span></div>',n=0;
  _prg.list.forEach(function(k){
    var b=PRG_B[k],body='';try{body=b?b():'';}catch(e){body='';}
    if(!body)return;n++;
    /* several trackers share the page now: every id carries its tracker */
    body=body.replace(/(id="|url\\(#)((?:prg-|pl)[\\w-]*)/g,'$1$2-'+k);
    h+='<section class="prg-sec" data-k="'+k+'">'+body+'</section>';});
  if(!n)h+='<div class="card"><div class="empty">'+_t('עוד אין כאן מספיק כדי להראות התקדמות. אחרי עוד כמה ימים של רישום, זה יופיע כאן.')+'</div></div>';
  o.innerHTML=h+'</div>';o.scrollTop=0;
  var secs=o.querySelectorAll('.prg-sec');
  [].forEach.call(secs,function(s){var c=s.querySelector('.card');if(c){c.style.opacity='0';c.style.transform='translateX(-60px)';}});
  if(!window.IntersectionObserver){[].forEach.call(secs,prgEnter);return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);prgEnter(e.target);}});},{root:o,threshold:.25});
  [].forEach.call(secs,function(s){io.observe(s);});
}`],
[`function prgEnter(){
  var c=document.getElementById('prg-cc');if(!c)return;
  var r=document.getElementById('prg-rvR'),an=c.querySelectorAll('.an'),RW=r?+r.getAttribute('width'):0,pm=document.getElementById('prg-pmc');`,
`function prgEnter(sec){
  var c=sec&&sec.querySelector('.card');if(!c)return;
  var r=sec.querySelector('[id^="prg-rvR"]'),an=c.querySelectorAll('.an'),RW=r?+r.getAttribute('width'):0,pm=sec.querySelector('[id^="prg-pmc"]');`],
[`.prg-tabs{`, `.prg-ttl{font-size:17px;font-weight:800;color:#4a453f}
.prg-sec{margin-bottom:34px}
.prg-tabs{`],
];
for (const F of ['tools/prg.js', 'tools/prg.css', 'dev/index.html']) {
  let s = fs.readFileSync(F, 'utf8'); const CR = s.includes('\r\n'); if (CR) s = s.replace(/\r\n/g, '\n'); let n = 0;
  for (const [a, b] of R) if (s.includes(a)) { s = s.split(a).join(b); n++; }
  if (CR) s = s.replace(/\n/g, '\r\n'); fs.writeFileSync(F, s); console.log(F, n);
}
