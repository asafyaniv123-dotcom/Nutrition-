// The board's "what you've written" card showed only the evening's questions already answered, so a skipped photo
// or moment vanished from the screen with no way back to it (Asaf, 24 Nov, on the phone). Each of the four now
// stays in the card: answered, it shows its answer as before; not answered, it says "Add" and one tap opens it.
// usage: node tools/patches/rf-did-add.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [
  [`    else if(q.kind==='photo'&&r.dayColor&&dayColorOf(r.dayColor))v='<span class="rf-did-c" style="--dc:'+dayColorOf(r.dayColor)+'"></span>';
    else continue;
    rows+='<button class="rf-did-r" onclick="rfEditAns(1,'+i+')">`,
   `    else if(q.kind==='photo'&&r.dayColor&&dayColorOf(r.dayColor))v='<span class="rf-did-c" style="--dc:'+dayColorOf(r.dayColor)+'"></span>';
    /* not answered yet: it stays here, so a skipped question can still be reached */
    else v='<span class="rf-did-add">'+_t('להוסיף')+'</span>';
    rows+='<button class="rf-did-r" onclick="rfEditAns(1,'+i+')">`],
  [`.rf-did-c{`, `.rf-did-add{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:var(--nu-muted)}
.rf-did-add:before{content:"+";display:grid;place-items:center;width:20px;height:20px;border-radius:50%;font-size:15px;line-height:1;
  background:var(--nu-ground);box-shadow:-2px -2px 4px rgba(255,255,255,.95),2px 3px 6px rgba(176,168,156,.44)}
.rf-did-c{`],
];
for (const [a, b] of rev ? pairs.map(([x, y]) => [y, x]).reverse() : pairs) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70));
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
