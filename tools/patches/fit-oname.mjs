/* Asaf on the phone, 28 Nov: "if I press 'other' I should be able to add it". "Other" was a chip with
 * nothing behind it, and the week then said "אחר" on its days. Choosing it now opens a line for its
 * name, continuing waits for one, and the name is what the week, the plan and every question say.
 * Run: node tools/patches/fit-oname.mjs [file] [--reverse]
 */
import fs from 'node:fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  [String.raw`oFix:JSON.parse(JSON.stringify(o.oFix||{}))}};`,
   String.raw`oFix:JSON.parse(JSON.stringify(o.oFix||{})),oName:o.oName||''}};`],
  [String.raw`  else t[f]=v;
  asetPaint();
}
/* ── A NUMBER ON A WHEEL ──`,
   String.raw`  else t[f]=v;
  asetPaint();
  /* "other" is a name to type, so the line it opens takes the keyboard at once */
  if(f==='other'&&v==='other'&&t.other.indexOf('other')>=0){var oi=document.getElementById('as-oname');if(oi){oi.focus();oi.scrollIntoView({block:'center'});}}   // i18n-exempt: a stored key
}
/* ── A NUMBER ON A WHEEL ──`],
  [String.raw`      body+='</div>';_aset.spShown=1;}}`,
   String.raw`      body+='</div>';
      if(t.other.indexOf('other')>=0)body+='<input id="as-oname" class="tm-sv-in as-oname" maxlength="30" enterkeyhint="done" placeholder="'+esc(_t('מה זה? למשל: קרוספיט'))+'" value="'+esc(t.oName||'')+'" oninput="_aset.t.oName=this.value">';   // i18n-exempt: a stored key
      _aset.spShown=1;}}`],
  [String.raw`if(k==='other')return t.other.length>0;`,
   String.raw`if(k==='other')return t.other.length>0&&(t.other.indexOf('other')<0||!!(t.oName||'').trim());`],
  [String.raw`o.otherDone=1;}if(t.exp)o.exp=t.exp;`,
   String.raw`o.otherDone=1;o.oName=o.other.indexOf('other')>=0?(t.oName||'').trim():'';}if(t.exp)o.exp=t.exp;`],
  [String.raw`function wtLabel(id){var t=(WORKOUT_TYPES||[]).filter(`,
   String.raw`function wtLabel(id){if(id==='other'){var on=((_aset&&_aset.t&&_aset.t.oName)||'').trim()||fitMe().oName;if(on)return on;}var t=(WORKOUT_TYPES||[]).filter(`],
  [String.raw`||wtLabel('strength');}
  var t=(WORKOUT_TYPES||[]).filter(function(x){return x.id===e.type;})[0];
  return t?t.label:'';`,
   String.raw`||wtLabel('strength');}
  return wtLabel(e.type);`],
  [String.raw`.as-sp{margin-top:14px}`,
   String.raw`.as-sp{margin-top:14px}
#as-ov .as-oname{margin:12px 0 0;text-align:start}`],
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
