/* "The little plus for adding a hobby doesn't suit me" (Asaf, 23 Oct). The
 * way in to an area that is still empty was a small text link at the far
 * end of a label row. Now:
 *  - the empty state carries its own big raised button, where the eye is;
 *  - the header's add is a raised pill in the material, not a bare link;
 *  - the area card's "add a first hobby" opens the same wizard (it pointed at
 *    the old inline row, which the wizard has replaced). */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`     '<button onclick="hbWizOpen(&quot;&quot;)">+ '+_t('הוסף תחביב')+'</button>'+`,
    `     (list.length?'<button class="hb-addp" onclick="hbWizOpen(&quot;&quot;)">+ '+_t('הוסף תחביב')+'</button>':'')+`);
rep(`    h+='<div class="hbb hbb-em">'+_t('אין כאן עדיין תחביב. הוסף את הראשון ונתחיל לספור.')+'</div></div>';`,
    `    /* the way in, where the eye already is */
    h+='<div class="hbb hbb-em">'+_t('אין כאן עדיין תחביב. הוסף את הראשון ונתחיל לספור.')+
       '<button class="hb-first" onclick="hbWizOpen(&quot;&quot;)">+ '+_t('הוסף תחביב')+'</button></div></div>';`);
rep(`.hb-acts{display:flex;gap:14px;align-items:center}`,
`.hb-acts{display:flex;gap:14px;align-items:center}
/* the add, raised in the material - it used to be a bare text link */
.hb-addp{border:none;border-radius:999px;padding:8px 14px;background:var(--nu-ground);font-family:inherit;font-size:13px;font-weight:800;color:var(--nu-ink);cursor:pointer;
  box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}
.hbb-em{text-align:center}
.hb-first{display:block;margin:16px auto 2px;border:none;border-radius:18px;padding:15px 34px;background:var(--nu-ground);font-family:inherit;
  font-size:15.5px;font-weight:800;color:var(--nu-ink);cursor:pointer;
  box-shadow:-5px -5px 13px var(--nu-lit),7px 9px 20px var(--nu-shade),inset 0 -3px 0 color-mix(in srgb,var(--green-600,#5f9a6e) 55%,transparent)}`);
rep(`    go2:function(){if(!_hbAdding)hbAddOpen();}};`, `    go2:function(){hbWizOpen('');}};`);
fs.writeFileSync(F, s);
console.log('patched');
