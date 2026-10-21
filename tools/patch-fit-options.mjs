/* The four things Asaf photographed on 21 Oct: the fitness questions that read
 * as empty (experience and equipment become one option per row, each with the
 * line that says what it means, and equipment gains the two places people
 * actually train that the three did not cover); the tracking chips that had
 * no CSS rule at all; and a recipe book with no way in from its empty state. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

rep(`  if(k==='exp'){
    h='<div class="fg-row">';
    for(i=0;i<GENPROG_EXP.length;i++)
      h+='<button class="fg-b" onclick="fitMeSet(&quot;exp&quot;,&quot;'+GENPROG_EXP[i][0]+'&quot;)">'+esc(_t(GENPROG_EXP[i][1]))+'</button>';
    return h+'</div>';
  }
  if(k==='equip'){
    h='<div class="fg-row">';
    var EQ=['gym','home','none'];   // i18n-exempt: stored keys, drawn through genEquipLabel
    for(i=0;i<EQ.length;i++)
      h+='<button class="fg-b" onclick="fitMeEquip(&quot;'+EQ[i]+'&quot;)">'+genEquipLabel(EQ[i])+'</button>';
    return h+'</div>';
  }`, `  if(k==='exp'){
    h='<div class="fq-opts">';
    for(i=0;i<GENPROG_EXP.length;i++)
      h+='<button class="fg-b fq-o" onclick="fitMeSet(&quot;exp&quot;,&quot;'+GENPROG_EXP[i][0]+'&quot;)">'+esc(_t(GENPROG_EXP[i][1]))+
         '<span class="fq-os">'+genExpSub(GENPROG_EXP[i][0])+'</span></button>';
    return h+'</div>';
  }
  if(k==='equip'){
    h='<div class="fq-opts">';
    for(i=0;i<GEN_EQUIP_ORDER.length;i++)
      h+='<button class="fg-b fq-o" onclick="fitMeEquip(&quot;'+GEN_EQUIP_ORDER[i]+'&quot;)">'+genEquipLabel(GEN_EQUIP_ORDER[i])+
         '<span class="fq-os">'+genEquipSub(GEN_EQUIP_ORDER[i])+'</span></button>';
    return h+'</div>';
  }`);

rep(`  none:['משקל גוף','מזרן']   // i18n-exempt: same
};`, `  bands:['משקל גוף','מזרן','גומייה'],   // i18n-exempt: same
  park:['משקל גוף','מתח','ספסל','מדרגה'],   // i18n-exempt: same
  none:['משקל גוף','מזרן']   // i18n-exempt: same
};
var GEN_EQUIP_ORDER=['gym','home','bands','park','none'];   // i18n-exempt: stored keys, drawn through genEquipLabel`);

rep(`function genEquipLabel(v){
  if(v==='home')return ''+_t('בבית')+'';
  if(v==='none')return ''+_t('בלי ציוד')+'';
  return ''+_t('חדר כושר')+'';
}`, `function genEquipLabel(v){
  if(v==='home')return ''+_t('בבית')+'';
  if(v==='bands')return ''+_t('גומיות ומזרן')+'';
  if(v==='park')return ''+_t('בחוץ')+'';
  if(v==='none')return ''+_t('בלי ציוד')+'';
  return ''+_t('חדר כושר')+'';
}
/* what each answer means, under it - the line that turns three bare words
   into a choice somebody can actually make */
function genEquipSub(v){
  if(v==='home')return ''+_t('משקולות יד, ספסל וגומיות')+'';
  if(v==='bands')return ''+_t('בבית, בלי משקולות')+'';
  if(v==='park')return ''+_t('מתח, ספסל ומדרגות בגינה')+'';
  if(v==='none')return ''+_t('רק משקל הגוף, בכל מקום')+'';
  return ''+_t('מוטות, מכונות ופולי')+'';
}
function genExpSub(v){
  if(v==='new')return ''+_t('עוד לא התאמנתי באופן קבוע')+'';
  if(v==='back')return ''+_t('התאמנתי בעבר, ועכשיו חוזר')+'';
  if(v==='mid')return ''+_t('מתאמן באופן קבוע, פחות משנתיים')+'';
  return ''+_t('מתאמן באופן קבוע כבר כמה שנים')+'';
}`);

rep(`  var EQ=['gym','home','none'];   // i18n-exempt: stored keys, drawn through genEquipLabel
  for(var e=0;e<EQ.length;e++)
    h+='<button class="gn-e'+(g.equip===EQ[e]?' on':'')+'" onclick="genEquipSet(\\''+EQ[e]+'\\')">'+genEquipLabel(EQ[e])+'</button>';`,
`  for(var e=0;e<GEN_EQUIP_ORDER.length;e++)
    h+='<button class="gn-e'+(g.equip===GEN_EQUIP_ORDER[e]?' on':'')+'" onclick="genEquipSet(\\''+GEN_EQUIP_ORDER[e]+'\\')">'+genEquipLabel(GEN_EQUIP_ORDER[e])+'</button>';`);

rep(`    h+='<div class="gn-c"><div class="gn-h">'+_t('כושר')+'</div>';
    h+='<div style="font-size:19px;font-weight:800;color:var(--ink);margin-top:6px">'+_t('ברוך הבא לאזור הכושר')+'</div>';
    h+='<div class="gn-s">'+_t('כאן אתה בונה אימון, עוקב אחרי המשקלים ורואה את ההתקדמות לאורך זמן. כמה שאלות קצרות, ואכוון את זה אליך.')+'</div>';`,
`    h+='<div class="gn-c"><div class="gn-h">'+_t('כושר')+'</div>';
    h+='<div class="fq-wel">'+_t('ברוך הבא לאזור הכושר')+'</div>';
    h+='<p class="fq-welp">'+_t('כאן אתה בונה אימון, עוקב אחרי המשקלים ורואה את ההתקדמות לאורך זמן. כמה שאלות קצרות, ואכוון את זה אליך.')+'</p>';`);

/* the area card promised three questions; there are seven */
rep(`later:_t('לבנות לי תוכנית, 3 שאלות')};`, `later:_t('לבנות לי תוכנית אישית')};`);

rep(`.pf-goal.on{box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit);color:var(--nu-ink)}`,
`.pf-goal.on{box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit);color:var(--nu-ink)}
/* WHAT MY TRACKING INCLUDES. These chips were drawn with no rule at all, so
   the phone painted its own grey system buttons on a soft page - read as a
   bug, rightly. Now they are the same chip as the goals: raised when off,
   pressed when on. Meals cannot be switched off, and says so by being
   pressed and quiet rather than by looking broken. */
.wg-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
.wg-chip{flex:1 1 0;min-width:64px;border:none;border-radius:14px;padding:12px 8px;background:var(--nu-ground,#e9e7e3);font-family:inherit;
  font-size:13.5px;font-weight:800;color:var(--nu-muted,#6b645d);cursor:pointer;line-height:1.3;
  box-shadow:-3px -3px 7px var(--nu-lit,rgba(255,255,255,.95)),3px 4px 9px var(--nu-shade-soft,rgba(176,168,156,.28))}
.wg-chip.on{color:var(--nu-ink,#4a453f);
  box-shadow:inset 2px 3px 6px var(--nu-shade,rgba(176,168,156,.44)),inset -2px -2px 5px var(--nu-lit,rgba(255,255,255,.95))}
.wg-chip:disabled{cursor:default;opacity:.75}
/* an empty recipe book says how to start it, where the eye already is */
.rc-first{margin-top:22px;border:none;border-radius:18px;padding:15px 34px;background:var(--nu-ground,#e9e7e3);font-family:inherit;
  font-size:15.5px;font-weight:800;color:var(--nu-ink,#4a453f);cursor:pointer;
  box-shadow:-5px -5px 13px var(--nu-lit,rgba(255,255,255,.95)),7px 9px 20px var(--nu-shade,rgba(176,168,156,.44)),inset 0 -3px 0 color-mix(in srgb,var(--violet-500,#8a6fc7) 55%,transparent)}`);

/* a tab opens at its top: the recipe header was scrolled under the page's
   own header by the tab before it */
rep(`function switchTab(t){curTab=t;render();}`, `function switchTab(t){curTab=t;render();try{window.scrollTo(0,0);}catch(e){}}`);
rep(`    h+='<div style="font-size:13px;color:var(--muted)">'+_t('הוסף את המתכון הראשון שלך')+'</div>';
    h+='</div>';`, `    h+='<div style="font-size:13px;color:var(--muted)">'+_t('הוסף את המתכון הראשון שלך')+'</div>';
    h+='<button class="rc-first" onclick="_recipeView=\\'edit\\';_recipeIdx=-1;render()">'+_t('+ מתכון')+'</button>';
    h+='</div>';`);
fs.writeFileSync(F, s);
console.log('patched');
