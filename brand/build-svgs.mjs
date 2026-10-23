// node brand/build-svgs.mjs - writes the SVGs. The PNGs are renders of them at exact sizes (done in a browser).
// The Better Me brand files, from the line Asaf chose on 23.10:
//   n=9 c=19.5 d=5.6 r=33 rot=0.5 col=#ff7a1a
// The mark is pure geometry, so it is written as SVG; every PNG is a render of
// that SVG at its exact size, and the wordmark lockups are renders of Fraunces 700.
import fs from 'node:fs';
const OUT = 'C:/Projects/Nutrition-/brand/';
fs.mkdirSync(OUT, {recursive: true});
const OR = '#ff7a1a', CREAM = '#fbf6ee', INK = '#2e2925', NIGHT = '#221f1c';
const P = {n: 9, c: 19.5, d: 5.6, r: 33, rot: 0.5};
function sunShapes(fg, scale = 1, cx = 50, cy = 50){
  let s = `<circle cx="${cx}" cy="${cy}" r="${(P.c*scale).toFixed(3)}" fill="${fg}"/>`;
  for (let i = 0; i < P.n; i++){
    const a = (i + P.rot)/P.n*Math.PI*2 - Math.PI/2;
    s += `<circle cx="${(cx + Math.cos(a)*P.r*scale).toFixed(3)}" cy="${(cy + Math.sin(a)*P.r*scale).toFixed(3)}" r="${(P.d*scale).toFixed(3)}" fill="${fg}"/>`;
  }
  return s;
}
const svg = (inner, w = 100, h = 100) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`;
// the mark alone, tight to its own bounds (r + d = 38.6, so a 78-unit box around the centre)
const tight = (fg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="11 11 78 78">${sunShapes(fg)}</svg>`;
fs.writeFileSync(OUT + 'sun.svg', tight(OR));
fs.writeFileSync(OUT + 'sun-cream.svg', tight(CREAM));
fs.writeFileSync(OUT + 'sun-ink.svg', tight(INK));
// the icons: the sun fills about 77% of the square, inside every platform's mask
fs.writeFileSync(OUT + 'icon-orange.svg', svg(`<rect width="100" height="100" fill="${OR}"/>${sunShapes(CREAM)}`));
fs.writeFileSync(OUT + 'icon-cream.svg', svg(`<rect width="100" height="100" fill="${CREAM}"/>${sunShapes(OR)}`));
// Android's adaptive icon: 108 units, the inner 72 always visible, the inner 66 safe - so the sun is scaled into it
fs.writeFileSync(OUT + 'android-foreground.svg', svg(sunShapes(CREAM, 0.82, 54, 54), 108, 108));
fs.writeFileSync(OUT + 'android-background.svg', svg(`<rect width="108" height="108" fill="${OR}"/>`, 108, 108));
// maskable PWA icon: the safe circle is 80% of the square
fs.writeFileSync(OUT + 'icon-maskable.svg', svg(`<rect width="100" height="100" fill="${OR}"/>${sunShapes(CREAM, 0.86)}`));
fs.writeFileSync(OUT + 'favicon.svg', svg(`<rect width="100" height="100" rx="22" fill="${OR}"/>${sunShapes(CREAM)}`));
console.log('svgs written');
