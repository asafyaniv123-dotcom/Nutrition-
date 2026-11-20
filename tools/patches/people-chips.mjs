// node tools/patches/people-chips.mjs <index.html> [--undo] - found by the 20 Nov crawl of every screen: on a person's edit form,
//   the relationship and "where you know them from" chips wrote the stored HEBREW key straight into the visible text field - an
//   English reader tapping "Close friend" read חבר קרוב in the box under it - and never moved the highlight, so the chip tapped
//   looked untouched. The field now shows the label in the reader's language and remembers the key behind it; the highlight
//   moves to the chip tapped; and what is saved is still the key, unless she typed something of her own. --undo restores the
//   file byte for byte.
import fs from 'node:fs';
const F = process.argv[2], undo = process.argv.includes('--undo');
const E = [
  [`    h+='<button class="pp-chip'+(isSel?' on':'')+'" onclick="document.getElementById(\\'ep-rel\\').value=\\''+rt+'\\'">'+labelOf(rt)+'</button>';
  }
  h+='</div><input id="ep-rel" class="mtin" value="'+esc(p.relationship||'')+'" placeholder="'+_t("או כתוב בעצמך...")+'"></div>';`,
   `    h+='<button type="button" class="pp-chip'+(isSel?' on':'')+'" onclick="epChip(this,\\'ep-rel\\',\\''+rt+'\\')">'+labelOf(rt)+'</button>';
  }
  /* the box shows the label in her language; the key behind it is what is saved */
  var relL=p.relationship?labelOf(p.relationship):'';
  h+='</div><input id="ep-rel" class="mtin" value="'+esc(relL)+'" data-k="'+esc(p.relationship||'')+'" data-l="'+esc(relL)+'" placeholder="'+_t("או כתוב בעצמך...")+'"></div>';`],
  [`    h+='<button type="button" class="pp-chip'+(qsel?' on':'')+'" onclick="document.getElementById(&quot;ep-place&quot;).value=&quot;'+qp+'&quot;">'+_t(qp)+'</button>';
  }
  h+='</div><input id="ep-place" class="mtin" value="'+esc(p.place||'')+'" placeholder="'+_t("או כתוב בעצמך...")+'"></div>';`,
   `    h+='<button type="button" class="pp-chip'+(qsel?' on':'')+'" onclick="epChip(this,\\'ep-place\\',\\''+qp+'\\')">'+_t(qp)+'</button>';
  }
  var plL=p.place?_t(p.place):'';
  h+='</div><input id="ep-place" class="mtin" value="'+esc(plL)+'" data-k="'+esc(p.place||'')+'" data-l="'+esc(plL)+'" placeholder="'+_t("או כתוב בעצמך...")+'"></div>';`],
  [`    relationship:(document.getElementById('ep-rel')||{}).value||'',
    place:(document.getElementById('ep-place')||{}).value||'',`,
   `    relationship:epKeyed('ep-rel'),
    place:epKeyed('ep-place'),`],
  [`function savePersonEdit(){`,
   `/* A chip on the edit form: the box gets the label she reads, and remembers
   the key it stands for; the highlight moves to the chip tapped. */
function epChip(b,id,k){
  var el=document.getElementById(id);if(!el)return;
  el.value=b.textContent;el.setAttribute('data-k',k);el.setAttribute('data-l',b.textContent);
  [].forEach.call(b.parentNode.querySelectorAll('.pp-chip'),function(x){x.classList.toggle('on',x===b);});
}
/* what to save: the key while the box still shows that key's label; whatever
   she typed once she has typed over it */
function epKeyed(id){
  var el=document.getElementById(id);if(!el)return '';
  var v=el.value.trim();
  return v&&v===el.getAttribute('data-l')?(el.getAttribute('data-k')||v):v;
}
function savePersonEdit(){`],
];
let s = fs.readFileSync(F, 'utf8');
for (const [o, n] of undo ? E.slice().reverse() : E) {
  const [a, b] = undo ? [n, o] : [o, n], c = s.split(a).length - 1;
  if (c !== 1) throw new Error(`${undo ? 'undo' : 'apply'}: expected 1 of ${JSON.stringify(a.slice(0, 60))}, found ${c}`);
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(undo ? 'undone' : 'applied');
