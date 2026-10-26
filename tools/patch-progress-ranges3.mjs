/* from the three-year photographs:
 *  - a line breaks only across three empty buckets or more; one or two missing
 *    days are carried over (mood over a month had become scribbles)
 *  - labels never sit on each other: the last is placed first, the others
 *    only where they clear it
 *  - a column without a value keeps its place (empty labels kept their height)
 *  - a distance over ten kilometres is said in whole kilometres
 *  - a long figure in a hobby's ring is set smaller */
import fs from 'fs';
const R = [
  /* gaps: carry short ones */
  [`  var segs=[],cur=[];v.forEach(function(x,i){if(x==null){if(cur.length)segs.push(cur);cur=[];}else cur.push([X(i),Y(x)]);});if(cur.length)segs.push(cur);`,
   `  var segs=[],cur=[],miss=0;v.forEach(function(x,i){if(x==null){miss++;if(miss>=3&&cur.length){segs.push(cur);cur=[];}}else{miss=0;cur.push([X(i),Y(x)]);}});if(cur.length)segs.push(cur);`],
  [`  var segs=[],cur=[];R.forEach(function(x,j){if(x==null){if(cur.length)segs.push(cur);cur=[];}else cur.push([j*sw+sw/2,22+(1-(x-1)/9)*(Hh-44)]);});if(cur.length)segs.push(cur);`,
   `  var segs=[],cur=[],miss=0;R.forEach(function(x,j){if(x==null){miss++;if(miss>=3&&cur.length){segs.push(cur);cur=[];}}else{miss=0;cur.push([j*sw+sw/2,22+(1-(x-1)/9)*(Hh-44)]);}});if(cur.length)segs.push(cur);`],
  /* labels clear each other */
  [`  var tagged=n<=8?null:[first,last,imax,imin];
  v.forEach(function(x,i){if(x==null)return;var lit=i===last,p=[X(i),Y(x)],show=!tagged||tagged.indexOf(i)>=0,pr=o.pr&&o.pr[i];`,
   `  var tagged=n<=8?null:[first,last,imax,imin],boxes=[[X(last),Y(v[last])-(o.road?28:25)]];
  var clear=function(i){if(i===last)return true;var bx=X(i),by=Y(v[i])-(o.road?28:25);
    for(var j=0;j<boxes.length;j++)if(Math.abs(boxes[j][0]-bx)<44&&Math.abs(boxes[j][1]-by)<24)return false;boxes.push([bx,by]);return true;};
  v.forEach(function(x,i){if(x==null)return;var lit=i===last,p=[X(i),Y(x)],show=(!tagged||tagged.indexOf(i)>=0)&&clear(i),pr=o.pr&&o.pr[i];`],
  /* a column keeps its place */
  [`'<span class="lb"'+(lit?' style="color:#4a453f"':'')+'>'+esc(lab)+'</span>'+
      (o.sub&&n<=8?'<span class="lb" style="font-size:10.5px">'+(o.sub[k]||'')+'</span>':'')+'</div>';});`,
   `'<span class="lb"'+(lit?' style="color:#4a453f"':'')+'>'+(lab?esc(lab):'&nbsp;')+'</span>'+
      (o.sub&&n<=8?'<span class="lb" style="font-size:10.5px">'+(o.sub[k]||'&nbsp;')+'</span>':'')+'</div>';});`],
  /* distance in whole kilometres */
  [`say:_t('כ-{d} השבוע',{d:fmtDist(tot*0.75)})`, `say:_t('כ-{d} השבוע',{d:fmtDist(prgKm(tot))})`],
  [`say:_t('כ-{d} בתקופה הזו',{d:fmtDist(tot*0.75)})`, `say:_t('כ-{d} בתקופה הזו',{d:fmtDist(prgKm(tot))})`],
  [`function prgEnds(v){`, `/* steps to metres, whole kilometres once it is more than ten */
function prgKm(steps){var m=steps*0.75;return m>10000?Math.round(m/1000)*1000:Math.round(m/100)*100;}
function prgEnds(v){`],
  /* a long figure in a ring */
  [`'<div class="ctr"><b>'+hrs(rw[2],rw[4])+'</b>`, `'<div class="ctr"><b'+(String(hrs(rw[2],rw[4])).length>5?' style="font-size:15px"':'')+'>'+hrs(rw[2],rw[4])+'</b>`],
];
for (const F of ['dev/index.html', 'tools/prg.js', 'tools/patch-progress-ranges.mjs']) {
  let s = fs.readFileSync(F, 'utf8'), n = 0; const CR = s.includes('\r\n'); if (CR) s = s.replace(/\r\n/g, '\n');
  for (const [a, b] of R) if (s.includes(a)) { s = s.split(a).join(b); n++; }
  if (CR) s = s.replace(/\n/g, '\r\n'); fs.writeFileSync(F, s); console.log(F, n);
}
