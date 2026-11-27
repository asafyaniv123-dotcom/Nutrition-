/* Asaf on the phone, 27 Nov: "why so few sports? when someone says yes, the options should open
 * gradually and cleanly - skateboarding, dance, ice skating... the popular ones first." And: "the
 * strength question shows no options at all - a bug." It was: running, cycling and "other" filled
 * the week, and strength was offered 1..(7 - those), which was nothing. The question is now yes / no
 * first; yes lets 23 sports rise in, the common ones first. Strength is always 1-6, and a week the
 * other training fills puts strength on a shared day ("Full body + Running") rather than dropping it.
 * New sports join WORKOUT_TYPES with more:1, so the schedule's day editor shows them only when she
 * trains one. Built by scratchpad mk-fitsports.mjs from byte-exact slices of dev/index.html.
 * Run: node tools/patches/fit-sports.mjs [file] [--reverse]
 */
import fs from 'node:fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';
const PAIRS = [
 [
  "var FIT_OTHER=['pilates','yoga','cardio','swim','cycle','sport','other'];",
  "var FIT_OTHER=['cardio','walk','yoga','pilates','swim','cycle','hiit','dance','football','basketball','tennis','padel','martial','boxing','climb','volley','surf','skate','iceskate','ski','ride','row','other'];"
 ],
 [
  "  {id:'other',    emoji:'&#x2B50;', label:''+_t('אחר')+'',   color:PAL.muted}",
  "  /* the sports the setup offers (27 Nov). more:1 keeps them out of the day editor's grid unless\n     she trains one - twelve buttons there were already a lot */\n  {id:'dance',     more:1,emoji:'&#x2B50;',label:_t('ריקוד'),          color:PAL.muted},\n  {id:'football',  more:1,emoji:'&#x2B50;',label:_t('כדורגל'),         color:PAL.muted},\n  {id:'basketball',more:1,emoji:'&#x2B50;',label:_t('כדורסל'),         color:PAL.muted},\n  {id:'tennis',    more:1,emoji:'&#x2B50;',label:_t('טניס'),           color:PAL.muted},\n  {id:'padel',     more:1,emoji:'&#x2B50;',label:_t('פאדל'),           color:PAL.muted},\n  {id:'martial',   more:1,emoji:'&#x2B50;',label:_t('אומנויות לחימה'), color:PAL.muted},\n  {id:'boxing',    more:1,emoji:'&#x2B50;',label:_t('אגרוף'),          color:PAL.muted},\n  {id:'climb',     more:1,emoji:'&#x2B50;',label:_t('טיפוס'),          color:PAL.muted},\n  {id:'volley',    more:1,emoji:'&#x2B50;',label:_t('כדורעף'),         color:PAL.muted},\n  {id:'surf',      more:1,emoji:'&#x2B50;',label:_t('גלישת גלים'),     color:PAL.muted},\n  {id:'skate',     more:1,emoji:'&#x2B50;',label:_t('סקייטבורד'),      color:PAL.muted},\n  {id:'iceskate',  more:1,emoji:'&#x2B50;',label:_t('החלקה על הקרח'),  color:PAL.muted},\n  {id:'ski',       more:1,emoji:'&#x2B50;',label:_t('סקי'),            color:PAL.muted},\n  {id:'ride',      more:1,emoji:'&#x2B50;',label:_t('רכיבה על סוסים'), color:PAL.muted},\n  {id:'row',       more:1,emoji:'&#x2B50;',label:_t('חתירה'),          color:PAL.muted},\n  {id:'other',    emoji:'&#x2B50;', label:''+_t('אחר')+'',   color:PAL.muted}"
 ],
 [
  "  for(i=0;i<WORKOUT_TYPES.length;i++)\n    h+='<button data-wt=\"'",
  "  for(i=0;i<WORKOUT_TYPES.length;i++)if(!wtHidden(WORKOUT_TYPES[i].id,cur.type))\n    h+='<button data-wt=\"'"
 ],
 [
  "    var wt=WORKOUT_TYPES[ti];\n    var isSel=entry.type===wt.id;",
  "    var wt=WORKOUT_TYPES[ti];if(wtHidden(wt.id,entry.type))continue;\n    var isSel=entry.type===wt.id;"
 ],
 [
  "function wtLabel(id){",
  "function wtHidden(id,cur){var t=(WORKOUT_TYPES||[]).filter(function(x){return x.id===id;})[0];return !!(t&&t.more&&id!==cur&&(fitMe().other||[]).indexOf(id)<0);}\nfunction wtLabel(id){"
 ],
 [
  "  if(k==='other'){q=_t('אתה עושה כבר אימונים אחרים?');why=_t('חוץ מאימוני כוח. נשמור להם ימים בשבוע, והתוכנית תיבנה סביבם.');\n    body='<div class=\"as-grid\">';for(i=0;i<FIT_OTHER.length;i++)body+=asetChoice('other',FIT_OTHER[i],esc(wtLabel(FIT_OTHER[i])),'',1);\n    body+=asetChoice('other','none',_t('לא'),'',1)+'</div>';}",
  "  if(k==='other'){q=_t('אתה עושה כבר אימונים אחרים?');why=_t('חוץ מאימוני כוח. נשמור להם ימים בשבוע, והתוכנית תיבנה סביבם.');\n    var _yes=_aset.oYes||t.other.filter(function(x){return x!=='none';}).length>0,_rise=_yes&&!_aset.spShown;   // i18n-exempt: a stored key\n    body='<div class=\"as-grid as-om\"><button class=\"dr-r2 as-o'+(_yes?' on':'')+'\" onclick=\"asetOtherYes(1)\"><b>'+_t('כן')+'</b></button>'+\n      '<button class=\"dr-r2 as-o'+(t.other.indexOf('none')>=0?' on':'')+'\" onclick=\"asetOtherYes(0)\"><b>'+_t('לא')+'</b></button></div>';   // i18n-exempt: a stored key\n    if(_yes){var _L=FIT_OTHER.slice();t.other.forEach(function(x){if(x!=='none'&&_L.indexOf(x)<0)_L.splice(_L.length-1,0,x);});   // i18n-exempt: a stored key\n      body+='<div class=\"as-grid as-sp\">';\n      _L.forEach(function(x,j){var b=asetChoice('other',x,esc(wtLabel(x)),'',1);\n        body+=_rise?b.replace('class=\"dr-r2 as-o','style=\"animation-delay:'+(j*35)+'ms\" class=\"dr-r2 as-o as-rise'):b;});\n      body+='</div>';_aset.spShown=1;}}"
 ],
 [
  "function asetFix(x,d){",
  "/* yes opens the sports, no answers the question */\nfunction asetOtherYes(v){var t=_aset.t;if(v){_aset.oYes=1;t.other=t.other.filter(function(x){return x!=='none';});}   // i18n-exempt: a stored key\n  else{_aset.oYes=0;_aset.spShown=0;t.other=['none'];}asetPaint();}   // i18n-exempt: a stored key\nfunction asetFix(x,d){"
 ],
 [
  "for(i=1;i<=Math.min(6,7-_on);i++)body+=asetChoice('days',i+_on,nfmt(i));",
  "for(i=1;i<=6;i++)body+=asetChoice('days',i+_on,nfmt(i));"
 ],
 [
  "  put.forEach(function(d){wk[d]={type:'strength',label:'',prog:p.id,pday:''};});",
  "  put.forEach(function(d){wk[d]={type:'strength',label:'',prog:p.id,pday:''};});\n  /* a week the other training fills: strength shares a day with it rather than vanish */\n  var more=days.length?Math.max(0,S-taken.length-put.length):0;\n  if(more){var oDays=[],st=taken.concat(put);for(i=0;i<7;i++)if(wk[i]&&wk[i].type!=='strength'&&wk[i].type!=='rest')oDays.push(i);\n    fitWeekPlace(oDays,Math.min(more,oDays.length),st).forEach(function(d){wk[d]={type:'strength',label:'',prog:p.id,pday:'',with:wk[d].type};});}"
 ],
 [
  "e.type==='strength'?fitPlanName(e):wtLabel(e.type);}",
  "e.type==='strength'?fitPlanName(e)+(e.with?' + '+wtLabel(e.with):''):wtLabel(e.type);}"
 ],
 [
  ".as-om{grid-template-columns:1fr 1fr}",
  ".as-om{grid-template-columns:1fr 1fr}\n.as-sp{margin-top:14px}\n.as-rise{animation:asRise .38s cubic-bezier(.2,.8,.2,1) both}\n@keyframes asRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}\n@media (prefers-reduced-motion:reduce){.as-rise{animation:none}}"
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
