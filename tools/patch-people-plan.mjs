/* PEOPLE IN PLANNING (30.10), approved from review/people-plan.
 * A task that names someone from האנשים שלי is linked to them: the names
 * light while it is written, a word-name is confirmed once, a shared name is
 * asked, the chip wears their faces, the sheet says what to ask and what is
 * going on, the reminder says who (names only - nothing private on a lock
 * screen), and סיום יום asks how it was and files the answer on their pages.
 *
 *   node tools/patch-people-plan.mjs          apply to dev/index.html
 *   node tools/patch-people-plan.mjs --undo   reverse it (must return HEAD byte for byte)
 */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const UNDO = process.argv.includes('--undo');

const P = [];
const rep = (a, b) => P.push([a, b]);

/* ── CSS, after the planning block's layer rules ── */
rep(`html body.mod-planning .dp-chip .dp-min{color:inherit;opacity:.62}
`, `html body.mod-planning .dp-chip .dp-min{color:inherit;opacity:.62}
/* ── PEOPLE IN PLANNING (30.10) ──
   A name is lit the way this material lights anything: a soft glow of the
   person's own hue under the letters, never a stroke. The faces on a chip are
   the people area's discs, small, each its own button. */
.ppn-fs{display:inline-flex;order:3;align-items:center;margin-inline-start:2px;vertical-align:middle}
.ppn-f{border:none;background:none;padding:0;margin-inline-start:-5px;cursor:pointer;display:inline-flex;border-radius:50%}
.ppn-f:first-child{margin-inline-start:0}
.ppn-f>*{box-shadow:0 0 0 1.5px rgba(255,255,255,.85)}
.ppn-inw{flex:1;min-width:0;position:relative;display:flex;border-radius:16px;background:#e9e7e3;
  box-shadow:inset 2px 3px 6px rgba(168,160,148,.45),inset -2px -2px 5px rgba(255,255,255,.95)}
.dpk-bar .ppn-inw input{position:relative;z-index:1;width:100%;background:transparent;box-shadow:none}
.ppn-hl{position:absolute;inset:0;padding:0 14px;font-family:inherit;font-size:15px;line-height:44px;white-space:pre;overflow:hidden;
  color:transparent;pointer-events:none;text-align:start;border-radius:16px}
.ppn-lit{border-radius:6px}
.ppn-row{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:2px 4px 10px}
.ppn-row::-webkit-scrollbar{display:none}
.ppn-pill{flex:none;display:flex;align-items:center;gap:7px;height:34px;border-radius:17px;padding:0 12px 0 5px;padding-inline:5px 12px;
  font-size:13.5px;font-weight:800;color:#4a453f;background:#e9e7e3;
  box-shadow:-3px -3px 7px rgba(255,255,255,.95),3px 4px 9px rgba(168,160,148,.3)}
.ppn-ask{border-radius:20px;padding:13px 14px;margin:0 0 10px;background:#e9e7e3;color:#4a453f;
  box-shadow:-4px -4px 10px rgba(255,255,255,.95),6px 8px 18px rgba(120,104,88,.22)}
.dps .ppn-ask{box-shadow:-3px -3px 7px var(--l),4px 5px 10px var(--d2)}
.ppn-ask-r{display:flex;align-items:center;gap:11px}
.ppn-ask-r b{display:block;font-size:15.5px;font-weight:800;line-height:1.35}
.ppn-ask-bs{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.ppn-ask-bs button,.ppn-who{border:none;border-radius:15px;padding:10px 14px;font-family:inherit;font-size:13.5px;font-weight:800;color:#4a453f;cursor:pointer;
  background:#e9e7e3;box-shadow:-3px -3px 7px rgba(255,255,255,.95),3px 4px 9px rgba(168,160,148,.3)}
.ppn-ask-bs button.q{background:none;box-shadow:none;color:#6d675e}
.ppn-ask-bs button.w{flex:1}
.ppn-who{display:flex;align-items:center;gap:11px;width:100%;margin-top:9px;padding:9px 12px;text-align:start}
.ppn-who span{display:block;min-width:0}
.ppn-who small{display:block;font-size:11.5px;font-weight:700;color:#6d675e;margin-top:1px}
.ppn-pc{border-radius:20px;padding:12px 14px 13px;margin-bottom:10px;background:var(--g);box-shadow:-3px -3px 7px var(--l),4px 5px 10px var(--d2)}
.ppn-pc-h{display:flex;align-items:center;gap:10px;width:100%;border:none;background:none;padding:0;font-family:inherit;cursor:pointer;text-align:start;color:#4a453f}
.ppn-pc-h b{flex:1;min-width:0;font-size:16px;font-weight:800}
.ppn-pc-h i{font-style:normal;font-size:20px;font-weight:700;color:#6d675e}
.ppn-k{display:block;font-size:10.5px;font-weight:800;letter-spacing:.06em;color:#6d675e;margin-top:10px}
.ppn-v{display:block;font-size:13.5px;font-weight:600;color:#4a453f;line-height:1.55;margin-top:2px;white-space:pre-wrap;unicode-bidi:plaintext}
.ppn-pop{display:flex;align-items:baseline;flex-wrap:wrap;gap:4px 8px;margin-top:10px;font-size:13px;font-weight:800;color:#4a453f}
.ppn-pop i{flex:none;width:6px;height:6px;border-radius:50%;background:#f0a92e;box-shadow:0 0 7px 2px rgba(240,169,46,.55);align-self:center}
.ppn-pop span{unicode-bidi:plaintext}
.ppn-pop em{font-style:normal;font-weight:700;color:#6d675e;font-size:12px}
.ppn-eve-fc{display:flex;gap:6px;margin-bottom:10px}
.ppn-eve-k{font-size:11.5px;font-weight:800;color:var(--nu-muted,#6d675e);margin-bottom:3px;unicode-bidi:plaintext}
.ppn-eve-in{display:block;width:100%;box-sizing:border-box;margin-top:14px;min-height:96px}
.ppn-keep{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:14px}
.ppn-keep>span{font-size:12px;font-weight:800;color:var(--nu-muted,#6d675e)}
.ppn-tg{display:flex;align-items:center;gap:7px;height:36px;border:none;border-radius:18px;padding:0 13px 0 5px;padding-inline:5px 13px;
  font-family:inherit;font-size:13.5px;font-weight:800;color:var(--nu-muted,#6d675e);cursor:pointer;background:var(--nu-ground,#e9e7e3);
  box-shadow:-3px -3px 7px var(--nu-lit,#fff),3px 4px 9px var(--nu-shade-soft,rgba(168,160,148,.3))}
.ppn-tg.on{color:var(--nu-ink,#4a453f);box-shadow:inset 2px 3px 6px var(--nu-shade,rgba(168,160,148,.45)),inset -2px -2px 5px var(--nu-lit,#fff)}
.ppn-tg:not(.on)>*{opacity:.45}
.ppn-eve-go{display:block;width:100%;margin-top:14px;padding:14px 16px}
.ppn-eve-no{display:block;width:100%;margin-top:6px;border:none;background:none;padding:10px;font-family:inherit;font-size:13px;font-weight:700;color:var(--nu-muted,#6d675e);cursor:pointer}
`);

/* ── the faces on a chip in the day ── */
rep(`    out+='<span class="dp-w">'+esc(x.t.w)+'</span>'`,
    `    out+='<span class="dp-w">'+esc(x.t.w)+'</span>'+ppnFacesHTML(x.t)`);

/* ── the writing bar: the lit backdrop under the field, the people above it ── */
rep(`     '<input id="dp-rail-in" placeholder="'+esc(_mo?_t('מה להכניס לחודש?'):_t('מה להכניס ליום הזה?'))+'" value="'+esc(_dpRailText)+'" oninput="_dpRailText=this.value" onkeydown="if(event.key===\\'Enter\\')dpRailAdd()">'+`,
    `     '<span class="ppn-inw"><span class="ppn-hl" id="ppn-hl" aria-hidden="true"></span>'+
     '<input id="dp-rail-in" placeholder="'+esc(_mo?_t('מה להכניס לחודש?'):_t('מה להכניס ליום הזה?'))+'" value="'+esc(_dpRailText)+'" oninput="_dpRailText=this.value;ppnRailPaint()" onscroll="ppnHLSync()" onkeydown="if(event.key===\\'Enter\\')dpRailAdd()"></span>'+`);
rep(`  h+='<div class="dpk-bar">'+
     '<button class="dpk-undo"`, `  h+='<div id="ppn-rail"></div>';
  h+='<div class="dpk-bar">'+
     '<button class="dpk-undo"`);
rep(`  rail.classList.toggle('mo',_mo);
}`, `  rail.classList.toggle('mo',_mo);
  ppnRailPaint();
}`);
/* a task written in the bar takes the answers given while it was written */
rep(`    var p=loadPool();
    p.tasks.push({id:'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),w:el.value.trim(),c:_wkNewColor||'lav'});
    savePool(p);el.value='';_dpRailText='';renderPlanning();`,
    `    var p=loadPool(),_pid='t'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    p.tasks.push({id:_pid,w:el.value.trim(),c:_wkNewColor||'lav'});
    savePool(p);ppnAdopt(_pid);el.value='';_dpRailText='';renderPlanning();`);
rep(`  var dp=loadDPlan(_dpDate);
  dp.items.push({id:'d'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
                 w:el.value.trim(),c:_dpNewColor});
  saveDPlan(_dpDate,dp);
  el.value='';_dpRailText='';`,
    `  var dp=loadDPlan(_dpDate),_did='d'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  dp.items.push({id:_did,
                 w:el.value.trim(),c:_dpNewColor});
  ppnAdopt(_did);
  saveDPlan(_dpDate,dp);
  el.value='';_dpRailText='';`);
rep(`  if(!_dpRailOpen)_dpRailText='';   // closing it deliberately clears the draft`,
    `  if(!_dpRailOpen){_dpRailText='';_ppnDraft={};}   // closing it deliberately clears the draft`);

/* ── the sheet: who is in it ── */
rep(`  h+='<div class="dps-l">'+_t('פרטים שחשוב לזכור')+'</div>';`,
    `  h+=ppnSheetHTML(t);
  h+='<div class="dps-l">'+_t('פרטים שחשוב לזכור')+'</div>';`);
rep(`  document.body.insertAdjacentHTML('beforeend',h);
  document.body.classList.add('sheet-open');
}
/* the sheet's steppers`, `  document.body.insertAdjacentHTML('beforeend',h);
  document.body.classList.add('sheet-open');
  hydratePhotos(document.getElementById('dp-sheet'));
}
/* the sheet's steppers`);
rep(`  box.addEventListener('pointerdown',moDown);
}`, `  box.addEventListener('pointerdown',moDown);
  hydratePhotos(box);
}`);

/* ── the reminder says who, and only who ── */
rep(`function dpRemBody(off,when){`, `function dpRemBody(off,when,names){
  /* with people in it: their names, never what was meant to be asked - a
     lock screen is read by whoever is holding the phone */
  if(names){
    if(!off)return _t('עכשיו, עם {names} · {when}',{names:names,when:when});
    if(off===15)return _t('בעוד רבע שעה עם {names} · {when}',{names:names,when:when});
    if(off===30)return _t('בעוד חצי שעה עם {names} · {when}',{names:names,when:when});
    if(off===60)return _t('בעוד שעה עם {names} · {when}',{names:names,when:when});
    return _t('בעוד {n} דקות עם {names} · {when}',{n:off,names:names,when:when});
  }`);
rep(`  if(!remNative())sumRemShowOS(t.w,dpRemBody(off,when));
  if(!document.hidden)remBanner({f:function(){return {t:t.w,b:dpRemBody(off,when),btn:_t('בוצע')};},ttl:15000});`,
    `  var who=ppnNamesOf(t);
  if(!remNative())sumRemShowOS(t.w,dpRemBody(off,when,who));
  if(!document.hidden)remBanner({f:function(){return {t:t.w,b:dpRemBody(off,when,ppnNamesOf(t)),btn:_t('בוצע')};},ttl:15000});`);
rep(`      out.push({id:1000+k*100+(i%100),title:t.w,body:dpRemBody(off,when),`,
    `      out.push({id:1000+k*100+(i%100),title:t.w,body:dpRemBody(off,when,ppnNamesOf(t)),`);

/* ── no "it has been a while" for someone already in today's plan ── */
rep(`  var over=pplOverdue(loadPeople());if(!over.length)return [];`,
    `  var _met=ppnPlannedPids(todayStr());
  var over=pplOverdue(loadPeople()).filter(function(o){return !(o.p&&o.p.pid&&_met[o.p.pid]);});if(!over.length)return [];`);

/* ── סיום יום asks how it was ── */
rep(`  h+=rfVlogHTML();`, `  h+=ppnEveHTML();
  h+=rfVlogHTML();`);

/* ── a person's page: today, and where a memory came from ── */
rep(`    h+='<span class="pp-face-s">'+_t('דיברנו')+' '+_t('לפני {n} ימים',{n:days})+'</span>';`,
    `    h+='<span class="pp-face-s">'+(days===0?_t('דיברנו היום'):_t('דיברנו')+' '+_t('לפני {n} ימים',{n:days}))+'</span>';`);
rep(`         '<span class="pp-mem-t">'+esc(memText(mem))+'</span>'+`,
    `         '<span class="pp-mem-t">'+esc(memText(mem))+'</span>'+
         (mem.plan?'<span class="pp-mem-w" style="margin-top:4px">'+esc(_t('מסיום היום · {task}',{task:mem.plan}))+'</span>':'')+`);

/* ── the engine, before dpRailClear ── */
rep(`function dpRailClear(){`, `/* ── PEOPLE IN PLANNING (30.10) ──
   A task that names someone from האנשים שלי is linked to them, on the phone,
   from its text alone: nothing about a person is copied into the plan, so a
   renamed task or a renamed person is read afresh every time. Only what the
   text cannot decide is stored - which of two people with one name, and
   whether a name that is also a word (שחר, טל) meant the person. A "yes" to
   a word-name holds for every task after; a "no" holds for that task only.
   Only when the people area is one the person keeps. */
var PPN_LINKS_KEY='ppn_links',PPN_WORD_KEY='ppn_word_ok',PPN_EVE_KEY='ppn_eve';
var PPN_PRE='ולבמשהכ';   // i18n-exempt: the Hebrew letters that join a word in front, read and never shown
var PPN_CJK=/[\\u3040-\\u30ff\\u3400-\\u9fff\\uac00-\\ud7af]/;
/* Hebrew first names that are also everyday words - compared, never shown */
var PPN_WORDS='טל אור שחר גל ים שקד חן שיר רז נוי דור שי לב אביב מור גפן ירדן הדס אלה רון שמש אגם גיל ארז אלון תמר יעל ברק רעות שלום אושר מעיין נגה זיו סהר דקל אורן ורד עדן יונה רוני'.split(' ');   // i18n-exempt: names compared against a text, never shown
var _ppnDraft={},_ppnEveOff={};
function ppnOn(){return areaShown('people')&&loadPeople().length>0;}
/* a person is addressed by position everywhere else; a link has to outlive a
   deletion above it, so each person is given a lasting id the first time
   one is needed */
function ppnPeople(){
  var P=loadPeople(),i,ch=false;
  for(i=0;i<P.length;i++)if(P[i]&&!P[i].pid){P[i].pid='p'+Date.now().toString(36)+i+Math.random().toString(36).slice(2,5);ch=true;}
  if(ch)savePeople(P);
  return P;
}
function ppnFind(P,pid){for(var i=0;i<P.length;i++)if(P[i]&&P[i].pid===pid)return P[i];return null;}
function ppnStrip(w,map){
  for(var c=0;c<=3&&c<w.length-1;c++){
    if(c>0&&PPN_PRE.indexOf(w.charAt(c-1))<0)break;
    var k=pplKey(w.slice(c));
    if(k&&map[k])return {cut:c,key:k,pids:map[k]};
  }
  return null;
}
/* every name in a text: a whole two-word name first, then a first name with
   up to three of ו ל ב מ ש ה כ in front of it; a name in a script written
   without spaces is found where it stands */
function ppnScan(text,P){
  var out=[],first={},full={},i,k,f,nm;
  text=String(text||'');
  for(i=0;i<P.length;i++){
    nm=String((P[i]&&P[i].name)||'').trim();if(!nm||!P[i].pid)continue;
    if(PPN_CJK.test(nm)){var at=0,j;
      while((j=text.indexOf(nm,at))>=0){out.push({s:j,e:j+nm.length,key:pplKey(nm),pids:[P[i].pid],word:false});at=j+nm.length;}
      continue;}
    f=pplKey(nm.split(/\\s+/)[0]);if(f)(first[f]=first[f]||[]).push(P[i].pid);
    k=pplKey(nm);if(k&&k!==f)(full[k]=full[k]||[]).push(P[i].pid);
  }
  var re=/[\\p{L}\\p{M}'’׳"״\\-]+/gu,m,toks=[];
  while((m=re.exec(text)))toks.push({s:m.index,w:m[0]});
  for(i=0;i<toks.length;i++){
    var t=toks[i],hit=null,two=null,one;
    if(i+1<toks.length)two=ppnStrip(t.w+' '+toks[i+1].w,full);
    if(two){hit={s:t.s+two.cut,e:toks[i+1].s+toks[i+1].w.length,key:two.key,pids:two.pids,word:false};i++;}
    else{one=ppnStrip(t.w,first);
      if(one)hit={s:t.s+one.cut,e:t.s+t.w.length,key:one.key,pids:one.pids,word:PPN_WORDS.indexOf(one.key)>=0};}
    if(hit)out.push(hit);
  }
  out.sort(function(a,b){return a.s-b.s;});
  return out;
}
function ppnLinks(){try{return JSON.parse(localStorage.getItem(PPN_LINKS_KEY)||'{}')||{};}catch(e){return {};}}
function ppnLinksSave(o){try{localStorage.setItem(PPN_LINKS_KEY,JSON.stringify(o));}catch(e){}}
function ppnWordOk(){try{return JSON.parse(localStorage.getItem(PPN_WORD_KEY)||'{}')||{};}catch(e){return {};}}
/* who a text names, each with its state: ok, word (asks once), pick (asks which) */
function ppnWho(text,rec){
  if(!text||!ppnOn())return [];
  var P=ppnPeople(),hits=ppnScan(text,P),ok=ppnWordOk(),out=[],seen={},i,h,pk;
  rec=rec||{};var pick=rec.pick||{},no=rec.no||{};
  for(i=0;i<hits.length;i++){
    h=hits[i];h.state='ok';h.pid='';
    if(h.pids.length>1){pk=pick[h.key];
      if(pk==='-')continue;
      if(pk&&h.pids.indexOf(pk)>=0)h.pid=pk;else h.state='pick';}
    else h.pid=h.pids[0];
    if(h.state==='ok'&&h.word&&!ok[h.pid]){if(no[h.key])continue;h.state='word';}
    if(h.pid){if(seen[h.pid+h.state])continue;seen[h.pid+h.state]=1;}
    h.p=h.pid?ppnFind(P,h.pid):null;
    h.ps=h.pids.map(function(x){return ppnFind(P,x);}).filter(Boolean);
    out.push(h);
  }
  return out;
}
function ppnTask(t){return ppnWho(t&&t.w,ppnLinks()[t&&t.id]);}
function ppnOkOf(t){return ppnTask(t).filter(function(x){return x.state==='ok'&&x.p;});}
function ppnList(a){try{return new Intl.ListFormat(APP_LOCALE,{style:'long',type:'conjunction'}).format(a);}catch(e){return a.join(', ');}}
function ppnNamesOf(t){var a=ppnOkOf(t).map(function(x){return x.p.name;});return a.length?ppnList(a):'';}
function ppnRGBA(hex,a){var n=parseInt(String(hex).slice(1),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')';}
function ppnOpen(pid){
  var P=loadPeople(),i;for(i=0;i<P.length;i++)if(P[i]&&P[i].pid===pid)break;
  if(i>=P.length)return;
  if(_dpDetail)dpCloseDetail(true);
  enterModule('people');_personIdx=i;_peopleView='person';renderPeople();
}
function ppnFacesHTML(t){
  var a=ppnOkOf(t),h='',i;if(!a.length)return '';
  for(i=0;i<a.length&&i<4;i++)
    h+='<button class="ppn-f" onclick="ppnOpen(&quot;'+a[i].pid+'&quot;)" aria-label="'+esc(a[i].p.name)+'">'+personAvatar0(a[i].p,18)+'</button>';
  return '<span class="ppn-fs">'+h+'</span>';
}
/* the one question a name still needs, for the bar (id '') or for a task */
function ppnAskHTML(x,id){
  var q='&quot;',a=q+(id||'')+q+','+q+encodeURIComponent(x.key)+q,h='<div class="ppn-ask">';
  if(x.state==='word'){
    h+='<div class="ppn-ask-r">'+personAvatar0(x.p,40)+'<b>'+esc(_t('זה {name} שלך?',{name:x.p.name}))+'</b></div>'+
       '<div class="ppn-ask-bs"><button class="w" onclick="ppnAns('+a+','+q+'yes'+q+','+q+x.pid+q+')">'+esc(_t('כן, זה {name} שלי',{name:x.p.name}))+'</button>'+   // i18n-exempt: answer kind
       '<button class="q" onclick="ppnAns('+a+','+q+'no'+q+','+q+q+')">'+_t('סתם מילה')+'</button></div>';   // i18n-exempt: answer kind
  } else {
    var nm=x.ps.length?String(x.ps[0].name).split(/\\s+/)[0]:'';
    h+='<div class="ppn-ask-r"><b>'+esc(_t('יש אצלך כמה בשם {name}. למי התכוונת?',{name:nm}))+'</b></div>';
    for(var i=0;i<x.ps.length;i++){var p=x.ps[i],sub=[p.relationship?labelOf(p.relationship):'',p.place||''].filter(Boolean).join(' · ');
      h+='<button class="ppn-who" onclick="ppnAns('+a+','+q+'pick'+q+','+q+p.pid+q+')">'+personAvatar0(p,36)+   // i18n-exempt: answer kind
         '<span><b>'+esc(p.name)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':'')+'</span></button>';}
    h+='<div class="ppn-ask-bs"><button class="q" onclick="ppnAns('+a+','+q+'pick'+q+','+q+'-'+q+')">'+_t('אף אחד מהם')+'</button></div>';   // i18n-exempt: answer kind
  }
  return h+'</div>';
}
function ppnAns(id,key,kind,val){
  key=decodeURIComponent(key);
  if(kind==='yes'){var o=ppnWordOk();o[val]=1;try{localStorage.setItem(PPN_WORD_KEY,JSON.stringify(o));}catch(e){}}
  else{
    var L=id?ppnLinks():null,rec=id?(L[id]=L[id]||{}):_ppnDraft;
    rec[kind]=rec[kind]||{};rec[kind][key]=(kind==='no'?1:val);
    if(id)ppnLinksSave(L);
  }
  if(id){
    var n=document.getElementById('dp-d-note'),nv=n?n.value:null;
    renderPlanDay();renderDpSheet();dpRemResync();
    if(nv!==null){var n2=document.getElementById('dp-d-note');if(n2)n2.value=nv;}
  } else {ppnRailPaint();var e=document.getElementById('dp-rail-in');if(e)e.focus();}
}
/* what was answered while a task was being written goes with it */
function ppnAdopt(id){
  var d=_ppnDraft;_ppnDraft={};
  if(!d.pick&&!d.no)return;
  var L=ppnLinks();L[id]=d;ppnLinksSave(L);
}
function ppnHLSync(){var i=document.getElementById('dp-rail-in'),h=document.getElementById('ppn-hl');if(i&&h)h.scrollLeft=i.scrollLeft;}
function ppnRailPaint(){
  var box=document.getElementById('ppn-rail'),hl=document.getElementById('ppn-hl');
  if(!box||!hl)return;
  var text=_dpRailText||'',hits=ppnWho(text,_ppnDraft),i,x,c,h='',at=0,ask=null,row='';
  for(i=0;i<hits.length;i++){
    x=hits[i];
    c=x.state==='pick'?'#9a9188':personHue(x.p?x.p.name:'');
    var lit=x.state==='ok'?'background:'+ppnRGBA(c,.24)+';box-shadow:0 0 0 2px '+ppnRGBA(c,.24)+',0 0 10px '+ppnRGBA(c,.32)
                         :'background:'+ppnRGBA(c,.13)+';box-shadow:0 0 0 2px '+ppnRGBA(c,.1);
    if(x.s>=at){h+=esc(text.slice(at,x.s))+'<span class="ppn-lit" style="'+lit+'">'+esc(text.slice(x.s,x.e))+'</span>';at=x.e;}
    if(x.state!=='ok'&&!ask)ask=x;
    if(x.state==='ok')row+='<span class="ppn-pill">'+personAvatar0(x.p,26)+esc(x.p.name)+'</span>';
  }
  hl.innerHTML=h+esc(text.slice(at));
  box.innerHTML=ask?ppnAskHTML(ask,''):(row?'<div class="ppn-row">'+row+'</div>':'');
  hydratePhotos(box);
  ppnHLSync();
  /* the bar rides the keyboard by its top: a card that grew above it would
     otherwise push the bar itself under the keyboard */
  dpDockPin();
}
function ppnPops(p,date){
  var out=[],ds=p.importantDates||[],i,d,y=+date.slice(0,4),base=Date.UTC(y,+date.slice(5,7)-1,+date.slice(8,10));
  for(i=0;i<ds.length;i++){
    d=ds[i];if(!d||!/^\\d{4}-\\d{2}-\\d{2}/.test(String(d.date)))continue;
    var Y=+d.date.slice(0,4),M=+d.date.slice(5,7)-1,D=+d.date.slice(8,10),u;
    if(d.yearly||d.type==='birthday'){u=Date.UTC(y,M,D);if(u<base){Y=y+1;u=Date.UTC(Y,M,D);}else Y=y;}
    else u=Date.UTC(Y,M,D);
    var dd=Math.round((u-base)/864e5);
    if(dd<0||dd>14)continue;
    out.push({t:d.title||(d.type==='birthday'?_t('יום הולדת'):''),when:new Date(Y,M,D,12)});
  }
  (p.memories||[]).forEach(function(m){if(m&&(m.pinned||m.type==='important')){var x=memText(m);if(x)out.push({t:x});}});
  return out.slice(0,3);
}
function ppnSheetHTML(t){
  var hits=ppnTask(t);if(!hits.length)return '';
  var h='<div class="dps-l">'+_t('עם מי')+'</div>',i,x,p,pops,j;
  for(i=0;i<hits.length;i++){
    x=hits[i];
    if(x.state!=='ok'){h+=ppnAskHTML(x,t.id);continue;}
    p=x.p;if(!p)continue;
    h+='<div class="ppn-pc"><button class="ppn-pc-h" onclick="ppnOpen(&quot;'+p.pid+'&quot;)">'+personAvatar(p,36)+'<b>'+esc(p.name)+'</b><i aria-hidden="true">&#8250;</i></button>';
    if(p.toAsk&&p.toAsk.trim())h+='<span class="ppn-k">'+_t('דברים שאני רוצה לשאול')+'</span><span class="ppn-v">'+esc(p.toAsk.trim())+'</span>';
    if(p.currentUpdate&&p.currentUpdate.trim())h+='<span class="ppn-k">'+_t('מה קורה עכשיו')+'</span><span class="ppn-v">'+esc(p.currentUpdate.trim())+'</span>';
    pops=ppnPops(p,_dpDate||todayStr());
    for(j=0;j<pops.length;j++)
      h+='<div class="ppn-pop"><i></i><span>'+esc(pops[j].t)+'</span>'+(pops[j].when?'<em>'+esc(dfmt(pops[j].when,{weekday:'long',day:'numeric',month:'long'}))+'</em>':'')+'</div>';
    h+='</div>';
  }
  return h;
}
/* everyone a task of this day is linked to */
function ppnPlannedPids(date){
  var out={};if(!ppnOn())return out;
  dpAll(date).forEach(function(t){ppnOkOf(t).forEach(function(x){out[x.pid]=1;});});
  return out;
}
/* ── THE EVENING ── every task of today with people in it, once its hour
   has come, asked one at a time; what is written lands on each page */
function ppnEveDone(){
  var o={};try{o=JSON.parse(localStorage.getItem(PPN_EVE_KEY)||'{}')||{};}catch(e){}
  return o.d===todayStr()?(o.ids||{}):{};
}
function ppnEveMark(id){
  var ids=ppnEveDone();ids[id]=1;
  try{localStorage.setItem(PPN_EVE_KEY,JSON.stringify({d:todayStr(),ids:ids}));}catch(e){}
}
function ppnEveList(){
  if(!ppnOn())return [];
  var d=todayStr(),done=ppnEveDone(),out=[],now=new Date(),nm=now.getHours()*60+now.getMinutes();
  if(now.getHours()<DAY_ENDS_AT)nm+=24*60;
  dpAll(d).forEach(function(t){
    if(done[t.id])return;
    if(t.hour!==null){var st=t.hour*60+(t.min||0);if(t.hour<DAY_ENDS_AT)st+=24*60;if(st>nm)return;}
    var ps=ppnOkOf(t);if(ps.length)out.push({t:t,ps:ps});
  });
  return out;
}
function ppnEveHTML(){
  var L=ppnEveList();if(!L.length)return '';
  var x=L[0],h='<div class="rfm ppn-eve" id="ppn-eve">',i,y;
  h+='<div class="ppn-eve-fc">';for(i=0;i<x.ps.length;i++)h+=personAvatar(x.ps[i].p,30);h+='</div>';
  h+='<div class="ppn-eve-k">'+esc(x.t.w)+'</div>';
  h+='<div class="rfm-t">'+esc(_t('איך היה עם {names}?',{names:ppnList(x.ps.map(function(z){return z.p.name;}))}))+'</div>';
  h+='<div class="rfm-s">'+_t('מה שתכתוב יישמר בדף שלהם.')+'</div>';
  h+='<textarea id="ppn-eve-in" class="rfm-in ppn-eve-in" rows="3" maxlength="2000" oninput="rfmGrow(this)"></textarea>';
  if(x.ps.length>1){
    h+='<div class="ppn-keep"><span>'+_t('לשמור אצל')+'</span>';
    for(i=0;i<x.ps.length;i++){y=x.ps[i];
      h+='<button class="ppn-tg'+(_ppnEveOff[y.pid]?'':' on')+'" onclick="ppnEveToggle(&quot;'+y.pid+'&quot;)">'+personAvatar0(y.p,26)+'<span>'+esc(y.p.name)+'</span></button>';}
    h+='</div>';
  }
  h+='<button class="rfm-b ppn-eve-go" onclick="ppnEveSave(&quot;'+x.t.id+'&quot;)">'+_t('שמור')+'</button>';
  h+='<button class="ppn-eve-no" onclick="ppnEveSkip(&quot;'+x.t.id+'&quot;)">'+_t('לא הערב')+'</button>';
  return h+'</div>';
}
function ppnEveRepaint(keep){
  var el=document.getElementById('ppn-eve');if(!el)return;
  var i=document.getElementById('ppn-eve-in'),v=(keep&&i)?i.value:'';
  var h=ppnEveHTML();
  if(!h){el.remove();return;}
  el.outerHTML=h;
  var j=document.getElementById('ppn-eve-in');if(j&&v){j.value=v;rfmGrow(j);}
  hydratePhotos(document.getElementById('ppn-eve'));
}
function ppnEveToggle(pid){_ppnEveOff[pid]=!_ppnEveOff[pid];ppnEveRepaint(true);}
function ppnEveSkip(id){ppnEveMark(id);_ppnEveOff={};ppnEveRepaint(false);}
function ppnEveSave(id){
  var x=ppnEveList().filter(function(z){return z.t.id===id;})[0];if(!x)return;
  var i=document.getElementById('ppn-eve-in'),v=i?i.value.trim():'';
  var P=loadPeople(),now=Date.now();
  x.ps.forEach(function(y,k){
    if(_ppnEveOff[y.pid])return;
    var p=ppnFind(P,y.pid);if(!p)return;
    /* we were together today: the clock that "it has been a while" reads */
    p.lastContact=now;
    if(v){if(!p.memories)p.memories=[];
      p.memories.push({id:now+''+k,content:v,type:'conversation',date:now,pinned:false,plan:x.t.w});}
  });
  savePeople(P);ppnEveMark(id);_ppnEveOff={};
  showToast(_t('נשמר')+' ✓');
  try{if(remNative())remNativeSync();}catch(e){}
  ppnEveRepaint(false);
}
function dpRailClear(){`);

/* ── apply or reverse ── */
let n = 0;
/* the working copy may be checked out CRLF (core.autocrlf): match what is there */
const NL = s.includes('\r\n') ? '\r\n' : '\n';
for (const e of P) { e[0] = e[0].split('\n').join(NL); e[1] = e[1].split('\n').join(NL); }
for (const [a, b] of (UNDO ? P.map(([a, b]) => [b, a]).reverse() : P)) {
  const c = s.split(a).length - 1;
  if (c !== 1) { console.error('anchor count ' + c + ' for:\n' + a.slice(0, 120)); process.exit(1); }
  s = s.replace(a, () => b); n++;
}
fs.writeFileSync(F, s);
console.log((UNDO ? 'reversed ' : 'applied ') + n + ' edits');
