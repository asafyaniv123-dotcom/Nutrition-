/* Day one felt empty (Asaf, 23 Oct): a big well, a gap, words at the bottom.
 * It now shows what was just saved - her first page, in the same shape as
 * the example page on "why": the date, how the day felt, the best moment.
 * The promise made on "why" is kept on screen. The well is smaller and
 * higher, so the page fits on a short phone too. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const EOL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.replace(/\n/g, EOL); b = b.replace(/\n/g, EOL);
  if (s.split(a).length !== 2) { console.log('ANCHOR x' + (s.split(a).length - 1) + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };
rep(`      '<div class="dr-sub2">'+_t('רואה את האור? כך מתמלא סיום היום, בכל ערב שתסכם.')+'</div></div>'+
      '<button class="dr-btn" onclick="doorDay1Go(this)">'+_t('המשך')+'</button>';`,
`      doorDay1Page()+
      '<div class="dr-sub2">'+_t('רואה את האור? כך מתמלא סיום היום, בכל ערב שתסכם.')+'</div></div>'+
      '<button class="dr-btn" onclick="doorDay1Go(this)">'+_t('המשך')+'</button>';`);
rep(`function doorDay1Go(b){`, `/* her first page, as saved: the same card "why" promised */
function doorDay1Page(){
  var r=rfRec(todayStr())||{},i,mi=-1,h;
  for(i=0;i<RF_MOODS.length;i++)if(RF_MOODS[i].v===r.mood)mi=i;
  h='<div class="dr-page dr-page1"><div class="dr-page-h"><span>'+esc(dfmt(new Date(),{weekday:'long',day:'numeric',month:'long'}))+'</span>'+
    '<span class="dr-page-s">&#10003; '+_t('סיכום יום')+'</span></div>';
  if(mi>=0)h+='<div class="dr-page-r"><span class="dr-page-f">'+rfFace(mi,RF_MOODS[mi].c,true)+'</span><b>'+esc(RF_MOODS[mi].l)+'</b></div>';
  if(r.moment)h+='<div class="dr-page-k">'+_t('הרגע הכי טוב')+'</div><div class="dr-page-v">'+esc(r.moment)+'</div>';
  return h+'</div>';
}
function doorDay1Go(b){`);
rep(`.dr2.at-day1 .dr-end{padding-top:250px}`,
`.dr2.at-day1 .dr-end{padding-top:190px;justify-content:flex-start}
.dr-page1{margin:16px auto 6px;animation:drIn .6s cubic-bezier(.2,.9,.3,1) .5s both}
@media (max-height:720px){.dr2.at-day1 .dr-end{padding-top:150px}.dr2.at-day1 .dr-well{transform:translateY(0) scale(1.02)}.dr-page1{margin-top:10px}}`);
rep(`.dr2.at-day1 .dr-well{opacity:1;transform:translateY(64px) scale(1.6);`,
    `.dr2.at-day1 .dr-well{opacity:1;transform:translateY(20px) scale(1.25);`);
rep(`.dr2.at-day1 .dr-beem{left:calc(50% + 40px);top:40px;transform:scale(.48)}`,
    `.dr2.at-day1 .dr-beem{left:calc(50% + 30px);top:22px;transform:scale(.42)}`);
fs.writeFileSync(F, s);
console.log('patched');
