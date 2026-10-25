// Walks: nutrition setup (welcome, goal, sex skipped by voice, birth wheel,
// health in the flow), then fitness (3 days -> full body, health not asked).
(async function(){
  var q=function(s){return document.querySelector(s);},wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var out=window.__a2=window.__a2||[],st=window.__a2s=(window.__a2s||0)+1;
  var step=function(){return _aset?asetKey():'closed';};
  var opt=function(t){return [].filter.call(document.querySelectorAll('.as-o'),function(b){return b.querySelector('b').textContent.indexOf(t)>=0;})[0];};
  var go=async function(){q('.as-go').click();await wait(120);};
  if(st===1){
    out.push('steps: '+_aset.steps.join(','));
    await go();out.push('welcome -> '+step());
    opt('כן, יש').click();await go();q('.as-o').click();await go();out.push('goal -> '+step());
    var y=document.getElementById('as-b-y');y.scrollTop=5*60;y.dispatchEvent(new Event('scroll'));await wait(150);
    out.push('wheel: '+bwVal('as-b')+' / '+(q('#as-b-age')||{}).textContent);
  } else if(st===2){
    await go();out.push('birth -> '+step());
    q('#as-h').value='178';await go();q('#as-w').value='76';await go();q('.as-o').click();await go();out.push('-> '+step());
    opt('כן').click();await go();out.push('health yes -> '+step());
    q('.as-o').click();await go();out.push('ack -> '+step());
    [].forEach.call(document.querySelectorAll('.as-o'),function(b,i){if(i===0)b.click();});await go();out.push('conds -> '+step());
    opt('כן').click();await go();out.push('coach -> '+step()+' | health saved: '+JSON.stringify(hlLoad())+' birth '+loadProfile().birth);
  } else {
    enterModule('fitness');await wait(700);
    out.push('fitness steps: '+(_aset?_aset.steps.join(','):'none'));
    out.push('3 days, new -> '+progSplitFor(3,'new')+' / 3 days, mid -> '+progSplitFor(3,'mid')+' / 4 mid -> '+progSplitFor(4,'mid'));
    var d=document.createElement('pre');d.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;font-size:11px;white-space:pre-wrap;margin:0;padding:8px';
    d.textContent=out.join('\n');document.body.appendChild(d);
  }
})();
