/* Mip on סיום יום can be picked up and thrown (Asaf, 27 Oct), as on the
 * character sheet's touch card: pressed and moved, he comes along under the
 * finger, surprised and then delighted; let go, the finger's speed is his -
 * he flies, bounces off the card's sides (squashing on each hit), and settles
 * back home, happy if it was a ride. The card is his room: he never leaves it.
 * A still tap is still the giggle, five of them the sulk. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`  var taps=[],sulk=0;
  el.addEventListener('click',function(){
    var b=el._beem||(el.firstChild&&el.firstChild._beem);
    if(!b)return;
    appHaptic&&appHaptic();`,
`  var taps=[],sulk=0,P=null,raf=0;
  el.style.touchAction='none';el.style.willChange='transform';
  var pos={x:0,y:0,vx:0,vy:0};
  function room(){var c=el.closest('.rf-hero')||el.parentNode,cr=c.getBoundingClientRect(),hr=el.getBoundingClientRect();
    return {l:cr.left+8-(hr.left-pos.x),r:cr.right-8-(hr.right-pos.x),t:cr.top+8-(hr.top-pos.y),b:cr.bottom-8-(hr.bottom-pos.y)};}
  function put(){el.style.transform=(pos.x||pos.y)?'translate('+pos.x.toFixed(1)+'px,'+pos.y.toFixed(1)+'px)':'';}
  function verb(v,a){var b=el._beem;if(b)try{b.verb(v,a);}catch(e){}}
  el.addEventListener('pointerdown',function(e){
    cancelAnimationFrame(raf);
    try{el.setPointerCapture(e.pointerId);}catch(er){}
    P={x0:e.clientX,y0:e.clientY,px:pos.x,py:pos.y,t0:Date.now(),drag:false,s:[{x:e.clientX,y:e.clientY,t:Date.now()}]};
  });
  el.addEventListener('pointermove',function(e){
    if(!P)return;
    var dx=e.clientX-P.x0,dy=e.clientY-P.y0;
    P.s.push({x:e.clientX,y:e.clientY,t:Date.now()});if(P.s.length>6)P.s.shift();
    if(!P.drag&&Math.hypot(dx,dy)>10&&!night){P.drag=true;verb('face','surprised');setTimeout(function(){if(P&&P.drag)verb('face','happy');},300);}
    if(!P.drag)return;
    var R=room();pos.x=Math.max(R.l,Math.min(R.r,P.px+dx));pos.y=Math.max(R.t,Math.min(R.b,P.py+dy));put();
  });
  function fly(){
    var R=room(),last=performance.now(),hits=0;
    (function step(now){
      var h=Math.min(.033,(now-last)/1000);last=now;
      /* a spring home, the throw's speed fading against it */
      pos.vx+=(-pos.x*38-pos.vx*5.2)*h;pos.vy+=(-pos.y*38-pos.vy*5.2)*h;
      pos.x+=pos.vx*h;pos.y+=pos.vy*h;
      if(pos.x<R.l||pos.x>R.r){pos.x=pos.x<R.l?R.l:R.r;if(Math.abs(pos.vx)>260){verb('squash',Math.min(4,Math.abs(pos.vx)*.004));hits++;}pos.vx=-pos.vx*.6;}
      if(pos.y<R.t||pos.y>R.b){pos.y=pos.y<R.t?R.t:R.b;if(Math.abs(pos.vy)>260){verb('squash',Math.min(4,Math.abs(pos.vy)*.004));hits++;}pos.vy=-pos.vy*.6;}
      put();
      if(Math.abs(pos.x)<.5&&Math.abs(pos.y)<.5&&Math.abs(pos.vx)<8&&Math.abs(pos.vy)<8){
        pos.x=pos.y=pos.vx=pos.vy=0;put();
        verb('face',hits>1?'happy':'content');if(hits>1)verb('burst',1);
        setTimeout(function(){verb('face','calm');},1100);return;}
      raf=requestAnimationFrame(step);
    })(last);
  }
  function up(){
    if(!P)return;var p=P;P=null;
    if(p.drag){
      var a=p.s[0],z=p.s[p.s.length-1],dt=Math.max(16,z.t-a.t)/1000;
      pos.vx=Math.max(-3000,Math.min(3000,(z.x-a.x)/dt));pos.vy=Math.max(-3000,Math.min(3000,(z.y-a.y)/dt));
      if(Math.hypot(pos.vx,pos.vy)>1200)verb('face','surprised');
      fly();return;
    }
    if(Date.now()-p.t0<350)tapped();
  }
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  function tapped(){
    var b=el._beem||(el.firstChild&&el.firstChild._beem);
    if(!b)return;
    appHaptic&&appHaptic();`);
rep(`    try{b.play(RF_TAP);}catch(e){}
  });
}`,`    try{b.play(RF_TAP);}catch(e){}
  }
}`);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
