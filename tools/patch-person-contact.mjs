/* ONE THING INSTEAD OF FIVE (30.10), approved from review/person-contact-live
 * (option 5 and "people met by chance").
 *
 *   A. A person's page loses the five chips that logged a contact. Under the
 *      card: "לכתוב ל{name}" (WhatsApp, message, call - recorded only when
 *      one is used) and "+ משהו שאני רוצה לזכור" (a memory marks today).
 *      The card says where today came from. Contacts already stored are
 *      read exactly as before.
 *   B. Someone met by chance: the home bar and the home chat offer to add a
 *      name that is not in My people when the sentence says so; My people
 *      gets "+ פגשתי מישהו" (a name and one line).
 *
 *   node tools/patch-person-contact.mjs          apply to dev/index.html
 *   node tools/patch-person-contact.mjs --undo   reverse it (must return HEAD byte for byte)
 */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const UNDO = process.argv.includes('--undo');
const P = [];
const rep = (a, b) => P.push([a, b]);

/* ── CSS, beside the people block's "we spoke" row ── */
rep(`/* ── WE SPOKE ── the row that resets the clock ── */
.pp-ways{`, `/* ── WE SPOKE ── the row that resets the clock ── */
/* (30.10) the row is gone from the page: one way to reach them, one way to
   remember. A reach is recorded only because it was used. */
.pp-reach{display:flex;width:100%;align-items:center;justify-content:center;gap:9px;margin:16px 0 12px;border:none;border-radius:16px;padding:14px;
  font-family:inherit;font-size:14px;font-weight:800;color:var(--nu-ink,#4a453f);background:var(--nu-ground,#e9e7e3);cursor:pointer;
  box-shadow:-3px -3px 7px var(--nu-lit,#fff),3px 4px 9px var(--nu-shade-soft,rgba(176,168,156,.28))}
.pp-reach:active{box-shadow:inset 2px 3px 6px var(--nu-shade,rgba(176,168,156,.44)),inset -2px -2px 5px var(--nu-lit,#fff)}
.pp-reach svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ppc-way{display:flex;width:100%;align-items:center;gap:13px;border:none;border-radius:20px;padding:13px 15px;margin-bottom:11px;font-family:inherit;
  color:#4a453f;background:var(--g);cursor:pointer;text-align:start;box-shadow:-3px -3px 7px var(--l),4px 5px 10px var(--d2)}
.ppc-way:active{box-shadow:inset 2px 3px 6px var(--d),inset -2px -2px 5px var(--l)}
.ppc-ic{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;box-shadow:inset 2px 3px 6px var(--d2),inset -2px -2px 5px var(--l)}
.ppc-ic svg{width:19px;height:19px;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.ppc-way b{display:block;font-size:15.5px;font-weight:800}
.ppc-way small{display:block;font-size:12px;font-weight:700;color:#6d675e;margin-top:1px;direction:ltr;text-align:start;unicode-bidi:plaintext}
.ppc-t{font-size:21px;font-weight:800;color:#4a453f;margin:2px 4px 4px;padding-inline-end:48px}
.ppc-s{font-size:13px;font-weight:600;color:#6d675e;margin:0 4px 16px;line-height:1.55}
.ppc-num{display:block;width:100%;box-sizing:border-box;border:none;outline:none;border-radius:16px;padding:14px 16px;margin-bottom:12px;font-family:inherit;font-size:16px;
  font-weight:600;color:#4a453f;background:var(--g);direction:ltr;text-align:start;box-shadow:inset 3px 4px 8px var(--d),inset -3px -3px 7px var(--l)}
.ppc-num::placeholder{color:#6d675e}
/* the one met by chance: a card under the bar, and a quick add on My people */
.ppm-r{display:flex;align-items:center;gap:11px}
.ppm-r b{display:block;font-size:15px;font-weight:800;color:var(--nu-ink,#4a453f);line-height:1.35}
.ppm-r span{display:block;font-size:12.5px;font-weight:600;color:var(--nu-muted,#6d675e);margin-top:2px;line-height:1.45}
.hch-dock .ppm-card{margin:0 12px 10px}
.ppm-met-b{display:flex;width:100%;align-items:center;justify-content:center;border:none;border-radius:20px;padding:14px;margin:0 0 14px;font-family:inherit;
  font-size:14px;font-weight:800;color:var(--nu-ink,#4a453f);background:var(--nu-ground,#e9e7e3);cursor:pointer;
  box-shadow:-4px -4px 9px var(--nu-lit,#fff),5px 6px 13px var(--nu-shade-soft,rgba(176,168,156,.28))}
.ppm-met{border-radius:22px;padding:14px 15px 15px;margin:0 0 14px;background:var(--nu-ground,#e9e7e3);
  box-shadow:-4px -4px 9px var(--nu-lit,#fff),5px 6px 13px var(--nu-shade-soft,rgba(176,168,156,.28))}
.ppm-met-h{display:flex;align-items:baseline;justify-content:space-between;gap:8px;font-size:15px;font-weight:800;color:var(--nu-ink,#4a453f);margin-bottom:12px}
.ppm-met-h small{font-size:12px;font-weight:700;color:var(--nu-muted,#6d675e)}
.ppm-met .mtin{display:block;width:100%;box-sizing:border-box;margin-bottom:9px}
.ppm-met-go{display:block;width:100%;border:none;border-radius:15px;padding:12px;font-family:inherit;font-size:14px;font-weight:800;color:var(--nu-ink,#4a453f);
  background:var(--nu-ground,#e9e7e3);cursor:pointer;box-shadow:-3px -3px 7px var(--nu-lit,#fff),3px 4px 9px var(--nu-shade-soft,rgba(176,168,156,.28))}
.pp-ways{`);

/* ── the person page ── */
rep(`    h+='<span class="pp-face-s">'+(days===0?_t('דיברנו היום'):_t('דיברנו')+' '+_t('לפני {n} ימים',{n:days}))+'</span>';`,
    `    h+='<span class="pp-face-s">'+(days===0?pplTodayLine(p):_t('דיברנו')+' '+_t('לפני {n} ימים',{n:days}))+'</span>';`);
rep(`  /* ── WE SPOKE ── the row that resets the clock ── */
  h+='<div class="pp-ways">';
  for(var ci=0;ci<CONTACT_N;ci++)
    h+='<button class="pp-way" onclick="logContact('+ci+')">'+esc(contactLabel(ci))+'</button>';
  h+='</div>';
`, `  /* ── REACH THEM, OR REMEMBER ── (30.10) the five chips that logged a
     contact are gone: a reach is recorded because it was used, a memory
     marks the day it was written. What they logged before still reads. */
  h+='<button class="pp-reach" onclick="pplReachOpen()"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z"/></svg>'+
     esc(_t('לכתוב ל{name}',{name:p.name}))+'</button>';
  h+='<button class="pp-add" style="margin:0 0 18px" '+
     'onclick="_peopleView=&quot;add-memory&quot;;_memoryIdx=-1;renderPeople()">'+
     _t('+ משהו שאני רוצה לזכור')+'</button>';
`);
rep(`  /* ── THE TIMELINE ── */
  h+='<button class="pp-add" style="margin:0 0 18px" '+
     'onclick="_peopleView=&quot;add-memory&quot;;_memoryIdx=-1;renderPeople()">'+
     _t('+ משהו שאני רוצה לזכור')+'</button>';
`, `  /* ── THE TIMELINE ── */
`);
/* a memory marks today */
rep(`  people[_personIdx].memories.push({id:Date.now()+'',content:inp.value.trim(),type:window._newMemType||'note',date:Date.now(),pinned:false});`,
    `  people[_personIdx].memories.push({id:Date.now()+'',content:inp.value.trim(),type:window._newMemType||'note',date:Date.now(),pinned:false});
  /* something to remember came from talking: that is a day you spoke */
  people[_personIdx].lastContact=Date.now();people[_personIdx].lastVia={k:'mem',day:todayStr()};`);
/* the number lives on the person, and the edit form shows it */
rep(`    toAsk:(document.getElementById('ep-ask')||{}).value||'',`,
    `    toAsk:(document.getElementById('ep-ask')||{}).value||'',
    phone:((document.getElementById('ep-phone')||{}).value||'').trim(),`);
rep(`  h+=pfield(''+_t('שם')+'','ep-name',p.name,''+_t('שם האדם')+'');`,
    `  h+=pfield(''+_t('שם')+'','ep-name',p.name,''+_t('שם האדם')+'');
  h+=pfield(''+_t('טלפון')+'','ep-phone',p.phone,'');`);
/* the evening question of people-in-planning says where today came from */
rep(`    p.lastContact=now;`, `    p.lastContact=now;p.lastVia={k:'plan',day:todayStr()};`);

/* ── My people: someone met ── */
rep(`  /* ── THE ONE WHO IS WAITING ──
     This screen's "now" is a person,`, `  h+=ppmMetHTML();

  /* ── THE ONE WHO IS WAITING ──
     This screen's "now" is a person,`);

/* ── the home bar and the home chat: the card under them ── */
rep(`    '</div><div id="hcmd-out"></div>';`, `    '</div><div id="hcmd-out"></div><div id="ppm-out"></div>';`);
rep(`  hcmdPaint();
}
langOn(hcmdMount);`, `  hcmdPaint();ppmPaint();
}
langOn(hcmdMount);`);
rep(`  if(q.length<2||_hcmd.busy)return;`, `  if(q.length<2||_hcmd.busy)return;
  ppmOffer(q,'ppm-out');`);
rep(`  if(q.length<2||_hch.busy)return;`, `  if(q.length<2||_hch.busy)return;
  ppmOffer(q,'ppm-hch');`);

/* ── the engine, before logContact ── */
rep(`function logContact(i){`, `/* ── ONE THING INSTEAD OF FIVE (30.10) ──
   A person is reached from here - WhatsApp, a message, a call - and that use
   is the record: lastContact moves and lastVia says how, for the line on the
   card. Nothing is logged by hand any more; logContact stays for the
   contacts already stored and the notification's "we talked" button. */
var PPC_IC={wa:'<svg viewBox="0 0 24 24" stroke="#3f8f5f"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z"/><path d="M9.5 9.2c.3 2 2.3 4.2 4.6 4.8l.9-1.1 1.6.8-.4 1.5c-3.4.2-7.3-3.6-7.3-7.1l1.5-.5.8 1.6z"/></svg>',
  sms:'<svg viewBox="0 0 24 24" stroke="#4c76b4"><rect x="3.5" y="5" width="17" height="12" rx="3"/><path d="M8 21l3-4"/><path d="M8 10h8M8 13h5"/></svg>',
  tel:'<svg viewBox="0 0 24 24" stroke="#a16646"><path d="M5 4h4l1.5 4.5-2.3 1.4a11 11 0 0 0 5.9 5.9l1.4-2.3L20 15v4a1.5 1.5 0 0 1-1.6 1.5C10.6 20 4 13.4 3.5 5.6A1.5 1.5 0 0 1 5 4z"/></svg>'};
/* the line on the card for a day you spoke - the way it happened, when today
   is the day it was recorded, and one whole sentence for each */
function pplTodayLine(p){
  var v=p&&p.lastVia,k=(v&&v.day===todayStr())?v.k:'';
  if(k==='wa')return _t('דיברנו היום · בוואטסאפ');
  if(k==='sms')return _t('דיברנו היום · בהודעה');
  if(k==='tel')return _t('דיברנו היום · בטלפון');
  if(k==='mem')return _t('דיברנו היום · זיכרון חדש');
  if(k==='plan')return _t('דיברנו היום · פגישה בתכנון');
  if(k==='met')return _t('הכרנו היום');
  return _t('דיברנו היום');
}
/* the number as each app wants it: digits only; an Israeli mobile written
   locally (05x, ten digits) is given its country code; a number written with
   + or 00 keeps its own */
function pplPhoneIntl(raw){
  var s=String(raw||'').trim(),d=s.replace(/\\D/g,'');
  if(!d)return '';
  if(/^\\s*\\+/.test(s))return d;
  if(/^00/.test(d))return d.slice(2);
  if(/^05\\d{8}$/.test(d))return '972'+d.slice(1);
  return d;
}
function pplReachUrl(k,raw){
  var intl=pplPhoneIntl(raw),plain=String(raw||'').replace(/[^\\d+]/g,'');
  if(!plain)return '';
  if(k==='wa')return 'https://wa.me/'+intl;
  if(k==='sms')return 'sms:'+plain;
  return 'tel:'+plain;
}
/* Outside the app. In the phone shells the web view hands any address that
   is not the app's own to the system (Capacitor's navigation handler), so a
   plain navigation opens WhatsApp, Messages or the dialer. In a browser a
   web address opens beside the app rather than replacing it. */
function pplOpenExt(url){
  var C=window.Capacitor,nat=C&&C.isNativePlatform&&C.isNativePlatform();
  if(!nat&&/^https?:/.test(url)){window.open(url,'_blank','noopener');return;}
  location.href=url;
}
function pplReachClose(){
  document.body.classList.remove('sheet-open');
  var o=document.getElementById('ppc-sheet');if(o)o.remove();
}
function pplReachOpen(){
  var p=loadPeople()[_personIdx];if(!p)return;
  pplReachClose();
  var h='<div class="summary-overlay" id="ppc-sheet" onclick="if(event.target===this)pplReachClose()">'+
    '<div class="summary-sheet dps" style="padding-bottom:calc(30px + env(safe-area-inset-bottom))"><div class="summary-pull"></div>'+
    '<button class="dps-x" onclick="pplReachClose()" aria-label="'+esc(_t('סגור'))+'">&times;</button>';
  if(!p.phone){
    h+='<div class="ppc-t">'+esc(_t('אין עדיין מספר של {name}',{name:p.name}))+'</div>'+
       '<div class="ppc-s">'+_t('הוסף מספר, ובפעם הבאה זה ייפתח ישר.')+'</div>'+
       '<input id="ppc-num" class="ppc-num" type="tel" inputmode="tel" autocomplete="tel" placeholder="'+esc(_t('מספר טלפון'))+'"'+
       ' onkeydown="if(event.key===\\'Enter\\')pplPhoneSave()">'+
       '<button class="dps-ok" onclick="pplPhoneSave()">'+_t('שמור מספר')+'</button>';
  } else {
    h+='<div class="ppc-t">'+esc(_t('לכתוב ל{name}',{name:p.name}))+'</div>'+
       '<div class="ppc-s">'+_t('נרשום שדיברתם רק אם תשתמש באחד מאלה.')+'</div>';
    [['wa',_t('וואטסאפ')],['sms',_t('הודעה')],['tel',_t('שיחה')]].forEach(function(w){
      h+='<button class="ppc-way" onclick="pplReach(\\''+w[0]+'\\')"><span class="ppc-ic">'+PPC_IC[w[0]]+'</span>'+
         '<span><b>'+esc(w[1])+'</b><small>'+esc(p.phone)+'</small></span></button>';
    });
  }
  h+='</div></div>';
  document.body.insertAdjacentHTML('beforeend',h);
  document.body.classList.add('sheet-open');
  if(!p.phone)setTimeout(function(){var i=document.getElementById('ppc-num');if(i)i.focus();},120);
}
function pplPhoneSave(){
  var i=document.getElementById('ppc-num'),v=i?i.value.trim():'';
  if(!pplPhoneIntl(v)){if(i)i.focus();return;}
  var P=loadPeople();if(!P[_personIdx])return;
  P[_personIdx].phone=v;savePeople(P);
  pplReachOpen();
}
function pplReach(k){
  var P=loadPeople(),p=P[_personIdx];if(!p||!p.phone)return;
  var url=pplReachUrl(k,p.phone);if(!url)return;
  p.lastContact=Date.now();p.lastVia={k:k,day:todayStr()};
  savePeople(P);
  pplReachClose();renderPeople();
  try{if(remNative())remNativeSync();}catch(e){}
  pplOpenExt(url);
}
/* ── SOMEONE MET BY CHANCE ──
   A new person in the shape savePersonEdit writes, with the line as their
   first memory and today as the day you spoke. */
function pplCreate(name,line,via){
  var P=loadPeople(),now=Date.now();
  P.push({memories:line?[{id:now+'',content:line,type:'memory',date:now,pinned:false}]:[],importantDates:[],
    name:name,relationship:'',place:'',whatTheyMean:'',whatILove:'',currentUpdate:'',toAsk:'',contactFreq:'monthly',avatar:'',
    lastContact:now,lastVia:{k:via||'met',day:todayStr()}});
  savePeople(P);
  return P.length-1;
}
/* "פגשתי את דנה…", "הכרתי את…", "נפגשתי עם…", "I met Dana…" - and only a
   name that is not already in My people, not a family word, not a pronoun.
   Read on the phone; it never asks unprompted, only answers a sentence. */
var PPM_STOP='אמא אבא סבתא סבא אחי אחותי אחיי אחיותיי אחים חבר חברה חברים חברות חברה׳ה מישהו מישהי כולם אותו אותה אותם אותן אותך אותי אותנו הורים בוס מנהל מנהלת רופא רופאה מורה מורים מורות שכן שכנה שכנים שכנות צוות לקוח לקוחה לקוחות משפחה דוד דודה בן בת ילד ילדה ילדים זוג אשתי בעלי אישתי חתול כלב אנשים מישהם כמה עוד שני שתי שלושה'.split(' ');   // i18n-exempt: words a name is compared against, never shown
var PPM_STOP_EN=['The','A','An','My','Our','His','Her','Their','Some','Someone','Somebody','Everyone','Everybody','Mom','Dad','Him','Them','You','Up','With','People','Friends','A friend','This','That'];   // i18n-exempt: words a name is compared against, never shown
var _ppm=null,_ppmNo={};
function ppmFind(q){
  if(!areaShown('people'))return null;
  q=String(q||'');
  var m=q.match(/(?:^|[\\s,.;:!?])(?:פגשתי|הכרתי|פגשנו|הכרנו)\\s+(?:(?:היום|אתמול|הבוקר|הערב)\\s+)?את\\s+([\\u05d0-\\u05ea][\\u05d0-\\u05ea'׳\\-]{1,15})/)
      ||q.match(/(?:^|[\\s,.;:!?])(?:נפגשתי|נפגשנו)\\s+(?:(?:היום|אתמול|הבוקר|הערב)\\s+)?עם\\s+([\\u05d0-\\u05ea][\\u05d0-\\u05ea'׳\\-]{1,15})/)
      ||q.match(/\\bI\\s+(?:just\\s+)?(?:met|got to know)\\s+(?:with\\s+)?([A-Z][a-z'’\\-]{1,15})\\b/);
  if(!m)return null;
  var n=m[1].replace(/['׳\\-]+$/,'');
  if(n.length<2||PPM_STOP.indexOf(n)>=0||PPM_STOP_EN.indexOf(n)>=0)return null;
  if(n.charAt(0)==='ה'&&PPM_STOP.indexOf(n.slice(1))>=0)return null;   // i18n-exempt: the Hebrew definite article
  var k=pplKey(n),P=loadPeople(),i;
  for(i=0;i<P.length;i++)if(P[i]&&pplKey(String(P[i].name||'').split(/\\s+/)[0])===k)return null;
  if(_ppmNo[k])return null;
  return {name:n,line:q.trim()};
}
function ppmOffer(q,where){
  var f=ppmFind(q);
  _ppm=f?{name:f.name,line:f.line,where:where}:null;
  ppmPaint();
}
function ppmHTML(){
  return '<div class="hcmd-card ppm-card"><div class="ppm-r">'+personAvatar0({name:_ppm.name},40)+
    '<div><b>'+esc(_t('להוסיף את {name} לאנשים שלי?',{name:_ppm.name}))+'</b><span>'+_t('מה שכתבת יהיה הזיכרון הראשון.')+'</span></div></div>'+
    '<div class="hcmd-btns"><button class="hcmd-b" onclick="ppmAdd()">'+_t('להוסיף')+'</button>'+
    '<button class="hcmd-b ghost" onclick="ppmNo()">'+_t('לא עכשיו')+'</button></div></div>';
}
function ppmPaint(){
  var o=document.getElementById('ppm-out');
  if(o)o.innerHTML=(_ppm&&_ppm.where==='ppm-out')?ppmHTML():'';
  var d=document.getElementById('hch-dock'),c=document.getElementById('ppm-hch');
  if(d&&!c){c=document.createElement('div');c.id='ppm-hch';d.insertBefore(c,d.firstChild);}
  if(c)c.innerHTML=(_ppm&&_ppm.where==='ppm-hch')?ppmHTML():'';
}
function ppmNo(){if(_ppm)_ppmNo[pplKey(_ppm.name)]=1;_ppm=null;ppmPaint();}
function ppmAdd(){
  if(!_ppm)return;
  var x=_ppm;_ppm=null;ppmPaint();
  pplCreate(x.name,x.line,'met');
  showToast(_t('נשמר')+' ✓');
  enterModule('people');_peopleView='home';renderPeople();
}
var _ppmMetOpen=false;
function ppmMetHTML(){
  if(!_ppmMetOpen)return '<button class="ppm-met-b" onclick="_ppmMetOpen=true;renderPeople();setTimeout(function(){var i=document.getElementById(\\'ppm-n\\');if(i)i.focus();},60)">'+_t('+ פגשתי מישהו')+'</button>';
  return '<div class="ppm-met"><div class="ppm-met-h">'+_t('פגשתי מישהו')+'<small>'+_t('שם ושורה אחת')+'</small></div>'+
    '<input id="ppm-n" class="mtin" autocomplete="off" placeholder="'+esc(_t('שם'))+'">'+
    '<input id="ppm-l" class="mtin" autocomplete="off" placeholder="'+esc(_t('איפה נפגשתם, מה כדאי לזכור'))+'" onkeydown="if(event.key===\\'Enter\\')ppmMetAdd()">'+
    '<button class="ppm-met-go" onclick="ppmMetAdd()">'+_t('להוסיף')+'</button></div>';
}
function ppmMetAdd(){
  var n=((document.getElementById('ppm-n')||{}).value||'').trim(),l=((document.getElementById('ppm-l')||{}).value||'').trim();
  if(!n){var i=document.getElementById('ppm-n');if(i)i.focus();return;}
  pplCreate(n,l,'met');_ppmMetOpen=false;
  showToast(_t('נשמר')+' ✓');renderPeople();
}
function logContact(i){`);

let n = 0;
const NL = s.includes('\r\n') ? '\r\n' : '\n';
for (const e of P) { e[0] = e[0].split('\n').join(NL); e[1] = e[1].split('\n').join(NL); }
for (const [a, b] of (UNDO ? P.map(([a, b]) => [b, a]).reverse() : P)) {
  const c = s.split(a).length - 1;
  if (c !== 1) { console.error('anchor count ' + c + ' for:\n' + a.slice(0, 160)); process.exit(1); }
  s = s.replace(a, () => b); n++;
}
fs.writeFileSync(F, s);
console.log((UNDO ? 'reversed ' : 'applied ') + n + ' edits');
