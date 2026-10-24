/* The pull's light on Me ended in a hard edge (Asaf, 24 Oct: "in Better it
 * blends like an ombre, in Me it feels forced"). The light faded into the
 * BODY's colour, #f5f0eb - which is the ground of Better - while Me (and every
 * area) is painted #e9e7e3 by its own screen. So on Me the fade arrived at the
 * wrong colour and the screen's own edge cut across it. The light now fades
 * into whatever ground the visible screen has, read from the screen itself. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`function pullGlowPaint(){
  var el=document.getElementById('pull-glow'),y=window.scrollY||0;
  if(!el){el=document.createElement('div');el.id='pull-glow';document.body.insertBefore(el,document.body.firstChild);}
  el.style.height=(y<0?Math.round(-y):0)+'px';`,
`/* the ground the light fades into: the visible screen's own, else the body's */
function pullGround(){
  var ids=['me-screen','home-screen'],i,e,c;
  for(i=0;i<ids.length;i++){e=document.getElementById(ids[i]);
    if(e&&getComputedStyle(e).display!=='none'){c=getComputedStyle(e).backgroundColor;if(c&&!/rgba\\(0, 0, 0, 0\\)|transparent/.test(c))return c;}}
  e=document.querySelector('.app');
  if(e&&getComputedStyle(e).display!=='none'){c=getComputedStyle(e).backgroundColor;if(c&&!/rgba\\(0, 0, 0, 0\\)|transparent/.test(c))return c;}
  return getComputedStyle(document.body).backgroundColor;
}
function pullTint(el,at,g){
  var k=at+'|'+g;if(el._k===k)return;el._k=k;
  el.style.background='radial-gradient(120% 100% at 50% '+at+',rgba(240,169,46,.42),rgba(240,169,46,.16) 45%,'+g.replace('rgb(','rgba(').replace(')',',0)')+' 100%),'+g;
}
function pullGlowPaint(){
  var el=document.getElementById('pull-glow'),y=window.scrollY||0;
  if(!el){el=document.createElement('div');el.id='pull-glow';document.body.insertBefore(el,document.body.firstChild);}
  var g=(y<0||y>0)?pullGround():'';
  if(y<0)pullTint(el,'0%',g);
  el.style.height=(y<0?Math.round(-y):0)+'px';`);
rep(`  eb.style.height=(over>0?Math.round(over):0)+'px';`, `  if(over>0)pullTint(eb,'100%',g||pullGround());
  eb.style.height=(over>0?Math.round(over):0)+'px';`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
