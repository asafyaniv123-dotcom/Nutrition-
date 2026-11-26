/* The subscription, the app's half (Asaf approved version 3 of the screen,
 * 26 Nov 2026): a week free inside the app with no card, then Olimei
 * ($3.99 / $29.99) for סיום יום and everything that needs no model, or
 * Olimei Pro ($7.99 / $59.99) for that and the AI. One subscription group,
 * two levels. Only the iPhone app ever asks, and only once the server's
 * PAYWALL is on - the web app has no way to pay.
 * Pairs are [anchor, replacement], each applied exactly once.
 *   node tools/patches/olimei-subscription.mjs [file]            apply
 *   node tools/patches/olimei-subscription.mjs [file] --reverse  undo */
import fs from 'fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  /* the screen's look: its own porcelain tokens, as the cooking overlay
     carries its own, because it hangs off <body> and not off a module */
  [
    String.raw`.set-hl em{flex:none;font-style:normal;font-size:13px;font-weight:800;color:var(--nu-muted,#6d675e)}
`,
    String.raw`.set-hl em{flex:none;font-style:normal;font-size:13px;font-weight:800;color:var(--nu-muted,#6d675e)}
/* ── OLIMEI, THE SUBSCRIPTION SCREEN ── version 3 as Asaf approved it: the
   icon's sun in porcelain, a switch between the two levels, two plans, and
   the amber light only on what is chosen. */
.olp{position:fixed;inset:0;z-index:9500;display:flex;align-items:flex-end;justify-content:center;background:rgba(74,69,63,.34);
  --nu-ground:#f6f4ef;--nu-lit:rgba(255,255,255,.95);--nu-shade:rgba(176,168,156,.44);--nu-ink:#4a453f;--nu-muted:#6d675e;color:var(--nu-ink)}
.olp-box{position:relative;width:100%;max-width:440px;max-height:100%;overflow-y:auto;background:var(--nu-ground);border-radius:30px 30px 0 0;
  padding:18px 20px calc(18px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 40px rgba(74,69,63,.22);text-align:center}
.olp-x{position:absolute;top:14px;inset-inline-end:16px;width:34px;height:34px;border:none;border-radius:50%;background:var(--nu-lit);
  box-shadow:0 2px 6px var(--nu-shade);color:var(--nu-muted);font-size:16px;line-height:34px;padding:0}
.olp-sun{display:block;width:132px;height:132px;margin:0 auto;border-radius:50%;
  -webkit-mask-image:radial-gradient(circle,#000 52%,transparent 71%);mask-image:radial-gradient(circle,#000 52%,transparent 71%)}
.olp-seg{display:inline-flex;background:#ebe7e0;border-radius:999px;padding:4px;margin:2px 0 10px;box-shadow:inset 0 2px 5px var(--nu-shade)}
.olp-seg button{border:none;background:none;border-radius:999px;padding:7px 15px;font:inherit;font-size:13.5px;font-weight:800;color:var(--nu-muted)}
.olp-seg button.on{background:var(--nu-lit);color:var(--nu-ink);box-shadow:0 2px 6px var(--nu-shade),0 0 10px rgba(232,193,98,.45)}
.olp-t{font-size:24px;font-weight:800;margin:0}
.olp-s{color:var(--nu-muted);font-size:14.5px;margin:2px 6px 12px}
.olp-f{list-style:none;margin:0 0 12px;padding:0;display:grid;gap:7px;text-align:start}
.olp-f li{display:flex;gap:10px;align-items:center;font-size:14.5px}
.olp-f li:before{content:"";flex:none;width:9px;height:9px;border-radius:50%;background:var(--amber-500);box-shadow:0 0 8px rgba(232,193,98,.6)}
.olp-plan{display:flex;align-items:center;gap:8px;width:100%;margin-bottom:9px;padding:12px 14px;border:2px solid transparent;border-radius:20px;
  background:var(--nu-lit);box-shadow:0 2px 8px var(--nu-shade);font:inherit;color:var(--nu-ink);text-align:start}
.olp-plan.on{border-color:var(--amber-500);box-shadow:0 0 0 4px rgba(232,193,98,.35),0 2px 8px var(--nu-shade)}
.olp-plan span{flex:1;min-width:0}.olp-plan b{display:block;font-size:16px}.olp-plan small{display:block;color:var(--nu-muted);font-size:12.5px}
.olp-plan i{font-style:normal;font-size:11.5px;font-weight:800;background:#fbf1d8;color:var(--nu-ink);border-radius:999px;padding:2px 9px;white-space:nowrap}
.olp-plan em{font-style:normal;font-weight:800;font-size:16px;white-space:nowrap}
.olp-cta{display:block;width:100%;margin-top:4px;border:none;border-radius:999px;padding:14px;font:inherit;font-weight:800;font-size:16px;
  color:var(--nu-ink);background:linear-gradient(#fbd98c,#f3b54a);box-shadow:0 6px 18px rgba(243,181,74,.45)}
.olp-cta[disabled]{opacity:.5;box-shadow:none}
.olp-m{min-height:1em;font-size:13px;font-weight:700;margin:8px 0 0}
.olp-fine{font-size:11.8px;color:var(--nu-muted);margin:8px 4px 6px}
.olp-l{display:flex;justify-content:center;gap:16px;flex-wrap:wrap}
.olp-l button{border:none;background:none;padding:4px 0;font:inherit;font-size:12.5px;color:var(--nu-muted);text-decoration:underline}
`,
  ],
  /* the code */
  [
    String.raw`function meterQ(){return '?u='+installId()+(window.__DEV__?'&d=1':'')+'&p='+encodeURIComponent(appPlatform());}
`,
    String.raw`function meterQ(){return '?u='+installId()+(window.__DEV__?'&d=1':'')+'&p='+encodeURIComponent(appPlatform());}
/* ── OLIMEI, THE SUBSCRIPTION ── Asaf, 26 Nov 2026: a week free inside the
   app, no card; then Olimei - סיום יום, the days already written, the week's
   summary, everything that calls no model - or Olimei Pro, which adds the
   AI. One subscription group in the App Store, two levels.

   Who is asked: only the iPhone app, and only once the server says the
   paywall is on (GET /pro answers on:true) AND the store is wired
   (OLP_RC_KEY). Until then nothing here changes anything, which is why it
   can ship before the products exist. The web app is never asked: it has no
   way to pay, and Apple does not allow pointing an iPhone reader at one.

   What is locked after the week, without a subscription: opening an area,
   and starting a new evening. סיום יום itself still opens, so every day
   already written can be read - and exported from settings - for good. The
   AI is the server's to refuse (402), and a 402 opens this screen on Pro.

   The store's answer comes from RevenueCat on the phone; the server asks
   RevenueCat itself before any paid call, so the phone's answer only
   decides what is SHOWN. */
var OLP_RC_KEY='';   /* RevenueCat's public iOS key, appl_… - not a secret */
var OLP_TRIAL_DAYS=7;
var OLP_TERMS='https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
var OLP_PRIVACY='https://asafyaniv123-dotcom.github.io/Nutrition-/site/privacy/';
var _olp={on:false,rc:'none',srv:false,until:0,offer:null,tab:'base',per:'year',busy:false,msg:''};
function olpNative(){
  var C=window.Capacitor;
  return !!(C&&C.isNativePlatform&&C.isNativePlatform()&&C.getPlatform&&C.getPlatform()==='ios');
}
function olpStore(){var C=window.Capacitor;return (olpNative()&&OLP_RC_KEY&&C.Plugins&&C.Plugins.Purchases)||null;}
/* the first day the app was opened on this phone: the week counts from it */
function olpFirst(){
  var f='';try{f=localStorage.getItem('olp_first')||'';}catch(e){}
  if(!/^\d{4}-\d\d-\d\d$/.test(f)){f=todayStr();try{localStorage.setItem('olp_first',f);}catch(e){}}
  return f;
}
function olpTrialEnd(){return dayShift(OLP_TRIAL_DAYS,new Date(olpFirst()+'T12:00:00'));}
function olpTrialOver(){return todayStr()>=olpTrialEnd();}
function olpLevel(){return _olp.srv?'pro':_olp.rc;}
function olpLocked(){return _olp.on&&!!olpStore()&&olpTrialOver()&&olpLevel()==='none';}
/* the two places that write: an area, and a new evening. Reading is never locked. */
function olpBlocks(what){
  if(what==='endofday'||!olpLocked())return false;
  olpOpen('base');return true;
}
function olpTake(ci){
  var a=(ci&&ci.entitlements&&ci.entitlements.active)||{},e=a.pro||a.base;
  _olp.rc=a.pro?'pro':a.base?'base':'none';
  _olp.until=e&&e.expirationDate?Date.parse(e.expirationDate)||0:0;
  try{localStorage.setItem('olp_lvl',_olp.rc);}catch(x){}
  if(document.getElementById('settings-view'))try{renderSettings();}catch(x){}
}
function olpAsk(fresh){
  return fetch(SYNC_SERVER+'/pro'+meterQ()+(fresh?'&fresh=1':'')).then(function(r){return r.json();}).then(function(j){
    if(!j||!j.ok)return;
    _olp.on=!!j.on;_olp.srv=!!j.pro;
    try{localStorage.setItem('olp_on',_olp.on?'1':'');}catch(e){}
  }).catch(function(){});
}
function olpInit(){
  if(!olpNative())return;
  olpFirst();
  try{_olp.on=localStorage.getItem('olp_on')==='1';_olp.rc=localStorage.getItem('olp_lvl')||'none';}catch(e){}
  var P=olpStore();
  var who=P?P.configure({apiKey:OLP_RC_KEY,appUserID:installId()}).then(function(){return P.getCustomerInfo();})
    .then(function(r){olpTake(r&&(r.customerInfo||r));}).catch(function(){}):Promise.resolve();
  Promise.all([olpAsk(false),who]).then(function(){
    /* the two answers arrive in either order, and the settings row needs both */
    if(document.getElementById('settings-view'))try{renderSettings();}catch(e){}
    /* once a day, when the week is over and nothing was bought */
    var d='';try{d=localStorage.getItem('olp_shown')||'';}catch(e){}
    if(olpLocked()&&d!==todayStr()){try{localStorage.setItem('olp_shown',todayStr());}catch(e){}olpOpen('base');}
  });
}
window.addEventListener('load',function(){setTimeout(function(){try{olpInit();}catch(e){}},2000);});
/* a paid call refused by the server opens the screen on Pro */
(function(){
  var f=window.fetch;if(!f)return;
  window.fetch=function(u){
    var p=f.apply(this,arguments);
    try{
      var s=String((u&&u.url)||u);
      if(SYNC_SERVER&&s.indexOf(SYNC_SERVER)===0)p.then(function(r){if(r&&r.status===402)olpOpen('pro');},function(){});
    }catch(e){}
    return p;
  };
})();
/* day 8: the first week's summary has just been shown - the moment to ask */
function olpAfterWeek(){if(olpLocked())olpOpen('base');}
function olpPkg(lv,per){var o=_olp.offer||{};return o['olimei.'+lv+'.'+(per==='year'?'yearly':'monthly')]||null;}
function olpOpen(tab){
  if(!olpNative())return;
  _olp.tab=tab==='pro'?'pro':'base';_olp.per='year';_olp.msg='';
  var o=document.getElementById('olp');
  if(!o){o=document.createElement('div');o.id='olp';o.className='olp';document.body.appendChild(o);}
  document.body.classList.add('sheet-open');
  olpPaint();
  var P=olpStore();
  if(P&&!_olp.offer)P.getOfferings().then(function(r){
    var c=r&&r.current,k=(c&&c.availablePackages)||[],i;
    _olp.offer={};
    for(i=0;i<k.length;i++)if(k[i]&&k[i].product)_olp.offer[k[i].product.identifier]=k[i];
    olpPaint();
  }).catch(function(){_olp.offer={};olpPaint();});
}
function olpClose(){
  var o=document.getElementById('olp');if(o)o.remove();
  document.body.classList.remove('sheet-open');
}
function olpTab(t){_olp.tab=t;_olp.msg='';olpPaint();}
function olpPer(p){_olp.per=p;olpPaint();}
function olpPaint(){
  var o=document.getElementById('olp');if(!o)return;
  var pro=_olp.tab==='pro',name=pro?'Olimei Pro':'Olimei';
  var y=olpPkg(_olp.tab,'year'),m=olpPkg(_olp.tab,'month'),pk=olpPkg(_olp.tab,_olp.per);
  var f=pro?[_t('המאמן – לשאול, לתכנן, לקבל תשובה על היום'),_t('צילום של ארוחה, והערכים שלה'),_t('תכנון שבוע ומתכונים'),_t('לדבר במקום להקליד, ו־Mip שעונה')]
           :[_t('סיום יום, וכל הימים שכבר נכתבו'),_t('הסיכום השבועי'),_t('הרגלים, אימונים והארון'),_t('יומן האוכל')];
  var save=(y&&m&&m.product.price>0)?Math.round((1-y.product.price/(m.product.price*12))*100):0;
  var h='<div class="olp-box" role="dialog" aria-modal="true">'+
    '<button class="olp-x" onclick="olpClose()" aria-label="'+_t('סגור')+'">&#10005;</button>'+
    '<img class="olp-sun" alt="" src="'+liveBase()+'assets/pro/sun.jpg">'+
    '<div class="olp-seg"><button class="'+(pro?'':'on')+'" onclick="olpTab(\'base\')">Olimei</button>'+
    '<button class="'+(pro?'on':'')+'" onclick="olpTab(\'pro\')">Olimei Pro</button></div>'+
    '<p class="olp-t">'+name+'</p>'+
    '<p class="olp-s">'+(pro?_t('כל מה שיש ב־{name}, ועוד ה־AI, בלי הגבלה',{name:'Olimei'}):_t('להמשיך לסגור כל יום, ולשמור כל זיכרון'))+'</p>'+
    '<ul class="olp-f"><li>'+f.join('</li><li>')+'</li></ul>';
  if(_olp.offer===null)h+='<p class="olp-fine">&#8230;</p>';
  else if(!y&&!m)h+='<p class="olp-m">'+_t('החנות לא זמינה כרגע. אפשר לנסות שוב מאוחר יותר.')+'</p>';
  else{
    if(y)h+='<button class="olp-plan'+(_olp.per==='year'?' on':'')+'" onclick="olpPer(\'year\')"><span><b>'+_t('שנתי')+'</b>'+
      (y.product.pricePerMonthString?'<small>'+_t('{p} לחודש',{p:y.product.pricePerMonthString})+'</small>':'')+'</span>'+
      (save>0?'<i>'+_t('חיסכון של {p}',{p:pfmt(save)})+'</i>':'')+'<em>'+esc(y.product.priceString)+'</em></button>';
    if(m)h+='<button class="olp-plan'+(_olp.per==='month'?' on':'')+'" onclick="olpPer(\'month\')"><span><b>'+_t('חודשי')+'</b>'+
      '<small>'+_t('אפשר לבטל בכל רגע')+'</small></span><em>'+esc(m.product.priceString)+'</em></button>';
  }
  h+='<button class="olp-cta" onclick="olpBuy()"'+(pk&&!_olp.busy?'':' disabled')+'>'+(_olp.busy?'&#8230;':_t('להמשיך עם {name}',{name:name}))+'</button>'+
    '<p class="olp-m">'+esc(_olp.msg)+'</p>';
  if(pk)h+='<p class="olp-fine">'+(_olp.per==='year'
      ?_t('{p} לשנה, מתחדש לבד, אלא אם מבטלים עד {h} שעות לפני החידוש, בהגדרות של ה־App Store.',{p:pk.product.priceString,h:24})
      :_t('{p} לחודש, מתחדש לבד, אלא אם מבטלים עד {h} שעות לפני החידוש, בהגדרות של ה־App Store.',{p:pk.product.priceString,h:24}))+' '+
    (pro?_t('אפשר לעבור בין הרמות בכל רגע.'):_t('הימים שכבר נכתבו נשארים זמינים גם בלי מנוי: לקרוא ולייצא, תמיד.'))+'</p>';
  h+='<div class="olp-l"><button onclick="olpRestore()">'+_t('שחזור רכישה')+'</button>'+
    '<button onclick="pplOpenExt(OLP_TERMS)">'+_t('תנאי שימוש')+'</button>'+
    '<button onclick="pplOpenExt(OLP_PRIVACY)">'+_t('פרטיות')+'</button></div></div>';
  o.innerHTML=h;
}
function olpCancelled(e){return !!(e&&(e.userCancelled||e.code==='1'||e.code===1||/cancel/i.test(String(e.message||''))));}
function olpBuy(){
  var P=olpStore(),pk=olpPkg(_olp.tab,_olp.per);
  if(!P||!pk||_olp.busy)return;
  _olp.busy=true;_olp.msg='';olpPaint();
  P.purchasePackage({aPackage:pk}).then(function(r){
    _olp.busy=false;olpTake(r&&r.customerInfo);olpAsk(true);olpClose();
    showToast(_t('תודה! המנוי פעיל.'));
  }).catch(function(e){
    _olp.busy=false;_olp.msg=olpCancelled(e)?'':_t('הרכישה לא הושלמה. אפשר לנסות שוב.');olpPaint();
  });
}
function olpRestore(){
  var P=olpStore();
  if(!P){_olp.msg=_t('החנות לא זמינה כרגע. אפשר לנסות שוב מאוחר יותר.');olpPaint();return;}
  if(_olp.busy)return;
  _olp.busy=true;_olp.msg='';olpPaint();
  P.restorePurchases().then(function(r){
    _olp.busy=false;olpTake(r&&r.customerInfo);olpAsk(true);
    if(olpLevel()==='none'){_olp.msg=_t('לא נמצאה רכישה קודמת.');olpPaint();return;}
    olpClose();showToast(_t('המנוי שוחזר.'));
  }).catch(function(){_olp.busy=false;_olp.msg=_t('הרכישה לא הושלמה. אפשר לנסות שוב.');olpPaint();});
}
function olpManage(){var P=olpStore();if(P&&P.showManageSubscriptions)P.showManageSubscriptions().catch(function(){});}
/* the row in settings: what you have, and the way to change it */
function olpSetRow(){
  if(!(_olp.on&&olpStore()))return '';
  var lv=olpLevel(),sub,go;
  if(lv!=='none'){
    sub=(lv==='pro'?'Olimei Pro':'Olimei')+(_olp.until?' · '+_t('פעיל עד {d}',{d:dfmt(new Date(_olp.until))}):'');
    go=lv==='pro'?'olpManage()':'olpOpen(\'pro\')';
  }else{
    sub=olpTrialOver()?_t('אין מנוי פעיל'):_t('שבוע הניסיון נגמר ב־{d}',{d:dfmt(new Date(olpTrialEnd()+'T12:00:00'))});
    go='olpOpen(\'base\')';
  }
  return '<button class="set-hl" onclick="'+go+'"><span><b>'+_t('המנוי')+'</b><i>'+sub+'</i></span><em>&#8249;</em></button>';
}
`,
  ],
  [
    String.raw`function enterModule(mod){
  /* (the first-visit card is gone: each area explains itself) */`,
    String.raw`function enterModule(mod){
  if(olpBlocks(mod))return;
  /* (the first-visit card is gone: each area explains itself) */`,
  ],
  [
    String.raw`function rfStart(d){rfmKeep();`,
    String.raw`function rfStart(d){if(olpBlocks('write'))return;rfmKeep();`,
  ],
  [
    String.raw`  document.body.style.overflow='';
  renderMe();
}
function wkDeckGo(n){`,
    String.raw`  document.body.style.overflow='';
  renderMe();
  olpAfterWeek();
}
function wkDeckGo(n){`,
  ],
  [
    String.raw`'<em>'+(hlOn().length?_t('{n} פעילים',{n:hlOn().length}):_t('לא הוגדר'))+' &#8249;</em></button>';
`,
    String.raw`'<em>'+(hlOn().length?_t('{n} פעילים',{n:hlOn().length}):_t('לא הוגדר'))+' &#8249;</em></button>';
  h+=olpSetRow();
`,
  ],
];

let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 120)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
