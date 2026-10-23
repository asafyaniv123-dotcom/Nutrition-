/* The tour closes on Beem in his corner (Asaf, 23 Oct): a spotlight on the
 * niche, and "I'm here for any question about the app". That is the last
 * thing the first run says. The card's own Beem steps aside for it - two
 * Beems talking at once is one too many - and the one in the corner waves. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`    return {el:'.hcmd-row',t:_t('ופה פשוט כותבים.'),d:_t('מה אכלת, מה לזכור, מה לעשות. אפשר גם לדבר. אני כבר אדע לאן זה שייך.')};
  }
  var N=4,k=0;`,
`    if(i===3)return {el:'.hcmd-row',t:_t('ופה פשוט כותבים.'),d:_t('מה אכלת, מה לזכור, מה לעשות. אפשר גם לדבר. אני כבר אדע לאן זה שייך.')};
    /* the last word: where to find him afterwards */
    return {el:'#bhelp',corner:true,t:_t('ואני כאן לכל שאלה.'),d:_t('יש לך שאלה על האפליקציה? לוחצים עליי כאן למעלה, ואני עונה.')};
  }
  var N=document.getElementById('bhelp')?5:4,k=0;`);
rep(`    if(s.el==='.hcmd-row'){hole=rr(b.left-6,b.top-6,b.width+12,b.height+12,30);top=Math.max(12,b.top-210);}`,
`    if(s.el==='.hcmd-row'){hole=rr(b.left-6,b.top-6,b.width+12,b.height+12,30);top=Math.max(12,b.top-210);}
    else if(s.corner){hole=circ(cx,cy,b.width/2+10);top=b.bottom+22;}`);
rep(`    if(B)try{B.play(k%2?DOOR_BEEM.nod:DOOR_BEEM.glad);}catch(er){}
  }`,
`    var tb=document.getElementById('tour-b');if(tb)tb.style.display=s.corner?'none':'';
    if(s.corner){try{if(_bhelp.B)_bhelp.B.play(DOOR_BEEM.glad);}catch(er){}}
    else if(B)try{B.play(k%2?DOOR_BEEM.nod:DOOR_BEEM.glad);}catch(er){}
  }`);
fs.writeFileSync(F, s);
console.log('patched');
/* nothing is left to skip on the last stop */
{ let t = fs.readFileSync(F, 'utf8');
  const a = `    var tb=document.getElementById('tour-b');if(tb)tb.style.display=s.corner?'none':'';`;
  if (t.split(a.replace(/\n/g, EOL)).length !== 2) { console.log('anchor2'); process.exit(1); }
  t = t.replace(a, a + `document.getElementById('tour-x').style.visibility=k===N-1?'hidden':'';`);
  fs.writeFileSync(F, t); console.log('patched skip'); }
