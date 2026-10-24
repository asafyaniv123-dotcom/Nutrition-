/* Option G put the sun to the left of its i (Asaf, 24 Oct: "not in the right
   place"). The dot's position was guessed from a lone 'i' plus the width of
   the letters before it, which misses how Fraunces sets "lı" in the word.
   Measured in place now: the word is drawn twice off screen, once with that
   i dotted and once without, and the sun goes to the centre of the ink that
   only the dotted one has - the dot exactly where the word puts it. */
import fs from 'fs';
const F = 'review/olimei-ideas/index.html';
let s = fs.readFileSync(F, 'utf8');
const a = s.indexOf('    dotSun:function(i,s){');
const b = s.indexOf('\n', a);
if (a < 0) { console.log('anchor'); process.exit(1); }
s = s.slice(0, a) + `    dotSun:function(i,s){var T=idea[1],Td=T.slice(0,i)+'i'+T.slice(i+1),W=Math.ceil(g.measureText(Td).width+padX*2),H=Math.ceil(base+px*.4),
      c=document.createElement('canvas');c.width=W;c.height=H;var t=c.getContext('2d');t.font=g.font;t.direction='ltr';t.textAlign='left';t.textBaseline='alphabetic';
      t.fillText(Td,padX,base);var A=t.getImageData(0,0,W,H).data;t.clearRect(0,0,W,H);t.fillText(T,padX,base);var B=t.getImageData(0,0,W,H).data,sx=0,sy=0,n=0,x,y,k;
      for(y=0;y<H;y++)for(x=0;x<W;x++){k=(y*W+x)*4+3;if(A[k]>128&&B[k]<40){sx+=x;sy+=y;n++;}}
      var R=s*px,cx=sx/n,cy=sy/n,xh=px*.5,low=cy+R;` + s.slice(b);
fs.writeFileSync(F, s);
console.log('ok');
