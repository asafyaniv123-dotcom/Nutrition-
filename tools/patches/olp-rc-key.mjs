// RevenueCat's public iOS SDK key into the app (27 Nov). Public by design: it can
// only read offerings and buy for the install that holds it, and ships inside every
// iOS app that uses RevenueCat. The secret key never enters this repo.
// Usage: node tools/patches/olp-rc-key.mjs <appl_key> [--reverse]
import fs from 'fs';
const F = 'dev/index.html';
const key = process.argv[2] || '';
const rev = process.argv.includes('--reverse');
if (!/^appl_[A-Za-z0-9]+$/.test(key)) { console.error('need the appl_ key as the first argument'); process.exit(1); }
const A = "var OLP_RC_KEY='';   /* RevenueCat's public iOS key, appl_… - not a secret */";
const B = "var OLP_RC_KEY='" + key + "';   /* RevenueCat's public iOS key, appl_… - not a secret */";
const [from, to] = rev ? [B, A] : [A, B];
let s = fs.readFileSync(F, 'utf8');
const n = s.split(from).length - 1;
if (n !== 1) { console.error('expected 1 match, found ' + n); process.exit(1); }
fs.writeFileSync(F, s.replace(from, to));
console.log(rev ? 'reversed' : 'applied');
