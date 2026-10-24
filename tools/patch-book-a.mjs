/* The book on Me as option A of review/book-proto (approved 24 Oct): a book
 * that stands - the cover raised, an amber ribbon whose length is how far
 * you are, the page in large type with − and +, how many pages are left -
 * and a "to read next" list under it: add, move up and down, remove, tap to
 * start now (the book you were in goes back to the head of the list with its
 * page). Finishing a book offers the next one. A book with no picture gets a
 * cover with its title, like a cloth binding, instead of an emoji. Titles and
 * quotes are set in a book face, Frank Ruhl Libre. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

rep(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&display=swap">`,
    `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&family=Frank+Ruhl+Libre:wght@500;700&display=swap">`);

/* the book in hand */
const a = s.indexOf(`  } else {\n    var pct=book.total>0?Math.round(book.page/book.total*100):0;`);
const bTok = `    // Finish book button\n`;
const b = s.indexOf(bTok, a);
if (a < 0 || b < 0 || b - a > 6000) { console.log('book branch anchor', a, b); process.exit(1); }
s = s.slice(0, a) + `  } else {
    /* A BOOK THAT STANDS (24 Oct): the cover raised, a ribbon as long as how
       far you are, the page in large type with − and +. */
    var frac=book.total>0?Math.min(1,book.page/book.total):0;
    h+='<div class="bka-row"><div class="bka-c" onclick="openBookEdit()">'+bkCoverHTML(book,'bka-cov')+
       '<i class="bka-rib" style="height:'+Math.round(30+frac*120)+'px"></i></div>';
    h+='<div class="bka-x"><div class="bka-t">'+esc(book.title)+'</div>';
    h+='<div class="bka-pg"><b id="bk-page">'+nfmt(book.page)+'</b>'+(book.total?'<span>'+_t('מתוך {n}',{n:book.total})+'</span>':'')+'</div>';
    h+='<div class="bka-st"><button onclick="bkStep(-1)" aria-label="&minus;">&minus;</button>'+
       '<input inputmode="numeric" type="number" value="'+book.page+'" onchange="bkSetPage(this.value)">'+
       '<button onclick="bkStep(1)" aria-label="+">+</button></div>';
    if(book.total>book.page)h+='<div class="bka-left">'+_t('עוד {n} עמודים',{n:book.total-book.page})+'</div>';
    h+='</div></div>';

    // Quotes button + list
    var quotes=loadBookQuotes();
    h+='<div class="bk-sec">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">';
    h+='<div class="bk-lbl bk-lbl-s">'+_t('משפטים שאהבתי')+'</div>';
    h+='<button class="vb-add" onclick="openBookQuote()">'+_t('+ הוסף')+'</button>';
    h+='</div>';
    if(quotes.length===0){
      h+='<div class="bk-none">'+_t('עדיין לא שמרת משפטים')+'</div>';
    } else {
      for(var qi=0;qi<quotes.length;qi++){
        var q=quotes[qi];
        h+='<div class="bk-q">';
        h+='<div class="bk-q-t">&#8220;'+esc(q.text)+'&#8221;</div>';
        h+='<div class="bk-q-p">'+_t('עמוד {n}',{n:q.page})+'</div>';
        h+='<button class="bk-x" onclick="deleteBookQuote('+qi+')">&times;</button>';
        h+='</div>';
      }
    }
    h+='</div>';

` + s.slice(b);
/* the empty state offers the head of the list */
rep(`    h+='<div class="bk-empty">'+_t('הוסף את הספר שאתה קורא')+'</div>';
    h+='<button class="vb-add bk-add" onclick="openBookEdit()">'+_t('+ הוסף ספר')+'</button>';`,
`    h+='<div class="bk-empty">'+_t('הוסף את הספר שאתה קורא')+'</div>';
    h+='<button class="vb-add bk-add" onclick="openBookEdit()">'+_t('+ הוסף ספר')+'</button>';
    var nq=bkQueue();
    if(nq.length)h+='<button class="vb-add bk-add" onclick="bkStart(0)">'+_t('להתחיל את {name}',{name:nq[0].title})+'</button>';`);
rep(`    h+='<div style="font-size:40px">&#x1F4D6;</div>';\n`, ``);
/* the list, between the book and the library */
rep(`  // Library section
  var lib=loadBookLibrary();`, `  h+=bkQueueHTML();
  // Library section
  var lib=loadBookLibrary();`);

/* finishing offers the next */
rep(`  showToast(''+_t('✓ הספר נוסף לספרייה!')+'');
  renderBookWidget();
}`, `  showToast(''+_t('✓ הספר נוסף לספרייה!')+'');
  renderBookWidget();
  var nq=bkQueue();
  if(nq.length)setTimeout(function(){
    askConfirm(_t('הבא בתור: {name}. להתחיל עכשיו?',{name:nq[0].title}),_t('להתחיל'),function(){bkStart(0);},_t('לא עכשיו'));
  },700);
}
/* ── TO READ NEXT ──
   A list of titles, the first is next. A book started from it while another
   is open sends that one back to the head of the list with its page, so
   nothing read is lost. */
var BK_QUEUE='book_queue';
function bkQueue(){try{var a=JSON.parse(localStorage.getItem(BK_QUEUE)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}}
function bkQueueSave(a){try{localStorage.setItem(BK_QUEUE,JSON.stringify(a));}catch(e){}renderBookWidget();}
function bkQueueAdd(){
  var el=document.getElementById('bkn-in'),v=el?(el.value||'').replace(/^\\s+|\\s+$/g,''):'';
  if(!v)return;
  var a=bkQueue();a.push({title:v});bkQueueSave(a);
  showToast(_t('נוסף ל"לקרוא בהמשך"'));
}
function bkQueueMove(i,d){var a=bkQueue(),x=a.splice(i,1)[0];a.splice(i+d,0,x);bkQueueSave(a);}
function bkQueueDrop(i){var a=bkQueue();a.splice(i,1);bkQueueSave(a);}
function bkStart(i){
  var a=bkQueue(),nx=a.splice(i,1)[0],cur=loadBook();
  if(!nx)return;
  if(cur.title)a.unshift({title:cur.title,page:cur.page,total:cur.total,cover:cur.cover||''});
  saveBook({title:nx.title,page:nx.page||0,total:nx.total||0,cover:nx.cover||''});
  if(cur.title)saveBookQuotes([]);
  bkQueueSave(a);
}
function bkStartAsk(i){
  var a=bkQueue(),cur=loadBook();if(!a[i])return;
  askConfirm(cur.title?_t('להתחיל את {name}? "{cur}" יחזור לראש הרשימה, בעמוד שבו עצרת.',{name:a[i].title,cur:cur.title})
                      :_t('להתחיל את {name}?',{name:a[i].title}),_t('להתחיל'),function(){bkStart(i);});
}
function bkQueueHTML(){
  var a=bkQueue(),h='<div class="me-pane bkn">',i;
  h+='<div class="bkn-h"><div class="me-pane-h" style="margin:0">'+_t('לקרוא בהמשך')+'</div>'+(a.length?'<span>'+nfmt(a.length)+'</span>':'')+'</div>';
  if(!a.length)h+='<div class="bk-none" style="text-align:start;font-style:normal">'+_t('ספר שמישהו המליץ עליו? כתוב אותו כאן כדי שלא ילך לאיבוד.')+'</div>';
  for(i=0;i<a.length;i++){
    h+='<div class="bkn-r">'+bkCoverHTML(a[i],'bkn-cov')+
       '<button class="bkn-x" onclick="bkStartAsk('+i+')"><b>'+esc(a[i].title)+'</b><span>'+
       (i===0?_t('הבא בתור'):(a[i].page?_t('עמוד {n}',{n:a[i].page}):''))+'</span></button>'+
       '<span class="bkn-o">'+(i>0?'<button onclick="bkQueueMove('+i+',-1)" aria-label="&#9650;">&#9650;</button>':'')+
       (i<a.length-1?'<button onclick="bkQueueMove('+i+',1)" aria-label="&#9660;">&#9660;</button>':'')+'</span>'+
       '<button class="bkn-rm" onclick="bkQueueDrop('+i+')" aria-label="'+esc(_t('הסר'))+'">&times;</button></div>';
  }
  h+='<div class="bkn-add"><input id="bkn-in" placeholder="'+esc(_t('שם הספר'))+'" onkeydown="if(event.key===\\'Enter\\')bkQueueAdd()">'+
     '<button onclick="bkQueueAdd()">'+_t('הוסף')+'</button></div>';
  return h+'</div>';
}
/* a cover: the picture, or the title on a tinted board */
var BK_TINTS=['#dccfbf','#cfd6cf','#d8cdd8','#d6d0c2','#cdd3dc','#e0cfc6'];
function bkCoverHTML(b,cls){
  if(b.cover)return '<img class="'+cls+' bka-img" src="'+b.cover+'" alt="">';
  var t=String(b.title||''),hh=0,i;for(i=0;i<t.length;i++)hh=(hh*31+t.charCodeAt(i))>>>0;
  return '<div class="'+cls+' bka-board" style="--c:'+BK_TINTS[hh%BK_TINTS.length]+'">'+esc(t)+'</div>';
}
function bkStep(d){var b=loadBook();b.page=Math.max(0,Math.min(b.total||99999,(+b.page||0)+d));saveBook(b);renderBookWidget();}
function bkSetPage(v){var b=loadBook();b.page=Math.max(0,Math.min(b.total||99999,parseInt(v,10)||0));saveBook(b);renderBookWidget();}`);

/* CSS */
rep(`.bk-page{font-size:15px;font-weight:700;color:var(--nu-ink)}`, `.bk-page{font-size:15px;font-weight:700;color:var(--nu-ink)}
/* ── the book that stands ── */
.bka-row{display:flex;gap:16px;align-items:flex-start;width:100%}
.bka-c{position:relative;flex:none;cursor:pointer}
.bka-cov{width:112px;height:164px}
.bka-img{object-fit:cover;border-radius:4px 10px 10px 4px;display:block;box-shadow:-3px -3px 8px var(--nu-lit),5px 7px 16px rgba(120,100,80,.28)}
.bka-board{position:relative;overflow:hidden;border-radius:4px 10px 10px 4px;display:flex;align-items:flex-end;padding:10px 10px 12px 14px;
  background:var(--c);color:#3d3630;font-family:"Frank Ruhl Libre",serif;font-weight:700;font-size:16px;line-height:1.15;text-align:start;
  box-shadow:-3px -3px 8px var(--nu-lit),5px 7px 16px rgba(120,100,80,.28)}
.bka-board::before{content:"";position:absolute;inset-block:0;inset-inline-end:0;width:9px;background:linear-gradient(90deg,rgba(0,0,0,.10),rgba(255,255,255,.18),rgba(0,0,0,.06))}
.bka-rib{position:absolute;top:0;inset-inline-start:16px;width:12px;background:var(--nu-amber);border-radius:0 0 2px 2px;box-shadow:0 0 8px rgba(240,169,46,.55)}
.bka-rib::after{content:"";position:absolute;bottom:-7px;left:0;border-left:6px solid var(--nu-amber);border-right:6px solid var(--nu-amber);border-bottom:7px solid transparent}
.bka-x{flex:1;min-width:0;padding-top:2px}
.bka-t{font-family:"Frank Ruhl Libre",serif;font-size:20px;font-weight:700;line-height:1.2;color:var(--nu-ink)}
.bka-pg{display:flex;align-items:baseline;gap:6px;margin-top:12px}
.bka-pg b{font-size:32px;font-weight:800;color:var(--nu-ink);font-variant-numeric:tabular-nums}
.bka-pg span{font-size:13px;font-weight:700;color:var(--nu-muted)}
.bka-st{display:flex;gap:8px;margin-top:10px}
.bka-st button{width:42px;height:38px;border:none;border-radius:13px;font-family:inherit;font-size:18px;font-weight:800;cursor:pointer;color:var(--nu-ink);background:var(--nu-ground);
  box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}
.bka-st button:active{box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.bka-st input{flex:1;min-width:0;border:none;border-radius:13px;text-align:center;font:800 15px Assistant,sans-serif;color:var(--nu-ink);background:var(--nu-ground);outline:none;-moz-appearance:textfield;
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.bka-st input::-webkit-outer-spin-button,.bka-st input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.bka-left{font-size:12.5px;font-weight:700;color:var(--nu-muted);margin-top:8px}
/* ── to read next ── */
.bkn-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.bkn-h span{font-size:12px;font-weight:800;color:var(--nu-muted)}
.bkn-r{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid rgba(176,168,156,.3)}
.bkn-h+.bkn-r{border-top:none}
.bkn-cov{width:32px;height:46px;flex:none;font-size:0;padding:0}
.bkn-x{flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:1px;border:none;background:none;padding:0;font-family:inherit;cursor:pointer;text-align:start}
.bkn-x b{font-family:"Frank Ruhl Libre",serif;font-size:15.5px;font-weight:700;color:var(--nu-ink)}
.bkn-x span{font-size:12px;font-weight:700;color:var(--nu-muted)}
.bkn-o{display:flex;flex-direction:column}
.bkn-o button,.bkn-rm{border:none;background:none;color:var(--nu-muted);font-size:12px;cursor:pointer;padding:3px 6px;line-height:1}
.bkn-rm{font-size:17px}
.bkn-add{display:flex;gap:8px;margin-top:10px}
.bkn-add input{flex:1;min-width:0;border:none;border-radius:14px;padding:11px 12px;font:600 14.5px Assistant,sans-serif;color:var(--nu-ink);background:var(--nu-ground);outline:none;text-align:start;
  box-shadow:inset 2px 3px 6px var(--nu-shade),inset -2px -2px 5px var(--nu-lit)}
.bkn-add button{border:none;border-radius:14px;padding:0 16px;font-family:inherit;font-size:14px;font-weight:800;color:var(--nu-ink);background:var(--nu-ground);cursor:pointer;
  box-shadow:-3px -3px 7px var(--nu-lit),3px 4px 9px var(--nu-shade-soft)}
.bk-q-t{font-family:"Frank Ruhl Libre",serif}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
