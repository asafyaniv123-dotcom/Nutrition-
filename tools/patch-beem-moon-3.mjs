/* the night page, second pass: --card resolved on body (the inner nutrition panel went dark), and the card's white halo on a dark table */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const EOL=s.includes('\r\n')?'\r\n':'\n';
const a="--nu-shade:rgba(176,168,156,.44);--nu-shade-soft:rgba(176,168,156,.28);--nu-ink:#4a453f;--nu-muted:#6d675e}"+EOL+"html body.mod-endofday.rf-night .rf-streak{color:var(--nu-ink)}";
if(s.split(a).length!==2){console.log('anchor');process.exit(1);}
s=s.replace(a,"--nu-shade:rgba(176,168,156,.44);--nu-shade-soft:rgba(176,168,156,.28);--nu-ink:#4a453f;--nu-muted:#6d675e;"+EOL+
"  /* --card and its kin were resolved on body, to the night's ground - set again here */"+EOL+
"  --card:#e9e7e3;--panel:#e9e7e3;--page:#e9e7e3}"+EOL+
"/* paper on a night table: a shadow under it, not a white halo around it */"+EOL+
"html body.mod-endofday.rf-night .rfd-card{box-shadow:0 14px 34px rgba(0,0,0,.5),0 2px 6px rgba(0,0,0,.3)}"+EOL+
"html body.mod-endofday.rf-night .rf-streak{color:var(--nu-ink)}");
fs.writeFileSync(F,s);console.log('ok');
