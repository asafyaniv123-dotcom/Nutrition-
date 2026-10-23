/* The first run, 23 Oct (Asaf):
 *  1. "אחר" beside נקבה/זכר - and he chose that it means the PLURAL: the app
 *     speaks to them as אתם. A third overlay, data/he-x.json, on the same
 *     terms as he-f: only the strings that change; anything it does not
 *     answer falls through. appGender() now answers 'x' too, and everything
 *     that only asked "is it 'f'?" keeps working unchanged.
 *  2. The door's words sat at the right edge; the flow is centred now.
 *  3. A language screen of its own, first: the eleven languages in their own
 *     names, the phone's language already chosen. A tap changes the screen's
 *     words at once. The pill on the welcome goes - the choice was just made. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* 1 - the third form */
rep(`  try{var v=localStorage.getItem(GENDER_KEY);if(v==='f'||v==='m')return v;}catch(e){}`,
    `  try{var v=localStorage.getItem(GENDER_KEY);if(v==='f'||v==='m'||v==='x')return v;}catch(e){}`);
rep(`  try{localStorage.setItem(GENDER_KEY,g==='f'?'f':'m');}catch(e){}`,
    `  try{localStorage.setItem(GENDER_KEY,g==='f'||g==='x'?g:'m');}catch(e){}`);
rep(`    if(appGender()!=='f'){_lang=HE;cb&&cb();return;}
    fetch(liveBase()+'data/he-f.json')`,
`    /* 'x' is the plural (אתם), Asaf's answer for "other": a third overlay */
    var _hg=appGender();
    if(_hg!=='f'&&_hg!=='x'){_lang=HE;cb&&cb();return;}
    fetch(liveBase()+'data/he-'+_hg+'.json')`);
rep(`    if(code!=='he'||appGender()==='f')langLoad(code,function(){langRepaint();});`,
    `    if(code!=='he'||appGender()==='f'||appGender()==='x')langLoad(code,function(){langRepaint();});`);
rep(`      '<div class="dr-rows"><button class="dr-r2" onclick="doorGender2(&#39;f&#39;,this)">'+_t('בלשון נקבה')+'</button>'+
      '<button class="dr-r2" onclick="doorGender2(&#39;m&#39;,this)">'+_t('בלשון זכר')+'</button></div></div>';`,
`      '<div class="dr-rows"><button class="dr-r2" onclick="doorGender2(&#39;f&#39;,this)">'+_t('בלשון נקבה')+'</button>'+
      '<button class="dr-r2" onclick="doorGender2(&#39;m&#39;,this)">'+_t('בלשון זכר')+'</button>'+
      '<button class="dr-r2" onclick="doorGender2(&#39;x&#39;,this)">'+_t('אחר')+'<span class="dr-r2s">'+_t('אפנה אליכם בלשון רבים')+'</span></button></div></div>';`);
rep(`       '<button class="set-lang'+(_g!=='f'?' on':'')+'" onclick="genderSet(\\'m\\',renderSettings)">'+
         _t('בלשון זכר')+'</button>'+`,
`       '<button class="set-lang'+(_g!=='f'&&_g!=='x'?' on':'')+'" onclick="genderSet(\\'m\\',renderSettings)">'+
         _t('בלשון זכר')+'</button>'+
       '<button class="set-lang'+(_g==='x'?' on':'')+'" onclick="genderSet(\\'x\\',renderSettings)">'+
         _t('בלשון רבים')+'</button>'+`);

/* 3 - the language screen, first */
rep(`function doorSteps(){
  var a=['hi','name'];`, `function doorSteps(){
  var a=['lang','hi','name'];`);
rep(`  if(step==='hi'){
    var L=doorLangs(),cur=appLang(),nm='';
    for(i=0;i<L.length;i++)if(L[i][0]===cur)nm=L[i][1];
    return '<button class="dr-lang" onclick="doorLangOpen()">'+esc(nm||cur)+' &#9662;</button>'+
      '<div class="dr-hi2">`, `  if(step==='lang'){
    /* every language in its own name, so whoever is holding the phone can
       find theirs; the phone's own is already chosen */
    var L=doorLangs(),cur=appLang();
    h='<div class="dr-body dr-lstep"><div class="dr-q2">'+_t('באיזו שפה נדבר?')+'</div><div class="dr-langs">';
    for(i=0;i<L.length;i++)h+='<button class="dr-lr'+(L[i][0]===cur?' on':'')+'" lang="'+L[i][0]+'" onclick="doorLangPick(&#39;'+L[i][0]+'&#39;)">'+L[i][1]+'</button>';
    return h+'</div></div><button class="dr-btn" onclick="doorNext()">'+_t('המשך')+'</button>';
  }
  if(step==='hi'){
    return '<div class="dr-hi2">`);
rep(`    _doorSteps=doorSteps();_doorStep=0;doorPaint();doorBeem('glad');`,
    `    _doorSteps=doorSteps();_doorStep=_doorSteps.indexOf('lang');if(_doorStep<0)_doorStep=0;doorPaint();doorBeem('glad');`);

/* 2 - centred, and the language screen's grid */
rep(`.dr-body{flex:1;display:flex;flex-direction:column;padding-top:150px;min-height:0;overflow-y:auto}`,
`.dr-body{flex:1;display:flex;flex-direction:column;padding-top:150px;min-height:0;overflow-y:auto;text-align:center;align-items:stretch}
/* CENTRED (Asaf, 23 Oct): the words sat at the right edge, the flow reads
   better down the middle. The lists under them stay full width. */
.dr-body .dr-w2{margin-inline:auto}
.dr-body .dr-field{text-align:center}
.dr-r2s{display:block;font-size:13.5px;font-weight:600;color:var(--nu-muted);margin-top:3px}
.dr-lstep .dr-q2{margin-bottom:22px}
.dr-langs{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.dr-langs .dr-lr{font-size:16px;padding:13px 10px}`);
fs.writeFileSync(F, s);
console.log('patched');
