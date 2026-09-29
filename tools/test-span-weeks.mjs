// DOES A RUN THAT CROSSES A SATURDAY ACTUALLY APPEAR ON THE MONTH?
//
// A task lives in ONE week's record, and the month asks day by day what to
// draw. For a run that stays inside its week that question only ever needed
// that week's record; for a run of nine days starting on a Thursday, three of
// the days it covers are asked of a record it is not in. If nothing looks
// back, those days come back empty and the run silently stops at Saturday -
// which is what the app did, deliberately, until the cap was lifted.
//
//   node tools/test-span-weeks.mjs [file]
//
// Run it against a revision from before the change and it fails; that is the
// point of it. A detector that has never caught anything has not been tested.
import { reader } from './lift.mjs';

const FILE = process.argv[2] || 'dev/index.html';
const { lift, liftVar } = reader(FILE);

const FNS = ['moWeekTasksOn', 'wkCoversDay', 'wkLenOf', 'wkDayIndex', 'weekSunday',
             'wkDateOf', 'wkStamp', 'dayStr', 'loadWeek', 'wkKey'];
const VARS = ['WK_MAX_LEN'];
let vars = VARS.map(liftVar).join('\n');
/* only the new build has it; older ones are being tested for the failure */
try { vars += '\n' + liftVar('MO_SPAN_BACK'); } catch (e) { vars += '\nvar MO_SPAN_BACK=0;'; }

const store = {};
const api = new Function('store', `
  var localStorage = {
    _d: store,
    get length(){ return Object.keys(this._d).length; },
    key: function(i){ return Object.keys(this._d)[i]; },
    getItem: function(k){ return Object.prototype.hasOwnProperty.call(this._d,k)?this._d[k]:null; },
    setItem: function(k,v){ this._d[k]=String(v); }
  };
  function planPush(){}
  ${vars}
  ${FNS.map(lift).join('\n')}
  return { moWeekTasksOn:moWeekTasksOn, weekSunday:weekSunday, wkKey:wkKey,
           wkLenOf:wkLenOf, wkCoversDay:wkCoversDay };
`)(store);

/* ── the fixture ──
   September 2026. The 17th is a Thursday, so a nine-day run from it covers
   17-25 and crosses TWO Saturdays. It lives in the record for the week of the
   13th and nothing else. */
const START = '2026-09-17', LEN = 9;
const SUN = api.weekSunday(new Date(START + 'T12:00:00'));
store[api.wkKey(SUN)] = JSON.stringify({ tasks: [
  { id: 'v1', w: 'חופשה', d: START, s: '', c: 'ter', len: LEN },
  { id: 'v2', w: 'יום אחד', d: '2026-09-14', s: '', c: 'lav' },
] });

const days = [];
for (let i = 1; i <= 30; i++) days.push('2026-09-' + (i < 10 ? '0' : '') + i);

const cache = {};
const covered = days.filter(d => api.moWeekTasksOn(d, cache).some(t => t.id === 'v1'));
const single  = days.filter(d => api.moWeekTasksOn(d, cache).some(t => t.id === 'v2'));

const want = [];
for (let i = 0; i < LEN; i++) {
  const d = new Date(START + 'T12:00:00'); d.setDate(d.getDate() + i);
  want.push(d.toISOString().slice(0, 10));
}

let fail = 0;
const say = (ok, line) => { if (!ok) fail++; console.log((ok ? '  ok   ' : '  FAIL ') + line); };

console.log('a ' + LEN + '-day run from ' + START + ' (a Thursday), read from ' + FILE + '\n');
say(api.wkLenOf({ len: LEN }) === LEN,
    'wkLenOf keeps ' + LEN + ' days (answered ' + api.wkLenOf({ len: LEN }) + ')');
say(covered.length === LEN, 'the month finds it on ' + covered.length + ' days, wanted ' + LEN);
say(JSON.stringify(covered) === JSON.stringify(want),
    'and on exactly ' + want[0].slice(-2) + '..' + want[want.length - 1].slice(-2) +
    (covered.length ? '  (got ' + covered.map(d => d.slice(-2)).join(',') + ')' : ''));
/* the two Saturdays it must survive */
for (const sat of ['2026-09-19', '2026-09-26']) {
  const inRun = want.includes(sat);
  say(covered.includes(sat) === inRun,
      'Saturday ' + sat.slice(-2) + ': ' + (covered.includes(sat) ? 'covered' : 'not covered') +
      (inRun ? ' (it is inside the run)' : ' (it is past the end)'));
}
say(covered.includes('2026-09-20') && covered.includes('2026-09-21'),
    'the days AFTER the first Saturday are covered - this is the whole question');
/* and nothing bled */
say(single.length === 1 && single[0] === '2026-09-14',
    'a one-day task is still one day (' + single.length + ' day' + (single.length === 1 ? '' : 's') + ')');
say(!covered.includes('2026-09-16') && !covered.includes('2026-09-26'),
    'nothing outside the run was picked up by looking back');

console.log('\n' + (fail ? fail + ' assertion(s) failed' : 'a run crosses a Saturday and stops where it should'));
process.exit(fail ? 1 : 0);
