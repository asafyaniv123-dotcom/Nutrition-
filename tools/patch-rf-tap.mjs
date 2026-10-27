/* Mip in סיום יום answers a touch (Asaf, 27 Oct), as the character sheet's
 * "touch" card has him (dev/look/beem-alive.js tap()): a tap - a happy face,
 * a squash, a small hop and a burst of his rings, then calm; five taps in a
 * few seconds and he sulks (sad, looks away) and forgives two seconds later.
 * At night, asleep under the moon, a tap only makes him open one eye. */
import fs from 'fs';
const F='dev/index.html';let s=fs.readFileSync(F,'utf8');const CR=s.includes('\r\n');if(CR)s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1){console.log('ANCHOR x'+n+': '+a.slice(0,80));process.exit(1);}s=s.replace(a,()=>b);};
rep(`  beemMount(document.getElementById('rf-beem'),_bNight?{play:'moon'}:_bDone?{play:BEEM_COUNTED_ONCE,glow:_bN}:{play:'invite',glow:_bN});`,
`  beemMount(document.getElementById('rf-beem'),function(K){
    var o=_bNight?{play:'moon'}:_bDone?{play:BEEM_COUNTED_ONCE,glow:_bN}:{play:'invite',glow:_bN};   // i18n-exempt: kit script names
    setTimeout(function(){rfBeemTouch(document.getElementById('rf-beem'),_bNight);},0);
    return o;
  });`);
rep(`var BEEM_SUN_IDLE=`,`/* the character sheet's touch, on the page's own Mip */
var RF_TAP={dur:1e9,ev:[[0,'face','happy'],[0,'squash',3.2],[0,'hop',45],[0,'burst',.9],[1000,'face','calm'],[1000,'mode',{breathe:[.016,4],idle:0}]]};
var RF_SULK={dur:1e9,ev:[[0,'face','sad'],[0,'look',40,-6],[2200,'look',0,0],[2200,'blink'],[2250,'face','content'],[3100,'face','calm'],[3100,'mode',{breathe:[.016,4],idle:0}]]};
var RF_PEEK={dur:1e9,ev:[[0,'face','calm'],[700,'blink'],[900,'face','closed']]};
function rfBeemTouch(el,night){
  if(!el||el._touch)return;el._touch=1;el.style.cursor='pointer';
  var taps=[],sulk=0;
  el.addEventListener('click',function(){
    var b=el._beem||(el.firstChild&&el.firstChild._beem);
    if(!b)return;
    appHaptic&&appHaptic();
    if(night){try{b.play(RF_PEEK);}catch(e){}return;}
    if(sulk)return;
    var now=Date.now();taps=taps.filter(function(t){return now-t<2600;});taps.push(now);
    if(taps.length>=5){taps=[];sulk=1;try{b.play(RF_SULK);}catch(e){}setTimeout(function(){sulk=0;},3100);return;}
    try{b.play(RF_TAP);}catch(e){}
  });
}
var BEEM_SUN_IDLE=`);
rep(`    if(el&&el.isConnected&&!el.firstChild)K.mount(el,typeof opts==='function'?opts(K):opts);`,
  `    if(el&&el.isConnected&&!el.firstChild)el._beem=K.mount(el,typeof opts==='function'?opts(K):opts);`);
if(CR)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(F,s);console.log('ok');
