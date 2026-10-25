// Walks the nutrition setup through its real buttons: nothing advances on a
// tap, continue refuses an empty answer, back works, and the answers land.
(async function(){
  var q=function(s){return document.querySelector(s);},wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var out=[],step=function(){return _aset?asetKey():'closed';};
  var opt=function(t){return [].filter.call(document.querySelectorAll('.as-o'),function(b){return b.querySelector('b').textContent.indexOf(t)>=0;})[0];};
  out.push('opened on: '+step());
  opt('לא').click();await wait(80);out.push('after tap "no", still: '+step());
  q('.as-go').click();await wait(80);out.push('continue -> '+step());
  opt('כן').click();q('.as-go').click();await wait(80);out.push('add yes -> '+step());
  q('.as-go').click();await wait(80);out.push('continue with nothing chosen stays: '+step());
  q('.as-o').click();q('.as-go').click();await wait(80);out.push('goal picked -> '+step());
  opt('זכר').click();q('.as-go').click();await wait(80);out.push('sex -> '+step());
  var b=q('#as-birth');b.value='1990-05-14';b.dispatchEvent(new Event('change',{bubbles:true}));await wait(80);out.push('date set, still: '+step());
  q('.as-go').click();await wait(80);out.push('continue -> '+step());
  q('.fit-back').click();await wait(80);out.push('back -> '+step()+' value kept '+(q('#as-birth')||{}).value);
  q('.as-go').click();await wait(80);
  var h=q('#as-h');h.value='178';q('.as-go').click();await wait(80);out.push('height -> '+step());
  var w=q('#as-w');w.value='76';q('.as-go').click();await wait(80);out.push('weight -> '+step());
  q('.as-o').click();q('.as-go').click();await wait(80);out.push('activity -> '+step());
  opt('לא').click();q('.as-go').click();await wait(300);out.push('health no -> '+step());
  var p=loadProfile();out.push('saved: goal '+p.goal+' sex '+p.sex+' birth '+p.birth+' h '+p.height+' w '+p.weight+' act '+p.activity+' seen '+asetSeen('nutrition'));
  var d=document.createElement('pre');d.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;font-size:12px;white-space:pre-wrap;margin:0;padding:8px';
  d.textContent=out.join('\n');document.body.appendChild(d);
})();
