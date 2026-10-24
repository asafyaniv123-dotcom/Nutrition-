/* The workout screen's "stopwatch" still opened the old floating clock, which
 * says "stopwatch / countdown" and has none of the new screen. It opens the
 * new clock now, and the clock's back pill returns to wherever it was opened
 * from - the workout, or the timers screen. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b, n0) => { const n = s.split(a).length - 1; if (n !== (n0 || 1)) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.split(a).join(b); };
rep(`function ckOpen(tab){_ckTab=tab;_fitView='clock';renderFitness();}`,
    `var _ckBack='timer';
function ckOpen(tab){if(_fitView!=='clock')_ckBack=_fitView||'timer';_ckTab=tab;_fitView='clock';renderFitness();}`);
rep(`  h+='<button class="fit-back" style="margin-bottom:14px" onclick="_fitView=\\'timer\\';renderFitness()">&#8249; '+_t('חזרה')+'</button>';`,
    `  h+='<button class="fit-back" style="margin-bottom:14px" onclick="_fitView=_ckBack||\\'timer\\';renderFitness()">&#8249; '+_t('חזרה')+'</button>';`);
rep(`  h+='<button class="wx-b" onclick="wtToggle()"><i class="wx-i">&#9201;</i>'+_t('סטופר')+'</button>';`,
    `  h+='<button class="wx-b" onclick="ckOpen(\\'sw\\')"><i class="wx-i">&#9201;</i>'+_t('סטופר')+'</button>';`);
rep(`  h+='<button class="fw-rb go" onclick="wtToggle()">'+_t('סטופר')+'</button>';`,
    `  h+='<button class="fw-rb go" onclick="ckOpen(\\'sw\\')">'+_t('סטופר')+'</button>';`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
