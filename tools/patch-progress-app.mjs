/* The progress trackers into the app (Asaf, 26 Oct: "everything looks great,
 * let's release it"). Code in tools/prg.js and tools/prg.css; ways in from
 * nutrition's history, fitness's numbers and Me; the finished-book moment
 * opens when a book is finished, and the "next in line" question waits until
 * it is closed. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
const css = fs.readFileSync('tools/prg.css', 'utf8').replace(/\r\n/g, '\n');
const js = fs.readFileSync('tools/prg.js', 'utf8').replace(/\r\n/g, '\n')
  .replace(`function prgClose(){var o=document.getElementById('prg');if(o)o.parentNode.removeChild(o);}`,
    `function prgClose(){var o=document.getElementById('prg');if(o)o.parentNode.removeChild(o);var f=_prg.after;_prg.after=null;if(f)setTimeout(f,250);}`);
rep(`.fit-back{display:inline-flex;`, css + `.fit-back{display:inline-flex;`);
rep(`// Build home screen DOM
(function(){`, js + `// Build home screen DOM
(function(){`);
rep(`  document.getElementById('content').innerHTML=tabHTML+chartCard+avgHTML;`, `  document.getElementById('content').innerHTML=prgEntryHTML('nutrition')+tabHTML+chartCard+avgHTML;`);
rep(`  h+=bodyCard;`, `  h+=prgEntryHTML('fitness');
  h+=bodyCard;`);
rep(`  h+='<div class="me-sub">'+_t('מה שהימים מצטברים אליו')+'</div></div>';`, `  h+='<div class="me-sub">'+_t('מה שהימים מצטברים אליו')+'</div></div>';
  h+=prgEntryHTML('me');`);
const a = s.indexOf(`  renderBookWidget();\n  var nq=bkQueue();\n  if(nq.length)setTimeout(function(){`);
if (a < 0) { console.log('finishBook'); process.exit(1); }
const b = s.indexOf(`  },700);\n}`, a);
const mid = s.slice(a + `  renderBookWidget();\n  var nq=bkQueue();\n  if(nq.length)setTimeout(function(){`.length, b);
s = s.slice(0, a) + `  renderBookWidget();
  var nq=bkQueue();
  /* the finished book first; what is next waits until it is closed */
  setTimeout(function(){prgOpen('bookdone');},300);
  if(nq.length)_prg.after=function(){` + mid + `  };
}` + s.slice(b + `  },700);\n}`.length);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
