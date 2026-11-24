// The day's page as a magazine spread, as approved on the review page (Asaf, 24 Nov: concept 4 from Higgsfield,
// the day as a numbered list, the bottom as memory cards with the short answers in one ordered card).
// A wide photo with its caption, the moment as a serif headline with its last word lit, the date, the three numbers
// in one raised strip; then sections with a serif title and a short line of light under it: the day as a numbered
// list, the line that stayed in a pressed channel, the song as a raised card with a play button. Every written
// answer becomes its own memory card; every short one sits in ONE card, two columns, each named by its question
// and its thin mark - a cloud of unnamed chips read as things thrown at the reader (his words). The clock and the
// food are two raised buttons that open in place.
// The replaced block of summaryBodyHTML is kept beside this file (rf-day-mag.orig.txt) so --reverse is exact.
// usage: node tools/patches/rf-day-mag.mjs [file] [--reverse]
import fs from 'node:fs';
import path from 'node:path';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
const ORIG = path.join(path.dirname(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, '$1'), 'rf-day-mag.orig.txt');
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [];
const P = (a, b) => pairs.push([a, b]);

const START = '  var i,rows=sumFactRowsIds(sum,dateStr);\n';
const END = "  if(more)h+='<div class=\"sm3-rule\"></div><div class=\"sm3-more\">'+more+'</div>'+drawer;\n";
const NEW = `  var i,rows=sumFactRowsIds(sum,dateStr);
  /* THE DAY'S PAGE AS A MAGAZINE SPREAD (24 Nov). The photo wide, the moment
     as the headline, the date under it, the three numbers in one strip. */
  if(hasPh){
    h+='<figure class="sm4-hero">'+photoImg(sum.photo,'alt="" style="cursor:zoom-in" '+
       'onclick="event.stopPropagation();photoOpen(&quot;'+esc(sum.photo)+'&quot;)"')+'</figure>'+
       (sum.photoCaption?'<div class="sm4-cap">'+esc(sum.photoCaption)+'</div>':'');
  }
  if(sum.moment&&sumSecOn('moment'))h+='<div class="sm4-hd">'+sumLitLast(sum.moment)+'</div>';
  h+='<div class="sm2-date sm4-dt">'+fmtDate(dateStr)+'</div>';
  var trio='',TRIO={mood:1,dayRating:1,steps:1},rest=[],songRow=null;
  for(i=0;i<rows.length;i++){
    var rw=rows[i];
    if(rw.id==='song'){songRow=rw;continue;}
    if(!TRIO[rw.id]){rest.push(rw);continue;}
    var tv=rw.id==='mood'?(RF_MOODS[sum.mood-1]||{}).l:rw.v;
    trio+=(trio?'<i class="sm4-sep"></i>':'')+'<div class="sm4-t">'+sumIconSVG(rw.id,'sm3-ic sm4-t-ic')+
      '<b'+(rw.id==='mood'?' class="lit"':'')+'>'+tv+'</b><small>'+rw.l+'</small></div>';
  }
  if(trio)h+='<div class="sm4-strip">'+trio+'</div>';

  /* the day as a numbered list in one raised card */
  if(flowStops.length>0&&sumSecOn('flow')){
    h+='<section class="sm4-sec"><h3 class="sm4-h">'+sumIconSVG('flow')+'<span>'+_t('מהלך היום')+'</span></h3><ol class="sm4-steps">';
    for(i=0;i<flowStops.length;i++){
      h+='<li><span class="sm4-n">'+nfmt(i+1)+'</span><span class="sm4-tx">';
      if(flowStops[i].p)
        h+=photoImg(flowStops[i].p,'class="sm3-stop-ph" '+
          'onclick="event.stopPropagation();photoOpen(&quot;'+esc(flowStops[i].p)+'&quot;)"');
      h+='<span dir="auto">'+esc(flowStops[i].w)+'</span></span></li>';
    }
    h+='</ol></section>';
  }
  if(Array.isArray(sum.dayTimeline)&&sum.dayTimeline.length&&sumSecOn('flow')){
    h+='<section class="sm4-sec"><h3 class="sm4-h">'+sumIconSVG('dayTimeline')+'<span>'+sumLabelFor('dayTimeline')+'</span></h3><div class="sm2-tl">';
    for(i=0;i<sum.dayTimeline.length;i++)
      h+='<div class="sm2-tl-r"><span>'+esc(sum.dayTimeline[i].t||'')+'</span><b>'+esc(sum.dayTimeline[i].w||'')+'</b></div>';
    h+='</div></section>';
  }
  var _wos=workoutsOn(dateStr);
  if(_wos.length&&sumSecOn('fit')){
    h+='<section class="sm4-sec"><h3 class="sm4-h">'+sumIconSVG('workoutDone')+'<span>'+_t('אימון')+'</span></h3><div class="sm2-wo">';
    for(i=0;i<_wos.length;i++){
      var _wo=_wos[i],_wb=fitBurn(_wo),_bits=[];
      _bits.push(_t('{n} תרגילים',{n:(_wo.exercises||[]).length}));
      if(_wo.duration>0)_bits.push(_t('{n} דקות',{n:_wo.duration}));
      if(_wb)_bits.push(_t('בערך {n} קק"ל',{n:_wb.kcal}));
      h+='<div class="sm2-wo-r"><b>'+esc(_wo.name||_t('אימון'))+'</b>'+
         '<span>'+_bits.join(' · ')+'</span></div>';
    }
    h+='</div></section>';
  }

  /* the line that stayed, in a pressed channel with a little light inside */
  var _qOn=typeof sum.quote==='string'&&!!sum.quote&&sumSecOn('think');
  if(_qOn)h+='<section class="sm4-sec"><h3 class="sm4-h">'+sumIconSVG('quote')+'<span>'+sumLabelFor('quote')+'</span></h3>'+
    '<blockquote class="sm4-q">'+esc(sum.quote)+'</blockquote></section>';
  /* the song as a raised card; the play button opens it */
  if(songRow){
    var _art=typeof sum.songArt==='string'&&sum.songArt.indexOf('https://')===0;
    var _au=typeof sum.songUrl==='string'?sum.songUrl:'';
    var _apple=_au.indexOf('https://music.apple.com/')===0||_au.indexOf('https://itunes.apple.com/')===0;
    var _play=_apple?_au:'https://open.spotify.com/search/'+encodeURIComponent((sum.song||'')+' '+(sum.songArtist||''));
    h+='<section class="sm4-sec"><h3 class="sm4-h">'+sumIconSVG('song')+'<span>'+songRow.l+'</span></h3><div class="sm4-song">'+
      (_art?'<img src="'+esc(sum.songArt)+'" alt="">':'')+
      '<span class="sm4-sg-tx"><b dir="auto">'+esc(sum.song)+'</b>'+(sum.songArtist?'<span dir="auto">'+esc(sum.songArtist)+'</span>':'')+'</span>'+
      '<a class="sm4-play" href="'+esc(_play)+'" target="_blank" rel="noopener" onclick="event.stopPropagation()" aria-label="'+(_apple?'Apple Music':'Spotify')+'">'+
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg></a></div>'+songLinksHTML(sum)+'</section>';
  }

  /* every written answer is its own memory card */
  h+=sumMemHTML(sum,_qOn?{quote:1}:null);

  /* the short answers, all in ONE ordered card, each named by its question */
  var facts='',pills='',drawer='';
  for(i=0;i<rest.length;i++)
    facts+='<div class="sm4-f"><div class="sm4-fl">'+sumIconSVG(rest[i].id)+'<span>'+rest[i].l+'</span></div><div class="sm4-fv">'+rest[i].v+'</div></div>';
  if(facts)h+='<div class="sm4-facts"><div class="sm4-mh"><span>'+_t('עוד מהיום')+'</span></div><div class="sm4-fg">'+facts+'</div></div>';
  /* the clock and the food: two raised buttons that open in place */
  if(sum.timeclock&&sumSecOn('time')&&sum.timeclock.some(function(hx){return hx!=='none';})){
    var TC={sleep:PAL.terra200,work:PAL.green500,social:'#c9b8f0',other:PAL.amber500};
    var TL={sleep:_t('שינה'),work:_t('עבודה'),social:_t('חברתי'),other:_t('אחר')};
    var clkD=sum.timeclock,cnts2={sleep:0,work:0,social:0,other:0},ck,tparts=[];
    for(var hi4=0;hi4<25;hi4++){if(cnts2[clkD[hi4]]!==undefined)cnts2[clkD[hi4]]++;}
    for(ck in cnts2)if(cnts2[ck])tparts.push('<span class="sm2-dot" style="background:'+TC[ck]+'"></span>'+TL[ck]+' '+nfmt(cnts2[ck]));
    pills+='<button class="sm4-pill sm3-open" onclick="event.stopPropagation();sumOpenPart(this,\\'sm3-clock\\')">'+sumIconSVG('timeclock')+'<span>'+_t('לאן הלך הזמן')+'</span></button>';
    drawer+='<div class="sm3-drawer sm3-clock" hidden><div class="sm4-dl">'+tparts.join(' · ')+'</div><canvas id="sum-clock-canvas" width="160" height="166"></canvas></div>';
    window._sumClockData=clkD;
    window._sumClockNeedsDraw=true;
  }
  /* only a day something was eaten or drunk on: zeros are not a fact about it */
  if(sum.kcal!==undefined&&(sum.kcal>0||sum.water>0)&&sumSecOn('food')){
    var kp=Math.min(100,Math.round(sum.kcal/TARGETS.kcal*100)),pp2=Math.min(100,Math.round(sum.p/TARGETS.p*100)),cp3=Math.min(100,Math.round(sum.c/TARGETS.c*100)),fp2=Math.min(100,Math.round(sum.f/TARGETS.f*100));
    var nb='<div class="sm2-nut"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">';
    var smb=[{v:nfmt(sum.kcal),pct:kp,lbl:''+_t('קק"ל')+'',g:'linear-gradient(180deg,var(--violet-300),var(--violet-500))'},{v:fmtGrams(sum.p),pct:pp2,lbl:''+_t('חלבון')+'',g:'linear-gradient(180deg,#f3b9a8,#e08a72)'},{v:fmtGrams(sum.c),pct:cp3,lbl:''+_t('פחמימה')+'',g:'linear-gradient(180deg,#bfe0c7,#8fc79e)'},{v:fmtGrams(sum.f),pct:fp2,lbl:''+_t('שומן')+'',g:'linear-gradient(180deg,#f6dfa0,#e8c162)'}];
    for(var bi2=0;bi2<smb.length;bi2++){var sb=smb[bi2];nb+='<div style="display:flex;flex-direction:column;align-items:center;gap:3px"><div style="width:24px;height:68px;background:var(--line);border-radius:12px;overflow:hidden;position:relative"><div style="position:absolute;bottom:0;width:100%;height:'+(+sb.pct||0)+'%;background:'+sb.g+'"></div></div><div style="font-size:10.5px;font-weight:700">'+sb.v+'</div><div style="font-size:9px;color:var(--muted)">'+sb.lbl+'</div></div>';}
    /* Against the READER'S target, not against 3000. */
    if(sum.water){var wp2=Math.min(100,Math.round(sum.water/(TARGETS.water||3000)*100));nb+='<div style="margin-top:10px;display:flex;align-items:center;gap:8px;grid-column:1/-1"><span style="font-size:11px;color:#5b8fa8">'+_t('מים')+'</span><div style="flex:1;height:6px;background:var(--line);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+wp2+'%;background:linear-gradient(90deg,#74b9e8,var(--water-500))"></div></div><span style="font-size:10px;color:#5b8fa8">'+fmtVolume(sum.water)+'</span></div>';}
    nb+='</div></div>';
    var fparts=[];
    if(sum.kcal>0)fparts.push(_t('{n} קק"ל',{n:sum.kcal}));
    if(sum.p>0)fparts.push(fmtGrams(sum.p)+' '+_t('חלבון'));
    pills+='<button class="sm4-pill sm3-open" onclick="event.stopPropagation();sumOpenPart(this,\\'sm3-food\\')">'+sumIconSVG('food')+'<span>'+_t('תזונה')+'</span></button>';
    drawer+='<div class="sm3-drawer sm3-food" hidden><div class="sm4-dl">'+fparts.join(' · ')+'</div>'+nb+'</div>';
  }
  if(pills)h+='<div class="sm4-pills">'+pills+'</div>'+drawer;
`;

P(`function summaryBodyHTML(dateStr){`,
`/* The moment as a headline, its last word lit from below. A language written
   without spaces has no last word to find, so it is left whole and unlit. */
function sumLitLast(t){
  t=String(t||'').trim();
  var k=t.lastIndexOf(' ');
  if(k<1)return esc(t);
  return esc(t.slice(0,k+1))+'<u>'+esc(t.slice(k+1))+'</u>';
}
/* Every written answer as its own memory card: its question's mark, its title
   with a line of light under it, and the person's own sentence large. */
function sumMemHTML(sum,skip){
  var h='',i,j,g,id;
  for(i=0;i<SUM_PROSE.length;i++){
    g=SUM_PROSE[i];
    if(!sumSecOn(g.k))continue;
    for(j=0;j<g.ids.length;j++){
      id=g.ids[j];
      if(skip&&skip[id])continue;
      if(typeof sum[id]!=='string'||!sum[id])continue;
      h+='<div class="sm4-mem"><div class="sm4-mh">'+sumIconSVG(id)+'<span>'+sumLabelFor(id)+'</span></div><p>'+esc(sum[id])+'</p></div>';
    }
  }
  return h?'<div class="sm4-mems">'+h+'</div>':'';
}
function summaryBodyHTML(dateStr){`);

const LIT = 'rgba(255,255,255,.95)', SH = 'rgba(176,168,156,.44)', SHS = 'rgba(176,168,156,.3)', G = 'var(--nu-ground,#e9e7e3)';
const GLOW = 'rgba(240,169,46,.85)';
P(`.sm3-clock canvas{display:block;margin:0 auto}
`, `.sm3-clock canvas{display:block;margin:0 auto}
/* ── the day's page as a magazine spread (24 Nov): a wide photo, the moment as the headline, a raised strip,
   sections titled in serif with a line of light, the written answers as memory cards ── */
:root{--sm4-serif:"Frank Ruhl Libre",Georgia,serif}
.sm4-hero{margin:6px 0 0;border-radius:24px;overflow:hidden;line-height:0;box-shadow:-5px -5px 12px ${LIT},7px 9px 20px ${SH}}
.sm4-hero img{display:block;width:100%;aspect-ratio:5/4;object-fit:cover;object-position:50% 30%}
.sm4-cap{font-family:var(--sm4-serif);font-size:13px;color:var(--muted);margin:9px 4px 0;line-height:1.45;unicode-bidi:plaintext}
.sm4-hd{font-family:var(--sm4-serif);font-size:28px;font-weight:500;line-height:1.24;color:var(--ink);margin:18px 2px 6px;text-wrap:balance;unicode-bidi:plaintext}
.sm4-hd u{text-decoration:none;background:linear-gradient(${GLOW},${GLOW}) 0 100%/100% 2.5px no-repeat;padding-bottom:3px}
.sm2-date.sm4-dt{font-family:var(--sm4-serif);text-align:start;font-size:15px;font-weight:400;color:var(--muted);margin:0 2px 20px}
.sm4-strip{display:flex;align-items:stretch;border-radius:22px;background:${G};padding:14px 4px 12px;margin:0 0 26px;box-shadow:-4px -4px 10px ${LIT},5px 7px 15px ${SHS}}
.sm4-t{flex:1;min-width:0;text-align:center;display:flex;flex-direction:column;align-items:center;gap:3px;padding:0 4px}
.sm4-sep{flex:none;width:1px;background:rgba(143,136,126,.25);margin:4px 0}
.sm3-ic.sm4-t-ic{width:22px;height:22px}
.sm4-t b{font-family:var(--sm4-serif);font-size:20px;font-weight:500;line-height:1.2;color:var(--ink);margin-top:2px;overflow-wrap:anywhere}
.sm4-t b.lit{color:#8a5a1c}
.sm4-t b i{font-style:normal;font-size:13px;color:var(--muted)}
.sm4-t small{font-size:11.5px;font-weight:700;color:var(--muted)}
.sm4-sec{margin:0 2px 24px}
.sm4-sec>:not(.sm4-h){margin-inline-start:29px}
.sm4-h{position:relative;display:flex;align-items:center;gap:9px;margin:0 0 14px;padding-bottom:7px;font-family:var(--sm4-serif);font-size:18px;font-weight:500;color:var(--ink)}
.sm4-h .sm3-ic{width:20px;height:20px}
.sm4-h:after,.sm4-mh span:after{content:"";position:absolute;bottom:0;width:26px;height:1.5px;border-radius:2px;background:${GLOW};box-shadow:0 0 6px rgba(240,169,46,.55);opacity:.85}
.sm4-h:after{inset-inline-start:29px}
.sm4-steps{list-style:none;margin:0;padding:12px 14px;border-radius:18px;background:${G};box-shadow:-4px -4px 9px ${LIT},5px 6px 13px ${SHS}}
.sm4-steps li{position:relative;display:flex;gap:12px;align-items:flex-start;padding:5px 0}
.sm4-steps li:not(:last-child):after{content:"";position:absolute;inset-inline-start:12px;top:31px;bottom:-5px;border-inline-start:1.5px dotted rgba(143,136,126,.55)}
.sm4-n{flex:none;width:25px;height:25px;border-radius:50%;display:grid;place-items:center;font-size:12.5px;font-weight:700;color:var(--muted);background:${G};box-shadow:-2px -2px 4px ${LIT},2px 3px 6px ${SH}}
.sm4-tx{display:flex;align-items:center;gap:8px;min-width:0;padding-top:3px;font-size:15px;line-height:1.45;color:var(--ink)}
.sm4-q{margin:0;padding:13px 16px;border-radius:18px;font-family:var(--sm4-serif);font-size:16.5px;line-height:1.6;color:var(--ink);unicode-bidi:plaintext;background:${G};
  box-shadow:inset 2px 2px 5px ${SH},inset -2px -2px 5px ${LIT},inset 0 0 22px rgba(240,169,46,.16)}
.sm4-song{display:flex;align-items:center;gap:13px;padding:9px;border-radius:18px;background:${G};box-shadow:-4px -4px 9px ${LIT},5px 6px 13px ${SHS}}
.sm4-song img{width:58px;height:58px;border-radius:11px;flex:none;object-fit:cover}
.sm4-sg-tx{flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-start}
.sm4-sg-tx>*{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;unicode-bidi:isolate}
.sm4-sg-tx b{font-family:var(--sm4-serif);font-size:17px;font-weight:500;color:var(--ink)}
.sm4-sg-tx span{font-size:13.5px;color:var(--muted)}
.sm4-play{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:${G};box-shadow:-3px -3px 7px ${LIT},4px 5px 10px ${SHS}}
.sm4-play svg{width:16px;height:16px;fill:#d48a1e;filter:drop-shadow(0 0 4px rgba(240,169,46,.6))}
.sm4-sec .sm3-sg-ln{margin-top:9px;padding-inline-start:4px}
.sm4-mems{display:flex;flex-direction:column;gap:16px;margin:30px 0 16px}
.sm4-mem,.sm4-facts{border-radius:24px;background:${G};padding:16px 18px 18px;box-shadow:-5px -5px 12px ${LIT},6px 8px 18px ${SHS}}
.sm4-mh{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.sm4-mh .sm3-ic{width:21px;height:21px}
.sm4-mh span{position:relative;padding-bottom:7px;font-size:13.5px;font-weight:700;color:var(--muted)}
.sm4-mh span:after{inset-inline-start:0;width:34px}
.sm4-mem p{margin:0;font-family:var(--sm4-serif);font-size:23px;line-height:1.32;color:var(--ink);text-wrap:pretty;unicode-bidi:plaintext}
.sm4-facts{margin:0 0 16px;padding-bottom:6px}
.sm4-fg{display:grid;grid-template-columns:1fr 1fr;column-gap:18px}
.sm4-f{min-width:0;padding:11px 0 12px;border-top:1px solid rgba(143,136,126,.15)}
.sm4-f:nth-child(-n+2){border-top:0;padding-top:2px}
.sm4-fl{display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:12px;font-weight:700;color:var(--muted)}
.sm4-fl .sm3-ic{width:14px;height:14px}
.sm4-fv{font-family:var(--sm4-serif);font-size:17px;line-height:1.3;color:var(--ink);overflow-wrap:anywhere}
.sm4-fv i{font-style:normal;color:var(--muted)}
.sm4-pills{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 14px}
.sm4-pills>:only-child{grid-column:1/-1}
.sm4-pill{display:flex;align-items:center;justify-content:center;gap:9px;padding:14px 10px;border:0;border-radius:999px;cursor:pointer;background:${G};
  font-family:var(--sm4-serif);font-size:15.5px;color:var(--ink);box-shadow:-3px -3px 8px ${LIT},4px 5px 12px ${SHS}}
.sm4-pill.on{box-shadow:inset 2px 2px 5px ${SH},inset -2px -2px 5px ${LIT}}
.sm4-pill .sm3-ic{width:19px;height:19px}
.sm4-dl{text-align:center;font-size:13px;color:var(--muted);margin:0 0 12px}
`);

if (!rev) {
  const a = s.indexOf(START), b = s.indexOf(END);
  if (a < 0 || b < 0 || b < a) throw new Error('block not found');
  if (s.indexOf(START, a + 1) >= 0) throw new Error('START not unique');
  fs.writeFileSync(ORIG, s.slice(a, b + END.length));
  s = s.slice(0, a) + NEW + s.slice(b + END.length);
  for (const [x, y] of pairs) {
    const n = s.split(x).length - 1;
    if (n !== 1) throw new Error('anchor x' + n + ': ' + x.slice(0, 60));
    s = s.replace(x, () => y);
  }
} else {
  for (const [x, y] of pairs.slice().reverse()) {
    const n = s.split(y).length - 1;
    if (n !== 1) throw new Error('reverse anchor x' + n + ': ' + y.slice(0, 60));
    s = s.replace(y, () => x);
  }
  const o = fs.readFileSync(ORIG, 'utf8');
  const n = s.split(NEW).length - 1;
  if (n !== 1) throw new Error('NEW not found once');
  s = s.replace(NEW, () => o);
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied');
