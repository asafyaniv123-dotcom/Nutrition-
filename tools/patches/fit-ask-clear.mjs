/* Asaf on the phone, 27 Nov, three things:
 *  1. "כמה מהם בשבוע?" with one possible answer (1) felt strange - and was. It counted out of
 *     the total he had given weeks ago, which the setup then did not ask again.
 *  2. "It never asked how many times I want to train, so how does it give me a week?" - the
 *     total was an old answer, never shown.
 *  3. The plan was written small: 10-11px grey labels for the days and the exercises.
 * So the other training is asked FIRST (which, how many times a week, 1-5), and then strength is
 * asked on its own - "and how many strength workouts a week?" - every time the other training is
 * asked, even when an old total exists. Nobody subtracts anything: the total is the sum. The plan's
 * days and exercises are a readable list, and the week's labels are 12px. And fitWkPx split on the
 * letter s - its backslash had been eaten by a shell - so a Latin label was measured in pieces.
 * Run: node tools/patches/fit-ask-clear.mjs [file] [--reverse]
 */
import fs from 'node:fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  // the order: other training first, then strength on its own, always asked with it
  [String.raw`    if(!(+o.days>0))out.push('days');if(!o.otherDone)out.push('other','otherN');if(!(+o.minutes>0))out.push('minutes');`,
   String.raw`    if(!o.otherDone)out.push('other','otherN','days');else if(!(+o.days>0))out.push('days');if(!(+o.minutes>0))out.push('minutes');`],
  [String.raw`if(k==='otherN')return !t.other.length||t.other.indexOf('none')>=0||t.days<2;`,
   String.raw`if(k==='otherN')return !t.other.length||t.other.indexOf('none')>=0;`],
  [String.raw`if(k==='days')return t.days>0;`,
   String.raw`if(k==='days')return t.days>asetOthN();`],
  [String.raw`if(k==='otherN')return t.otherN>0&&t.otherN<t.days;`,
   String.raw`if(k==='otherN')return t.otherN>0;`],
  [String.raw`  if(k==='days'){q=fitMeQuestion('days');why=fitMeWhy('days');body='<div class="as-grid">';for(i=0;i<GENPROG_DAYS.length;i++)body+=asetChoice('days',GENPROG_DAYS[i],nfmt(GENPROG_DAYS[i]));body+='</div>';}`,
   String.raw`  /* with other training, strength is its own number: the button says 3, the total stored is 3 + Pilates */
  if(k==='days'&&asetOthN()){var _on=asetOthN();q=_t('וכמה אימוני כוח בשבוע?');why=fitMeWhy('days');body='<div class="as-grid">';
    for(i=1;i<=Math.min(6,7-_on);i++)body+=asetChoice('days',i+_on,nfmt(i));body+='</div>';}
  else if(k==='days'){q=fitMeQuestion('days');why=fitMeWhy('days');body='<div class="as-grid">';for(i=0;i<GENPROG_DAYS.length;i++)body+=asetChoice('days',GENPROG_DAYS[i],nfmt(GENPROG_DAYS[i]));body+='</div>';}`],
  [String.raw`  if(k==='otherN'){q=_t('כמה מהם בשבוע?');why=_t('השאר יהיו אימוני כוח.');
    body='<div class="as-grid">';for(i=1;i<t.days;i++)body+=asetChoice('otherN',i,nfmt(i));body+='</div>';}`,
   String.raw`  if(k==='otherN'){q=_t('כמה מהם בשבוע?');why=_t('השאלה הבאה: כמה אימוני כוח.');
    body='<div class="as-grid">';for(i=1;i<=5;i++)body+=asetChoice('otherN',i,nfmt(i));body+='</div>';}`],
  [String.raw`function asetSkip(k){`,
   String.raw`/* how many of the week the other training takes, once it has been answered */
function asetOthN(){var t=_aset&&_aset.t;return t&&t.other&&t.other.length&&t.other.indexOf('none')<0?(+t.otherN||0):0;}
function asetSkip(k){`],
  // the week's labels, readable
  [String.raw`  var w=0;String(label).split(/s+/).forEach(function(x){w=Math.max(w,homeTextW(x,10,700));});
  return w>40?Math.max(8,Math.floor(400/w*10)/10):10;`,
   String.raw`  var w=0;String(label).split(/\s+/).forEach(function(x){w=Math.max(w,homeTextW(x,12,700));});
  return w>40?Math.max(9,Math.floor(480/w*10)/10):12;`],
  [String.raw`.fwk-d b{font-size:12px;font-weight:800;color:var(--nu-muted,#6d675e)}
.fwk-d span{font-size:10px;`,
   String.raw`.fwk-d b{font-size:13px;font-weight:800;color:var(--nu-muted,#6d675e)}
.fwk-d span{font-size:12px;`],
  // the plan: a day's name, its exercises, each on its own readable line
  [String.raw`    h+='<div class="gn-c"><div class="gn-h">'+esc(progDayLabel(order[i]))+
       ' \u00b7 '+_t('{n} סטים',{n:dsets})+'</div>';
    for(j=0;j<day.length;j++)
      h+='<div class="gn-s">'+esc(exLabel(day[j].name))+' \u00b7 '+
         _t('{n} סטים',{n:day[j].sets})+'</div>';`,
   String.raw`    h+='<div class="gn-c"><div class="fw-dh"><b>'+esc(progDayLabel(order[i]))+'</b><span>'+_t('{n} סטים',{n:dsets})+'</span></div>';
    for(j=0;j<day.length;j++)
      h+='<div class="fw-ex"><b>'+esc(exLabel(day[j].name))+'</b><span>'+_t('{n} סטים',{n:day[j].sets})+'</span></div>';`],
  [String.raw`    h+='<div class="gn-c"><div class="gn-h">'+esc(progDayLabel(d)||progLabel(prog.name))+'</div>';
    if(when[d])h+='<div class="gn-s">'+`,
   String.raw`    h+='<div class="gn-c"><div class="fw-dh"><b>'+esc(progDayLabel(d)||progLabel(prog.name))+'</b></div>';
    if(when[d])h+='<div class="fw-when">'+`],
  [String.raw`      h+='<div class="gn-s">'+esc(exLabel(by[d][j].name))+' \u00b7 '+_t('{n} סטים',{n:by[d][j].sets})+' &times; '+_t('{n} חזר',{n:by[d][j].targetReps})+'</div>';`,
   String.raw`      h+='<div class="fw-ex"><b>'+esc(exLabel(by[d][j].name))+'</b><span>'+_t('{n} סטים',{n:by[d][j].sets})+' &times; '+_t('{n} חזר',{n:by[d][j].targetReps})+'</span></div>';`],
  [String.raw`.fwk-h{font-size:12.5px;margin-top:6px}`,
   String.raw`.fwk-h{font-size:12.5px;margin-top:6px}
.fw-dh{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:6px}
.fw-dh b{font-size:17px;font-weight:800;color:var(--nu-ink,#4a453f);min-width:0}
.fw-dh span{font-size:13px;font-weight:700;color:var(--nu-muted,#6d675e);flex:none}
.fw-when{font-size:13px;color:var(--nu-muted,#6d675e);margin:-2px 0 6px}
.fw-ex{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:7px 0}
.fw-ex b{font-size:15px;font-weight:600;color:var(--nu-ink,#4a453f);min-width:0}
.fw-ex span{font-size:13px;color:var(--nu-muted,#6d675e);flex:none}`],
];

let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 200)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
