// Walks the book on Me: − / +, add to the list, start from the list (the
// open book goes back with its page), finish and take the next.
(async function(){
  var q=function(s){return document.querySelector(s);},wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var out=window.__bwOut=window.__bwOut||[],st=window.__bwSt=(window.__bwSt||0)+1;
  if(st===1){
    q('.bka-st button:last-child').click();await wait(150);q('.bka-st button:last-child').click();await wait(150);
    out.push('page after ++ '+loadBook().page+' shown '+q('#bk-page').textContent+' left '+(q('.bka-left')||{}).textContent);
    var i=q('#bkn-in');i.value='Deep Work';q('.bkn-add button').click();await wait(200);
    i=q('#bkn-in');i.value='האדם מחפש משמעות';q('.bkn-add button').click();await wait(200);
    out.push('queue '+bkQueue().map(function(b){return b.title;}).join(' | ')+' rows '+document.querySelectorAll('.bkn-r').length);
    document.querySelectorAll('.bkn-r .bkn-o button')[0].click();await wait(200);
    out.push('after move up '+bkQueue().map(function(b){return b.title;}).join(' | '));
  } else if(st===2){
    q('.bkn-x').click();await wait(300);q('#cf-yes').click();await wait(300);
    out.push('started: '+loadBook().title+' page '+loadBook().page+' / queue '+bkQueue().map(function(b){return b.title+(b.page?'@'+b.page:'');}).join(' | '));
  } else {
    finishBook();await wait(1100);
    out.push('offer after finish: '+((q('#cf-ov .cf-q')||{}).textContent||'none'));
    q('#cf-yes').click();await wait(300);
    out.push('now reading: '+loadBook().title+' page '+loadBook().page+' / queue '+bkQueue().map(function(b){return b.title;}).join(' | ')+' / library '+loadBookLibrary().map(function(b){return b.title;}).join(','));
    var d=document.createElement('pre');d.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;font-size:12px;white-space:pre-wrap;margin:0;padding:8px';
    d.textContent=out.join('\n');document.body.appendChild(d);
  }
})();
