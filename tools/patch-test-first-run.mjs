/* The walk learns the four things found on the phone on 21 Oct: the light
 * rises rather than jumps, the beads come, Beem smiles before day one leaves,
 * and a thumb on the dial during the tour turns the dial, not the page. */
import fs from 'fs';
const F = 'tools/test-first-run.mjs';
let s = fs.readFileSync(F, 'utf8'); const CR = s.includes('\r\n'); if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR: ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`  await tap('#door .dr-btn'); await sleep(1700); await shot('day1');
  await tap('#door .dr-btn'); await sleep(1500); await shot('remind');`,
`  await tap('#door .dr-btn'); await sleep(1200);
  const f1 = await ev(\`+getComputedStyle(document.querySelector('.dr-well')).getPropertyValue('--drf')\`);
  await shot('day1-rising'); await sleep(2000);
  const f2 = await ev(\`+getComputedStyle(document.querySelector('.dr-well')).getPropertyValue('--drf')\`);
  ok(f1 > 0.6 && f1 < 1 && f2 > f1, 'the light rises instead of jumping (' + f1.toFixed(2) + ' then ' + f2.toFixed(2) + ')');
  ok(await waitFor(\`document.querySelectorAll('.dr-bead').length>10\`, 1500), "Beem's beads burst when day one is saved");
  await shot('day1-beads'); await sleep(1800); await shot('day1');
  await tap('#door .dr-btn');
  ok(await ev(\`!!document.querySelector('#door .dr-btn[disabled]')&&!!document.querySelector('.at-day1')\`), 'day one stays a moment for Beem to smile');
  await sleep(1900); await shot('remind');`);
rep(`  await sleep(1200); await shot('tour-1');`,
`  await sleep(1200); await shot('tour-1');
  /* a real thumb on the dial's ring, an arc across its top */
  const g = await ev(\`(function(){var b=document.querySelector('.hdial').getBoundingClientRect();return {cx:b.left+b.width/2,cy:b.top+b.height/2,r:b.width/2-30,rot:_dialRot,y:scrollY};})()\`);
  const pts = [-60, -40, -20, 0, 20].map((a) => ({ x: g.cx + g.r * Math.sin(a * Math.PI / 180), y: g.cy - g.r * Math.cos(a * Math.PI / 180) }));
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pts[0]] });
  for (const p of pts.slice(1)) { await sleep(40); await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [p] }); }
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(700);
  const g2 = await ev(\`({rot:_dialRot,y:scrollY,tour:!!document.getElementById('tour'),mod:document.body.className})\`);
  ok(g2.rot !== g.rot && g2.y === g.y && g2.tour && /mod-home/.test(g2.mod), 'during the tour a thumb turns the dial, the page stays put (' + g.rot + ' -> ' + g2.rot + ', scroll ' + g.y + ' -> ' + g2.y + ')');
  await shot('tour-1-turned');`);
fs.writeFileSync(F, CR ? s.replace(/\n/g, '\r\n') : s);
console.log('test extended');
