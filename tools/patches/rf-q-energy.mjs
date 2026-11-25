// The sixth pair (25 Nov), as Asaf approved it on the review page: what filled you and what drained you, as one
// porcelain pair - the same vessel, full of amber light over the first question and almost empty, with a hairline
// crack letting a thread of light out, over the second. The nine answers of each stay exactly as they were; they
// become pebbles, each with a small line icon in the icon set's own 24-box and stroke (drawn, not cut, so they are
// sharp at every size). The note well takes the page's serif. And a pebble tapped no longer drops the note being
// written: rfToggleChip re-renders, so it commits the text first.
// The two vessels are cut from the two approved renders into assets/rf-q6.webp (two 300x320 cells), colour-matched.
// usage: node tools/patches/rf-q-energy.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`  moon:'<path d="M19.4 14.6A8.2 8.2 0 0 1 9.4 4.6a8.6 8.6 0 1 0 10 10Z"/>'
};`,
   `  moon:'<path d="M19.4 14.6A8.2 8.2 0 0 1 9.4 4.6a8.6 8.6 0 1 0 10 10Z"/>',
  /* the energy pebbles (25 Nov) */
  briefcase:'<rect x="3.6" y="7.6" width="16.8" height="11.6" rx="2"/><path d="M8.8 7.6V5.8a1.4 1.4 0 0 1 1.4-1.4h3.6a1.4 1.4 0 0 1 1.4 1.4v1.8"/><path d="M3.6 12.6h16.8"/>',
  brush:'<path d="M19.6 4.4 11 13"/><path d="M11 13c-2.2-.6-4.4.6-4.8 3-.3 1.8-1.2 2.8-2.6 3.2 3.4 1.4 7.6.4 8.4-2.8.3-1.3 0-2.6-1-3.4Z"/>',
  leaf:'<path d="M5.2 18.8C4.4 10.6 9.6 5 19 4.8c.4 9.2-5 14.6-13.8 14Z"/><path d="M5.2 18.8 13.6 10.4"/>',
  person:'<circle cx="12" cy="8" r="3.4"/><path d="M5.8 20a6.2 6.2 0 0 1 12.4 0"/>',
  dot:'<circle cx="12" cy="12" r="2.4"/>',
  phone:'<rect x="7" y="3.4" width="10" height="17.2" rx="2.2"/><path d="M11 17.4h2"/>',
  eyeshut:'<path d="M3.6 10.4c4.6 5 12.2 5 16.8 0"/><path d="m6.2 13.2-1.6 2.4"/><path d="m12 14.6v2.8"/><path d="m17.8 13.2 1.6 2.4"/>',
  cross:'<path d="m5.4 5.4 13.2 13.2"/><path d="M18.6 5.4 5.4 18.6"/>',
  sound:'<path d="M4.4 9.6v4.8h3.2l4.4 3.6V6L7.6 9.6Z"/><path d="M15.4 9.2a4 4 0 0 1 0 5.6"/><path d="M18 6.8a7.4 7.4 0 0 1 0 10.4"/>'
};
var RF_CHIP_IC={'אנשים':'people','עבודה':'briefcase','יצירה':'brush','אימון':'dumbbell','מנוחה':'moon','טבע':'leaf','מוזיקה':'note','זמן לבד':'person','משהו אחר':'dot','מסכים':'phone','חוסר שינה':'eyeshut','התנגשויות':'cross','דברים שנדחו':'hourglass','רעש':'sound','דאגות':'cloud'};   // i18n-exempt: keys, the stored words of RF_ENERGY and RF_DRAIN - matched, never shown`],
  [`q.id==='impactfulMoment'?'ripple':q.id==='proudOf'?'medal':'';`,
   `q.id==='impactfulMoment'?'ripple':q.id==='proudOf'?'medal':q.id==='energyGivers'?'jarfull':q.id==='energyDrainers'?'jarlow':'';`],
  [`k==='ripple'||k==='medal'?'rf-q5':'rf-q';`,
   `k==='ripple'||k==='medal'?'rf-q5':k==='jarfull'||k==='jarlow'?'rf-q6':'rf-q';`],
  [`  else if(q.kind==='chipsNote'){
    h+=rfChipsHTML(q.id,q.opts,rfArr(q.id));
    h+='<textarea class="rf-in" id="rf-note" style="min-height:64px;margin-top:18px"`,
   `  else if(q.kind==='chipsNote'){
    h+=rfChipsHTML(q.id,q.opts,rfArr(q.id),true);
    h+='<textarea class="rf-in rfq-short" id="rf-note" style="min-height:64px;margin-top:18px"`],
  [`function rfChipsHTML(id,opts,sel){
  var h='<div class="rf-chips">',i;
  for(i=0;i<opts.length;i++)
    /* The value is compared and stored raw; only the caption is translated. */
    h+='<button class="rf-chip'+(sel.indexOf(opts[i])>=0?' on':'')+'" onclick="rfToggleChip(\\''+id+'\\',\\''+opts[i]+'\\')">'+labelOf(opts[i])+'</button>';`,
   `function rfChipsHTML(id,opts,sel,icons){
  var h='<div class="rf-chips'+(icons?' rfq-pebbles':'')+'">',i,ic;
  for(i=0;i<opts.length;i++){
    ic=icons&&RF_ICONS[RF_CHIP_IC[opts[i]]]?'<svg viewBox="0 0 24 24" aria-hidden="true">'+RF_ICONS[RF_CHIP_IC[opts[i]]]+'</svg>':'';
    /* The value is compared and stored raw; only the caption is translated. */
    h+='<button class="rf-chip'+(sel.indexOf(opts[i])>=0?' on':'')+'" onclick="rfToggleChip(\\''+id+'\\',\\''+opts[i]+'\\')">'+ic+labelOf(opts[i])+'</button>';
  }`],
  [`function rfToggleChip(id,val){
  var arr=rfArr(id).slice(),i=arr.indexOf(val);`,
   `function rfToggleChip(id,val){
  rfCommitText();
  var arr=rfArr(id).slice(),i=arr.indexOf(val);`],
  [`html body.mod-endofday .rf-in.rfq-short{min-height:76px;font-family:"Frank Ruhl Libre",Georgia,serif;padding:12px 16px}
`,
   `html body.mod-endofday .rf-in.rfq-short{min-height:76px;font-family:"Frank Ruhl Libre",Georgia,serif;padding:12px 16px}
/* the sixth pair (25 Nov): assets/rf-q6.webp, two 300x320 vessels, drawn at 0.42 */
html body.mod-endofday .rfq-jarfull,html body.mod-endofday .rfq-jarlow{width:126px;height:134px;background-size:252px 134px;
  -webkit-mask:radial-gradient(closest-side,#000 74%,transparent 100%);mask:radial-gradient(closest-side,#000 74%,transparent 100%)}
html body.mod-endofday .rfq-jarfull{background-position:0 0}
html body.mod-endofday .rfq-jarlow{background-position:-126px 0}
html body.mod-endofday .rfq-pebbles{gap:10px;justify-content:center}
html body.mod-endofday .rfq-pebbles .rf-chip{display:inline-flex;align-items:center;gap:7px;border:none;border-radius:99px;padding:9px 15px;
  background:var(--nu-ground);color:var(--nu-ink);font-family:"Frank Ruhl Libre",Georgia,serif;font-size:15px;font-weight:500;
  box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}
html body.mod-endofday .rfq-pebbles .rf-chip svg{width:17px;height:17px;flex:none;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;opacity:.75}
html body.mod-endofday .rfq-pebbles .rf-chip.on{color:#8a5a1c;
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit),0 0 0 2px rgba(240,169,46,.5),0 0 12px 2px rgba(240,169,46,.25)}
html body.mod-endofday .rfq-pebbles .rf-chip.on svg{opacity:1}
`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
