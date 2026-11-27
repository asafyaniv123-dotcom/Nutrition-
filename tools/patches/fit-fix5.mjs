/* Asaf on the phone, 27 Nov, five things:
 *  1. "how many of them a week?" was unclear - two or more changing trainings now get a row each.
 *  2. strength had no 0 - someone who only does Pilates and swimming saves the week, with no plan.
 *  3. "where do you train" is one place - people combine; several places are their union.
 *  4. the plan should show our loops - each exercise row carries its demo.
 *  5. saving printed "&#10003;" - showToast writes text, not HTML.
 * Also the grey "after six weeks, a lighter week" line under the plan.
 * Built by scratchpad mk-fitfix5.mjs from byte-exact slices of dev/index.html.
 * Run: node tools/patches/fit-fix5.mjs [file] [--reverse]
 */
import fs from 'node:fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';
const PAIRS = [
 [
  "  if(k==='otherN'){q=asetOth('v').length===1?_t('כמה פעמים בשבוע {name}?',{name:wtLabel(asetOth('v')[0])}):_t('כמה מהם בשבוע?');why=_t('השאלה הבאה: כמה אימוני כוח.');\n    body='<div class=\"as-grid\">';for(i=1;i<=5;i++)body+=asetChoice('otherN',i,nfmt(i));body+='</div>';}",
  "  if(k==='otherN'&&asetOth('v').length===1){q=_t('כמה פעמים בשבוע {name}?',{name:wtLabel(asetOth('v')[0])});why=_t('השאלה הבאה: כמה אימוני כוח.');\n    body='<div class=\"as-grid\">';for(i=1;i<=5;i++)body+=asetChoice('otherN',i,nfmt(i));body+='</div>';}\n  /* two or more: one row each, the name above its own numbers - \"how many of them\" named nothing */\n  else if(k==='otherN'){q=_t('כמה פעמים בשבוע כל אחד?');why=_t('השאלה הבאה: כמה אימוני כוח.');\n    asetOth('v').forEach(function(x){body+='<div class=\"as-oml\">'+esc(wtLabel(x))+'</div><div class=\"as-n5\">';\n      for(var c=1;c<=5;c++)body+='<button class=\"dr-r2 as-o'+((t.oCnt||{})[x]===c?' on':'')+'\" onclick=\"asetCnt(\\''+x+'\\','+c+')\"><b>'+nfmt(c)+'</b></button>';\n      body+='</div>';});}"
 ],
 [
  "function asetFix(x,d){",
  "function asetCnt(x,c){var t=_aset.t;t.oCnt=t.oCnt||{};t.oCnt[x]=c;t.otherN=0;asetOth('v').forEach(function(y){t.otherN+=t.oCnt[y]||0;});asetPaint();}\nfunction asetFix(x,d){"
 ],
 [
  "if(k==='otherN')return t.otherN>0;",
  "if(k==='otherN')return asetOth('v').length>1?asetOth('v').every(function(x){return (t.oCnt||{})[x]>0;}):t.otherN>0;"
 ],
 [
  "if(k==='days')return t.days>asetOthN();",
  "if(k==='days')return asetOthN()?t.days>=asetOthN()&&_aset.dSet:t.days>0;"
 ],
 [
  "for(i=1;i<=6;i++)body+=asetChoice('days',i+_on,nfmt(i));",
  "for(i=0;i<=6;i++)body+=asetChoice('days',i+_on,nfmt(i)).replace('onclick=\"','onclick=\"_aset.dSet=1;');"
 ],
 [
  "      o.otherN=o.other.length?Math.max(0,Math.min(asetOthN(),t.days-1)):0;",
  "      o.otherN=o.other.length?Math.max(0,Math.min(asetOthN(),t.days)):0;"
 ],
 [
  "return Math.max(1,d-o);}",
  "return o>0?Math.max(0,d-o):Math.max(1,d);}"
 ],
 [
  "  /* ── THE PART THAT WAS MISSING: what it all adds up to ── */",
  "  /* NO STRENGTH AT ALL (27 Nov): the other training is the week, and there is no plan to build */\n  if(!fitStrengthDays(me)){\n    _fitW.week=_fitW.week||fitWeekFor(null,me,_fitW.hand);\n    h+='<div class=\"gn-c\"><div class=\"fw-sum-t\">'+_t('השבוע שלך')+'</div>'+fitWeekRowHTML(_fitW.week,1)+'</div>';\n    h+='<button class=\"gn-go\" onclick=\"fitWSaveWeek()\">'+_t('שמור את השבוע')+'</button>';\n    h+='<button class=\"fq-later\" onclick=\"fitWSkip()\">'+_t('אימון בלי תוכנית')+'</button>';\n    return void(document.getElementById('content').innerHTML=h+'</div>');\n  }\n  /* ── THE PART THAT WAS MISSING: what it all adds up to ── */"
 ],
 [
  "function fitWAgain(){",
  "function fitWSaveWeek(){var me=fitMe();me.hand=(_fitW&&_fitW.hand)||{};try{localStorage.setItem(FIT_ME_KEY,JSON.stringify(me));}catch(e){}\n  fitWeekWrite((_fitW&&_fitW.week)||fitWeekFor(null,me,me.hand));_fitW=null;showToast('✓ '+_t('השבוע נשמר'));_fitView='home';renderFitness();}\nfunction fitWAgain(){"
 ],
 [
  "  var P=fitWPlan(),days=[],opts=[],j,h;",
  "  var P=fitStrengthDays()?fitWPlan():{exercises:[]},days=[],opts=[],j,h;"
 ],
 [
  "ex=f==='limits'||f==='other';",
  "ex=f==='limits'||f==='other'||f==='equip';"
 ],
 [
  "if(k==='equip')return !!t.equip;",
  "if(k==='equip')return t.equip.length>0;"
 ],
 [
  "equip:genEquip(),limits:(o.limits||[]).slice()",
  "equip:o.equipDone?genEquipList():[],limits:(o.limits||[]).slice()"
 ],
 [
  "try{localStorage.setItem(GEN_EQUIP_KEY,t.equip);}catch(e){}",
  "try{localStorage.setItem(GEN_EQUIP_KEY,t.equip.join(','));}catch(e){}"
 ],
 [
  "  if(k==='equip'){q=fitMeQuestion('equip');for(i=0;i<GEN_EQUIP_ORDER.length;i++)body+=asetChoice('equip',GEN_EQUIP_ORDER[i],genEquipLabel(GEN_EQUIP_ORDER[i]),genEquipSub(GEN_EQUIP_ORDER[i]));}",
  "  if(k==='equip'){q=fitMeQuestion('equip');why=_t('אפשר לבחור יותר מאחת.');for(i=0;i<GEN_EQUIP_ORDER.length;i++)body+=asetChoice('equip',GEN_EQUIP_ORDER[i],genEquipLabel(GEN_EQUIP_ORDER[i]),genEquipSub(GEN_EQUIP_ORDER[i]),1);}"
 ],
 [
  "function genEquip(){\n  var v;try{v=localStorage.getItem(GEN_EQUIP_KEY);}catch(e){}\n  return GEN_EQUIP[v]?v:'gym';   // i18n-exempt: a stored key, not a label\n}",
  "/* MORE THAN ONE PLACE (27 Nov, \"they may combine\"): stored as \"home,park\". One place is itself; several\n   are 'mix' - the equipment of all of them, the gear any of them has, and bare only when every one is */\nvar GEN_MIX=[];\nfunction genEquipList(){\n  var v='';try{v=localStorage.getItem(GEN_EQUIP_KEY)||'';}catch(e){}\n  var L=v.split(',').filter(function(k){return GEN_EQUIP_ORDER.indexOf(k)>=0;});\n  return L.length?L:['gym'];   // i18n-exempt: a stored key, not a label\n}\nfunction genEquip(){\n  var L=genEquipList();if(L.length===1)return L[0];\n  var u=[];L.forEach(function(k){GEN_EQUIP[k].forEach(function(q){if(u.indexOf(q)<0)u.push(q);});});\n  GEN_EQUIP.mix=u;GEN_MIX=L;GEN_BARE.mix=L.every(function(k){return !!GEN_BARE[k];})?1:0;\n  return 'mix';   // i18n-exempt: a stored key, not a label\n}\nfunction genPlaceIn(list,place){return place==='mix'?GEN_MIX.some(function(k){return list.indexOf(k)>=0;}):list.indexOf(place)>=0;}"
 ],
 [
  "if(place&&GEN_GEAR[e.id]&&GEN_GEAR[e.id].indexOf(place)<0)return false;",
  "if(place&&GEN_GEAR[e.id]&&!genPlaceIn(GEN_GEAR[e.id],place))return false;"
 ],
 [
  "function genEquipLabel(v){",
  "function genEquipLabel(v){\n  if(v==='mix')return GEN_MIX.map(genEquipLabel).join(' \\u00b7 ');"
 ],
 [
  "function genEquipSub(v){",
  "function genEquipSub(v){\n  if(v==='mix')return '';"
 ],
 [
  "      h+='<div class=\"fw-ex\"><b>'+esc(exLabel(day[j].name))+'</b>",
  "      h+='<div class=\"fw-ex\">'+fitExVid(day[j].name)+'<b>'+esc(exLabel(day[j].name))+'</b>"
 ],
 [
  "      h+='<div class=\"fw-ex\"><b>'+esc(exLabel(by[d][j].name))+'</b>",
  "      h+='<div class=\"fw-ex\">'+fitExVid(by[d][j].name)+'<b>'+esc(exLabel(by[d][j].name))+'</b>"
 ],
 [
  "function fitWeekName(e){",
  "/* the plan is read with its loops beside it, the same ones the library plays */\nfunction fitExVid(name){\n  var e=exByName(name);if(!e||!EX_DEMO[exDemoId(e)])return '<span class=\"fw-vid\"></span>';\n  var still=false;try{still=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(x){}\n  return '<video class=\"fw-vid\" src=\"'+exDemoUrl(exDemoId(e))+'\" muted loop playsinline preload=\"metadata\"'+(still?'':' autoplay')+' aria-hidden=\"true\"></video>';\n}\nfunction fitWeekName(e){"
 ],
 [
  ".fw-ex b{font-size:15px;font-weight:600;color:var(--nu-ink,#4a453f);min-width:0}",
  ".fw-ex b{font-size:15px;font-weight:600;color:var(--nu-ink,#4a453f);min-width:0;flex:1}\n.fw-ex{align-items:center}\n.fw-vid{width:52px;height:52px;flex:none;border-radius:14px;object-fit:cover;background:#120d08;display:block}\n.as-n5{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}\n.as-n5 .as-o{padding:13px 0;align-items:center}"
 ],
 [
  "  h+='<div class=\"gn-c\"><div class=\"gn-s\">'+_t('אחרי שישה שבועות — שבוע הקלה, ואז ממשיכים. התוכנית מתחלפת כל 6–8 שבועות.')+'</div></div>';\n  h+='<button class=\"gn-go\" onclick=\"fitWSave()\">'",
  "  h+='<button class=\"gn-go\" onclick=\"fitWSave()\">'"
 ],
 [
  "  _genProg=null;\n  showToast('&#10003; '+_t('התוכנית נבנתה'));",
  "  _genProg=null;\n  showToast('✓ '+_t('התוכנית נבנתה'));"
 ],
 [
  "showToast('&#10003; '+_t('השבוע סודר'))",
  "showToast('✓ '+_t('השבוע סודר'))"
 ],
 [
  "  _fitProgIdx=progs.length-1;_fitW=null;\n  showToast('&#10003; '+_t('התוכנית נבנתה'));",
  "  _fitProgIdx=progs.length-1;_fitW=null;\n  showToast('✓ '+_t('התוכנית נבנתה'));"
 ]
];
let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 200)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
