/* Two things the settings photo showed: Beem's corner sat above the drawer
 * (350 was above every overlay, which start at 120), and the backup card came
 * in its old home-screen dress - a dark fill and a bright white button - in a
 * sheet where every other choice is a .set-lang chip. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR: ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`.bhelp{position:fixed;top:calc(12px + env(safe-area-inset-top));inset-inline-end:14px;z-index:350;`,
    `.bhelp{position:fixed;top:calc(12px + env(safe-area-inset-top));inset-inline-end:14px;z-index:110;`);
rep(`  var n=Object.keys(collectAppData()).length;
  var h='<div style="background:var(--card);border-radius:20px;padding:15px 16px;box-shadow:0 4px 16px rgba(200,180,160,.1)">';
  h+='<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px">';
  h+='<div style="font-size:10px;color:var(--muted);letter-spacing:.1em;font-weight:700">'+_t('גיבוי')+'</div>';
  h+='<div style="font-size:10px;color:var(--muted-soft)">'+_t('{n} פריטים',{n:n})+'</div></div>';
  var age=backupAgeDays(last), stale=(age<0||age>=BACKUP_STALE_DAYS);
  var line=last?(''+_t('ייצוא אחרון')+' '+stepsAgo(last)):''+_t('כל הנתונים קיימים רק במכשיר הזה — עוד לא יצא גיבוי.')+'';
  h+='<div style="font-size:10.5px;color:'+(stale?'var(--terra-700)':'var(--muted)')+';line-height:1.6">'+line+'</div>';
  // Only worth saying when it is not true. Granted is the quiet case.
  if(_persisted===false){
    h+='<div style="font-size:10.5px;color:var(--terra-700);line-height:1.6;margin-top:4px">'+_t('המכשיר עלול למחוק את הנתונים כשנגמר לו המקום. גיבוי הוא הביטוח היחיד.')+'</div>';
  }
  h+='<div style="height:12px"></div>';
  h+='<div style="display:flex;gap:8px">';
  h+='<button onclick="exportData()" style="flex:1;background:var(--cta-fill);border:none;border-radius:12px;padding:11px;font-size:12.5px;font-weight:700;cursor:pointer;color:var(--white);font-family:inherit">'+_t('ייצוא')+'</button>';
  h+='<button onclick="importPick()" style="flex:1;background:var(--surface);border:none;border-radius:12px;padding:11px;font-size:12.5px;font-weight:700;cursor:pointer;color:var(--muted);font-family:inherit">'+_t('ייבוא')+'</button></div>';
  h+='<input type="file" id="backup-file" accept="application/json,.json" style="display:none" onchange="importChosen(this)">';
  h+='</div>';
  el.innerHTML=h;`,
`  /* IN SETTINGS' OWN WORDS: a section title, its line, and two chips - the
     same three things every other setting above it is made of */
  var age=backupAgeDays(last), stale=(age<0||age>=BACKUP_STALE_DAYS);
  var line=last?(''+_t('ייצוא אחרון')+' '+stepsAgo(last)):''+_t('כל הנתונים קיימים רק במכשיר הזה — עוד לא יצא גיבוי.')+'';
  var h='<div class="set-sec"><div class="set-t">'+_t('גיבוי')+'</div>'+
    '<div class="set-s"'+(stale?' style="color:var(--terra-700)"':'')+'>'+line+'</div>';
  // Only worth saying when it is not true. Granted is the quiet case.
  if(_persisted===false)
    h+='<div class="set-s" style="color:var(--terra-700)">'+_t('המכשיר עלול למחוק את הנתונים כשנגמר לו המקום. גיבוי הוא הביטוח היחיד.')+'</div>';
  h+='</div><div class="set-langs">'+
    '<button class="set-lang" onclick="exportData()">'+_t('ייצוא')+'</button>'+
    '<button class="set-lang" onclick="importPick()">'+_t('ייבוא')+'</button></div>';
  h+='<input type="file" id="backup-file" accept="application/json,.json" style="display:none" onchange="importChosen(this)">';
  el.innerHTML=h;`);
rep(`  h+='<div id="set-backup" style="margin-top:18px"></div>';`, `  h+='<div id="set-backup"></div>';`);
fs.writeFileSync(F, s);
console.log('patched');
