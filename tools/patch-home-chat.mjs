/* THE SECOND INTERFACE, built (Asaf approved review/chat-proto on 25 Oct:
 * the glass, softer and precise; entering an area gently; one conversation
 * per place; questions that are real).
 *
 * A switch on the home screen, dial or chat, kept. The chat is the same app
 * underneath - nothing new is stored about food, tasks or people:
 *  - general chat: a sentence goes to /route, the command line's own router;
 *    what it finds is offered as a card (add / cancel) and written by
 *    hcmdWrite, the command line's own writer. Food moves to nutrition. A
 *    question, or a sentence the router cannot place, goes to Mip (/beem).
 *  - nutrition: IS the coach - its record, its replies, its camera, its
 *    edits - mounted in the chat instead of in the nutrition screen.
 *  - the other areas: the same router for things to save, Mip for questions,
 *    asked with that area as the screen so his answer is about it.
 * The suggested questions are the ones each place can really answer: Mip's
 * own per-screen questions (answered from the guide), and in nutrition two
 * the coach answers from the day's log.
 * The conversation per place lives for the app's day (home_chat).
 */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* ── CSS ── */
rep(`.hcmd-row{display:flex;align-items:flex-end;gap:8px}`, `.hcmd-row{display:flex;align-items:flex-end;gap:8px}
/* ── the second interface: one chat (review/chat-proto, approved 25.10) ──
   Glass over a field of the areas' own light. One rim and one haze for every
   piece of glass; colour only as light. */
.hch-mode{position:absolute;top:calc(env(safe-area-inset-top) + 18px);inset-inline-start:66px;z-index:6;display:flex;gap:2px;padding:3px;border-radius:999px;
  background:rgba(255,255,255,.28);box-shadow:inset 0 0 0 .5px rgba(255,255,255,.75),inset 1px 2px 5px rgba(110,92,72,.12)}
.hch-mode button{width:38px;height:32px;border:none;border-radius:999px;background:transparent;color:var(--nu-muted,#6d675e);cursor:pointer;display:grid;place-items:center;padding:0}
.hch-mode button.on{background:rgba(255,255,255,.62);color:var(--nu-ink,#4a453f);box-shadow:inset 0 0 0 .5px rgba(255,255,255,.75),inset 0 1px 0 rgba(255,255,255,.95),0 6px 14px -5px rgba(110,92,72,.2)}
.hch-mode svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round}
.hch{display:none}
#home-screen.hch-on>*:not(.hch):not(.hch-mode):not(.home-menu){display:none!important}
#home-screen.hch-on .hch{display:block;position:fixed;left:0;right:0;top:0;bottom:var(--hch-bottom,88px);z-index:5;max-width:520px;margin:0 auto;
  --glass:rgba(255,255,255,.46);--rim:inset 0 0 0 .5px rgba(255,255,255,.75),inset 0 1px 0 rgba(255,255,255,.95);
  --haze:0 1px 2px rgba(110,92,72,.05),0 10px 26px -6px rgba(110,92,72,.12);color:var(--nu-ink,#4a453f)}
body.mod-home.hch-chat .bhelp,body.mod-home.hch-chat .bhalo{display:none!important}
.hch .glass,.hch-tile,.hch-in,.hch-btn,.hch-sug button,.hch-u,.hch .co-u{background:var(--glass);backdrop-filter:blur(22px) saturate(1.25);-webkit-backdrop-filter:blur(22px) saturate(1.25);box-shadow:var(--rim),var(--haze)}
.hch-head{position:absolute;top:calc(env(safe-area-inset-top) + 16px);left:0;right:0;height:46px;display:flex;justify-content:center;pointer-events:none;z-index:4}
.hch-empty{position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top) + 104px);text-align:center;transition:opacity .3s,transform .4s;padding:0 24px}
.hch-empty.gone{opacity:0;transform:translateY(-20px);pointer-events:none}
.hch-sign{position:relative;width:150px;height:150px;margin:0 auto}
.hch-mip{position:absolute;inset:0;transition:opacity .55s ease,transform .7s cubic-bezier(.22,.61,.36,1),filter .55s ease}
.hch.in-area .hch-mip{opacity:0;transform:scale(.86) translateY(-6px);filter:blur(6px)}
.hch-disc{position:absolute;left:50%;top:50%;width:96px;height:96px;margin:-48px 0 0 -48px;border-radius:50%;display:grid;place-items:center;
  opacity:0;transform:scale(.9);filter:blur(4px);transition:opacity .6s ease .25s,transform .8s cubic-bezier(.22,.61,.36,1) .2s,filter .6s ease .25s;
  background:var(--glass);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);box-shadow:var(--rim),0 14px 34px -8px rgba(110,92,72,.16)}
.hch-disc::before{content:"";position:absolute;inset:14px;z-index:-1;border-radius:50%;filter:blur(18px);background:color-mix(in srgb,var(--c) 34%,transparent)}
.hch-disc svg{width:40px;height:40px;fill:none;stroke:var(--c);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.hch.in-area .hch-disc{opacity:1;transform:none;filter:none}
.hch-hello{font-size:27px;font-weight:800;margin:16px 0 4px;letter-spacing:-.3px;transition:opacity .35s}
.hch-hello2{font-size:15.5px;color:var(--nu-muted,#6d675e);margin:0;transition:opacity .35s}
.hch-empty.swap .hch-hello,.hch-empty.swap .hch-hello2{opacity:0}
.hch-open{margin-top:12px;border:none;border-radius:999px;padding:8px 14px;font:700 13.5px inherit;font-family:inherit;color:var(--nu-muted,#6d675e);cursor:pointer;
  background:var(--glass);box-shadow:var(--rim),var(--haze)}
.hch-talk{position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top) + 72px);bottom:var(--hch-dock,190px);overflow-y:auto;padding:8px 18px 14px;
  display:flex;flex-direction:column;gap:12px;scrollbar-width:none;transition:opacity .3s ease}
.hch-talk::-webkit-scrollbar{display:none}
.hch-talk.out{opacity:0}
.hch-u{align-self:flex-start;max-width:80%;padding:11px 15px;border-radius:20px 20px 6px 20px;font-size:16px;line-height:1.45;font-weight:600;white-space:pre-wrap;overflow-wrap:anywhere}
.hch-b{align-self:flex-end;max-width:88%;display:flex;gap:9px;align-items:flex-start;font-size:16px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere}
.hch-b>div{min-width:0}
.hch-av{flex:none;width:34px;height:34px;margin-top:-3px;border-radius:50%}
.hch-av.mip{background:url(assets/beem-f-happy.png) center/125% no-repeat,url(assets/beem-body.png) center/125% no-repeat}
.hch-av.area{display:grid;place-items:center;background:var(--glass);box-shadow:var(--rim),0 4px 10px -3px rgba(110,92,72,.14)}
.hch-av svg{width:18px;height:18px;fill:none;stroke:var(--c);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.hch-dots{display:flex;gap:4px;padding:10px 0}.hch-dots i{width:7px;height:7px;border-radius:50%;background:#c8bdb0;animation:hch-bl 1s infinite}
.hch-dots i:nth-child(2){animation-delay:.15s}.hch-dots i:nth-child(3){animation-delay:.3s}
@keyframes hch-bl{50%{opacity:.3}}
.hch-card{margin-top:8px;padding:11px 12px;border-radius:16px;font-size:14.5px;font-weight:700;white-space:normal;
  background:rgba(255,255,255,.3);box-shadow:var(--rim),0 1px 2px rgba(110,92,72,.04)}
.hch-card .row{display:flex;align-items:center;gap:10px}
.hch-card .ic{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--glass);box-shadow:var(--rim)}
.hch-card .ic svg{width:17px;height:17px;fill:none;stroke:var(--c);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.hch-card small{display:block;font-weight:600;color:var(--nu-muted,#6d675e);font-size:12.5px;margin-top:1px}
.hch-card textarea{width:100%;margin-top:8px;border:none;border-radius:12px;padding:9px 11px;font:600 15px inherit;font-family:inherit;color:inherit;resize:none;
  background:rgba(255,255,255,.5);box-shadow:inset 0 0 0 .5px rgba(255,255,255,.8),inset 1px 2px 5px rgba(110,92,72,.1);outline:none}
.hch-card .btns{display:flex;gap:8px;margin-top:9px}
.hch-card .btns button{border:none;border-radius:999px;padding:8px 15px;font:800 14px inherit;font-family:inherit;color:var(--nu-ink,#4a453f);cursor:pointer;background:var(--glass);box-shadow:var(--rim),var(--haze)}
.hch-card .btns button.ghost{background:transparent;box-shadow:none;color:var(--nu-muted,#6d675e)}
.hch-card.go{cursor:pointer}
.hch-dock{position:absolute;left:0;right:0;bottom:0;padding:0 0 14px;z-index:3}
.hch-dock::before{content:"";position:absolute;left:-14%;right:-14%;bottom:20px;height:250px;z-index:-1;filter:blur(46px);opacity:.6;pointer-events:none;transition:opacity .6s,height .6s;
  background:radial-gradient(30% 42% at 12% 42%,rgba(166,144,207,.38),transparent),radial-gradient(28% 44% at 38% 32%,rgba(224,138,114,.32),transparent),
    radial-gradient(28% 42% at 62% 44%,rgba(111,178,131,.32),transparent),radial-gradient(30% 44% at 88% 36%,rgba(58,124,165,.28),transparent),
    radial-gradient(44% 32% at 50% 82%,rgba(240,169,46,.22),transparent)}
.hch.in-area .hch-dock::before{opacity:.22;height:120px}
.hch-sug{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;padding:0 16px 12px}
.hch-sug.one{flex-wrap:nowrap;justify-content:flex-start;overflow-x:auto;scrollbar-width:none}
.hch-sug.one::-webkit-scrollbar{display:none}
.hch-sug button{flex:none;border:none;border-radius:999px;padding:8px 14px;font:700 13.5px inherit;font-family:inherit;color:#5a544c;cursor:pointer}
.hch-areas{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:0 16px 14px;max-height:240px;overflow:hidden;
  transition:max-height .55s cubic-bezier(.4,0,.2,1),padding .55s cubic-bezier(.4,0,.2,1)}
.hch-areas.folded{max-height:0;padding-top:0;padding-bottom:0}
.hch-tile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;height:66px;padding:0 4px;border:none;border-radius:20px;cursor:pointer;
  font:700 12.5px inherit;font-family:inherit;color:#5a544c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .3s,background .2s}
.hch-tile span{max-width:100%;overflow:hidden;text-overflow:ellipsis}
.hch-tile svg{width:20px;height:20px;flex:none;fill:none;stroke:var(--c);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 2.5px color-mix(in srgb,var(--c) 45%,transparent))}
.hch-tile:active{transform:scale(.97);background:rgba(255,255,255,.3)}
.hch .hch-tile.leave{opacity:0;transform:translateY(8px) scale(.94);filter:blur(4px);pointer-events:none;
  transition:opacity .42s ease var(--d,0s),transform .5s cubic-bezier(.4,0,.2,1) var(--d,0s),filter .42s ease var(--d,0s)}
.hch-tile.hide{opacity:0;pointer-events:none}
.hch-tile.top{position:relative;flex-direction:row;height:42px;padding:0 14px 0 12px;font-size:14.5px;gap:8px;border-radius:999px;color:var(--nu-ink,#4a453f);pointer-events:auto}
.hch-tile.top::before{content:"";position:absolute;inset:6px 10px -10px;z-index:-1;border-radius:999px;filter:blur(14px);background:color-mix(in srgb,var(--c) 30%,transparent)}
.hch-tile.top::after{content:"\\00d7";margin-inline-start:4px;font-size:17px;font-weight:600;color:#8f877d}
.hch-row{display:flex;align-items:flex-end;gap:10px;padding:0 16px}
.hch-in{flex:1;min-height:54px;max-height:140px;border:none;border-radius:27px;padding:16px 20px;font:600 16px inherit;font-family:inherit;color:var(--nu-ink,#4a453f);outline:none;resize:none;line-height:1.35}
.hch-in::placeholder{color:#9a9188}
.hch-btn{flex:none;width:50px;height:50px;border:none;border-radius:50%;color:#5a544c;cursor:pointer;display:grid;place-items:center;padding:0;margin-bottom:2px}
.hch-btn:active{transform:scale(.96);background:rgba(255,255,255,.3)}
.hch-btn svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
/* nutrition IS the coach, in the chat's glass */
.hch.nut .hch-row{display:none}
.hch .co{position:absolute;inset:0;display:flex;flex-direction:column;background:none;box-shadow:none;padding:0;margin:0}
.hch .co-frame{flex:1;min-height:0;overflow:hidden;background:none;box-shadow:none;padding:0}
.hch .co-list{height:100%;overflow-y:auto;padding:8px 18px 12px;max-height:none;background:none}
.hch .co-empty{display:none}
.hch .co-u{border-radius:20px 20px 6px 20px}
.hch .co-bar{margin:0 16px;padding:6px;border-radius:30px;background:var(--glass);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);box-shadow:var(--rim),var(--haze)}
.hch.nut .hch-talk{bottom:14px}
.hch.nut .hch-dock{bottom:76px}
.hch.nut .hch-dock::before{display:none}`);

/* ── the home markup: the switch and the chat ── */
rep(`    '<button class="home-menu" id="home-menu-btn" aria-label="'+_t("מה במעקב")+'"><i></i><i></i><i></i></button>'+`,
  `    '<button class="home-menu" id="home-menu-btn" aria-label="'+_t("מה במעקב")+'"><i></i><i></i><i></i></button>'+
    /* dial or chat - the second interface, see hchSync */
    '<div class="hch-mode" id="hch-mode"></div><div class="hch" id="hch"></div>'+`);
rep(`  document.body.appendChild(home);
  hcmdMount();`, `  document.body.appendChild(home);
  hcmdMount();
  hchSync();`);

/* ── the coach tells the chat when it has painted ── */
rep(`  coachGrow(document.getElementById('co-in'));
  coachEdges();
}`, `  coachGrow(document.getElementById('co-in'));
  coachEdges();
  if(_hch&&_hch.area==='nutrition')hchCoachPainted();
}`);

/* ── JS ── */
rep(`// Build home screen DOM
(function(){`, `/* ── THE SECOND INTERFACE: ONE CHAT ──
   Approved on review/chat-proto (25.10). A switch on the home screen, dial or
   chat, kept. Nothing new is stored about the day: the general chat and the
   areas route through the command line (/route, hcmdWrite), questions go to
   Mip (/beem) with the place as his screen, and nutrition IS the coach -
   its record and replies, mounted here instead of in the nutrition screen.
   What is said here lives one app day per place (home_chat). */
var HCH_MODE_KEY='home_mode',HCH_KEY='home_chat';
var _hch={area:'',busy:false,fold:0,mip:null};
var HCH_DIAL='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.5"/></svg>';
var HCH_CHAT='<svg viewBox="0 0 24 24"><path d="M5 18.5 4 21l3.6-1.4A8.5 8.5 0 1 0 5 18.5Z"/></svg>';
function hchMode(){try{return localStorage.getItem(HCH_MODE_KEY)==='chat'?'chat':'dial';}catch(e){return 'dial';}}
function hchSetMode(m){
  try{localStorage.setItem(HCH_MODE_KEY,m);}catch(e){}
  hchSync();
  if(m==='dial'){try{renderHomeGrid();}catch(e){}}
}
function hchLoad(){
  var o=null;try{o=JSON.parse(localStorage.getItem(HCH_KEY)||'null');}catch(e){}
  if(!o||o.day!==todayStr()||!o.t)o={day:todayStr(),t:{}};
  return o;
}
function hchSave(o){try{localStorage.setItem(HCH_KEY,JSON.stringify(o));}catch(e){}}
function hchThread(k){return hchLoad().t[k||'']||[];}
function hchPush(k,m){
  var o=hchLoad(),t=o.t[k||'']=o.t[k||'']||[];
  t.push(m);if(t.length>80)t.splice(0,t.length-80);
  hchSave(o);return t.length-1;
}
function hchPut(k,i,m){var o=hchLoad(),t=o.t[k||''];if(t&&t[i]){if(m)t[i]=m;else t.splice(i,1);hchSave(o);}}
function hchAreas(){
  var out=[],i;
  for(i=0;i<HOME_AREAS.length;i++)if(HOME_AREAS[i].fixed||areaShown(HOME_AREAS[i].id))out.push(HOME_AREAS[i]);
  return out;
}
function hchSync(){
  var on=hchMode()==='chat',hs=document.getElementById('home-screen');
  if(hs)hs.classList.toggle('hch-on',on);
  document.body.classList.toggle('hch-chat',on);
  var m=document.getElementById('hch-mode');
  if(m)m.innerHTML='<button class="'+(on?'':'on')+'" onclick="hchSetMode(\\'dial\\')" aria-pressed="'+(!on)+'" aria-label="'+esc(_t('חוגה'))+'">'+HCH_DIAL+'</button>'+
    '<button class="'+(on?'on':'')+'" onclick="hchSetMode(\\'chat\\')" aria-pressed="'+on+'" aria-label="'+esc(_t('צ׳אט'))+'">'+HCH_CHAT+'</button>';
  if(on)hchBuild();
}
langOn(function(){if(document.getElementById('hch-mode'))hchSync();});
/* the frame is built once; hchFill paints what changes */
function hchBuild(){
  var w=document.getElementById('hch');if(!w)return;
  if(!document.getElementById('hch-talk')){
    w.innerHTML='<div class="hch-head" id="hch-head"></div>'+
      '<div class="hch-empty" id="hch-empty"><div class="hch-sign"><div class="hch-mip" id="hch-mip"></div><div class="hch-disc" id="hch-disc"></div></div>'+
        '<div class="hch-hello" id="hch-hello"></div><p class="hch-hello2" id="hch-hello2"></p><div id="hch-openw"></div></div>'+
      '<div class="hch-talk" id="hch-talk"></div>'+
      '<div class="hch-dock" id="hch-dock"><div class="hch-sug" id="hch-sug"></div><div class="hch-areas" id="hch-areas"></div>'+
        '<div class="hch-row" id="hch-row"></div></div>';
    beemKit().then(function(K){var el=document.getElementById('hch-mip');if(el&&!el.firstChild)_hch.mip=K.mount(el,{play:DOOR_BEEM.smile});}).catch(function(){});
  }
  var tb=document.querySelector('.tabbar');
  if(tb){var r=tb.getBoundingClientRect();if(r.height)w.style.setProperty('--hch-bottom',Math.max(0,innerHeight-r.top)+'px');}
  hchRowPaint();hchTilesPaint();
  if(_hch.area){var top=hchTopTile(_hch.area);var hd=document.getElementById('hch-head');hd.innerHTML='';if(top)hd.appendChild(top);
    document.getElementById('hch-areas').classList.add('folded');}
  w.classList.toggle('in-area',!!_hch.area);
  hchFill();
}
function hchRowPaint(){
  var row=document.getElementById('hch-row');if(!row)return;
  var old=document.getElementById('hch-in'),v=old?old.value:'';
  row.innerHTML='<textarea id="hch-in" class="hch-in" rows="1" maxlength="1000" enterkeyhint="send" autocomplete="off"'+
    ' placeholder="'+esc(_t('מה אכלת, מה לזכור, מה לעשות…'))+'" oninput="rfmGrow(this)"'+
    ' onkeydown="if(event.key===\\'Enter\\'&&!event.shiftKey){event.preventDefault();hchSend();}"></textarea>'+
    ((HV_SR||micCan())?'<button class="hch-btn mic-btn" id="hch-mic" data-base="hch-btn mic-btn" onclick="micToggle(\\'hch-in\\',\\'hch-mic\\',function(){hchSend();})" aria-label="'+esc(_t('דיבור'))+'">'+
      '<svg viewBox="0 0 24 24"><path d="M12 3.5a2.8 2.8 0 0 1 2.8 2.8v5a2.8 2.8 0 0 1-5.6 0v-5A2.8 2.8 0 0 1 12 3.5z"/><path d="M6 11a6 6 0 0 0 12 0M12 17v3.5"/></svg></button>':'')+
    '<button class="hch-btn" onclick="hchSend()" aria-label="'+esc(_t('שלח'))+'"><svg viewBox="0 0 24 24"><path d="M12 19V5"/><path d="M6 11l6-6 6 6"/></svg></button>';
  var i=document.getElementById('hch-in');if(i&&v){i.value=v;rfmGrow(i);}
}
function hchTilesPaint(){
  var el=document.getElementById('hch-areas');if(!el)return;
  el.innerHTML=hchAreas().map(function(a){
    return '<button class="hch-tile" data-k="'+a.id+'" style="--c:'+a.color+'" onclick="hchChoose(\\''+a.id+'\\',this)">'+a.svg+'<span>'+esc(a.title)+'</span></button>';
  }).join('');
}
function hchTopTile(k){
  var a=areaDef(k);if(!a)return null;
  var b=document.createElement('button');b.className='hch-tile top';b.style.setProperty('--c',a.color);
  b.innerHTML=a.svg+'<span>'+esc(a.title)+'</span>';b.setAttribute('aria-label',a.title);
  b.onclick=function(){hchBack();};return b;
}
/* what each place can really answer: Mip's own questions for that screen
   (answered from the guide), and in nutrition two the coach answers */
function hchSug(k){
  if(k==='nutrition')return [_t('כמה חלבון נשאר לי היום?'),_t('כמה חלבון אכלתי היום?')];
  return beemHelpSug(k||'home');
}
function hchSugPaint(){
  var el=document.getElementById('hch-sug');if(!el)return;
  var k=_hch.area,list=hchSug(k),said=[],t=k==='nutrition'?loadCoach(todayStr()).turns:hchThread(k),i;
  for(i=0;i<t.length;i++)if(t[i].w==='u'||t[i].role==='user')said.push(t[i].x||t[i].text||'');
  var started=said.length>0;
  if(started)list=list.filter(function(q){return said.indexOf(q)<0;});
  el.classList.toggle('one',started);
  el.innerHTML=list.map(function(q){return '<button data-q="'+esc(q)+'">'+esc(q)+'</button>';}).join('');
  [].forEach.call(el.querySelectorAll('button'),function(b){b.onclick=function(){hchSend(b.getAttribute('data-q'));};});
}
function hchDockSize(){
  requestAnimationFrame(function(){var d=document.getElementById('hch-dock'),w=document.getElementById('hch');
    if(d&&w)w.style.setProperty('--hch-dock',d.offsetHeight+'px');});
}
function hchAvatar(){
  var a=_hch.area&&areaDef(_hch.area);
  return a?'<i class="hch-av area" style="--c:'+a.color+'">'+a.svg+'</i>':'<i class="hch-av mip"></i>';
}
function hchFill(){
  var k=_hch.area,a=k&&areaDef(k),w=document.getElementById('hch');if(!w)return;
  w.classList.toggle('nut',k==='nutrition');
  var hello=document.getElementById('hch-hello'),h2=document.getElementById('hch-hello2'),ow=document.getElementById('hch-openw');
  if(a){
    hello.textContent=a.title;h2.textContent=k==='nutrition'?_t('מה אכלת? אפשר גם לשאול'):_t('מה שנכתב כאן נשמר ב{area}',{area:a.title});
    ow.innerHTML='<button class="hch-open" onclick="hchOpenArea(\\''+k+'\\')">'+_t('פתח')+' &rsaquo;</button>';
    var disc=document.getElementById('hch-disc');disc.style.setProperty('--c',a.color);disc.innerHTML=a.svg;
  } else {
    hello.textContent=greetText().text;h2.textContent=_t('על מה נדבר?');ow.innerHTML='';
  }
  var talk=document.getElementById('hch-talk'),started;
  if(k==='nutrition'){
    /* one coach on the page: a nutrition screen left behind gives its ids up */
    [].forEach.call(document.querySelectorAll('#co-wrap'),function(e){if(!talk.contains(e)){e.innerHTML='';e.removeAttribute('id');}});
    if(!document.getElementById('co-wrap'))talk.innerHTML='<div class="co" id="co-wrap"></div>';
    coachPaint();
    started=loadCoach(todayStr()).turns.length>0;
  } else {
    talk.innerHTML=hchThreadHTML(k);
    started=hchThread(k).length>0;
    talk.scrollTop=talk.scrollHeight;
  }
  document.getElementById('hch-empty').classList.toggle('gone',started);
  hchSugPaint();hchDockSize();
}
function hchCoachPainted(){
  var e=document.getElementById('hch-empty');
  if(e)e.classList.toggle('gone',loadCoach(todayStr()).turns.length>0);
  hchSugPaint();
}
function hchThreadHTML(k){
  var t=hchThread(k),h='',i;
  for(i=0;i<t.length;i++){
    var m=t[i];
    if(m.w==='u'){h+='<div class="hch-u">'+esc(m.x)+'</div>';continue;}
    h+='<div class="hch-b">'+hchAvatar()+'<div>'+(m.x?mdLite(m.x):'')+hchCardHTML(k,i,m)+'</div></div>';
  }
  if(_hch.busy)h+='<div class="hch-b">'+hchAvatar()+'<div class="hch-dots"><i></i><i></i><i></i></div></div>';
  return h;
}
/* the command line's own question for a route, as a card in the talk */
function hchCardHTML(k,i,m){
  var a,ic=function(id){var d=areaDef(id);return d?'<span class="ic" style="--c:'+d.color+'">'+d.svg+'</span>':'';};
  if(m.done){
    a=areaDef(m.done.area);
    return '<div class="hch-card go" onclick="hchOpenArea(\\''+m.done.area+'\\','+(typeof m.done.person==='number'?m.done.person:-1)+')"><div class="row">'+ic(m.done.area)+
      '<div>'+_t('נשמר ב{area}',{area:a?a.title:_t('הספר שלי')})+(m.wh?'<small>'+m.wh+'</small>':'')+'</div></div></div>';
  }
  if(m.go){
    a=areaDef(m.go);
    return '<div class="hch-card go" onclick="hchChoose(\\''+m.go+'\\')"><div class="row">'+ic(m.go)+'<div>'+(a?esc(a.title):'')+' &rsaquo;</div></div></div>';
  }
  if(!m.r)return '';
  var Q=hcmdQuestion(m.r);
  var h='<div class="hch-card"><div>'+Q.q+'</div>';
  if(Q.edit)h+='<textarea id="hch-ed-'+i+'" rows="1" maxlength="1000" oninput="rfmGrow(this)">'+esc(m.r.text||m.q||'')+'</textarea>';
  if(Q.meta)h+='<small>'+Q.meta+'</small>';
  h+='<div class="btns">'+(Q.ok?'<button onclick="hchApply('+i+')">'+_t('הוסף')+'</button>'
      :'<button onclick="hchApply('+i+',\\'moment\\')">'+_t('לשמור כרגע מהיום')+'</button>')+
     '<button class="ghost" onclick="hchDrop('+i+')">'+_t('ביטול')+'</button></div></div>';
  return h;
}
function hchApply(i,as){
  var k=_hch.area,m=hchThread(k)[i];if(!m||!m.r)return;
  var e=document.getElementById('hch-ed-'+i);
  var text=e?String(e.value).trim():String(m.r.text||m.q||'').trim();
  var r=m.r,w=hcmdWrite(as||r.intent,r,text);
  if(!w){showToast(_t('משהו השתבש. אפשר לנסות שוב.'));return;}
  hchPut(k,i,{w:'b',done:w,wh:as?'':hcmdWhere(r)});
  try{renderHomeToday();}catch(err){}
  hchFill();
}
function hchDrop(i){hchPut(_hch.area,i,null);hchFill();}
function hchOpenArea(k,person){
  if(k==='journal'){try{showMain('journal');}catch(e){}return;}
  if(k==='me'){showMain('me');return;}
  if(k==='people'&&typeof person==='number'&&person>=0){enterModule('people');_personIdx=person;_peopleView='person';renderPeople();return;}
  enterModule(k);
}
/* send: nutrition to the coach; a question to Mip; anything else to the router */
function hchSend(text){
  var el=document.getElementById('hch-in');
  var q=String(text!=null?text:(el?el.value:'')).trim();
  if(q.length<2||_hch.busy)return;
  if(el&&text==null){el.value='';rfmGrow(el);}
  var k=_hch.area;
  if(k==='nutrition'){hchCoach(q);return;}
  hchPush(k,{w:'u',x:q});
  if(/[?？؟]\\s*$/.test(q)){hchMip(k);return;}
  hchRoute(k,q);
}
function hchCoach(q){
  if(_coachBusy)return;
  var s=document.getElementById('co-in');
  if(!s){hchFill();s=document.getElementById('co-in');}
  if(s){s.value=q;coachSend();}
}
function hchWait(on){_hch.busy=on;if(_hch.area!=='nutrition'){var t=document.getElementById('hch-talk');if(t){t.innerHTML=hchThreadHTML(_hch.area);t.scrollTop=t.scrollHeight;}}
  var e=document.getElementById('hch-empty');if(e&&on)e.classList.add('gone');hchSugPaint();}
function hchRoute(k,q){
  if(!SYNC_SERVER){hchPush(k,{w:'b',x:_t('אין חיבור כרגע.')});hchFill();return;}
  hchWait(true);
  fetch(SYNC_SERVER+'/route'+meterQ(),{method:'POST',headers:{'Content-Type':'application/json'},body:hcmdBody(q)})
  .then(function(r){return r.json().then(function(j){return {s:r.status,j:j};},function(){return {s:r.status,j:null};});})
  .then(function(x){
    _hch.busy=false;
    if(x.s===429){hchPush(k,{w:'b',x:_t('הגעת למגבלה של היום.')});hchFill();return;}
    if(!x.j||!x.j.ok||!x.j.route){hchPush(k,{w:'b',x:_t('משהו השתבש. אפשר לנסות שוב.')});hchFill();return;}
    var all=x.j.routes||[x.j.route],rs=[],i,food=false;
    for(i=0;i<all.length;i++){
      if(!all[i]||all[i].intent==='unknown')continue;
      if(all[i].intent==='food'){food=true;continue;}
      if(all[i].intent==='open'){if(all.length===1){hchOpenArea(all[i].area);return;}continue;}
      rs.push(all[i]);
    }
    /* food is the coach's: it moves there with the person's own words */
    if(food&&!rs.length){hchPush(k,{w:'b',go:'nutrition'});hchChoose('nutrition');setTimeout(function(){hchCoach(q);},500);return;}
    if(!rs.length){hchMip(k);return;}
    for(i=0;i<rs.length;i++)hchPush(k,{w:'b',r:rs[i],q:q});
    if(food)hchPush(k,{w:'b',go:'nutrition'});
    hchFill();
  },function(){_hch.busy=false;hchPush(k,{w:'b',x:_t('אין חיבור כרגע.')});hchFill();});
}
/* Mip, with the place as his screen and this place's talk as the history */
function hchMip(k){
  if(!SYNC_SERVER){hchPush(k,{w:'b',x:_t('השאלות דורשות חיבור לשרת.')});hchFill();return;}
  var t=hchThread(k),msgs=[],i;
  for(i=0;i<t.length;i++){if(t[i].w==='u')msgs.push({role:'user',content:t[i].x});else if(t[i].x&&!t[i].r)msgs.push({role:'assistant',content:t[i].x});}
  while(msgs.length&&msgs[0].role!=='user')msgs.shift();
  msgs=msgs.slice(-16);while(msgs.length&&msgs[0].role!=='user')msgs.shift();
  hchWait(true);
  foodsLoad(function(){hchMipTurn(k,msgs,0);});
}
function hchMipTurn(k,messages,depth){
  var done=function(text){_hch.busy=false;hchPush(k,{w:'b',x:text});if(_hch.area===k)hchFill();};
  if(depth>=6){done(_t('לא הצלחתי לענות כרגע.'));return;}
  fetch(SYNC_SERVER+'/beem'+meterQ(),{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({messages:messages,lang:appLang(),screen:k||'home',name:greetName(),form:appGender(),today:todayStr()})})
  .then(function(r){return r.json();})
  .then(function(j){
    if(!j||!j.ok){done((j&&j.error==='too many for today')?_t('הגעת למכסה היומית של השאלות.'):_t('לא הצלחתי לענות כרגע.'));return;}
    var content=j.content||[],uses=[],text='',i;
    for(i=0;i<content.length;i++){if(content[i].type==='text')text+=content[i].text;else if(content[i].type==='tool_use')uses.push(content[i]);}
    if(!uses.length){done(text.trim()||_t('לא הצלחתי לענות כרגע.'));return;}
    var results=[];
    for(i=0;i<uses.length;i++){var u=uses[i],val;
      try{val=ASK_TOOLS[u.name]?ASK_TOOLS[u.name](u.input||{}):{error:'unknown tool'};}catch(e){val={error:'could not read that'};}
      results.push({type:'tool_result',tool_use_id:u.id,content:JSON.stringify(val)});}
    hchMipTurn(k,messages.concat([{role:'assistant',content:content},{role:'user',content:results}]),depth+1);
  })
  .catch(function(){done(_t('אין חיבור כרגע.'));});
}
/* entering an area: its tile lifts to the top as one piece, the others leave
   one after another, Mip recedes and the area's sign settles where he was */
function hchChoose(k,el){
  if(_hch.area===k){hchBack();return;}
  var w=document.getElementById('hch');if(!w)return;
  if(_hch.area)hchBack(true);
  el=el||document.querySelector('.hch-tile[data-k="'+k+'"]');
  var hd=document.getElementById('hch-head'),top=hchTopTile(k);if(!top)return;
  hd.innerHTML='';hd.appendChild(top);
  if(el&&el.getBoundingClientRect().height){
    var r0=el.getBoundingClientRect(),r1=top.getBoundingClientRect(),k0=r0.height/r1.height;
    top.style.transition='none';top.style.transformOrigin='0 0';
    top.style.transform='translate('+(r0.left+(r0.width-r1.width*k0)/2-r1.left)+'px,'+(r0.top-r1.top)+'px) scale('+k0+')';
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      top.style.transition='transform .85s cubic-bezier(.22,.61,.36,1),opacity .5s ease';top.style.transform='';});});
  }
  var list=[].slice.call(document.querySelectorAll('#hch-areas .hch-tile')),at=list.indexOf(el);
  list.forEach(function(b,i){if(b===el){b.classList.add('hide');return;}b.style.setProperty('--d',(Math.abs(i-at)*0.045)+'s');b.classList.add('leave');});
  clearTimeout(_hch.fold);_hch.fold=setTimeout(function(){if(_hch.area)document.getElementById('hch-areas').classList.add('folded');hchDockSize();},430);
  hchSwap(k);
  w.classList.add('in-area');
  setTimeout(hchDockSize,1000);
}
function hchBack(silent){
  var w=document.getElementById('hch');if(!w)return;
  var hd=document.getElementById('hch-head'),top=hd.firstChild;
  if(top&&!silent){top.style.transition='opacity .4s ease,transform .5s ease';top.style.opacity='0';top.style.transform='translateY(-6px) scale(.96)';
    setTimeout(function(){if(!_hch.area)hd.innerHTML='';},420);}
  else hd.innerHTML='';
  clearTimeout(_hch.fold);document.getElementById('hch-areas').classList.remove('folded');
  var list=[].slice.call(document.querySelectorAll('#hch-areas .hch-tile')),n=list.length;
  setTimeout(function(){list.forEach(function(b,i){b.classList.remove('hide');b.style.setProperty('--d',((n-1-i)*0.035)+'s');b.classList.remove('leave');});},silent?0:220);
  w.classList.remove('in-area');
  if(!silent)hchSwap('');else _hch.area='';
  setTimeout(hchDockSize,700);
}
/* one conversation per place: the talk fades, the next one comes in */
function hchSwap(k){
  var talk=document.getElementById('hch-talk'),em=document.getElementById('hch-empty');
  talk.classList.add('out');em.classList.add('swap');
  _hch.area=k;
  setTimeout(function(){hchFill();talk.classList.remove('out');em.classList.remove('swap');},300);
}
// Build home screen DOM
(function(){`);

/* ── the command line's question for a route, shared with the chat ── */
rep(`  var text=r.text||_hcmd.q;
  if(r.intent==='quote'){
    var bk=loadBook();
    if(bk&&bk.title)q=_t('להוסיף למשפטים מתוך "{book}"?',{book:esc(bk.title)});
    else{q=_t('אין כרגע ספר פתוח.');ok=false;}
  }
  else if(r.intent==='moment')q=_t('לשמור כרגע מהיום?');
  else if(r.intent==='journal')q=_t('להוסיף ליומן של היום?');
  else if(r.intent==='task'){
    q=(!r.date||r.date===todayStr())?_t('להוסיף לתכנון של היום?')
      :_t('להוסיף לתכנון של {d}?',{d:fmtDate(r.date)});
    if(r.time){var t=r.time.split(':');meta=dpClock(+t[0],+t[1]);}
  }
  else if(r.intent==='person_note')q=_t('לשמור בדף של {name}?',{name:esc(r.person)});
  else if(r.intent==='goal')q=_t('להוסיף ליעדים?');
  else if(r.intent==='water'){q=_t('להוסיף {v} מים להיום?',{v:fmtVolume(r.amount)});edit=false;}
  else if(r.intent==='steps'){q=_t('לרשום {n} צעדים להיום?',{n:r.amount});edit=false;}
  else {q=_t('לא ברור לי לאן זה שייך.');ok=false;}`,
`  var text=r.text||_hcmd.q,Q=hcmdQuestion(r);
  q=Q.q;ok=Q.ok;edit=Q.edit;meta=Q.meta;`);
rep(`function hcmdApply(as){`, `/* what the command line asks about a route before writing it - shared by
   the command line's card and the chat's */
function hcmdQuestion(r){
  var q='',ok=true,edit=true,meta='';
  if(r.intent==='quote'){
    var bk=loadBook();
    if(bk&&bk.title)q=_t('להוסיף למשפטים מתוך "{book}"?',{book:esc(bk.title)});
    else{q=_t('אין כרגע ספר פתוח.');ok=false;}
  }
  else if(r.intent==='moment')q=_t('לשמור כרגע מהיום?');
  else if(r.intent==='journal')q=_t('להוסיף ליומן של היום?');
  else if(r.intent==='task'){
    q=(!r.date||r.date===todayStr())?_t('להוסיף לתכנון של היום?')
      :_t('להוסיף לתכנון של {d}?',{d:fmtDate(r.date)});
    if(r.time){var t=r.time.split(':');meta=dpClock(+t[0],+t[1]);}
  }
  else if(r.intent==='person_note')q=_t('לשמור בדף של {name}?',{name:esc(r.person)});
  else if(r.intent==='goal')q=_t('להוסיף ליעדים?');
  else if(r.intent==='water'){q=_t('להוסיף {v} מים להיום?',{v:fmtVolume(r.amount)});edit=false;}
  else if(r.intent==='steps'){q=_t('לרשום {n} צעדים להיום?',{n:r.amount});edit=false;}
  else {q=_t('לא ברור לי לאן זה שייך.');ok=false;}
  return {q:q,ok:ok,edit:edit,meta:meta};
}
function hcmdApply(as){`);

if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
