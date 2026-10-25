/* The recipe screens in the app's material (Asaf, 25 Oct: "all the recipe
 * screens inside nutrition don't match the app's character").
 * They were the oldest code in nutrition: inline styles, emoji for icons, a
 * dark filled "+", a violet "edit" pill, letter headings underlined in
 * terracotta, a terracotta gradient for a missing photo, and a notes card
 * with a coloured stripe down its side - paint, every one of them, where the
 * rest of the app is one soft material whose only colour is light.
 * Now: classes instead of inline styles; raised cards and pressed chips;
 * line icons in nutrition's own violet; the back pill every other screen
 * uses; step numbers in pressed discs; ingredients marked with a small amber
 * light; no stripes, no underlines, no dark buttons. Behaviour unchanged. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const cut = (a, b, by) => { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0 || s.indexOf(a, i + 1) >= 0) { console.log('CUT ' + a.slice(0, 60)); process.exit(1); } s = s.slice(0, i) + by + s.slice(j); };
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

rep(`.fw-fl{font-size:12px;color:var(--nu-muted);font-weight:700;margin-bottom:5px}`, `.fw-fl{font-size:12px;color:var(--nu-muted);font-weight:700;margin-bottom:5px}
/* ── the recipe book, in the material (25.10) ── */
.rcp{padding-bottom:28px}
.rcp-top{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:16px}
.rcp-h{font-size:20px;font-weight:800;color:var(--nu-ink)}
.rcp-btn{display:inline-flex;align-items:center;gap:6px;border:none;border-radius:999px;padding:9px 16px;font:800 14px inherit;font-family:inherit;color:var(--nu-ink);cursor:pointer;
  background:var(--nu-ground);box-shadow:-3px -3px 7px var(--nu-lit),4px 5px 10px var(--nu-shade-soft)}
.rcp-btn:active{box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.rcp-btn svg,.rcp-ic svg,.rcp-chip svg,.rcp-ph svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.rcp-btn.ghost{background:transparent;box-shadow:none;color:var(--nu-muted)}
.rcp-btn.danger{color:#a2412a}
.rcp-empty{text-align:center;padding:40px 16px}
.rcp-disc{width:96px;height:96px;margin:0 auto 18px;border-radius:50%;display:grid;place-items:center;color:var(--violet-500,#8d7ab0);
  box-shadow:inset 4px 5px 10px var(--nu-shade),inset -4px -4px 9px var(--nu-lit)}
.rcp-disc svg{width:40px;height:40px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 4px rgba(166,144,207,.35))}
.rcp-empty b{display:block;font-size:17px;color:var(--nu-ink);margin-bottom:6px}
.rcp-empty p{font-size:14px;color:var(--nu-muted);margin:0 0 18px}
.rcp-letters{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;padding:4px;margin-bottom:16px;border-radius:999px;width:max-content;max-width:100%;
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.rcp-letters::-webkit-scrollbar{display:none}
.rcp-letters button{flex:none;border:none;border-radius:999px;min-width:36px;padding:7px 12px;font:800 13.5px inherit;font-family:inherit;color:var(--nu-muted);background:transparent;cursor:pointer}
.rcp-letters button.on{color:var(--nu-ink);background:var(--nu-ground);box-shadow:-2px -2px 5px var(--nu-lit),2px 3px 7px var(--nu-shade-soft)}
.rcp-letter{font-size:13px;font-weight:800;color:var(--nu-muted);margin:6px 4px 8px}
.rcp-row{display:flex;align-items:center;gap:12px;padding:10px 12px;margin-bottom:10px;border-radius:20px;cursor:pointer;background:var(--nu-ground);
  box-shadow:-4px -4px 10px var(--nu-lit),5px 6px 13px var(--nu-shade-soft)}
.rcp-row:active{box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.rcp-th{flex:none;width:54px;height:54px;border-radius:14px;object-fit:cover}
.rcp-ph{flex:none;width:54px;height:54px;border-radius:14px;display:grid;place-items:center;color:var(--violet-500,#8d7ab0);
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.rcp-ph svg{width:24px;height:24px}
.rcp-rt{flex:1;min-width:0}
.rcp-rt b{display:block;font-size:15.5px;color:var(--nu-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rcp-rt span{display:block;font-size:12.5px;color:var(--nu-muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rcp-go{color:var(--nu-muted);font-size:20px}
.rcp-photo{display:block;width:100%;max-height:240px;object-fit:cover;border-radius:22px;margin-bottom:18px;
  box-shadow:-4px -4px 10px var(--nu-lit),5px 7px 15px var(--nu-shade-soft)}
.rcp-name{font-size:26px;font-weight:800;color:var(--nu-ink);letter-spacing:-.3px;margin:0 2px 4px}
.rcp-tags{font-size:14px;color:var(--nu-muted);margin:0 2px 14px}
.rcp-chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}
.rcp-chip{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:7px 13px;font-size:13.5px;font-weight:700;color:var(--nu-ink);
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.rcp-chip svg{width:16px;height:16px;color:var(--violet-500,#8d7ab0)}
.rcp-card{border-radius:22px;padding:16px 16px 12px;margin-bottom:14px;background:var(--nu-ground);box-shadow:-4px -4px 10px var(--nu-lit),5px 6px 14px var(--nu-shade-soft)}
.rcp-ch{display:flex;align-items:center;gap:9px;font-size:16px;font-weight:800;color:var(--nu-ink);margin-bottom:10px}
.rcp-ic{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;color:var(--violet-500,#8d7ab0);
  box-shadow:inset 2px 3px 5px var(--nu-shade),inset -2px -2px 4px var(--nu-lit)}
.rcp-ing{display:flex;align-items:baseline;gap:10px;padding:6px 2px;font-size:15px;color:var(--nu-ink);line-height:1.5}
.rcp-ing i{flex:none;width:7px;height:7px;border-radius:50%;background:#f0a92e;box-shadow:0 0 6px rgba(240,169,46,.55);transform:translateY(-2px)}
.rcp-step{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px}
.rcp-n{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:800;color:var(--nu-ink);
  box-shadow:inset 2px 3px 5px var(--nu-shade),inset -2px -2px 4px var(--nu-lit)}
.rcp-step p{margin:3px 0 0;font-size:15px;color:var(--nu-ink);line-height:1.6;flex:1}
.rcp-note{font-size:15px;color:var(--nu-ink);line-height:1.6;white-space:pre-wrap}
.rcp-ic.amber svg{stroke:#b07a1e}
.rcp-shot{display:flex;justify-content:center;width:100%;margin-bottom:14px}
.rcp-form-h{font-size:20px;font-weight:800;color:var(--nu-ink);margin-bottom:16px}
.rcp-three{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px}
.rcp-save{display:flex;gap:8px;align-items:center;margin-top:10px}
.rcp-save .rcp-btn:first-child{flex:1;justify-content:center;padding:13px}`);

/* the three screens */
cut(`function renderRecipeList(){`, `/* The servings field is free text, so what reaches the chip could be "4" or`, `/* line icons, in the shape of the app's own */
var RCP_I={
  book:'<svg viewBox="0 0 24 24"><path d="M5 4.5h10.5a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3Z"/><path d="M5 17a3 3 0 0 1 3-3h10.5"/></svg>',
  pot:'<svg viewBox="0 0 24 24"><path d="M4 10h16v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z"/><path d="M2.5 10h19"/><path d="M9 6.5c0-1 1-1.5 1-2.5M14 6.5c0-1 1-1.5 1-2.5"/></svg>',
  plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  plate:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/></svg>',
  level:'<svg viewBox="0 0 24 24"><path d="M5 19v-4M10 19v-8M15 19v-6M20 19V7"/></svg>',
  basket:'<svg viewBox="0 0 24 24"><path d="M3.5 10h17l-1.8 9H5.3Z"/><path d="M8 10l3-5.5M16 10l-3-5.5"/></svg>',
  steps:'<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  bulb:'<svg viewBox="0 0 24 24"><path d="M9.2 17.6h5.6"/><path d="M10.2 20.4h3.6"/><path d="M12 3.4a5.6 5.6 0 0 0-3.3 10.1c.5.4.8 1 .8 1.6v.4h5v-.4c0-.6.3-1.2.8-1.6A5.6 5.6 0 0 0 12 3.4Z"/></svg>',
  camera:'<svg viewBox="0 0 24 24"><path d="M3 8.5h3.2l1.3-2h8l1.3 2H20a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13.5" r="3.3"/></svg>'
};
function renderRecipeList(){
  var recipes=loadRecipes();
  var h='<div class="rcp">';
  h+='<div class="rcp-top"><div class="rcp-h">'+_t('ספר המתכונים')+'</div>';
  if(recipes.length)h+='<button class="rcp-btn" onclick="_recipeView=\\'edit\\';_recipeIdx=-1;render()">'+_t('+ מתכון')+'</button>';
  h+='</div>';

  if(recipes.length===0){
    h+='<div class="rcp-empty"><div class="rcp-disc">'+RCP_I.book+'</div>'+
       '<b>'+_t('ספר המתכונים ריק')+'</b><p>'+_t('הוסף את המתכון הראשון שלך')+'</p>'+
       '<button class="rcp-btn" onclick="_recipeView=\\'edit\\';_recipeIdx=-1;render()">'+_t('+ מתכון')+'</button></div>';
    document.getElementById('content').innerHTML=h+'</div>';
    return;
  }

  // Build alphabet index
  var byLetter={};
  for(var ri=0;ri<recipes.length;ri++){
    var r=recipes[ri];
    var first=r.name?r.name.charAt(0).toUpperCase():'#';
    if(!byLetter[first])byLetter[first]=[];
    byLetter[first].push({r:r,idx:ri});
  }
  var letters=Object.keys(byLetter).sort(function(a,b){return a.localeCompare(b,APP_LOCALE);});

  /* the letters: a pressed channel, the chosen one raised in it */
  if(letters.length>1){
    h+='<div class="rcp-letters"><button class="'+(!_recipeLetter?'on':'')+'" onclick="_recipeLetter=null;render()">'+_t('הכל')+'</button>';
    for(var li=0;li<letters.length;li++){
      var l=letters[li];
      h+='<button class="'+(_recipeLetter===l?'on':'')+'" onclick="_recipeLetter=\\''+l+'\\';render()">'+esc(l)+'</button>';
    }
    h+='</div>';
  }

  var showLetters=_recipeLetter?[_recipeLetter]:letters;
  for(var sli=0;sli<showLetters.length;sli++){
    var sl=showLetters[sli];
    if(!byLetter[sl])continue;
    if(letters.length>1)h+='<div class="rcp-letter">'+esc(sl)+'</div>';
    var group=byLetter[sl];
    for(var gi=0;gi<group.length;gi++){
      var rec=group[gi].r,ridx=group[gi].idx;
      h+='<div class="rcp-row" onclick="_recipeView=\\'view\\';_recipeIdx='+ridx+';render()">'+
        (rec.photo?'<img class="rcp-th" src="'+rec.photo+'" alt="">':'<div class="rcp-ph">'+RCP_I.pot+'</div>')+
        '<div class="rcp-rt"><b>'+esc(rec.name)+'</b>'+(rec.tags?'<span>'+esc(rec.tags)+'</span>':'')+'</div>'+
        '<div class="rcp-go">&rsaquo;</div></div>';
    }
  }
  h+='</div>';
  document.getElementById('content').innerHTML=h;
}

`);
cut(`function renderViewRecipe(){`, `var _editRecipePhoto='';`, `function renderViewRecipe(){
  var recipes=loadRecipes();
  var rec=recipes[_recipeIdx];
  if(!rec){_recipeView='list';render();return;}
  var h='<div class="rcp">';
  h+='<div class="rcp-top"><button class="fit-back" onclick="_recipeView=\\'list\\';render()">&#8249; '+_t('חזרה')+'</button>'+
     '<button class="rcp-btn" onclick="_recipeView=\\'edit\\';render()">'+_t('ערוך')+'</button></div>';
  if(rec.photo)h+='<img class="rcp-photo" src="'+rec.photo+'" alt="">';
  h+='<div class="rcp-name">'+esc(rec.name)+'</div>';
  if(rec.tags)h+='<div class="rcp-tags">'+esc(rec.tags)+'</div>';
  if(rec.time||rec.servings||rec.difficulty){
    h+='<div class="rcp-chips">';
    if(rec.time)h+='<span class="rcp-chip">'+RCP_I.clock+esc(rec.time)+'</span>';
    if(rec.servings)h+='<span class="rcp-chip">'+RCP_I.plate+'<span>'+_t('{n} מנות',{n:recServings(rec.servings)})+'</span></span>';
    if(rec.difficulty)h+='<span class="rcp-chip">'+RCP_I.level+esc(rec.difficulty)+'</span>';
    h+='</div>';
  }
  var i,n;
  if(rec.ingredients){
    h+='<div class="rcp-card"><div class="rcp-ch"><span class="rcp-ic">'+RCP_I.basket+'</span>'+_t('מצרכים')+'</div>';
    var lines=rec.ingredients.split('\\n');
    for(i=0;i<lines.length;i++)if(lines[i].trim())h+='<div class="rcp-ing"><i></i><span>'+esc(lines[i].trim())+'</span></div>';
    h+='</div>';
  }
  if(rec.instructions){
    h+='<div class="rcp-card"><div class="rcp-ch"><span class="rcp-ic">'+RCP_I.steps+'</span>'+_t('אופן הכנה')+'</div>';
    var steps=rec.instructions.split('\\n');n=0;
    for(i=0;i<steps.length;i++){if(!steps[i].trim())continue;n++;
      h+='<div class="rcp-step"><span class="rcp-n">'+nfmt(n)+'</span><p>'+esc(steps[i].trim())+'</p></div>';}
    h+='</div>';
  }
  if(rec.notes){
    h+='<div class="rcp-card"><div class="rcp-ch"><span class="rcp-ic amber">'+RCP_I.bulb+'</span>'+_t('הערות')+'</div>'+
       '<div class="rcp-note">'+esc(rec.notes)+'</div></div>';
  }
  h+='</div>';
  document.getElementById('content').innerHTML=h;
}

function renderEditRecipe(){
  var recipes=loadRecipes();
  var rec=_recipeIdx>=0?recipes[_recipeIdx]:{name:'',ingredients:'',instructions:'',notes:'',tags:'',time:'',servings:'',difficulty:'',photo:''};
  var h='<div class="rcp">';
  h+='<div class="rcp-top"><button class="fit-back" onclick="_recipeView=\\''+(_recipeIdx>=0?'view':'list')+'\\';render()">&#8249; '+_t('חזרה')+'</button></div>';
  h+='<div class="rcp-form-h">'+(_recipeIdx>=0?_t('עריכת מתכון'):_t('מתכון חדש'))+'</div>';
  h+='<div style="margin-bottom:12px">';
  if(rec.photo)h+='<img class="rcp-photo" src="'+rec.photo+'" id="rec-photo-prev" alt="">';
  else h+='<div id="rec-photo-prev"></div>';
  h+='<div class="rcp-shot"><button class="rcp-btn" onclick="document.getElementById(\\'rec-photo-inp\\').click()">'+RCP_I.camera+_t('הוסף תמונה')+'</button></div>';
  h+='<input id="rec-photo-inp" type="file" accept="image/*" style="display:none" onchange="handleRecipePhoto(this)">';
  h+='</div>';

  function field(label,id,val,placeholder,type){
    return '<div style="margin-bottom:10px"><div class="fw-fl">'+label+'</div>'+
      (type==='textarea'?
        '<textarea id="'+id+'" class="mtin rcp-ta" rows="4" placeholder="'+(placeholder||'')+'">'+esc(val||'')+'</textarea>':
        '<input id="'+id+'" class="mtin" value="'+esc(val||'')+'" placeholder="'+(placeholder||'')+'">'
      )+'</div>';
  }
  h+=field(''+_t('שם המתכון')+'','rec-name',rec.name,''+_t('למשל: קציצות עוף')+'');
  h+='<div class="rcp-three">';
  h+='<div><div class="fw-fl">'+_t('זמן הכנה')+'</div><input id="rec-time" class="mtin" style="margin-bottom:0" value="'+esc(rec.time||'')+'" placeholder="'+_t("30 דק")+'"></div>';
  h+='<div><div class="fw-fl">'+_t('מנות')+'</div><input id="rec-servings" class="mtin" style="margin-bottom:0" value="'+esc(rec.servings||'')+'" placeholder="4"></div>';
  h+='<div><div class="fw-fl">'+_t('רמת קושי')+'</div><input id="rec-difficulty" class="mtin" style="margin-bottom:0" value="'+esc(rec.difficulty||'')+'" placeholder="'+_t("קל")+'"></div>';
  h+='</div>';
  h+=field(''+_t('תגיות (מופרדות בפסיקים)')+'','rec-tags',rec.tags,''+_t('למשל: עוף, קל, דייט')+'');
  h+=field(''+_t('מצרכים (שורה אחת לכל מצרך)')+'','rec-ingredients',rec.ingredients,_t('למשל:\\n200ג עוף\\n1 בצל...'),'textarea');
  h+=field(''+_t('אופן הכנה (שורה אחת לכל שלב)')+'','rec-instructions',rec.instructions,_t('למשל:\\nחממו שמן במחבת...\\nהוסיפו בצל...'),'textarea');
  h+=field(''+_t('הערות / טיפים')+'','rec-notes',rec.notes,''+_t('טיפים ושינויים...')+'','textarea');

  h+='<div class="rcp-save"><button class="rcp-btn" onclick="saveRecipe()">'+_t('שמור')+'</button>'+
     '<button class="rcp-btn ghost" onclick="_recipeView=\\''+(_recipeIdx>=0?'view':'list')+'\\';render()">'+_t('ביטול')+'</button>'+
     (_recipeIdx>=0?'<button class="rcp-btn ghost danger" onclick="deleteRecipe()">'+_t('מחק')+'</button>':'')+'</div></div>';
  document.getElementById('content').innerHTML=h;
  window._editRecipePhoto=rec.photo||'';
}

`);
rep(`      if(prev){prev.outerHTML='<img src="'+_editRecipePhoto+'" id="rec-photo-prev" style="width:100%;max-height:180px;object-fit:cover;border-radius:16px;margin-bottom:8px;display:block">';}`,
  `      if(prev){prev.outerHTML='<img class="rcp-photo" src="'+_editRecipePhoto+'" id="rec-photo-prev" alt="">';}`);
rep(`.rcp-save .rcp-btn:first-child{flex:1;justify-content:center;padding:13px}`, `.rcp-save .rcp-btn:first-child{flex:1;justify-content:center;padding:13px}
.rcp-ta{min-height:96px;resize:vertical;font-family:inherit;line-height:1.5}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
