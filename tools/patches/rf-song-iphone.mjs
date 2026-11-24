// The song search failed on Asaf's iPhone ("החיפוש לא זמין כרגע", 24 Nov). Measured, not guessed: Apple answers an
// iPhone that asks with media=music with a 301 to musics:// - the Music app - instead of the results, and fetch
// cannot follow that. The same search without media=music answers 200 with the songs, for Safari and for the app's
// WebView alike; entity=song already narrows it to songs. Desktop Chrome never saw the redirect, which is why every
// test passed.
// usage: node tools/patches/rf-song-iphone.mjs [file] [--reverse]
import fs from 'node:fs';
const F = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const rev = process.argv.includes('--reverse');
const pairs = [[
  `    fetch('https://itunes.apple.com/search?media=music&entity=song&limit=6&country='`,
  `    /* no media=music: with it, Apple sends an iPhone to musics:// instead of answering */
    fetch('https://itunes.apple.com/search?entity=song&limit=6&country='`]];
if (rev) {
  for (const [a, b] of pairs.slice().reverse()) { if (s.split(b).length !== 2) throw new Error('reverse: not once: ' + b.slice(0, 80)); s = s.replace(b, () => a); }
} else {
  for (const [a, b] of pairs) { if (s.split(a).length !== 2) throw new Error('not once: ' + a.slice(0, 80)); s = s.replace(a, () => b); }
}
fs.writeFileSync(F, s);
console.log(rev ? 'reversed' : 'applied', pairs.length, F);
