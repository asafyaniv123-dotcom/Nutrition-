/* BEEM, THE APP'S HELPER (21 Oct, option B of review/beem-helper): Beem sits
 * in a pressed niche in the top corner of every screen - the inline END, the
 * left in Hebrew, where no screen keeps anything - and a press opens a chat.
 * The chat asks /beem on the push server, the same tool loop /ask runs: the
 * model asks for a day or a range, the phone reads its own log and answers. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

/* the DEV badge sat exactly where Beem now lives; it moves above the tab bar */
rep(`    b.style.cssText='position:fixed;top:calc(4px + env(safe-area-inset-top));'+`,
    `    b.style.cssText='position:fixed;bottom:calc(118px + env(safe-area-inset-bottom));'+`);
rep(`      panel.style.cssText='position:fixed;top:calc(38px + env(safe-area-inset-top));'+`,
    `      panel.style.cssText='position:fixed;bottom:calc(152px + env(safe-area-inset-bottom));'+`);

rep(`.aint{position:fixed;inset:0;z-index:9980;`, `/* ── BEEM IN THE CORNER, AND THE CHAT HE OPENS ── a pressed niche, the
   material's own "light inside a channel", so he sits IN the screen rather
   than on top of it like a sticker. Hidden where Beem already lives (the
   evening summary) and in the door, which is his. */
.bhelp{position:fixed;top:calc(12px + env(safe-area-inset-top));inset-inline-end:14px;z-index:350;width:60px;height:60px;border-radius:50%;
  border:none;padding:0;background:#efe9df;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;
  box-shadow:inset 3px 4px 8px rgba(176,168,156,.44),inset -3px -3px 7px rgba(255,255,255,.95);transition:opacity .25s,transform .35s cubic-bezier(.2,.9,.3,1)}
.bhelp-b{width:46px;height:46px;pointer-events:none}
body.mod-door .bhelp,body.mod-endofday .bhelp,.bhelp.away{opacity:0;transform:scale(.6);pointer-events:none}
.bhs{position:fixed;inset:0;z-index:9000;pointer-events:none}
.bhs-dim{position:absolute;inset:0;background:rgba(42,34,27,.38);opacity:0;transition:opacity .35s}
.bhs-c{position:absolute;left:0;right:0;bottom:0;max-width:560px;margin:0 auto;height:84%;background:#ece3d4;border-radius:28px 28px 0 0;color:#4a453f;
  display:flex;flex-direction:column;transform:translateY(102%);transition:transform .5s cubic-bezier(.2,.9,.3,1);box-shadow:0 -12px 34px rgba(20,14,8,.22)}
.bhs.on{pointer-events:auto}.bhs.on .bhs-dim{opacity:1}.bhs.on .bhs-c{transform:none}
.bhs-grab{width:40px;height:5px;border-radius:3px;background:#d4c9ba;margin:10px auto 6px}
.bhs-hd{display:flex;align-items:center;gap:12px;padding:4px 20px 10px}
.bhs-bm{width:62px;height:62px;flex:0 0 62px}
.bhs-hd b{display:block;font-size:20px;font-weight:800}.bhs-hd span{font-size:14px;color:#5f5850}
.bhs-x{margin-inline-start:auto;border:none;background:none;font-size:26px;line-height:1;color:#5f5850;cursor:pointer;padding:6px 10px;font-family:inherit}
.bhs-log{flex:1;overflow-y:auto;padding:6px 18px 10px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}
.bhs-m{max-width:84%;padding:11px 14px;border-radius:18px;font-size:15.5px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
.bhs-m.b{align-self:flex-start;background:#f6f1e8;border-start-start-radius:6px;box-shadow:-3px -3px 8px rgba(255,255,255,.95),4px 5px 12px rgba(176,168,156,.28)}
.bhs-m.u{align-self:flex-end;background:#e2d6c3;border-start-end-radius:6px;box-shadow:inset 2px 3px 6px rgba(176,168,156,.28),inset -2px -2px 5px rgba(255,255,255,.95)}
.bhs-m.wait{color:#5f5850;font-style:italic}
.bhs-sug{display:flex;flex-wrap:wrap;gap:8px;padding:2px 18px 10px}
.bhs-sug button{border:none;border-radius:14px;padding:10px 13px;background:#ece3d4;font:700 14px inherit;font-family:inherit;color:#4a453f;cursor:pointer;
  box-shadow:-3px -3px 7px rgba(255,255,255,.95),3px 4px 9px rgba(176,168,156,.28)}
.bhs-in{display:flex;gap:8px;padding:8px 16px calc(18px + env(safe-area-inset-bottom))}
.bhs-in input{flex:1;min-width:0;border:none;border-radius:18px;padding:14px 16px;background:#ece3d4;font:600 16px inherit;font-family:inherit;color:#4a453f;outline:none;
  box-shadow:inset 3px 4px 8px rgba(176,168,156,.44),inset -3px -3px 7px rgba(255,255,255,.95)}
.bhs-go{flex:0 0 50px;height:50px;border:none;border-radius:50%;background:#ece3d4;color:#4a453f;cursor:pointer;display:flex;align-items:center;justify-content:center;
  box-shadow:-3px -3px 8px rgba(255,255,255,.95),4px 5px 12px rgba(176,168,156,.44)}
.bhs-go svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
@media (prefers-reduced-motion:reduce){.bhelp,.bhs-c,.bhs-dim{transition:none}}
.aint{position:fixed;inset:0;z-index:9980;`);

rep(`/* ── THE FIRST TIME IN AN AREA ── once per area, for someone who came through`,
`/* ── BEEM, THE HELPER ── in the corner of every screen; a press opens a chat
   that knows which screen it was opened from. The conversation lives for the
   tab only: it is help, not a diary, and nothing of it is stored. */
var _bhelp={msgs:[],busy:false,B:null,C:null};
function beemHelpMount(){
  if(document.getElementById('bhelp'))return;
  var b=document.createElement('button');b.className='bhelp';b.id='bhelp';
  b.setAttribute('aria-label',_t('לשאול את בים'));
  b.innerHTML='<div class="bhelp-b" id="bhelp-b"></div>';
  b.onclick=beemHelpOpen;
  document.body.appendChild(b);
  var w=document.createElement('div');w.className='bhs';w.id='bhs';
  w.innerHTML='<div class="bhs-dim"></div><div class="bhs-c" role="dialog"><div class="bhs-grab"></div>'+
    '<div class="bhs-hd"><div class="bhs-bm" id="bhs-bm"></div><div><b id="bhs-name"></b><span id="bhs-sub"></span></div>'+
    '<button class="bhs-x" id="bhs-x">&times;</button></div>'+
    '<div class="bhs-log" id="bhs-log"></div><div class="bhs-sug" id="bhs-sug"></div>'+
    '<div class="bhs-in"><input id="bhs-q" enterkeyhint="send" autocomplete="off">'+
    '<button class="bhs-go" id="bhs-go"><svg viewBox="0 0 24 24"><path d="M12 19V5"/><path d="m6 11 6-6 6 6"/></svg></button></div></div>';
  document.body.appendChild(w);
  w.querySelector('.bhs-dim').onclick=beemHelpClose;
  document.getElementById('bhs-x').onclick=beemHelpClose;
  document.getElementById('bhs-go').onclick=function(){beemHelpAsk(document.getElementById('bhs-q').value);};
  document.getElementById('bhs-q').onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();beemHelpAsk(this.value);}};
  beemKit().then(function(K){
    _bhelp.B=K.mount(document.getElementById('bhelp-b'),{play:{dur:9000,ev:[[0,'face','happy'],[0,'mode',{breathe:[.016,4],idle:0}]]}});
  }).catch(function(){});
}
/* where it was opened from: the module, or home, or the Me screen */
function beemHelpScreen(){
  if(typeof currentModule!=='undefined'&&currentModule)return currentModule;
  return document.body.classList.contains('mod-me')?'me':'home';   // i18n-exempt: screen keys
}
/* three questions that belong to the screen she is on, asked when shown */
function beemHelpSug(k){
  if(k==='nutrition')return [_t('איך רושמים ארוחה?'),_t('כמה חלבון אכלתי היום?'),_t('איך נקבע היעד היומי שלי?')];
  if(k==='fitness')return [_t('איך רושמים אימון?'),_t('איך בונים לי תוכנית?'),_t('מה זה השיאים האישיים?')];
  if(k==='planning')return [_t('איך מוסיפים משהו למחר?'),_t('איך רואים את כל השבוע?'),_t('איך מזיזים משימה לשעה אחרת?')];
  if(k==='people')return [_t('איך מוסיפים אדם?'),_t('מתי תזכיר לי להתקשר?'),_t('מה רואים בכרטיס של אדם?')];
  if(k==='hobbies')return [_t('איך מוסיפים תחביב?'),_t('איך מסמנים שעשיתי אותו?'),_t('מה רואים לאורך זמן?')];
  if(k==='closet')return [_t('איך מצלמים בגד?'),_t('איך מרכיבים לוק?'),_t('איך רואים מה לא לבשתי?')];
  if(k==='insights')return [_t('איך זה עובד?'),_t('איפה התשובות שלי נשמרות?'),_t('אפשר לדלג על שאלה?')];
  return [_t('מה זה סיום יום?'),_t('איך בוחרים אילו אזורים יופיעו?'),_t('איך משנים את שעת התזכורת?')];
}
function beemHelpOpen(){
  var w=document.getElementById('bhs');if(!w)return;
  var nm=greetName();
  document.getElementById('bhs-name').textContent=_t('בים');
  document.getElementById('bhs-sub').textContent=_t('אפשר לשאול אותי כל דבר על האפליקציה');
  document.getElementById('bhs-q').placeholder=_t('מה תרצה לדעת?');
  document.getElementById('bhs-x').setAttribute('aria-label',_t('סגור'));
  var log=document.getElementById('bhs-log');
  if(!log.children.length)beemHelpSay('b',nm?_t('היי {name}. מה תרצה לדעת?',{name:nm}):_t('היי. מה תרצה לדעת?'));
  beemHelpSugPaint();
  w.classList.add('on');document.getElementById('bhelp').classList.add('away');
  if(!_bhelp.C)beemKit().then(function(K){var el=document.getElementById('bhs-bm');if(el&&!el.firstChild)_bhelp.C=K.mount(el,{play:DOOR_BEEM.glad});}).catch(function(){});
  else try{_bhelp.C.play(DOOR_BEEM.glad);}catch(e){}
}
function beemHelpClose(){
  var w=document.getElementById('bhs');if(w)w.classList.remove('on');
  var b=document.getElementById('bhelp');if(b)b.classList.remove('away');
  var q=document.getElementById('bhs-q');if(q)q.blur();
}
function beemHelpSugPaint(){
  var el=document.getElementById('bhs-sug'),S=beemHelpSug(beemHelpScreen()),h='',i;
  for(i=0;i<S.length;i++)h+='<button data-q="'+esc(S[i])+'">'+esc(S[i])+'</button>';
  el.innerHTML=_bhelp.msgs.length?'':h;
  [].forEach.call(el.querySelectorAll('button'),function(x){x.onclick=function(){beemHelpAsk(x.getAttribute('data-q'));};});
}
function beemHelpSay(who,text){
  var d=document.createElement('div');d.className='bhs-m '+who;d.textContent=text;
  var l=document.getElementById('bhs-log');l.appendChild(d);l.scrollTop=l.scrollHeight;return d;
}
function beemHelpAsk(q){
  q=String(q||'').trim();
  if(!q||_bhelp.busy)return;
  document.getElementById('bhs-q').value='';
  beemHelpSay('u',q);
  _bhelp.msgs.push({role:'user',content:q});
  beemHelpSugPaint();
  var wait=beemHelpSay('b wait',_t('בים חושב…'));
  if(_bhelp.C)try{_bhelp.C.play({dur:30000,ev:[[0,'face','thinking'],[0,'mode',{breathe:[.016,4],idle:0}]]});}catch(e){}
  if(!SYNC_SERVER){beemHelpDone(wait,_t('השאלות דורשות חיבור לשרת.'),true);return;}
  _bhelp.busy=true;
  foodsLoad(function(){beemHelpTurn(_bhelp.msgs.slice(-16),0,wait);});
}
function beemHelpDone(wait,text,failed){
  _bhelp.busy=false;
  wait.classList.remove('wait');wait.textContent=text;
  var l=document.getElementById('bhs-log');l.scrollTop=l.scrollHeight;
  if(_bhelp.C)try{_bhelp.C.play(failed?DOOR_BEEM.calm:DOOR_BEEM.nod);}catch(e){}
}
/* the /ask loop, with the screen and the person attached: the model asks for
   a day, the phone reads it from its own log and sends it back */
function beemHelpTurn(messages,depth,wait){
  if(depth>=6){beemHelpDone(wait,_t('לא הצלחתי לענות כרגע.'),true);return;}
  fetch(SYNC_SERVER+'/beem',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({messages:messages,lang:appLang(),screen:beemHelpScreen(),name:greetName(),form:appGender(),today:todayStr()})
  }).then(function(r){return r.json();})
    .then(function(j){
      if(!j||!j.ok){
        beemHelpDone(wait,(j&&j.error==='too many for today')?_t('הגעת למכסה היומית של השאלות.'):_t('לא הצלחתי לענות כרגע.'),true);
        _bhelp.msgs.pop();return;
      }
      var content=j.content||[],uses=[],text='',i;
      for(i=0;i<content.length;i++){
        if(content[i].type==='text')text+=content[i].text;
        else if(content[i].type==='tool_use')uses.push(content[i]);
      }
      if(!uses.length){
        text=text.trim()||_t('לא הצלחתי לענות כרגע.');
        _bhelp.msgs.push({role:'assistant',content:text});
        beemHelpDone(wait,text);return;
      }
      var results=[];
      for(i=0;i<uses.length;i++){
        var u=uses[i],val;
        try{val=ASK_TOOLS[u.name]?ASK_TOOLS[u.name](u.input||{}):{error:'unknown tool'};}
        catch(e){val={error:'could not read that'};}
        results.push({type:'tool_result',tool_use_id:u.id,content:JSON.stringify(val)});
      }
      beemHelpTurn(messages.concat([{role:'assistant',content:content},{role:'user',content:results}]),depth+1,wait);
    })
    .catch(function(){_bhelp.msgs.pop();beemHelpDone(wait,_t('אין חיבור כרגע.'),true);});
}
window.addEventListener('load',function(){setTimeout(beemHelpMount,800);});
/* ── THE FIRST TIME IN AN AREA ── once per area, for someone who came through`);
fs.writeFileSync(F, s);
console.log('patched');
