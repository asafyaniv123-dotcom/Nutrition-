// Counts each store field against its limit. Usage: node marketing/store/count.mjs marketing/store/en.md
import fs from 'fs';
const s = fs.readFileSync(process.argv[2], 'utf8');
const re = /\*\*(.+?)\*\* \((\d+)[^)]*\)\n([\s\S]*?)(?=\n\*\*|\n## |$)/g;
let bad = 0;
for (const m of s.matchAll(re)) {
  const text = m[3].trim().replace(/\n(?!\n)/g, ' ');
  const n = [...text].length, lim = +m[2];
  if (n > lim) bad++;
  console.log((n > lim ? 'OVER ' : 'ok   ') + m[1].padEnd(22) + n + ' / ' + lim);
}
process.exit(bad ? 1 : 0);
