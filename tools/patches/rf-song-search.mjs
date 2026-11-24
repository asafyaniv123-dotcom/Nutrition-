// The song of the day, found by searching (Asaf, 24 Nov, approved on the review page). A few letters of a song or
// an artist, a list with covers, one tap - and the title, artist and cover come in by themselves. Apple's public
// search (itunes.apple.com/search) answers a browser directly, with no account and no server: measured from a page,
// not assumed. Typing it by hand stays, one tap away. On the day's page the song shows its small cover and two
// links, Apple Music and Spotify, which open it wherever the person listens.
// usage: node tools/patches/rf-song-search.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [];
const P = (a, b) => pairs.push([a, b]);

// the step
P(`  else if(q.kind==='song'){
    h+='<input id="rf-song" class="rf-in" style="min-height:0" placeholder="'+_t("שם השיר")+'" value="'+(rfVal('song')?esc(rfVal('song')):'')+'">';
    h+='<input id="rf-artist" class="rf-in" style="min-height:0;margin-top:6px" placeholder="'+_t("אמן")+'" value="'+(rfVal('songArtist')?esc(rfVal('songArtist')):'')+'">';
    h+='<button onclick="rfNext()" class="rf-next">'+_t('המשך')+'</button>';
  }`,
`  else if(q.kind==='song'){
    var sgT=rfVal('song')||'',sgA=rfVal('songArtist')||'',sgArt=rfVal('songArt')||'';
    if(_rfSongMode==='manual'){
      h+='<input id="rf-song" class="rf-in" style="min-height:0" placeholder="'+_t("שם השיר")+'" value="'+(sgT?esc(sgT):'')+'">';
      h+='<input id="rf-artist" class="rf-in" style="min-height:0;margin-top:6px" placeholder="'+_t("אמן")+'" value="'+(sgA?esc(sgA):'')+'">';
      h+='<button class="rf-sg-link" onclick="rfSongMode(\\'search\\')">'+_t('חזרה לחיפוש')+'</button>';
    } else if(sgT&&_rfSongMode!=='search'){
      /* chosen: the cover, large, and a way to change it */
      h+='<div class="rf-sg-chosen">'+(sgArt?'<img src="'+esc(sgArt)+'" alt="">':'')+
         '<b dir="auto">'+esc(sgT)+'</b>'+(sgA?'<span dir="auto">'+esc(sgA)+'</span>':'')+'</div>';
      h+='<button class="rf-sg-link" onclick="rfSongMode(\\'search\\')">'+_t('החלף שיר')+'</button>';
    } else {
      h+='<label class="rf-sg-q"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>'+
         '<input id="rf-song-q" type="search" enterkeyhint="search" autocomplete="off" placeholder="'+_t('חפש שיר או אמן')+'" oninput="rfSongSearch(this.value)"></label>';
      h+='<div id="rf-sg-res" class="rf-sg-res" aria-live="polite"></div>';
      h+='<button class="rf-sg-link" onclick="rfSongMode(\\'manual\\')">'+_t('לא מצאת? אפשר לכתוב בעצמך')+'</button>';
    }
    h+='<button onclick="rfNext()" class="rf-next">'+_t('המשך')+'</button>';
  }`);
// saving: only from the typed boxes, and a title typed by hand drops a cover that belonged to another song
P(`    var s1=document.getElementById('rf-song'),s2=document.getElementById('rf-artist');
    rfSave({song:s1?s1.value.trim():'',songArtist:s2?s2.value.trim():''});`,
`    var s1=document.getElementById('rf-song'),s2=document.getElementById('rf-artist');
    if(s1){
      var sgp={song:s1.value.trim(),songArtist:s2?s2.value.trim():''};
      if(sgp.song!==(rfVal('song')||'')||sgp.songArtist!==(rfVal('songArtist')||'')){sgp.songArt='';sgp.songUrl='';}
      rfSave(sgp);
    }
    _rfSongMode='';`);
// the search itself
P(`function rfClockTotals(clk){`,
`/* ── THE SONG, FOUND BY SEARCHING ── Apple's public search answers a browser
   directly. The store country follows the reader's language, so a Hebrew
   reader is searching the Israeli shelf, where the Hebrew songs are. */
var _rfSongMode='',_rfSongRes=[],_rfSongT=0,_rfSongSeq=0;
function rfSongMode(m){_rfSongMode=m;_rfSongRes=[];renderReflectStep();
  setTimeout(function(){var e=document.getElementById(m==='manual'?'rf-song':'rf-song-q');if(e)e.focus();},60);}
function rfSongCountry(){
  var c={he:'IL',en:'US',de:'DE',es:'ES',ja:'JP',fr:'FR',it:'IT',pt:'BR','zh-Hans':'CN','zh-Hant':'TW',ar:'AE'};
  try{return c[appLang()]||'US';}catch(e){return 'US';}
}
function rfSongSearch(v){
  clearTimeout(_rfSongT);
  var q=String(v||'').trim(),box=document.getElementById('rf-sg-res');
  if(q.length<2){_rfSongRes=[];if(box)box.innerHTML='';return;}
  _rfSongT=setTimeout(function(){
    var my=++_rfSongSeq;
    fetch('https://itunes.apple.com/search?media=music&entity=song&limit=6&country='+rfSongCountry()+'&term='+encodeURIComponent(q))
      .then(function(r){return r.json();})
      .then(function(j){
        if(my!==_rfSongSeq)return;
        _rfSongRes=(j&&j.results||[]).filter(function(x){return x.trackName;});
        rfSongPaint();
      })
      .catch(function(){if(my!==_rfSongSeq)return;_rfSongRes=[];
        var b=document.getElementById('rf-sg-res');if(b)b.innerHTML='<div class="rf-sg-none">'+_t('החיפוש לא זמין כרגע')+'</div>';});
  },320);
}
function rfSongPaint(){
  var b=document.getElementById('rf-sg-res'),h='',i,x;if(!b)return;
  if(!_rfSongRes.length){b.innerHTML='<div class="rf-sg-none">'+_t('לא נמצאו שירים')+'</div>';return;}
  for(i=0;i<_rfSongRes.length;i++){x=_rfSongRes[i];
    h+='<button class="rf-sg-r" onclick="rfSongPick('+i+')">'+(x.artworkUrl100?'<img src="'+esc(x.artworkUrl100)+'" alt="">':'<span class="rf-sg-ph"></span>')+
       '<span class="rf-sg-t"><b dir="auto">'+esc(x.trackName)+'</b><span dir="auto">'+esc(x.artistName||'')+'</span></span></button>';}
  b.innerHTML=h;
}
function rfSongPick(i){
  var x=_rfSongRes[i];if(!x)return;
  rfSave({song:x.trackName,songArtist:x.artistName||'',
    songArt:x.artworkUrl100?x.artworkUrl100.replace('100x100bb','300x300bb'):'',songUrl:x.trackViewUrl||''});
  _rfSongMode='';_rfSongRes=[];renderReflectStep();
}
/* the two places a song opens: the Apple link the search gave, and Spotify's
   own search for the same title and artist */
function songLinksHTML(sum){
  var q=encodeURIComponent((sum.song||'')+' '+(sum.songArtist||'')),h='';
  if(sum.songUrl&&/^https:\\/\\/(music|itunes)\\.apple\\.com\\//.test(sum.songUrl))
    h+='<a href="'+esc(sum.songUrl)+'" target="_blank" rel="noopener" onclick="event.stopPropagation()">Apple Music</a>';
  h+='<a href="https://open.spotify.com/search/'+q+'" target="_blank" rel="noopener" onclick="event.stopPropagation()">Spotify</a>';
  return '<span class="sm3-sg-ln">'+h+'</span>';
}
function rfClockTotals(clk){`);
// the day's page: the song's row carries its cover and the links
P(`  for(i=0;i<rest.length;i++)
    more+='<div class="sm3-k">'+sumIconSVG(rest[i].id)+'<span>'+rest[i].l+'</span></div><div class="sm3-v">'+rest[i].v+'</div>';`,
`  for(i=0;i<rest.length;i++){
    if(rest[i].id==='song'){
      more+='<div class="sm3-k">'+sumIconSVG('song')+'<span>'+rest[i].l+'</span></div><div class="sm3-v sm3-sg">'+
        (sum.songArt&&/^https:\\/\\//.test(sum.songArt)?'<img src="'+esc(sum.songArt)+'" alt="">':'')+
        '<span class="sm3-sg-tx"><span>'+rest[i].v+'</span>'+songLinksHTML(sum)+'</span></div>';
      continue;
    }
    more+='<div class="sm3-k">'+sumIconSVG(rest[i].id)+'<span>'+rest[i].l+'</span></div><div class="sm3-v">'+rest[i].v+'</div>';
  }`);
P(`.sm3-drawer{margin:0 2px 18px}`,
`.sm3-drawer{margin:0 2px 18px}
.sm3-sg{display:flex;align-items:flex-start;gap:10px}
.sm3-sg img{width:44px;height:44px;border-radius:9px;object-fit:cover;flex:none;box-shadow:0 3px 8px rgba(120,110,95,.25)}
.sm3-sg-tx{min-width:0;display:flex;flex-direction:column;gap:3px}
.sm3-sg-ln{display:flex;gap:14px;font-size:12px;font-weight:700}
.sm3-sg-ln a{color:var(--muted);text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(143,136,126,.4)}
/* the song step: search, a list with covers, the chosen one large */
.rf-sg-q{display:flex;align-items:center;gap:10px;padding:0 16px;border-radius:16px;background:var(--nu-ground,#e9e7e3);
  box-shadow:inset 3px 3px 7px rgba(176,168,156,.44),inset -3px -3px 7px rgba(255,255,255,.95)}
.rf-sg-q svg{width:18px;height:18px;fill:none;stroke:#a39b90;stroke-width:1.5;stroke-linecap:round;flex:none}
.rf-sg-q input{flex:1;min-width:0;border:0;background:none;outline:none;font-family:inherit;font-size:16px;color:var(--ink);padding:14px 0;unicode-bidi:plaintext}
.rf-sg-res{margin-top:12px}
.rf-sg-r{display:flex;align-items:center;gap:12px;width:100%;padding:8px 6px;border:0;background:none;cursor:pointer;font-family:inherit;text-align:start;color:var(--ink)}
.rf-sg-r+.rf-sg-r{box-shadow:0 -1px 0 rgba(176,168,156,.28)}
.rf-sg-r img,.rf-sg-ph{width:46px;height:46px;border-radius:10px;object-fit:cover;flex:none;box-shadow:0 3px 8px rgba(120,110,95,.25);background:rgba(176,168,156,.2)}
.rf-sg-t{min-width:0;max-width:100%;display:flex;flex-direction:column;align-items:flex-start;gap:2px}
.rf-sg-t>*{max-width:100%;unicode-bidi:isolate}
.rf-sg-t b,.rf-sg-chosen b{font-size:14.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rf-sg-t span{font-size:12.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rf-sg-none{text-align:center;font-size:13px;color:var(--muted);padding:14px 0}
.rf-sg-chosen{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;margin:4px 0 2px}
.rf-sg-chosen img{width:180px;height:180px;max-width:70%;aspect-ratio:1;height:auto;border-radius:18px;object-fit:cover;margin-bottom:10px;
  box-shadow:0 4px 8px rgba(120,110,95,.2),0 18px 36px rgba(120,110,95,.28)}
.rf-sg-chosen b{font-size:18px;white-space:normal}
.rf-sg-chosen span{font-size:14px;color:var(--muted)}
.rf-sg-link{display:block;margin:16px auto 0;border:0;background:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:700;
  color:var(--muted);text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(143,136,126,.4)}`);

if (rev) {
  for (const [a, b] of pairs.slice().reverse()) { if (s.split(b).length !== 2) throw new Error('reverse: not once: ' + b.slice(0, 80)); s = s.replace(b, () => a); }
} else {
  for (const [a, b] of pairs) { if (s.split(a).length !== 2) throw new Error('not once: ' + a.slice(0, 80)); s = s.replace(a, () => b); }
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied', pairs.length, F);
