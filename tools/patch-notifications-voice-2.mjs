/* Two findings of the checks on patch-notifications-voice.mjs:
 * - SUMREM_BAN was a top-level object holding _t() calls (inside a function,
 *   but find-frozen-translations rightly asks for no such shape): now made
 *   when asked, by sumRemBan().
 * - the people nudge chose its day from new Date(): now from the app's day
 *   (dayShift), which knows the day ends at 04:00. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };
rep(`  remBanner(SUMREM_BAN);
}`, `  remBanner(sumRemBan());
}`);
rep(`var SUMREM_BAN={f:function(){return {t:sumRemTitle(),b:sumRemMsg(),btn:_t('לסכם עכשיו')};},
  go:function(){enterModule('endofday');window.scrollTo(0,0);}};`,
`function sumRemBan(){
  return {f:function(){return {t:sumRemTitle(),b:sumRemMsg(),btn:_t('לסכם עכשיו')};},
    go:function(){enterModule('endofday');window.scrollTo(0,0);}};
}`);
rep(`    at=new Date();at.setHours(18,0,0,0);if(at.getTime()<=now+30000)at.setDate(at.getDate()+1);`,
  `    at=new Date(dayShift(0)+'T18:00:00');if(at.getTime()<=now+30000)at=new Date(dayShift(1)+'T18:00:00');`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
