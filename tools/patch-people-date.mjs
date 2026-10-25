/* A person's important date on the app's wheel (Asaf, 25 Oct: "again the
 * strange calendar, in people too"). It was the last <input type="date"> a
 * person can reach - on the iPhone it opens the system calendar sheet. The
 * birth-date wheel takes an optional year range and drops its age line, so
 * the same wheel serves a date that may lie ahead (an anniversary, a
 * wedding) as well as one behind. The field becomes a button that says the
 * chosen date; the hidden input keeps the value addDateToPerson reads. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

rep(`function bwYears(){var y=appNow().getFullYear(),a=[],i;for(i=y-10;i>=y-100;i--)a.push(i);return a;}
function bwHTML(id){`, `/* the years a wheel offers: a birth date's by default, or its own range */
var _bwY={},_bwNoAge={};
function bwYears(id){if(id&&_bwY[id])return _bwY[id];var y=appNow().getFullYear(),a=[],i;for(i=y-10;i>=y-100;i--)a.push(i);return a;}
function bwHTML(id,opt){
  if(opt&&opt.years)_bwY[id]=opt.years;else delete _bwY[id];
  _bwNoAge[id]=!!(opt&&opt.noAge);`);
rep(`  bwYears().forEach(function(y){h+='<div>'+String(y)+'</div>';});   // i18n-exempt: a year, written as the year
  return h+'</div></div><div class="bw-age" id="'+id+'-age"></div>';`, `  bwYears(id).forEach(function(y){h+='<div>'+String(y)+'</div>';});   // i18n-exempt: a year, written as the year
  return h+'</div></div>'+(_bwNoAge[id]?'':'<div class="bw-age" id="'+id+'-age"></div>');`);
rep(`  var v=bwParse(val),cols=[[id+'-d',v.d-1],[id+'-m',v.m],[id+'-y',Math.max(0,bwYears().indexOf(v.y))]];`,
  `  var v=bwParse(val),cols=[[id+'-d',v.d-1],[id+'-m',v.m],[id+'-y',Math.max(0,bwYears(id).indexOf(v.y))]];`);
rep(`  var y=bwYears()[k('y')]||1990,m=k('m'),d=Math.min(k('d')+1,new Date(y,m+1,0).getDate());`,
  `  var y=bwYears(id)[k('y')]||1990,m=k('m'),d=Math.min(k('d')+1,new Date(y,m+1,0).getDate());`);
rep(`function bwAge(id){var e=document.getElementById(id+'-age'),a=profileAge(bwVal(id));`, `/* a person's important date: the same wheel, ten years ahead to a hundred back */
function epDatePick(){
  var hid=document.getElementById('ep-date-val');if(!hid)return;
  var y=appNow().getFullYear(),ys=[],i;for(i=y+10;i>=y-100;i--)ys.push(i);
  var ov=document.createElement('div');ov.className='cf-ov fss-ov';ov.id='bw-ov';
  ov.innerHTML='<div class="cf-card fss"><div class="cf-q" style="margin-bottom:12px">'+esc(_t('בחירת תאריך'))+'</div>'+bwHTML('ep-b',{years:ys,noAge:true})+
    '<div class="tm-sv-col" style="margin-top:14px"><button class="cf-yes" id="bw-ok">'+esc(_t('שמור'))+'</button><button class="cf-no" id="bw-x">'+esc(_t('ביטול'))+'</button></div></div>';
  document.body.appendChild(ov);bwInit('ep-b',hid.value||todayStr());
  var close=function(){if(ov.parentNode)ov.parentNode.removeChild(ov);};
  document.getElementById('bw-x').onclick=close;ov.onclick=function(e){if(e.target===ov)close();};
  document.getElementById('bw-ok').onclick=function(){hid.value=bwVal('ep-b');close();epDateShow();};
}
function epDateShow(){
  var hid=document.getElementById('ep-date-val'),b=document.getElementById('ep-date-btn');if(!hid||!b)return;
  b.textContent=hid.value?dfmt(new Date(hid.value+'T12:00:00'),{day:'numeric',month:'long',year:'numeric'}):_t('בחירת תאריך');
  b.classList.toggle('set',!!hid.value);
}
function bwAge(id){var e=document.getElementById(id+'-age'),a=profileAge(bwVal(id));`);
rep(`  h+='<input id="ep-date-val" class="mtin" type="date" style="flex:1;margin-bottom:0">';`,
  `  /* the app's wheel, not the system calendar: see epDatePick */
  h+='<button type="button" id="ep-date-btn" class="mtin ep-datebtn" style="flex:1;margin-bottom:0" onclick="epDatePick()">'+_t('בחירת תאריך')+'</button>'+
     '<input id="ep-date-val" type="hidden" value="">';`);
rep(`    showToast(''+_t('תאריך נוסף')+'');title.value='';val.value='';return;`, `    showToast(''+_t('תאריך נוסף')+'');title.value='';val.value='';epDateShow();return;`);
rep(`  savePeople(people);showToast(''+_t('תאריך נוסף')+' ✓');title.value='';val.value='';`, `  savePeople(people);showToast(''+_t('תאריך נוסף')+' ✓');title.value='';val.value='';epDateShow();`);
rep(`.fq-date{position:relative;display:block}`, `.fq-date{position:relative;display:block}
.ep-datebtn{cursor:pointer;font-family:inherit;text-align:center;color:var(--nu-muted,#6d675e);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ep-datebtn.set{color:var(--nu-ink,#4a453f)}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
