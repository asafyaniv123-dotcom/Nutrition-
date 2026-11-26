/* Every paid call says which build asked (26 Nov, the subscription). The
 * server's Pro gate asks only the iPhone app - the web app has no way to
 * pay - so the call has to carry its platform. Nothing visible changes, and
 * while the server's PAYWALL is off nothing behaves differently either.
 * Pairs are [anchor, replacement], each applied exactly once.
 *   node tools/patches/pro-platform.mjs [file]            apply
 *   node tools/patches/pro-platform.mjs [file] --reverse  undo */
import fs from 'fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  [
    `function meterQ(){return '?u='+installId()+(window.__DEV__?'&d=1':'');}`,
    `function meterQ(){return '?u='+installId()+(window.__DEV__?'&d=1':'')+'&p='+encodeURIComponent(appPlatform());}`,
  ],
];

let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 120)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
