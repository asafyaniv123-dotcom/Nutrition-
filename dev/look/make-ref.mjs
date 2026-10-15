// Build dev/look/sun-ref.html: the APPROVED character, large and alone, so a
// clean PNG can be taken of it. The drawing code is LIFTED from sun-final.html
// rather than copied by hand - a hand copy is exactly how a character ends up
// with two authors, which the acts check already guards against.
import fs from 'node:fs';

const fin = fs.readFileSync('C:/Projects/Nutrition-/dev/look/sun-final.html', 'utf8');
const script = fin.match(/<script>([\s\S]*?)<\/script>/)[1];
const cut = script.indexOf('function stage(');
if (cut < 0) throw new Error('sun-final.html no longer defines stage() - check the file');
const draw = script.slice(0, cut).trimEnd();

if (!/function sunSVG\(px\)/.test(draw)) throw new Error('sunSVG not in the lifted slice');
if (draw.length < 1500) throw new Error('lifted slice is suspiciously short: ' + draw.length);

const html = `<!doctype html>
<html lang="he" dir="rtl">
<meta charset="utf-8">
<title>השמש — ייחוס</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<!--
  THE REFERENCE IMAGE. The approved character, 900px, alone on a plain ground,
  so a clean picture can be taken of him and handed to an image model as the
  thing to keep.

  THE DRAWING CODE IS LIFTED FROM sun-final.html at build time by
  tools-side make-ref.mjs - everything above function stage(). Nothing here was
  retyped, because a reference image drawn from a HAND COPY of the character is
  worse than no reference at all: it would quietly teach the model a slightly
  different sun, and every option that came back would be wrong in a way nobody
  could name.

  No blink keyframes are defined here on purpose, so the eyes stay open.
-->
<style>
  html,body{margin:0;height:100%;background:#e9e7e3}
  body{display:grid;place-items:center}
  #ref{width:900px;height:900px}
  .sm{display:block;width:100%;height:100%;overflow:visible}
</style>
<div id="ref"></div>
<script>
${draw}
document.getElementById('ref').innerHTML = sunSVG(900);
</script>
</html>
`;

fs.writeFileSync('C:/Projects/Nutrition-/dev/look/sun-ref.html', html);
console.log('wrote dev/look/sun-ref.html');
console.log('lifted ' + draw.length + ' chars of drawing code from sun-final.html');
console.log('RR  = ' + (draw.match(/RR = \[([^\]]+)\]/)||[])[1]);
console.log('R   = ' + (draw.match(/R = ([\d.]+)/)||[])[1]);
console.log('dots at >=48px: ' + (/n = big \? 26 : 14/.test(draw) ? '26, width 2.6' : 'CHANGED'));
