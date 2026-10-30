/* PEOPLE, IN EVERY LANGUAGE (30.10) - finishing the two people changes:
 *   1. a row and a card say היום / אתמול, never "0 days"
 *   2. "met by chance" in all eleven languages
 *   3. people-in-planning names: word-names and attached prefixes/particles per language
 *   4. a local phone number gets the country code of the country the app knows
 *   5. "pick from contacts" where the browser has the Contact Picker
 *   6. a reach is recorded on return from the app it opened, and only then
 *
 *   node tools/patch-people-everywhere.mjs          apply to dev/index.html
 *   node tools/patch-people-everywhere.mjs --undo   reverse it (must return HEAD byte for byte)
 *
 * Every piece of code here is written with String.raw, so a backslash in the
 * app is a backslash here.
 */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const UNDO = process.argv.includes('--undo');
const P = [];
const rep = (a, b) => P.push([a, b]);
const R = String.raw;

/* ── 1. today and yesterday ── */
rep(R`       '<span class="pp-row-w">'+(days===null?'&mdash;':_t('{n} ימים',{n:days}))+'</span>'+`,
    R`       '<span class="pp-row-w">'+(days===null?'&mdash;':days===0?_t('היום'):days===1?_t('אתמול'):_t('{n} ימים',{n:days}))+'</span>'+`);
rep(R`    h+='<span class="pp-face-s">'+(days===0?pplTodayLine(p):_t('דיברנו')+' '+_t('לפני {n} ימים',{n:days}))+'</span>';`,
    R`    h+='<span class="pp-face-s">'+(days===0?pplTodayLine(p):_t('דיברנו לפני {n} ימים',{n:days}))+'</span>';`);
/* one counted sentence, so 'yesterday' and 'two days ago' come from the language's own plural forms */
rep(R`  'לפני {n} ימים':{one:'אתמול',two:'לפני יומיים',other:'לפני {n} ימים'},`,
    R`  'לפני {n} ימים':{one:'אתמול',two:'לפני יומיים',other:'לפני {n} ימים'},
  'דיברנו לפני {n} ימים':{one:'דיברנו אתמול',two:'דיברנו לפני יומיים',other:'דיברנו לפני {n} ימים'},`);

/* ── 3. people-in-planning recognition ── */
rep(R`var PPN_PRE='ולבמשהכ';   // i18n-exempt: the Hebrew letters that join a word in front, read and never shown
var PPN_CJK=/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/;
/* Hebrew first names that are also everyday words - compared, never shown */
var PPN_WORDS='טל אור שחר גל ים שקד חן שיר רז נוי דור שי לב אביב מור גפן ירדן הדס אלה רון שמש אגם גיל ארז אלון תמר יעל ברק רעות שלום אושר מעיין נגה זיו סהר דקל אורן ורד עדן יונה רוני'.split(' ');   // i18n-exempt: names compared against a text, never shown`,
R`var PPN_PRE='ולבמשהכ';   // i18n-exempt: the Hebrew letters that join a word in front, read and never shown
var PPN_AR_PRE='وفبلك';   // i18n-exempt: the Arabic letters that join a word in front, read and never shown
var PPN_CJK=/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/;
/* First names that are also everyday words, in every language the app
   speaks - compared, never shown. A name here is lit softly and asked about
   once; every other name is lit at once. */
var PPN_WORDS=[].concat(
  'טל אור שחר גל ים שקד חן שיר רז נוי דור שי לב אביב מור גפן ירדן הדס אלה רון שמש אגם גיל ארז אלון תמר יעל ברק רעות שלום אושר מעיין נגה זיו סהר דקל אורן ורד עדן יונה רוני'.split(' '),   // i18n-exempt: names compared against a text, never shown
  'will rose may summer bill grace hope joy faith mark pat sue jack frank art dawn april june rob ray sky iris lily daisy amber ruby violet jade page dean drew grant hunter miles penny bob sandy sunny autumn brook cliff reed rich holly ivy pearl crystal honey river storm'.split(' '),   // i18n-exempt: names compared against a text, never shown
  'ernst frank heide rose kai wolf erika iris adler fink'.split(' '),   // i18n-exempt: names compared against a text, never shown
  'rosa dolores pilar luz paz consuelo mercedes soledad rocío alba esperanza victoria sol cielo amparo ángel salvador blanca clara perla reyes flor nieves milagros'.split(' '),   // i18n-exempt: names compared against a text, never shown
  'rose claire blanche pierre marguerite olive aimé constant désiré prudence aurore violette colombe céleste ange noël pascal'.split(' '),   // i18n-exempt: names compared against a text, never shown
  'rosa felice gioia serena chiara bianca fortunato vittoria stella aurora luce sole marina speranza angelo viola margherita'.split(' '),   // i18n-exempt: names compared against a text, never shown
  'rosa glória luz graça vitória aurora pérola estrela céu flor branca clara dores conceição sol esperança ângelo cândido serena jasmim'.split(' '),   // i18n-exempt: names compared against a text, never shown
  'نور أمل ورد سعيد كريم جميل هدى سلام صباح فرح ريم ندى منى رحمة حياة زهرة سعادة نبيل لطيف صابر حسن شريف وفاء أمين أمينة بدر شمس قمر بسمة'.split(' '),   // i18n-exempt: names compared against a text, never shown
  '光 空 海 花 愛 桜 翼 誠 優 希望 陽 健 静 ひかり さくら はな あい そら うみ まこと'.split(' '),   // i18n-exempt: names compared against a text, never shown
  '平安 安 静 明 华 華 强 強 勇 伟 偉 丽 麗 芳 秀 春 雪 梅 兰 蘭 玉 月 宇 星 阳 陽 快乐 快樂'.split(' '));   // i18n-exempt: names compared against a text, never shown
/* a name compared as a key: the search's own key, and Arabic without its
   vowel marks, which a name may be written with or without */
function ppnNorm(x){return pplKey(x).replace(/[\u064B-\u0652\u0670\u0640]/g,'');}
/* the ways a written word can be a name with something attached: Hebrew
   ו ל ב מ ש ה כ in front; Arabic و ف ب ل ك and the article ال (and لل, which
   is ل with ال); French and Italian elision (d', l', dell'); English 's */
function ppnVariants(w){
  var out=[{cut:0,end:0,s:w}],c,r,m;
  if(/^[\u05d0-\u05ea]/.test(w)){
    for(c=1;c<=3&&c<w.length-1;c++){if(PPN_PRE.indexOf(w.charAt(c-1))<0)break;out.push({cut:c,end:0,s:w.slice(c)});}
  } else if(/^[\u0621-\u064A]/.test(w)){
    for(c=0;c<=2&&c<w.length-2;c++){
      if(c>0&&PPN_AR_PRE.indexOf(w.charAt(c-1))<0)break;
      r=w.slice(c);
      if(c>0)out.push({cut:c,end:0,s:r});
      if(r.indexOf('ال')===0&&r.length>3)out.push({cut:c+2,end:0,s:r.slice(2)});   // i18n-exempt: the Arabic article
      if(c>0&&w.charAt(c-1)==='ل'&&r.charAt(0)==='ل'&&r.length>2)out.push({cut:c+1,end:0,s:r.slice(1)});   // i18n-exempt: the Arabic article after ל
    }
  } else {
    m=/^(?:[dlcjmnst]|qu|dell|dall|nell|sull|all)['’]/i.exec(w);
    if(m&&w.length>m[0].length+1)out.push({cut:m[0].length,end:0,s:w.slice(m[0].length)});
    m=/['’]s$/i.exec(w);
    if(m&&w.length>3)out.push({cut:0,end:2,s:w.slice(0,-2)});
  }
  return out;
}`);
rep(R`function ppnStrip(w,map){
  for(var c=0;c<=3&&c<w.length-1;c++){
    if(c>0&&PPN_PRE.indexOf(w.charAt(c-1))<0)break;
    var k=pplKey(w.slice(c));
    if(k&&map[k])return {cut:c,key:k,pids:map[k]};
  }
  return null;
}`, R`function ppnStrip(w,map){
  var v=ppnVariants(w),i,k;
  for(i=0;i<v.length;i++){k=ppnNorm(v[i].s);if(k&&map[k])return {cut:v[i].cut,end:v[i].end,key:k,pids:map[k]};}
  return null;
}`);
rep(R`    if(PPN_CJK.test(nm)){var at=0,j;
      while((j=text.indexOf(nm,at))>=0){out.push({s:j,e:j+nm.length,key:pplKey(nm),pids:[P[i].pid],word:false});at=j+nm.length;}
      continue;}
    f=pplKey(nm.split(/\s+/)[0]);if(f)(first[f]=first[f]||[]).push(P[i].pid);
    k=pplKey(nm);if(k&&k!==f)(full[k]=full[k]||[]).push(P[i].pid);
  }
  var re=/[\p{L}\p{M}'’׳"״\-]+/gu,m,toks=[];`,
R`    /* a name in a script written without spaces is found where it stands -
       and a one-character name only with something that says it is a
       person (さん, 先生, 老师) or standing on its own, or 光 would light
       inside 観光 */
    if(PPN_CJK.test(nm)){var at=0,j,kk=ppnNorm(nm),wd=PPN_WORDS.indexOf(kk)>=0;
      while((j=text.indexOf(nm,at))>=0){
        if(nm.length>1||/^(?:さん|くん|ちゃん|様|さま|先生|老师|老師)/.test(text.slice(j+1))||(!PPN_CJK.test(text.charAt(j-1)||'')&&!PPN_CJK.test(text.charAt(j+1)||'')))   // i18n-exempt: honorifics read, never shown
          out.push({s:j,e:j+nm.length,key:kk,pids:[P[i].pid],word:wd});
        at=j+nm.length;}
      continue;}
    f=ppnNorm(nm.split(/\s+/)[0]);if(f)(first[f]=first[f]||[]).push(P[i].pid);
    k=ppnNorm(nm);if(k&&k!==f)(full[k]=full[k]||[]).push(P[i].pid);
  }
  /* words by script, so a Latin or Arabic name written inside a Japanese or
     Chinese sentence ("Danaさんとランチ") is still a word of its own */
  var re=/[\p{Script=Latin}\p{Script=Hebrew}\p{Script=Arabic}\p{Script=Cyrillic}\p{Script=Greek}\p{M}'’׳"״\-]+/gu,m,toks=[];`);
rep(R`    if(two){hit={s:t.s+two.cut,e:toks[i+1].s+toks[i+1].w.length,key:two.key,pids:two.pids,word:false};i++;}
    else{one=ppnStrip(t.w,first);
      if(one)hit={s:t.s+one.cut,e:t.s+t.w.length,key:one.key,pids:one.pids,word:PPN_WORDS.indexOf(one.key)>=0};}`,
R`    if(two){hit={s:t.s+two.cut,e:toks[i+1].s+toks[i+1].w.length-two.end,key:two.key,pids:two.pids,word:false};i++;}
    else{one=ppnStrip(t.w,first);
      if(one)hit={s:t.s+one.cut,e:t.s+t.w.length-one.end,key:one.key,pids:one.pids,word:PPN_WORDS.indexOf(one.key)>=0};}`);

/* ── 4. the country code ── */
rep(R`function pplPhoneIntl(raw){
  var s=String(raw||'').trim(),d=s.replace(/\D/g,'');
  if(!d)return '';
  if(/^\s*\+/.test(s))return d;
  if(/^00/.test(d))return d.slice(2);
  if(/^05\d{8}$/.test(d))return '972'+d.slice(1);
  return d;
}`, R`/* Each country's calling code and the trunk prefix a local number is
   written with (0 in most, 8 in Russia, 06 in Hungary, none in Italy, Spain
   or North America). A local number takes the country the app already
   knows - the one chosen for products, else the phone's region, else the
   app's language. */
var PPC_CC={AE:['971','0'],AR:['54','0'],AT:['43','0'],AU:['61','0'],BE:['32','0'],BR:['55','0'],CA:['1',''],CH:['41','0'],CL:['56',''],CN:['86','0'],
  CO:['57',''],CZ:['420',''],DE:['49','0'],DK:['45',''],EG:['20','0'],ES:['34',''],FI:['358','0'],FR:['33','0'],GB:['44','0'],GR:['30',''],HK:['852',''],
  HU:['36','06'],ID:['62','0'],IE:['353','0'],IL:['972','0'],IN:['91','0'],IT:['39',''],JO:['962','0'],JP:['81','0'],KR:['82','0'],LB:['961','0'],
  MA:['212','0'],MX:['52',''],MY:['60','0'],NL:['31','0'],NO:['47',''],NZ:['64','0'],PH:['63','0'],PL:['48',''],PT:['351',''],RO:['40','0'],RU:['7','8'],
  SA:['966','0'],SE:['46','0'],SG:['65',''],TH:['66','0'],TN:['216',''],TR:['90','0'],TW:['886','0'],UA:['380','0'],US:['1',''],VN:['84','0'],ZA:['27','0']};
var PPC_LANG_CC={he:'IL',en:'US',de:'DE',fr:'FR',it:'IT',es:'ES',pt:'BR',ar:'SA',ja:'JP','zh-Hans':'CN','zh-Hant':'TW'};
function pplPhoneCountry(){
  var c='';try{c=appCountry()||countryFromBrowser()||'';}catch(e){}
  return PPC_CC[c]?c:(PPC_LANG_CC[appLang()]||'');
}
function pplPhoneIntl(raw,cc){
  var s=String(raw||'').trim(),d=s.replace(/\D/g,'');
  if(!d)return '';
  if(/^\s*\+/.test(s))return d;
  if(/^00/.test(d))return d.slice(2);
  var c=PPC_CC[cc||pplPhoneCountry()];
  if(!c)return d;
  var code=c[0],tr=c[1];
  if(code==='1')return d.length===10?'1'+d:d;
  if(tr){
    if(d.indexOf(tr)===0)return code+d.slice(tr.length);
    if(d.indexOf(code)===0&&d.length>=code.length+8)return d;   // already international, written without the +
    return code+d;
  }
  if(d.indexOf(code)===0&&d.length>=code.length+9)return d;
  return code+d;
}`);

/* ── 5. pick from contacts, where the browser can ── */
rep(R`       '<button class="dps-ok" onclick="pplPhoneSave()">'+_t('שמור מספר')+'</button>';`,
    R`       '<button class="dps-ok" onclick="pplPhoneSave()">'+_t('שמור מספר')+'</button>'+
       (pplCanPick()?'<button class="dps-lib" onclick="pplPickContact()">'+_t('לבחור מאנשי הקשר')+'</button>':'');`);

/* ── 6. recorded on return, and only then ── */
rep(R`function pplReach(k){
  var P=loadPeople(),p=P[_personIdx];if(!p||!p.phone)return;
  var url=pplReachUrl(k,p.phone);if(!url)return;
  p.lastContact=Date.now();p.lastVia={k:k,day:todayStr()};
  savePeople(P);
  pplReachClose();renderPeople();
  try{if(remNative())remNativeSync();}catch(e){}
  pplOpenExt(url);
}`, R`/* The Contact Picker: Android's Chrome has it, Safari does not, and the
   phone shells add no plugin for it - so the button is offered only where
   it will work. */
function pplCanPick(){return !!(navigator.contacts&&navigator.contacts.select&&('ContactsManager' in window));}
function pplPickContact(){
  try{navigator.contacts.select(['tel'],{multiple:false}).then(function(r){
    var t=r&&r[0]&&r[0].tel&&r[0].tel[0];if(!t)return;
    var i=document.getElementById('ppc-num');if(i)i.value=t;
    pplPhoneSave();
  }).catch(function(){});}catch(e){}
}
/* A tap is an intention, not a conversation. What is recorded is leaving
   for WhatsApp, Messages or the dialer and coming back: the tap leaves a
   note, the page going to the background marks it, and the return records
   it with the time it left. A page that never left - a cancelled call
   prompt - records nothing. The note survives the page being closed while
   away, and is not kept for longer than six hours. */
var PPC_PEND_KEY='ppc_pending';
function ppcPend(){try{return JSON.parse(localStorage.getItem(PPC_PEND_KEY)||'null');}catch(e){return null;}}
function ppcPendSet(x){try{if(x)localStorage.setItem(PPC_PEND_KEY,JSON.stringify(x));else localStorage.removeItem(PPC_PEND_KEY);}catch(e){}}
function pplReach(k){
  var P=loadPeople(),p=P[_personIdx];if(!p||!p.phone)return;
  var url=pplReachUrl(k,p.phone);if(!url)return;
  var at=Date.now();
  ppcPendSet({i:_personIdx,name:p.name,k:k,at:at,left:0});
  setTimeout(function(){var x=ppcPend();if(x&&x.at===at&&!x.left)ppcPendSet(null);},30000);
  pplReachClose();
  pplOpenExt(url);
}
function ppcSettle(){
  var x=ppcPend();if(!x||!x.left)return;
  ppcPendSet(null);
  if(Date.now()-x.left>6*3600000)return;
  var P=loadPeople(),i=x.i;
  if(!P[i]||P[i].name!==x.name){i=pplIdxByName(x.name);if(i<0)return;}
  P[i].lastContact=x.left;P[i].lastVia={k:x.k,day:todayStr()};
  savePeople(P);
  try{if(remNative())remNativeSync();}catch(e){}
  if(currentModule==='people'&&_peopleView==='person'&&_personIdx===i)renderPeople();
}
document.addEventListener('visibilitychange',function(){
  var x=ppcPend();if(!x)return;
  if(document.visibilityState==='hidden'){if(!x.left){x.left=Date.now();ppcPendSet(x);}return;}
  ppcSettle();
});
window.addEventListener('pageshow',function(){setTimeout(ppcSettle,400);});`);

/* ── 2. met by chance, in every language ── */
rep(R`/* "פגשתי את דנה…", "הכרתי את…", "נפגשתי עם…", "I met Dana…" - and only a
   name that is not already in My people, not a family word, not a pronoun.
   Read on the phone; it never asks unprompted, only answers a sentence. */
var PPM_STOP='אמא אבא סבתא סבא אחי אחותי אחיי אחיותיי אחים חבר חברה חברים חברות חברה׳ה מישהו מישהי כולם אותו אותה אותם אותן אותך אותי אותנו הורים בוס מנהל מנהלת רופא רופאה מורה מורים מורות שכן שכנה שכנים שכנות צוות לקוח לקוחה לקוחות משפחה דוד דודה בן בת ילד ילדה ילדים זוג אשתי בעלי אישתי חתול כלב אנשים מישהם כמה עוד שני שתי שלושה'.split(' ');   // i18n-exempt: words a name is compared against, never shown
var PPM_STOP_EN=['The','A','An','My','Our','His','Her','Their','Some','Someone','Somebody','Everyone','Everybody','Mom','Dad','Him','Them','You','Up','With','People','Friends','A friend','This','That'];   // i18n-exempt: words a name is compared against, never shown
var _ppm=null,_ppmNo={};
function ppmFind(q){
  if(!areaShown('people'))return null;
  q=String(q||'');
  var m=q.match(/(?:^|[\s,.;:!?])(?:פגשתי|הכרתי|פגשנו|הכרנו)\s+(?:(?:היום|אתמול|הבוקר|הערב)\s+)?את\s+([\u05d0-\u05ea][\u05d0-\u05ea'׳\-]{1,15})/)
      ||q.match(/(?:^|[\s,.;:!?])(?:נפגשתי|נפגשנו)\s+(?:(?:היום|אתמול|הבוקר|הערב)\s+)?עם\s+([\u05d0-\u05ea][\u05d0-\u05ea'׳\-]{1,15})/)
      ||q.match(/\bI\s+(?:just\s+)?(?:met|got to know)\s+(?:with\s+)?([A-Z][a-z'’\-]{1,15})\b/);
  if(!m)return null;
  var n=m[1].replace(/['׳\-]+$/,'');
  if(n.length<2||PPM_STOP.indexOf(n)>=0||PPM_STOP_EN.indexOf(n)>=0)return null;
  if(n.charAt(0)==='ה'&&PPM_STOP.indexOf(n.slice(1))>=0)return null;   // i18n-exempt: the Hebrew definite article
  var k=pplKey(n),P=loadPeople(),i;
  for(i=0;i<P.length;i++)if(P[i]&&pplKey(String(P[i].name||'').split(/\s+/)[0])===k)return null;
  if(_ppmNo[k])return null;
  return {name:n,line:q.trim()};
}`,
R`/* MET BY CHANCE, in every language the app speaks. Each shape names the
   person straight after the verb. Where a script has capitals the name must
   start with one; Arabic, Japanese and Chinese have none, so there the
   shape itself has to hold the name (على X, Xさんに会った, 认识了X). Only a
   name not already in My people, and not a family word, a role or a pronoun
   in that language. The app's language is tried first and the others after
   it, so a sentence written in a second language still counts. Read on the
   phone; it never asks unprompted, only answers a sentence. */
var PPM_SHAPES={
  he:[/(?:^|[\s,.;:!?])(?:פגשתי|הכרתי|פגשנו|הכרנו)\s+(?:(?:היום|אתמול|הבוקר|הערב)\s+)?את\s+([\u05d0-\u05ea][\u05d0-\u05ea'׳\-]{1,15})/,
      /(?:^|[\s,.;:!?])(?:נפגשתי|נפגשנו)\s+(?:(?:היום|אתמול|הבוקר|הערב)\s+)?עם\s+([\u05d0-\u05ea][\u05d0-\u05ea'׳\-]{1,15})/],
  en:[/\bI\s+(?:just\s+|finally\s+)?(?:met|got\s+to\s+know|ran\s+into|bumped\s+into)\s+(?:with\s+)?([A-Z][\p{L}'’\-]{1,15})/u,
      /\bmet\s+someone\s+new,?\s+([A-Z][\p{L}'’\-]{1,15})/u],
  de:[/(?:^|[^\p{L}])(?:[Ii]ch\s+)?habe\s+(?:heute\s+|gestern\s+|endlich\s+)?([A-ZÄÖÜ][\p{L}'\-]{1,15})\s+(?:kennengelernt|getroffen)(?![\p{L}])/u,
      /(?:^|[^\p{L}])[Ii]ch\s+traf\s+(?:heute\s+|gestern\s+)?([A-ZÄÖÜ][\p{L}'\-]{1,15})/u],
  fr:[/(?:^|[^\p{L}])[Jj]['’]ai\s+(?:enfin\s+)?(?:rencontré|rencontrée|croisé|croisée|fait\s+la\s+connaissance\s+(?:de\s+|d['’]))\s*(?:aujourd['’]hui\s+|hier\s+)?([A-ZÀ-ÖØ-Ý][\p{L}'’\-]{1,15})/u],
  it:[/(?:^|[^\p{L}])[Hh]o\s+(?:conosciuto|conosciuta|incontrato|incontrata|fatto\s+la\s+conoscenza\s+di)\s+(?:oggi\s+|ieri\s+)?([A-ZÀ-Ý][\p{L}'’\-]{1,15})/u],
  es:[/(?:^|[^\p{L}])(?:[Cc]onocí|[Cc]onoci|[Hh]e\s+conocido|[Mm]e\s+encontré\s+con|[Ee]ncontré)\s+(?:hoy\s+|ayer\s+)?(?:a\s+)?([A-ZÁÉÍÓÚÑ][\p{L}'’\-]{1,15})/u],
  pt:[/(?:^|[^\p{L}])(?:[Cc]onheci|[Ee]ncontrei|[Cc]ruzei\s+com)\s+(?:hoje\s+|ontem\s+)?(?:(?:a|o|com\s+a|com\s+o|com)\s+)?([A-ZÁÉÍÓÚÂÊÔÃÕÇ][\p{L}'’\-]{1,15})/u],
  ar:[/(?:^|[\s،,.؛!؟])(?:تعرفت|تعارفت)\s+(?:اليوم\s+|أمس\s+)?(?:على|إلى)\s+([\u0621-\u064A]{2,15})/,
      /(?:^|[\s،,.؛!؟])(?:قابلت|صادفت)\s+(?:اليوم\s+|أمس\s+)?([\u0621-\u064A]{2,15})/,
      /(?:^|[\s،,.؛!؟])التقيت\s+(?:اليوم\s+|أمس\s+)?(?:ب|مع\s+)([\u0621-\u064A]{2,15})/],
  ja:[/([\u30A0-\u30FF\u4E00-\u9FFF々]{1,8})(?:さん|くん|ちゃん)(?:に|と)(?:会|出会|知り合)(?:った|いました)/,
      /([\u30A0-\u30FF\u4E00-\u9FFF々]{1,8})(?:さん|くん|ちゃん)?と知り合(?:った|いました)/],
  zh:[/(?:认识了|認識了|结识了|結識了|遇到了|遇见了|遇見了|碰到了)(?:一个叫|一個叫|一位叫)?([\u4E00-\u9FFF]{2,3})(?=$|[，。！？、,.!?\s]|是|在|的|和)/]
};
/* the words that follow those verbs without being a name - family, roles,
   pronouns, "someone", "today" - in each language, compared as keys */
var PPM_STOP={};
[ 'אמא אבא סבתא סבא אחי אחותי אחיי אחיותיי אחים חבר חברה חברים חברות חברה׳ה מישהו מישהי כולם אותו אותה אותם אותן אותך אותי אותנו הורים בוס מנהל מנהלת רופא רופאה מורה מורים מורות שכן שכנה שכנים שכנות צוות לקוח לקוחה לקוחות משפחה דוד דודה בן בת ילד ילדה ילדים זוג אשתי בעלי אישתי חתול כלב אנשים מישהם כמה עוד שני שתי שלושה',   // i18n-exempt: words a name is compared against, never shown
  'the a an my our his her their some someone somebody everyone everybody mom mum dad him them you up with people friends this that mr mrs ms dr today yesterday',   // i18n-exempt: words a name is compared against, never shown
  'mama papa oma opa freund freunde freundin freundinnen kollegen kollege kollegin chef chefin lehrer lehrerin nachbarn nachbar nachbarin leute familie bruder schwester team arzt ärztin mutter vater kinder sohn tochter jemanden niemanden ihn sie ihr euch uns dich mich meine meinen mein meiner deine den die das einen eine ein heute gestern',   // i18n-exempt: words a name is compared against, never shown
  'maman papa mamie papi mon ma mes le la les un une quelqu personne aujourd hier',   // i18n-exempt: words a name is compared against, never shown
  'mamma papà nonna nonno mio mia miei il lo gli un una qualcuno oggi ieri',   // i18n-exempt: words a name is compared against, never shown
  'mamá papá abuela abuelo mi mis el los las alguien nadie hoy ayer',   // i18n-exempt: words a name is compared against, never shown
  'mãe pai avó avô meu minha meus minhas o os as um uma alguém ninguém hoje ontem',   // i18n-exempt: words a name is compared against, never shown
  'أمي أبي صديقي صديقتي صديق صديقة أصدقائي أخي أختي زميلي زميلتي زملائي مديري جاري جارتي جيراني عائلتي شخص شخصا أحد احد أحدا أستاذي معلمي معلمتي طبيبي ابني ابنتي زوجي زوجتي جدتي جدي عمي خالي',   // i18n-exempt: words a name is compared against, never shown
  '母 父 友達 友人 先生 上司 同僚 家族 兄 姉 弟 妹 誰か 皆 彼 彼女 子供 息子 娘 お客',   // i18n-exempt: words a name is compared against, never shown
  '朋友 同事 老师 老師 妈妈 媽媽 爸爸 邻居 鄰居 家人 新朋友 一个 一個 一位 他们 她们 他們 她們 大家 客户 客戶 同学 同學 医生 醫生'   // i18n-exempt: words a name is compared against, never shown
].forEach(function(l){l.split(' ').forEach(function(w){PPM_STOP[ppnNorm(w)]=1;});});
var _ppm=null,_ppmNo={};
function ppmLangs(){
  var L=appLang(),first=(L==='zh-Hans'||L==='zh-Hant')?'zh':L,out=[first],k;
  for(k in PPM_SHAPES)if(k!==first)out.push(k);
  return out;
}
function ppmFind(q){
  if(!areaShown('people'))return null;
  q=String(q||'');
  var t=q.replace(/[\u064B-\u0652\u0670\u0640]/g,''),L=ppmLangs(),i,j,m=null,n='';
  for(i=0;i<L.length&&!m;i++){var sh=PPM_SHAPES[L[i]]||[];for(j=0;j<sh.length&&!m;j++)m=t.match(sh[j]);}
  if(!m)return null;
  n=m[1].replace(/['’׳\-]+$/,'').replace(/^(?:今日|昨日|今朝|先日|この前)/,'');   // i18n-exempt: Japanese time words read, never shown
  var k=ppnNorm(n);
  if(n.length<1||(n.length<2&&!PPN_CJK.test(n))||PPM_STOP[k])return null;
  if(n.charAt(0)==='ה'&&PPM_STOP[ppnNorm(n.slice(1))])return null;   // i18n-exempt: the Hebrew definite article
  if(n.indexOf('ال')===0)return null;   // i18n-exempt: the Arabic definite article makes a noun, not a name
  var P=loadPeople();
  for(i=0;i<P.length;i++){var pn=String((P[i]&&P[i].name)||'');
    if(ppnNorm(pn.split(/\s+/)[0])===k||ppnNorm(pn)===k)return null;}
  if(_ppmNo[k])return null;
  return {name:n,line:q.trim()};
}`);

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
