// Walks the home chat through its real buttons: the switch, an area and back,
// nutrition's coach mounted in the chat, and a sentence through the router.
(async function(){
  var q=function(s){return document.querySelector(s);},w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var out=window.__hw=window.__hw||[],st=window.__hws=(window.__hws||0)+1;
  var vis=function(s){var e=q(s);if(!e)return 'none';var r=e.getBoundingClientRect();return r.width&&r.height?'shown':'hidden';};
  if(st===1){
    out.push('switch: '+q('#hch-mode').children.length+' buttons, dial '+vis('#home-grid'));
    q('#hch-mode button:last-child').click();await w(600);
    out.push('chat on: dial '+vis('#home-grid')+', chat '+vis('#hch')+', tiles '+document.querySelectorAll('.hch-tile').length+', mip '+!!q('#hch-mip canvas,#hch-mip svg,#hch-mip *')+', corner mip '+vis('#bhelp'));
    out.push('hello: '+q('#hch-hello').textContent+' / '+q('#hch-hello2').textContent+' | sug: '+document.querySelectorAll('#hch-sug button').length);
  } else if(st===2){
    q('.hch-tile[data-k=planning]').click();await w(1200);
    out.push('planning: top '+(q('#hch-head .hch-tile')||{}).textContent+', tiles left '+[].filter.call(document.querySelectorAll('#hch-areas .hch-tile'),function(b){return getComputedStyle(b).opacity>0.5;}).length+
      ', folded '+q('#hch-areas').classList.contains('folded')+', hello '+q('#hch-hello').textContent+' / '+q('#hch-hello2').textContent);
  } else if(st===3){
    q('#hch-head .hch-tile').click();await w(1200);
    q('.hch-tile[data-k=nutrition]').click();await w(1300);
    out.push('nutrition: co-wrap in chat '+!!q('#hch #co-wrap')+', co-in '+!!q('#hch #co-in')+', chat row '+vis('#hch-row')+', co-wraps '+document.querySelectorAll('#co-wrap').length);
  } else if(st===4){
    q('#hch-head .hch-tile').click();await w(1200);
    var i=q('#hch-in');i.value='מחר ב-10 רופא שיניים';q('.hch-row .hch-btn:last-child').click();await w(9000);
    out.push('general route: '+[].map.call(document.querySelectorAll('#hch-talk > div'),function(d){return d.className+':'+d.textContent.slice(0,60);}).join(' || '));
  } else {
    var b=[].filter.call(document.querySelectorAll('#hch-talk .btns button'),function(x){return !x.classList.contains('ghost');})[0];
    if(b){b.click();await w(500);}
    out.push('after add: '+[].map.call(document.querySelectorAll('#hch-talk .hch-card'),function(d){return d.textContent.slice(0,70);}).join(' | '));
    var d=document.createElement('pre');d.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;font-size:11px;white-space:pre-wrap;margin:0;padding:8px';
    d.textContent=out.join('\n');document.body.appendChild(d);
  }
})();
