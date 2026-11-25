// The seventh pair (25 Nov), as Asaf approved it on the review page - and with its inner parts, which he asked to be
// designed too ("everything that happens after you tap something"):
//  - משהו שנדחה: a porcelain hourglass. Yes and No become two large porcelain tiles (every yes/no question gets
//    them; the hourglass only this one). After yes the order turns: first "what was it?" in one pressed slot, then
//    "what made you put it off?" as pebbles - the thing itself before the reason.
//  - האדם של היום: two porcelain figures in a ring of light. The people become round pebbles with the first letter
//    of the name (in the name's own script) and the name under it; the last pebble is "+" for someone new, and
//    adding someone is a pressed slot with a round button, not a bare input. "How did they affect you?" becomes
//    three tiles, each with a small line icon - sun, cloud, sun and cloud.
// Hourglass and figures are cut from the two approved renders into assets/rf-q7.webp (220 + 320 wide, 320 high).
// usage: node tools/patches/rf-q-proc-person.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`  sound:'<path d="M4.4 9.6v4.8h3.2l4.4 3.6V6L7.6 9.6Z"/><path d="M15.4 9.2a4 4 0 0 1 0 5.6"/><path d="M18 6.8a7.4 7.4 0 0 1 0 10.4"/>'
};`,
   `  sound:'<path d="M4.4 9.6v4.8h3.2l4.4 3.6V6L7.6 9.6Z"/><path d="M15.4 9.2a4 4 0 0 1 0 5.6"/><path d="M18 6.8a7.4 7.4 0 0 1 0 10.4"/>',
  suncloud:'<circle cx="9" cy="8.4" r="3"/><path d="M9 2.6v1.2"/><path d="M3.2 8.4h1.2"/><path d="m4.9 4.3.9.9"/><path d="m13.1 4.3-.9.9"/><path d="M9.4 19.4a3.4 3.4 0 0 1-.4-6.8 4.8 4.8 0 0 1 9.2 1.2 2.8 2.8 0 0 1-.6 5.6Z"/>'
};
// the three answers to "how did they affect you", in RF_IMPACT's order
var RF_IMPACT_IC=['sun','cloud','suncloud'];`],
  [`q.id==='energyGivers'?'jarfull':q.id==='energyDrainers'?'jarlow':'';`,
   `q.id==='energyGivers'?'jarfull':q.id==='energyDrainers'?'jarlow':q.id==='procrastinated'?'hourglass':q.id==='influentialPerson'?'pair':'';`],
  [`k==='jarfull'||k==='jarlow'?'rf-q6':'rf-q';`,
   `k==='jarfull'||k==='jarlow'?'rf-q6':k==='hourglass'||k==='pair'?'rf-q7':'rf-q';`],
  [`  else if(q.kind==='branch'){
    h+='<div class="rf-ladder">';`,
   `  else if(q.kind==='branch'){
    h+='<div class="rf-ladder rfq-yn">';`],
  [`    if(cur===true&&q.follow){
      h+='<div class="rf-sub" style="margin-top:26px;font-weight:700;color:var(--ink);font-size:15px">'+q.follow+'</div>';
      h+='<div style="margin-top:14px">'+rfChipsHTML(q.listId,q.opts,rfArr(q.listId))+'</div>';
      h+='<textarea class="rf-in" id="rf-note" style="min-height:64px;margin-top:16px" placeholder="'+(q.ph||'')+'">'+(rfVal(q.note)?esc(rfVal(q.note)):'')+'</textarea>';`,
   `    if(cur===true&&q.follow&&q.id==='procrastinated'){
      /* the thing itself first, then why */
      h+='<textarea class="rf-in rfq-short rfq-one" id="rf-note" placeholder="'+(q.ph||'')+'">'+(rfVal(q.note)?esc(rfVal(q.note)):'')+'</textarea>';
      h+='<div class="rfq-tl rfq-tl2">'+q.follow+'</div>';
      h+=rfChipsHTML(q.listId,q.opts,rfArr(q.listId),true);
    } else if(cur===true&&q.follow){
      h+='<div class="rf-sub" style="margin-top:26px;font-weight:700;color:var(--ink);font-size:15px">'+q.follow+'</div>';
      h+='<div style="margin-top:14px">'+rfChipsHTML(q.listId,q.opts,rfArr(q.listId))+'</div>';
      h+='<textarea class="rf-in" id="rf-note" style="min-height:64px;margin-top:16px" placeholder="'+(q.ph||'')+'">'+(rfVal(q.note)?esc(rfVal(q.note)):'')+'</textarea>';
    }
    if(cur===true&&q.follow){`],
  [`    h+='<div class="rf-chips">';
    for(i=0;i<people.length;i++){
      o=people[i].name||'';
      if(!o)continue;
      h+='<button class="rf-chip'+(sel===o?' on':'')+'" onclick="rfPickPerson(\\''+esc(o).replace(/'/g,"\\\\'")+'\\')">'+esc(o)+'</button>';
    }
    h+='<button class="rf-chip" style="border-style:dashed" onclick="rfAddPersonOpen()">'+_t('+ אדם חדש')+'</button>';
    h+='</div>';`,
   `    h+='<div class="rfq-avs">';
    for(i=0;i<people.length;i++){
      o=people[i].name||'';
      if(!o)continue;
      /* the first letter in the name's own script; Array.from keeps a surrogate pair whole */
      h+='<button class="rfq-av'+(sel===o?' on':'')+'" onclick="rfPickPerson(\\''+esc(o).replace(/'/g,"\\\\'")+'\\')"><b>'+esc((Array.from(o.trim())[0]||'').toLocaleUpperCase())+'</b><span>'+esc(o)+'</span></button>';
    }
    h+='<button class="rfq-av rfq-av-add" onclick="rfAddPersonOpen()"><b>+</b><span>'+_t('אדם חדש')+'</span></button>';
    h+='</div>';`],
  [`      h+='<div style="display:flex;gap:8px;margin-top:10px">'+
         '<input id="rf-person-in" class="mtin" style="flex:1;margin-bottom:0" autofocus '+`,
   `      h+='<div class="rfq-slot rfq-addp">'+
         '<input id="rf-person-in" class="rfq-thx-in" autofocus '+`],
  [`         '<button class="rf-chip on" onclick="rfAddPerson()">'+_t('הוסף')+'</button></div>';`,
   `         '<button class="rfq-addb" onclick="rfAddPerson()">'+_t('הוסף')+'</button></div>';`],
  [`      h+='<div class="rf-sub" style="margin-top:26px;font-weight:700;color:var(--ink);font-size:15px">'+_t('איך הוא השפיע עליך היום?')+'</div>';
      h+='<div class="rf-ladder" style="margin-top:14px">';
      for(i=0;i<RF_IMPACT.length;i++)h+='<button class="rf-rung'+(rfVal('influentialPersonImpact')===RF_IMPACT[i]?' on':'')+'" onclick="rfSave({influentialPersonImpact:\\''+RF_IMPACT[i]+'\\'});renderReflectStep()">'+_t(RF_IMPACT[i])+'</button>';`,
   `      h+='<div class="rfq-tl rfq-tl2">'+_t('איך הוא השפיע עליך היום?')+'</div>';
      h+='<div class="rf-ladder rfq-yn rfq-yn3">';
      for(i=0;i<RF_IMPACT.length;i++)h+='<button class="rf-rung'+(rfVal('influentialPersonImpact')===RF_IMPACT[i]?' on':'')+'" onclick="rfSave({influentialPersonImpact:\\''+RF_IMPACT[i]+'\\'});renderReflectStep()"><svg viewBox="0 0 24 24" aria-hidden="true">'+RF_ICONS[RF_IMPACT_IC[i]]+'</svg>'+_t(RF_IMPACT[i])+'</button>';`],
  [`html body.mod-endofday .rfq-pebbles .rf-chip.on svg{opacity:1}
`,
   `html body.mod-endofday .rfq-pebbles .rf-chip.on svg{opacity:1}
/* the seventh pair (25 Nov): assets/rf-q7.webp, a 220px hourglass and 320px figures, 320 high, drawn at 0.42 */
html body.mod-endofday .rfq-hourglass,html body.mod-endofday .rfq-pair{height:134px;background-size:227px 134px;
  -webkit-mask:radial-gradient(closest-side,#000 76%,transparent 100%);mask:radial-gradient(closest-side,#000 76%,transparent 100%)}
html body.mod-endofday .rfq-hourglass{width:92px;background-position:0 0}
html body.mod-endofday .rfq-pair{width:134px;background-position:-92px 0}
html body.mod-endofday .rfq-yn{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:4px auto 0;max-width:320px}
html body.mod-endofday .rfq-yn3{grid-template-columns:repeat(3,1fr);max-width:none;gap:10px}
html body.mod-endofday .rfq-yn .rf-rung{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:92px;
  border:none;border-radius:22px;padding:12px 8px;text-align:center;background:var(--nu-ground);color:var(--nu-ink);
  font-family:"Frank Ruhl Libre",Georgia,serif;font-size:18px;font-weight:600;box-shadow:-5px -5px 12px var(--nu-lit),5px 7px 14px var(--nu-shade-soft)}
html body.mod-endofday .rfq-yn3 .rf-rung{font-size:15px;min-height:96px}
html body.mod-endofday .rfq-yn .rf-rung svg{width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;opacity:.75}
html body.mod-endofday .rfq-yn .rf-rung.on{color:#8a5a1c;
  box-shadow:inset 3px 4px 8px var(--nu-shade),inset -3px -3px 7px var(--nu-lit),0 0 0 2px rgba(240,169,46,.5),0 0 14px 2px rgba(240,169,46,.25)}
html body.mod-endofday .rf-in.rfq-one{min-height:54px;margin-top:22px;border-radius:99px;padding:14px 20px}
html body.mod-endofday .rfq-avs{display:flex;flex-wrap:wrap;justify-content:center;gap:14px 10px}
html body.mod-endofday .rfq-av{display:flex;flex-direction:column;align-items:center;gap:6px;width:64px;padding:0;border:none;background:none;color:var(--nu-ink);cursor:pointer}
html body.mod-endofday .rfq-av b{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:var(--nu-ground);
  font-family:"Frank Ruhl Libre",Georgia,serif;font-size:22px;font-weight:500;box-shadow:-3px -3px 8px var(--nu-lit),4px 5px 10px var(--nu-shade-soft)}
html body.mod-endofday .rfq-av span{max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:"Frank Ruhl Libre",Georgia,serif;font-size:13px}
html body.mod-endofday .rfq-av.on b{color:#8a5a1c;
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit),0 0 0 2px rgba(240,169,46,.55),0 0 14px 3px rgba(240,169,46,.3)}
html body.mod-endofday .rfq-av.on span{color:#8a5a1c;font-weight:700}
html body.mod-endofday .rfq-av-add b{font-family:inherit;font-weight:300;font-size:26px}
html body.mod-endofday .rfq-addp{margin-top:16px}
html body.mod-endofday .rfq-addp .rfq-thx-in{padding-inline-start:12px}
html body.mod-endofday .rfq-addb{flex:none;border:none;border-radius:99px;padding:9px 16px;background:var(--nu-ground);color:#8a5a1c;font:inherit;font-size:14px;font-weight:700;
  box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft),0 0 0 1.5px rgba(240,169,46,.45)}
`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
