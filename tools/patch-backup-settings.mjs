/* The backup card lost its home when the home screen became the dial:
 * renderBackup() still drew into #home-backup, which no longer exists, so
 * export and import were unreachable. Asaf, 21 Oct: put it in settings. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR: ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`  var el=document.getElementById('home-backup');if(!el)return;`,
    `  var el=document.getElementById('set-backup')||document.getElementById('home-backup');if(!el)return;`);
rep(`     _t('אימפריאלי')+'</button>';
  h+='</div>';
  v.innerHTML=h;
}`, `     _t('אימפריאלי')+'</button>';
  h+='</div>';
  /* the backup, the one place a person can take everything with them */
  h+='<div id="set-backup" style="margin-top:18px"></div>';
  v.innerHTML=h;
  renderBackup();
}`);
fs.writeFileSync(F, s);
console.log('patched');
