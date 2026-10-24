// Visits every fitness view and lists what is PAINT rather than the one
// material: a dark or coloured fill, a gradient, or a coloured border. Read
// from the browser (computed paint), not the source - inline styles and
// overrides both count. For shoot-page --then; prints into a box on the page
// and into window.__audit.
(async function(){
  var wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  function rgb(c){var m=String(c).match(/rgba?\(([^)]+)\)/);if(!m)return null;var p=m[1].split(',').map(parseFloat);return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};}
  function lum(c){return (0.299*c.r+0.587*c.g+0.114*c.b)/255;}
  function sat(c){var mx=Math.max(c.r,c.g,c.b),mn=Math.min(c.r,c.g,c.b);return mx?(mx-mn)/mx:0;}
  function bad(el){
    var cs=getComputedStyle(el),why=[];
    var bg=rgb(cs.backgroundColor);
    if(bg&&bg.a>0.25){if(lum(bg)<0.6)why.push('dark fill '+cs.backgroundColor);else if(sat(bg)>0.12)why.push('coloured fill '+cs.backgroundColor);}
    if(/gradient/.test(cs.backgroundImage)&&!/radial-gradient\(.*rgba\(255, 255, 255/.test(cs.backgroundImage))why.push('gradient');
    ['Top','Right','Bottom','Left'].forEach(function(s){var w=parseFloat(cs['border'+s+'Width']),c=rgb(cs['border'+s+'Color']);
      if(w>=1&&c&&c.a>0.3&&sat(c)>0.15)why.push('coloured border');});
    var oc=rgb(cs.outlineColor);if(parseFloat(cs.outlineWidth)>=1&&cs.outlineStyle!=='none'&&oc&&sat(oc)>0.15)why.push('coloured outline');
    return why;
  }
  var V=['home','start','editTemplate','weekly-plan','build','genprog','timer','clock','videos','weights','steps','history','stats','progress','workout','summary'];
  var out=[];
  for(var i=0;i<V.length;i++){
    try{
      if(V[i]==='editTemplate'){_fitEditIdx=-1;}
      if(V[i]==='workout'&&!_fitWorkout)startEmptyWorkout();
      _fitView=V[i];renderFitness();
    }catch(e){out.push('['+V[i]+'] THREW '+e.message);continue;}
    await wait(350);
    var seen={},lines=[];
    [].forEach.call(document.querySelectorAll('#content *'),function(el){
      var r=el.getBoundingClientRect();if(r.width<8||r.height<8)return;
      var cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0)return;
      if(el.closest('svg')||el.tagName==='IMG'||el.tagName==='CANVAS')return;
      var w=bad(el);if(!w.length)return;
      var key=el.tagName+'.'+(typeof el.className==='string'?el.className.split(' ').slice(0,2).join('.'):'')+'|'+w.join(',');
      if(seen[key])return;seen[key]=1;
      lines.push('   '+(el.getAttribute('style')||'').slice(0,90)+' :: '+el.tagName.toLowerCase()+(el.className&&typeof el.className==='string'?'.'+el.className.split(' ').join('.'):'')+
        ' "'+(el.textContent||'').trim().slice(0,22)+'" '+w.join(', '));
    });
    out.push('['+V[i]+'] '+lines.length);out=out.concat(lines.slice(0,14));
  }
  window.__audit=out.join('\n');
  var d=document.createElement('pre');d.id='audit';d.style.cssText='position:fixed;inset:0;z-index:99999;background:#000;color:#0f0;font-size:10px;white-space:pre-wrap;margin:0;padding:6px;overflow:auto';
  d.textContent=window.__audit;document.body.appendChild(d);
})();
