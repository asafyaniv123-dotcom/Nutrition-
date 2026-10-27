/* Two Mip notes from Asaf (27 Oct):
 * 1. The chat/dial change still did not feel clean: now Mip carries it. The
 *    corner Mip lifts out of his niche and flies to the middle of the chat as
 *    the screens change under the blur (and back again the other way); the
 *    two Mips that stand still are hidden while he travels, so there is one.
 * 2. Mip on סיום יום now moves as the character sheet's touch card has him:
 *    picked up he follows the finger, surprised and then happy; let go, he
 *    flies with the finger's speed under gravity, bounces off the card's
 *    walls and floor - squashing by how hard - rests, and floats back home;
 *    a long still press is petting (content, eyes shut, slow breathing);
 *    his eyes follow a finger moving over him. Tap and the five-tap sulk
 *    stay. Replaces the spring-home version. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};

/* 1 - the flight */
rep(`  v.classList.remove('off');void v.offsetWidth;v.classList.add('on');
  _hchT=setTimeout(function(){
    hchSync();if(m==='dial'){try{renderHomeGrid();}catch(e){}}
    requestAnimationFrame(function(){v.classList.remove('on');v.classList.add('off');});
  },240);`,
`  v.classList.remove('off');void v.offsetWidth;v.classList.add('on');
  /* Mip carries the change: from where he stands now to where he will stand */
  var from=m==='chat'?document.getElementById('bhelp'):document.getElementById('hch-mip'),fr=from&&from.getBoundingClientRect();
  var fly=null;
  if(fr&&fr.width&&!(m==='dial'&&document.getElementById('hch-empty')&&document.getElementById('hch-empty').classList.contains('gone'))){
    fly=document.createElement('div');fly.className='mip-fly';var S=170;fly.style.width=fly.style.height=S+'px';
    fly.style.transform='translate('+(fr.left+fr.width/2-S/2)+'px,'+(fr.top+fr.height/2-S/2)+'px) scale('+(fr.width/S)+')';
    document.body.appendChild(fly);from.style.visibility='hidden';
    beemKit().then(function(K){try{K.mount(fly,{play:DOOR_BEEM.glad});}catch(e){}});
  }
  _hchT=setTimeout(function(){
    hchSync();if(m==='dial'){try{renderHomeGrid();}catch(e){}}
    if(fly){
      if(from)from.style.visibility='';
      var to=m==='chat'?document.getElementById('hch-mip'):document.getElementById('bhelp'),tr=to&&to.getBoundingClientRect();
      if(tr&&tr.width){to.style.visibility='hidden';var S=170;
        fly.style.transform='translate('+(tr.left+tr.width/2-S/2)+'px,'+(tr.top+tr.height/2-S/2)+'px) scale('+(tr.width/S)+')';
        setTimeout(function(){to.style.visibility='';fly.classList.add('done');setTimeout(function(){fly.remove();},220);},620);}
      else fly.remove();
    }
    requestAnimationFrame(function(){v.classList.remove('on');v.classList.add('off');});
  },240);`);
rep(`#hch-veil.off{transition-duration:.42s}`,`#hch-veil.off{transition-duration:.42s}
.mip-fly{position:fixed;left:0;top:0;z-index:960;pointer-events:none;transform-origin:50% 50%;
  transition:transform .6s cubic-bezier(.45,.05,.2,1),opacity .2s}
.mip-fly.done{opacity:0}`);

/* 2 - the sheet's touch */
const a=s.indexOf('function rfBeemTouch(el,night){'),b=s.indexOf('var BEEM_SUN_IDLE=',a);
if(a<0||b<0){console.log('touch anchors');process.exit(1);}
s=s.slice(0,a)+`function rfBeemTouch(el,night){
  if(!el||el._touch)return;el._touch=1;el.style.cursor='pointer';el.style.touchAction='none';el.style.willChange='transform';
  var taps=[],sulk=0,P=null,raf=0,pos={x:0,y:0,vx:0,vy:0},lookT=0,petT=0;
  function B(){return el._beem||null;}
  function verb(v,a){var b=B();if(b)try{b.verb(v,a);}catch(e){}}
  function face(f){verb('face',f);}
  function room(){var c=el.closest('.rf-hero')||el.parentNode,cr=c.getBoundingClientRect(),hr=el.getBoundingClientRect();
    return {l:cr.left+6-(hr.left-pos.x),r:cr.right-6-(hr.right-pos.x),t:cr.top+6-(hr.top-pos.y),b:cr.bottom-6-(hr.bottom-pos.y)};}
  function put(){el.style.transform=(pos.x||pos.y)?'translate('+pos.x.toFixed(1)+'px,'+pos.y.toFixed(1)+'px)':'';}
  /* his eyes follow a finger over him */
  function lookAt(e){var b=B();if(!b)return;var r=el.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
    b.idle=false;b.lkX=Math.max(-38,Math.min(38,dx/2.2));b.lkY=Math.max(-22,Math.min(22,-dy/3));
    clearTimeout(lookT);lookT=setTimeout(function(){var bb=B();if(bb&&!P){bb.idle=true;bb.lkX=0;bb.lkY=0;}},1600);}
  el.addEventListener('pointerdown',function(e){
    if(night)return;cancelAnimationFrame(raf);
    try{el.setPointerCapture(e.pointerId);}catch(er){}
    P={x0:e.clientX,y0:e.clientY,px:pos.x,py:pos.y,t0:Date.now(),mode:'press',s:[{x:e.clientX,y:e.clientY,t:performance.now()}]};
    /* a long, still press is petting */
    clearTimeout(petT);petT=setTimeout(function(){if(P&&P.mode==='press'&&!sulk){P.mode='pet';face('content');setTimeout(function(){if(P&&P.mode==='pet')face('closed');},600);
      verb('mode',{breathe:[.024,4.2],spinMul:.5,idle:0});}},450);
  });
  el.addEventListener('pointermove',function(e){
    if(!P){lookAt(e);return;}
    var dx=e.clientX-P.x0,dy=e.clientY-P.y0;
    P.s.push({x:e.clientX,y:e.clientY,t:performance.now()});if(P.s.length>6)P.s.shift();
    if(P.mode==='press'&&Math.hypot(dx,dy)>12){clearTimeout(petT);P.mode='drag';face('surprised');setTimeout(function(){if(P&&P.mode==='drag')face('happy');},300);}
    if(P.mode==='pet'){lookAt(e);return;}
    if(P.mode!=='drag')return;
    var R=room();pos.x=Math.max(R.l,Math.min(R.r,P.px+dx));pos.y=Math.max(R.t,Math.min(R.b,P.py+dy));pos.vx=pos.vy=0;put();
  });
  /* THROW: under gravity, off the walls and the floor, then home */
  function fly(){
    var R=room(),last=performance.now(),hits=0,rest=0;
    (function step(now){
      var h=Math.min(.033,(now-last)/1000);last=now;
      pos.vy+=2600*h;
      var onFloor=pos.y>=R.b-.5;if(onFloor)pos.vx-=pos.vx*Math.min(1,2.8*h);
      pos.x+=pos.vx*h;pos.y+=pos.vy*h;
      if(pos.x<R.l||pos.x>R.r){pos.x=pos.x<R.l?R.l:R.r;if(Math.abs(pos.vx)>200){verb('squash',Math.min(4,Math.abs(pos.vx)*.0022));hits++;}pos.vx=-pos.vx*.62;}
      if(pos.y<R.t){pos.y=R.t;pos.vy=-pos.vy*.5;}
      if(pos.y>R.b){pos.y=R.b;if(pos.vy>220){verb('squash',Math.min(8,pos.vy*.0032));hits++;pos.vy=-pos.vy*.5;}else pos.vy=0;}
      put();
      if(pos.y>=R.b-.5&&Math.abs(pos.vx)<20&&Math.abs(pos.vy)<20){rest+=h;if(rest>.35){landed(hits);return;}}else rest=0;
      raf=requestAnimationFrame(step);
    })(last);
  }
  function landed(hits){
    face(hits>2?'happy':'content');if(hits>2)verb('burst',1);
    setTimeout(function(){
      face('calm');
      /* and he floats back to where he lives */
      var x0=pos.x,y0=pos.y,t0=performance.now();
      (function back(now){var k=Math.min(1,(now-t0)/700),e2=1-Math.pow(1-k,3);pos.x=x0*(1-e2);pos.y=y0*(1-e2);put();
        if(k<1)raf=requestAnimationFrame(back);else{pos.x=pos.y=0;put();}})(t0);
    },1000);
  }
  function up(){
    clearTimeout(petT);
    if(!P)return;var p=P;P=null;
    if(p.mode==='drag'){
      var a=p.s[0],z=p.s[p.s.length-1],dt=Math.max(16,z.t-a.t)/1000;
      pos.vx=Math.max(-3200,Math.min(3200,(z.x-a.x)/dt));pos.vy=Math.max(-3200,Math.min(3200,(z.y-a.y)/dt));
      if(Math.hypot(pos.vx,pos.vy)>1300)face('surprised');
      fly();return;
    }
    if(p.mode==='pet'){face('happy');verb('blink');verb('mode',{breathe:[.014,3.6],spinMul:1,idle:1});setTimeout(function(){face('calm');},1200);return;}
    if(Date.now()-p.t0<300)tapped();
  }
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  el.addEventListener('click',function(){if(night){var b=B();if(b)try{b.play(RF_PEEK);}catch(e){}}});
  function tapped(){
    var b=B();if(!b)return;
    appHaptic&&appHaptic();
    if(sulk)return;
    var now=Date.now();taps=taps.filter(function(t){return now-t<2600;});taps.push(now);
    if(taps.length>=5){taps=[];sulk=1;try{b.play(RF_SULK);}catch(e){}setTimeout(function(){sulk=0;},3100);return;}
    try{b.play(RF_TAP);}catch(e){}
  }
}
`+s.slice(b);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
