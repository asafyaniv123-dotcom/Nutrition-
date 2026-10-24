import fs from 'fs';
const F='review/olimei-ideas/index.html';let s=fs.readFileSync(F,'utf8');
const a="for(y=0;y<H;y++)for(x=0;x<W;x++){k=(y*W+x)*4+3;if(A[k]>128&&B[k]<40){sx+=x;sy+=y;n++;}}\n      var R=s*px";
if(s.split(a).length!==2){console.log('anchor');process.exit(1);}
s=s.replace(a,"var xa=padX+t.measureText(T.slice(0,i)).width-px*.05,xb=padX+t.measureText(T.slice(0,i)+'i').width+px*.05,yb=base-px*.56;\n      for(y=0;y<yb;y++)for(x=Math.floor(xa);x<xb;x++){k=(y*W+x)*4+3;if(A[k]>128&&B[k]<40){sx+=x;sy+=y;n++;}}\n      var R=s*px");
fs.writeFileSync(F,s);console.log('ok');
