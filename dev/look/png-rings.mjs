// A single horizontal ray passes BETWEEN discrete dots and reports nothing.
// Sample a whole circle at each radius and count what colour it hits.
import { decode } from 'file:///C:/Projects/Nutrition-/dev/look/png-pixel.mjs';

function rings(file, cx, cy, rb, label){
  const im = decode(file);
  console.log('\n' + label + '  centre (' + cx + ',' + cy + ') body radius ' + rb);
  for (let k = 1.05; k <= 1.75; k += 0.05) {
    const r = rb * k;
    let red = 0, orange = 0, yellow = 0, n = 0;
    for (let a = 0; a < 720; a++) {
      const x = Math.round(cx + Math.cos(a * Math.PI / 360) * r);
      const y = Math.round(cy + Math.sin(a * Math.PI / 360) * r);
      if (x < 0 || y < 0 || x >= im.w || y >= im.h) continue;
      const [R, G, B, A] = im.at(x, y);
      if (A < 60 || (R > 238 && G > 238 && B > 232)) continue;
      n++;
      if (G < 120) red++; else if (G < 185) orange++; else yellow++;
    }
    if (n < 12) continue;
    const win = red >= orange && red >= yellow ? 'RED'
              : orange >= yellow ? 'ORANGE' : 'YELLOW';
    console.log('  ' + k.toFixed(2) + ' radii  hits ' + String(n).padStart(4) +
      '   red ' + String(red).padStart(4) + '  orange ' + String(orange).padStart(4) +
      '  yellow ' + String(yellow).padStart(4) + '   -> ' + win);
  }
}
rings('C:/Projects/Nutrition-/dev/look/sun-gen/sun-27-turnaround.png', 1155, 338, 95, 'generated BACK view');
rings('C:/Projects/Nutrition-/dev/look/sun-ref.png', 512, 512, 219, 'our reference');
