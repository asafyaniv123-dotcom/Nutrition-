/* The walk learns the language screen (23 Oct): it comes first, shows the
 * eleven languages with the device's chosen, and a tap re-words it. And a
 * --form x walk picks "אחר" and reads the plural back. */
import fs from 'fs';
const F = 'tools/test-first-run.mjs';
let s = fs.readFileSync(F, 'utf8'); const CR = s.includes('\r\n'); if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR: ' + a.slice(0, 70)); process.exit(1); } s = s.replace(a, () => b); };
rep(`const LANG = arg('--lang', 'he'), HOUR = +arg('--hour', 17), H = +arg('--h', 844);`,
    `const LANG = arg('--lang', 'he'), HOUR = +arg('--hour', 17), H = +arg('--h', 844), FORM = arg('--form', 'f');`);
rep(`  ok(await waitFor(\`!!document.querySelector('#door .dr-btn')\`, 12000), 'the door opens on a fresh device');
  await sleep(2600); await shot('welcome');
  ok(await ev(\`!!document.querySelector('#dr-beem canvas')\`), 'Beem is there from the first frame');`,
`  ok(await waitFor(\`!!document.querySelector('#door .dr-btn')\`, 12000), 'the door opens on a fresh device');
  await sleep(2600); await shot('language');
  ok(await ev(\`document.querySelectorAll('.dr-langs .dr-lr').length===11&&document.querySelector('.dr-langs .dr-lr.on').getAttribute('lang')===appLang()\`), 'the language screen comes first: eleven languages, this one chosen');
  ok(await ev(\`!!document.querySelector('#dr-beem canvas')\`), 'Beem is there from the first frame');
  await tap('#door .dr-btn'); await sleep(1500); await shot('welcome');
  ok(await ev(\`!document.querySelector('.dr-lang')\`), 'the welcome no longer carries a language pill - it was just chosen');`);
rep(`  if (LANG === 'he') { await shot('gender'); await tap('.dr-r2', 0); await waitFor(\`/at-areas/.test(document.getElementById('dr2').className)\`, 6000); }`,
`  if (LANG === 'he') { await shot('gender'); await tap('.dr-r2', FORM === 'x' ? 2 : FORM === 'm' ? 1 : 0); await waitFor(\`/at-areas/.test(document.getElementById('dr2').className)\`, 6000); }`);
rep(`  ok(/בחרי|Pick|اختر/.test(await ev(\`document.querySelector('.dr-w2').textContent\`)), 'the areas line speaks in her form');`,
`  const _w2 = await ev(\`document.querySelector('.dr-w2').textContent\`);
  ok(FORM === 'x' ? /בחרו/.test(_w2) : FORM === 'm' ? /בחר /.test(_w2) : /בחרי|Pick|اختر/.test(_w2), 'the areas line speaks in the form chosen (' + _w2.slice(0, 24) + ')');
  ok(Math.abs(await ev(\`(function(){var e=document.querySelector('.dr-q2'),r=e.getBoundingClientRect(),c=document.querySelector('.dr-body').getBoundingClientRect();var g=document.createRange();g.selectNodeContents(e);var t=g.getBoundingClientRect();return Math.round((t.left+t.right)/2-(c.left+c.right)/2);})()\`)) <= 3, 'the question is centred');`);
fs.writeFileSync(F, CR ? s.replace(/\n/g, '\r\n') : s);
console.log('test extended');
