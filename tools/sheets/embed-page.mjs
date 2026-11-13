// node tools/sheets/embed-page.mjs <in.html> <out.html> - every src="file.jpg|png|gif|mp4" next to in.html becomes a
// base64 data URI inside the page. Review pages are published this way only (Asaf, 13 Nov: pictures published as
// side files showed as a broken "?" on his phone). Prints each file and the page size; fails on a missing file.
import fs from 'fs'; import path from 'path';
const [inp, out] = process.argv.slice(2);
if (!out) { console.log('usage: embed-page.mjs <in.html> <out.html>'); process.exit(2); }
const dir = path.dirname(inp);
const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.mp4': 'video/mp4' };
let html = fs.readFileSync(inp, 'utf8');
html = html.replace(/src="([^"#:]+\.(jpe?g|png|gif|mp4))"/g, (m, f) => {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) throw new Error('missing ' + f);
  const b = fs.readFileSync(p);
  console.log(f, Math.round(b.length / 1024) + ' KB');
  return `src="data:${types[path.extname(f).toLowerCase()]};base64,${b.toString('base64')}"`;
});
fs.writeFileSync(out, html);
console.log('page', (fs.statSync(out).size / 1048576).toFixed(2) + ' MB ->', out);
