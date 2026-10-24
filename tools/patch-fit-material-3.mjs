/* The progress chart's start and now figures were violet and terracotta paint
 * on text. Ink; the change between them keeps its green or terracotta,
 * because which way it went is what that colour says. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`<div style="font-size:18px;font-weight:800;color:var(--violet-700)">'+fmtWeight(pts[0].weight)`, `<div style="font-size:18px;font-weight:800;color:var(--nu-ink,var(--ink))">'+fmtWeight(pts[0].weight)`);
rep(`<div style="font-size:18px;font-weight:800;color:var(--terra-700)">'+fmtWeight(pts[pts.length-1].weight)`, `<div style="font-size:18px;font-weight:800;color:var(--nu-ink,var(--ink))">'+fmtWeight(pts[pts.length-1].weight)`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
