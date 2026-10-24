// Measures the gap between the home dial (#home-grid) and the command line,
// and prints it on the page for the screenshot.
(function(){
  var g=document.getElementById('home-grid'),c=document.getElementById('hcmd-slot'),k=document.getElementById('home-stk');
  var gr=g&&g.getBoundingClientRect(),cr=c&&c.getBoundingClientRect(),kr=k&&k.getBoundingClientRect();
  var kids=g?[].slice.call(g.querySelectorAll('*')).reduce(function(m,e){var b=e.getBoundingClientRect();return b.height>2?Math.max(m,b.bottom):m;},0):0;
  var d=document.createElement('pre');d.id='hm-out';d.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;font-size:13px;margin:0;padding:8px;white-space:pre-wrap';
  d.textContent='grid bottom '+(gr&&Math.round(gr.bottom))+' / deepest painted child '+Math.round(kids)+'\nstreak '+(kr&&Math.round(kr.top)+'-'+Math.round(kr.bottom))+'\ncmd top '+(cr&&Math.round(cr.top))+' gap '+(cr&&Math.round(cr.top-Math.max(gr.bottom,kids)))+
    '\nscroller: '+(document.scrollingElement.scrollHeight)+' vs '+innerHeight+' html bg '+getComputedStyle(document.documentElement).backgroundColor+' body bg '+getComputedStyle(document.body).backgroundColor;
  document.body.appendChild(d);
})();
